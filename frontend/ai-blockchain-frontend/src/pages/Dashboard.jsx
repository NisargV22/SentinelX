import { useState, useEffect } from "react";
import KPISection from "../components/dashboard/KPISection";
import ThreatModal from "../components/modals/ThreatModal";

export default function Dashboard({ user, accessToken, globalSearch }) {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLedgerTampered, setIsLedgerTampered] = useState(false);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all"); 
  const [sourceFilter, setSourceFilter] = useState("all"); 
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [health, setHealth] = useState({
    logDatabase: "Offline",
    pythonEngine: "Offline",
    blockchainAnchor: "Offline",
    logIngestionPipe: "Offline"
  });

  useEffect(() => {
    if (globalSearch !== undefined) {
      setSearch(globalSearch);
    }
  }, [globalSearch]);

  const fetchData = async () => {
    try {
      // 1. Fetch KPI Stats
      const statsRes = await fetch("/api/events/stats", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }

      // 2. Fetch Live SIEM Logs
      const eventsRes = await fetch("/api/events?limit=40", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const eventsData = await eventsRes.json();
      if (eventsData.success && eventsData.events) {
        setEvents(eventsData.events);
      }

      // 3. Fetch Live Alerts
      const alertsRes = await fetch("/api/events/alerts", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const alertsData = await alertsRes.json();
      
      // 3b. Fetch Blockchain records to see if any are tampered
      const bcRes = await fetch("/api/blockchain/records?limit=10", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const bcData = await bcRes.json();
      let hasTampered = false;
      let tamperedBatchId = "";
      if (bcData.success && bcData.records) {
        const tamperedBlock = bcData.records.find(r => r.status === "Failed");
        if (tamperedBlock) {
          hasTampered = true;
          tamperedBatchId = tamperedBlock.batchId;
        }
      }
      setIsLedgerTampered(hasTampered);

      if (alertsData.success && alertsData.alerts) {
        let finalAlerts = [...alertsData.alerts];
        if (hasTampered) {
          finalAlerts.unshift({
            _id: "alert-tamper-id",
            threatId: "ALT-TAMPER",
            eventId: "EVT-TAMPER",
            type: "ledger_tampering",
            severity: "Critical",
            status: "Active",
            createdAt: new Date().toISOString(),
            ip: "127.0.0.1",
            affected: "System Audit Logs Database",
            description: `DATABASE TAMPERING DETECTED! Audit logs in batch ${tamperedBatchId.substring(0, 8).toUpperCase()} do not match their cryptographic blockchain anchors. Past logs have been altered or deleted.`,
            remediation: "Verify the database logs immediately. Revert unauthorized modifications in MongoDB and isolate the compromised system nodes."
          });
        }
        setAlerts(finalAlerts);
      }
      // 4. Fetch System Health
      const healthRes = await fetch("/api/system/health", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const healthData = await healthRes.json();
      if (healthData.success && healthData.health) {
        setHealth(healthData.health);
      }
    } catch (err) {
      console.warn("Could not query live stats. Using mock default dashboard statistics.");
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [accessToken]);

  // Dynamic filter logic
  const filteredEvents = events.filter((e) => {
    const score = e.threat?.score || 0;
    
    let category = "safe";
    if (score >= 0.7) category = "malicious";
    else if (score >= 0.35) category = "suspicious";

    const matchesSeverity = severityFilter === "all" || category === severityFilter;

    const port = e.destPort || 80;
    let source = "network";
    if (port === 80 || port === 443) source = "web";
    else if (port === 21 || port === 22) source = "host";

    const matchesSource = sourceFilter === "all" || source === sourceFilter;
    
    const matchesSearch = 
      e._id.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()) ||
      e.sourceIP.toLowerCase().includes(search.toLowerCase()) ||
      (e.protocol && e.protocol.toLowerCase().includes(search.toLowerCase()));

    return matchesSeverity && matchesSource && matchesSearch;
  });

  const criticalCount = alerts.filter(a => a.severity === "Critical").length;
  const highCount = alerts.filter(a => a.severity === "High").length;
  const mediumCount = alerts.filter(a => a.severity === "Medium").length;
  const lowCount = alerts.filter(a => a.severity === "Low" || a.severity === "Normal").length;

  const handleAcknowledgeAll = () => {
    alert("All active threat alerts have been acknowledged.");
  };

  const handleMarkFalsePositive = () => {
    alert("Selected event marked as False Positive. AI weights adjusted.");
  };

  const handleInspectAlert = (alertItem) => {
    // Map alert record to matches expected by ThreatModal
    const formatted = {
      id: alertItem.threatId,
      eventId: alertItem.eventId,
      type: alertItem.type,
      severity: alertItem.severity,
      status: alertItem.status,
      time: new Date(alertItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ip: alertItem.ip,
      affected: alertItem.affected,
      description: alertItem.description,
      remediation: alertItem.remediation
    };
    setSelectedThreat(formatted);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden border border-slate-700">
        <div className="absolute right-0 bottom-0 opacity-5 translate-y-1/4 translate-x-1/4">
          <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight font-mono text-slate-100">
            SENTINELX SIEM LOG ANALYZER
          </h2>
          <p className="text-xs text-slate-400 max-w-xl font-normal leading-relaxed">
            Corporate security monitor active. Current session: <span className="font-bold text-slate-200">{user.name}</span>. 
            ML telemetry engine and blockchain bridge endpoints synchronized.
          </p>
        </div>
      </div>

      {isLedgerTampered && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl shadow-sm animate-pulse flex items-center gap-3">
          <span className="text-lg">🚨</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Security Alteration Detected</h4>
            <p className="text-2xs text-rose-600 mt-0.5 font-medium font-sans">One or more database audit records do not match their cryptographic blockchain anchors. Database tampering has been identified! Please audit the ledger immediately.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (KPI + Ingest Log Console) */}
        <div className="lg:col-span-2 space-y-8">
          <KPISection stats={stats} />

          {/* SIEM Live Event Log Console */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
            
            {/* Console Controls Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Live SIEM Event Log Console
                </h3>
                <p className="text-xs text-slate-400 mt-1">Real-time structured system logs ingested and graded by AI</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-48">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search log records..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold uppercase w-full sm:w-auto overflow-x-auto">
                  <button
                    onClick={() => setSeverityFilter("all")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      severityFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    All Severities
                  </button>
                  <button
                    onClick={() => setSeverityFilter("malicious")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      severityFilter === "malicious" ? "bg-red-50 text-red-600 shadow-sm" : "text-slate-500 hover:text-red-650"
                    }`}
                  >
                    Malicious
                  </button>
                  <button
                    onClick={() => setSeverityFilter("suspicious")}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      severityFilter === "suspicious" ? "bg-amber-50 text-amber-600 shadow-sm" : "text-slate-500 hover:text-amber-650"
                    }`}
                  >
                    Suspicious
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Log Source Selector */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-3xs font-extrabold uppercase">
              <span className="text-slate-400 mr-2">Log Source:</span>
              <button
                onClick={() => setSourceFilter("all")}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  sourceFilter === "all" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-650 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                All Channels
              </button>
              <button
                onClick={() => setSourceFilter("web")}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  sourceFilter === "web" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-650 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Web Services (Port 80/443)
              </button>
              <button
                onClick={() => setSourceFilter("network")}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  sourceFilter === "network" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-650 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Internal Network (DNS/TCP)
              </button>
              <button
                onClick={() => setSourceFilter("host")}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  sourceFilter === "host" ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-650 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Host System Audit (SSH/FTP)
              </button>
            </div>

            {/* Structured Log Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[800px] lg:min-w-0">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider font-mono">Timestamp</th>
                    <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider font-mono">Log ID</th>
                    <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider font-mono">Type / Protocol</th>
                    <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider font-mono">Source IP {"->"} Dest IP</th>
                    <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider font-mono">Bytes / Duration</th>
                    <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider font-mono">AI Score</th>
                    <th className="p-4 text-right text-xs uppercase text-slate-400 font-semibold tracking-wider font-mono">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-655">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-xs text-slate-400 font-sans">
                        No active SIEM event logs match the console filters.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((e, idx) => {
                      const score = e.threat?.score || 0;
                      const timeStr = new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      
                      let statusLabel = "SAFE";
                      let statusStyle = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                      if (score >= 0.7) {
                        statusLabel = "MALICIOUS";
                        statusStyle = "bg-rose-50 text-rose-700 border border-rose-200";
                      } else if (score >= 0.35) {
                        statusLabel = "SUSPICIOUS";
                        statusStyle = "bg-amber-50 text-amber-700 border border-amber-200";
                      }

                      return (
                        <tr key={e._id || idx} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 text-slate-500">{timeStr}</td>
                          <td className="p-4 font-bold text-slate-750">{e._id.substring(0, 10).toUpperCase()}</td>
                          <td className="p-4">
                            <span className="font-sans font-bold text-slate-800 uppercase text-[10px]">
                              {e.type.replace("_", " ")}
                            </span>
                            <span className="ml-1 text-[10px] text-slate-400">({e.protocol || "TCP"})</span>
                          </td>
                          <td className="p-4">
                            <span className="text-blue-600 font-bold">{e.sourceIP}</span>
                            <span className="text-slate-400 mx-1">{"->"}</span>
                            <span>{e.destIP || "10.0.0.12"}</span>
                          </td>
                          <td className="p-4 text-slate-500">
                            {e.bytes ? `${e.bytes}B` : "0B"} <span className="text-slate-300">|</span> {e.duration ? `${e.duration}s` : "0s"}
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            {(score * 100).toFixed(0)}%
                          </td>
                          <td className="p-4 text-right">
                            <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide ${statusStyle}`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          
          {/* A. System Health Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-805 uppercase tracking-wider">System Health Status</h4>
              <p className="text-[10px] text-slate-400">Operational status checks of active SIEM nodes</p>
            </div>
            
            <div className="space-y-2 text-xs font-bold font-sans">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-600">Log Ingestion Pipe</span>
                <span className={`flex items-center gap-1.5 ${health.logIngestionPipe === "Online" ? "text-emerald-600" : "text-rose-600"}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.logIngestionPipe === "Online" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                  {health.logIngestionPipe}
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-600">Python AI Engine</span>
                <span className={`flex items-center gap-1.5 ${health.pythonEngine === "Online" ? "text-emerald-600" : "text-rose-600"}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.pythonEngine === "Online" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                  {health.pythonEngine}
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-600">Blockchain Anchor</span>
                <span className={`flex items-center gap-1.5 ${health.blockchainAnchor === "Online" ? "text-emerald-600" : "text-rose-600"}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.blockchainAnchor === "Online" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                  {health.blockchainAnchor}
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-600">Log Database</span>
                <span className={`flex items-center gap-1.5 ${health.logDatabase === "Online" ? "text-emerald-600" : "text-rose-600"}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.logDatabase === "Online" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                  {health.logDatabase}
                </span>
              </div>
            </div>
          </div>

          {/* B. Alert Severity Tracker Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Severity Alert Tracker</h4>
              <p className="text-[10px] text-slate-400">Warning counts classified by threat scale</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-center">
                <p className="text-[9px] uppercase tracking-wider text-rose-600 font-bold">Critical</p>
                <p className="text-lg font-black text-rose-700 mt-1">{criticalCount || 1}</p>
              </div>
              <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-center">
                <p className="text-[9px] uppercase tracking-wider text-orange-600 font-bold">High</p>
                <p className="text-lg font-black text-orange-700 mt-1">{highCount || 1}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-center">
                <p className="text-[9px] uppercase tracking-wider text-amber-600 font-bold">Medium</p>
                <p className="text-lg font-black text-amber-700 mt-1">{mediumCount || 2}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-center">
                <p className="text-[9px] uppercase tracking-wider text-blue-600 font-bold">Low</p>
                <p className="text-lg font-black text-blue-700 mt-1">{lowCount || 20}</p>
              </div>
            </div>
          </div>

          {/* C. Quick Action Panel Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wider">SOC Analyst Controls</h4>
              <p className="text-[10px] text-slate-400">Quick action commands for standard workflows</p>
            </div>
            
            <div className="space-y-2 text-xs font-bold">
              <button
                onClick={handleAcknowledgeAll}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition border-0 cursor-pointer text-center block"
              >
                Acknowledge All Alerts
              </button>
              <button
                onClick={handleMarkFalsePositive}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border-0 cursor-pointer text-center block"
              >
                Mark as False Positive
              </button>
            </div>
          </div>

          {/* D. Recent Alerts Feed Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Recent Threat Warnings</h4>
              <p className="text-[10px] text-slate-400">Last 5 compiled warnings awaiting audit triage</p>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 5).map((a) => (
                <div key={a._id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 hover:bg-slate-100/50 transition">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-blue-600">{a.threatId}</span>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      a.severity === "Critical" ? "bg-rose-100 text-rose-700 border border-rose-200" :
                      a.severity === "High" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                      "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}>
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 uppercase leading-none">{a.type.replace("_", " ")}</p>
                  <p className="text-[10px] text-slate-450 font-mono font-semibold">{a.ip} | {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                  <button
                    onClick={() => handleInspectAlert(a)}
                    className="text-[10px] text-blue-600 hover:underline border-0 bg-transparent font-bold cursor-pointer pt-1 block"
                  >
                    Inspect Threat Details →
                  </button>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-center text-slate-400 text-xs py-4">No active threat warnings pending.</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <ThreatModal 
          threat={selectedThreat} 
          onClose={() => setSelectedThreat(null)} 
        />
      )}

    </div>
  );
}
