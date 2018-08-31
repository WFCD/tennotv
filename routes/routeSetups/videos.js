const videos = async ({
  router, logger, sums, serviceAPI, ravenDSN,
}) => {
  router.get('/v/:videoId', (req, res) => {
    logger.log('silly', `Received ${req.method} request for ${req.orginalUrl} from ${req.connection.remoteAddress}`);
    res.render('index', {
      sums,
      serviceAPI,
      initialVideo: req.params.videoId,
      ravenDSN,
    });
  });
};

module.exports = videos;
