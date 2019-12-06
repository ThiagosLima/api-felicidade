const mongoose = require('mongoose')
const Joi = require('@hapi/joi')

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  }
})

const Habit = mongoose.model('Habit', habitSchema)

function validateHabit (habit) {
  const schema = {
    title: Joi.string().required(),
    content: Joi.string().required(),
    category: Joi.string().required()
  }

  return Joi.validate(habit, schema)
}

exports.Habit = Habit
exports.validateHabit = validateHabit
