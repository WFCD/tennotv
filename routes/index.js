const router = require('express').Router();
const deps = require('../assets/js/serverUtils');

const { logger, setHeadersAndJson, sums, publicDSN, api, fetchCreators } = deps;

router.use('/', require('./routeSetups/dashboard'));

router.get(`/:creator(${deps.creators.map(c => c.name).join('|')})`, (req, res) => {
  const creator = deps.creators.find(c => c.name === req.params.creator);

  logger.silly(`Received ${req.method} request for ${req.orginalUrl}`);
  res.render('index', {
    title: creator.nameDisp,
    sums,
    serviceAPI: api,
    limitToCreator: creator.id,
    creators: deps.creators,
    ravenDSN: publicDSN,
    ytApiKey: ytKey,
    ytClientId: ytId,
  });
});

router.use('/v', require('./routeSetups/videos'));
router.use('/agreement', require('./routeSetups/agreement'));
router.use('/feedback', require('./routeSetups/feedback'));

router.use('/force-creator-refresh', require('./routeSetups/creatorRefresh'));
router.use('/404', require('./routeSetups/404'));
router.use(require('./routeSetups/404'));

const setup = async () => {
  try {
    deps.creators = await fetchCreators();
  } catch (error) {
    logger.error(error.stack);
  }
};
setup();

module.exports = router;
