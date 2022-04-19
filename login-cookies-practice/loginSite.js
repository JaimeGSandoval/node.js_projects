require('dotenv/config');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

app.use(helmet());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // gets form data and places it on req.body
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req, res, next) => {
  res.send('Sanity check');
});

app.get('/login', (req, res, next) => {
  res.render('login');
});

app.post('/process_login', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (password === 'x') {
    res.cookie('username', username);
    res.redirect('/welcome');
  } else {
    res.direct('/login?message=fail');
  }
  res.json(req.body);
});

app.get('/welcome', (req, res, next) => {
  res.render('welcome', {
    username: req.cookies.username,
  });
});

app.get('/logout', (req, res, next) => {
  res.clearCookie('username');
  res.redirect('/login');
});

const port = process.env.PORT;
app.listen(port || 3000, () => console.log(`I'm listening on port ${port}...`));
