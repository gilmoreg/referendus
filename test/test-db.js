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
                .then(ref => {
                    ref.title.should.equal(newArticle.title);
                    ref.year.should.equal(newArticle.year);
                    ref.volume.should.equal(newArticle.volume);
                    ref.pages.should.equal(newArticle.pages);
                    ref.issue.should.equal(newArticle.issue);
                });
        });

        it('should add a new book', () => {
            const newBook = generateBookData();
            return chai.request.agent(app)
                .post('/refs')
                .set('Cookie',sid)
                .send(newBook)
                .then(res => {
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
                .then(ref => {
                    ref.title.should.equal(newBook.title);
                    ref.year.should.equal(newBook.year);
                    ref.publisher.should.equal(newBook.publisher);
                    ref.city.should.equal(newBook.city);
                });
        });

        it('should add a new website', () => {
            const newSite = generateWebsiteData();
            return chai.request.agent(app)
                .post('/refs')
                .set('Cookie',sid)
                .send(newSite)
                .then(res => {
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
                .then(ref => {
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

    describe('DELETE endpoint', () => {
        it('should delete a post by id', () => {
            let ref;
            return References
                .findOne()
                .exec()
                .then(_ref => {
                    ref = _ref;
                    return chai.request.agent(app)
                        .delete(`/refs/${ref.id}`)
                        .set('Cookie',sid);
                })
                .then(res => {
                    res.should.have.status(204);
                    return References.findById(ref.id).exec();
                })
                .then(_ref => {
                    should.not.exist(_ref);
                });
        });
    });

    describe('PUT endpoint', () => {
        it('should update fields sent over', () => {
            const updateData = {
                title: 'magic',
                notes: 'lasers and fireworks'
            };

            return References
                .findOne()
                .exec()
                .then(ref => {
                    updateData.id = ref.id;
                    return chai.request.agent(app)
                        .put(`/refs/${ref.id}`)
                        .set('Cookie',sid)
                        .send(updateData);        
                })
                .then(res => {
                    res.should.have.status(204);
                    return References.findById(updateData.id).exec();
                })
                .then(ref  => {
                    ref.title.should.equal(updateData.title);
                    ref.notes.should.equal(updateData.notes);
                });
        });
    });
});