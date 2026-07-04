const mongoose = require("mongoose");

const RetentionPolicySchema = new mongoose.Schema({
  logType: { type: String, required: true, unique: true },
  retentionDays: { type: Number, required: true, default: 90 }
}, { timestamps: true });

module.exports = mongoose.models.RetentionPolicy || mongoose.model("RetentionPolicy", RetentionPolicySchema);
