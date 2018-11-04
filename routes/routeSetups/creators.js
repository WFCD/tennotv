const contentCreators = async ({
  router, logger, sums, serviceAPI, creators, ravenDSN, ytApiKey, ytClientId,
}) => {
  creators
    .forEach(creator => {
      router.get(`/${creator.name}`, (req, res) => {
        logger.log('silly', `Received ${req.method} request for ${req.orginalUrl} from ${req.connection.remoteAddress}`);
        res.render('index', {
          title: creator.nameDisp,
          sums,
          serviceAPI,
          limitToCreator: creator.id,
          creators,
          ravenDSN,
          ytApiKey,
          ytClientId,
        });
      });
    });
};

module.exports = contentCreators;
