const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const morgan = require('morgan');
const {logger} = require('../logger');

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const {References/*, Articles, Books, Websites*/} = require('../models/reference');

chai.use(chaiHttp);
const should = chai.should();

app.use(morgan('common', {stream: logger.stream}));

function seedRefData() {
    logger.info('seeding ref post data');
    const seedData = [];

    for (let i = 1; i <= 3; i++) {
        seedData.push(generateArticleData());
        seedData.push(generateBookData());
        seedData.push(generateWebsiteData());
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
function generateArticleData() {
    return {
        'type': 'Article',
        'title': faker.company.catchPhrase(),
        'authors': [
            { 'author': generateAuthorName() },
            { 'author': generateAuthorName() }
        ],
        'year': 2017,
        'volume': faker.random.number(),
        'issue': faker.random.number(),
        'pages': `${faker.random.number()}-${faker.random.number()}`,
        'url': faker.internet.url()
    }
}

function generateBookData() {
    return {
        'type': 'Book',
        'title': faker.company.catchPhrase(),
        'authors': [
            { 'author': generateAuthorName() },
            { 'author': generateAuthorName() }
        ],
        'city': faker.address.city(),
        'publisher': faker.company.companyName(),
        'year': 2017
    }
}

function generateWebsiteData() {
    return {
        'type': 'Website',
        'title': faker.company.catchPhrase(),
        'siteTitle': faker.company.companyName(),
        'accessDate': faker.date.recent(),
        'pubDate': faker.date.past(),
        'url': faker.internet.url()
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
                    res.body.refs.should.have.length.of.at.least(1);
                    return References.count();
                })
                .then(function(count) {
                    res.body.refs.should.have.length.of(count);
                });
        });

        it('should return refs with the right fields', function() {
            let refPost;
            return chai.request(app)
                .get('/refs')
                .then(function(res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.refs.should.be.a('array');
                    res.body.refs.should.have.length.of.at.least(1);
                    res.body.refs.forEach(function(ref) {
                        ref.should.be.a('object');
                        ref.should.include.keys('id','title','type');
                        switch(ref.type) {
                            case 'Article': {
                                ref.should.include.keys('authors','year','volume','issue','pages');
                                break;
                            };
                            case 'Book': {
                                ref.should.include.keys('authors','publisher','year','city'); 
                                break;
                            }; 
                            case 'Website': {
                                ref.should.include.keys('siteTitle','accessDate','url');
                                break;
                            };
                        }
                    });
                    refPost = res.body.refs[0];
                    return References.findById(refPost.id);
                })
                .then(function(ref) {
                    console.log('refPost >>>>>>>\n', refPost, '\n<<<<<<<<<< \n',ref);
                    refPost.id.should.equal(ref.id);
                    refPost.title.should.equal(ref.title);
                    refPost.type.should.equal(ref.type);
                    switch(ref.type) {
                        case 'Article': {
                            refPost.year.should.equal(ref.year);
                            refPost.volume.should.equal(ref.volume);
                            refPost.issue.should.equal(ref.issue);
                            refPost.pages.should.equal(ref.pages);
                            break;
                        }
                        case 'Book': {
                            refPost.city.should.equal(ref.city);
                            refPost.publisher.should.equal(ref.publisher);
                            refPost.year.should.equal(ref.year);
                            break;
                        }
                        case 'Website': {
                            refPost.siteTitle.should.equal(ref.siteTitle);
                            refPost.accessDate.should.equal(ref.accessDate);
                            refPost.url.should.equal(ref.url);
                            break;
                        }
                    }
                });
            })
    });

    describe('POST endpoint', function() {
        
    });
});