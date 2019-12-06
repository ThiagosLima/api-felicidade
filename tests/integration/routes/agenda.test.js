const request = require('supertest')
const mongoose = require('mongoose')
const { Agenda } = require('../../../models/agenda')
const { User } = require('../../../models/user')

let server

describe('/api/agenda', () => {
  let user
  let agenda

  beforeEach(async () => {
    server = require('../../../index')

    user = {
      name: 'user1',
      email: 'user1@mail.com',
      password: '12345'
    }

    await request(server)
      .post('/api/users')
      .send(user)

    user = (await User.find())[0]

    agenda = {
      event: {
        content: 'a',
        finalDate: '2019-11-18T20:51:34.660Z',
        initialDate: '2019-11-18T20:51:34.660Z',
        title: 'a'
      }
    }
  })

  afterEach(async () => {
    server.close()
    await Agenda.deleteMany({})
    await User.deleteMany({})
  })

  describe('GET /:id', () => {
    it('should return the agenda with the given id', async () => {
      const agenda = await Agenda.findOne({ user: user._id })

      const res = await request(server).get(`/api/agenda/${agenda._id}`)

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
      const res = await request(server).get('/api/agenda')

      expect(res.status).toBe(200)
    })

    it('should an agenda of a given user', async () => {
      const res = await request(server).get(`/api/agenda?user=${user._id}`)

      expect(res.status).toBe(200)
    })
  })

  describe('POST /', () => {
    it('should create a new agenda', async () => {
      agenda.user = user._id

      const res = await request(server)
        .post(`/api/agenda?user=${user._id}`)
        .send(agenda)

      expect(res.status).toBe(200)
    })
  })

  describe('PUT /:id', () => {
    let agendaId

    const updateEvent = () => {
      agenda.event.title = 'newTitle'
      agenda.event.content = 'newContent'
      agenda.event.finalDate = '2020-11-18T20:51:34.660Z'
      agenda.event.initialDate = '2002-11-18T20:51:34.660Z'
    }

    const exec = async () => {
      const { _id } = await Agenda.findOne({ user: user._id })
      agendaId = _id

      return request(server)
        .put(`/api/agenda/${agendaId}`)
        .send(agenda)
    }

    it('should create a new event if the body is valid', async () => {
      const res = await exec()

      expect(res.status).toBe(200)
    })

    it('should return the updated event if the body is valid', async () => {
      await exec()
      updateEvent()

      const agendaInDB = await Agenda.findOne({ user: user._id })

      const res = await request(server)
        .put(`/api/agenda/${agendaId}?eventId=${agendaInDB.events[0]._id}`)
        .send(agenda)

      expect(res.status).toBe(200)
      expect(res.body.events[0]).toHaveProperty('title', agenda.event.title)
      expect(res.body.events[0]).toHaveProperty('content', agenda.event.content)
      expect(res.body.events[0]).toHaveProperty(
        'finalDate',
        agenda.event.finalDate
      )
      expect(res.body.events[0]).toHaveProperty(
        'initialDate',
        agenda.event.initialDate
      )
    })

    it('should update a old event if the body is valid', async () => {
      await exec()
      updateEvent()

      let agendaInDB = await Agenda.findOne({ user: user._id })

      await request(server)
        .put(`/api/agenda/${agendaId}?eventId=${agendaInDB.events[0]._id}`)
        .send(agenda)

      agendaInDB = await Agenda.findOne({ user: user._id })

      expect(agendaInDB.events[0]).toHaveProperty('title', agenda.event.title)
      expect(agendaInDB.events[0]).toHaveProperty(
        'content',
        agenda.event.content
      )
    })

    it('should 400 the body is invalid', async () => {
      delete agenda.event.title

      const res = await exec()

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /:id', () => {
    let agendaId
    let agendaInDB

    beforeEach(async () => {
      const { _id } = await Agenda.findOne({ user: user._id })
      agendaId = _id

      await request(server)
        .put(`/api/agenda/${agendaId}`)
        .send(agenda)

      agendaInDB = await Agenda.findOne({ user: user._id })
    })

    it('should return the agenda if it is valid', async () => {
      const res = await request(server).delete(
        `/api/agenda/${agendaId}?eventId=${agendaInDB.events[0]._id}`
      )

      expect(res.status).toBe(200)
      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining(['_id', 'user', 'events'])
      )
      expect(res.body.events[0]).toBeUndefined()
    })

    it('should delete if it is valid', async () => {
      await request(server).delete(
        `/api/agenda/${agendaId}?eventId=${agendaInDB.events[0]._id}`
      )

      const newAgenda = await Agenda.findOne({ user: user._id })

      expect(newAgenda.events[0]).toBeUndefined()
    })

    it('should 400 there is not a event id', async () => {
      const res = await request(server).delete(`/api/agenda/${agendaId}`)

      expect(res.status).toBe(400)
    })

    it('should 404 the event with the given ID was not found', async () => {
      const res = await request(server).delete(
        `/api/agenda/${agendaId}?eventId=a`
      )

      expect(res.status).toBe(404)
    })
  })
})
