// @ts-check

const { EventEmitter } = require('events');

const { where } = require('./utils');

const { Event } = require('../events');

const FILTER_FIELDS = {
  id: {
    condition: (idx) => `id = ANY ($${idx})`,
    value: (val) => [val],
  },
  name: {
    condition: (idx) => `name ILIKE $${idx}`,
    value: (val) => `%${val}%`,
  },
};

const INSERT_FIELDS = [
  'name',
];

const events = new EventEmitter();

const migrate = async (/** @type {import('pg').ClientBase} */ client) => {
  await client.query(`CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255)
    );`);
};

/** @returns {Promise<{id: number, name: string}>} */
const insert = async (
  /** @type {import('pg').ClientBase | import('pg').Pool} */ client,
  /** @type {{name: string}} */ item,
) => {
  const fields = [];
  const args = [];

  for (const field of INSERT_FIELDS) {
    if (item[field]) {
      fields.push(field);
      args.push(item[field]);
    }
  }

  if (!fields.length) {
    throw new Error('No fields to insert');
  }

  const query = `INSERT INTO products (${fields.join(',')}) VALUES (${Array(fields.length).fill('$').map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`;
  const { rows } = await client.query(query, args);

  events.emit('create', new Event(new Date(), rows[0].id, 'Product created', rows[0]));

  return rows[0];
};

/** @returns {Promise<{id: number, name: string}[]>} */
const select = async (
  /** @type {import('pg').ClientBase | import('pg').Pool} */ client,
  /** @type {{name?: string, id?: string}|undefined} */ filter = undefined,
) => {
  const { selection, args } = where(FILTER_FIELDS, filter);

  let query = 'SELECT * FROM products';
  if (selection.length) {
    query += ` WHERE ${selection.join(' AND ')}`;
  }

  const res = await client.query(query, args);

  return res.rows;
};

module.exports = {
  migrate,
  insert,
  select,

  events,
};
