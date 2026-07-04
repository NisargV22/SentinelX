const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  email: { type: String, required: true, index: true },
  action: { type: String, required: true },
  ip: { type: String, required: true },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  txHash: { type: String, index: true, default: null }
}, { timestamps: true });

AuditLogSchema.index({ createdAt: -1, email: 1 });
AuditLogSchema.index({ txHash: 1, createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
module.exports = AuditLog;
