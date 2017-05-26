const { DATABASE_URL, TEST_DATABASE_URL, PORT } = require('./variables');

exports.DATABASE_URL = DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/referendus';
exports.TEST_DATABASE_URL = TEST_DATABASE_URL ||
                            'mongodb://localhost/test-referendus';
exports.PORT = PORT || 8080;