const { EventEmitter } = require('events');

const { where } = require('./utils');

const { Event } = require('../events');

const TYPE = {
  SHELF: 'shelf',
  ORDER: 'order',
};

const FILTER_FIELDS = {
  product_id: {
    condition: (idx) => `product_id IN ($${idx})`,
    value: (value) => value,
  },
  shop_id: {
    condition: (idx) => `shop_id = $${idx}`,
    value: (value) => value,
  },
};

const events = new EventEmitter();

const migrate = async (/** @type {import('pg').ClientBase} */ client) => {
  await client.query(`CREATE TABLE IF NOT EXISTS stock (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id),
          shop_id INTEGER NOT NULL,
          type VARCHAR(8) NOT NULL CHECK (type IN ('shelf', 'order')),
          quantity DECIMAL(10, 3) NOT NULL,

          UNIQUE(product_id, shop_id, type)    
      );`);
  await client.query('CREATE INDEX IF NOT EXISTS stock_quantity_idx ON stock (quantity);');
};

const select = async (
  /** @type {import('pg').ClientBase | import('pg').Pool} */
  client,
  /* eslint-disable-next-line max-len */
  /** @type {{product_id?: string, shop_id?: string, stock?: {shelf?: [number?, number?], order?: [number?, number?]}}} */
  filter,
) => {
  const { selection, args } = where(FILTER_FIELDS, filter);

  if (filter.stock) {
    // в задании явно не указана сочетаемость фильтров
    // тут реализована возможность искать сразу с несколькими фильтрами по остаткам
    // в данном случае применен вариант выборки всех подходящих записей
    // с последующим программным объединением
    // аналогично можно было бы сделать и в рамках БД через JOIN
    // с точки зрения ресурсов это было бы оптимальней

    const orSelection = [];
    Object.values(TYPE).forEach((type) => {
      if (filter.stock[type] === undefined || filter.stock[type] === null) {
        return;
      }

      const [gte, lte] = filter.stock[type];
      const subSelection = [];

      if (gte !== undefined) {
        subSelection.push(`quantity >= $${args.length + 1}`);
        args.push(gte);
      }

      if (lte !== undefined) {
        subSelection.push(`quantity <= $${args.length + 1}`);
        args.push(lte);
      }

      if (subSelection.length === 0) {
        return;
      }

      subSelection.push(`type = $${args.length + 1}`);
      args.push(type);

      orSelection.push(`(${subSelection.join(' AND ')})`);
    });

    if (orSelection.length) {
      selection.push(`(${orSelection.join(' OR ')})`);
    }
  }

  let query = 'SELECT * FROM stock';
  if (selection.length) {
    query += ` WHERE ${selection.join(' AND ')}`;
  }

  const { rows } = await client.query(query, args);

  return rows;

  // const grouped = rows.reduce((acc, row) => {
  //     acc[`${row.product_id}|${row.shop_id}`] = {
  //         ...(acc[`${row.product_id}|${row.shop_id}`] || {}),
  //         [row.type]: row,
  //     };

  //     return acc;
  // }, {});
  // console.log(grouped);

  // return Object.values(grouped)
  //     .filter((row) => Object.keys(row).length == Object.keys(filter.stock || {}).length)
  //     .map((rows) => ({
  //         product_id: rows[0].product_id,
  //         shop_id: rows[0].shop_id,
  //         quantity: rows.reduce((acc, row) => ({ ...acc, [row.type]: row.quantity }), {})
  //     }));
};

const replace = async (
  /** @type {import('pg').ClientBase | import('pg').Pool} */ client,
  /** @type {{product_id: string, shop_id: string, type: string, quantity: number}} */ item,
) => {
  const query = `INSERT INTO stock (product_id, shop_id, type, quantity) VALUES ($1, $2, $3, $4) 
    ON CONFLICT (product_id, shop_id, type) DO UPDATE SET quantity = $4
    RETURNING *`;

  const { rows } = await client.query(
    query,
    [item.product_id, item.shop_id, item.type, item.quantity],
  );

  events.emit('replace', new Event(new Date(), rows[0].product_id, 'Stock replaced', rows[0], rows[0].shop_id));

  return rows[0];
};

/* eslint-disable-next-line max-len */
/** @returns {Promise<{product_id: string, shop_id: string, type: 'order'|'shelf', quantity: number}}>} */
const update = async (
  /** @type {import('pg').ClientBase | import('pg').Pool} */ client,
  /** @type {{product_id: string, shop_id: string, type: string, delta: number}} */ item,
) => {
  const query = `INSERT INTO stock (product_id, shop_id, type, quantity) VALUES ($1, $2, $3, $4) 
    ON CONFLICT (product_id, shop_id, type) DO 
    UPDATE SET quantity = stock.quantity + $4
    RETURNING *`;

  const { rows } = await client.query(
    query,
    [item.product_id, item.shop_id, item.type, item.delta],
  );

  events.emit('update', new Event(new Date(), rows[0].product_id, 'Stock updated', rows[0], rows[0].shop_id));

  return rows[0];
};

module.exports = {
  TYPE,
  migrate,
  select,
  replace,
  update,

  events,
};
