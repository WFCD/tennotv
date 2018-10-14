const express = require('express');
const {
  setHeadersAndJson, fetchCreators, logger, sums,
} = require('../assets/js/serverUtils');

const serviceAPI = process.env.SERVICE_API_URL || 'https://api.tenno.tv/';
const publicDSN = process.env.RAVEN_DSN;

// Set up logger
const router = express.Router();

const deps = {
  router, logger, sums, serviceAPI, ravenDSN: publicDSN,
};

deps.creators = [];

// eslint-disable-next-line global-require
require('./routeSetups/root')(deps);

const setup = async () => {
  try {
    deps.creators = await fetchCreators();
  } catch (error) {
    logger.log('error', error.stack);
  }
  /* eslint-disable global-require, import/no-dynamic-require */
  await require('./routeSetups/creators')(deps);
  await require('./routeSetups/videos')(deps);
  await require('./routeSetups/agreement')(deps);
  await require('./routeSetups/feedback')(deps);

  router.get('/force-creator-refresh', async (req, res) => {
    const before = deps.creators;
    logger.log('debug', `Creators before: ${deps.creators.length}`);
    deps.creators = await fetchCreators();
    logger.log('debug', `Creators after: ${deps.creators.length}`);
    setHeadersAndJson(res, {status: 'ok', message: `New creators: ${deps.creators.length - before.length}`});
    res.status(200).end();
  });

  await require('./routeSetups/404')(deps);
  await require('./routeSetups/catchAll')(deps);
  /* eslint-enable global-require, import/no-dynamic-require */
};

setup();

module.exports = router;
