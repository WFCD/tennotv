const express = require('express');

const router = express.Router();
const {
  logger, sums, publicDSN,
} = require('../../assets/js/serverUtils');

router.get('/', (req, res) => {
  logger.silly(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.render('404', {title: '404 Error', sums, ravenDSN: publicDSN});
});

module.exports = router;
