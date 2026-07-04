const mongoose = require("mongoose");
const BlockchainRecord = require("../src/modules/blockchain/blockchain.model");
const AuditLog = require("../src/modules/audit/audit.model");

async function clear() {
  await mongoose.connect("mongodb://127.0.0.1:27017/sentinelx");
  console.log("Connected to MongoDB. Clearing old blockchain records...");
  
  await BlockchainRecord.deleteMany({});
  console.log("Deleted all old blockchain records.");

  // Reset the txHash flag in audit logs so they can be anchored to the new contract
  await AuditLog.updateMany({}, { $set: { txHash: null } });
  console.log("Reset txHash flags in AuditLog collection to allow fresh anchoring.");

  await mongoose.connection.close();
  console.log("Ledger cleanup complete.");
}

clear().catch(console.error);
