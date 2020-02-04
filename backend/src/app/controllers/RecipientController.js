import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
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
