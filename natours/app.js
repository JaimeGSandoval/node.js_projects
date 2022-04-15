const express = require('express');
const morgan = require('morgan');

const app = express();

// ROUTERS
const tourRouter = require('./routes/toursRoutes');
const usersRouter = require('./routes/usersRoutes');

// MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logger of req data
}
app.use(express.json()); // req body parser
app.use(express.static(`${__dirname}/public`)); // serve static files

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
