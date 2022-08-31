const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/app-error');
const globalErrorHandler = require('./controllers/error-controller');
const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');

const app = express();

// GLOBAL MIDDLEWARES

// SET SECURITY HTTP HEADERS
// use helmet early in the middleware stack so that headers are set for sure
app.use(helmet());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMIT REQUESTS FROM SAME IP
// rate limiting prevents the same IP from making too many requests to our API. This will help prevent attacks like denial of service or brute force attacks. If the app crashes or restarts, it resets the rate limit back to 100
const rateLimiter = rateLimit({
  max: 100, // allows 100 requests per hour
  // minutes * seconds * milliseconds to equal an hour
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour.',
});

app.use('/api', rateLimiter);

// BODY PARSER
app.use(
  express.json({
    limit: '10kb', // limit the amount of data that comes in the body
  })
);

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
// {$gt: {''}} example of nosql query injection. instead of signing up with an email, someone could use this and if the attacker has  a valid password that's easy to figure out, they could be signed up and given a password token. This happens because{$gt:{}} evaluates to true
app.use(mongoSanitize()); // looks at request body, request string and request params and will filter out all of the dollar signs and dots because that's how mongo DB queries are written. By removing them the operators will no longer work and nullify the attack

// DATA SANITIZATION AGAINST XSS ATTACKS
app.use(xss()); // cleans any user input from malicious html code ie some malicious html code with js attached to it. if it were to be injected into pour html, it could cause damage. xss-clean will turn any html into an html entity.
// So "<div id='bad code'>Name</div>" turns into "&lt;div id='bad code'>Name&lt;/div>"

// *** whenever you can, add some validation to your mongo schemas and that should mostly protect you from xss on the server side

// PREVENT PARAMETER POLLUTION
// hpp -> http parameter pollution
// if in the query you send ?sort=duration&sort=price then express will create an array with the two values. this is a problem that attackers ca make use of
// this will remove the duplicate fields in the query
app.use(
  hpp({
    // you can make a white list of fields that can have duplicates in the url query
    whitelist: [
      'duration',
      'ratingsQuality',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// SERVING STATIC FILES
app.use(express.static(`${__dirname}/public`));

// TEST MIDDLEWARE
app.use((req, res, next) => {
  // console.log(x); this will cause an uncaught exception error. Any middleware in express will automatically go to the error handling middleware with that error.So any error in middleware will automatically go to the error handling in error-controller.js
  // console.log(x);

  // add a property called requestTime to the request obj
  req.requestTime = new Date().toISOString();
  next();
});

// console.log(x);

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // whatever gets passed into next(), express will know/assume it's an error. This applies for all next() in any part of the app. So express will then skipp all the othr middleware in the middleware stack and set the error that we passed in to our global error handling middleware which will then be executed

  // this code would be placed and used in each catch block to handle each error in a handler, but using a class is better so you don't have to repeat the code
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);

  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// example of error handling middleware without using global handler class
// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });
app.use(globalErrorHandler);

module.exports = app;
