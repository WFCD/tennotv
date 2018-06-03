// Routing page for pages on the root level

const express = require('express');
const winston = require('winston');

const router = express.Router();

const sums = require('../public/sums.json'); // eslint-disable-line import/no-unresolved

winston.level = process.env.LOG_LEVEL || 'error'; // default to error, we don't need everything

router.get('/', (req, res) => {
  winston.info(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('index', {title: 'Index', sums});
});

router.get('/404', (req, res) => {
  winston.info(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', {title: '404 Error', sums});
});

router.get('*', (req, res) => {
  winston.error(`ABNORMAL ${req.method} REQUEST for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', {title: '404 Error', sums});
});

module.exports = router;
