const mongoose = require('mongoose')
const Joi = require('@hapi/joi')

const agendaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  events: [
    {
      initialDate: Date,
      finalDate: Date,
      title: String,
      content: String
    }
  ]
})

const Agenda = mongoose.model('Agenda', agendaSchema)

function validate (agenda) {
  const schema = {
    user: Joi.objectId(),
    event: Joi.object().keys({
      initialDate: Joi.date(),
      finalDate: Joi.date(),
      title: Joi.string().required(),
      content: Joi.string()
    })
  }

  return Joi.validate(agenda, schema)
}

exports.Agenda = Agenda
exports.validate = validate
