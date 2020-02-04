import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        zipcode: Sequelize.NUMBER,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        street: Sequelize.STRING,
        number: Sequelize.STRING,
        addicionalAddressInfo: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }
}

export default Recipient;
