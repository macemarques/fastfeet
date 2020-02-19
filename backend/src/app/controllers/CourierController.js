import * as Yup from 'yup';
import { Op } from 'sequelize';
import Courier from '../models/Courier';
import File from '../models/File';

class CourierController {
  async index(req, res) {
    const { courierSearch } = req.query;

    if (courierSearch) {
      const couriers = await Courier.findAll({
        attributes: ['id', 'name', 'email'],
        order: [['name', 'ASC']],
        where: { name: { [Op.iLike]: `%${courierSearch}%` } },
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'name', 'path', 'url'],
          },
        ],
      });

      if (couriers.length === 0) {
        return res.status(400).json({ error: 'Nothing found...' });
      }

      return res.status(200).json(couriers);
    }

    const courierList = await Courier.findAll({
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.status(200).json({ courierList });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .min(10)
        .required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { name, email, avatar_id } = req.body;

    const courierExists = await Courier.findOne({ where: { email } });

    if (courierExists) {
      return res
        .status(400)
        .json({ error: 'This Courier is already registred.' });
    }

    const courier = await Courier.create({ name, email, avatar_id });

    return res.status(200).json(courier);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(10),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { courierId } = req.params;
    const { name, email, avatar_id } = req.body;
    const courier = await Courier.findByPk(courierId);

    if (!courier) {
      return res.status(400).json({ error: 'Courier not found.' });
    }

    if (email !== courier.email) {
      const courierExists = await Courier.findOne({
        where: { email },
      });
      if (courierExists) {
        return res.status(409).json({
          error: 'This courier E-Mail is already registred into database',
        });
      }
    }

    const { id } = await courier.update({
      name,
      email,
      avatar_id,
    });

    return res.status(200).json({ id, name, email, avatar_id });
  }

  async destroy(req, res) {
    const { courierId } = req.params;
    const courier = await Courier.findByPk(courierId);

    if (!courier) {
      return res.status(400).json({ error: 'Courier not found.' });
    }

    await Courier.destroy({ where: { id: courierId } });

    return res.status(200).json({ deleted: courier.name });
  }
}

export default new CourierController();
