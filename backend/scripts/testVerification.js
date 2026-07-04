const mongoose = require("mongoose");
const BlockchainRecord = require("../src/modules/blockchain/blockchain.model");
const AuditLog = require("../src/modules/audit/audit.model");
const { sha256 } = require("../src/utils/crypto");

const computeLogCanonicalHash = (log) => {
  const fieldsStr = `${log._id.toString()}|${log.userId ? log.userId.toString() : ""}|${log.email}|${log.action}|${log.ip}|${log.userAgent || ""}|${JSON.stringify(log.metadata || {})}|${new Date(log.createdAt).toISOString()}`;
  return sha256(fieldsStr);
};

async function test() {
  await mongoose.connect("mongodb://127.0.0.1:27017/sentinelx");
  
  const records = await BlockchainRecord.find({}).sort({ createdAt: -1 });
  console.log(`=== ANALYZING ALL ${records.length} BLOCK RECORDS ===`);

  for (const record of records) {
    console.log(`\n----------------------------------------`);
    console.log("Block ID (Batch ID Prefix):", record.batchId.substring(0, 8).toUpperCase());
    console.log("Full Batch ID:", record.batchId);
    console.log("Expected Logs Count:", record.logCount);

    const logs = await AuditLog.find({ _id: { $in: record.logIds } }).sort({ _id: 1 });
    console.log("Found Logs in DB:", logs.length);

    if (logs.length !== record.logCount) {
      console.log("STATUS: MISMATCH! Log count mismatch (deleted logs).");
      continue;
    }

    const logHashes = logs.map(computeLogCanonicalHash);
    const concatenatedHashes = logHashes.join("");
    const recomputedHash = sha256(concatenatedHashes);

    console.log("Recorded Hash:  ", record.batchHash);
    console.log("Recomputed Hash:", recomputedHash);

    if (recomputedHash === record.batchHash) {
      console.log("STATUS: MATCH! Integrity verified.");
    } else {
      console.log("STATUS: MISMATCH! Log contents altered (TAMPERED).");
    }
  }

  await mongoose.connection.close();
}

test().catch(console.error);
