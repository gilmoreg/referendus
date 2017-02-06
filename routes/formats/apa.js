const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {logger} = require('../../logger');
const moment = require('moment');
const {References/*, Articles, Books, Websites*/} = require('../../models/reference');
const passport = require('passport');

const res400Err = (msg, res) => {
    logger.log('error',msg);
    return res.status(400).send(msg);
}

// https://owl.english.purdue.edu/owl/resource/560/06/
const apaName = author => {
	let str = `${author.lastName}, ${author.firstName.charAt(0)}.`;
	if(author.middleName) str += ` ${author.middleName.charAt(0)}.`;
	return str;
}

const authorList = authors => {
	if(authors.length<1) return '';
	let str='';
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
		for(let i=0; i<authors.length-1;i++) {
			str += `${apaName(authors[i].author)}, `;
		}
		str += `& ${apaName(authors[authors.length-1].author)}. `;
	}
	// More than 7 authors
	else if(authors.length>7) {
		for(let i=0; i<6;i++) {
			str += `${apaName(authors[i].author)}, `;
		}
		str += `. . . ${apaName(authors[authors.length-1].author)}`;
	}
	return str;
}

const article = ref => {
	let str = `${authorList(ref.authors)} `;
	str += `(${ref.year}). ${ref.title}. <i>${ref.journal}</i>, `;
	str += '<i>' + ref.volume + '</i>';
	if(ref.pages) str += `, ${ref.pages}.`;
	else str += '.';
	return { data:ref, html:str };
}

const book = ref => {
	let str = `${authorList(ref.authors)} (${ref.year}). <i>${ref.title}</i>. ${ref.city}: ${ref.publisher}.`;
	return { data:ref, html:str };
}

const website = ref => {
	const authors = authorList(ref.authors);
	let str = '';
	let pubDate = '';
    if(ref.pubDate) pubDate = moment(ref.pubDate).format('YYYY, MMMM D');
	else pubDate = 'n.d.';
    const accessDate = moment(ref.accessDate).format('YYYY, MMMM D');
	// Author, A. (date). Title of document. Retrieved from http://URL
	if(authors) {
		str += `${authors} (${pubDate}). ${ref.title},`;
	}
	// If no author, title moves to the front
	else {
		str += `${ref.title}. (${pubDate}).`;
	}
	str += ` <i>${ref.siteTitle}</i>. Retrieved ${accessDate} from ${ref.url}.`;
    
    return { data:ref, html:str };
}

const generateReference = ref => {
    switch(ref.type) {
        case 'Article': { return article(ref); break; }
        case 'Book': { return book(ref); break; }
        case 'Website': { return website(ref); }
    }
}

router.get('/', passport.authenticate('local'), (req, res) => {
	logger.log('info',`GET /refs/apa ${req}`);
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
