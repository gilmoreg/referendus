const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const morgan = require('morgan');
const {logger} = require('../logger');
const {References, Articles, Books, Websites} = require('../models/reference');

router.get('/', (req, res) => {
	logger.log('info',`GET ${req}`);
	 
 	References
		.find()
		.exec() 
		.then( (refs) => {
			res.json({posts: refs.map((post)=>{return ref.json();})});
		})
		.catch( err => {
			logger.log('error',err);
			res.status(500).json({message:'Internal server error'});
		})
});

module.exports = router;