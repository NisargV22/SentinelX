const mongoose = require("mongoose");

const ThreatIntelSchema = new mongoose.Schema({
  indicator: { type: String, required: true, unique: true, index: true },
  source: { type: String, required: true },
  score: { type: Number, required: true },
  last_checked: { type: Date, default: Date.now },
  verdict: { type: String, enum: ["Malicious", "Suspicious", "Clean", "Unknown"], default: "Unknown" }
}, { timestamps: true });

module.exports = mongoose.models.ThreatIntel || mongoose.model("ThreatIntel", ThreatIntelSchema);
