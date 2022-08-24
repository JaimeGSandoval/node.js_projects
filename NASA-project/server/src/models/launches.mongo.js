const mongoose = require('mongoose');

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  target: {
    type: String,
  },
  customers: [String],
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
});

// Connects launchesSchema with the "launches" collection
// the first argument should always be the singular name of the collection that this model represents. Mongoose will take the argument, lowercase it, make it plural and talk to the collection with that lowercase plural name. This is called compiling the model. We've created an object which will now allow us to create and read documents in our launches collection
module.exports = mongoose.model('Launch', launchesSchema);
