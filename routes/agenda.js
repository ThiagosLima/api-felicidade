const { Agenda, validate } = require("../models/agenda");
const express = require("express");
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    let agenda = await Agenda.findById(req.params.id);
    if (!agenda)
      return res
        .status(404)
        .send("The agenda with the given ID was not found.");

    res.send(agenda);
  } catch (error) {
    console.log(error.message);
  }
});

router.get("/", async (req, res) => {
  const agenda = await Agenda.find();
  return res.send(agenda);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { user } = req.body;
  const agenda = new Agenda({ user });

  await agenda.save();
  res.send(agenda);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let agenda = await Agenda.findById(req.params.id);
  const eventId = req.query.eventId;

  if (eventId) {
    // The event alread exist
    const index = agenda.events.findIndex(event => event._id == eventId);
    agenda.events[index] = { _id: eventId, ...req.body.event };
  } else {
    // Is a new event
    const events = [...agenda.events, req.body.event];
    agenda.events = events;
  }

  await agenda.save();
  res.send(agenda);
});

router.delete("/:id", async (req, res) => {
  let agenda = await Agenda.findById(req.params.id);
  const eventId = req.query.eventId;

  if (eventId) {
    const index = agenda.events.findIndex(event => event._id == eventId);
    delete agenda.events[index];
    await agenda.save();
  } else {
    return res.status(404).send("The event with the given ID was not found.");
  }

  res.send(agenda);
});

module.exports = router;
