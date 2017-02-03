const bodyParser = require('body-parser');
var express = require('express');
var app = express();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const morgan = require('morgan');
const {logger} = require('./logger');
const {PORT, DATABASE_URL} = require('./config');

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('common', {stream: logger.stream}));

const refRouter = require('./routes/refs');
const apaRouter = require('./routes/apa');
const chicagoRouter = require('./routes/chicago');
const mlaRouter = require('./routes/mla');

app.use('/refs', refRouter);
app.use('/refs/apa', apaRouter);
app.use('/refs/chicago', chicagoRouter);
//app.use('/refs/mla', mlaRouter);

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({error: 'Something went wrong'}).end();
});

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        logger.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       logger.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};