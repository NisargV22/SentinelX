const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  threatId: { type: String, required: true, unique: true, index: true },
  type: { type: String, required: true },
  severity: { type: String, required: true, index: true },
  status: { type: String, enum: ["Open", "Acknowledged", "Investigating", "Resolved", "False Positive"], default: "Open", index: true },
  ip: { type: String, required: true },
  affected: { type: String, default: "Unknown" },
  description: { type: String },
  remediation: { type: String },
  notes: [{
    user: { type: String },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Alert = mongoose.models.Alert || mongoose.model("Alert", AlertSchema);
module.exports = Alert;
