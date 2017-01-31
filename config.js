exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/referendus';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
	'mongodb://localhost/test-referendus';
exports.PORT = process.env.PORT || 8080;