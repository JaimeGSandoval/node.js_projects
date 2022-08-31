const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    // the token will be valid for 90 days, then it will be expired
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// COOKIE: a cookie is just a small piece of text that a server can send to clients. When the client receives a cookie it will automatically store it and then automatically send it back along with all future requests to the server. A browser automatically stores a cookie that it receives and sends it back in all future requests to the server where it came from

const createSendToken = (user, statusCode, res) => {
  // CREATE JSONWEBTOKEN FOR AUTHENTICATION & SEND BACK TO USER
  // newUser._id is the id that's given to the user from mongodb
  // the value for JWT_SECRET should be 32 characters long
  const token = signToken(user._id);

  const cookieOptions = {
    // CONVERT DAYS TO MILLISECONDS
    // hours * minutes * seconds * milliseconds
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, // cookie will only be sent on an encrypted connection ie https which would only be during production
    httpOnly: true, // makes it so cookie cannot be accessed or modified by or in the browser
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // set to undefined so the password does not get sent back with the response
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // we send back the token to log the user in as a result of signing up
  createSendToken(newUser, 200, res);
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

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything is ok, send token to client
  createSendToken(user, 200, res);
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

// this is the middleware function itself that is the route handler
// restrictTo  will is a function that takes ...roles as an argument, which returns another function that has openings for the req, res, and next arguments that get passed to the route handler
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };

// BREAKDOWN OF RESETTING A PASSWORD
// It is really challenging to understand the flow of resetting a password. Let me try to explain it and see whether I am right.

// 1. The user hits the forgotPassword  endpoint from the client and provides an email address (In the backend: We take the email address and find them in our database to know who forgot their password.)

// 2. We create a reset token and send it as a link to the user via email. This is because we assume that email is secure and unique to the user. We include the reset token because each reset token is unique, so that we are able to find out who actually forgot their password, and we can change the person's password to the new one.

// 3. When the user clicks the link and enters a  new password, validation occurs and we  set a new password for the user. We also add a field to indicate at what time the user changed their password. This is used later when user tries to access a protected route using the old token, we can block their access.

// steps for resetting password:
// 1) user sends a POST request to the /forgotPassword route only with his email address
// 2) this creates a reset token which gets sent to the email that the user provided in step 1. it's a simple random token, not a jwt
// 3) the user sends that token they received in their email along with a new password in order to update their password

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on email sent in post request to /forgotPassword route
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with that email address', 404));

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // validateBeforeSave will deactivate all the validators that are specified in the schema when accessing forgotPassword route
  await user.save({ validateBeforeSave: false }); // save to DB all the newly set or modified fields

  // 3) Send it to user's email with resetToken created above
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token  (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    // remember, this only modifies the data, it doesn't save it
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // this saves the data to the DB
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again.', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  // the reset token sent in the url is the non encrypted token, but the one that we have in the DB is encrypted. So we encrypt the token here and compare it with the encrypted one stored in the DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // the only thing we know about the user right now is the resetToken they sent via the url so we use that to find the user in the db
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // if the passwordResetExpires is greater than right now, that means it's still valid because it's date is in the future by 10 min or less
  });

  // 2) if token is not expired and there is a user, set the new password
  // if the token has expired or user isn't found by hashedToken, then findOne will not return a user
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // we don't turn off the validators because we want them to confirm the password is equal to passwordConfirm
  await user.save();

  // 3) Update the changedPasswordAt property for the user

  // 4) Log the user in by sending a jwt to them
  createSendToken(user, 200, res);
});

// this update password functionality is only for logged in users
exports.updatePassword = catchAsync(async (req, res, next) => {
  // you must always ask for the user's current password before updating to a new password
  // user id comes from the jwt
  console.log('USER', req.user.id);

  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password from user input is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // remember, we use user.save() and not User.findByIdAndUpdate() because the user will not be defined when using User.findByIdAndUpdate and if we need to access or update properties that belong to a specific user by using 'this' the properties won't be defined

  // 4) Log user in, send JWT back to client
  createSendToken(user, 200, res);
});
