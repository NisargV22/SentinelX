const mongoose = require("mongoose");

const PlaybookSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  trigger_rules: [{ type: String }],
  steps: [{
    action: { type: String, enum: ["block_ip", "send_email", "create_case", "notify_slack", "auto_escalate"], required: true },
    target: { type: String },
    config: { type: mongoose.Schema.Types.Mixed, default: {} }
  }],
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Playbook || mongoose.model("Playbook", PlaybookSchema);
