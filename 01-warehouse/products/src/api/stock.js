// @ts-check

// @ts-ignore
const router = require('express-promise-router')();

const pool = require('../db');
const { transaction } = require('../db/utils');

const { stock: model } = require('../models');
const { HttpError } = require('./errors');

const validateStock = (/** @type {{ [x: string]: number; }} */ stock) => {
  Object.values(model.TYPE).forEach((type) => {
    if (stock[type] === undefined || stock[type] === null) {
      return;
    }
    if (stock[type] < 0) {
      throw new Error(`Invalid ${type} stock: ${stock[type]}`);
    }
  });
};

router.get('/', async (req, res) => {
  /* eslint-disable max-len */
  /** @type {{plu?: string, shop_id?: string, shelf_gte?: number, shelf_lte?: number, order_gte?: number, order_lte?: number}} */
  const params = req.query;
  const filter = {
    product_id: params.plu,
    shop_id: params.shop_id,
    stock: Object.values(model.TYPE).reduce((acc, type) => {
      if (!(`${type}_gte` in params) && !(`${type}_lte` in params)) {
        return acc;
      }

      return {
        ...acc,
        [type]: [params[`${type}_gte`], params[`${type}_lte`]],
      };
    }, {}),
  };

  const stock = await model.select(pool, filter);

  res.json({
    stock,
  });
});

router.put('/', async (req, res) => {
  /** @type {{plu: string, shop_id: string, stock: {shelf?: number, order?: number}}} */
  const payload = req.body;

  if (!payload.plu
    || !payload.shop_id
    || !payload.stock
    || !('shelf' in payload.stock || 'order' in payload.stock)
  ) {
    return res.status(400).json({
      message: 'Invalid body',
    });
  }

  try {
    validateStock(payload.stock);
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    });
  }

  await transaction(
    pool,
    async (client) => {
      await Promise.all(
        Object.values(model.TYPE).map(async (type) => {
          if (payload.stock[type] === undefined || payload.stock[type] === null) {
            return Promise.resolve();
          }

          return model.replace(client, {
            product_id: payload.plu,
            shop_id: payload.shop_id,
            type,
            quantity: payload.stock[type],
          });
        }),
      );
    },
  );

  return res.status(204).end();
});

const updateHanlder = async (k, req, res) => {
  /** @type {{plu: string, shop_id: string, delta: {shelf?: number, order?: number}}} */
  const payload = req.body;

  if (!payload.plu
    || !payload.shop_id
    || !payload.delta
    || !Object.values(model.TYPE).some((type) => type in payload.delta)
  ) {
    throw new HttpError(400, 'Invalid body');
  }

  try {
    validateStock(payload.delta);
  } catch (err) {
    throw new HttpError(400, err.message);
  }

  await transaction(
    pool,
    async (client) => {
      await Promise.all(
        Object.values(model.TYPE).map(async (type) => {
          if (payload.delta[type] === undefined || payload.delta[type] === null) {
            return;
          }

          const { quantity } = await model.update(client, {
            product_id: payload.plu,
            shop_id: payload.shop_id,
            type,
            delta: payload.delta[type] * k,
          });
          if (quantity < 0) {
            throw new HttpError(400, `Got negative stock ${quantity} for type ${type}`);
          }
        }),
      );
    },
  );

  res.status(204).end();
};

router.patch('/increase', async (...args) => updateHanlder(1, ...args));
router.patch('/decrease', async (...args) => updateHanlder(-1, ...args));

module.exports = router;
