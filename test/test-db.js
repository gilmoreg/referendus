const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
// TODO is this necessary?
const morgan = require('morgan');
const {logger} = require('../logger');

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const {References, Articles, Books, Websites} = require('../models/reference');

chai.use(chaiHttp);
// TODO is this necessary?
app.use(morgan('common', {stream: logger.stream}));

function seedRefData() {
    logger.info('seeding ref post data');
    const seedData = [];

    for (let i = 1; i <= 10; i++) {
        seedData.push(generateRefData());
    }
    // this will return a promise
    return References.insertMany(seedData);
}

// used to generate data to put in db
function generateAuthorName() {
    return {
        'firstName': faker.name.firstName(),
        'lastName': faker.name.lastName()
    }
}

// generate an object represnting a ref.
// can be used to generate seed data for db
// or request.body data
function generateRefData() {
    return {
        'type': 'Book',
        'title': faker.company.catchPhrase(),
        'author': generateAuthorName(),
        city: faker.address.city(),
        publisher: faker.company.companyName(),
        year: 2017
    }
}

function tearDownDb() {
    logger.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Reference API', function() {

    before(function() {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function() {
        return seedRefData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('GET endpoint', function() {
        

        it('should return all existing references', function() {
            logger.log('GET all');
            let res;
            return chai.request(app)
                .get('/refs')
                .then(function(_res) {
                    console.info('validating GET response');
                    // so subsequent .then blocks can access resp obj.
                    res = _res;
                    res.should.have.status(200);
                    // otherwise our db seeding didn't work
                    res.body.posts.should.have.length.of.at.least(1);
                    return References.count();
                })
                .then(function(count) {
                    res.body.posts.should.have.length.of(count);
                });
        });
    
    });
});