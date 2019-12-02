const request = require('supertest')
const mongoose = require('mongoose')
const { Feed } = require('../../../models/feed')
const { User } = require('../../../models/user')

let server

describe('/api/feed', () => {
  let feed
  // let user

  // const createUser = () => {
  //   return request(server)
  //     .post('/api/users')
  //     .send({
  //       name: 'user1',
  //       email: 'user1@mail.com',
  //       password: '12345'
  //     })
  // }

  const exec = () => {
    return Feed.collection.insertOne(feed)
  }

  beforeEach(async () => {
    server = require('../../../index')

    feed = {
      title: 'feedTitle',
      description: 'feedDescription',
      isAnon: false
    }
  })

  afterEach(async () => {
    server.close()
    await Feed.deleteMany({})
    await User.deleteMany({})
  })

  describe('GET /', () => {
    it('should return all feeds', async () => {
      feed.isAuthorized = true
      await exec()

      const res = await request(server).get('/api/feed')

      expect(res.status).toBe(200)
      expect(res.body.length).toBe(1)
    })
  })

  describe('GET /:id', () => {
    it('should return the feed with the given id', async () => {
      feed.isAuthorized = true
      const { ops: feeds } = await exec()

      const res = await request(server).get(`/api/feed/${feeds[0]._id}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('title', feed.title)
      expect(res.body).toHaveProperty('description', feed.description)
    })

    it('should return 404 if the id is invalid', async () => {
      const id = mongoose.Types.ObjectId()

      const res = await request(server).get(`/api/feed/${id}`)

      expect(res.status).toBe(404)
    })

    it('should return 403 if the feed is not authorized', async () => {
      feed.isAuthorized = false

      const { ops: feeds } = await exec()

      const res = await request(server).get(`/api/feed/${feeds[0]._id}`)

      expect(res.status).toBe(403)
    })
  })

  describe('POST /', () => {
    const execPost = async () => {
      const { ops: users } = await User.collection.insertOne({
        name: 'user1',
        email: 'user1@mail.com',
        password: '12345'
      })

      const token = new User(users[0]).generateAuthToken()

      return request(server)
        .post('/api/feed')
        .set('x-auth-token', token)
        .send(feed)
    }

    it('should save if the feed is valid', async () => {
      const res = await execPost()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('_id')
    })

    it('should return 400 if the title is null', async () => {
      feed.title = null

      const res = await execPost()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the title is less than 5 chars', async () => {
      feed.title = '1234'

      const res = await execPost()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the title is more than 255 chars', async () => {
      feed.title = new Array(257).join('a')

      const res = await execPost()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the description is null', async () => {
      feed.description = null

      const res = await execPost()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the description is less than 5 chars', async () => {
      feed.description = '1234'

      const res = await execPost()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the isAnon is null', async () => {
      feed.isAnon = null

      const res = await execPost()

      expect(res.status).toBe(400)
    })
  })
})
