const express = require("express");
const complianceService = require("./compliance.service");
const { auth } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");

const router = express.Router();

router.get("/stats", auth, authorize("soc", "admin"), async (req, res, next) => {
  try {
    const stats = await complianceService.getComplianceStats();
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
