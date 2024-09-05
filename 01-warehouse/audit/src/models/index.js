const pool = require('../db');
const { transaction } = require('../db/utils');

const events = require('./events');

const migrate = async () => {
  transaction(
    pool,
    async (client) => {
      await events.migrate(client);
    }
  )
};

module.exports = {
  migrate,
  events,
};
