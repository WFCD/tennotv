const express = require('express');

const router = express.Router();
const {logger} = require('../../assets/js/serverUtils');

router.get('/', (req, res) => {
  logger.silly(`Received ${req.method} request for ${req.originalUrl} from ${req.connection.remoteAddress}`);
  res.redirect('https://goo.gl/forms/SR6Mb0PKSsZ5ucTd2');
});

module.exports = router;
