const request = require('supertest')
const { User } = require('../../../models/user')

let server

describe('/api/auth', () => {
  let user

  const createUser = async () => {
    await request(server)
      .post('/api/users')
      .send({ ...user, name: 'user1' })
  }

  const exec = () => {
    return request(server)
      .post('/api/auth')
      .send(user)
  }

  beforeEach(() => {
    server = require('../../../index')

    user = {
      email: 'user1@mail.com',
      password: '12345'
    }
  })

  afterEach(async () => {
    server.close()
    await User.deleteMany({})
  })

  describe('POST /', () => {
    it('should 400 if it is a invalid user', async () => {
      const res = await exec()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the email is null', async () => {
      await createUser()
      user.email = null

      const res = await exec()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the email has less than 5 chars', async () => {
      await createUser()

      user.email = '1234'

      const res = await exec()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the email has more than 255 chars', async () => {
      await createUser()

      user.email = new Array(257).join('a')

      const res = await exec()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the password is null', async () => {
      await createUser()

      user.password = null

      const res = await exec()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the password has less than 5 chars', async () => {
      await createUser()

      user.password = '1234'

      const res = await exec()

      expect(res.status).toBe(400)
    })

    it('should return 400 if the password has more than 255 chars', async () => {
      await createUser()

      user.password = new Array(256).join('a')

      const res = await exec()

      expect(res.status).toBe(400)
    })

    it('should return the token if the body is valid', async () => {
      await createUser()

      const res = await exec()

      expect(res.status).toBe(200)
    })
  })
})
