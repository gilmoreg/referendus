const express = require('express');
const router = express.Router();
const passport = require('passport');
//const {LocalStrategy} = require('passport-http');
const {User} = require('../../models/user');
const {logger} = require('../../logger');

router.post('/login',
    passport.authenticate('local'),
    (req, res) => {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log('login successful');
    res.redirect('/'); // TODO
});

router.post('/signup', (req, res) => {
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
        res.status(500).json({message: 'Internal server error', details: err})
    });
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/'); // TODO
});

module.exports = router;