const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  /** @type {{name?: string, plu?: string}} */
  const filter = req.query;
  res.json({
    message: 'Get all products',
    filter,
  });
});

router.post('/', async (req, res) => {
  /** @type {{name: string}} */
  const { body } = req;
  res.json({
    message: 'Create product',
    body,
  });
});

module.exports = router;
