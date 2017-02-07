const mongoose = require('mongoose');

/*const options = { discriminatorKey: 'type' };*/

const refSchema = mongoose.Schema( {
    user: { type: String, required:true },
    type: { type: String, required:true },
    title: { type: String, required:true },
    tags: [ { tag:String } ],
    identifier: String,
    notes: String,
    // --- From here on ---
    // if I can get discriminators to work, these will go in separate schemas 
    // (see commented code below)
    // For articles
    authors: [{
                author: {
                    firstName: String,
                    middleName: String,
                    lastName: String,
                }
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
    pubDate: Date
}/*, options*/);

/*
const articleSchema = mongoose.Schema( {
    authors: 
        { type: [{
            author: {
                firstName: String,
                middleName: String,
                lastName: String,
            }
        }], required:true 
    },
    year: { type: Number, required:true },
    volume: { type: Number, required:true },
    issue: { type:Number, required:true },
    pages: { type:String, required:true },
    url: String
}, options);

const bookSchema = mongoose.Schema( {
    authors: 
        { type: [{
            author: {
                firstName: String,
                middleName: String,
                lastName: String,
            }
        }], required:true 
    },
    city: { type:String, required:true },
    publisher: { type:String, required:true },
    year: { type:Number, required:true },
    edition: String,
    url:String
}, options);

const websiteSchema = mongoose.Schema( {
    authors: [{
            author: {
                firstName: String,
                middleName: String,
                lastName: String,
            }
        }],
    siteTitle: { type:String, required:true },
    accessDate: { type:Date, required:true },
    pubDate: Date,
    url: { type:String, required:true }
}, options);
*/
/*refSchema.virtual('authorFullName').get( function() {
  return `${this.author.firstName} ${this.author.lastName}`;
});*/

refSchema.methods.json = function() {
    let jsonObj = {
        id: this._id,
        title: this.title,
        type: this.type
    };
    // TODO if I can make discriminators work this shouldn't be necessary here
    // TODO this might not work with arrays
    if(this.authors) jsonObj.authors = this.authors;
    if(this.tags) jsonObj.tags = this.tags;
    if(this.identifier) jsonObj.identifier = this.identifier;
    if(this.notes) jsonObj.notes = this.notes;
    if(this.journal) jsonObj.journal = this.journal;
    if(this.year) jsonObj.year = this.year;
    if(this.volume) jsonObj.volume = this.volume;
    if(this.issue) jsonObj.issue = this.issue;
    if(this.pages) jsonObj.pages = this.pages;
    if(this.url) jsonObj.url = this.url;
    if(this.city) jsonObj.city = this.city;
    if(this.publisher) jsonObj.publisher = this.publisher;
    if(this.edition) jsonObj.edition = this.edition;
    if(this.siteTitle) jsonObj.siteTitle = this.siteTitle;
    if(this.accessDate) jsonObj.accessDate = this.accessDate;
    if(this.pubDate) jsonObj.pubDate = this.pubDate;

    return jsonObj;
};

const References = mongoose.model('Reference', refSchema, 'references');
/*
// "type" will refer to the model name, i.e. 'Book' or 'Article' etc.
const Books = References.discriminator('Book', bookSchema);
const Articles = References.discriminator('Article', articleSchema);
const Websites = References.discriminator('Website', websiteSchema);
*/
module.exports = {References/*, Articles, Books, Websites*/};