const mongoose = require("mongoose");
const Event = require("./events.model");
const Alert = require("./alerts.model");
const Rule = require("./rule.model");
const geolocate = require("../../utils/geolocate");
const { getThreatScore } = require("../../utils/aiClient");
const tagCompliance = require("../../utils/complianceTagger");
const { sha256 } = require("../../utils/crypto");
const { getIo } = require("../../sockets/socketServer");
const { queryThreatIntel } = require("../../services/threatIntel.service");
const { analyzeUserBehavior } = require("../../services/ubaEngine");
const { triggerSOAR } = require("../../services/soarEngine");

const MOCK_EVENTS = [];
const MOCK_ALERTS = [];

/**
 * Ingests a new raw event, runs threat intelligence, custom rules, UBA, and triggers SOAR
 */
const ingestEvent = async (eventData) => {
  const sourceIP = eventData.sourceIP || "127.0.0.1";
  const destIP = eventData.destIP || "127.0.0.1";
  const eType = eventData.type || "normal";
  
  const date = new Date(eventData.timestamp || Date.now());
  date.setSeconds(0);
  date.setMilliseconds(0);
  const minTimestamp = date.toISOString();
  
  const fingerprintStr = `${sourceIP}|${destIP}|${eType}|${minTimestamp}`;
  const fingerprint = sha256(fingerprintStr);

  let existing = null;
  let dbOffline = mongoose.connection.readyState !== 1;

  if (!dbOffline) {
    try {
      existing = await Event.findOne({ fingerprint });
    } catch (err) {
      dbOffline = true;
    }
  }

  if (dbOffline) {
    existing = MOCK_EVENTS.find(e => e.fingerprint === fingerprint);
  }

  if (existing) {
    throw new Error("Duplicate event signature ignored.");
  }

  // --- 1. GEOLOCATE & AI THREAT CLASSIFIER ---
  const geo = await geolocate(sourceIP);
  const aiResult = await getThreatScore(eventData);
  let score = aiResult.score;
  
  if (eventData.isEmployeeReport) {
    score = eventData.severity === "High" ? 0.95 : eventData.severity === "Medium" ? 0.82 : 0.76;
  }

  // --- 2. THREAT INTEL REPUTATION ENRICHMENT ---
  try {
    const intel = await queryThreatIntel(sourceIP);
    if (intel && intel.verdict === "Malicious") {
      score = Math.max(score, intel.score / 100);
      eventData.intelThreatEnriched = true;
    }
  } catch (err) {
    console.warn("[Ingestion Pipeline Warning] Threat intelligence module offline.");
  }

  // --- 3. CUSTOM CORRELATION RULE ENGINE EVALUATION ---
  let ruleTriggered = null;
  let ruleSeverity = "Low";

  if (!dbOffline) {
    try {
      const activeRules = await Rule.find({ enabled: true });
      for (const rule of activeRules) {
        const val = String(eventData[rule.condition.field] || "");
        let matches = false;

        switch (rule.condition.operator) {
          case "equals":
            matches = val.toLowerCase() === rule.condition.value.toLowerCase();
            break;
          case "contains":
            matches = val.toLowerCase().includes(rule.condition.value.toLowerCase());
            break;
          case "regex":
            matches = new RegExp(rule.condition.value, "i").test(val);
            break;
          case "gt":
            matches = Number(val) > Number(rule.condition.value);
            break;
          case "lt":
            matches = Number(val) < Number(rule.condition.value);
            break;
          default:
            break;
        }

        if (matches) {
          if (rule.condition.threshold <= 1) {
            ruleTriggered = rule;
            ruleSeverity = rule.severity;
            break;
          } else {
            // Check frequency of events in time window
            const timeLimit = new Date(Date.now() - rule.condition.timeWindow * 1000);
            const count = await Event.countDocuments({
              sourceIP,
              type: eType,
              createdAt: { $gt: timeLimit }
            });
            if (count + 1 >= rule.condition.threshold) {
              ruleTriggered = rule;
              ruleSeverity = rule.severity;
              break;
            }
          }
        }
      }
    } catch (err) {
      console.warn("[Ingestion Pipeline Warning] Correlation rule engine query failed.");
    }
  }

  if (ruleTriggered) {
    console.log(`[Rule Engine Triggered] Matching Rule: "${ruleTriggered.name}" (Severity: ${ruleSeverity})`);
    score = Math.max(score, ruleSeverity === "Critical" ? 0.95 : ruleSeverity === "High" ? 0.85 : ruleSeverity === "Medium" ? 0.6 : 0.35);
  }

  const compliance = tagCompliance(eType);

  let severity = "Low";
  if (score >= 0.9) severity = "Critical";
  else if (score >= 0.7) severity = "High";
  else if (score >= 0.4) severity = "Medium";

  const eventPayload = {
    type: eType,
    protocol: eventData.protocol,
    srcPort: eventData.srcPort,
    destPort: eventData.destPort,
    bytes: eventData.bytes || 0,
    duration: eventData.duration || 0,
    requestCount: eventData.requestCount || 1,
    sourceIP,
    destIP,
    geo,
    fingerprint,
    threat: {
      score,
      label: ruleTriggered ? `Rule: ${ruleTriggered.name}` : aiResult.label,
      severity,
      confidence: aiResult.confidence
    },
    compliance,
    createdAt: new Date()
  };

  let eventObj = null;

  if (!dbOffline) {
    try {
      const event = new Event(eventPayload);
      eventObj = await event.save();
    } catch (err) {
      console.error("[Database Ingestion Error] Save failed:", err);
      dbOffline = true;
    }
  }

  if (dbOffline) {
    eventPayload._id = `mock-event-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    MOCK_EVENTS.push(eventPayload);
    eventObj = eventPayload;
  }

  // --- 4. USER BEHAVIOR ANALYTICS (UBA) ANOMALY ENGINE ---
  try {
    const mockEmail = eventData.userEmail || (eType === "brute_force" ? "suspicious_user@company.com" : "analyst@sentinelx.io");
    await analyzeUserBehavior(eventPayload, mockEmail);
  } catch (err) {
    console.warn("[Ingestion Pipeline Warning] User Behavior Analytics offline.");
  }

  const io = getIo();
  if (io) {
    io.emit("liveEvent", eventObj);
  }

  // --- 5. HIGH-RISK THREAT ALERT GENERATION & SOAR PLAYBOOKS ---
  if (score >= 0.7) {
    const alertCount = dbOffline ? MOCK_ALERTS.length : await Alert.countDocuments();
    const threatId = `TH${(alertCount + 1).toString().padStart(3, "0")}`;
    
    let affected = "Core Infrastructure";
    if (eType === "sql_injection") affected = "Database Server";
    else if (eType === "brute_force") affected = "Authentication Gateway";
    else if (eType === "ddos") affected = "Network Router";
    else if (eType === "data_exfiltration") affected = "File Server";
    else if (eType === "unauthorized_access") affected = "Corporate ID Gateway";
    
    if (eventData.isEmployeeReport) affected = "Employee Workstation";

    let description = `AI scored this alert as ${score.toFixed(2)} confidence. Detected abnormal query volumes or signatures.`;
    let remediation = `Isolate target node, rotate validation keyrings, check rulesets.`;

    if (ruleTriggered) {
      description = `SIEM Correlation Rule Match: Rule "${ruleTriggered.name}" evaluated as true for source IP ${sourceIP}.`;
      remediation = `Review active security group firewalls, inspect host logs for event type ${eType.toUpperCase()}.`;
    } else if (eventData.isEmployeeReport) {
      description = `Employee Incident Report: "${eventData.employeeDescription}". Manual security review requested.`;
      remediation = `Initiate remote workstation scan on device ${sourceIP}, verify mail logs, contact employee.`;
    } else if (eType === "brute_force") {
      description = `AI flagged brute-force anomaly: Too many failed login attempts (15+ requests) from same IP (${sourceIP}) targeting employee authentication.`;
      remediation = `Block source IP at firewall, trigger security account lockout, force mandatory corporate MFA verification.`;
    }

    const alertPayload = {
      eventId: eventObj._id,
      threatId,
      type: eType.replace("_", " ").toUpperCase(),
      severity,
      ip: sourceIP,
      affected,
      description,
      remediation,
      notes: [],
      createdAt: new Date()
    };

    let alertObj = null;
    if (!dbOffline) {
      try {
        const alert = new Alert(alertPayload);
        alertObj = await alert.save();
      } catch (err) {
        console.error("[Database Ingestion Error] Alert save failed:", err);
        dbOffline = true;
      }
    }

    if (dbOffline) {
      alertPayload._id = `mock-alert-${Date.now()}`;
      MOCK_ALERTS.push(alertPayload);
      alertObj = alertPayload;
    }
    
    if (io) {
      io.emit("liveAlert", alertObj);
    }

    // --- 6. TRIGGER SOAR AUTOMATION ---
    try {
      await triggerSOAR(alertObj);
    } catch (soarErr) {
      console.error("[SOAR Engine Error] Automated response trigger failed:", soarErr.message);
    }
  }

  return eventObj;
};

const getEvents = async (filters = {}, pagination = { page: 1, limit: 10 }) => {
  const skip = (pagination.page - 1) * pagination.limit;
  const dbOffline = mongoose.connection.readyState !== 1;
  
  if (!dbOffline) {
    try {
      const query = {};
      if (filters.severity) query["threat.severity"] = filters.severity;
      if (filters.type) query.type = filters.type;
      return await Event.find(query).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit);
    } catch (err) {}
  }
  
  let list = MOCK_EVENTS;
  if (filters.severity) list = list.filter(e => e.threat.severity === filters.severity);
  if (filters.type) list = list.filter(e => e.type === filters.type);
  return list.slice(skip, skip + pagination.limit);
};

const getStats = async () => {
  const dbOffline = mongoose.connection.readyState !== 1;
  
  if (!dbOffline) {
    try {
      const totalEvents = await Event.countDocuments();
      const totalAlerts = await Alert.countDocuments();
      const severityCounts = await Event.getSeverityCounts();
      const topIPs = await Event.getTopSourceIPs();
      return { totalEvents, totalAlerts, severityCounts, topIPs };
    } catch (err) {}
  }
  
  const severityCounts = {};
  MOCK_EVENTS.forEach(e => {
    const sev = e.threat.severity;
    severityCounts[sev] = (severityCounts[sev] || 0) + 1;
  });

  const topIPs = {};
  MOCK_EVENTS.forEach(e => {
    topIPs[e.sourceIP] = (topIPs[e.sourceIP] || 0) + 1;
  });

  return {
    totalEvents: MOCK_EVENTS.length,
    totalAlerts: MOCK_ALERTS.length,
    severityCounts: Object.keys(severityCounts).map(k => ({ _id: k, count: severityCounts[k] })),
    topIPs: Object.keys(topIPs).map(k => ({ _id: k, count: topIPs[k] })).sort((a,b)=>b.count-a.count).slice(0,5)
  };
};

module.exports = {
  ingestEvent,
  getEvents,
  getStats,
  MOCK_EVENTS,
  MOCK_ALERTS
};
