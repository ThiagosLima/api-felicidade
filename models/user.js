const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  events: [
    {
      initialDate: Date,
      finalDate: Date,
      title: String,
      content: String
    }
  ]
});

const User = mongoose.model("User", userSchema);

function validate(user) {
  const schema = {
    name: Joi.string().required(),
    events: Joi.array(),
    event: Joi.object().keys({
      initialDate: Joi.date(),
      finalDate: Joi.date(),
      title: Joi.string(),
      content: Joi.string()
    })
  };

  return Joi.validate(user, schema);
}

exports.userSchema = userSchema;
exports.User = User;
exports.validate = validate;
