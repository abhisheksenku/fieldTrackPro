const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Editor", "User"],
      default: "User",
    },
    trackingMode: {
      type: String,
      enum: ["Geo-Fenced", "Remote"],
      default: "Geo-Fenced",
    },
    assignedZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      default: null,
    },
    lastPing: {
      type: Date,
      default: Date.now,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Hash password before saving to ensure security
userSchema.pre("save", async function () {

  if (!this.isModified("password")) return;

  const saltRounds = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, saltRounds);

});

// Instance method to verify passwords during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
