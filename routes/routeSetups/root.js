'use strict';

const fetch = require('node-fetch');

const root = ({
  router, logger, sums, serviceAPI, creators, ytApiKey, ytClientId,
}) => {
  router.get('/', async (req, res) => {
    logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
    const creatorData = (await fetch(`${serviceAPI}dashboard`)
      .then(data => data.json()))

    const playlists = {
      creators: creatorData.map(account => ({
          name: account.account_name,
          id: account.account_name.replace(/ /g, '_').toLowerCase(),
          playlist: account.playlist,
          link: account.account_name.replace(/\s/ig, ''),
        })),
    }

    res.render('dashboard', {
      sums, serviceAPI, limitToCreator: 0, creators, ytApiKey, ytClientId, playlists
    });
  });
};

module.exports = root;
