module.exports = {
  ROLES: {
    ADMIN: "admin",
    SOC: "soc",
    EMPLOYEE: "employee"
  },
  ATTACK_TYPES: [
    "normal", "brute_force", "sql_injection", "ddos", "port_scan",
    "xss", "credentials_stuffing", "anomaly", "privilege_escalation",
    "data_exfiltration", "unauthorized_access"
  ],
  RULE_BASED_SCORES: {
    normal: 0.05,
    port_scan: 0.45,
    unauthorized_access: 0.55,
    xss: 0.60,
    anomaly: 0.65,
    brute_force: 0.85,
    sql_injection: 0.90,
    credentials_stuffing: 0.88,
    data_exfiltration: 0.92,
    ddos: 0.98,
    privilege_escalation: 0.99
  }
};
