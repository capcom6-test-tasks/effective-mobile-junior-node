const Publisher = require('./publisher');

class Event {
  constructor(
    date,
    plu,
    action,
    details,
    shop_id,
  ) {
    this.date = date;
    this.product_id = plu;
    this.action = action;
    this.details = details;
    this.shop_id = shop_id;
  }
}

module.exports = {
  Event,
  Publisher,
};
