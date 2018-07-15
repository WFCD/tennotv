const catchAll = ({router, logger, sums}) => {
  router.get('*', (req, res) => {
    logger.log('error', `ABNORMAL ${req.method} REQUEST for ${req.originalUrl} from ${req.connection.remoteAddress}`);
    res.render('404', {title: '404 Error', sums});
  });
  logger.log('error', 'Set up Catch-all');
};

module.exports = catchAll;
