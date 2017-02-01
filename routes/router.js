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
	 
 	BlogPosts
		.find()
		.exec() 
		.then( (posts) => {
			res.json({posts: posts.map((post)=>{return post.json();})});
		})
		.catch( err => {
			logger.log('error',err);
			res.status(500).json({message:'Internal server error'});
		})
});

module.exports = router;