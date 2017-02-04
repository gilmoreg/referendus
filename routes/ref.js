const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {logger} = require('../logger');
const {References/*, Articles, Books, Websites*/} = require('../models/reference');

router.get('/:id', (req, res) => {
	logger.log('info',`GET /refs ${req.params.id}`);
	References
		.findById(req.params.id)
		.exec() 
		.then( (ref) => {
			res.json(ref);
		})
		.catch( err => {
			logger.log('error',err);
			res.status(500).json({message:'Internal server error'});
		})
});

module.exports = router;