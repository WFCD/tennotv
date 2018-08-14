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
  format: combine(colorize(), label({label: 'Tenno.tv'}), logFormat),
  transports: [transport],
});

const deps = {
  router, logger, sums, serviceAPI,
};
logger.level = process.env.LOG_LEVEL || 'error';

const url = `${serviceAPI}?method=get-content-creators`;

deps.creators = [];

// auto-redirect to https
router.use((req, res, next) => {
  if (req.secure) {
    // request was via https, so do no special handling
    next();
  } else {
    // request was via http, so redirect to https
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
});

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
