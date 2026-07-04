const mongoose = require("mongoose");

const ApiKeySchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ["soc", "admin", "external_agent"], default: "external_agent" },
  createdBy: { type: String, required: true },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.ApiKey || mongoose.model("ApiKey", ApiKeySchema);
