const fetch = require('node-fetch');
const router = require('express').Router();
const {
  logger, sums, api, creators, ytKey, ytId,
} = require('../../assets/js/serverUtils');

router.get('/', async (req, res) => {
  logger.silly(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  const dashPlaylists = (await fetch(`${api}dashboard`)
    .then(data => data.json()));

  const playlists = {
    creators: (dashPlaylists.creators || []).map(account => ({
      name: account.account_name,
      id: account.account_name.replace(/ /g, '_').toLowerCase(),
      playlist: account.playlist,
      link: account.account_name.replace(/\s/ig, ''),
    })),
    categories: (dashPlaylists.categories || []).map(category => ({
      name: category.raw_synonym_phrase.toUpperCase(),
      id: category.raw_synonym_phrase.replace(/ /g, '_').toLowerCase(),
      playlist: category.playlist,
      link: '',
    })),
  };

  res.render('dashboard', {
    sums,
    serviceAPI: api,
    limitToCreator: 0,
    creators,
    ytApiKey: ytKey,
    ytClientId: ytId,
    playlists,
  });
});

module.exports = router;
