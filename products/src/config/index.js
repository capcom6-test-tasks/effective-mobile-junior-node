require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost/em-products',

  brokerUrl: process.env.BROKER_URL || 'redis://localhost:6379/0',
  eventsKey: process.env.EVENTS_KEY || 'products:events',
};
