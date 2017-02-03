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
const cName = author => {
    let str = `${author.lastName}, ${author.firstName}`;
    if(author.middleName) str += `${author.middleName.charAt(0)}`;
    return str;
}

const authorList = authors => {
    if(authors.length<1) return '';
    if(authors.length===1) {
        return `${cName(authors[0])}.`;
    }
    else {
        let str='';
        // Last author has to be preceded by 'and', so count up to penultimate only
        for(let i=0;i<authors.length-1;i++) {
            str += `${cName(authors[i])}, `;
        }
        str += `and ${cName(authors[authors.length])}.`;
    }
}

const article = ref => {
	var str = '';
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

module.exports = router;