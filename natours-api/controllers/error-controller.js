// operational errors are problems that we can predict will happen at some point in the future, so you need to handle them in advance. They have nothing to do with bugs in our code. Instead, they're based on the user or system or network .i.e. like a user accessing an invalid route, inputing invalid data, or our application failing to connect to our DB. All these are operational errors That we'll need to handle in order to prepare our application for these cases. Invalid path accessed, invalid user input (validator error from DB), failed to connect to server, failed to connect to DB, request timeout, etc. For operational errors, all you have to do is write a globl express error handling middleware which will then catch errors coming form all over the app. So no matter if it's an error coming from a route handler, or a model validator, etc, the goal is that all these errors end up in one central error handling middleware so we can send a nice response back to the client letting them know what happened

// programming errors are errors/bugs that developers introduce into out code. Like trying to read properties of undefined, using await without async, passing a number where an object is expected, using a req.query instead of req.body, etc.

const AppError = require('../utils/app-error');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message. This error says that it was not an operational error, i.e. that it's not an error we created ourself with the AppError class
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

// any error in middleware will automatically be sent to this handler with info about the error
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    // handle invalid mongodb id
    if (err.name === 'CastError') error = handleCastErrorDB(error);

    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    if (err.name === 'JsonWebTokenError') error = handleJWTError();

    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(error);

    sendErrorProd(error, res);
  }
};
