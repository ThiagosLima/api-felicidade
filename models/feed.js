const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)
const mongoose = require('mongoose')
const User = require('../models/user')

const Feed = mongoose.model('Feed', new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
    // maxlength: 255
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isAuthorized: Boolean,
  isAnon: Boolean
}))

function validadeFeed(feed) {
  const schema = {
    // author: Joi.objectId().required(),
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(5).required(),
    isAnon: Joi.boolean().required()
  }

  return Joi.validate(feed, schema)
}

exports.Feed = Feed
exports.validate = validadeFeed