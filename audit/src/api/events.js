// @ts-check

// @ts-ignore
const router = require('express-promise-router')();

const pool = require('../db');
const { events: model } = require('../models');
const { PagerSchema } = require('./schemas');
const { HttpError } = require('./errors');

router.get('/', async (/** @type {import('express').Request} */ req, res) => {
  /** @type {{plu?: string, product_id?: string, shop_id?: string, date_gte?: Date, date_lte?: Date, action?: string}} */
  const filter = req.query;
  filter.product_id = filter.plu;

  const { value: pager, error } = PagerSchema.validate(req.query, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.message);
  }

  const events = await model.select(pool, filter, pager);

  res.json({
    events,
  });
});

module.exports = router;
