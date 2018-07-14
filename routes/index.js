// Routing page for pages on the root level

const express = require('express');
const winston = require('winston');

const router = express.Router();
const logger = winston.createLogger();
logger.add(new winston.transports.Console());

const sums = require('../public/sums.json'); // eslint-disable-line import/no-unresolved

logger.level = process.env.LOG_LEVEL || 'error'; // default to error, we don't need everything

router.get('/', (req, res) => {
  logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('index', {
    title: 'Index', sums, serviceAPI: process.env.SERVICE_API_URL || 'https://api.warframestat.us/tennotv',
  });
});

router.get('/agreement', (req, res) => {
  logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.redirect('https://goo.gl/forms/JYcN10X5lZTrxYWa2');
});

router.get('/404', (req, res) => {
  logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', {title: '404 Error', sums});
});

router.get('*', (req, res) => {
  logger.log('error', `ABNORMAL ${req.method} REQUEST for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', {title: '404 Error', sums});
});

module.exports = router;
