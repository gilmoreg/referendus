const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const compression = require('compression');
const { logger } = require('./logger');
const { PORT, DATABASE_URL } = require('./config');
const { router } = require('./routes');

const app = express();
mongoose.Promise = global.Promise;
let server;

// Middleware
app.use(compression({ level: 9, threshold: 0 }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('common', { stream: logger.stream }));
app.use(router);

app.use((err, req, res) => {
  logger.error(err);
  res.status(500).json({ error: 'Something went wrong' }).end();
});

const runServer = (databaseUrl = DATABASE_URL, port = PORT) =>
  new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, (err) => {
      if (err) return reject(err);
      server = app.listen(port, () => {
        logger.log(`Your app is listening on port ${port}`);
        return resolve();
      })
      .on('error', (mongooseError) => {
        mongoose.disconnect();
        return reject(mongooseError);
      });
      return server;
    });
  });

const closeServer = () =>
  mongoose.disconnect().then(() =>
    new Promise((resolve, reject) => {
      logger.log('Closing server');
      server.close((err) => {
        if (err) return reject(err);
        return resolve();
      });
    }));

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
