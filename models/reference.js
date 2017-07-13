/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

const refSchema = mongoose.Schema({
  user: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  tags: [{ tag: String }],
  identifier: String,
  notes: String,
  authors: [{
    author: {
      firstName: String,
      middleName: String,
      lastName: String,
    },
  }],
  journal: String,
  year: Number,
  volume: String,
  issue: String,
  pages: String,
  url: String,
  // For Books
  city: String,
  publisher: String,
  edition: String,
  // For Websites
  siteTitle: String,
  accessDate: Date,
  pubDate: Date,
});

refSchema.methods.json = function () { // eslint-disable-line func-names
  const jsonObj = {
    id: this._id,
    title: this.title,
    type: this.type,
  };
  if (this.authors) jsonObj.authors = this.authors;
  if (this.tags) jsonObj.tags = this.tags;
  if (this.identifier) jsonObj.identifier = this.identifier;
  if (this.notes) jsonObj.notes = this.notes;
  if (this.journal) jsonObj.journal = this.journal;
  if (this.year) jsonObj.year = this.year;
  if (this.volume) jsonObj.volume = this.volume;
  if (this.issue) jsonObj.issue = this.issue;
  if (this.pages) jsonObj.pages = this.pages;
  if (this.url) jsonObj.url = this.url;
  if (this.city) jsonObj.city = this.city;
  if (this.publisher) jsonObj.publisher = this.publisher;
  if (this.edition) jsonObj.edition = this.edition;
  if (this.siteTitle) jsonObj.siteTitle = this.siteTitle;
  if (this.accessDate) jsonObj.accessDate = this.accessDate;
  if (this.pubDate) jsonObj.pubDate = this.pubDate;

  return jsonObj;
};

const References = mongoose.model('Reference', refSchema, 'references');

module.exports = { References };
