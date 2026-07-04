const mongoose = require("mongoose");
const Event = require("../src/modules/events/events.model");

async function run() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/sentinelx");
    const count = await Event.countDocuments();
    console.log("DATABASE_DIAGNOSTICS_SUCCESS: EVENT COUNT IS:", count);
  } catch (err) {
    console.error("DATABASE_DIAGNOSTICS_FAILURE:", err.message);
  }
  process.exit(0);
}
run();
