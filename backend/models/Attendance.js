const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    action: { 
        type: String, 
        enum: ['Punch In', 'Punch Out'], 
        required: true 
    },

    status: { 
        type: String, 
        enum: ['Success', 'Failed'], 
        required: true 
    },

    distanceMeters: { 
        type: Number, 
        default: null 
    },

    recordedLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },

    nearestZone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Zone'
    },

    isEdited: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);