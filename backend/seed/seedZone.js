const mongoose = require("mongoose");
const Zone = require("../models/Zone");
const dotenv = require("dotenv");
dotenv.config();
const seedZone = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    await Zone.deleteMany();
    await Zone.create({
      name: "Jodhpur Office",
      latitude: 26.2389,
      longitude: 73.0243,
      radius: 3000,
    });
    console.log("Zone seeded successfully.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
seedZone();
