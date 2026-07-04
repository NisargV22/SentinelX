const MAP = {
  normal: { nist: [], iso27001: [], gdpr: false },
  brute_force: {
    nist: ["PR.AC-1", "PR.AC-7", "DE.CM-1"],
    iso27001: ["A.5.15", "A.8.20"],
    gdpr: true
  },
  sql_injection: {
    nist: ["PR.DS-1", "DE.CM-1", "PR.PT-4"],
    iso27001: ["A.8.12", "A.8.23"],
    gdpr: true
  },
  ddos: {
    nist: ["PR.DS-4", "DE.CM-1", "RS.RP-1"],
    iso27001: ["A.8.20", "A.8.22"],
    gdpr: false
  },
  port_scan: {
    nist: ["DE.CM-1", "DE.AE-1"],
    iso27001: ["A.8.20"],
    gdpr: false
  },
  xss: {
    nist: ["PR.DS-1", "DE.CM-1"],
    iso27001: ["A.8.12", "A.8.23"],
    gdpr: true
  },
  credentials_stuffing: {
    nist: ["PR.AC-1", "PR.AC-7", "DE.CM-1"],
    iso27001: ["A.5.15", "A.8.20"],
    gdpr: true
  },
  anomaly: {
    nist: ["DE.AE-1", "DE.CM-1"],
    iso27001: ["A.8.20"],
    gdpr: false
  },
  privilege_escalation: {
    nist: ["PR.AC-1", "PR.AC-4", "DE.CM-1"],
    iso27001: ["A.5.15", "A.5.18"],
    gdpr: true
  },
  data_exfiltration: {
    nist: ["PR.DS-1", "PR.DS-5", "DE.CM-1"],
    iso27001: ["A.8.12", "A.8.24"],
    gdpr: true
  },
  unauthorized_access: {
    nist: ["PR.AC-1", "PR.AC-3", "DE.CM-1"],
    iso27001: ["A.5.15", "A.5.16"],
    gdpr: true
  }
};

const tagCompliance = (eventType) => {
  const cleanType = (eventType || "normal").toLowerCase();
  return MAP[cleanType] || { nist: [], iso27001: [], gdpr: false };
};

module.exports = tagCompliance;
