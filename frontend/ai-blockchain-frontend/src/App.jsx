import { useState, useEffect } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function App() {

  const [time, setTime] = useState(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pieData = [
    { name: "Phishing", value: 40 },
    { name: "Malware", value: 30 },
    { name: "DDoS", value: 20 },
    { name: "Others", value: 10 },
  ];

  const barData = [
    { day: "Mon", attacks: 12 },
    { day: "Tue", attacks: 19 },
    { day: "Wed", attacks: 15 },
    { day: "Thu", attacks: 28 },
    { day: "Fri", attacks: 22 },
    { day: "Sat", attacks: 31 },
    { day: "Sun", attacks: 18 },
  ];

  const COLORS = ["#00ff88", "#ff4444", "#ffaa00", "#4488ff"];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 p-4 flex justify-between">
        <h1 className="text-2xl font-bold text-green-400">
          SentinelX
        </h1>

       <div className="flex items-center gap-6">

  <div className="bg-black border border-green-500 px-3 py-1 rounded-lg text-center">
  <p className="text-[10px] text-gray-400">System Time</p>
  <p className="text-green-400 font-bold text-sm">
    {time}
  </p>
</div>

  <button>Dashboard</button>
  <button>Threats</button>
  <button>Blockchain Logs</button>
  <button>Reports</button>

</div>
      </nav>

      <div className="p-10">

        {/* Header */}
<div className="flex justify-between items-center">

  <div>
    <h2 className="text-4xl font-bold text-green-400">
      Cyber Threat Monitoring Dashboard
    </h2>

    <p className="mt-4 text-gray-300">
      Real-Time AI + Blockchain Security Platform
    </p>
  </div>

  <button
    className="bg-green-500 text-black px-5 py-3 rounded-lg font-bold hover:bg-green-400 transition"
  >
    Export Security Report
  </button>

</div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">

          <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
            <h3 className="text-gray-400">Threats Detected</h3>
            <p className="text-3xl font-bold text-red-500">24</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
            <h3 className="text-gray-400">Blocked Attacks</h3>
            <p className="text-3xl font-bold text-green-500">18</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
            <h3 className="text-gray-400">Blockchain Logs</h3>
            <p className="text-3xl font-bold text-blue-500">120</p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
            <h3 className="text-gray-400">AI Risk Score</h3>
            <p className="text-3xl font-bold text-yellow-500">82%</p>
          </div>

        </div>
{/* Security KPI Section */}
<div className="mt-10">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    Security KPI Metrics
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Detection Accuracy</h4>
      <p className="text-3xl font-bold text-green-400">98%</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">False Positive Rate</h4>
      <p className="text-3xl font-bold text-red-400">2%</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Response Time</h4>
      <p className="text-3xl font-bold text-blue-400">0.8s</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Blockchain Verification</h4>
      <p className="text-3xl font-bold text-yellow-400">99.9%</p>
    </div>

  </div>

</div>
        {/* Recent Threat Alerts */}
        <div className="mt-12">

          <h3 className="text-2xl font-bold text-green-400 mb-4">
            Recent Threat Alerts
          </h3>

          <div className="bg-gray-900 rounded-xl border border-green-500 overflow-hidden">

            <table className="w-full">

              <thead className="bg-gray-800">
                <tr>
                  <th className="p-4 text-left">Threat ID</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Severity</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-t border-gray-700">
                  <td className="p-4">TH001</td>
                  <td className="p-4">Phishing</td>
                  <td className="p-4 text-red-500">High</td>
                  <td className="p-4 text-green-500">Blocked</td>
                </tr>

                <tr className="border-t border-gray-700">
                  <td className="p-4">TH002</td>
                  <td className="p-4">Malware</td>
                  <td className="p-4 text-yellow-500">Medium</td>
                  <td className="p-4 text-green-500">Blocked</td>
                </tr>

                <tr className="border-t border-gray-700">
                  <td className="p-4">TH003</td>
                  <td className="p-4">DDoS Attack</td>
                  <td className="p-4 text-red-500">Critical</td>
                  <td className="p-4 text-green-500">Mitigated</td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

        {/* Live Threat Feed */}
        <div className="mt-12">

          <h3 className="text-2xl font-bold text-green-400 mb-4">
            Live Threat Feed
          </h3>

          <div className="bg-gray-900 p-6 rounded-xl border border-green-500">

            <ul className="space-y-4 text-lg">

              <li className="text-red-400">
                🔴 Suspicious Login Attempt Detected
              </li>

              <li className="text-yellow-400">
                🟡 Malware Signature Found in Email Attachment
              </li>

              <li className="text-green-400">
                🟢 Threat Successfully Mitigated
              </li>

            </ul>

          </div>

        </div>

        {/* AI Prediction Panel */}
        <div className="mt-12">

          <h3 className="text-2xl font-bold text-green-400 mb-4">
            AI Threat Prediction Panel
          </h3>

          <div className="bg-gray-900 rounded-xl border border-green-500 overflow-hidden">

            <table className="w-full">

              <thead className="bg-gray-800">
                <tr>
                  <th className="p-4 text-left">Predicted Threat</th>
                  <th className="p-4 text-left">Confidence</th>
                  <th className="p-4 text-left">Risk Level</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-t border-gray-700">
                  <td className="p-4">Phishing Campaign</td>
                  <td className="p-4">92%</td>
                  <td className="p-4 text-red-500">High</td>
                </tr>

                <tr className="border-t border-gray-700">
                  <td className="p-4">Malware Infection</td>
                  <td className="p-4">84%</td>
                  <td className="p-4 text-yellow-500">Medium</td>
                </tr>

                <tr className="border-t border-gray-700">
                  <td className="p-4">DDoS Attack</td>
                  <td className="p-4">78%</td>
                  <td className="p-4 text-red-500">High</td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

        {/* Blockchain Logs */}
        <div className="mt-12">

          <h3 className="text-2xl font-bold text-green-400 mb-4">
            Blockchain Verification Logs
          </h3>

          <div className="bg-gray-900 border border-green-500 rounded-xl overflow-hidden">

            <table className="w-full">

              <thead className="bg-gray-800">
                <tr>
                  <th className="p-4 text-left">Block ID</th>
                  <th className="p-4 text-left">Hash</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Timestamp</th>
                </tr>
              </thead>

              <tbody>

                <tr className="border-t border-gray-700">
                  <td className="p-4">BLK001</td>
                  <td className="p-4 text-blue-400">8f4a2c91ab5e...</td>
                  <td className="p-4 text-green-500">Verified</td>
                  <td className="p-4">12:01 PM</td>
                </tr>

                <tr className="border-t border-gray-700">
                  <td className="p-4">BLK002</td>
                  <td className="p-4 text-blue-400">9a5d7e32fd91...</td>
                  <td className="p-4 text-green-500">Verified</td>
                  <td className="p-4">12:05 PM</td>
                </tr>

                <tr className="border-t border-gray-700">
                  <td className="p-4">BLK003</td>
                  <td className="p-4 text-blue-400">c7f8b1a4ef22...</td>
                  <td className="p-4 text-yellow-500">Pending</td>
                  <td className="p-4">12:10 PM</td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

        {/* Blockchain Integrity Score */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    Blockchain Integrity Score
  </h3>

  <div className="bg-gray-900 border border-green-500 rounded-xl p-10 text-center">

    <p className="text-gray-400 text-lg">
      Network Integrity Status
    </p>

    <h1 className="text-7xl font-bold text-green-400 mt-4">
      98.7%
    </h1>

    <p className="text-green-500 mt-4 text-xl">
      VERIFIED & SECURE
    </p>

  </div>

</div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">

          {/* Pie Chart */}
          <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
            <h3 className="text-2xl font-bold text-green-400 mb-6">
              Threat Distribution
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
            <h3 className="text-2xl font-bold text-green-400 mb-6">
              Weekly Attack Trend
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attacks" fill="#00ff88" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
{/* System Status Panel */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-6">
    System Status Panel
  </h3>

  <div className="bg-gray-900 border border-green-500 rounded-xl p-6">

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

      <div className="bg-black p-6 rounded-lg border border-green-500 text-center">
        <h4 className="text-gray-400">AI Engine</h4>
        <p className="text-green-400 text-2xl font-bold mt-3">
          ONLINE
        </p>
      </div>

      <div className="bg-black p-6 rounded-lg border border-green-500 text-center">
        <h4 className="text-gray-400">Blockchain Node</h4>
        <p className="text-green-400 text-2xl font-bold mt-3">
          ONLINE
        </p>
      </div>

      <div className="bg-black p-6 rounded-lg border border-green-500 text-center">
        <h4 className="text-gray-400">Threat Scanner</h4>
        <p className="text-yellow-400 text-2xl font-bold mt-3">
          ACTIVE
        </p>
      </div>

      <div className="bg-black p-6 rounded-lg border border-green-500 text-center">
        <h4 className="text-gray-400">Database</h4>
        <p className="text-blue-400 text-2xl font-bold mt-3">
          HEALTHY
        </p>
      </div>

      <div className="bg-black p-6 rounded-lg border border-green-500 text-center">
        <h4 className="text-gray-400">API Gateway</h4>
        <p className="text-green-400 text-2xl font-bold mt-3">
          SECURE
        </p>
      </div>

    </div>

  </div>

</div>
{/* Threat Severity Analytics */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-6">
    Threat Severity Analytics
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

    <div className="bg-gray-900 p-6 rounded-xl border border-red-500">
      <h4 className="text-gray-400">
        Critical Threats
      </h4>

      <p className="text-5xl font-bold text-red-500 mt-4">
        8
      </p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-orange-500">
      <h4 className="text-gray-400">
        High Threats
      </h4>

      <p className="text-5xl font-bold text-orange-500 mt-4">
        15
      </p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-yellow-500">
      <h4 className="text-gray-400">
        Medium Threats
      </h4>

      <p className="text-5xl font-bold text-yellow-400 mt-4">
        22
      </p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">
        Low Threats
      </h4>

      <p className="text-5xl font-bold text-green-400 mt-4">
        35
      </p>
    </div>

  </div>

</div>

{/* Threat Source Countries */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    Threat Source Countries
  </h3>

  <div className="bg-gray-900 border border-green-500 rounded-xl overflow-hidden">

    <table className="w-full">

      <thead className="bg-gray-800">
        <tr>
          <th className="p-4 text-left">Country</th>
          <th className="p-4 text-left">Detected Attacks</th>
        </tr>
      </thead>

      <tbody>

        <tr className="border-t border-gray-700">
          <td className="p-4">India</td>
          <td className="p-4 text-green-400">45</td>
        </tr>

        <tr className="border-t border-gray-700">
          <td className="p-4">China</td>
          <td className="p-4 text-red-400">32</td>
        </tr>

        <tr className="border-t border-gray-700">
          <td className="p-4">Russia</td>
          <td className="p-4 text-orange-400">28</td>
        </tr>

        <tr className="border-t border-gray-700">
          <td className="p-4">USA</td>
          <td className="p-4 text-blue-400">15</td>
        </tr>

        <tr className="border-t border-gray-700">
          <td className="p-4">Germany</td>
          <td className="p-4 text-yellow-400">8</td>
        </tr>

      </tbody>

    </table>

  </div>

</div>
{/* Attack Origin Heat Map */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    Global Threat Origins
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <p className="text-4xl">🇮🇳</p>
      <h4 className="mt-2">India</h4>
      <p className="text-green-400 text-2xl font-bold">45</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-red-500">
      <p className="text-4xl">🇨🇳</p>
      <h4 className="mt-2">China</h4>
      <p className="text-red-400 text-2xl font-bold">32</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-orange-500">
      <p className="text-4xl">🇷🇺</p>
      <h4 className="mt-2">Russia</h4>
      <p className="text-orange-400 text-2xl font-bold">28</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-blue-500">
      <p className="text-4xl">🇺🇸</p>
      <h4 className="mt-2">USA</h4>
      <p className="text-blue-400 text-2xl font-bold">15</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-yellow-500">
      <p className="text-4xl">🇩🇪</p>
      <h4 className="mt-2">Germany</h4>
      <p className="text-yellow-400 text-2xl font-bold">8</p>
    </div>

  </div>

</div>

{/* User Access Monitoring */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    User Access Monitoring
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Active Users</h4>
      <p className="text-3xl font-bold text-green-400">156</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Admin Accounts</h4>
      <p className="text-3xl font-bold text-blue-400">8</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Failed Logins</h4>
      <p className="text-3xl font-bold text-red-400">14</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Locked Accounts</h4>
      <p className="text-3xl font-bold text-yellow-400">3</p>
    </div>

  </div>

</div>
{/* Compliance Monitoring */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    Compliance Monitoring
  </h3>

  <div className="bg-gray-900 border border-green-500 rounded-xl p-6">

    <ul className="space-y-4 text-xl">

      <li className="text-green-400">
        ✅ GDPR Compliance - PASS
      </li>

      <li className="text-green-400">
        ✅ ISO 27001 - PASS
      </li>

      <li className="text-green-400">
        ✅ NIST Framework - PASS
      </li>

      <li className="text-green-400">
        ✅ Data Encryption - ENABLED
      </li>

    </ul>

  </div>

</div>
{/* AI Threat Intelligence Engine */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    AI Threat Intelligence Engine
  </h3>

  <div className="bg-gray-900 border border-green-500 rounded-xl p-6">

    <h4 className="text-xl text-blue-400 mb-4">
      Latest AI Analysis
    </h4>

    <ul className="space-y-4 text-lg">

      <li className="text-yellow-400">
        ⚠ DDoS probability increased by 12%
      </li>

      <li className="text-red-400">
        🚨 New phishing pattern detected
      </li>

      <li className="text-blue-400">
        🔍 Blockchain transaction anomaly found
      </li>

      <li className="text-green-400">
        ✅ Recommended immediate investigation
      </li>

    </ul>

  </div>

</div>
{/* Real-Time Threat Activity Log */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    Real-Time Threat Activity Log
  </h3>

  <div className="bg-gray-900 border border-green-500 rounded-xl p-6">

    <div className="space-y-4">

      <div className="border-l-4 border-red-500 pl-4">
        <p className="text-red-400">
          [15:20:05] Critical Malware Attempt Blocked
        </p>
      </div>

      <div className="border-l-4 border-yellow-500 pl-4">
        <p className="text-yellow-400">
          [15:18:11] Suspicious Login Detected
        </p>
      </div>

      <div className="border-l-4 border-blue-500 pl-4">
        <p className="text-blue-400">
          [15:16:52] Blockchain Record Verified
        </p>
      </div>

      <div className="border-l-4 border-green-500 pl-4">
        <p className="text-green-400">
          [15:15:30] AI Engine Completed Threat Analysis
        </p>
      </div>

    </div>

  </div>

</div>
{/* SOC Overview */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    Security Operations Center Overview
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Incidents Today</h4>
      <p className="text-3xl font-bold text-red-400">48</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Resolved</h4>
      <p className="text-3xl font-bold text-green-400">39</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Investigating</h4>
      <p className="text-3xl font-bold text-yellow-400">7</p>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl border border-green-500">
      <h4 className="text-gray-400">Escalated</h4>
      <p className="text-3xl font-bold text-blue-400">2</p>
    </div>

  </div>

</div>
{/* Threat Priority Queue */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    Threat Priority Queue
  </h3>

  <div className="bg-gray-900 border border-green-500 rounded-xl overflow-hidden">

    <table className="w-full">

      <thead className="bg-gray-800">
        <tr>
          <th className="p-4 text-left">Priority</th>
          <th className="p-4 text-left">Threat</th>
          <th className="p-4 text-left">Assigned Team</th>
          <th className="p-4 text-left">Status</th>
        </tr>
      </thead>

      <tbody>

        <tr className="border-t border-gray-700">
          <td className="p-4 text-red-500">P1</td>
          <td className="p-4">DDoS Attack</td>
          <td className="p-4">Network Team</td>
          <td className="p-4 text-yellow-400">Investigating</td>
        </tr>

        <tr className="border-t border-gray-700">
          <td className="p-4 text-orange-400">P2</td>
          <td className="p-4">Phishing Campaign</td>
          <td className="p-4">SOC Team</td>
          <td className="p-4 text-green-400">Contained</td>
        </tr>

        <tr className="border-t border-gray-700">
          <td className="p-4 text-yellow-400">P3</td>
          <td className="p-4">Malware Activity</td>
          <td className="p-4">Endpoint Team</td>
          <td className="p-4 text-blue-400">Monitoring</td>
        </tr>

      </tbody>

    </table>

  </div>

</div>
{/* Security Score Gauge */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    Overall Security Rating
  </h3>

  <div className="bg-gray-900 border border-green-500 rounded-xl p-10 text-center">

    <p className="text-gray-400 text-xl">
      Security Score
    </p>

    <h1 className="text-8xl font-bold text-green-400 mt-4">
      A+
    </h1>

    <p className="text-3xl text-blue-400 mt-4">
      92 / 100
    </p>

    <p className="text-green-300 mt-4">
      Excellent Security Posture
    </p>

  </div>

</div>
{/* AI Security Recommendations */}
<div className="mt-12">

  <h3 className="text-2xl font-bold text-green-400 mb-4">
    AI Security Recommendations
  </h3>

  <div className="bg-gray-900 border border-green-500 rounded-xl p-6">

    <ul className="space-y-4 text-lg">

      <li className="text-red-400">
        🚨 Block IP 192.168.1.45 due to repeated login failures
      </li>

      <li className="text-yellow-400">
        ⚠ Enable Multi-Factor Authentication for 12 users
      </li>

      <li className="text-blue-400">
        🔍 Investigate suspicious blockchain transaction BLK003
      </li>

      <li className="text-green-400">
        ✅ System integrity verified successfully
      </li>

    </ul>

  </div>

</div>
      </div>
    </div>

    
  );
}


export default App;