require('express-async-errors')
const winston = require('winston')
require('winston-mongodb')
const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)
const mongoose = require('mongoose')
const cors = require('cors')
const express = require('express')

const config = require('config')

const users = require('./routes/users')
const feed = require('./routes/feed')
const auth = require('./routes/auth')
const habits = require('./routes/habits')
const agenda = require('./routes/agenda')
const error = require('./middleware/error')

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Routes
app.use('/api/users', users)
app.use('/api/feed', feed)
app.use('/api/auth', auth)
app.use('/api/habits', habits)
app.use('/api/agenda', agenda)
app.use(error)

// Connect to the database
const db = config.get('DB')

winston.handleExceptions(
  new winston.transports.File({ filename: 'uncaughtExceptions.log' })
)

process.on('unhandleRejection', ex => {
  throw ex
})

winston.add(winston.transports.File, { filename: 'loggile.log' })
winston.add(winston.transports.MongoDB, { db, level: 'info' })

const p = Promise.reject(new Error('Something failed miserable'))
p.then(() => console.log('Done'))

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(console.log(`Connected to the ${db}.`))
  .catch(error => console.log(`Could not connect to the ${db}!`, error))

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, console.log(`Listening on port ${PORT}...`))

module.exports = server
