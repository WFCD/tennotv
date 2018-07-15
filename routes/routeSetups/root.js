const root = ({
  router, logger, sums, serviceAPI, creators,
}) => {
  router.get('/', (req, res) => {
    logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
    res.render('index', {
      title: 'Index', sums, serviceAPI, limitToCreator: 0, creators,
    });
  });
};

module.exports = root;
