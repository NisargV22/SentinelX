const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/modules/auth/auth.model");

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017/sentinelx");
  const tempEmail = "test_auth_temp@sentinelx.io";
  await User.deleteOne({ email: tempEmail });
  
  const user = new User({
    name: "Test User",
    email: tempEmail,
    password: "Password@123",
    role: "soc"
  });
  await user.save();
  
  const saved = await User.findOne({ email: tempEmail }).select("+password");
  console.log("Saved hash:", saved.password);
  
  const match = await bcrypt.compare("Password@123", saved.password);
  console.log("Match check:", match);
  
  await mongoose.connection.close();
}
check().catch(console.error);
