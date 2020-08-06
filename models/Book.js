const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: 'none',
  },
  imageCover: String,
  author: {
    type: String,
    required: true,
  },
  ratingsAverage: {
    type: Number,
    default: 0,
  },
  ratingsNumber: {
    type: Number,
    default: 5,
    min: 0,
    max: 5,
  },
  genre: { type: String, required: true },
  price: { type: String, default: 'free' },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reviews',
    },
  ],
});

module.exports = mongoose.model('Book', bookSchema);
