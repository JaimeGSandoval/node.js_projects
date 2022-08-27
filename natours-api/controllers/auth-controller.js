const { promisify } = require('util');
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
    passwordChangedAt: req.body.passwordChangedAt,
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

// middleware to check if the user is logged in or not to protect routes
exports.protect = catchAsync(async (req, res, next) => {
  // a common practice is to send tokens with req in its headers
  // 1) Get token and check if it's there

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // trigger the error handling middleware to send an error back to client
    return next(
      new AppError('You are not logged in. Please log into get access', 401)
    );
  }

  // 2) Verify token
  // If a function returns a Promise then we can await it inside of an async function. That will wait until the Promise is resolved (i.e. the JWT is verified) before moving on to the rest of the function.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  // decoded.id is the objectid of the user document
  const retrievedUser = await User.findById(decoded.id);

  if (!retrievedUser)
    return next(
      new AppError('The user belonging to this user no longer exists.', 401)
    );

  // 4) Check if user changed password after the JWT was issued
  if (retrievedUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  // create a user property on req.user and store all the user data in it so it can be used by other middleware down the pipeline
  req.user = retrievedUser;

  next();
});
