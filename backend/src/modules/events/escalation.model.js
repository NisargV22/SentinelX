const mongoose = require("mongoose");

const EscalationPolicySchema = new mongoose.Schema({
  severity: { type: String, enum: ["Critical", "High", "Medium", "Low"], required: true, unique: true },
  timeThreshold: { type: Number, required: true },
  assignTo: { type: String, required: true },
  notifyManager: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.EscalationPolicy || mongoose.model("EscalationPolicy", EscalationPolicySchema);
