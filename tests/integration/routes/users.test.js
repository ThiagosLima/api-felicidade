const request = require('supertest')
const mongoose = require('mongoose')
const { User } = require('../../../models/user')

let server

describe('/api/users', () => {
  beforeEach(() => {
    server = require('../../../index')
  })

  afterEach(async () => {
    server.close()
    await User.deleteMany({})
  })

  describe('GET /', () => {
    it('should return all users', async () => {
      await User.collection.insertMany([
        {
          name: 'user1',
          email: 'user1@mail.com',
          password: '12345'
        },
        {
          name: 'user2',
          email: 'user2@mail.com',
          password: '12345'
        }
      ])

      const res = await request(server).get('/api/users')

      expect(res.status).toBe(200)
      expect(res.body.length).toBe(2)
      expect(res.body.some(user => user.name === 'user1')).toBeTruthy()
      expect(res.body.some(user => user.name === 'user2')).toBeTruthy()
    })
  })

  describe('GET /me', () => {
    it('should return the logged user', async () => {
      const { ops: users } = await User.collection.insertOne({
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      })

      const token = new User(users[0]).generateAuthToken()

      const res = await request(server)
        .get('/api/users/me')
        .set('x-auth-token', token)
        .send(users[0])

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name', users[0].name)
      expect(res.body).toHaveProperty('email', users[0].email)
    })
  })

  describe('GET /:id', () => {
    it('should return the user with the given id', async () => {
      const { ops: users } = await User.collection.insertOne({
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      })

      const res = await request(server).get(`/api/users/${users[0]._id}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name', users[0].name)
      expect(res.body).toHaveProperty('email', users[0].email)
    })

    it('should return 404 if no user with the given id exists', async () => {
      const id = mongoose.Types.ObjectId()
      const res = await request(server).get(`/api/users/${id}`)

      expect(res.status).toBe(404)
    })
  })

  describe('POST /', () => {
    it('should return 400 if invalid body is passed', async () => {
      const res = await request(server).post('/api/users')

      expect(res.status).toBe(400)
    })

    it('should 400 if the user already exist', async () => {
      const user = {
        name: 'user2',
        email: 'user2@mail.com',
        password: '12345'
      }

      await User.collection.insertOne({ ...user })

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should create a new user', async () => {
      const user = {
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      }

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name', user.name)
      expect(res.body).toHaveProperty('email', user.email)
    })
  })

  describe('PUT /:id', () => {
    it('should return 400 if invalid body is passed', async () => {
      const { ops: users } = await User.collection.insertOne({
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      })

      const res = await request(server).put(`/api/users/${users[0]}`)

      expect(res.status).toBe(400)
    })

    it('should return 404 if inalid id is passed', async () => {
      const id = mongoose.Types.ObjectId()
      const user = {
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      }

      const res = await request(server)
        .put(`/api/users/${id}`)
        .send(user)

      expect(res.status).toBe(404)
      expect(res.text).toBe('The user with the given ID was not found.')
    })

    it('should update the user if it is valid', async () => {
      const { ops: users } = await User.collection.insertOne({
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      })

      const newUser = {
        name: 'newName',
        email: 'newemail@mail.com',
        password: 'newPassword'
      }

      const res = await request(server)
        .put(`/api/users/${users[0]._id}`)
        .send({ ...newUser })

      const updatedUser = await User.findById(users[0]._id)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject(newUser)
      expect(updatedUser).not.toBeNull()
      expect(updatedUser).toHaveProperty('name', 'newName')
      expect(updatedUser).toHaveProperty('email', 'newemail@mail.com')
    })
  })
})
