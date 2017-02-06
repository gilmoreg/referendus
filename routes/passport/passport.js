const express = require('express');
const router = express.Router();
const session = require('express-session')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const {User} = require('../../models/user');
const {logger} = require('../../logger');

passport.use(new LocalStrategy(
  (username, password, callback) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return callback(err); 
      }
      // No user found with that username
      if (!user) { 
        return callback(null, false); 
      }
      // Make sure the password is correct
      user.validatePassword(password, (err, isMatch) => {
        if (err) { 
          return callback(err); 
        }
        // Password did not match
        if (!isMatch) { 
          return callback(null, false); 
        }
        // Success
        return callback(null, user);
      });
    });
  }
));

router.use(session({  secret: 'keyboard puma',
                      resave: true,
                      saveUninitialized: true }
                    ));
router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = router;