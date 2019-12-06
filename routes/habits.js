const { Habit, validateHabit } = require('../models/habit')
const validate = require('../middleware/validate')
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  const habits = await Habit.find()
  res.send(habits)
})

router.get('/:id', async (req, res) => {
  const habit = await Habit.findById(req.params.id)
  if (!habit) {
    return res.status(404).send('The habit with the given ID was not found.')
  }

  res.send(habit)
})

router.post('/', validate(validateHabit), async (req, res) => {
  const { title, content, category } = req.body
  const habit = new Habit({ title, content, category })

  await habit.save()
  res.send(habit)
})

module.exports = router
