const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Form Handling',
  });
});

app.post('/form_submit', (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  res.json(`Your username is ${username} and your email is ${email}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("I'm listening..."));
