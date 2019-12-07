const config = require('config')
const lib = require('../../../startup/config')

describe('config startup', () => {
  it('should throw if the JWT_PRIVATE_KEY is not defined', () => {
    config.get = jest.fn().mockReturnValue(null)
    expect(() => lib('JWT_PRIVATE_KEY')).toThrow()
  })
})
