const Sentry = require('winston-raven-sentry');
const {transports, createLogger, format} = require('winston');
const fetch = require('node-fetch');

const sums = require('../../public/sums.json'); // eslint-disable-line import/no-unresolved

const {
  combine, label, printf, colorize,
} = format;

const serviceAPI = process.env.SERVICE_API_URL || 'https://api.tenno.tv/';
const privateDSN = process.env.RAVEN_DSN_PRIVATE;
const logLevel = process.env.LOG_LEVEL || 'error';

const consoleTransport = new transports.Console({colorize: true});
const sentry = new Sentry({dsn: privateDSN, level: logLevel});
const logFormat = printf(info => `[${info.label}] ${info.level}: ${info.message}`);
const logger = createLogger({
  format: combine(colorize(), label({label: 'Tenno.tv'}), logFormat),
  transports: [consoleTransport],
});

logger.add(sentry);

const creatorUrl = `${serviceAPI}?method=get-content-creators`;

module.exports = {
  setHeadersAndJson: (res, json) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range');
    res.setHeader('Access-Control-Expose-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range');
    res.json(json);
  },
  logger,
  fetchCreators: async () => {
    logger.log('debug', `Fetching creators: ${creatorUrl}`);
    const fetched = await fetch(creatorUrl).then(data => data.json());
    if (!fetched.length) {
      return [];
    }
    return fetched.map(creator => ({
      name: creator.account_name.replace(/\s/g, '').toLowerCase(),
      id: creator.author_id,
      nameDisp: creator.account_name,
      thumb: creator.youtube_thumbnail,
    }));
  },
  sums,
};
