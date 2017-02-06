const express = require('express');
const router = express.Router();

router.use('/refs',require('./refs'));
router.use('/ref',require('./ref'));
router.use('/refs/apa',require('./formats/apa'));
router.use('/refs/chicago',require('./formats/chicago'));
router.use('/refs/mla',require('./formats/mla'));
router.use('/auth',require('./passport/auth'));

module.exports = {router};