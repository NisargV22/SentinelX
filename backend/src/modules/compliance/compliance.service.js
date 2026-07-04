const Event = require("../events/events.model");

const NIST_CATALOG = ["PR.AC-1", "PR.AC-3", "PR.AC-4", "PR.AC-7", "PR.DS-1", "PR.DS-4", "PR.DS-5", "PR.PT-4", "DE.CM-1", "DE.AE-1", "RS.RP-1", "RS.AN-1"];
const ISO_CATALOG = ["A.5.15", "A.5.16", "A.5.18", "A.8.12", "A.8.20", "A.8.22", "A.8.23", "A.8.24"];

const getComplianceStats = async () => {
  const nistCounts = await Event.aggregate([
    { $unwind: "$compliance.nist" },
    { $group: { _id: "$compliance.nist", count: { $sum: 1 } } }
  ]);
  
  const isoCounts = await Event.aggregate([
    { $unwind: "$compliance.iso27001" },
    { $group: { _id: "$compliance.iso27001", count: { $sum: 1 } } }
  ]);

  const gdprLogsCount = await Event.countDocuments({ "compliance.gdpr": true });

  const nistHitMap = {};
  nistCounts.forEach(c => nistHitMap[c._id] = c.count);

  const isoHitMap = {};
  isoCounts.forEach(c => isoHitMap[c._id] = c.count);

  const nistActive = NIST_CATALOG.filter(c => nistHitMap[c] > 0).length;
  const isoActive = ISO_CATALOG.filter(c => isoHitMap[c] > 0).length;

  return {
    nist: {
      active: nistActive,
      total: NIST_CATALOG.length,
      percentage: (nistActive / NIST_CATALOG.length) * 100,
      details: NIST_CATALOG.map(c => ({ control: c, count: nistHitMap[c] || 0 }))
    },
    iso: {
      active: isoActive,
      total: ISO_CATALOG.length,
      percentage: (isoActive / ISO_CATALOG.length) * 100,
      details: ISO_CATALOG.map(c => ({ control: c, count: isoHitMap[c] || 0 }))
    },
    gdpr: {
      securedLogsCount: gdprLogsCount,
      percentage: gdprLogsCount > 0 ? 100.0 : 0.0
    }
  };
};

module.exports = {
  getComplianceStats
};
