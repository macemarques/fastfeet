import Mail from '../../lib/Mail';

class CancellationDelivery {
  get key() {
    return 'CancellationDelivery';
  }

  async handle({ data }) {
    const { pckg } = data;

    await Mail.sendMail({
      to: `${pckg.courier.name} <${pckg.courier.email}>`,
      subject: `FastFeet Delivery Canceled #${pckg.id}.`,
      template: 'cancellationDelivery',
      context: {
        courierName: pckg.courier.name,
        packageId: pckg.id,
      },
    });
  }
}

export default new CancellationDelivery();
