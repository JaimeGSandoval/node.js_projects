const express = require('express');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const assignID = (req, res, next) => {
  req.id = uuidv4();
  next();
};

morgan.token('id', function getID(req) {
  return req.id;
});

morgan.token('userData', function (req, res, next) {
  return 'userToken';
});

app.use(assignID);

// logs out:
// cdc0e639-2aa7-4909-b109-d9e529788cdb userToken GET 304 / HTTP/1.1
app.use(
  morgan(':id :userData :method :status :url HTTP/:http-version :res[header]')
);

// This will get the data from morgan and print it to a file name access.log
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flag: 'a' }
);

// use the accessLogStream with morgan and it's tokens. Here there's a mix of custom and built-in tokens. The custom tokens are ':id' and ':userData'
app.use(
  morgan(':id :userData :method :status :url HTTP/:http-version :res[header]', {
    stream: accessLogStream,
  })
);

app.get('/', (req, res) => {
  res.send('Morgan Logger App');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`I'm listening on port ${PORT}...`));
