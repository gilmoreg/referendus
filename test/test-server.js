/* eslint-disable no-unused-expressions */
/* global describe, it, before, after */
const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

chai.use(chaiHttp);

describe('Server Status', () => {
  before(() => runServer());
  after(() => closeServer());

  it('should give a 200 status', () => chai.request(app)
    .get('/')
    .then((res) => {
      res.should.have.status(200);
    }));
});
