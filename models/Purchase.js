const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: {

    type: String,
    required: true
  },
  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notes',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Purchase', purchaseSchema);
