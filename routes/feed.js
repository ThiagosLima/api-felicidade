const express = require('express')
const { Feed, validadeFeed } = require('../models/feed')
const { User } = require('../models/user')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const validate = require('../middleware/validate')

const router = express.Router()

router.get('/', async (req, res) => {
  // The first 4 bytes are the timestamp
  const feed = await Feed.find({ isAuthorized: true }).sort('_id')
  res.send(feed)
})

router.get('/:id', async (req, res) => {
  const feed = await Feed.findById(req.params.id)

  if (!feed) {
    return res.status(404).send('The item of the give ID was not found.')
  }
  if (!feed.isAuthorized) return res.status(403).send('Access Denied.')

  res.send(feed)
})

router.post('/', [auth, validate(validadeFeed)], async (req, res) => {
  const user = await User.findById(req.user._id)

  let feed = new Feed({
    title: req.body.title,
    description: req.body.description,
    isAnon: req.body.isAnon,
    author: req.user._id,
    name: user.name,
    isAuthorized: false
  })

  feed = await feed.save()
  res.send(feed)
})

router.put('/:id', [auth, validate(validadeFeed)], async (req, res) => {
  let feed = await Feed.findOne({ _id: req.params.id })

  if (!feed) {
    return res.status(404).send('The item of the given ID was not found.')
  }

  if (feed.author.toString() !== req.user._id.toString()) {
    return res.status(403).send('Access Denied.')
  }

  feed.title = req.body.title
  feed.description = req.body.description
  feed.isAnon = req.body.isAnon

  feed = await feed.save()

  res.send(feed)
})

router.delete('/:id', auth, async (req, res) => {
  let feed = await Feed.findOne({ _id: req.params.id })

  if (!feed) {
    return res.status(404).send('The item of the given ID was not found.')
  }

  if (req.user.isAdmin) {
    feed = await Feed.findByIdAndRemove(req.params.id)
    res.send(feed)
  }

  if (feed.author.toString() !== req.user._id.toString()) {
    return res.status(403).send('Access Denied.')
  }

  feed = await Feed.findByIdAndRemove(req.params.id)
  res.send(feed)
})

router.post('/authorize/:id', auth, admin, async (req, res) => {
  let feed = await Feed.findOne({ _id: req.params.id })

  if (!feed) {
    return res.status(404).send('The item of the given ID was not found.')
  }

  feed.isAuthorized = true

  feed = await feed.save()

  return res.send(feed)
})

module.exports = router
