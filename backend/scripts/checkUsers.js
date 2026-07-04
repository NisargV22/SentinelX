const mongoose = require("mongoose");
const User = require("../src/modules/auth/auth.model");

async function checkUsers() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sentinelx";
  console.log(`Connecting to database to retrieve users...`);
  
  await mongoose.connect(uri);

  const users = await User.find({}).select("+password");

  console.log("\n=================== SEEDED DATABASE USER ACCOUNTS ===================");
  console.log(`Total Users Found: ${users.length}\n`);

  users.forEach((u, index) => {
    console.log(`[User #${index + 1}]`);
    console.log(`  Name:      ${u.name}`);
    console.log(`  Email:     ${u.email}`);
    console.log(`  Role:      ${u.role}`);
    console.log(`  Encrypted Hash (bcrypt): ${u.password}`);
    console.log("-------------------------------------------------------------------");
  });

  await mongoose.connection.close();
}

checkUsers().catch(err => {
  console.error("Failed to fetch database users:", err.message);
  process.exit(1);
});
