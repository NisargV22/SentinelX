const mongoose = require("mongoose");

const BlockchainRecordSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true, index: true },
  batchHash: { type: String, required: true, index: true },
  txHash: { type: String, required: true, index: true },
  blockNumber: { type: Number, required: true },
  logCount: { type: Number, required: true },
  logIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "AuditLog" }],
  status: { type: String, enum: ["Anchored", "Verified", "Failed"], default: "Anchored" }
}, { timestamps: true });

const BlockchainRecord = mongoose.models.BlockchainRecord || mongoose.model("BlockchainRecord", BlockchainRecordSchema);
module.exports = BlockchainRecord;
