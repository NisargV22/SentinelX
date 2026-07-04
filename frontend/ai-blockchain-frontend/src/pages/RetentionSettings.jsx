import { useState, useEffect } from "react";

export default function RetentionSettings({ accessToken }) {
  const [policies, setPolicies] = useState([]);
  const [logType, setLogType] = useState("normal");
  const [retentionDays, setRetentionDays] = useState(90);
  const [error, setError] = useState("");

  const fetchPolicies = async () => {
    try {
      const response = await fetch("/api/retention", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setPolicies(data.policies);
      }
    } catch (err) {
      console.warn("API offline. Loading mock retention policies.");
      setPolicies([
        { _id: "1", logType: "normal", retentionDays: 7 },
        { _id: "2", logType: "port_scan", retentionDays: 30 },
        { _id: "3", logType: "brute_force", retentionDays: 90 },
        { _id: "4", logType: "malware", retentionDays: 180 }
      ]);
    }
  };

  useEffect(() => {
    if (accessToken) fetchPolicies();
  }, [accessToken]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/retention", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ logType, retentionDays: Number(retentionDays) })
      });
      if (response.ok) {
        fetchPolicies();
      } else {
        setError("Failed to update retention policy.");
      }
    } catch (err) {
      // Mock update fallback
      const updatedList = policies.map(p => 
        p.logType === logType ? { ...p, retentionDays: Number(retentionDays) } : p
      );
      setPolicies(updatedList);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-xl font-bold text-slate-900">Database Log Retention Policies</h2>
        <p className="text-xs text-slate-500 mt-1">Configure compliance retention durations and auto-purge limits for each event type</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Retention Policy Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Set Retention Period</h3>
            <p className="text-2xs text-slate-400 mt-0.5 font-medium">Automatic cron tasks purge logs exceeding the threshold</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Telemetry Log Type</label>
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
              >
                <option value="normal">Normal Traffic Logs</option>
                <option value="port_scan">Port Scan Anomalies</option>
                <option value="brute_force">Brute Force Alerts</option>
                <option value="malware">Malware / Phishing Detections</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Retention Threshold (Days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition border-0 cursor-pointer"
            >
              Update Policy Rule
            </button>
          </form>
        </div>

        {/* Retention Policy list table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Log Purge Configuration</h3>
            <p className="text-2xs text-slate-400 mt-0.5 font-medium">Compliance database log purging settings</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[400px] lg:min-w-0 text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-3 text-left text-slate-400 font-semibold tracking-wider">Event Log Channel</th>
                  <th className="p-3 text-right text-slate-400 font-semibold tracking-wider">Retention Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 font-bold uppercase font-sans">
                {policies.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3 font-semibold text-slate-900">{p.logType.replace("_", " ")}</td>
                    <td className="p-3 text-right text-slate-700 font-mono">
                      {p.retentionDays} DAYS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
