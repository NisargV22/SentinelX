const axios = require("axios");

async function checkServer() {
  console.log("Querying live Express server health API...");
  try {
    // 1. Log in to get JWT token
    const loginRes = await axios.post("http://127.0.0.1:4000/api/auth/login", {
      email: "analyst1@sentinelx.io",
      password: "Analyst@123456"
    });
    
    const token = loginRes.data.accessToken;
    console.log("Logged in successfully. Token acquired.");

    // 2. Fetch system health endpoint
    const res = await axios.get("http://127.0.0.1:4000/api/system/health", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("\nLive API Response:\n", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("\nError querying endpoint:", err.response ? err.response.data : err.message);
  }
}

checkServer();
