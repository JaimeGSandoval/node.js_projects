const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Planets API', () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  describe('GET /launches', () => {
    test('Should respond with 200 success', async () => {
      const response = await request(app)
        .get('/planets')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });
});
