module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'couriers',
      [
        {
          name: 'Alfredo Toretto',
          email: 'alfredo@fedex.com',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
