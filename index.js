const winston = require('winston')
const express = require('express')
const app = express()

require('./startup/logging')()
require('./startup/routes')(app)
require('./startup/db')()
require('./startup/config')()
require('./startup/validation')()

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, winston.info(`Listening on port ${PORT}...`))

module.exports = server
