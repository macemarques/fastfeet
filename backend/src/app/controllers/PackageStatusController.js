import * as Yup from 'yup';
import {
  startOfDay,
  endOfDay,
  isAfter,
  isBefore,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  parseISO,
} from 'date-fns';
import { Op } from 'sequelize';
import Package from '../models/Package';
import Courier from '../models/Courier';
import File from '../models/File';
import Recipient from '../models/Recipient';

class PackageStatusController {
  async show(req, res) {
    const numberOfResults = 10;

    const { page = 1 } = req.query;

    if (page <= 0) {
      return res
        .status(400)
        .json({ error: 'Somenthing went wrong with your page number...' });
    }

    const { courier_id } = req.params;

    const schema = Yup.object().shape({
      courier_id: Yup.number().required(),
    });

    if (!(await schema.isValid({ courier_id }))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const courierExists = await Courier.findByPk(courier_id);

    if (!courierExists) {
      return res.status(400).json({ error: 'Courier not found.' });
    }

    const numberOfPackages = await Package.count({
      where: {
        end_date: {
          [Op.ne]: null,
        },
        signature_id: {
          [Op.ne]: null,
        },
      },
    });

    if (numberOfPackages === 0) {
      return res
        .status(200)
        .json({ warning: 'There is no delivered packages into your account.' });
    }

    const divisible = numberOfPackages % numberOfResults === 0;
    const valueToBeAdded = divisible ? 0 : 1;

    const numberOfPages =
      Math.floor(numberOfPackages / numberOfResults) + valueToBeAdded;

    const pckgsDelivered = await Package.findAll({
      where: {
        end_date: {
          [Op.ne]: null,
        },
      },
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['url', 'path', 'name'],
        },
      ],
    });

    return res.json([pckgsDelivered, numberOfPages]);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      canceled_at: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { package_id } = req.params;

    const pckg = await Package.findByPk(package_id, {
      include: [
        {
          model: Courier,
          as: 'courier',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['url', 'name', 'path'],
        },
      ],
    });

    if (!pckg) {
      return res.status(400).json({ error: 'Package not found.' });
    }

    const { start_date, end_date, signature_id } = req.body;

    const currentTime = new Date();

    const initialHour = setMilliseconds(
      setSeconds(setMinutes(setHours(currentTime, 8), 0), 0),
      0
    );

    const limitHour = setMilliseconds(
      setSeconds(setMinutes(setHours(currentTime, 18), 0), 0),
      0
    );

    const tooSoon = isBefore(parseISO(start_date), initialHour);
    const tooLate = isAfter(parseISO(start_date), limitHour);

    if (start_date) {
      if (isBefore(parseISO(start_date), currentTime)) {
        return res.status(400).json({ error: 'Past dates are not allowed.' });
      }

      const checkoutLimit = 5;
      const checkouts = await Package.count({
        where: {
          courier_id: pckg.courier_id,
          start_date: {
            [Op.between]: [startOfDay(currentTime), endOfDay(currentTime)],
          },
        },
        order: ['createdAt'],
      });

      if (checkouts >= checkoutLimit) {
        return res
          .status(400)
          .json({ error: 'You reached the limit checkout per day.' });
      }

      if (tooSoon) {
        return res
          .status(400)
          .json({ error: 'You can only pickup the package after 8am.' });
      }
      if (tooLate) {
        return res
          .status(400)
          .json({ error: 'You can only pickup the package until 6pm.' });
      }

      await pckg.update({ start_date });
      return res.status(200).json(pckg);
    }
    if (end_date && signature_id) {
      if (isBefore(parseISO(end_date), pckg.start_date)) {
        return res.status(400).json({
          error:
            'Something went wrong. Your delivery was before your checkout.',
        });
      }
      await pckg.update({ end_date, signature_id });
      const pckgUpdated = await Package.findByPk(package_id, {
        include: [
          {
            model: File,
            as: 'signature',
            attributes: ['url', 'name', 'path'],
          },
        ],
      });
      return res.status(200).json(pckgUpdated);
    }

    return res
      .status(400)
      .json({ error: 'Missing arguments to update this package.' });
  }
}

export default new PackageStatusController();
