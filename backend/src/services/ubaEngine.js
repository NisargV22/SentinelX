const { UserBaseline, UbaAlert } = require("../modules/events/uba.model");
const { getIo } = require("../sockets/socketServer");

const analyzeUserBehavior = async (eventData, userEmail) => {
  if (!userEmail) return;
  const dbOffline = require("mongoose").connection.readyState !== 1;

  let baseline = null;
  if (!dbOffline) {
    try {
      baseline = await UserBaseline.findOne({ userId: userEmail });
      if (!baseline) {
        baseline = new UserBaseline({
          userId: userEmail,
          typicalPorts: [80, 443],
          allowedLocations: ["US", "IN", "US/Local"],
          avgBytesTransferred: 1500,
          rollingCount: 1
        });
        await baseline.save();
      }
    } catch (err) {}
  }

  if (!baseline) {
    baseline = {
      userId: userEmail,
      avgLoginHour: 12,
      allowedLocations: ["US", "IN"],
      typicalPorts: [80, 443, 22],
      avgBytesTransferred: 1000
    };
  }

  const date = new Date(eventData.timestamp || Date.now());
  const currentHour = date.getHours();
  const currentPort = eventData.destPort || 80;
  const currentBytes = eventData.bytes || 0;
  const location = eventData.geo?.country || "US";

  let anomalyTriggered = false;
  let anomalyType = "";
  let details = "";
  let severity = "Medium";

  // 1. Off-hours check (10 PM to 6 AM)
  if (currentHour >= 22 || currentHour < 6) {
    anomalyTriggered = true;
    anomalyType = "off_hours";
    details = `Access logged at ${currentHour}:00 from user ${userEmail}. Normal baseline average: ${baseline.avgLoginHour}:00.`;
    severity = "Medium";
  }
  // 2. Unusual location check
  else if (location && !baseline.allowedLocations.includes(location) && location !== "Unknown") {
    anomalyTriggered = true;
    anomalyType = "unusual_location";
    details = `Access logged from location ${location} for user ${userEmail}. Registered home base: ${baseline.allowedLocations.join(", ")}.`;
    severity = "High";
  }
  // 3. Unusual port check
  else if (currentPort && !baseline.typicalPorts.includes(currentPort)) {
    anomalyTriggered = true;
    anomalyType = "unusual_port";
    details = `Traffic logged over unapproved destination port: ${currentPort}. Typical user channels: ${baseline.typicalPorts.join(", ")}.`;
    severity = "Low";
  }
  // 4. Data exfiltration check (5x average transfer threshold)
  else if (currentBytes > baseline.avgBytesTransferred * 5) {
    anomalyTriggered = true;
    anomalyType = "exfiltration";
    details = `High-volume transfer logged: ${currentBytes} Bytes. Historical baseline limit: ${baseline.avgBytesTransferred} Bytes.`;
    severity = "Critical";
  }

  if (anomalyTriggered) {
    const alertPayload = {
      userId: userEmail,
      anomalyType,
      timestamp: new Date(),
      details,
      severity
    };

    console.log(`[UBA Engine] Triggered anomaly "${anomalyType}" for user: ${userEmail}`);

    if (!dbOffline) {
      try {
        const ubaAlert = new UbaAlert(alertPayload);
        const saved = await ubaAlert.save();
        
        const io = getIo();
        if (io) {
          io.emit("ubaAnomaly", saved);
        }
      } catch (err) {}
    } else {
      const io = getIo();
      if (io) {
        io.emit("ubaAnomaly", { ...alertPayload, _id: `mock-uba-${Date.now()}` });
      }
    }
  }

  if (!dbOffline && baseline._id) {
    try {
      const newCount = (baseline.rollingCount || 1) + 1;
      const newAvgBytes = Math.floor(((baseline.avgBytesTransferred || 1500) * (baseline.rollingCount || 1) + currentBytes) / newCount);
      
      const updateData = {
        rollingCount: newCount,
        avgBytesTransferred: newAvgBytes
      };

      if (currentPort && !baseline.typicalPorts.includes(currentPort)) {
        updateData.$push = { typicalPorts: currentPort };
      }

      await UserBaseline.findByIdAndUpdate(baseline._id, updateData);
    } catch (err) {}
  }
};

module.exports = { analyzeUserBehavior };
