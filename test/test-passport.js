const chai = require('chai');

const should = chai.should();
const mongoose = require('mongoose');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

function tearDownDb() {
  return mongoose.connection.dropDatabase();
}

describe('Passport', () => {
  before(() => runServer(TEST_DATABASE_URL));

  afterEach(() => tearDownDb());

  after(() => closeServer());

  it('should create a new user and sign in', (done) => {
    chai.request(app)
            .post('/auth/signup')
            .send({ username: 'admin', password: 'test' })
            .then((res) => {
              res.should.have.status(201);
              res.should.be.json;
              res.body.should.be.a('object');
              res.body.username.should.equal('admin');
              done();
            });
  });
});
