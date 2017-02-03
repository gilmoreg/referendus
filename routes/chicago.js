const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const morgan = require('morgan');
const {logger} = require('../logger');
const {References/*, Articles, Books, Websites*/} = require('../models/reference');

// http://www.press.uchicago.edu/books/turabian/turabian_citationguide.html
const res400Err = (msg, res) => {
    logger.log('error',msg);
    return res.status(400).send(msg);
}

const cName = (author) => {

}

const generateChicagoArticle = ref => {
	var str = '';
	return str;
}

const generateChicagoBook = ref => {
	var str = '';
	return str;
}

const generateChicagoWebsite = ref => {
	var str = '';
	return str;	
}

module.exports = router;