// This is a exemple test
const request = require('supertest')
const { Agenda } = require('../../../models/agenda')
const { User } = require('../../../models/user')

let server

describe('index', () => {
  beforeEach(() => {
    server = require('../../../index')
  })

  afterEach(async () => {
    server.close()
    await Agenda.deleteMany({})
    await User.deleteMany({})
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
  })
})
