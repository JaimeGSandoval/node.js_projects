const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    // the token will be valid for 90 days, then it will be expired
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

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
  const token = signToken(newUser._id);

  // we send back the token to log the user in as a result of signing up
  res.status(201).json({
    status: 'success',
    token,
    user: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if user exists & password is correct
  // use +password to include password because it's  not automatically being sent back from the DB to the server
  const user = await User.findOne({ email }).select('+password');

  // 3) If everything is ok, send token to client
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
