const request = require('supertest')
const mongoose = require('mongoose')
const { Habit } = require('../../../models/habit')

let server

describe('/api/habits', () => {
  let habit

  const exec = () => {
    return request(server)
      .post('/api/habits')
      .send(habit)
  }

  beforeEach(() => {
    server = require('../../../index')
    habit = {
      title: 'a',
      content: 'a',
      category: 'a'
    }
  })

  afterEach(async () => {
    server.close()
    await Habit.deleteMany({})
  })

  describe('GET /', () => {
    it('should return all users', async () => {
      await exec()

      const res = await request(server).get('/api/habits')

      expect(res.status).toBe(200)
      expect(res.body.length).toBe(1)
      expect(res.body.some(habit => habit.title === 'a')).toBeTruthy()
      expect(res.body.some(habit => habit.content === 'a')).toBeTruthy()
    })
  })

  describe('GET /:id', () => {
    it('should return the habit with the given id', async () => {
      let res = await exec()

      res = await request(server).get(`/api/habits/${res.body._id}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('title', habit.title)
      expect(res.body).toHaveProperty('content', habit.content)
      expect(res.body).toHaveProperty('category', habit.category)
    })

    it('should return 404 if no habit with the given id exists', async () => {
      const id = mongoose.Types.ObjectId()

      const res = await request(server).get(`/api/habits/${id}`)

      expect(res.status).toBe(404)
    })
  })

  describe('POST /', () => {
    it('should return 400 if title is empty', async () => {
      habit.title = null

      const res = await exec()

      expect(res.status).toBe(400)
    })

    it('should return 400 if content is empty', async () => {
      habit.content = null

      const res = await exec()

      expect(res.status).toBe(400)
    })

    it('should return 400 if category is empty', async () => {
      habit.category = null

      const res = await exec()

      expect(res.status).toBe(400)
    })

    it('should save the habit if it is valid', async () => {
      await exec()

      const genre = await Habit.find({ title: habit.title })

      expect(genre).not.toBeNull()
    })

    it('should return the habit if it is valid', async () => {
      const res = await exec()

      expect(res.body).toHaveProperty('_id')
      expect(res.body).toHaveProperty('title', habit.title)
      expect(res.body).toHaveProperty('content', habit.content)
      expect(res.body).toHaveProperty('category', habit.category)
    })
  })
})
