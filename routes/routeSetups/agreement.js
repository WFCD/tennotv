const agreement = ({router, logger}) => {
  router.get('/agreement', (req, res) => {
    logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
    res.redirect('https://goo.gl/forms/JYcN10X5lZTrxYWa2');
  });
};

module.exports = agreement;
