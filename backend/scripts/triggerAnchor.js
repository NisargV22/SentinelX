const axios = require("axios");

async function run() {
  console.log("=== TRIGGERING LOG INGESTION AND ANCHORING ===");
  try {
    // 1. Log in (this creates a fresh audit log entry in the last 2 minutes!)
    const loginRes = await axios.post("http://127.0.0.1:4000/api/auth/login", {
      email: "analyst1@sentinelx.io",
      password: "Analyst@123456"
    });
    const token = loginRes.data.accessToken;
    console.log("Logged in successfully. Token acquired. Fresh audit log generated.");

    // Wait 1.5 seconds for write to complete
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Call anchor API to anchor the new audit log immediately
    const res = await axios.post("http://127.0.0.1:4000/api/blockchain/anchor", {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("\nAnchor API Response:\n", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Failed to trigger anchoring:", err.response ? err.response.data : err.message);
  }
}

run();
