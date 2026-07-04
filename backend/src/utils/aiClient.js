const axios = require("axios");
const { RULE_BASED_SCORES } = require("../config/constants");

const getThreatScore = async (event) => {
  const aiUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:5000/predict";
  
  try {
    const res = await axios.post(aiUrl, event, { 
      timeout: 2000,
      headers: {
        Connection: "close"
      }
    });
    return res.data;
  } catch (err) {
    console.warn("AI service unreachable. Falling back to rule-based heuristics.", err.message);
    
    const eType = event.type || "normal";
    const fallbackScore = RULE_BASED_SCORES[eType] || 0.5;
    
    return {
      score: fallbackScore,
      label: fallbackScore >= 0.7 ? "malicious" : "benign",
      confidence: 1.0,
      is_anomaly: fallbackScore > 0.65,
      feature_importances: [
        { feature: "event_type_fallback", importance: 1.0, value: 1.0 }
      ]
    };
  }
};

module.exports = { getThreatScore };
