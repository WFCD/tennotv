const feedback = ({router, logger}) => {
  router.get('/feedback', (req, res) => {
    logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
    res.redirect('https://goo.gl/forms/SR6Mb0PKSsZ5ucTd2');
  });
};

module.exports = feedback;
