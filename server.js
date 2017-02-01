const bodyParser = require('body-parser');
var express = require('express');
var app = express();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const morgan = require('morgan');
const {logger} = require('./logger');



app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('common', {stream: logger.stream}));

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({error: 'Something went wrong'}).end();
});

const {PORT, DATABASE_URL} = require('./config');

function runServer() {
  return new Promise((resolve, reject) => {
    server = app.listen(PORT, () => {
      logger.log(`Your app is listening on port ${PORT}`);
      resolve(server);
    }).on('error', err => {
      reject(err)
    });
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    logger.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        // so we don't also call `resolve()`
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};