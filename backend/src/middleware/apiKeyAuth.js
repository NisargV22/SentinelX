const ApiKey = require("../modules/auth/apiKey.model");

const validateApiKey = async (req, res, next) => {
  const apiKeyHeader = req.headers["x-api-key"] || req.query.apiKey;
  if (!apiKeyHeader) {
    return res.status(401).json({ success: false, message: "Access Denied: X-API-KEY header missing." });
  }

  const dbOffline = require("mongoose").connection.readyState !== 1;
  if (dbOffline) {
    // Permissive offline mock key for demo verification
    if (apiKeyHeader.length === 32) {
      req.externalRole = "external_agent";
      return next();
    }
    return res.status(401).json({ success: false, message: "Access Denied: Invalid mock API Key." });
  }

  try {
    const keyRecord = await ApiKey.findOne({ key: apiKeyHeader, enabled: true });
    if (!keyRecord) {
      return res.status(401).json({ success: false, message: "Access Denied: Invalid or revoked API Key." });
    }
    req.externalRole = keyRecord.role;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "External authentication system failure." });
  }
};

module.exports = { validateApiKey };
