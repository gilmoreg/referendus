const express = require('express');
const router = express.Router();
const {logger} = require('../../logger');
const moment = require('moment');
const {References/*, Articles, Books, Websites*/} = require('../../models/reference');

const res400Err = (msg, res) => {
    logger.log('error',msg);
    return res.status(400).send(msg);
};

// http://www.press.uchicago.edu/books/turabian/turabian_citationguide.html
const lastFirst = author => {
    let str = `${author.lastName}, ${author.firstName}`;
    if(author.middleName) str += ` ${author.middleName.charAt(0)}`;   
    return str;
};

const firstLast = author => {
    let str = author.firstName;
    if(author.middleName) str += `${author.middleName.charAt(0)}.`;
    str += ` ${author.lastName}`;
    return str;
};

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
        return str;
    }
};

const article = ref => {
	var str = authorList(ref.authors);
    str += ` "${ref.title}." <i>${ref.journal}</i> ${ref.volume}, no. ${ref.issue} (${ref.year})`;
    if(ref.pages) str += `: ${ref.pages}.`;
    else str += '.';
	return { data:ref, html:str };
};

const book = ref => {
	var str = authorList(ref.authors);
    str += `, <i>${ref.title}</i> (${ref.city}: ${ref.publisher}, ${ref.year})`;
    if(ref.pages) str += `, ${ref.pages}`;
    str += '.';
	return { data:ref, html:str };
};

const website = ref => {
	const authors = authorList(ref.authors);
    let str = '';
    if(authors) str += `${authors}. `;
    str += `"${ref.title}." ${ref.siteTitle}. `;
    if(ref.pubDate) {
        const pubDate = moment(ref.pubDate).format('MMMM D, YYYY');
        str += `Last modified ${pubDate}. `;
    }
    if(ref.accessDate) {
        const accessDate = moment(ref.accessDate).format('MMMM D, YYYY');
        str += `Accessed ${accessDate}. `;
    }
    str += `${ref.url}.`;
	return { data:ref, html:str };
};

const generateReference = ref => {
    switch(ref.type) {
        case 'Article': { return article(ref); }
        case 'Book': { return book(ref); }
        case 'Website': { return website(ref); }
    }
};

const isAuthenticated = (req, res, next) => {
	if(req.isAuthenticated()){
        return next();
    } else{
		res.redirect('/');
    }
};

router.get('/', isAuthenticated, (req, res) => {
	logger.log('info',`GET /refs/chicago ${req}`);

    References
		.find({'user':req.user._doc.username})
		.exec() 
		.then( (refs) => {
			res.json({refs: refs.map((ref)=>{return generateReference(ref);})});
		})
		.catch( err => {
			logger.log('error',err);
			res.status(500).json({message:'Internal server error'});
		});
});

router.get('/search/:tag', isAuthenticated, (req, res) => {
	logger.log('info',`GET /refs/apa/search ${req}`);
	if(!req.params.tag) return res400Err('Missing "tag" in params');
	References
		.find({'user':req.user._doc.username, 'tag':req.params.tag})
		.exec() 
		.then( (refs) => {
			res.json({refs: refs.map((ref)=>{return generateReference(ref);})});
		})
		.catch( err => {
			logger.log('error',err);
			res.status(500).json({message:'Internal server error'});
		});
});

module.exports = router;