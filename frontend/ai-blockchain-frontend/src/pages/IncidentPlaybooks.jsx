import { useState, useEffect } from "react";

export default function IncidentPlaybooks({ accessToken }) {
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const fetchCases = async () => {
    try {
      // Fetch alerts to list active investigations
      const response = await fetch("/api/events/alerts", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();
      if (data.success && data.alerts) {
        setCases(data.alerts);
      }
    } catch (err) {
      console.warn("API offline. Loading mock incident cases.");
      setCases([
        { _id: "1", threatId: "TH001", type: "PHISHING", severity: "High", ip: "192.168.1.102", status: "Open" },
        { _id: "2", threatId: "TH002", type: "RANSOMWARE", severity: "Critical", ip: "10.0.0.15", status: "Open" },
        { _id: "3", threatId: "TH003", type: "DDOS", severity: "High", ip: "185.220.101.5", status: "Resolved" }
      ]);
    }
  };

  const loadPlaybook = async (threatId) => {
    try {
      const response = await fetch(`/api/incident-playbooks/${threatId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();
      if (data.success && data.playbook) {
        setActiveCase(data.playbook);
        setElapsedTime(data.playbook.timeElapsed || 0);
      }
    } catch (err) {
      // Mock playbooks fallback
      const mockSteps = {
        PHISHING: [
          { stepNumber: 1, title: "Identify Phishing URL", description: "Extract link and upload to VirusTotal reputation scan.", completed: true },
          { stepNumber: 2, title: "Isolate Targeted Users", description: "Verify if employees clicked links and lock credentials.", completed: false },
          { stepNumber: 3, title: "Purge Inboxes", description: "Run corporate mail server script to delete matching headers.", completed: false }
        ],
        RANSOMWARE: [
          { stepNumber: 1, title: "Isolate Host Endpoint", description: "Call EDR endpoint quarantine hook on infected device.", completed: true },
          { stepNumber: 2, title: "Identify Ransom Variant", description: "Analyze file extension metadata and ransom payload notes.", completed: false },
          { stepNumber: 3, title: "Verify Offsite Backups", description: "Assess backup server integrity to restore clean images.", completed: false }
        ],
        DDOS: [
          { stepNumber: 1, title: "Activate Rate Limiting", description: "Enable firewall rules and scale CDN rate-limiting shields.", completed: true },
          { stepNumber: 2, title: "Route traffic via CDN", description: "Verify BGP routing rules and inspect latency metrics.", completed: true }
        ]
      };
      
      const matchedCase = cases.find(c => c.threatId === threatId) || { type: "DDOS" };
      setActiveCase({
        threatId,
        playbookType: matchedCase.type.toLowerCase(),
        steps: mockSteps[matchedCase.type.toUpperCase()] || mockSteps.DDOS,
        status: "In Progress",
        owner: "Tier-1 Analyst"
      });
      setElapsedTime(120); // mock start time
    }
  };

  useEffect(() => {
    if (accessToken) fetchCases();
  }, [accessToken]);

  // running timer ticking effect
  useEffect(() => {
    let interval = null;
    if (activeCase && activeCase.status === "In Progress") {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCase]);

  const handleStepToggle = async (stepNumber, currentStatus) => {
    if (!activeCase) return;
    const updatedStatus = !currentStatus;

    try {
      const response = await fetch(`/api/incident-playbooks/${activeCase.threatId}/step/${stepNumber}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ completed: updatedStatus })
      });
      const data = await response.json();
      if (data.success) {
        setActiveCase(data.playbook);
      }
    } catch (err) {
      // Local mock update
      const updatedSteps = activeCase.steps.map(s => 
        s.stepNumber === stepNumber ? { ...s, completed: updatedStatus } : s
      );
      setActiveCase({ ...activeCase, steps: updatedSteps });
    }
  };

  const handleStatusUpdate = async (newStatus, newOwner) => {
    if (!activeCase) return;
    try {
      const response = await fetch(`/api/incident-playbooks/${activeCase.threatId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: newStatus, owner: newOwner })
      });
      const data = await response.json();
      if (data.success) {
        setActiveCase(data.playbook);
        fetchCases();
      }
    } catch (err) {
      setActiveCase({ ...activeCase, status: newStatus, owner: newOwner });
    }
  };

  const formatTime = (totalSeconds) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
      
      {/* Sidebar: Case Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-850">Active Investigations</h3>
          <p className="text-2xs text-slate-400 mt-0.5">Select a security alert to review its SOP checklist</p>
        </div>

        <div className="space-y-2.5">
          {cases.map((c) => (
            <button
              key={c._id}
              onClick={() => loadPlaybook(c.threatId)}
              className={`w-full text-left p-3.5 rounded-lg border text-xs flex justify-between items-center transition cursor-pointer ${
                activeCase && activeCase.threatId === c.threatId
                  ? "bg-blue-50 border-blue-200"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="space-y-1">
                <span className="font-mono font-bold text-blue-600 block">{c.threatId}</span>
                <span className="font-bold text-slate-700 block uppercase text-[10px]">{c.type}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                c.severity === "Critical" ? "bg-rose-100 text-rose-700 border border-rose-200" :
                c.severity === "High" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                "bg-amber-100 text-amber-700 border border-amber-200"
              }`}>
                {c.severity}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel: Interactive Checklist Guide */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 flex flex-col justify-between min-h-[450px]">
        {activeCase ? (
          <>
            {/* Header Checklist Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-150 pb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2">
                  <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded">SOP</span>
                  {activeCase.playbookType.toUpperCase()} Incident Response Checklist
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">Incident Target: Alert #{activeCase.threatId}</p>
              </div>

              {/* Stopwatch Timer */}
              <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-inner font-mono text-sm font-black tracking-widest border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                {formatTime(elapsedTime)}
              </div>
            </div>

            {/* Checklist List */}
            <div className="space-y-4">
              {activeCase.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className={`flex items-start gap-4 p-4 border rounded-xl transition ${
                    step.completed ? "bg-slate-50/50 border-slate-150" : "bg-white border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={() => handleStepToggle(step.stepNumber, step.completed)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer mt-0.5"
                  />
                  <div className="space-y-1">
                    <h4 className={`text-xs font-bold ${step.completed ? "line-through text-slate-400" : "text-slate-805"}`}>
                      {step.stepNumber}. {step.title}
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${step.completed ? "text-slate-400" : "text-slate-500"}`}>
                      {step.description}
                    </p>
                    {step.completed && (
                      <span className="inline-block text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                        ✓ Verified by {step.completedBy || "Analyst"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action controls */}
            <div className="border-t border-slate-150 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
              <div className="space-y-1 text-slate-500 font-mono">
                <p>Assignee: <span className="font-bold text-slate-800">{activeCase.owner || "Tier-1 Analyst"}</span></p>
                <p>Case Status: <span className="font-bold text-blue-600 uppercase">{activeCase.status}</span></p>
              </div>

              <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => handleStatusUpdate("Escalated", "Tier-2 Security Lead")}
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-lg cursor-pointer transition font-bold"
                >
                  Escalate Case
                </button>
                <button
                  onClick={() => handleStatusUpdate("Handoff", "Manager Team")}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg cursor-pointer transition font-bold"
                >
                  Handoff Duty
                </button>
                <button
                  onClick={() => handleStatusUpdate("Closed", "Archived")}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg cursor-pointer transition font-bold"
                >
                  Close Case
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 py-16">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-xs font-semibold">Select an active investigation case to start the checklist guide.</p>
          </div>
        )}
      </div>

    </div>
  );
}
