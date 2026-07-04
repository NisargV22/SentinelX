const mongoose = require("mongoose");

const UserBaselineSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  avgLoginHour: { type: Number, default: 12 },
  allowedLocations: [{ type: String }],
  typicalPorts: [{ type: Number }],
  avgBytesTransferred: { type: Number, default: 5000 },
  rollingCount: { type: Number, default: 0 }
}, { timestamps: true });

const UbaAlertSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  anomalyType: { type: String, enum: ["off_hours", "unusual_location", "unusual_port", "exfiltration"], required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String },
  severity: { type: String, enum: ["Critical", "High", "Medium", "Low"], default: "Medium" }
}, { timestamps: true });

const UserBaseline = mongoose.models.UserBaseline || mongoose.model("UserBaseline", UserBaselineSchema);
const UbaAlert = mongoose.models.UbaAlert || mongoose.model("UbaAlert", UbaAlertSchema);

module.exports = { UserBaseline, UbaAlert };
