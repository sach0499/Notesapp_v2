const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notes',
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    required: true,
  },
  title: String,
  description: {
    type: String,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
