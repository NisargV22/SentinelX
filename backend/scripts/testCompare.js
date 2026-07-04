const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/modules/auth/auth.model");

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017/sentinelx");
  const user = await User.findOne({ email: "analyst1@sentinelx.io" }).select("+password");
  if (!user) {
    console.log("User not found in DB!");
    await mongoose.connection.close();
    return;
  }
  
  console.log("Checking User:", user.email);
  console.log("Hashed Password in DB:", user.password);
  
  const isMatch1 = await bcrypt.compare("Analyst@123456", user.password);
  console.log("Compare with 'Analyst@123456':", isMatch1);

  const isMatch2 = await bcrypt.compare("analyst@123456", user.password);
  console.log("Compare with 'analyst@123456':", isMatch2);

  await mongoose.connection.close();
}

check().catch(console.error);
