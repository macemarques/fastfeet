import Mail from '../../lib/Mail';

class NewPackageRegistred {
  get key() {
    return 'NewPackageRegistred';
  }

  async handle({ data }) {
    const { pckg } = data;

    await Mail.sendMail({
      to: `${pckg.courier.name} <${pckg.courier.email}>`,
      subject: 'FastFeet Package registred.',
      template: 'newPackageRegistred',
      context: {
        courierName: pckg.courier.name,
        packageNumber: pckg.id,
        recipientName: pckg.recipient.name,
        recipientZipcode: pckg.recipient.zipcode,
        recipientState: pckg.recipient.state,
        recipientCity: pckg.recipient.city,
        recipientStreet: pckg.recipient.street,
        recipientNumber: pckg.recipient.number,
      },
    });
  }
}

export default new NewPackageRegistred();
