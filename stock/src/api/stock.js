const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  /* eslint-disable max-len */
  /** @type {{plu?: string, shop_id?: string, shelf_gt?: number, shelf_lt?: number, order_gt?: number, order_lt?: number}} */
  const filter = req.query;

  res.json({
    message: 'Get all stock',
    filter,
  });
});

router.put('/', async (req, res) => {
  /** @type {{plu: string, shop_id: string, stock: {shelf: number, order: number}}} */
  const { body } = req;
  res.json({
    message: 'Set stock',
    body,
  });
});

const updateHanlder = async (k, req, res) => {
  /** @type {{plu: string, shop_id: string, stock: {shelf_delta: number, order_delta: number}} */
  const { body } = req;
  res.json({
    message: 'Update stock',
    body,
  });
};

router.patch('/increase', async (...args) => updateHanlder(1, ...args));
router.patch('/decrease', async (...args) => updateHanlder(-1, ...args));

module.exports = router;
