import * as Yup from 'yup';
import Package from '../models/Package';
import Queue from '../../lib/Queue';
import Courier from '../models/Courier';
import Recipient from '../models/Recipient';
import NewPackageRegistred from '../jobs/NewPackageRegistred';
import File from '../models/File';

class PackageController {
  async index(req, res) {
    const pckgs = await Package.findAll({
      attributes: ['product', 'start_date', 'end_date', 'canceled_at'],
      include: [
        {
          model: Courier,
          as: 'courier',
          attributes: ['name', 'email'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['url', 'path', 'name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'zipcode',
            'state',
            'city',
            'street',
            'number',
            'addicionalAddressInfo',
          ],
        },
      ],
    });
    return res.status(200).json(pckgs);
  }

  async show(req, res) {
    const { courier_id } = req.params;

    const courierExists = await Courier.findByPk(courier_id);

    if (!courierExists) {
      return res.status(400).json({ error: 'Courier not found.' });
    }

    const pckgsCourrier = await Package.findAll({
      where: { courier_id, end_date: null, canceled_at: null },
    });
    return res.status(200).json(pckgsCourrier);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string()
        .min(5)
        .required(),
      recipient_id: Yup.number().required(),
      courier_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { product, recipient_id, courier_id } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);
    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    const courierExists = await Courier.findByPk(courier_id);
    if (!courierExists) {
      return res.status(400).json({ error: 'Courier not found.' });
    }

    const { id } = await Package.create({
      product,
      recipient_id,
      courier_id,
    });

    const pckg = await Package.findByPk(id, {
      include: [
        {
          model: Courier,
          as: 'courier',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'zipcode',
            'state',
            'city',
            'street',
            'number',
            'addicionalAddressInfo',
          ],
        },
      ],
      attributes: [
        'id',
        'product',
        'recipient_id',
        'courier_id',
        'start_date',
        'end_date',
        'signature_id',
      ],
    });

    await Queue.add(NewPackageRegistred.key, { pckg });

    return res.status(200).json(pckg);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().min(5),
      recipient_id: Yup.number(),
      courier_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { package_id } = req.params;
    const { recipient_id, courier_id, product } = req.body;

    const pckg = await Package.findByPk(package_id);

    if (!pckg) {
      return res.status(400).json({ error: 'Package not found.' });
    }

    if (recipient_id) {
      const recipientExists = await Recipient.findByPk(recipient_id);
      if (!recipientExists) {
        return res.status(400).json({ error: 'Recipient not found.' });
      }
    }

    if (courier_id) {
      const courierExists = await Courier.findByPk(courier_id);
      if (!courierExists) {
        return res.status(400).json({ error: 'Courier not found.' });
      }
    }

    const { id } = await pckg.update({ product, recipient_id, courier_id });

    const pckgUpdated = await Package.findByPk(id, {
      include: [
        {
          model: Courier,
          as: 'courier',
          attributes: ['name', 'email'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'url', 'path', 'name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'zipcode',
            'state',
            'city',
            'street',
            'number',
            'addicionalAddressInfo',
          ],
        },
      ],
      attributes: [
        'id',
        'product',
        'recipient_id',
        'courier_id',
        'start_date',
        'end_date',
        'signature_id',
      ],
    });

    return res.status(200).json(pckgUpdated);
  }

  async destroy(req, res) {
    const { package_id } = req.params;

    const pckg = await Package.findByPk(package_id);

    if (!pckg) {
      return res.status(400).json({ error: 'Package not found.' });
    }

    await Package.destroy({ where: { id: package_id } });

    return res.status(200).json({ Removed: `Package #${package_id} deleted.` });
  }
}

export default new PackageController();
