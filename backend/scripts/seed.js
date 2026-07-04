require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/modules/auth/auth.model");

const seedUsers = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sentinelx";
  console.log(`Seeding users to database: ${uri}`);
  
  await mongoose.connect(uri);

  // Clear existing users to remove old admins and viewers
  console.log("Clearing all existing users from collection...");
  await User.deleteMany({});

  const users = [];

  // Seed 5 SOC Analysts
  for (let i = 1; i <= 5; i++) {
    users.push({
      name: `SOC Analyst ${i}`,
      email: `analyst${i}@sentinelx.io`,
      password: `Analyst@123456`,
      role: "soc",
      status: "Active"
    });
  }

  // Seed 10 Employees
  for (let i = 1; i <= 10; i++) {
    users.push({
      name: `Employee Operator ${i}`,
      email: `employee${i}@sentinelx.io`,
      password: `Employee@123456`,
      role: "employee",
      status: "Active"
    });
  }

  for (const u of users) {
    const user = new User(u);
    await user.save();
    console.log(`Seeded user: ${u.email} (${u.role})`);
  }

  await mongoose.connection.close();
  console.log("Seeding complete. Mongoose connection closed.");
};

seedUsers().catch(err => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
