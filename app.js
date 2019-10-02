const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');

const app = express();
const server = require('http').Server(app);

const hbs = handlebars.create({helpers: {json: JSON.stringify}, defaultLayout: 'main', extname: '.hbs'});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// favicon and caching options (cache is 7 days)
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 604800000}));

/* Express setup */
if (process.env.SENTRY_DSN) {
  // eslint-disable-next-line global-require
  const Sentry = require('@sentry/node');
  Sentry.init({dsn: process.env.RAVEN_DSN});
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
}

// default node js includes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('./routes'));

const port = process.env.PORT || 3002;
const host = process.env.HOSTNAME || process.env.HOST || process.env.IP || 'localhost';
server.listen(port, host);

module.exports = app;
