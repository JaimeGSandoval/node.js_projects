// operational errors are problems that we can predict will happen at some point in the future, so you need to handle them in advance. They have nothing to do with bugs in our code. Instead, they're based on the user or system or network .i.e. like a user accessing an invalid route, inputing invalid data, or our application failing to connect to our DB. All these are operational errors That we'll need to handle in order to prepare our application for these cases. Invalid path accessed, invalid user input (validator error from DB), failed to connect to server, failed to connect to DB, request timeout, etc. For operational errors, all you have to do is write a globl express error handling middleware which will then catch errors coming form all over the app. So no matter if it's an error coming from a route handler, or a model validator, etc, the goal is that all these errors end up in one central error handling middleware so we can send a nice response back to the client letting them know what happened

// programming errors are errors/bugs that developers introduce into out code. Like trying to read properties of undefined, using await without async, passing a number where an object is expected, using a req.query instead of req.body, etc.

// all the errors created using this class will all be operational errors i.e. errors that we can predict will happen at some point in the future like a user creating a tour without the required fields
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // will be used to test if the error is of the AppError class and only send error messages back to the client for these operational errors we created using this class. This is useful because some other unexpected errors may happen in our app (programming error or bug in a package). These errors will not have the isOperational property on them and we can differentiate between them

    //
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
