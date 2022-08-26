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
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
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
});

// USE BCRYPT TO HASH USER'S PASSWORD
userSchema.pre('save', async function (next) {
  // only run this password if function was modified
  if (!this.isModified('password')) return next();

  // hash user password with salt of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete value for passwordConfirmed field. Setting to undefined means it won't be included with the data being sent back, too
  this.passwordConfirm = undefined;

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
