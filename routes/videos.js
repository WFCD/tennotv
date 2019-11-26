const router = require('express').Router();
const {
  logger, sums, api, creators, ytKey, ytId,
} = require('../assets/js/serverUtils');

router.get('/:videoId', (req, res) => {
  logger.silly(`Received ${req.method} request for ${req.path} from ${req.connection.remoteAddress}`);
  res.render('index', {
    sums,
    serviceAPI: api,
    initialVideo: req.params.videoId,
    creators,
    ytApiKey: ytKey,
    ytClientId: ytId,
  });
});

module.exports = router;
