const Joi = require("@hapi/joi");

const user_sign_up = Joi.object().keys({
  userName: Joi.string().trim().required(),
  Password: Joi.string().min(8).trim().required(),
  MobileNumber: Joi.string().trim().required(),
  Name: Joi.string().trim().required(),
  CarNo: Joi.string().allow("").required(),
  createDate: Joi.date().optional(),
  reservedParking: Joi.boolean().required(),
});

const user_sign_in = Joi.object().keys({
  userName: Joi.string().trim().required(),
  Password: Joi.string().min(8).trim().required(),
});

const parking_book = Joi.object().keys({
  userId: Joi.string().trim().required(),
});

const check_in = Joi.object().keys({
  userId: Joi.string().trim().required(),
});
const check_out = Joi.object().keys({
  userId: Joi.string().trim().required(),
  spotId: Joi.number().required(),
});
module.exports = {
  user_sign_up,
  user_sign_in,
  parking_book,
  check_in,
  check_out
};
