require('dotenv/config');
const jwt = require('jsonwebtoken');

const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data;
  },
};

const handleRefreshToken = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.sendStatus(401);
  }
  console.log(cookies.jwt);

  const refreshToken = cookies.jwt;

  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refreshToken
  );

  if (!foundUser) {
    // 403 means forbidden
    return res.status(403).json({
      status: 'fail',
      message: 'Unauthorized',
    });
  }

  // evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decodedToken) => {
      if (err || foundUser.username !== decodedToken.username) {
        return res.sendStatus(403);
      }

      const accessToken = jwt.sign(
        { username: decodedToken.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30s' }
      );

      res.json({
        accessToken,
      });
    }
  );
};

module.exports = { handleRefreshToken };
