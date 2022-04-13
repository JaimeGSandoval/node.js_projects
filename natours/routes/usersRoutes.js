const express = require('express');
const usersController = require('../controllers/usersController');
const { getAllUsers, getUser, createUser, updateUser, deleteUser } =
  usersController;

const router = express.Router();
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;

// usersRouter.route('/').get(getAllUsers).post(createUser);
// usersRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
