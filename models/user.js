const config = require('config')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Joi = require('@hapi/joi')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  events: [
    {
      initialDate: Date,
      finalDate: Date,
      title: String,
      content: String
    }
  ],
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  isAdmin: Boolean

});

/*config.get('jwtPrivateKey')*/

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('JWT_PRIVATE_KEY'))
  return token;
}

const User = mongoose.model('User', userSchema)

function validateUser(user) {
  const schema = {

    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    events: Joi.array(),
    event: Joi.object().keys({
      initialDate: Joi.date(),
      finalDate: Joi.date(),
      title: Joi.string(),
      content: Joi.string()
    })

  }


  return Joi.validate(user, schema)
}

exports.User = User
exports.validate = validateUser;