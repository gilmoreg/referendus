const express = require('express');

const router = express.Router();
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const jsonParser = bodyParser.json();
const { logger } = require('../logger');
const { References/* , Articles, Books, Websites*/ } = require('../models/reference');

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

router.get('/:id', isAuthenticated, (req, res) => {
  logger.log('info', `GET /ref ${req.params.id}`);
  References
		.findOne({ _id: req.params.id, user: req.user._doc.username })
		.exec()
		.then((ref) => {
  res.json(ref);
})
		.catch((err) => {
  logger.log('error', err);
  res.status(500).json({ message: 'Internal server error' });
});
});

module.exports = router;
