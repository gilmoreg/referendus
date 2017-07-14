const express = require('express');

const router = express.Router();
const routes = require('./passport/passport');

router.use(routes);
router.use('/auth', require('./passport/auth'));
router.use('/refs', require('./refs'));
router.use('/ref', require('./ref'));
router.use('/refs/apa', require('./formats/apa'));
router.use('/refs/chicago', require('./formats/chicago'));
router.use('/refs/mla', require('./formats/mla'));

module.exports = { router };
