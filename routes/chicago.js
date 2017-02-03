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

// http://www.press.uchicago.edu/books/turabian/turabian_citationguide.html
const lastFirst = author => {
    let str = `${author.lastName}, ${author.firstName}`;
    if(author.middleName) str += `${author.middleName.charAt(0)}`;
    return str;
}

const firstLast = author => {
    let str = author.firstName;
    if(author.middleName) str += `${author.middleName.charAt(0)}.`;
    str += ` ${author.lastName}`;
    return str;
}

const authorList = authors => {
    if(authors.length<1) return '';
    if(authors.length===1) {
        return `${lastFirst(authors[0])}.`;
    }
    else {
        // Format: Last, First M., and First M. Last.
        let str = lastFirst(authors[0]);
        // Last author has to be preceded by 'and', so count up to penultimate only
        for(let i=0;i<authors.length-1;i++) {
            str += `${firstLast(authors[i])}, `;
        }
        str += `and ${firstLast(authors[authors.length])}.`;
    }
}

const article = ref => {
	var str = authorList(ref.authors);
    str += ` "${ref.title}." <i>${ref.journal}</i> ${ref.volume}, no. ${ref.issue} (${ref.year}): ${ref.pages}.`;
	return str;
}

const book = ref => {
	var str = '';
	return str;
}

const website = ref => {
	var str = '';
	return str;	
}

const generateReference = ref => {
    switch(ref.type) {
        case 'Article': { return article(ref); break; }
        case 'Book': { return book(ref); break; }
        case 'Website': { return website(ref); }
    }
}

router.get('/', (req, res) => {
	logger.log('info',`GET ${req}`);
	 
 	References
		.find()
		.exec() 
		.then( (refs) => {
			res.json({refs: refs.map((ref)=>{return generateReference(ref);})});
		})
		.catch( err => {
			logger.log('error',err);
			res.status(500).json({message:'Internal server error'});
		})
});

module.exports = router;