// @ts-check

const emojis = require('./events');

// @ts-ignore
const router = require('express-promise-router')();

router.use('/events', emojis);

module.exports = router;
