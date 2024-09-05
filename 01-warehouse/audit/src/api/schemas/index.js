// @ts-check

const Joi = require('joi');

const PagerSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
});

module.exports = {
    PagerSchema,
};
