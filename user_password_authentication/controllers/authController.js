const bcrypt = require('bcrypt');

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
    res.status(200).json({
      status: 'success',
      message: `User ${user} is logged in`,
    });
  } else {
    res.status(401).json({
      status: 'fail',
      message: 'Incorrect password',
    });
  }
};

module.exports = { handleLogin };
