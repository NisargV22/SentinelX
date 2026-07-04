import { useState, useEffect } from "react";

export default function UBA({ accessToken }) {
  const [baselines, setBaselines] = useState([]);
  const [ubaAlerts, setUbaAlerts] = useState([]);

  const fetchData = async () => {
    try {
      const baseRes = await fetch("/api/uba/baselines", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const baseData = await baseRes.json();
      if (baseData.success) setBaselines(baseData.baselines);

      const alertRes = await fetch("/api/uba/alerts", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const alertData = await alertRes.json();
      if (alertData.success) setUbaAlerts(alertData.alerts);
    } catch (err) {
      console.warn("API offline. Loading mock UBA records.");
      setBaselines([
        { _id: "1", userId: "analyst@sentinelx.io", avgLoginHour: 10, allowedLocations: ["US", "IN"], typicalPorts: [80, 443, 22], avgBytesTransferred: 1200, rollingCount: 42 },
        { _id: "2", userId: "viewer@sentinelx.io", avgLoginHour: 14, allowedLocations: ["US"], typicalPorts: [80, 443], avgBytesTransferred: 800, rollingCount: 15 }
      ]);
      setUbaAlerts([
        { _id: "a1", userId: "viewer@sentinelx.io", anomalyType: "off_hours", timestamp: new Date(Date.now() - 3600000).toISOString(), details: "Access logged at 3:14 AM from viewer@sentinelx.io. Baseline average: 2:00 PM.", severity: "Medium" },
        { _id: "a2", userId: "analyst@sentinelx.io", anomalyType: "exfiltration", timestamp: new Date(Date.now() - 7200000).toISOString(), details: "High-volume transfer logged: 25,000 Bytes. Baseline limit: 1,200 Bytes.", severity: "Critical" }
      ]);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchData();
      const interval = setInterval(fetchData, 4000);
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-xl font-bold text-slate-900">User Behavior Analytics (UBA)</h2>
        <p className="text-xs text-slate-500 mt-1">Audit insider anomalies by comparing rolling session baselines against active log telemetry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Risk Baseline Profiles */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-850">Calculated User Baselines</h3>
            <p className="text-2xs text-slate-400 mt-0.5 font-medium">7-day rolling profiles detailing average byte volume and hour limits</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[500px] lg:min-w-0 text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-3 text-left text-slate-400 font-semibold tracking-wider font-mono">User ID / Email</th>
                  <th className="p-3 text-left text-slate-400 font-semibold tracking-wider">Baseline Hours</th>
                  <th className="p-3 text-left text-slate-400 font-semibold tracking-wider font-mono">Typical Ports</th>
                  <th className="p-3 text-left text-slate-400 font-semibold tracking-wider">Avg Bytes</th>
                  <th className="p-3 text-right text-slate-400 font-semibold tracking-wider">Samples</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 font-mono text-[11px]">
                {baselines.map((base) => (
                  <tr key={base._id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3 font-sans font-bold text-slate-900">{base.userId}</td>
                    <td className="p-3">{base.avgLoginHour ? `${base.avgLoginHour}:00` : "12:00"}</td>
                    <td className="p-3">{base.typicalPorts?.join(", ") || "80, 443"}</td>
                    <td className="p-3 font-semibold">{base.avgBytesTransferred ? `${base.avgBytesTransferred} B` : "1500 B"}</td>
                    <td className="p-3 text-right text-slate-400 font-bold">{base.rollingCount || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Risk Scores Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 text-white rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-2">
            <span className="bg-blue-500/10 text-blue-400 text-3xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-500/20">
              Heuristic Analyzer Active
            </span>
            <h3 className="text-sm font-bold tracking-wide mt-2">Active Risk Profiles</h3>
            <p className="text-2xs text-slate-400 leading-relaxed font-normal">
              UBA matches IP metadata and login metrics against decentralized hashes to detect session hijacking.
            </p>
          </div>

          <div className="border-t border-slate-700 pt-4 mt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Analyzed Nodes:</span>
              <span className="font-mono font-bold text-slate-200">{baselines.length} Users</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Anomalies Logged:</span>
              <span className="font-mono font-bold text-rose-400">{ubaAlerts.length} Alerts</span>
            </div>
          </div>
        </div>

      </div>

      {/* User Anomalies timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-850">Detected User Behavior Anomalies</h3>
          <p className="text-xs text-slate-400 mt-1">Real-time deviations flag indicators of account compromise</p>
        </div>

        <div className="space-y-4">
          {ubaAlerts.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-8">No insider behavioral anomalies detected.</p>
          ) : (
            ubaAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`border-l-4 p-4 rounded-r-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition hover:shadow-sm ${
                  alert.severity === "Critical" ? "border-rose-500 bg-rose-50/20" :
                  alert.severity === "High" ? "border-orange-500 bg-orange-50/20" :
                  "border-amber-500 bg-amber-50/20"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      alert.severity === "Critical" ? "bg-rose-100 text-rose-700 border border-rose-200" :
                      alert.severity === "High" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                      "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      {alert.anomalyType.replace("_", " ")}
                    </span>
                    <span className="text-4xs text-slate-400 font-mono font-bold">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-650 font-normal leading-relaxed">{alert.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
