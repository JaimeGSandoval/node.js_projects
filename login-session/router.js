const express = require('express');
const router = express.Router();

const credential = {
  email: 'admin@gmail.com',
  password: 'admin123',
};

router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === credential.email && password === credential.password) {
    console.log('bankai');
    req.session.user = email;
    res.redirect('/route/dashboard');
  } else {
    res.send('Invalid username or password');
  }
});

router.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.render('dashboard', { user: req.session.user });
  } else {
    res.send('Unauthorized user');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.send('Error');
    } else {
      res.render('base', {
        title: 'Express',
        logout: 'Successfully logged out',
      });
    }
  });
});

module.exports = router;
