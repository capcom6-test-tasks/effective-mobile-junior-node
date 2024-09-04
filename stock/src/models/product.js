// @ts-check

const FILTER_FIELDS = {
  id: {
    condition: (idx) => `id = $${idx}`,
    value: (val) => val,
  },
  name: {
    condition: (idx) => `name ILIKE $${idx}`,
    value: (val) => `%${val}%`,
  },
};

const INSERT_FIELDS = [
  'name',
];

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
  const res = await client.query(query, args);

  return res.rows[0];
};

/** @returns {Promise<{id: number, name: string}[]>} */
const select = async (
  /** @type {import('pg').ClientBase | import('pg').Pool} */ client,
  /** @type {{name?: string, id?: string}|undefined} */ filter = undefined,
) => {
  const selection = [];
  const args = [];

  if (filter) {
    for (const [field, { condition, value }] of Object.entries(FILTER_FIELDS)) {
      if (!filter[field]) {
        continue;
      }

      selection.push(condition(args.length + 1));
      args.push(value(filter[field]));
    }
  }

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
};
