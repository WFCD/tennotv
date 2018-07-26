const videos = async ({
  router, logger, sums, serviceAPI,
}) => {
  router.get('/v/:videoId', (req, res) => {
    logger.log('silly', `Received ${req.method} request for ${req.orginalUrl} from ${req.connection.remoteAddress}`);
    res.render('index', {
      sums,
      serviceAPI,
      initialVideo: req.params.videoId,
    });
  });
};

module.exports = videos;
