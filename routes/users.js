const { User, validate } = require("../models/user");
const { Agenda } = require("../models/agenda");
const auth = require("../middleware/auth");
const _ = require("lodash");
const express = require("express");
const bcrypt = require("bcrypt");
const config = require("config");

const { google } = require("googleapis");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.send(user);
});

router.get("/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).send("The user with the given ID was not found.");

    res.send(user);
  } catch (ex) {
    console.log(ex.message);
  }
});

router.get("/oauth/google", (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    config.get("clientId"),
    config.get("clientSecret"),
    "http://localhost:3000/api/users/oauth/google/login"
  );

  const url = oauth2Client.generateAuthUrl({
    acces_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/plus.me",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  });

  res.send(url);
});

router.get("/oauth/google/login", (req, res) => {
  const { tokens } = oauth2Client.getToken(req.body.access_token);
  console.log(tokens);
  oauth2Client.setCredentials(tokens);
  console.log(oauth2Client);

  res.send(oauth2Client);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  user.isAdmin = false;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  const agenda = new Agenda({ user: user._id });
  await agenda.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findById(req.params.id);
  console.log(user);
  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  await user.save();
  res.send(user);
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (ex) {
    console.log(ex.message);
  }
});

module.exports = router;
