require('dotenv/config');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      status: 'fail',
      message: 'Auth header has no value ',
    });
  }

  console.log(authHeader); // Bearer token
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodeToken) => {
    if (err) {
      return res.sendStatus(403); // unauthorized
    }

    req.user = decodeToken.username;
    next();
  });
};

module.exports = verifyJWT;
