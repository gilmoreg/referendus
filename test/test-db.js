const chai = require('chai');
chai.use(require('chai-http'));
const should = chai.should();
const faker = require('faker');
const mongoose = require('mongoose');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
const {References/*, Articles, Books, Websites*/} = require('../models/reference');
const {User} = require('../models/user');

function seedRefData() {
    console.info('seeding ref post data');
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
        'user': 'test',
        'type': 'Article',
        'title': faker.company.catchPhrase(),
        'authors': [
            { 'author': generateAuthorName() },
            { 'author': generateAuthorName() }
        ],
        'year': 2017,
        'journal': faker.company.companyName(),
        'volume': `${faker.random.number()}`,
        'issue': `${faker.random.number()}`,
        'pages': `${faker.random.number()}-${faker.random.number()}`,
        'url': faker.internet.url()
    }
}

function generateBookData() {
    return {
        'user': 'test',
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
        'user': 'test',
        'type': 'Website',
        'title': faker.company.catchPhrase(),
        'siteTitle': faker.company.companyName(),
        'accessDate': faker.date.recent(),
        'pubDate': faker.date.past(),
        'url': faker.internet.url()
    }
}

describe('Reference API', () => {

    let sid;

    before(() => {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(done => {  
        chai.request.agent(app)
            .post('/auth/signup')
            .send({username:'test', password:faker.internet.color() })
            .then(res => {
                sid = res.headers['set-cookie'].pop().split(';')[0];
                seedRefData()
                    .then(() => {
                        done();
                    })
            })
            .catch(err =>{
                console.error(err);
                res.status(500).json({message: 'Internal server error'});
            })
    });

    afterEach(() => {
        return mongoose.connection.dropDatabase();
    });

    after(() => {
        return closeServer();
    });

    /*describe('something basic', () => {
        // This should actually fail because there is no session id ????
        it('should prove that tests are working', () => {
            return chai.request.agent(app)
                .get('/refs')
                .set('Cookie',sid)
                .then(res => {
                    res.should.have.status(200);
                    return;
                })
        });
    });*/

    describe('POST', () => {
        it('should add a new article', () => {
            const newArticle = generateArticleData();
            return chai.request.agent(app)
                .post('/refs')
                .set('Cookie',sid)
                .send(newArticle)
                .then(res => {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys(
                        'id', 'authors','year','volume','issue','pages');
                    console.log('posted?');
                    res.body.id.should.not.be.null;
                    return References.findById(res.body.id);
                })
                .then(function(ref) {
                    ref.title.should.equal(newArticle.title);
                    ref.year.should.equal(newArticle.year);
                    ref.volume.should.equal(newArticle.volume);
                    ref.pages.should.equal(newArticle.pages);
                    ref.issue.should.equal(newArticle.issue);
                });
        });

        it('should add a new book', function() {
            const newBook = generateBookData();
            return chai.request(app)
                .post('/refs')
                .set('Cookie',sid)
                .send(newBook)
                .then(function(res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys(
                        'id', 'authors','publisher','year','city');
                    res.body.title.should.equal(newBook.title);
                    // because Mongo should have created id on insertion
                    res.body.id.should.not.be.null;
                    return References.findById(res.body.id);
                })
                .then(function(ref) {
                    ref.title.should.equal(newBook.title);
                    ref.year.should.equal(newBook.year);
                    ref.publisher.should.equal(newBook.publisher);
                    ref.city.should.equal(newBook.city);
                });
        });


    });
});
    /*
    describe('GET endpoint', function() {
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
                                ref.should.include.keys('authors','year','journal','volume','issue','pages');
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
                    refPost.id.should.equal(ref.id);
                    refPost.title.should.equal(ref.title);
                    refPost.type.should.equal(ref.type);
                    switch(ref.type) {
                        case 'Article': {
                            refPost.year.should.equal(ref.year);
                            refPost.volume.should.equal(ref.volume);
                            refPost.journal.should.equal(ref.journal);
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
        it('should add a new article', function() {
            const newArticle = generateArticleData();
            return chai.request(app)
                .post('/refs')
                .send(newArticle)
                .then(function(res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys(
                        'id', 'authors','year','volume','issue','pages');
                    res.body.title.should.equal(newArticle.title);
                    // cause Mongo should have created id on insertion
                    res.body.id.should.not.be.null;
                    return References.findById(res.body.id);
                })
                .then(function(ref) {
                    ref.title.should.equal(newArticle.title);
                    ref.year.should.equal(newArticle.year);
                    ref.volume.should.equal(newArticle.volume);
                    ref.pages.should.equal(newArticle.pages);
                    ref.issue.should.equal(newArticle.issue);
                });
        });

        it('should add a new book', function() {
            const newBook = generateBookData();
            return chai.request(app)
                .post('/refs')
                .send(newBook)
                .then(function(res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys(
                        'id', 'authors','publisher','year','city');
                    res.body.title.should.equal(newBook.title);
                    // cause Mongo should have created id on insertion
                    res.body.id.should.not.be.null;
                    return References.findById(res.body.id);
                })
                .then(function(ref) {
                    ref.title.should.equal(newBook.title);
                    ref.year.should.equal(newBook.year);
                    ref.publisher.should.equal(newBook.publisher);
                    ref.city.should.equal(newBook.city);
                });
        });

        it('should add a new website', function() {
            const newSite = generateWebsiteData();
            return chai.request(app)
                .post('/refs')
                .send(newSite)
                .then(function(res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.include.keys(
                        'id', 'siteTitle','accessDate','url');
                    res.body.title.should.equal(newSite.title);
                    // cause Mongo should have created id on insertion
                    res.body.id.should.not.be.null;
                    return References.findById(res.body.id);
                })
                .then(function(ref) {
                    ref.title.should.equal(newSite.title);
                    ref.siteTitle.should.equal(newSite.siteTitle);
                    // These dates are stored in different formats; convert both to Unix time for comparison
                    const resRefAccess = new Date(ref.accessDate).getTime() / 1000;
                    const refAccess = new Date(newSite.accessDate).getTime() / 1000;
                    resRefAccess.should.equal(refAccess);
                    ref.url.should.equal(newSite.url);
                });
        });
    });

    describe('DELETE endpoint', function() {
        it('should delete a post by id', function() {
            let ref;
            return References
                .findOne()
                .exec()
                .then(function(_ref) {
                    ref = _ref;
                    return chai.request(app).delete(`/refs/${ref.id}`);
                })
                .then(function(res) {
                    res.should.have.status(204);
                    return References.findById(ref.id).exec();
                })
                .then(function(_ref) {
                    should.not.exist(_ref);
                });
        });
    });

    describe('PUT endpoint', function() {
        it('should update fields sent over', function() {
            const updateData = {
                title: 'magic',
                notes: 'lasers and fireworks'
            };

            return References
                .findOne()
                .exec()
                .then(function(ref) {
                    updateData.id = ref.id;
                    return chai.request(app)
                        .put(`/refs/${ref.id}`)
                        .send(updateData);        
                })
                .then(function(res) {
                    res.should.have.status(204);
                    return References.findById(updateData.id).exec();
                })
                .then(function(ref) {
                    ref.title.should.equal(updateData.title);
                    ref.notes.should.equal(updateData.notes);
                });
        });
    });
    */
