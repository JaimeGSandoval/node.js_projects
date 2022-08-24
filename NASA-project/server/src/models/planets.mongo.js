const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

// Connects planetSchema with the "planets" collection
module.exports = mongoose.model('Planet', planetSchema);

// In mongoose, a schema represents the structure of a particular document, either completely or just a portion of the document. It's a way to express expected properties and values as well as constraints and indexes. A model defines a programming interface for interacting with the database (read, insert, update, etc). So a schema answers "what will the data in this collection look like?" and a model provides functionality like "Are there any records matching this query?" or "Add a new document to the collection".

// A schema is fundamentally describing the data construct of a document (in MongoDB collection). This schema defines the name of each item of data, and the type of data, whether it is a string, number, date, Boolean, and so on.

// A model is a compiled version of the schema. One instance of the model will map to one document in the database. It is the model that handles the reading, creating, updating, and deleting of documents. A document in a Mongoose collection is a single instance of a model. So it makes sense that if we're going to work with our data then it will be through the model. A single instance of a model (like a User instance in var User = mongoose.model('User', userSchema);) maps directly to a single document in the database. With this 1:1 relationship, it is the model that handles all document interaction - creating, reading, saving, and deleting. This makes the model a very powerful tool.
