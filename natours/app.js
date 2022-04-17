const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

app.use(helmet());

// ROUTERS
const tourRouter = require('./routes/toursRoutes');
const usersRouter = require('./routes/usersRoutes');

// MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logger of req data
}
app.use(express.static(`${__dirname}/public`)); // serve static files
app.use(express.json()); // req body parser
app.use(express.urlencoded({ extended: false })); // parses for urlencoded data from forms and places it on the req.body

// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// ROUTES
app.use('/api/v1/tours', tourRouter); // mounting a router
app.use('/api/v1/users', usersRouter); // mounting a router

module.exports = app;
