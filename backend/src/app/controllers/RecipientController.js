import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const numberOfResults = 10;
    const { page = 1 } = req.query;

    if (page <= 0) {
      return res
        .status(400)
        .json({ error: 'Somenthing went wrong with your page number...' });
    }

    const { recipientSearch } = req.query;

    if (recipientSearch) {
      const numberOfRecipients = await Recipient.count({
        where: { name: { [Op.iLike]: `%${recipientSearch}%` } },
      });

      if (numberOfRecipients === 0) {
        return res.status(400).json({ error: 'Nothing found...' });
      }

      const divisible = numberOfRecipients % numberOfResults === 0;
      const valueToBeAdded = divisible ? 0 : 1;

      const numberOfPages =
        Math.floor(numberOfRecipients / numberOfResults) + valueToBeAdded;

      const recipients = await Recipient.findAll({
        order: [['name', 'ASC']],
        limit: numberOfResults,
        offset: (page - 1) * numberOfResults,
        attributes: [
          'id',
          'name',
          'zipcode',
          'state',
          'city',
          'street',
          'number',
          'addicional_address_info',
        ],
        where: { name: { [Op.iLike]: `%${recipientSearch}%` } },
      });

      if (page > numberOfPages) {
        return res.status(400).json({ error: 'This page does not exists.' });
      }

      return res.status(200).json([recipients, numberOfPages]);
    }

    const numberOfRecipients = await Recipient.count();

    if (numberOfRecipients === 0) {
      return res
        .status(200)
        .json({ warning: 'There is no recipient registred into database.' });
    }

    const divisible = numberOfRecipients % numberOfResults === 0;
    const valueToBeAdded = divisible ? 0 : 1;

    const numberOfPages =
      Math.floor(numberOfRecipients / numberOfResults) + valueToBeAdded;

    if (page > numberOfPages) {
      return res.status(400).json({ error: 'This page does not exists.' });
    }

    const recipientList = await Recipient.findAll({
      order: [['name', 'ASC']],
      limit: numberOfResults,
      offset: (page - 1) * numberOfResults,
      attributes: [
        'id',
        'name',
        'zipcode',
        'state',
        'city',
        'street',
        'number',
        'addicional_address_info',
      ],
    });

    return res.status(200).json([recipientList, numberOfPages]);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .min(10)
        .required(),
      zipcode: Yup.number()
        .test(
          'len',
          'Must be exactly 8 characters',
          val => val && val.toString().length === 8
        )
        .required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      addicionalAddressInfo: Yup.string().min(5),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const recipient = await Recipient.create(req.body);

    return res.json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(10),
      zipcode: Yup.number().test(
        'len',
        'Must be exactly 8 characters',
        val => val && val.toString().length === 8
      ),
      state: Yup.string(),
      city: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      addicionalAddressInfo: Yup.string().min(5),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const recipientId = req.params.id;

    const recipient = await Recipient.findByPk(recipientId);
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    const {
      name,
      zipcode,
      state,
      city,
      street,
      number,
      addicionalAddressInfo,
    } = req.body;

    const { id } = await recipient.update({
      name,
      zipcode,
      state,
      city,
      street,
      number,
      addicionalAddressInfo,
    });

    return res.status(200).json({
      id,
      name,
      zipcode,
      state,
      city,
      street,
      number,
      addicionalAddressInfo,
    });
  }
}
export default new RecipientController();
