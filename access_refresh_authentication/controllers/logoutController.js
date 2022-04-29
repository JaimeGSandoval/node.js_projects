const fsPromises = require('fs').promises; // using fsPromises is only here to mock a database. You normally would not use it
const path = require('path');

const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data;
  },
};

const handleLogout = async (req, res) => {
  //**  on client memory, also delete access token **

  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.sendStatus(204); // 204 successful request. not sending back any content
  }

  const refreshToken = cookies.jwt;

  // checking to see if user is in db
  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refreshToken
  );

  if (!foundUser) {
    // you must pass in the same options the cookie was set with, unless the properties are maxAge or expiryDate
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    return res.sendStatus(204);
  }

  // delete refreshToken in db
  const otherUsers = usersDB.users.filter(
    (person) => person.refreshToken !== foundUser.refreshToken
  );

  const currentUser = { ...foundUser, refreshToken: '' };
  usersDB.setUsers([...otherUsers, currentUser]);
  await fsPromises.writeFile(
    path.join(__dirname, '..', 'model', 'users.json'),
    JSON.stringify(usersDB.users)
  );

  res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

  res.sendStatus(204);
};

module.exports = { handleLogout };
