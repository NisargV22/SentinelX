const mongoose = require("mongoose");

const IncidentPlaybookSchema = new mongoose.Schema({
  threatId: { type: String, required: true, unique: true, index: true },
  playbookType: { type: String, enum: ["phishing", "ransomware", "ddos", "data_breach", "insider_threat"], required: true },
  steps: [{
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    completedBy: { type: String }
  }],
  status: { type: String, enum: ["In Progress", "Escalated", "Handoff", "Closed"], default: "In Progress" },
  owner: { type: String },
  timeElapsed: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.IncidentPlaybook || mongoose.model("IncidentPlaybook", IncidentPlaybookSchema);
