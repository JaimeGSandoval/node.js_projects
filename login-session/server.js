const express = require('express');
const path = require('path');
const cookies = require('cookie-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const router = require('./router');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/assets')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookies());

app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('base', { title: 'Login System' });
});

app.use('/route', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));
