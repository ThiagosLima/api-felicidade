const request = require('supertest')
const mongoose = require('mongoose')
const { User } = require('../../../models/user')

let server

describe('/api/users', () => {
  let user
  const tooShortString = '1234'
  const tooLongString = new Array(257).join('a')

  beforeEach(() => {
    server = require('../../../index')

    user = {
      name: 'user1',
      email: 'user1@mail.com',
      password: '12345'
    }
  })

  afterEach(async () => {
    server.close()
    await User.deleteMany({})
  })

  describe('GET /', () => {
    it('should return all users', async () => {
      await User.collection.insertOne(user)

      const res = await request(server).get('/api/users')

      expect(res.status).toBe(200)
      expect(res.body.length).toBe(1)
      expect(res.body.some(user => user.name === 'user1')).toBeTruthy()
    })
  })

  describe('GET /me', () => {
    it('should return the logged user', async () => {
      const { ops: users } = await User.collection.insertOne(user)

      const token = new User(users[0]).generateAuthToken()

      const res = await request(server)
        .get('/api/users/me')
        .set('x-auth-token', token)
        .send(users[0])

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name', user.name)
      expect(res.body).toHaveProperty('email', user.email)
    })
  })

  describe('GET /:id', () => {
    beforeEach(async () => {
      const { ops: users } = await User.collection.insertOne({
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      })

      user = users[0]
    })
    it('should return the user with the given id', async () => {
      const res = await request(server).get(`/api/users/${user._id}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name', user.name)
      expect(res.body).toHaveProperty('email', user.email)
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

    it('should return 400 if name is null', async () => {
      user.name = null

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should return 400 if name is less than 5 chars', async () => {
      user.name = tooShortString

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should return 400 if name is more than 255 chars', async () => {
      user.name = tooLongString

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should return 400 if email is null', async () => {
      user.email = null

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should return 400 if email is less than 5 chars', async () => {
      user.email = tooShortString

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should return 400 if email is more than 255 chars', async () => {
      user.email = tooLongString

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should return 400 if password is null', async () => {
      user.password = null

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should return 400 if password is less than 5 chars', async () => {
      user.password = tooShortString

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should return 400 if password is more than 255 chars', async () => {
      user.password = tooLongString

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should 400 if the user already exist', async () => {
      await User.collection.insertOne({ ...user })

      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(400)
    })

    it('should create a new user', async () => {
      const res = await request(server)
        .post('/api/users')
        .send(user)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name', user.name)
      expect(res.body).toHaveProperty('email', user.email)
    })
  })

  describe('PUT /:id', () => {
    let newUser

    beforeEach(async () => {
      const { ops: users } = await User.collection.insertOne(user)
      user = users[0]

      newUser = {
        name: 'newName',
        email: 'newemail@mail.com',
        password: 'newPassword'
      }
    })

    it('should return 400 if invalid body is passed', async () => {
      const res = await request(server).put(`/api/users/${user._id}`)

      expect(res.status).toBe(400)
    })

    it('should return 400 if name is null', async () => {
      newUser.name = null

      const res = await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      expect(res.status).toBe(400)
    })

    it('should return 400 if name is less than 5 chars', async () => {
      newUser.name = tooShortString

      const res = await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      expect(res.status).toBe(400)
    })

    it('should return 400 if name is more than 255 chars', async () => {
      newUser.name = tooLongString

      const res = await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      expect(res.status).toBe(400)
    })

    it('should return 400 if email is null', async () => {
      newUser.email = null

      const res = await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      expect(res.status).toBe(400)
    })

    it('should return 400 if email is less than 5 chars', async () => {
      newUser.email = tooShortString

      const res = await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      expect(res.status).toBe(400)
    })

    it('should return 400 if email is more than 255 chars', async () => {
      newUser.email = tooLongString

      const res = await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      expect(res.status).toBe(400)
    })

    it('should return 400 if password is null', async () => {
      newUser.password = null

      const res = await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      expect(res.status).toBe(400)
    })

    it('should return 400 if password is less than 5 chars', async () => {
      newUser.password = tooShortString

      const res = await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      expect(res.status).toBe(400)
    })

    it('should return 400 if password is more than 255 chars', async () => {
      newUser.password = tooLongString

      const res = await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      expect(res.status).toBe(400)
    })

    it('should return 404 if inalid id is passed', async () => {
      const id = mongoose.Types.ObjectId()

      const res = await request(server)
        .put(`/api/users/${id}`)
        .send(newUser)

      expect(res.status).toBe(404)
      expect(res.text).toBe('The user with the given ID was not found.')
    })

    it('should return the updated user if it is valid', async () => {
      const res = await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name', newUser.name)
      expect(res.body).toHaveProperty('email', newUser.email)
      expect(res.body).toHaveProperty('_id')
    })

    it('should update the user if it is valid', async () => {
      await request(server)
        .put(`/api/users/${user._id}`)
        .send(newUser)

      const updatedUser = await User.findById(user._id)

      expect(updatedUser).not.toBeNull()
      expect(updatedUser).toHaveProperty('name', newUser.name)
      expect(updatedUser).toHaveProperty('email', newUser.email)
      expect(updatedUser).not.toHaveProperty('password', newUser.password)
    })
  })
})
