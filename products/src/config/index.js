require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost/em-products',
};
