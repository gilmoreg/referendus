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
    res.status(200).json({message: 'Login successful'});
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
                console.log('username already taken');
                throw new Error('username already taken');
                return null;
            }
            // if no existing user, hash password
            return User.hashPassword(password)
    })
    .then(hash => {
        return User
        .create({
            username: username,
            password: hash
        })
    })
    .then(user => {
        req.login(user, (err) => {
            if(!err) {
                return res.status(201).json(user.json());
            }
            else { throw new Error(`${err}`) }
        })
    })
    .catch(err => {
        console.log('error creating user', err);
        res.status(500).json({message: 'Internal server error', details:`${err}`})
    });
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/'); // TODO
});

module.exports = router;