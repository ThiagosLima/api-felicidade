const _ = require('lodash')
const express = require('express')
const bcrypt = require('bcrypt')
const { User, validateUser } = require('../models/user')
const { Agenda } = require('../models/agenda')
const auth = require('../middleware/auth')
const validate = require('../middleware/validate')

const router = express.Router()

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  res.send(user)
})

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return res.status(404).send('The user with the given ID was not found.')
  }

  res.send(user)
})

router.post('/', validate(validateUser), async (req, res) => {
  let user = await User.findOne({ email: req.body.email })
  if (user) return res.status(400).send('User already registered.')

  user = new User(_.pick(req.body, ['name', 'email', 'password']))
  user.isAdmin = false

  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)

  await user.save()
  const agenda = new Agenda({ user: user._id })
  await agenda.save()

  const token = user.generateAuthToken()
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']))
})

router.put('/:id', validate(validateUser), async (req, res) => {
  const { name, email, password } = req.body
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, password },
    { new: true }
  )

  if (!user) {
    return res.status(404).send('The user with the given ID was not found.')
  }

  res.send(user)
})

router.get('/', async (req, res) => {
  const users = await User.find()
  res.send(users)
})

module.exports = router
