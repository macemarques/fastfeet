import * as Yup from 'yup';
import Package from '../models/Package';

class PackageController {
  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string()
        .min(5)
        .required(),
      recipient_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { product, recipient_id } = req.body;
    const pckg = await Package.create({ product, recipient_id });

    return res.status(200).json(pckg);
  }
}

export default new PackageController();
