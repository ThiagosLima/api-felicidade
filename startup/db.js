const mongoose = require('mongoose')
const winston = require('winston')
const config = require('config')

module.exports = function () {
  const db = config.get('DB')

  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
    .then(winston.info(`Connected to the ${db}`))
}
