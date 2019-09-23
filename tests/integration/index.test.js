// This is a exemple test
const request = require("supertest");
let server;

describe("index", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(() => {
    server.close();
  });

  describe("GET /", () => {
    it("should return status 200 Ok", async () => {
      const res = await request(server).get("/");
      expect(res.status).toBe(200);
    });
  });
});
