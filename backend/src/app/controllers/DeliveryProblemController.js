import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Package from '../models/Package';
import Courier from '../models/Courier';
import CancellationDelivery from '../jobs/CancellationDelivery';
import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async index(req, res) {
    const numberOfResults = 10;

    const { page = 1 } = req.query;

    if (page <= 0) {
      return res
        .status(400)
        .json({ error: 'Somenthing went wrong with your page number...' });
    }

    const numberOfDeliveryProblems = await DeliveryProblem.count();

    if (numberOfDeliveryProblems === 0) {
      return res.status(200).json({ warning: 'No delivery problems so far.' });
    }

    const divisible = numberOfDeliveryProblems % numberOfResults === 0;
    const valueToBeAdded = divisible ? 0 : 1;

    const numberOfPages =
      Math.floor(numberOfDeliveryProblems / numberOfResults) + valueToBeAdded;

    const deliveryProblems = await DeliveryProblem.findAll();
    return res.status(200).json([deliveryProblems, numberOfPages]);
  }

  async show(req, res) {
    const numberOfResults = 10;

    const { page = 1 } = req.query;

    if (page <= 0) {
      return res
        .status(400)
        .json({ error: 'Somenthing went wrong with your page number...' });
    }

    const { package_id } = req.params;
    const schema = Yup.object().shape({
      package_id: Yup.number().required(),
    });

    if (!(await schema.isValid({ package_id }))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const pckgExists = await Package.findByPk(package_id);

    if (!pckgExists) {
      return res.status(400).json({ error: 'Package not found.' });
    }

    const numberOfDeliveryProblems = await DeliveryProblem.count({
      where: { package_id },
    });

    if (numberOfDeliveryProblems === 0) {
      return res.status(200).json({
        information: 'There is no delivery problems to this package.',
      });
    }

    const divisible = numberOfDeliveryProblems % numberOfResults === 0;
    const valueToBeAdded = divisible ? 0 : 1;

    const numberOfPages =
      Math.floor(numberOfDeliveryProblems / numberOfResults) + valueToBeAdded;

    const pckgWithProblem = await DeliveryProblem.findAll({
      where: { package_id },
    });

    if (page > numberOfPages) {
      return res.status(400).json({ error: 'This page does not exists.' });
    }

    return res.status(200).json([pckgWithProblem, numberOfPages]);
  }

  async store(req, res) {
    const { package_id } = req.params;
    const { description } = req.body;
    const schema = Yup.object().shape({
      package_id: Yup.number().required(),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid({ package_id, description }))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const pckgExists = await Package.findByPk(package_id);

    if (!pckgExists) {
      return res.status(400).json({ error: 'Package not found.' });
    }

    const pckgProblem = await DeliveryProblem.create({
      package_id,
      description,
    });

    return res.status(200).json(pckgProblem);
  }

  async destroy(req, res) {
    const { delivery_problem_id } = req.params;
    const schema = Yup.object().shape({
      delivery_problem_id: Yup.number().required(),
    });

    if (!(await schema.isValid({ delivery_problem_id }))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const deliveryProblemExists = await DeliveryProblem.findByPk(
      delivery_problem_id
    );

    if (!deliveryProblemExists) {
      return res
        .status(400)
        .json({ error: 'This problem ID does not exists.' });
    }

    const { package_id } = deliveryProblemExists;

    const pckg = await Package.findByPk(package_id, {
      include: {
        model: Courier,
        as: 'courier',
        attributes: ['name', 'email'],
      },
    });

    if (!pckg) {
      return res.status(400).json({ error: 'Package not found.' });
    }

    if (pckg.end_date && pckg.signature_id) {
      return res
        .status(400)
        .json({ error: 'You can not cancel a package already delivered.' });
    }

    await pckg.update({ canceled_at: new Date(), where: { package_id } });

    await Queue.add(CancellationDelivery.key, { pckg });

    return res.status(200).json({
      Cancellation: `Delivery #${package_id} was canceled`,
    });
  }
}

export default new DeliveryProblemController();
