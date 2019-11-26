const router = require('express').Router();
const deps = require('../assets/js/serverUtils');

const {
  logger, sums, publicDSN, api, fetchCreators, ytKey, ytId,
} = deps;

router.use('/', require('./dashboard'));

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

router.use('/v', require('./videos'));
router.use('/agreement', require('./agreement'));
router.use('/feedback', require('./feedback'));

router.use('/force-creator-refresh', require('./creatorRefresh'));
router.use('/404', require('./404'));
router.use(require('./404'));

const setup = async () => {
  try {
    deps.creators = await fetchCreators();
  } catch (error) {
    logger.error(error.stack);
  }
};
setup();

module.exports = router;
