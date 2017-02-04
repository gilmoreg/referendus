const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
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
        return `${lastFirst(authors[0].author)}.`;
    }
    else {
        // Format: Last, First M., and First M. Last.
        let str = lastFirst(authors[0].author);
        // Last author has to be preceded by 'and', so count up to penultimate only
        for(let i=0;i<authors.length-1;i++) {
            str += `${firstLast(authors[i].author)}, `;
        }
        str += `and ${firstLast(authors[authors.length].author)}.`;
    }
}

const article = ref => {
	var str = authorList(ref.authors);
    str += ` "${ref.title}." <i>${ref.journal}</i> ${ref.volume}, no. ${ref.issue} (${ref.year})`;
    if(ref.pages) str += `: ${ref.pages}.`;
    else str += '.';
	return { id:ref.id, html:str };
}

const book = ref => {
	var str = authorList(ref.authors);
    str += `, <i>${ref.title}</i> (${ref.city}: ${ref.publisher}, ${ref.year})`;
    if(ref.pages) str += `, ${ref.pages}`;
    str += '.';
	return { id:ref.id, html:str };
}

const website = ref => {
	var str = authorList(ref.authors);
    str += `. "${ref.title}." ${ref.siteTitle}. Last modified ${ref.pubDate}. Accessed ${ref.accessDate}. ${ref.url}.`;
	return { id:ref.id, html:str };
}

const generateReference = ref => {
    switch(ref.type) {
        case 'Article': { return article(ref); break; }
        case 'Book': { return book(ref); break; }
        case 'Website': { return website(ref); }
    }
}

router.get('/', (req, res) => {
	logger.log('info',`GET /refs/chicago ${req}`);
	 
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