const contentCreators = async ({
  router, logger, sums, serviceAPI, creators,
}) => {
  creators
    .forEach(creator => {
      router.get(`/${creator.name}`, (req, res) => {
        logger.log('silly', `Received ${req.method} request for ${req.orginalUrl} from ${req.connection.remoteAddress}`);
        res.render('index', {
          title: creator.name,
          sums,
          serviceAPI,
          limitToCreator: creator.id,
          creators,
        });
      });
    });
};

module.exports = contentCreators;
