require('dotenv/config');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.header.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }

  console.log(authHeader); // Bearer token
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodeToken) => {
    if (err) {
      return res.sendStatus(403); // unauthorized
    }

    req.user = decodeToken.UserInfo.username;
    req.roles = decodeToken.UserInfo.roles;
    next();
  });
};

module.exports = verifyJWT;
