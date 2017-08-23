# referendus

A Thinkful Node Capstone Project
by [Grayson Gilmore](https://github.com/gilmoreg/).

[See the live site here](http://referendus.gilmoreg.com/).

## Screenshots
![referendus-screenshots](https://cloud.githubusercontent.com/assets/18176333/22914304/5e6e4e3e-f235-11e6-8c51-b1622ae48f38.png)

## Summary
Referendus allows you to store academic references (either articles, books, or websites), choose which of the major citation formats you require, and copy them in rich text to the clipboard, ready to paste into your own work.
Users can tag references and then search and copy only those references with that tag. The site also saves your choice of format for the next time you log in.
Creating accounts and signing in and out is quick and easy.

## Technical
* This is a full stack web app.
* The server side uses Node, Express, MongoDB and Passport.
    * API functions are tested with Mocha and Chai.
    * Authentiction is session-based and persistence stored.
    * Passwords are encrypted with bcrypt.
    * The user's format choice is stored in LocalStorage.
* The browser side uses HTML5, ES6 Javascript, and JQuery.
* Additionally, the site uses:
    * [Clipboard.js](https://www.npmjs.com/package/clipboard-js) for clipboard support.
    * [Bootstrap](http://getbootstrap.com/) for CSS and front end components.
    * [Bootswatch Spacelab](https://bootswatch.com/spacelab/) as a theme.
* Demo is hosted on [Amazon Lightsail](https://amazonlightsail.com/).

## Deployment
* Follow instructions [here](https://medium.com/@sharmasha2nk/aws-lightsail-bitnami-nodejs-letsencrypt-cf653573b8a1) for AWS Lightsail deployment.
* Create a file at project root called variables.js with the following content:
````
module.exports = {
  DATABASE_URL: 'mongodb://<MONGO USERNAME>:<MONGO PASSWORD>@<MONGO URL>:<MONGO PORT>/referendus',
  PORT: 3000,
  TEST_PORT: 5000,
};
````
* Globally install forever and nodemon:
````
    npm install -g forever nodemon
````
* Run npm start

## Development Roadmap
* Implement the ability to autofill fields for a new reference given an ISBN or DOI.
* Sorting reference lists