const express = require('express');

const deps = require('../../assets/js/serverUtils');

const router = express.Router();

router.get('/force-creator-refresh', async (req, res) => {
  const before = deps.creators;
  deps.logger.log('debug', `Creators before: ${deps.creators.length}`);
  deps.creators = await deps.fetchCreators();
  deps.logger.log('debug', `Creators after: ${deps.creators.length}`);
  deps.setHeadersAndJson(res, {status: 'ok', message: `New creators: ${deps.creators.length - before.length}`});
  res.status(200).end();
});

module.exports = router;
