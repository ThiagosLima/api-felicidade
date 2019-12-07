const request = require('supertest')
const mongoose = require('mongoose')
const { Feed } = require('../../../models/feed')
const { User } = require('../../../models/user')

let server

describe('/api/feed', () => {
  let feed
  let token

  // Create a feed with token
  const execToken = async () => {
    const { ops: users } = await User.collection.insertOne({
      name: 'user1',
      email: 'user1@mail.com',
      password: '12345'
    })

    token = new User(users[0]).generateAuthToken()

    return request(server)
      .post('/api/feed')
      .set('x-auth-token', token)
      .send(feed)
  }

  // Create a feed
  const exec = () => {
    return Feed.collection.insertOne(feed)
  }

  const createAdmin = async () => {
    const { ops: admins } = await User.collection.insertOne({
      name: 'admin',
      email: 'admin@mail.com',
      password: '12345',
      isAdmin: true
    })

    token = new User(admins[0]).generateAuthToken()
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
    it('should save if the feed is valid', async () => {
      const res = await execToken()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('_id')
    })

    it('should return 400 if the title is null', async () => {
      feed.title = null

      const res = await execToken()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the title is less than 5 chars', async () => {
      feed.title = '1234'

      const res = await execToken()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the title is more than 255 chars', async () => {
      feed.title = new Array(257).join('a')

      const res = await execToken()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the description is null', async () => {
      feed.description = null

      const res = await execToken()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the description is less than 5 chars', async () => {
      feed.description = '1234'

      const res = await execToken()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the isAnon is null', async () => {
      feed.isAnon = null

      const res = await execToken()

      expect(res.status).toBe(400)
    })
  })

  describe('PUT /:id', () => {
    let newFeed
    let resFeed

    const execPut = () => {
      return request(server)
        .put(`/api/feed/${resFeed._id}`)
        .set('x-auth-token', token)
        .send({ ...newFeed })
    }

    beforeEach(async () => {
      const { body } = await execToken()
      resFeed = body

      newFeed = {
        title: 'newTitle',
        description: 'newDescription',
        isAnon: true
      }
    })

    afterEach(async () => {
      await Feed.deleteMany({})
      await User.deleteMany({})
    })

    it('should return the updated feed if it is valid', async () => {
      const res = await execPut()

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject(newFeed)
    })

    it('should return 403 if the user is not the author', async () => {
      token = new User().generateAuthToken()

      const res = await execPut()

      expect(res.status).toBe(403)
    })

    it('should save the updated feed if it is valid', async () => {
      await execPut()

      const updatedFeed = await Feed.findById(resFeed._id)

      expect(updatedFeed).not.toBeNull()
      expect(updatedFeed).toHaveProperty('title', 'newTitle')
      expect(updatedFeed).toHaveProperty('description', 'newDescription')
      expect(updatedFeed).toHaveProperty('isAnon', true)
    })

    it('should return 400 if the title is null', async () => {
      newFeed.title = null

      const res = await execPut()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the title is less than 5 chars', async () => {
      newFeed.title = '1234'

      const res = await execPut()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the title is more than 255 chars', async () => {
      newFeed.title = new Array(257).join('a')

      const res = await execPut()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the description is null', async () => {
      newFeed.description = null

      const res = await execPut()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the description is less than 5 chars', async () => {
      newFeed.description = '1234'

      const res = await execPut()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the isAnon is null', async () => {
      newFeed.isAnon = null

      const res = await execPut()

      expect(res.status).toBe(400)
    })

    it('should return 404 if the id is invalid', async () => {
      resFeed._id = mongoose.Types.ObjectId()

      const res = await execPut()

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /:id', () => {
    let resFeed

    const execDelete = () => {
      return request(server)
        .delete(`/api/feed/${resFeed._id}`)
        .set('x-auth-token', token)
    }

    beforeEach(async () => {
      const { body } = await execToken()
      resFeed = body
    })

    afterEach(async () => {
      await Feed.deleteMany({})
      await User.deleteMany({})
    })

    it('should return the deleted the feed', async () => {
      const res = await execDelete()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('_id')
    })

    it('should delete the feed', async () => {
      await execDelete()

      const deletedFeed = await Feed.findById(resFeed._id)

      expect(deletedFeed).toBeNull()
    })

    it('should delete the feed', async () => {
      await execDelete()

      const deletedFeed = await Feed.findById(resFeed._id)

      expect(deletedFeed).toBeNull()
    })

    it('should delete the feed if user is admin', async () => {
      await createAdmin()

      await execDelete()

      const deletedFeed = await Feed.findById(resFeed._id)

      expect(deletedFeed).toBeNull()
    })

    it('should return 404 if the id is invalid', async () => {
      resFeed._id = mongoose.Types.ObjectId()

      const res = await execDelete()

      expect(res.status).toBe(404)
    })
  })

  describe('POST /authorize/:id', () => {
    let resFeed

    beforeEach(async () => {
      const { body } = await execToken()
      resFeed = body
    })
    it('should return the authorized feed', async () => {
      await createAdmin()

      const res = await request(server)
        .post(`/api/feed/authorize/${resFeed._id}`)
        .set('x-auth-token', token)

      expect(200).toBe(200)
      expect(res.body).toHaveProperty('isAuthorized', true)
    })

    it('should save the authorized feed', async () => {
      await createAdmin()

      await request(server)
        .post(`/api/feed/authorize/${resFeed._id}`)
        .set('x-auth-token', token)

      const authoraizedFeed = await Feed.findById(resFeed._id)

      expect(authoraizedFeed).toHaveProperty('isAuthorized', true)
    })

    it('should return 403 if the user is not an admin', async () => {
      const res = await request(server)
        .post(`/api/feed/authorize/${resFeed._id}`)
        .set('x-auth-token', token)

      expect(res.status).toBe(403)
    })

    it('should return 400 if the token is invalid', async () => {
      token = 'a'
      const res = await request(server)
        .post(`/api/feed/authorize/${resFeed._id}`)
        .set('x-auth-token', token)

      expect(res.status).toBe(400)
    })

    it('should return 401 if the token is null', async () => {
      const res = await request(server).post(
        `/api/feed/authorize/${resFeed._id}`
      )

      expect(res.status).toBe(401)
    })

    it('should return 404 if the id is invalid', async () => {
      await createAdmin()
      resFeed._id = mongoose.Types.ObjectId()

      const res = await request(server)
        .post(`/api/feed/authorize/${resFeed._id}`)
        .set('x-auth-token', token)

      expect(res.status).toBe(404)
    })
  })
})
