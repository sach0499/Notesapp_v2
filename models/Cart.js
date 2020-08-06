const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: String,
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notes',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Cart', cartSchema);
