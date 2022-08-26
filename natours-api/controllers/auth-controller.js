const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // CREATE JSONWEBTOKEN FOR AUTHENTICATION & SEND BACK TO USER
  // newUser._id is the id that's given to the user from mongodb
  // the value for JWT_SECRET should be 32 characters long
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    // the token will be valid for 90 days, then it will be expired
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: 'success',
    token,
    user: newUser,
  });
});
