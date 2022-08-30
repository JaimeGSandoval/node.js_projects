const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Remember, required means that it's a required input from the user, ut not required to be inserted into the DB
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'please provide an email'],
    unique: true,
    lowercase: true, // coverts string to lowercase
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // keeps password from being sent back from DB to server
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // el is the current value of passwordConfirm being passed to the function
      // this only works on SAVE OR CREATE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// USE BCRYPT TO HASH USER'S PASSWORD
// before saving the document to the DB, we hash the password with bcrypt. This happens in the middle of receiving the data from the user and when we save the data to the DB
// query middleware
userSchema.pre('save', async function (next) {
  // only runs if the password is new or if its been changed. i.e. if the user is only updating the email, we don't want to encrypt the password again. this.isModified checks the current document/user's field that we check has been modified. So if the password has not been modified .i.e the user isn't

  // Whenever you change the value of the certain field, the value of isModified will get changed. So user.isModified('password') will be true whenever 'password' gets modified. In the first case, the password value initially would have been empty or null, so it will return true in that case as well.
  if (!this.isModified('password')) return next();

  // if we make it down here a  hash hasn't been created for the password yet, so create hash for user password with salt of 12. We only save sensitive data to the DB in encrypted form
  this.password = await bcrypt.hash(this.password, 12);

  // delete value for passwordConfirmed field. Setting to undefined means it won't be included with the data being sent back, too
  this.passwordConfirm = undefined;

  next();
});

// query middleware
userSchema.pre('save', function (next) {
  if (!this.isModified || this.isNew) return next();
  // hack that uses ' - 1000' to create a small delay so that the jwt token is created 1 second after the date being set here
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// query middleware
// the 'find' will apply to all queries that contain the word 'find' in them .i.e find, findById, findByIdAndUpdate, etc
// this middleware will fire before every query and gives the instruction to only retrieve documents/users with active set to true
userSchema.pre(/^find/, function (next) {
  // 'this' points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// the instance method correctPassword will be available to all instances of User
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// the 'this' keyword always point to the current document
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // if true, it means the user changed their password
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // this will return true if changedTimestamp has a greater value, meaning it was issued  after the jwt timestamp was issued, meaning the password was changed after the token waa issued
    return JWTTimestamp < changedTimestamp;
  }

  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // never store a plain reset token in the DB, just like a password
  // here we use randomBytes to create cryptographically random data and the number of bytes to be generated into a token, then turn it into a hexedecimal string
  // this is the token we send to the user. We don't set this token in our DB. If a hacker gains access to the DB they could then use this token and create a new password using this token instead of the user doing it. So just like a password, we should never store a plain reset token in the DB
  const resetToken = crypto.randomBytes(32).toString('hex');

  // we create an encrypted version of the reset token. this will be stored in the DB. Remember, we only save sensitive data in an encrypted form and compare it to the encrypted version in the DB.
  // "this" points to the current user that called createPasswordResetToken
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  // storing it for 10 minutes
  // * 60 is for seconds and * 1000 is for milliseconds which makes 10 min
  // remember this sets the value but it does not save it to the DB. That's done with .save()
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // send back plain text token to user's email
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
