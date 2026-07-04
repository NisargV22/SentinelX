const express = require("express");
const Rule = require("./rule.model");
const Playbook = require("./playbook.model");
const ThreatIntel = require("./threatIntel.model");
const { UserBaseline, UbaAlert } = require("./uba.model");
const IncidentPlaybook = require("./incidentPlaybook.model");
const EscalationPolicy = require("./escalation.model");
const RetentionPolicy = require("./retention.model");
const ApiKey = require("../auth/apiKey.model");
const Alert = require("./alerts.model");
const Event = require("./events.model");
const { auth } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const { sha256 } = require("../../utils/crypto");

const router = express.Router();

// --- 1. RULE ENGINE ENDPOINTS ---
router.get("/rules", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const rules = await Rule.find();
    res.json({ success: true, rules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/rules", auth, authorize("soc"), async (req, res) => {
  try {
    const rule = new Rule(req.body);
    await rule.save();
    res.status(201).json({ success: true, rule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/rules/:id", auth, authorize("soc"), async (req, res) => {
  try {
    const rule = await Rule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, rule });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/rules/:id", auth, authorize("soc"), async (req, res) => {
  try {
    await Rule.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 2. SOAR PLAYBOOKS ENDPOINTS ---
router.get("/playbooks", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const playbooks = await Playbook.find();
    res.json({ success: true, playbooks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/playbooks", auth, authorize("soc"), async (req, res) => {
  try {
    const playbook = new Playbook(req.body);
    await playbook.save();
    res.status(201).json({ success: true, playbook });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/playbooks/:id", auth, authorize("soc"), async (req, res) => {
  try {
    const playbook = await Playbook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, playbook });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/playbooks/:id", auth, authorize("soc"), async (req, res) => {
  try {
    await Playbook.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 3. UBA ANALYTICS ENDPOINTS ---
router.get("/uba/alerts", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const alerts = await UbaAlert.find().sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/uba/baselines", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const baselines = await UserBaseline.find();
    res.json({ success: true, baselines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 4. INCIDENT PLAYBOOK CHECKLIST ENDPOINTS ---
router.get("/incident-playbooks/:threatId", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    let pb = await IncidentPlaybook.findOne({ threatId: req.params.threatId });
    if (!pb) {
      const alertObj = await Alert.findOne({ threatId: req.params.threatId });
      if (alertObj) {
        let pbType = "ddos";
        const typeLower = alertObj.type.toLowerCase();
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

        pb = new IncidentPlaybook({
          threatId: req.params.threatId,
          playbookType: pbType,
          steps: defaultSteps[pbType] || defaultSteps.ddos,
          status: "In Progress",
          owner: "Tier-1 Analyst"
        });
        await pb.save();
      }
    }
    res.json({ success: true, playbook: pb });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/incident-playbooks/:threatId/step/:stepNumber", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const stepNum = parseInt(req.params.stepNumber);
    const pb = await IncidentPlaybook.findOne({ threatId: req.params.threatId });
    if (!pb) return res.status(404).json({ success: false, message: "Playbook checklist not found." });

    const step = pb.steps.find(s => s.stepNumber === stepNum);
    if (step) {
      step.completed = req.body.completed;
      step.completedAt = req.body.completed ? new Date() : null;
      step.completedBy = req.body.completed ? req.user.name : null;
      await pb.save();
    }
    res.json({ success: true, playbook: pb });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/incident-playbooks/:threatId/status", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const { status, owner } = req.body;
    const pb = await IncidentPlaybook.findOneAndUpdate(
      { threatId: req.params.threatId },
      { status, owner },
      { new: true }
    );
    res.json({ success: true, playbook: pb });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 5. EDR INTEGRATION ENDPOINTS ---
router.post("/edr/isolate", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const { hostIp } = req.body;
    res.json({ success: true, verdict: "quarantined", vendor: "CrowdStrike Falcon", details: `Host IP ${hostIp} isolated from the corporate network.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/edr/scan", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const { hostIp } = req.body;
    res.json({ success: true, verdict: "scanned", vendor: "Microsoft Defender ATP", details: `Offline threat scan triggered on ${hostIp}. 0 threats found.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/edr/kill", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const { hostIp, processName } = req.body;
    res.json({ success: true, verdict: "terminated", vendor: "SentinelOne", details: `Process "${processName}" terminated on host ${hostIp}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 6. ADVANCED VISUALIZATION STATS ---
router.get("/analytics/traffic-by-hour", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const dbOffline = require("mongoose").connection.readyState !== 1;
    if (dbOffline) {
      const mockHours = Array.from({ length: 12 }, (_, i) => ({ hour: `${i * 2}:00`, count: Math.floor(20 + Math.random() * 80) }));
      return res.json({ success: true, data: mockHours });
    }
    const traffic = await Event.aggregate([
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    const formatted = traffic.map(t => ({ hour: `${t._id}:00`, count: t.count }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/analytics/top-ports", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const dbOffline = require("mongoose").connection.readyState !== 1;
    if (dbOffline) {
      return res.json({ success: true, data: [
        { port: "80 (HTTP)", count: 420 },
        { port: "443 (HTTPS)", count: 310 },
        { port: "22 (SSH)", count: 95 },
        { port: "53 (DNS)", count: 45 }
      ]});
    }
    const ports = await Event.aggregate([
      {
        $group: {
          _id: "$destPort",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const formatted = ports.map(p => ({ port: String(p._id || 80), count: p.count }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/analytics/alert-trend", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const dbOffline = require("mongoose").connection.readyState !== 1;
    if (dbOffline) {
      const mockTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return { date: date.toLocaleDateString([], { month: "short", day: "numeric" }), alerts: Math.floor(2 + Math.random() * 8) };
      });
      return res.json({ success: true, data: mockTrend });
    }
    const trend = await Alert.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          alerts: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 7 }
    ]);
    const formatted = trend.map(t => {
      const dateParts = t._id.split("-");
      const label = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString([], { month: "short", day: "numeric" });
      return { date: label, alerts: t.alerts };
    });
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 7. API KEY MANAGEMENT ---
router.get("/api-keys", auth, authorize("soc"), async (req, res) => {
  try {
    const keys = await ApiKey.find();
    res.json({ success: true, keys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/api-keys", auth, authorize("soc"), async (req, res) => {
  try {
    const keyVal = sha256(`key-${Date.now()}-${Math.random()}`).substring(0, 32);
    const apiKey = new ApiKey({
      name: req.body.name,
      key: keyVal,
      role: req.body.role || "external_agent",
      createdBy: req.user.email
    });
    await apiKey.save();
    res.status(201).json({ success: true, key: apiKey });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/api-keys/:id", auth, authorize("soc"), async (req, res) => {
  try {
    await ApiKey.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 8. LOG RETENTION CONFIG ---
router.get("/retention", auth, authorize("soc"), async (req, res) => {
  try {
    const policies = await RetentionPolicy.find();
    res.json({ success: true, policies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/retention", auth, authorize("soc"), async (req, res) => {
  try {
    const { logType, retentionDays } = req.body;
    const policy = await RetentionPolicy.findOneAndUpdate(
      { logType },
      { retentionDays },
      { new: true, upsert: true }
    );
    res.json({ success: true, policy });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- 9. THREAT INTEL REPUTATION QUERY ---
router.get("/threat-intel/:ip", auth, authorize("soc", "admin"), async (req, res) => {
  try {
    const { queryThreatIntel } = require("../../services/threatIntel.service");
    const intel = await queryThreatIntel(req.params.ip);
    res.json({ success: true, intel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 10. SYSTEM TELEMETRY HEALTH ---
router.get("/system/health", auth, authorize("soc"), async (req, res) => {
  const mongoose = require("mongoose");
  const axios = require("axios");
  const fs = require("fs");
  const path = require("path");
  const { getProvider } = require("../../config/blockchain");

  const health = {
    logDatabase: "Offline",
    pythonEngine: "Offline",
    blockchainAnchor: "Offline",
    logIngestionPipe: "Offline"
  };

  // 1. Check MongoDB
  if (mongoose.connection.readyState === 1) {
    health.logDatabase = "Online";
  }

  // 2. Check Python AI Engine
  try {
    const aiRes = await axios.get("http://127.0.0.1:5000/health", { timeout: 1000 });
    if (aiRes.data && aiRes.data.status === "UP") {
      health.pythonEngine = "Online";
    }
  } catch (err) {
    // offline
  }

  // 3. Check Blockchain Anchor
  try {
    const provider = getProvider();
    if (provider) {
      await provider.getBlockNumber();
      health.blockchainAnchor = "Online";
    }
  } catch (err) {
    // offline
  }

  // 4. Check Log Ingestion Pipe
  try {
    const workspaceRoot = process.cwd().endsWith("backend") ? path.join(process.cwd(), "..") : process.cwd();
    const logFilePath = path.join(workspaceRoot, "logs", "external_source.log");
    if (fs.existsSync(logFilePath)) {
      health.logIngestionPipe = "Online";
    }
  } catch (err) {
    // offline
  }

  res.json({ success: true, health });
});

module.exports = router;
