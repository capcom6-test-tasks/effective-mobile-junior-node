// @ts-check

// @ts-ignore
const router = require('express-promise-router')();

const products = require('./products');
const stock = require('./stock');

router.use('/products', products);
router.use('/stock', stock);

module.exports = router;
