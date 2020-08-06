const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  title: String,
  description: { type: String, default: 'none' },
  createdAt: { type: Date, default: Date.now },
  filename: String,
  author: String,
  previewImg: String,
  price: { type: Number, default: 0 },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  ratingsAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  ratingsNumber: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Notes', notesSchema);
