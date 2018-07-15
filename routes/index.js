// Routing page for pages on the root level

const express = require('express');
const snek = require('snekfetch');
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

const url = `${serviceAPI}?method=get-content-creators`;

logger.log('debug', `Fetching creators: ${url}`);
snek.get(url, {headers: {'content-type': 'application/json'}})
  .then(async fetched => {
    deps.creators = fetched.body.map(creator => ({
      name: creator.account_name.replace(/\s/g, '').toLowerCase(),
      id: creator.author_id,
      nameDisp: creator.account_name,
      thumb: creator.youtube_thumbnail,
    }));

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
  })
  .catch(error => {
    logger.log('error', error.stack);
  });

module.exports = router;
