const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  condition: {
    field: { type: String, required: true },
    operator: { type: String, enum: ["regex", "equals", "contains", "gt", "lt"], required: true },
    value: { type: String, required: true },
    timeWindow: { type: Number, default: 60 },
    threshold: { type: Number, default: 1 }
  },
  action: { type: String, enum: ["alert", "soar", "ignore"], default: "alert" },
  severity: { type: String, enum: ["Critical", "High", "Medium", "Low"], default: "Medium" },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Rule || mongoose.model("Rule", RuleSchema);
