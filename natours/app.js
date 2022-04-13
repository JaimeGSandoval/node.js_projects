const express = require('express');

const app = express();
const morgan = require('morgan');

// ROUTERS
const tourRouter = require('./routes/toursRoutes');
const usersRouter = require('./routes/usersRoutes');

console.log(process.env.NODE_ENV);

// MIDDLEWARE
if (process.env.NODE_ENV === 'development') {
  console.log('bankai');
  app.use(morgan('dev')); // logger of req data
}
app.use(express.json()); // req body parser
app.use(express.static(`${__dirname}/public`)); // serve static files

app.use((req, res, next) => {
  // console.log('Hello from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter); // mounting a router
app.use('/api/v1/users', usersRouter); // mounting a router

// SERVER

module.exports = app;
