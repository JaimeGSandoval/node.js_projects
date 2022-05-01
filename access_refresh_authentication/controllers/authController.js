require('dotenv/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// fsPromises is just to mimic calls to a DB
const fsPromises = require('fs').promises;
const path = require('path');

const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data;
  },
};

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd) {
    return res.status(400).json({
      status: 'fail',
      message: 'User name and Password required',
    });
  }

  const foundUser = usersDB.users.find((person) => person.username === user);

  if (!foundUser) {
    // 401 means unauthorized
    return res.status(401).json({
      status: 'fail',
      message: 'User not found',
    });
  }

  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);

  if (match) {
    // filter(Boolean) is a good trick to remove any null values
    const roles = Object.values(foundUser.roles).filter(Boolean);

    // Here we're using UserInfo as a different namespace. it's considered to
    // be a private jwt claim
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }
    );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '1d',
      }
    );

    // save refresh token with current user
    const otherUsers = usersDB.users.filter(
      (person) => person.username !== foundUser.username
    );
    const currentUser = { ...foundUser, refreshToken };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
      path.join(__dirname, '..', 'model', 'users.json'),
      JSON.stringify(usersDB.users)
    );

    // When working with thunderClient to test the refresh route, you must remove secure: true from the cookie or else it work because it honors that cookie setting. However, when working with chrome or other browser, or production, it is required
    // 24 * 60 * 60 * 1000 = 1 day
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'None',
      secure: true,
    });

    // Send authorization roles and access token to user
    res.json({ roles, accessToken });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };
