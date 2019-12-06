const express = require('express')
const { Agenda, validateAgenda } = require('../models/agenda')
const validate = require('../middleware/validate')

const router = express.Router()

router.get('/:id', async (req, res) => {
  const agenda = await Agenda.findById(req.params.id)
  if (!agenda) {
    return res.status(404).send('The agenda with the given ID was not found.')
  }

  res.send(agenda)
})

router.get('/', async (req, res) => {
  const { user } = req.query

  if (user) {
    const agenda = await Agenda.find({ user })
    return res.send(agenda)
  }

  const agenda = await Agenda.find()
  return res.send(agenda)
})

router.post('/', validate(validateAgenda), async (req, res) => {
  const { user } = req.body
  const agenda = new Agenda({ user })

  await agenda.save()
  res.send(agenda)
})

router.put('/:id', validate(validateAgenda), async (req, res) => {
  const agenda = await Agenda.findById(req.params.id)
  const eventId = req.query.eventId

  if (eventId) {
    // The event alread exist
    const index = agenda.events.findIndex(event => event._id === eventId)
    agenda.events[index] = { _id: eventId, ...req.body.event }
  } else {
    // Is a new event
    const events = [...agenda.events, req.body.event]
    agenda.events = events
  }

  await agenda.save()
  res.send(agenda)
})

router.delete('/:id', async (req, res) => {
  const agenda = await Agenda.findById(req.params.id)
  const eventId = req.query.eventId

  if (eventId) {
    const index = agenda.events.findIndex(event => event._id === eventId)
    delete agenda.events[index]
    await agenda.save()
  } else {
    return res.status(404).send('The event with the given ID was not found.')
  }

  res.send(agenda)
})

module.exports = router
