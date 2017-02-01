const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
// TODO is this necessary?
const morgan = require('morgan');
const {logger} = require('../logger');

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);
// TODO is this necessary?
app.use(morgan('common', {stream: logger.stream}));

function tearDownDb() {
    logger.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

