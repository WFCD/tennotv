const root = ({
  router, logger, sums, serviceAPI,
}) => {
  router.get('/', (req, res) => {
    logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
    res.render('index', {
      title: 'Index', sums, serviceAPI, limitToCreator: 0,
    });
  });
};

module.exports = root;
