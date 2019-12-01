const { Habit, validate } = require('../models/habit')
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  const habits = await Habit.find()
  res.send(habits)
})

router.get('/:id', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id)
    if (!habit) {
      return res.status(404).send('The habit with the given ID was not found.')
    }

    res.send(habit)
  } catch (ex) {
    console.log(ex.message)
  }
})

router.post('/', async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const { title, content, category } = req.body
  const habit = new Habit({ title, content, category })

  await habit.save()
  res.send(habit)
})

module.exports = router
