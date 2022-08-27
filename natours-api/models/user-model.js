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
});

// USE BCRYPT TO HASH USER'S PASSWORD
// before saving the document to the DB, we hash the password with bcrypt. This happens in the middle of receiving the data from the user and when we save the data to the DB
userSchema.pre('save', async function (next) {
  // only runs if the password is new or if its been changed. i.e. if the user is only updating the email, we don't want to encrypt the password again. this.isModified checks the current document/user's field that we check has been modified. So if the password has not been modified .i.e the user isn't

  // Whenever you change the value of the certain field, the value of isModified will get changed. So user.isModified('password') will be true whenever 'password' gets modified. In the first case, the password value initially would have been empty or null, so it will return true in that case as well.
  if (!this.isModified('password')) return next();

  // if we make it down here a  hash hasn't been created for the password yet, so create hash for user password with salt of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete value for passwordConfirmed field. Setting to undefined means it won't be included with the data being sent back, too
  this.passwordConfirm = undefined;

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

const User = mongoose.model('User', userSchema);

module.exports = User;
