const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    consentGiven: {
      type: Boolean,
      required: true,
      default: true
    },

    consentText: {
      type: String,
      default: 'User agreed to GPS location tracking policy.'
    },

    ipAddress: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consent', consentSchema);