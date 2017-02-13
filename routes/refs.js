const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {logger} = require('../logger');
const {References/*, Articles, Books, Websites*/} = require('../models/reference');

const res400Err = (msg, res) => {
    logger.error(msg);
    return res.status(400).send(msg);
};

const isAuthenticated = (req, res, next) => {
	if(req.isAuthenticated()){
        return next();
    } else{
		res.redirect('/');
    }
};

// TODO is this ever used? 
router.get('/', isAuthenticated, jsonParser, (req, res) => {
	logger.info('GET /refs');
	References
		.find({'user':req.user._doc.username})
		.exec()
		.then(refs => {
			res.json({refs: refs.map(ref=>ref.json())});
		})
		.catch(
			err => {
				console.error(err);
				res.status(500).json({message: 'Internal server error'});
		});
});

router.post('/', isAuthenticated, jsonParser, (req, res) => {
	logger.log('info',`POST ${JSON.stringify(req.body)}`);
	// validate
	let requiredFields;
    if(!req.body.type) {
        return res400Err('Missing "type" in request body', res);
    }

    switch(req.body.type) {
        case 'Article': {
            requiredFields = ['title','authors','year','journal','volume','issue','pages'];
            break;
        }
        case 'Book': {
            requiredFields = ['title','authors','city','publisher','year']; 
            break;
        } 
        case 'Website': {
            requiredFields = ['title','siteTitle','accessDate','url'];
            break;
        }
        default: {
            return res400Err(`Unknown reference type ${req.body.type}`, res);
        }
    }

	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			return res400Err(`Missing \`${field}\` in request body`, res);
		}
	}

    if(req.body.authors && req.body.authors.length < 1) {
        return res400Err('"authors" must contain at least one author', res);
    }

	// Add 'user' to body
	req.body.user = req.user._doc.username;

	References
		.create(req.body)
		.then(
			ref => res.status(201).json(ref.json()))
		.catch(err => {
			logger.log('error',err);
			res.status(500).json({message: 'Internal server error'});
		});
});

router.delete('/:id', isAuthenticated, (req, res) => {
	logger.log('info',`DELETE ${req.params.id}`);
	References
		.findOneAndRemove({ '_id':req.params.id, 'user':req.user._doc.username })
		.exec()
		.then(() => res.status(204).end())
		.catch(err => res.status(500).json({message: `Internal server error: ${err}`}));
});

router.put('/:id', isAuthenticated, jsonParser, (req, res) => {
	logger.log('info',`PUT ${req.body}`);
	if (req.params.id !== req.body.id) {
		const message = (
			`Request path id (${req.params.id}) and request body id ` +
			`(${req.body.id}) must match`);
		logger.log('error',message);
		return res.status(400).send(message);
	}
	logger.log('info',`Updating reference \`${req.params.id}\``);
	
	const toUpdate = {};
	const updateableFields = [
		// TODO discriminators would change how this works
		'type','title','tags','identifier','notes','authors','year','volume',
		'issue','pages','url','journal','city','publisher','edition','siteTitle',
		'accessDate','pubDate'
	];
	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	References
		// all key/value pairs in toUpdate will be updated -- that's what `$set` does
		.findOneAndUpdate({ '_id':req.params.id, 'user':req.user._doc.username }, {$set: toUpdate})
		.exec()
		.then(() => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error' + err}));
});

module.exports = router;