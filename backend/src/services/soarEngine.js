const Playbook = require("../modules/events/playbook.model");
const IncidentPlaybook = require("../modules/events/incidentPlaybook.model");
const Alert = require("../modules/events/alerts.model");
const { getIo } = require("../sockets/socketServer");

const executePlaybook = async (playbook, alertData) => {
  console.log(`[SOAR Engine] Executing playbook "${playbook.name}" triggered by Alert: ${alertData.threatId}`);

  for (const step of playbook.steps) {
    try {
      switch (step.action) {
        case "block_ip":
          console.log(`[SOAR ACTION: IP Block] Blocking source IP ${alertData.ip} at gateway firewall router...`);
          break;
        case "send_email":
          console.log(`[SOAR ACTION: Email Alert] Dispatching email report to SOC Security team for IP ${alertData.ip}...`);
          break;
        case "create_case":
          console.log(`[SOAR ACTION: Case Creation] Creating Incident Checklist playbook for Alert ${alertData.threatId}...`);
          const dbOffline = require("mongoose").connection.readyState !== 1;
          
          let pbType = "ddos";
          const typeLower = alertData.type.toLowerCase();
          if (typeLower.includes("phish")) pbType = "phishing";
          else if (typeLower.includes("malware") || typeLower.includes("trojan")) pbType = "ransomware";
          else if (typeLower.includes("brute") || typeLower.includes("auth")) pbType = "insider_threat";
          else if (typeLower.includes("exfil") || typeLower.includes("leak")) pbType = "data_breach";

          const defaultSteps = {
            phishing: [
              { stepNumber: 1, title: "Identify Phishing URL", description: "Extract link and upload to VirusTotal reputation scan." },
              { stepNumber: 2, title: "Isolate Targeted Users", description: "Verify if employees clicked links and lock credentials." },
              { stepNumber: 3, title: "Purge Inboxes", description: "Run corporate mail server script to delete matching headers." }
            ],
            ransomware: [
              { stepNumber: 1, title: "Isolate Host Endpoint", description: "Call EDR endpoint quarantine hook on infected device." },
              { stepNumber: 2, title: "Identify Ransom Variant", description: "Analyze file extension metadata and ransom payload notes." },
              { stepNumber: 3, title: "Verify Offsite Backups", description: "Assess backup server integrity to restore clean images." }
            ],
            ddos: [
              { stepNumber: 1, title: "Activate Rate Limiting", description: "Enable firewall rules and scale CDN rate-limiting shields." },
              { stepNumber: 2, title: "Route traffic via CDN", description: "Verify BGP routing rules and inspect latency metrics." }
            ],
            data_breach: [
              { stepNumber: 1, title: "Locate Leak Origin", description: "Identify compromised servers or API access tokens." },
              { stepNumber: 2, title: "Revoke Access Credentials", description: "Purge session cookies and rotate corporate keyrings." }
            ],
            insider_threat: [
              { stepNumber: 1, title: "Inspect Access History", description: "Verify user's typical login times and resource patterns." },
              { stepNumber: 2, title: "Freeze Employee Session", description: "Lock active corporate AD/LDAP session logins." }
            ]
          };

          const playbookPayload = {
            threatId: alertData.threatId,
            playbookType: pbType,
            steps: defaultSteps[pbType] || defaultSteps.ddos,
            status: "In Progress",
            owner: "Tier-1 Analyst"
          };

          if (!dbOffline) {
            try {
              // Ensure we don't duplicate playbooks for same threat ID
              const exists = await IncidentPlaybook.findOne({ threatId: alertData.threatId });
              if (!exists) {
                const incidentCase = new IncidentPlaybook(playbookPayload);
                await incidentCase.save();
              }
            } catch (err) {}
          }
          break;
        case "notify_slack":
          console.log(`[SOAR ACTION: Slack Notification] Sent JSON alert to channel ${step.target || "#soc-alerts"}: "Alert ${alertData.threatId} (${alertData.type}) from IP ${alertData.ip}"`);
          break;
        case "auto_escalate":
          console.log(`[SOAR ACTION: Auto Escalate] Alert ${alertData.threatId} is repeating. Upgrading severity to Critical...`);
          if (alertData._id) {
            const dbOffline = require("mongoose").connection.readyState !== 1;
            if (!dbOffline) {
              await Alert.findByIdAndUpdate(alertData._id, { severity: "Critical" });
            }
            alertData.severity = "Critical";
            const io = getIo();
            if (io) {
              io.emit("liveAlert", alertData);
            }
          }
          break;
        default:
          break;
      }
    } catch (stepErr) {
      console.error(`[SOAR Error] Failed executing playbook step:`, stepErr.message);
    }
  }
};

const triggerSOAR = async (alertData) => {
  const dbOffline = require("mongoose").connection.readyState !== 1;
  let activePlaybooks = [];

  if (!dbOffline) {
    try {
      activePlaybooks = await Playbook.find({ enabled: true });
    } catch (err) {}
  }

  // Seeding default playbook if none exists
  if (activePlaybooks.length === 0) {
    activePlaybooks = [
      {
        name: "Auto-Mitigate Brute Force & Malware",
        trigger_rules: ["BRUTE_FORCE", "MALWARE", "Phishing"],
        steps: [
          { action: "block_ip" },
          { action: "notify_slack", target: "#sec-ops" },
          { action: "create_case" }
        ],
        enabled: true
      }
    ];
  }

  for (const pb of activePlaybooks) {
    const isTriggered = pb.trigger_rules.some(ruleName => 
      alertData.type.toUpperCase().includes(ruleName.toUpperCase()) || 
      ruleName.toUpperCase() === "ALL"
    );
    if (isTriggered) {
      await executePlaybook(pb, alertData);
    }
  }
};

module.exports = { triggerSOAR };
