const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
});

UserSchema.methods.json = function() {
  return {
    username: this.username || ''
  };
}

UserSchema.methods.validatePassword = function(password) {
  console.log('validating password');
  //return bcrypt.compare(password, this.password);
  bcrypt.compare(password, this.password, (err, res) => {
    if(err) {
      console.log('bcrypt err', err);
    }
    if(res) {
      console.log('bcrypt res', res);
      return;
    }
    else {
      console.log('bcrypt - something went wrong');
      return;
    }
  });
}

UserSchema.statics.hashPassword = function(password) {
  console.log('hashing password');
  return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', UserSchema);

module.exports = {User};