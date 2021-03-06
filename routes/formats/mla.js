/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const { logger } = require('../../logger');
const moment = require('moment');
const { References } = require('../../models/reference');

/*
Author. Title. Title of container (self contained if book),
Other contributors (translators or editors),
Version (edition), Number (vol. and/or no.), Publisher, Publication Date,
Location (pages, paragraphs URL or DOI).
2nd container’s title, Other contributors, Version, Number, Publisher,
Publication date, Location, Date of Access (if applicable).
*/
const authorName = (author) => {
  let str = `${author.lastName}, ${author.firstName}`;
  if (author.middleName) str += ` ${author.middleName.charAt(0)}`;
  return str;
};

// If there are three or more authors, list only the first author followed by the phrase et al.
const authorList = (authors) => {
  if (authors.length < 1) return '';
  if (authors.length === 1) {
    return `${authorName(authors[0].author)}.`;
  } else if (authors.length === 2) {
    return `${authorName(authors[0].author)}, and ${authorName(authors[1].author)}.`;
  }
  return `${authorName(authors[0].author)}, et al.`;
};

const article = (ref) => {
  let str = authorList(ref.authors);
  str += ` "${ref.title}." <i>${ref.journal}</i>, ${ref.volume}, ${ref.issue}, ${ref.year}`;
  if (ref.pages) str += `. ${ref.pages}`;
  str += '.';
  return { data: ref, html: str };
};

const book = (ref) => {
  let str = authorList(ref.authors);
  str += ` <i>${ref.title}</i>. ${ref.publisher}, ${ref.year}.`;
  return { data: ref, html: str };
};

const website = (ref) => {
  // MLA does not allow http(s) in urls
  let url;
  if (ref.url) {
    url = ref.url.replace('http://', '').replace('https://', '');
  }
  let str = authorList(ref.authors);
  str += ` <i>${ref.title}</i>. ${ref.siteTitle}`;
  if (ref.pubDate) {
    const pubDate = moment(ref.pubDate).format('D MMM. YYYY');
    str += `, ${pubDate}`;
  }
  str += `, ${url}.`;
  if (ref.accessDate) {
    const accessDate = moment(ref.accessDate).format('D MMM. YYYY');
    str += ` Accessed ${accessDate}.`;
  }
  return { data: ref, html: str };
};

const generateReference = (ref) => {
  switch (ref.type) {
    case 'Article': return article(ref);
    case 'Book': return book(ref);
    case 'Website': return website(ref);
    default: return Error('Invalid type');
  }
};

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
};

router.get('/', isAuthenticated, (req, res) => {
  logger.log('info', `GET /refs/mla ${req}`);
  References
    .find({ user: req.user._doc.username })
    .exec()
    .then((refs) => {
      res.json({ refs: refs.map(ref => generateReference(ref)) });
    })
    .catch((err) => {
      logger.log('error', err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

module.exports = router;
