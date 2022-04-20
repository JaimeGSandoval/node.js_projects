const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');

const indexRouter = require('./routes/index');

const app = express();

// Works for bot CDNs and images
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

// works for both CDNs and images
// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//     crossOriginEmbedderPolicy: false,
//   })
// );

// doesn't work for images or CDNs
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
//         fontSrc: ["'self'", 'https:', 'data:'],
//         imgSrc: ["'self'", 'https://image.tmdb.org'],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         blockAllMixedContent: [],
//         upgradeInsecureRequests: [],
//         baseUri: ["'self'"],
//         frameAncestors: ["'self'"],
//       },
//     },
//   })
// );

// works for images but not CDNs
// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//       'img-src': ["'self'", 'https: data:'],
//     },
//   }),
//   helmet.crossOriginResourcePolicy({
//     policy: 'cross-origin',
//   })
// );

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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
