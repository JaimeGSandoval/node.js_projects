const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

// setup static and middleware
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './navbar-app/index.html'));
});

app.all('*', (req, res) => {
  res.status(404).send('resource not found');
});

app.listen(5000, () => {
  console.log('server is listening on port 5000....');
});
