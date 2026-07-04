const axios = require("axios");

async function check() {
  try {
    // 1. Log in to get JWT token
    const loginRes = await axios.post("http://127.0.0.1:4000/api/auth/login", {
      email: "analyst1@sentinelx.io",
      password: "Analyst@123456"
    });
    const token = loginRes.data.accessToken;

    // 2. Fetch blockchain records from API
    const res = await axios.get("http://127.0.0.1:4000/api/blockchain/records?limit=10", {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("=== API RECORDS RESPONSE ===");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("API request failed:", err.response ? err.response.data : err.message);
  }
}

check();
