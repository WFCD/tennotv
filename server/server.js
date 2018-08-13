/* eslint-disable import/no-unresolved */
const express = require('express');
const helmet = require('helmet');
const {transports, createLogger, format} = require('winston');

const {
  combine, label, printf, colorize,
} = format;
/* eslint-enable import/no-unresolved */

/* Routes */
const TennoTv = require('./routes/TennoTv');

const transport = new transports.Console({colorize: true});
const logFormat = printf(info => `[${info.label}] ${info.level}: ${info.message}`);
const logger = createLogger({
  format: combine(
    colorize(),
    label({label: 'API'}),
    logFormat,
  ),
  transports: [transport],
});
logger.level = process.env.LOG_LEVEL || 'error';

const setHeadersAndJson = (res, json) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range');
  res.setHeader('Access-Control-Expose-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range');
  res.json(json);
};

const deps = {
  logger,
  setHeadersAndJson,
};

const routes = {
  tennotv: new TennoTv('/', deps),
};

const app = express();
app.use(helmet());
app.use(express.json());

app.get('/', async (req, res) => {
  await routes.tennotv.handle(req, res, req.method.toLowerCase());
});

// oh no, nothing
app.use((req, res) => {
  res.status(404).end();
});

app.listen(process.env.PORT || 3001, process.env.HOSTNAME || '127.0.0.1');
