const express = require('express');
const snek = require('snekfetch');
const Sentry = require('winston-raven-sentry');
const {transports, createLogger, format} = require('winston');

const {
  combine, label, printf, colorize,
} = format;
const sums = require('../public/sums.json'); // eslint-disable-line import/no-unresolved

const serviceAPI = process.env.SERVICE_API_URL || 'https://api.tenno.tv/';
const publicDSN = process.env.RAVEN_DSN;
const privateDSN = process.env.RAVEN_DSN_PRIVATE;
const logLevel = process.env.LOG_LEVEL || 'error';
const ytApiKey = process.env.YT_API_KEY || '';
const ytClientId = process.env.YT_CLIENT_ID || '';

// Set up logger
const router = express.Router();
const consoleTransport = new transports.Console({colorize: true});
const sentry = new Sentry({dsn: privateDSN, level: logLevel});
const logFormat = printf(info => `[${info.label}] ${info.level}: ${info.message}`);
const logger = createLogger({
  format: combine(colorize(), label({label: 'Tenno.tv'}), logFormat),
  transports: [consoleTransport],
});

logger.add(sentry);

const deps = {
  router, logger, sums, serviceAPI, ravenDSN: publicDSN, ytApiKey, ytClientId,
};
logger.level = logLevel;

const url = `${serviceAPI}?method=get-content-creators`;

deps.creators = [];

// eslint-disable-next-line global-require
require('./routeSetups/root')(deps);

const setup = async () => {
  try {
    logger.log('debug', `Fetching creators: ${url}`);
    const fetched = await snek.get(url, {headers: {'content-type': 'application/json'}});
    deps.creators = fetched.body.map(creator => ({
      name: creator.account_name.replace(/\s/g, '').toLowerCase(),
      id: creator.author_id,
      nameDisp: creator.account_name,
      thumb: creator.youtube_thumbnail,
    }));
  } catch (error) {
    logger.log('error', error.stack);
  }
  /* eslint-disable global-require, import/no-dynamic-require */
  await require('./routeSetups/creators')(deps);
  await require('./routeSetups/videos')(deps);
  await require('./routeSetups/agreement')(deps);
  await require('./routeSetups/feedback')(deps);
  await require('./routeSetups/404')(deps);
  await require('./routeSetups/catchAll')(deps);
  /* eslint-enable global-require, import/no-dynamic-require */
};

setup();

module.exports = router;
