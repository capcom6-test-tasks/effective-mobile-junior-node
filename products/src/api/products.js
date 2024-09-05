// @ts-check

// @ts-ignore
const router = require('express-promise-router')();

const pool = require('../db');
const { product: model } = require('../models');

const modelToDto = (/** @type {{id: number, name: string}} */ product) => ({
  plu: product.id,
  name: product.name,
});

router.get('/', async (req, res) => {
  /** @type {{name?: string, plu?: string}} */
  const filter = req.query;

  const products = await model.select(pool, { id: filter.plu, name: filter.name });
  res.json({
    products: products.map(modelToDto),
  });
});

router.post('/', async (req, /** @type {import('express').Response} */ res) => {
  /** @type {{name: string}} */
  const payload = req.body;
  if (!payload.name) {
    return res.status(400).json({
      message: 'Missing name',
    });
  }

  const product = await model.insert(pool, payload);

  return res.json({
    product: modelToDto(product),
  });
});

module.exports = router;
