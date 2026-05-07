const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    actionType: {
      type: String,
      required: true
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },

    targetModel: {
      type: String
    },

    details: {
      type: Object,
      default: {}
    },

    ipAddress: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);