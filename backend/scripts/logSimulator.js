const axios = require("axios");

const EVENT_TYPES = [
  { type: "normal", weight: 0.3 },
  { type: "brute_force", weight: 0.2 },
  { type: "sql_injection", weight: 0.1 },
  { type: "ddos", weight: 0.08 },
  { type: "port_scan", weight: 0.08 },
  { type: "xss", weight: 0.06 },
  { type: "credentials_stuffing", weight: 0.05 },
  { type: "anomaly", weight: 0.03 },
  { type: "privilege_escalation", weight: 0.03 },
  { type: "data_exfiltration", weight: 0.03 },
  { type: "unauthorized_access", weight: 0.14 }
];

const selectRandomType = () => {
  const r = Math.random();
  let cumulative = 0;
  for (const et of EVENT_TYPES) {
    cumulative += et.weight;
    if (r <= cumulative) return et.type;
  }
  return "normal";
};

let persistentAttackerIP = "198.51.100.42";
let bruteForceCount = 0;
let eventSeq = 0; // Incrementing sequence count

const generateMockEvent = () => {
  const type = selectRandomType();
  const protocols = {
    normal: ["HTTP", "HTTPS", "DNS", "TCP"],
    brute_force: ["SSH"],
    sql_injection: ["HTTP", "HTTPS"],
    ddos: ["UDP"],
    port_scan: ["TCP"],
    xss: ["HTTP"],
    credentials_stuffing: ["HTTPS"],
    anomaly: ["TCP"],
    privilege_escalation: ["SSH"],
    data_exfiltration: ["DNS"],
    unauthorized_access: ["FTP"]
  };

  const selectedProto = protocols[type] ? protocols[type][Math.floor(Math.random() * protocols[type].length)] : "TCP";

  let sourceIP = "";
  let requestCount = 1;
  let bytes = Math.floor(100 + Math.random() * 2000);

  if (type === "normal") {
    sourceIP = `192.168.1.${Math.floor(2 + Math.random() * 253)}`;
  } else if (type === "brute_force") {
    sourceIP = persistentAttackerIP;
    bruteForceCount++;
    requestCount = 10 + bruteForceCount;
    if (bruteForceCount > 5) {
      persistentAttackerIP = `${Math.floor(180 + Math.random() * 40)}.${Math.floor(10 + Math.random() * 200)}.${Math.floor(10 + Math.random() * 200)}.${Math.floor(1 + Math.random() * 250)}`;
      bruteForceCount = 0;
    }
  } else if (type === "unauthorized_access") {
    sourceIP = `185.220.101.${Math.floor(1 + Math.random() * 254)}`;
    requestCount = 1;
    bytes = 450;
  } else {
    sourceIP = `${Math.floor(1 + Math.random() * 254)}.${Math.floor(1 + Math.random() * 254)}.${Math.floor(1 + Math.random() * 254)}.${Math.floor(1 + Math.random() * 254)}`;
  }

  eventSeq++; // Increment telemetry sequence

  return {
    type,
    protocol: selectedProto,
    srcPort: Math.floor(1024 + Math.random() * 64511),
    destPort: type === "brute_force" ? 22 : type === "data_exfiltration" ? 53 : type === "unauthorized_access" ? 21 : 80,
    bytes,
    duration: Math.floor(1 + Math.random() * 60),
    requestCount,
    sourceIP,
    destIP: "10.0.0.12",
    severity: type === "normal" ? "Low" : type === "ddos" || type === "privilege_escalation" ? "Critical" : "High",
    timestamp: new Date().toISOString(),
    sequenceNo: eventSeq // Pass sequence count
  };
};

const runSimulator = () => {
  console.log("SentinelX Security Event Log Simulator initiated...");
  
  setInterval(async () => {
    try {
      const event = generateMockEvent();
      const res = await axios.post("http://127.0.0.1:4000/api/events", event, {
        headers: { "x-agent-id": "simulated-soc-agent" }
      });
      console.log(`[Simulator Log] Ingested: ${event.type} (#${event.sequenceNo}) from ${event.sourceIP} (Response: ${res.data.eventId || res.data.status})`);
    } catch (err) {
      console.error(`[Simulator Error] Failed to send log event: ${err.message}`);
    }
  }, 2000);
};

runSimulator();
