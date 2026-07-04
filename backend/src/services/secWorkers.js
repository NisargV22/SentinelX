const Alert = require("../modules/events/alerts.model");
const Event = require("../modules/events/events.model");
const EscalationPolicy = require("../modules/events/escalation.model");
const RetentionPolicy = require("../modules/events/retention.model");
const { getIo } = require("../sockets/socketServer");

const runEscalationWorker = async () => {
  const dbOffline = require("mongoose").connection.readyState !== 1;
  if (dbOffline) return;

  try {
    const policies = await EscalationPolicy.find();
    if (policies.length === 0) return;

    for (const policy of policies) {
      const timeLimit = new Date(Date.now() - policy.timeThreshold * 60 * 1000);
      
      const alertsToEscalate = await Alert.find({
        severity: policy.severity,
        status: { $in: ["Open", "Investigating"] },
        createdAt: { $lt: timeLimit }
      });

      for (const alert of alertsToEscalate) {
        alert.status = "Investigating";
        alert.notes.push({
          user: "SYSTEM_ESCALATOR",
          text: `Auto-escalation triggered. SLA response threshold (${policy.timeThreshold}m) exceeded. Escalating node to ${policy.assignTo}.`
        });
        
        if (alert.severity === "Low") alert.severity = "Medium";
        else if (alert.severity === "Medium") alert.severity = "High";
        else if (alert.severity === "High") alert.severity = "Critical";

        await alert.save();
        console.log(`[Escalation Daemon] Auto-escalated Alert ${alert.threatId} to ${policy.assignTo}`);

        const io = getIo();
        if (io) {
          io.emit("liveAlert", alert);
        }
      }
    }
  } catch (err) {
    console.error("[Escalation Daemon Error] Failed to process auto-escalations:", err.message);
  }
};

const runRetentionWorker = async () => {
  const dbOffline = require("mongoose").connection.readyState !== 1;
  if (dbOffline) return;

  try {
    const policies = await RetentionPolicy.find();
    for (const policy of policies) {
      const purgeLimit = new Date(Date.now() - policy.retentionDays * 24 * 60 * 60 * 1000);
      
      const result = await Event.deleteMany({
        type: policy.logType,
        createdAt: { $lt: purgeLimit }
      });

      if (result.deletedCount > 0) {
        console.log(`[Retention Daemon] Purged ${result.deletedCount} old logs of type "${policy.logType}" (Older than ${policy.retentionDays} days).`);
      }
    }
  } catch (err) {
    console.error("[Retention Daemon Error] Failed to purge expired logs:", err.message);
  }
};

const initSecurityWorkers = () => {
  console.log("Starting Security Policy Background Daemons (Escalation & Log Retention)...");
  
  const dbOffline = require("mongoose").connection.readyState !== 1;
  if (!dbOffline) {
    EscalationPolicy.countDocuments().then(count => {
      if (count === 0) {
        EscalationPolicy.create([
          { severity: "Critical", timeThreshold: 5, assignTo: "SOC Manager Team" },
          { severity: "High", timeThreshold: 15, assignTo: "Tier-3 Security Lead" },
          { severity: "Medium", timeThreshold: 30, assignTo: "Tier-2 Incident Response Analyst" }
        ]).catch(() => {});
      }
    });

    RetentionPolicy.countDocuments().then(count => {
      if (count === 0) {
        RetentionPolicy.create([
          { logType: "normal", retentionDays: 7 },
          { logType: "port_scan", retentionDays: 30 },
          { logType: "brute_force", retentionDays: 90 },
          { logType: "malware", retentionDays: 180 }
        ]).catch(() => {});
      }
    });
  }

  // Check escalations every 60 seconds
  setInterval(runEscalationWorker, 60000);
  
  // Run log retention checks every 24 hours
  setInterval(runRetentionWorker, 24 * 60 * 60 * 1000);
};

module.exports = { initSecurityWorkers };
