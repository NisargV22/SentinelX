const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/modules/auth/auth.model");

async function fix() {
  await mongoose.connect("mongodb://127.0.0.1:27017/sentinelx");
  console.log("Connected to MongoDB. Correcting password hashes...");

  const users = await User.find({});
  for (const u of users) {
    let plain = "";
    if (u.role === "soc") {
      plain = "Analyst@123456";
    } else {
      plain = "Employee@123456";
    }
    
    // Explicitly update and save the password to trigger mongoose pre-save hashing
    u.password = plain;
    await u.save();
    
    // Immediately fetch and verify
    const verifiedUser = await User.findById(u._id).select("+password");
    const isMatch = await bcrypt.compare(plain, verifiedUser.password);
    console.log(`User: ${u.email} (${u.role}) -> Hashed and Verified: ${isMatch}`);
  }

  await mongoose.connection.close();
  console.log("Password hash correction complete.");
}

fix().catch(console.error);
