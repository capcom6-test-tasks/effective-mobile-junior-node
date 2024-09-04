// @ts-check

// @ts-ignore
const router = require("express-promise-router")();

const pool = require('../db');
const { transaction } = require('../db/utils');

const { stock: model } = require('../models');
const { HttpError } = require("./errors");

const validateStock = (/** @type {{ [x: string]: number; }} */ stock) => {
  for (const type of Object.values(model.TYPE)) {
    if (stock[type] === undefined || stock[type] === null) {
      continue;
    }
    if (stock[type] < 0) {
      throw new Error(`Invalid ${type} stock: ${stock[type]}`);
    }
  }
};

router.get('/', async (req, res) => {
  /* eslint-disable max-len */
  /** @type {{plu?: string, shop_id?: string, shelf_gte?: number, shelf_lte?: number, order_gte?: number, order_lte?: number}} */
  const query = req.query;
  const filter = {
    product_id: query.plu,
    shop_id: query.shop_id,
    stock: Object.values(model.TYPE).reduce((acc, type) => {
      if (!(`${type}_gte` in query) && !(`${type}_lte` in query)) {
        return acc;
      }

      return {
        ...acc,
        [type]: [query[`${type}_gte`], query[`${type}_lte`]]
      };
    }, {})
  };

  const stock = await model.select(pool, filter);

  res.json({
    stock
  });
});

router.put('/', async (req, res) => {
  /** @type {{plu: string, shop_id: string, stock: {shelf?: number, order?: number}}} */
  const body = req.body;

  if (!body.plu
    || !body.shop_id
    || !body.stock
    || !('shelf' in body.stock || 'order' in body.stock)
  ) {
    return res.status(400).json({
      message: 'Invalid body',
    });
  }

  try {
    validateStock(body.stock);
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    });
  }

  await transaction(
    pool,
    async (client) => {
      for (const type of Object.values(model.TYPE)) {
        if (body.stock[type] === undefined || body.stock[type] === null) {
          continue;
        }

        await model.replace(client, {
          product_id: body.plu,
          shop_id: body.shop_id,
          type: type,
          quantity: body.stock[type],
        });
      }
    }
  );

  res.status(204).end();
});

const updateHanlder = async (k, req, res, ...args) => {
  /** @type {{plu: string, shop_id: string, delta: {shelf?: number, order?: number}}} */
  const body = req.body;

  if (!body.plu
    || !body.shop_id
    || !body.delta
    || !('shelf' in body.delta || 'order' in body.delta)
  ) {
    throw new HttpError(400, 'Invalid body');
  }

  try {
    validateStock(body.delta);
  } catch (err) {
    throw new HttpError(400, err.message);
  }

  await transaction(
    pool,
    async (client) => {
      for (const type of Object.values(model.TYPE)) {
        if (body.delta[type] === undefined || body.delta[type] === null) {
          continue;
        }

        const { quantity } = await model.update(client, {
          product_id: body.plu,
          shop_id: body.shop_id,
          type: type,
          delta: body.delta[type] * k,
        });
        if (quantity < 0) {
          throw new HttpError(400, `Got negative stock ${quantity} for type ${type}`);
        }
      }
    }
  )

  res.status(204).end();
};

router.patch('/increase', async (...args) => updateHanlder(1, ...args));
router.patch('/decrease', async (...args) => updateHanlder(-1, ...args));

module.exports = router;
