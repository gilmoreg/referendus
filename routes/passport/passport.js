const express = require('express');
const router = express.Router();
const session = require('express-session')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const {User} = require('../../models/user');
const {logger} = require('../../logger');

passport.use(new LocalStrategy(
  (username, password, callback) => {
    logger.log('info','attempting LocalStrategy');
    User.findOne({ username: username }, (err, user) => {
      console.log('info','attempting findOne err', err);
      console.log('info','attempting findOne user', user);
      if (err) { 
        console.log('info','LocalStrategy',err,user);
        return callback(err); 
      }

      // No user found with that username
      if (!user) { 
        console.log('info','LocalStrategy',err,user);
        return callback(null, false); 
      }
      console.log('going to check password');
      // Make sure the password is correct
      user.validatePassword(password, (err, isMatch) => {
        // We never make it here
        console.log('info','validatePassword',err,isMatch);
        if (err) { 
          console.log('info','validatePassword',err,isMatch);
          return callback(err); 
        }

        // Password did not match
        if (!isMatch) { 
          console.log('info','validatePassword',err,match);
          return callback(null, false); 
        }
        console.log('info','validatePassword success',user);
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