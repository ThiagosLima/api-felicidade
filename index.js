const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const cors = require("cors");
const users = require("./routes/users");
const express = require("express");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/users", users);
app.get("/", (req, res) => {
  res.send("Home");
});

// Connect to the database
mongoose
  .connect("mongodb://mongo:27017/felicidade", { useNewUrlParser: true })
  .then("Connected to the database.")
  .catch(error => console.log("Could not connect to the database!", error));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, console.log(`Listening on port ${PORT}...`));

module.exports = server;
