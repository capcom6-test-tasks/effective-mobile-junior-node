const express = require('express');

const products = require('./products');
const stock = require('./stock');

// @ts-ignore
const router = require('express-promise-router')();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/products', products);
router.use('/stock', stock);

module.exports = router;
