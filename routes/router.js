const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const morgan = require('morgan');
const {logger} = require('../logger');
const {References/*, Articles, Books, Websites*/} = require('../models/reference');

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
            break;
        };
        case 'Book': {
            requiredFields = ['title','authors','city','publisher','year']; 
            break;
        }; 
        case 'Website': {
            requiredFields = ['title','siteTitle','accessDate','url'];
            break;
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

    if(req.body.authors && req.body.authors.length < 1) {
        return res400Err(`"authors" must contain at least one author`, res);
    }

	 References
	    .create(req.body)
	    .then(
	      ref => res.status(201).json(ref.json()))
	    .catch(err => {
	      logger.log('error',err);
	      res.status(500).json({message: 'Internal server error'});
	    });
});

router.delete('/:id', (req, res) => {
	logger.log('info',`DELETE ${req.params.id}`);
	References
	    .findByIdAndRemove(req.params.id)
	    .exec()
	    .then(post => res.status(204).end())
	    .catch(err => res.status(500).json({message: `Internal server error: ${err}`}));
});

router.put('/:id', jsonParser, (req, res) => {
	logger.log('info',`PUT ${req.body}`);
	if (req.params.id !== req.body.id) {
		const message = (
		  `Request path id (${req.params.id}) and request body id `
		  `(${req.body.id}) must match`);
		logger.log('error',message);
		return res.status(400).send(message);
	}
	logger.log('info',`Updating reference \`${req.params.id}\``);
	
	const toUpdate = {};
	const updateableFields = [
		'type','title','tag','identifier','notes','authors','year','volume',
		'issue','pages','url','city','publisher','edition','siteTitle',
		'accessDate','pubDate'
	];
	updateableFields.forEach(field => {
		if (field in req.body) {
		  toUpdate[field] = req.body[field];
		}
	});

	References
    	// all key/value pairs in toUpdate will be updated -- that's what `$set` does
	    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
	    .exec()
	    .then(post => res.status(204).end())
	    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;