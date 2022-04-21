const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');

const indexRouter = require('./routes/index');
const movieRouter = require('./routes/movie');
const searchRouter = require('./routes/search');
const { ppid } = require('process');

const app = express();
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      imgSrc: ["'self'", 'https: data:'],
      defaultSrc: [
        "'self'",
        'https://*.googleapis.com/',
        'https://*.bootstrapcdn.com/',
        'https://*.gstatic.com/',
        'https://image.tmdb.org/',
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'maxcdn.bootstrapcdn.com',
        'ajax.googleapis.com',
      ],
    },
  })
);

app.use((req, res, next) => {
  if (req.query.api_key != 123456789) {
    res.status(401).json('Invalid API key');
  } else {
    next();
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/movie', movieRouter);
app.use('/search', searchRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
