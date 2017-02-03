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

// https://owl.english.purdue.edu/owl/resource/560/06/
const apaName = author => {
	var str = `${author.lastName}, ${author.firstName.charAt(0)}.`;
	if(author.middleName) str += `${author.middleName.charAt(0)}.`;
	return str;
}

const generateAPAAuthorList = authors => {
	if(authors.length<1) return '';
	var str='';
	// Single author
	if(authors.length===1) {
		str += apaName(authors[0].author);
	}
	// Two authors
	else if(authors.length===2) {
		str += `${apaName(authors[0].author)} & ${apaName(authors[1].author)}`;		
	}
	// Between 3 and 7 authors
	else if(authors.length>=3 && authors.length<=7) {
		// Last author has to be preceded by ampersand, so count up to penultimate only
		for(var i=0; i<authors.length-1;i++) {
			str += `${apaName(authors[i].author)}, `;
		}
		str += `& ${apaName(authors[authors.length-1].author)}. `;
	}
	// More than 7 authors
	else if(authors.length>7) {
		for(var i=0; i<6;i++) {
			str += `${apaName(authors[i].author)}, `;
		}
		str += `. . . ${apaName(authors[authors.length-1].author)}`;
	}
	return str;
}

const generateAPAArticle = ref => {
	var str = '';
	str += `${generateAPAAuthorList(ref.authors)} `;
	str += `(${ref.year}). ${ref.title}. <i>${ref.journal}</i>, `;
	str += '<i>' + ref.volume + '</i>';
	if(ref.pages) str += `, ${ref.pages}.`;
	else str += '.';
	return str;
}

const generateAPABook = ref => {
	var str = '';
	str += `${generateAPAAuthorList(ref.authors)} (${ref.year}). <i>${ref.title}</i>. `;
	str += `${ref.city}: ${ref.publisher}.`;
	return str;
}

const generateAPAWebsite = ref => {
    var str = '';
    str += `${generateAPAAuthorList(ref.authors)} `;
    if(ref.pubDate) str += `(${ref.pubDate}). `;
    str += `${ref.title}, <i>${ref.siteTitle}</i>. Retrieved ${ref.accessDate} from ${ref.url}.`;
    return str;
}

const generateReference = ref => {
    switch(ref.type) {
        case 'Article': { return generateAPAArticle(ref); break; }
        case 'Book': { return generateAPABook(ref); break; }
        case 'Website': { return generateAPAWebsite(ref); }
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
