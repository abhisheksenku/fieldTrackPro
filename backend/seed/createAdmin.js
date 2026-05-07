const User = require("../models/User");

const createAdmin = async () => {
  try {
    // 1. Check if the admin already exists so the script doesn't crash 
    // if you accidentally run it twice (due to the unique email constraint).
    const adminExists = await User.findOne({ email: "admin@example.com" });
    
    if (adminExists) {
      console.log(" Admin user already exists!");
      return;
    }

    // 2. Create the user using the RAW password. 
    // Your Mongoose pre-save hook will automatically encrypt this for you.
    await User.create({
      name: "Super Admin",
      email: "admin@example.com",
      password: "Admin@123", 
      role: "Admin", // Capital 'A' to match your schema Enum
    });
    
    console.log(" Default admin created successfully!");
  } catch (error) {
    console.error(" Error creating admin:", error.message);
  }
};

module.exports = createAdmin;