const snek = require('snekfetch');

let creators;
const contentCreators = async ({
  router, logger, sums, serviceAPI,
}) => {
  if (!creators) {
    const url = `${serviceAPI}?method=get-content-creators`;
    try {
      logger.log('debug', `Fetching creators: ${url}`);
      const fetched = await snek.get(url, {headers: {'content-type': 'application/json'}});
      creators = fetched.body;
    } catch (e) {
      logger.log('error', e.stack);
      creators = [];
    }
  }
  creators
    .map(creator => ({name: creator.account_name.replace(/\s/g, '').toLowerCase(), id: creator.author_id}))
    .forEach(creator => {
      logger.log('error', JSON.stringify(creator));
      router.get(`/${creator.name}`, (req, res) => {
        logger.log('silly', `Received ${req.method} request for ${req.orginalUrl} from ${req.connection.remoteAddress}`);
        res.render('index', {
          title: creator.name,
          sums,
          serviceAPI,
          limitToCreator: creator.id,
        });
      });
    });
};

module.exports = contentCreators;
