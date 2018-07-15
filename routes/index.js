// Routing page for pages on the root level

const express = require('express');
const {transports, createLogger, format} = require('winston');

const {
  combine, label, printf, colorize,
} = format;
const sums = require('../public/sums.json'); // eslint-disable-line import/no-unresolved

const serviceAPI = process.env.SERVICE_API_URL || 'https://api.warframestat.us/tennotv';

// Set up logger
const router = express.Router();
const transport = new transports.Console({colorize: true});
const logFormat = printf(info => `[${info.label}] ${info.level}: ${info.message}`);
const logger = createLogger({
  format: combine(
    colorize(),
    label({label: 'Tenno.tv'}),
    logFormat,
  ),
  transports: [transport],
});

const deps = {
  router, logger, sums, serviceAPI,
};
logger.level = process.env.LOG_LEVEL || 'error';
// Route Setups
[
  './routeSetups/root', './routeSetups/creators',
  './routeSetups/agreement', './routeSetups/feedback',
  './routeSetups/404',
].forEach(async setup => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  await require(setup)(deps);
});

// eslint-disable-next-line no-shadow
setTimeout(deps => {
  // eslint-disable-next-line global-require
  require('./routeSetups/catchAll')(deps);
}, 60000, deps);

module.exports = router;
