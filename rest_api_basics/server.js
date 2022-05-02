const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// PRE-FLIGHT CHECK:
// You need to add some options which will pass a pre-flight check. A form submission will not require a pre-flight check, however any type of json request will.
app.options('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // "*" means allow all origins
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS'); // defines which https methods are allowed
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Length, X-Requested-With'
  ); // these are some common headers that are not set by defaults so we list them here
  res.send(200);
});

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.use(express.static('public'));
app.use(express.static('css'));

const timeRoutes = require('./routes/time');
const nameRoutes = require('./routes/name');
const jsonRoutes = require('./routes/json');
const echoAllRoutes = require('./routes/echo-all');

app.use('/routes/time', timeRoutes);
app.use('/routes/name', nameRoutes);
app.use('/routes/json', jsonRoutes);
app.use('/routes/echo-all', echoAllRoutes);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/form', (req, res) => {
  res.sendFile(__dirname + '/views/form.html');
});

app.get('/:word/echo', (req, res) => {
  res.json({ echo: req.params.word });
});

app.all('*', (req, res) => {
  res.send('Invalid route');
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
