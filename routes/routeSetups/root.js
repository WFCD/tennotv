const root = ({
  router, logger, sums, serviceAPI, creators, ytApiKey, ytClientId,
}) => {
  router.get('/', (req, res) => {
    logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
    res.render('dashboard', {
      sums, serviceAPI, limitToCreator: 0, creators, ytApiKey, ytClientId,
    });
  });
};

module.exports = root;
