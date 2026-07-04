const express = require("express");
const eventsService = require("./events.service");
const Alert = require("./alerts.model");
const { auth } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const agentId = req.headers["x-agent-id"] || "unknown-agent";
    const event = await eventsService.ingestEvent(req.body);
    res.status(201).json({ success: true, agentId, eventId: event._id });
  } catch (err) {
    if (err.message.includes("Duplicate event")) {
      return res.status(200).json({ success: true, status: "duplicate_ignored" });
    }
    next(err);
  }
});

router.get("/", auth, authorize("soc", "admin"), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const severity = req.query.severity;
    
    const filters = {};
    if (severity && severity !== "all") filters.severity = severity;

    const events = await eventsService.getEvents(filters, { page, limit });
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
});

router.get("/stats", auth, authorize("soc", "admin"), async (req, res, next) => {
  try {
    const stats = await eventsService.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
});

router.get("/alerts", auth, authorize("soc", "admin"), async (req, res, next) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (err) {
    res.json({ success: true, alerts: eventsService.MOCK_ALERTS });
  }
});

router.patch("/alerts/:id", auth, authorize("soc", "admin"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    let alert = null;
    let dbOffline = false;
    try {
      alert = await Alert.findById(id);
    } catch (e) {
      dbOffline = true;
      alert = eventsService.MOCK_ALERTS.find(a => a._id === id);
    }
    
    if (!alert) {
      return res.status(404).json({ success: false, message: "Alert not found" });
    }
    
    if (status) alert.status = status;
    if (note) {
      alert.notes.push({
        user: req.user.name || req.user.email,
        text: note,
        createdAt: new Date()
      });
    }
    
    if (!dbOffline) {
      await alert.save();
    }
    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
