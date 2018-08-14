const request = require('supertest');
const path = require('path');
const favicon = require('serve-favicon');
const express = require('express');
const handlebars = require('express-handlebars');

const app = express();
const router = require('./routes/index');

const test = async () => {
  app.use(router);

  const hbs = handlebars.create({helpers: {json: JSON.stringify}, defaultLayout: 'main', extname: '.hbs'});

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.engine('.hbs', hbs.engine);
  app.set('view engine', '.hbs');

  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(express.static(path.join(__dirname, 'public')));

  describe('GET /', () => {
    it('redirects with 302', done => {
      request(app)
        .get('/')
        .expect(302)
        .end((err, res) => {
          if (err && res !== null) {
            return done(err);
          }
          return done();
        });
    });
  });
};

test();
