'use strict';

const fetch = require('node-fetch');

const root = ({
  router, logger, sums, serviceAPI, creators, ytApiKey, ytClientId,
}) => {
  router.get('/', async (req, res) => {
    logger.log('silly', `Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
    const dashPlaylists = (await fetch(`${serviceAPI}dashboard`)
      .then(data => data.json()));

    const playlists = {
      creators: dashPlaylists.creators.map(account => ({
          name: account.account_name,
          id: account.account_name.replace(/ /g, '_').toLowerCase(),
          playlist: account.playlist,
          link: account.account_name.replace(/\s/ig, ''),
        })),
      categories: dashPlaylists.categories.map(category => ({
          name: category.raw_synonym_phrase.toUpperCase(),
          id: category.raw_synonym_phrase,
          playlist: category.playlist,
          link: '',
        })),
    };

    res.render('dashboard', {
      sums, serviceAPI, limitToCreator: 0, creators, ytApiKey, ytClientId, playlists
    });
  });
};

module.exports = root;
