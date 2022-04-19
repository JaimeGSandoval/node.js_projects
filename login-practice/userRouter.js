const express = require('express');

let router = express.Router();

const validateUser = (req, res, next) => {
  res.locals.validated = true;
  console.log('validated');
  next();
};

router.use(validateUser);

router.get('/user', (req, res, next) => {
  res.json({
    message: 'user route',
  });
});

module.exports = router;
