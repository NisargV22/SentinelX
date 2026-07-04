const express = require("express");
const blockchainController = require("./blockchain.controller");
const { auth } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");

const router = express.Router();

router.get("/records", auth, authorize("soc", "admin"), blockchainController.getRecords);
router.post("/verify/:batchId", auth, authorize("soc", "admin"), blockchainController.verifyBatchRecord);
router.post("/anchor", auth, authorize("soc"), blockchainController.anchorNow);

module.exports = router;
