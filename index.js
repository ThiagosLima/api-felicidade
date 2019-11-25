const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");

const config = require("config");

const users = require("./routes/users");
const feed = require("./routes/feed");
const auth = require("./routes/auth");
const habits = require("./routes/habits");
const agenda = require("./routes/agenda");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// Routes
app.use("/api/users", users);
app.use("/api/feed", feed);
app.use("/api/auth", auth);
app.use("/api/habits", habits);
app.use("/api/agenda", agenda);

// Connect to the database
const db = config.get("DB");
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(console.log(`Connected to the ${db}.`))
  .catch(error => console.log(`Could not connect to the ${db}!`, error));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, console.log(`Listening on port ${PORT}...`));

module.exports = server;
