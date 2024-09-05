// @ts-check

const { where } = require('./utils');

const DEFAULT_LIMIT = 100;

const FILTER_FIELDS = {
  product_id: {
    condition: (idx) => `product_id = $${idx}`,
    value: (value) => value,
  },
  shop_id: {
    condition: (idx) => `shop_id = $${idx}`,
    value: (value) => value,
  },
  date_gte: {
    condition: (idx) => `date >= $${idx}`,
    value: (value) => value,
  },
  date_lte: {
    condition: (idx) => `date <= $${idx}`,
    value: (value) => value,
  },
  action: {
    condition: (idx) => `action = $${idx}`,
    value: (value) => value,
  },
};

const migrate = async (/** @type {import('pg').ClientBase} */ client) => {
  await client.query(`CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          date TIMESTAMP NOT NULL,
          product_id INTEGER NOT NULL,
          action VARCHAR(32) NOT NULL,
          details JSONB NOT NULL,
          shop_id INTEGER
      );`);

  await client.query('CREATE INDEX IF NOT EXISTS events_product_id_idx ON events (product_id);');
  await client.query('CREATE INDEX IF NOT EXISTS events_shop_id_idx ON events (shop_id) WHERE shop_id IS NOT NULL;');
  await client.query('CREATE INDEX IF NOT EXISTS events_date_idx ON events (date);');
  await client.query('CREATE INDEX IF NOT EXISTS events_action_idx ON events (action);');
};

const select = async (
  /** @type {import('pg').ClientBase | import('pg').Pool} */
  client,
  /** @type {{product_id?: string, shop_id?: string, date_gte?: Date, date_lte?: Date, action?: string}} */
  filter,
  /** @type {{page?: number, limit?: number}} */
  pager
) => {
  pager.page = pager.page || 1;
  pager.limit = pager.limit || DEFAULT_LIMIT;

  const { selection, args } = where(FILTER_FIELDS, filter);

  let query = 'SELECT * FROM events';
  if (selection.length) {
    query += ` WHERE ${selection.join(' AND ')}`;
  }

  query += ' ORDER BY date DESC';

  if (pager.page) {
    query += ` LIMIT ${pager.limit} OFFSET ${(pager.page - 1) * pager.limit}`;
  }

  const { rows } = await client.query(query, args);

  return rows;
};

const insert = async (
  /** @type {import('pg').ClientBase | import('pg').Pool} */
  client,
  /** @type {{date: Date, product_id: number, action: string, details: any, shop_id?: number}} */
  event
) => {
  const { rows } = await client.query(
    'INSERT INTO events (date, product_id, action, details, shop_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [
      event.date,
      event.product_id,
      event.action,
      event.details,
      event.shop_id,
    ]
  );

  return rows[0];
};

module.exports = {
  migrate,
  select,
  insert,
};