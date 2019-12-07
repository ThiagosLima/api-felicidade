const express = require('express')
const cors = require('cors')
const users = require('../routes/users')
const feed = require('../routes/feed')
const auth = require('../routes/auth')
const habits = require('../routes/habits')
const agenda = require('../routes/agenda')
const error = require('../middleware/error')

module.exports = function (app) {
  app.use(express.json())
  app.use(cors())
  app.use('/api/users', users)
  app.use('/api/feed', feed)
  app.use('/api/auth', auth)
  app.use('/api/habits', habits)
  app.use('/api/agenda', agenda)
  app.use(error)
}
