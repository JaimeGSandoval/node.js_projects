const fsPromises = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const usersDB = {
  users: require('../model/users.json'),
  setUsers: function (data) {
    this.users = data;
  },
};

const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd) {
    return res.status(400).json({
      status: 'fail',
      message: 'User name and Password required',
    });
  }

  // check for duplicate usernames in the database
  const duplicate = usersDB.users.find((person) => person.username === user);

  if (duplicate) {
    return res.status(409); // 409 means conflict
  }

  // END OF DEFINE AND GUARD CLAUSE SECTION

  try {
    // encrypt password
    const hashedPassword = await bcrypt.hash(pwd, 10);

    // store the new user
    const newUser = {
      username: user,
      roles: { User: 2001 },
      password: hashedPassword,
    };

    usersDB.setUsers([...usersDB.users, newUser]);

    await fsPromises.writeFile(
      path.join(__dirname, '..', 'model', 'users.json'),
      JSON.stringify(usersDB.users)
    );

    console.log(usersDB.users);

    res.status(201).json({
      status: 'success',
      message: `User ${newUser.username} created`,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

module.exports = { handleNewUser };
