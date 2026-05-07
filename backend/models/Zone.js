const mongoose = require("mongoose");
const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Zone name is required"],
      trim: true,
    },
    description: { type: String, trim: true },
    latitude: { type: Number, required: [true, "Latitude is required"] },
    longitude: { type: Number, required: [true, "Longitude is required"] },
    radius: {
      type: Number,
      required: [true, "Radius is required"],
      default: 200,
    }, // in meters
  },
  { timestamps: true },
);
module.exports = mongoose.model("Zone", zoneSchema);
