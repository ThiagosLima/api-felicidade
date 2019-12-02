const request = require('supertest')
const mongoose = require('mongoose')
const { Agenda } = require('../../../models/agenda')
const { User } = require('../../../models/user')

let server

describe('/api/agenda', () => {
  beforeEach(() => {
    server = require('../../../index')
  })

  afterEach(async () => {
    server.close()
    await Agenda.deleteMany({})
    await User.deleteMany({})
  })

  describe('GET /:id', () => {
    it('should return the agenda with the given id', async () => {
      const user = {
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      }

      // Create a user
      let res = await request(server)
        .post('/api/users')
        .send(user)

      // Find agenda id
      const agenda = await Agenda.findOne({ user: res.body._id })
      res = await request(server).get(`/api/agenda/${agenda._id}`)

      expect(res.status).toBe(200)
    })

    it('should return 404 if no agenda with the given id exists', async () => {
      const id = mongoose.Types.ObjectId()
      const res = await request(server).get(`/api/agenda/${id}`)

      expect(res.status).toBe(404)
    })
  })

  describe('GET /', () => {
    it('should return all agendas', async () => {
      await User.collection.insertMany([
        {
          name: 'user1',
          email: 'user1@mail.com',
          password: 12345
        },
        {
          name: 'user2',
          email: 'user2@mail.com',
          password: 12345
        }
      ])

      const res = await request(server).get('/api/agenda')
      expect(res.status).toBe(200)
    })

    it('should an agenda of a given user', async () => {
      const user = {
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      }

      // Create a user
      let res = await request(server)
        .post('/api/users')
        .send(user)

      res = await request(server).get(`/api/agenda?user=${res.body._id}`)

      expect(res.status).toBe(200)
    })
  })

  describe('POST /', () => {
    it('should create a new agenda', async () => {
      const user = {
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      }

      // Create a user
      let res = await request(server)
        .post('/api/users')
        .send(user)

      const agenda = {
        user: res.body._id,
        event: {
          content: 'a',
          finalDate: '2019-11-18T20:51:34.660Z',
          initialDate: '2019-11-18T20:51:34.660Z',
          title: 'a'
        }
      }

      res = await request(server)
        .post(`/api/agenda?user=${res.body._id}`)
        .send(agenda)

      expect(res.status).toBe(200)
    })
  })
  describe('PUT /:id', () => {
    it('should update the body is valid', async () => {
      const user = {
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      }

      // Create a user
      let res = await request(server)
        .post('/api/users')
        .send(user)

      const { _id: agendaId } = await Agenda.findOne({ user: res.body._id })

      const newAgenda = {
        event: {
          content: 'a',
          finalDate: '2019-11-18T20:51:34.660Z',
          initialDate: '2019-11-18T20:51:34.660Z',
          title: 'a'
        }
      }

      res = await request(server)
        .put(`/api/agenda/${agendaId}`)
        .send(newAgenda)

      expect(res.status).toBe(200)
    })

    it('should 400 the body is invalid', async () => {
      const user = {
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      }

      // Create a user
      let res = await request(server)
        .post('/api/users')
        .send(user)

      const { _id: agendaId } = await Agenda.findOne({ user: res.body._id })

      const newAgenda = {
        event: {
          content: 'a',
          finalDate: '2019-11-18T20:51:34.660Z',
          initialDate: '2019-11-18T20:51:34.660Z'
        }
      }

      res = await request(server)
        .put(`/api/agenda/${agendaId}`)
        .send(newAgenda)

      expect(res.status).toBe(400)
    })
  })
})
