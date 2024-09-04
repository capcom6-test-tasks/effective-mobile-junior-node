const pool = require('../db');

const product = require('./product');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await product.migrate(client);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = {
  migrate,
  product,
};
