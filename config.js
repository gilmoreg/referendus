const { DATABASE_URL, PORT } = require('./variables');

exports.DATABASE_URL = DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/referendus';

exports.PORT = PORT || 8080;
