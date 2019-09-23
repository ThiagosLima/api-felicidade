const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello");
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, console.log(`Listening on port ${PORT}...`));

module.exports = server;
