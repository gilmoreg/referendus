const express = require('express');
const router = express.Router();

router.use('/refs',require('./refs'));
router.use('/refs/apa',require('./apa'));
router.use('/refs/chicago',require('./chicago'));
router.use('/refs/mla',require('./mla'));

module.exports = {router};