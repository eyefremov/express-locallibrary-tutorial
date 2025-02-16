const mongoose = require('mongoose');

const { Schema } = mongoose;

const GenreSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
});

// Virtual for genre's URL
GenreSchema.virtual('url').get(function () {
  return `/catalog/genre/${this._id}`;
});

// Prevent OverwriteModelError by checking if the model already exists
module.exports = mongoose.models.Genre || mongoose.model('Genre', GenreSchema);

