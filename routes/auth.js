const {BasicStrategy} = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport');
const {User} = require('../models/user');
const router = express.Router();
router.use(jsonParser);

const strategy = new BasicStrategy(
    (username, password, cb) => {
        User
            .findOne({username})
            .exec()
            .then(user => {
                if (!user) {
                    return cb(null, false, {
                        message: 'Incorrect username'
                    });
                }
                if (user.password !== password) {
                    return cb(null, false, 'Incorrect password');
                }
                return cb(null, user);
                })
            .catch(err => cb(err))
    }
);

passport.use(strategy);

router.post('/', (req, res) => {
    if (!req.body) {
        return res.status(400).json({message: 'No request body'});
    }
    if (!('username' in req.body)) {
        return res.status(422).json({message: 'Missing field: username'});
    }
    let {username, password, firstName, lastName} = req.body;
    if (typeof username !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: username'});
    }
    username = username.trim();
    if (username === '') {
        return res.status(422).json({message: 'Incorrect field length: username'});
    }
    if (!(password)) {
        return res.status(422).json({message: 'Missing field: password'});
    }
    if (typeof password !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: password'});
    }
    password = password.trim();
    if (password === '') {
        return res.status(422).json({message: 'Incorrect field length: password'});
    }
    // check for existing user
    return User
        .find({username})
        .count()
        .exec()
        .then(count => {
            if (count > 0) {
                return res.status(422).json({message: 'username already taken'});
            }
            // if no existing user, hash password
            return User.hashPassword(password)
        })
        .then(hash => {
            return User
            .create({
                username: username,
                password: hash,
                firstName: firstName,
                lastName: lastName
            })
        })
        .then(user => {
            return res.status(201).json(user.apiRepr());
        })
        .catch(err => {
            res.status(500).json({message: 'Internal server error'})
        });
});

const basicStrategy = new BasicStrategy(function(username, password, callback) {
  let user;
  User
    .findOne({username: username})
    .exec()
    .then(_user => {
        user = _user;
        if (!user) {
            return callback(null, false, {message: 'Incorrect username'});
        }
        return user.validatePassword(password);
    })
    .then(isValid => {
        if (!isValid) {
            return callback(null, false, {message: 'Incorrect password'});
        }
        else {
            return callback(null, user)
        }
    });
});

passport.use(basicStrategy);
router.use(passport.initialize());

router.get('/',
    passport.authenticate('basic', {session: false}),
    (req, res) => res.json({user: req.user.apiRepr()})
);

module.exports = {router};