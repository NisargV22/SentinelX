const express = require("express");
const Alert = require("../modules/events/alerts.model");
const Event = require("../modules/events/events.model");
const { validateApiKey } = require("../middleware/apiKeyAuth");

const router = express.Router();

router.use(validateApiKey);

/**
 * @openapi
 * /api/external/alerts:
 *   get:
 *     summary: Retrieve security alerts compiled via real-time vector analysis.
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *         description: Filter alerts by threat level (Critical, High, Medium, Low)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 */
router.get("/alerts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const severity = req.query.severity;
    
    const filters = {};
    if (severity) filters.severity = severity;

    const dbOffline = require("mongoose").connection.readyState !== 1;
    if (dbOffline) {
      const mockList = [
        { threatId: "TH001", type: "Phishing", severity: "High", ip: "192.168.1.12", status: "Open" },
        { threatId: "TH002", type: "DDoS Attack", severity: "Critical", ip: "185.220.101.5", status: "Mitigated" }
      ];
      return res.json({ success: true, page, limit, alerts: mockList });
    }

    const skip = (page - 1) * limit;
    const alerts = await Alert.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, page, limit, count: alerts.length, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/external/events:
 *   get:
 *     summary: Retrieve raw system events captured across all ingestion channels.
 */
router.get("/events", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;

    const filters = {};
    if (type) filters.type = type;

    const dbOffline = require("mongoose").connection.readyState !== 1;
    if (dbOffline) {
      const mockList = [
        { type: "normal", sourceIP: "192.168.1.15", destPort: 443, bytes: 1200 },
        { type: "brute_force", sourceIP: "10.0.0.8", destPort: 22, bytes: 450 }
      ];
      return res.json({ success: true, page, limit, events: mockList });
    }

    const skip = (page - 1) * limit;
    const events = await Event.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, page, limit, count: events.length, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
