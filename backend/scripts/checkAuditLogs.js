const mongoose = require("mongoose");
const AuditLog = require("../src/modules/audit/audit.model");

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017/sentinelx");
  const countAll = await AuditLog.countDocuments({});
  const countPending = await AuditLog.countDocuments({ txHash: null });
  const latest = await AuditLog.findOne({}).sort({ createdAt: -1 });

  console.log("=== AUDIT LOG COLLECTION DIAGNOSTICS ===");
  console.log("Total Audit Logs:", countAll);
  console.log("Pending (txHash: null) Audit Logs:", countPending);
  if (latest) {
    console.log("Latest Audit Log Details:", {
      action: latest.action,
      email: latest.email,
      txHash: latest.txHash,
      createdAt: latest.createdAt
    });
  } else {
    console.log("No audit logs found.");
  }
  await mongoose.connection.close();
}

check().catch(console.error);
