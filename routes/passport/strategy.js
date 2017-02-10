const LocalStrategy = require('passport-local').Strategy
const {User} = require('../../models/user');

const strategy = new LocalStrategy(
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
);

module.exports = strategy;