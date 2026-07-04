const mongoose = require("mongoose");

const GeoSchema = new mongoose.Schema({
  country: { type: String, default: "Unknown" },
  city: { type: String, default: "Unknown" },
  lat: { type: Number, default: 0 },
  lon: { type: Number, default: 0 }
}, { _id: false });

const EventSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  protocol: { type: String, required: true },
  srcPort: { type: Number },
  destPort: { type: Number },
  bytes: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  requestCount: { type: Number, default: 1 },
  sourceIP: { type: String, required: true, index: true },
  destIP: { type: String },
  geo: GeoSchema,
  fingerprint: { type: String, unique: true, index: true },
  threat: {
    score: { type: Number, default: 0.0, index: true },
    label: { type: String, default: "benign" },
    severity: { type: String, default: "Low", index: true },
    confidence: { type: Number, default: 1.0 }
  },
  compliance: {
    nist: [{ type: String }],
    iso27001: [{ type: String }],
    gdpr: { type: Boolean, default: false }
  }
}, { timestamps: true });

EventSchema.statics.getSeverityCounts = function () {
  return this.aggregate([
    { $group: { _id: "$threat.severity", count: { $sum: 1 } } }
  ]);
};

EventSchema.statics.getTopSourceIPs = function (limit = 5) {
  return this.aggregate([
    { $group: { _id: "$sourceIP", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

EventSchema.statics.getHourlyTrend = function () {
  return this.aggregate([
    {
      $group: {
        _id: {
          hour: { $hour: "$createdAt" },
          label: "$threat.label"
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.hour": 1 } }
  ]);
};

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
module.exports = Event;
