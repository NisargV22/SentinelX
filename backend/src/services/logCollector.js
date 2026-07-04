const fs = require("fs");
const path = require("path");
const dgram = require("dgram");
const eventsService = require("../modules/events/events.service");

// Log parser regular expressions
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

/**
 * Parses raw text log lines and maps them to structured SIEM events
 */
const parseRawLog = (textLine) => {
  const line = textLine.trim();
  if (!line) return null;

  // 1. Extract IPs
  const ips = line.match(IP_REGEX) || [];
  const sourceIP = ips[0] || "192.168.1.100";
  const destIP = ips[1] || "10.0.0.12";

  // 2. Classify event type based on text signatures
  let type = "normal";
  let destPort = 80;
  let protocol = "TCP";
  let bytes = 250;

  const lower = line.toLowerCase();
  if (lower.includes("failed login") || lower.includes("invalid user") || lower.includes("ssh")) {
    type = "brute_force";
    destPort = 22;
    protocol = "TCP";
  } else if (lower.includes("sql") || lower.includes("select") || lower.includes("union")) {
    type = "sql_injection";
    destPort = 80;
    protocol = "HTTP";
    bytes = 420;
  } else if (lower.includes("port scan") || lower.includes("nmap") || lower.includes("scan")) {
    type = "port_scan";
    destPort = 53;
    protocol = "TCP";
  } else if (lower.includes("ransomware") || lower.includes("malware") || lower.includes("trojan")) {
    type = "malware";
    destPort = 443;
    bytes = 820;
  } else if (lower.includes("phish") || lower.includes("credential harvesting")) {
    type = "phishing";
    destPort = 80;
  }

  return {
    sourceIP,
    destIP,
    type,
    protocol,
    srcPort: Math.floor(1024 + Math.random() * 60000),
    destPort,
    bytes,
    duration: 5,
    requestCount: 1,
    timestamp: new Date().toISOString()
  };
};

/**
 * Ingests a parsed log object through the SIEM pipeline
 */
const ingestParsedLog = async (parsedLog, sourceChannel) => {
  try {
    const event = await eventsService.ingestEvent(parsedLog);
    console.log(`[Collector: ${sourceChannel}] Log Ingested: ${event.type.toUpperCase()} from ${event.sourceIP} (ID: ${event._id.substring(0, 8).toUpperCase()})`);
  } catch (err) {
    if (err.message.includes("Duplicate event signature")) {
      // Ignore duplicate logs gracefully
      return;
    }
    console.error(`[Collector Error: ${sourceChannel}] Ingestion failed:`, err.message);
  }
};

/**
 * Initializes the log collector channels
 */
const initLogCollector = (workspaceRoot = process.cwd()) => {
  console.log("Initializing Unified SIEM Log Collector...");

  // --- CHANNEL 1: LOCAL LOG FILE WATCHER ---
  const logsDir = path.join(workspaceRoot, "logs");
  const logFilePath = path.join(logsDir, "external_source.log");

  // Ensure logs directory and file exist
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, "# SentinelX SIEM External Audit Log Channel\n", "utf8");
  }

  console.log(`Watching log file channel: ${logFilePath}`);

  let currentSize = fs.statSync(logFilePath).size;

  // Poll log file changes (robust cross-platform file watch)
  setInterval(() => {
    try {
      const stats = fs.statSync(logFilePath);
      if (stats.size > currentSize) {
        const fd = fs.openSync(logFilePath, "r");
        const bufferSize = stats.size - currentSize;
        const buffer = Buffer.alloc(bufferSize);
        
        fs.readSync(fd, buffer, 0, bufferSize, currentSize);
        fs.closeSync(fd);

        currentSize = stats.size;

        // Parse new lines
        const newText = buffer.toString("utf8");
        const lines = newText.split("\n");
        for (const line of lines) {
          const parsed = parseRawLog(line);
          if (parsed) {
            ingestParsedLog(parsed, "FILE_WATCHER");
          }
        }
      } else if (stats.size < currentSize) {
        // Log truncated/rotated
        currentSize = stats.size;
      }
    } catch (err) {
      console.error("[Collector: FILE_WATCHER] Read error:", err.message);
    }
  }, 1000);

  // --- CHANNEL 2: UDP SYSLOG LISTENER ---
  const udpServer = dgram.createSocket("udp4");

  udpServer.on("message", (msg, rinfo) => {
    const rawLine = msg.toString("utf8");
    const parsed = parseRawLog(rawLine);
    if (parsed) {
      parsed.sourceIP = rinfo.address; // Set source IP to the sender's network IP
      ingestParsedLog(parsed, `UDP_SYSLOG:${rinfo.port}`);
    }
  });

  udpServer.on("error", (err) => {
    console.error("[Collector: UDP_SYSLOG] Server error:", err.message);
  });

  // Bind to standard syslog port (514) with fallback to custom port (5140) if blocked
  const PRIMARY_PORT = 514;
  const FALLBACK_PORT = 5140;

  udpServer.bind(PRIMARY_PORT, () => {
    console.log(`[Collector: UDP_SYSLOG] Listening on standard port: ${PRIMARY_PORT}`);
  });

  udpServer.on("error", (err) => {
    if (err.code === "EACCES" || err.code === "EADDRINUSE") {
      console.warn(`[Collector: UDP_SYSLOG] Standard Port ${PRIMARY_PORT} busy/restricted. Falling back to port ${FALLBACK_PORT}...`);
      const fallbackServer = dgram.createSocket("udp4");
      fallbackServer.on("message", (msg, rinfo) => {
        const parsed = parseRawLog(msg.toString("utf8"));
        if (parsed) {
          parsed.sourceIP = rinfo.address;
          ingestParsedLog(parsed, `UDP_SYSLOG_FALLBACK:${rinfo.port}`);
        }
      });
      fallbackServer.bind(FALLBACK_PORT, () => {
        console.log(`[Collector: UDP_SYSLOG] Fallback receiver online on port: ${FALLBACK_PORT}`);
      });
    }
  });
};

module.exports = { initLogCollector };
