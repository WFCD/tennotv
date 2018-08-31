const route404 = ({
  router, logger, sums, ravenDSN,
}) => {
  router.get('/404', (req, res) => {
    logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
    res.render('404', {title: '404 Error', sums, ravenDSN});
  });
};

module.exports = route404;
