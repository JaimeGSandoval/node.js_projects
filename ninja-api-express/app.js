const express = require('express');
const morgan = require('morgan');
const ninjaRouter = require('./routes/ninja-routes');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/ninjas', ninjaRouter);

module.exports = app;
