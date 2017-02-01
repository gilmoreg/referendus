const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const morgan = require('morgan');
const {logger} = require('../logger');
const {References, Articles, Books, Websites} = require('../models/reference');

const res400Err = (msg, res) => {
    logger.log('error',msg);
    return res.status(400).send(msg);
}

router.get('/', (req, res) => {
	logger.log('info',`GET ${req}`);
	 
 	References
		.find()
		.exec() 
		.then( (refs) => {
			res.json({refs: refs.map((ref)=>{return ref.json();})});
		})
		.catch( err => {
			logger.log('error',err);
			res.status(500).json({message:'Internal server error'});
		})
});

router.post('/', jsonParser, (req, res) => {
	logger.log('info',`POST`);
	// validate
	let requiredFields;
    if(!req.body.type) {
        return res400Err(`Missing "type" in request body`, res);
    }

    switch(req.body.type) {
        case 'Article': {
            requiredFields = ['title','authors','year','volume','issue','pages'];
        };
        case 'Book': {
            requiredFields = ['title','authors','city','publisher','year']; 
        }; 
        case 'Website': {
            requiredFields = ['title','siteTitle','accessDate','url'];
        };
        default: {
            return res400Err(`Unknown reference type ${req.body.type}`, res);
        };
    }

	for (let i=0; i<requiredFields.length; i++) {
	    const field = requiredFields[i];
	    if (!(field in req.body)) {
            return res400Err(`Missing \`${field}\` in request body`, res);
	    }
  	}
  	// if 'authors' is missing altogether that will have been caught above
    if(req.body.authors.length < 1) {
        return res400Err(`"authors" must contain at least one author`, res);
    }

    req.body.authors.forEach(author => {
        if(!('firstName' in author) || !('lastName' in author)) {
            return res400Err(`Missing author first and last name in request body`, res);
        }
    });

	 References
	    .create(req.body)
	    .then(
	      ref => res.status(201).json(ref.json()))
	    .catch(err => {
	      logger.log('error',err);
	      res.status(500).json({message: 'Internal server error'});
	    });
});

module.exports = router;