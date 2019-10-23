const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", userSchema);

function validate(user) {
  const schema = {
    name: Joi.string().required()
  };

  return Joi.validate(user, schema);
}

exports.userSchema = userSchema;
exports.User = User;
exports.validate = validate;
