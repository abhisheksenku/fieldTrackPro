const mongoose = require("mongoose");
const dotenv = require("dotenv");
const createAdmin = require("./createAdmin");

// Load the .env file from the root directory
dotenv.config();

const runSeed = async () => {
  try {
    console.log("Connecting to Database...");
    // 1. Connect to MongoDB using your URI
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected! Running seed script...");

    // 2. Execute the creation logic
    await createAdmin();

    // 3. Disconnect cleanly so the terminal process exits
    await mongoose.disconnect();
    console.log("Disconnected from Database.");
    process.exit(0);
    
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

// Execute the function
runSeed();