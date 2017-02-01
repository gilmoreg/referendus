const mongoose = require('mongoose');

const options = { discriminatorKey: 'type' };

const refSchema = mongoose.Schema( {
    type: { type: String, required:true },
    title: { type: String, required:true },
    tags: [ { tag:String } ],
    id: String,
    notes: String
}, options);

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

/*refSchema.virtual('authorFullName').get( function() {
  return `${this.author.firstName} ${this.author.lastName}`;
});*/

refSchema.methods.json = function() {
  return {
      title: this.title
/*
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorFullName,
        created: this.created
  */  
  };
};

// "type" will refer to the model name, i.e. 'Book' or 'Article' etc.
const References = mongoose.model('Reference', refSchema);
const Books = References.discriminator('Book', bookSchema);
const Articles = References.discriminator('Article', articleSchema);
const Websites = References.discriminator('Website', websiteSchema);

module.exports = {References, Articles, Books, Websites};