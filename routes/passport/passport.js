const express = require('express');
const router = express.Router();
const passport = require('passport');
const {BasicStrategy} = require('passport-http');
const {User} = require('../../models/user');
const {logger} = require('../../logger');

passport.use(new BasicStrategy(
  (username, password, callback) => {
    logger.log('info','attempting BasicStrategy');
    User.findOne({ username: username }, (err, user) => {
      logger.log('info','attempting findOne err', err);
      logger.log('info','attempting findOne user', user);
      if (err) { 
        logger.log('info','BasicStrategy',err,user);
        return callback(err); 
      }

      // No user found with that username
      if (!user) { 
        logger.log('info','BasicStrategy',err,user);
        return callback(null, false); 
      }

      // Make sure the password is correct
      user.validatePassword(password, (err, isMatch) => {
        logger.log('info','validatePassword',err,isMatch);
        if (err) { 
          logger.log('info','validatePassword',err,isMatch);
          return callback(err); 
        }

        // Password did not match
        if (!isMatch) { 
          logger.log('info','validatePassword',err,match);
          return callback(null, false); 
        }
        logger.log('info','validatePassword success',user);
        // Success
        return callback(null, user);
      });
    });
  }
));

router.use(express.session({ secret: 'keyboard puma' }));
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