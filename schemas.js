const Joi = require("@hapi/joi");

const user_sign_up = Joi.object().keys({
  userName: Joi.string().trim().required(),
  Password: Joi.string().min(8).trim().required(),
  MobileNumber: Joi.string().trim().required(),
  Name: Joi.string().trim().required(),
  CarNo: Joi.string().allow("").required(),
  createDate: Joi.date().optional(),
});

const user_sign_in = Joi.object().keys({
  userName: Joi.string().trim().required(),
  Password: Joi.string().min(8).trim().required(),
});

module.exports = {
  user_sign_up,user_sign_in
};
