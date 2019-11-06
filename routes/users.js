const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (ex) {
    console.log(ex.message);
  }
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

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = new User({
    name: req.body.name,
    events: []
  });

  user.save();

  res.send(user);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findById(req.params.id);
  console.log(user);
  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  // The event will be updated
  if (req.body.event) {
    const eventId = req.query.eventId;
    if (eventId) {
      // The event alread exist
      const index = user.events.findIndex(e => e._id == eventId);
      user.events[index] = { _id: eventId, ...req.body.event };
    } else {
      // Is a new event
      const events = [...user.events, req.body.event];
      user.events = events;
    }
  }

  await user.save();
  res.send(user);
});

module.exports = router;
