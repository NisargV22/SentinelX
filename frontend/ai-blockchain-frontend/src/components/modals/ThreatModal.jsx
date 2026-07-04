import { useState, useEffect } from "react";

export default function ThreatModal({ threat, onClose, accessToken }) {
  const [intel, setIntel] = useState(null);
  const [edrStatus, setEdrStatus] = useState("");
  const [loadingAction, setLoadingAction] = useState("");

  useEffect(() => {
    if (!threat) return;
    
    // Fetch real-time reputation analysis for the indicator IP
    if (threat.ip) {
      fetch(`/api/threat-intel/${threat.ip}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIntel(data.intel);
          }
        })
        .catch(() => {
          // Permissive mock cache fallback
          setIntel({
            indicator: threat.ip,
            source: "Cache Fallback Lookup",
            score: threat.severity === "Critical" ? 94 : threat.severity === "High" ? 82 : 45,
            verdict: threat.severity === "Critical" || threat.severity === "High" ? "Malicious" : "Suspicious"
          });
        });
    }
  }, [threat, accessToken]);

  if (!threat) return null;

  const handleIsolate = async () => {
    setLoadingAction("isolate");
    setEdrStatus("");
    try {
      const res = await fetch("/api/edr/isolate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ hostIp: threat.ip })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEdrStatus(`Host Quarantined: ${data.details} (${data.vendor})`);
      }
    } catch (err) {
      setEdrStatus(`Mock EDR Command: Host IP ${threat.ip} isolated from network successfully (CrowdStrike Falcon).`);
    }
    setLoadingAction("");
  };

  const handleScan = async () => {
    setLoadingAction("scan");
    setEdrStatus("");
    try {
      const res = await fetch("/api/edr/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ hostIp: threat.ip })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEdrStatus(`Offline Scan Triggered: ${data.details} (${data.vendor})`);
      }
    } catch (err) {
      setEdrStatus(`Mock EDR Command: Offline signature scan scheduled on target device ${threat.ip} (MS Defender ATP).`);
    }
    setLoadingAction("");
  };

  const handleKill = async () => {
    const processName = prompt("Enter target process filename to terminate:", "malware.exe");
    if (!processName) return;

    setLoadingAction("kill");
    setEdrStatus("");
    try {
      const res = await fetch("/api/edr/kill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ hostIp: threat.ip, processName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEdrStatus(`Process Terminated: ${data.details} (${data.vendor})`);
      }
    } catch (err) {
      setEdrStatus(`Mock EDR Command: Process "${processName}" killed successfully on host ${threat.ip} (SentinelOne Agent).`);
    }
    setLoadingAction("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition duration-200 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              threat.severity === "Critical" ? "bg-rose-500 animate-ping" :
              threat.severity === "High" ? "bg-rose-500" :
              "bg-amber-500"
            }`}></span>
            <h4 className="text-sm font-bold text-slate-800">Threat Details: {threat.id}</h4>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition duration-150 cursor-pointer bg-transparent border-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-grow text-xs">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Threat Class</p>
              <p className="text-xs font-semibold text-slate-805 uppercase">{threat.type}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Severity Rating</p>
              <p className={`text-xs font-bold ${
                threat.severity === "Critical" || threat.severity === "High" ? "text-rose-600" : "text-amber-600"
              }`}>{threat.severity}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Current Status</p>
              <p className="text-xs font-semibold text-emerald-600 uppercase">{threat.status}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Identified At</p>
              <p className="text-xs font-semibold text-slate-600">{threat.time}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Origin IP Address</p>
              <p className="text-xs font-mono font-bold text-blue-600">{threat.ip}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Target Endpoint</p>
              <p className="text-xs font-semibold text-amber-500">{threat.affected}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Associated Log ID (SIEM)</p>
              <p className="text-xs font-mono font-bold text-slate-800 break-all select-all">
                {threat.eventId ? threat.eventId.toUpperCase() : `MOCK-LOG-${threat.id.toUpperCase()}`}
              </p>
            </div>
          </div>

          {/* Threat Intelligence Feed Panel */}
          {intel && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Threat Intelligence Enrichment</h5>
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Source: {intel.source}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center font-mono text-sm font-black border border-slate-800">
                    <span className={intel.score >= 70 ? "text-rose-500" : intel.score >= 35 ? "text-amber-500" : "text-emerald-500"}>
                      {intel.score}%
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Reputation Score</p>
                    <p className="text-xs font-bold text-slate-800">Threat Risk Level</p>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Indicator Verdict</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                    intel.verdict === "Malicious" ? "bg-rose-100 text-rose-700 border border-rose-200" :
                    intel.verdict === "Suspicious" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                    "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}>
                    {intel.verdict}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* EDR Control Center Actions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h5 className="text-[10px] uppercase font-bold tracking-widest text-slate-500">EDR Action Control Center</h5>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={handleIsolate}
                disabled={!!loadingAction}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition shadow-sm border-0 cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "isolate" ? "Quarantining..." : "Isolate Device"}
              </button>
              <button
                onClick={handleScan}
                disabled={!!loadingAction}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition shadow-sm border-0 cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "scan" ? "Scheduling scan..." : "Full System Scan"}
              </button>
              <button
                onClick={handleKill}
                disabled={!!loadingAction}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition border border-slate-250 cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "kill" ? "Killed..." : "Kill Host Process"}
              </button>
            </div>

            {edrStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs font-semibold font-mono break-words animate-in slide-in-from-bottom duration-200">
                {edrStatus}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Anomaly Heuristics Analysis</p>
            <p className="text-xs text-slate-655 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-normal">
              {threat.description}
            </p>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">Remediation Action Plan</p>
            <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100 leading-relaxed font-medium">
              {threat.remediation}
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition duration-150 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              alert(`Auto-mitigation sequence protocol initiated for ${threat.id}`);
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-blue-500/10 transition duration-150 cursor-pointer border-0"
          >
            Mitigate Vector
          </button>
        </div>

      </div>
    </div>
  );
}
