// import * as Yup from 'yup';
// import User from '../models/User';

class UserController {
  async store(req, res) {
    // const schema = Yup.object().shape({
    //   name: Yup.string()
    //     .required()
    //     .min(10),

    //   email: Yup.string()
    //     .email()
    //     .required(),

    //   password: Yup.string()
    //     .required()
    //     .min(6),
    // });

    // if (!(await schema.isValid(req.body))) {
    //   return res.status(400).json({ error: 'Validation fails.' });
    // }
    // const { email } = req.body;

    // const userExists = await User.findOne({ where: { email } });

    // if (userExists) {
    //   return res
    //     .status(400)
    //     .json({ error: 'User already resgistred into database.' });
    // }

    // const user = await User.create(req.body);

    // return res.json(user);
    console.log(req.userId);
    return res.json({ ok: true });
  }

  async update(req, res) {
    console.log(req.userId);
    return res.json({ ok: true });
  }
}
export default new UserController();
