const jwt = require("jsonwebtoken");
const { ingestEvent } = require("../modules/events/events.service");

/**
 * Global SIEM Auditor Middleware - intercepts and logs user modifications and control actions
 */
const siemAuditor = async (req, res, next) => {
  // 1. Silent token extraction
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  let user = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "SentinelXJWTSecretSentinelXJWTSecret");
      user = decoded;
      req.user = decoded; // Populate req.user for downstream use
    } catch (err) {
      // silent fail - do not block request
    }
  }

  // Intercept the response completion
  res.on("finish", () => {
    const { method, path } = req;
    
    // Ignore polling endpoints to prevent log bloat loops
    if (path.includes("/stats") || path.includes("/alerts") || (method === "GET" && path === "/api/events")) {
      return;
    }

    let actionType = null;
    let description = "";

    if (path.startsWith("/api/rules")) {
      if (method === "POST") actionType = "create_rule";
      else if (method === "PUT") actionType = "update_rule";
      else if (method === "DELETE") actionType = "delete_rule";
      description = `User correlation rule configuration changed on endpoint: ${path}`;
    } else if (path.startsWith("/api/playbooks")) {
      if (method === "POST") actionType = "create_playbook";
      else if (method === "PUT") actionType = "update_playbook";
      else if (method === "DELETE") actionType = "delete_playbook";
      description = `SOAR automated response playbook edited: ${path}`;
    } else if (path.startsWith("/api/edr/")) {
      actionType = "edr_command";
      description = `EDR mitigation action initiated: ${path.replace("/api/edr/", "").toUpperCase()}`;
    } else if (path.startsWith("/api/retention")) {
      actionType = "retention_policy_change";
      description = `Database log aging retention policy adjusted.`;
    } else if (path.startsWith("/api/api-keys")) {
      if (method === "POST") actionType = "generate_api_key";
      else if (method === "DELETE") actionType = "revoke_api_key";
      description = `Integration credentials token keyring modified.`;
    } else if (path.startsWith("/api/incident-playbooks")) {
      actionType = "sop_playbook_update";
      description = `Incident response run-book checklist step toggled or closed.`;
    } else if (path.startsWith("/api/events") && method === "POST" && req.body.isEmployeeReport) {
      actionType = "employee_incident_report";
      description = `Employee reported host security incident vector.`;
    }

    if (actionType) {
      const sourceIP = req.ip || "127.0.0.1";
      const userEmail = user ? user.email : "anonymous@sentinelx.io";
      
      console.log(`[SIEM Auditor] Logging Action: ${actionType} by ${userEmail} (${sourceIP})`);
      
      // Ingest this action log directly into the SIEM Event store
      ingestEvent({
        type: actionType,
        protocol: "HTTPS",
        srcPort: 443,
        destPort: 443,
        bytes: req.socket.bytesRead || 250,
        duration: 0,
        requestCount: 1,
        sourceIP,
        destIP: "127.0.0.1",
        userEmail,
        isEmployeeReport: false,
        severity: "Low",
        timestamp: new Date().toISOString()
      }).catch((err) => {
        console.error("[SIEM Auditor Error] Failed to write audit event log:", err.message);
      });
    }
  });

  next();
};

module.exports = siemAuditor;
