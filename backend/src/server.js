require("dotenv").config();
const http = require("http");
const path = require("path");
const app = require("./app");
const connectDB = require("./config/database");
const redisClient = require("./config/redis");
const { initBlockchain } = require("./config/blockchain");
const { initSocketServer } = require("./sockets/socketServer");
const { startScheduledAnchoring, stopScheduledAnchoring } = require("./modules/blockchain/blockchain.service");
const { initLogCollector } = require("./services/logCollector");
const { initSecurityWorkers } = require("./services/secWorkers");

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const startServer = async () => {
  await connectDB();

  try {
    await redisClient.connect();
  } catch (err) {
    // handled inside config
  }

  initBlockchain();
  initSocketServer(server);
  startScheduledAnchoring();
  initLogCollector(path.join(__dirname, "../..")); // Pass workspace root folder to collector
  initSecurityWorkers(); // Start background policy daemons

  server.listen(PORT, () => {
    console.log(`SentinelX SecOps Platform Backend listening on port: ${PORT}`);
  });
};

const shutdown = () => {
  console.log("Graceful shutdown sequence initiated...");
  stopScheduledAnchoring();
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      const mongoose = require("mongoose");
      await mongoose.connection.close();
      console.log("Database connection closed.");
      await redisClient.quit();
      console.log("Redis client closed.");
    } catch (err) {
      // silent pass
    }
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer().catch((err) => {
  console.error("Server failed to start:", err.message);
  process.exit(1);
});
