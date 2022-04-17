const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const ninjaRouter = require('./routes/ninja-routes');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/api/v1/ninjas', ninjaRouter);

module.exports = app;
