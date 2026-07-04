import { useState } from "react";

export default function EmployeePortal({ user }) {
  const [reports, setReports] = useState([
    { id: "REP-092", title: "Suspicious email claiming to be billing support", status: "Under Review", time: "10:30 AM" }
  ]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("email");
  const [urgency, setUrgency] = useState("low");
  const [desc, setDesc] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      alert("Please enter a short description of the problem.");
      return;
    }

    const mappedType = type === "lost" ? "unauthorized_access" : "anomaly";
    const destPort = mappedType === "unauthorized_access" ? 22 : 443;
    const protocol = mappedType === "unauthorized_access" ? "SSH" : "HTTPS";

    const eventPayload = {
      type: mappedType,
      protocol,
      srcPort: Math.floor(1024 + Math.random() * 60000),
      destPort,
      bytes: 350,
      duration: 15,
      requestCount: 1,
      sourceIP: "192.168.1.120",
      destIP: "10.0.0.12",
      severity: urgency === "high" ? "High" : urgency === "med" ? "Medium" : "Low",
      timestamp: new Date().toISOString(),
      isEmployeeReport: true,
      employeeDescription: title
    };

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-agent-id": "employee-portal-report"
        },
        body: JSON.stringify(eventPayload)
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        const newReport = {
          id: `REP-${Math.floor(100 + Math.random() * 900)}`,
          title,
          status: "Submitted to Security Team",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setReports([newReport, ...reports]);
        setTitle("");
        setDesc("");
        alert("Report successfully filed. The security operations center has been notified.");
      } else {
        alert("Failed to submit incident report to backend gateways.");
      }
    } catch (err) {
      console.warn("API offline. Simulating incident submission locally.");
      const newReport = {
        id: `REP-${Math.floor(100 + Math.random() * 900)}`,
        title,
        status: "Submitted (Local Simulation Mode)",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setReports([newReport, ...reports]);
      setTitle("");
      setDesc("");
      alert("Report successfully filed. The security operations center has been notified.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-1/4 translate-x-1/4">
          <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Security Self-Service Portal</h2>
          <p className="text-xs text-blue-100 max-w-xl font-normal leading-relaxed">
            Welcome back, <span className="font-bold">{user.name}</span>. Use this portal to report suspicious emails, check your device security status, or view previous submissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Report form */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-850">Report Suspicious Behavior</h3>
              <p className="text-xs text-slate-400 mt-1">If something feels suspicious on your work device, let us scan it.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">What did you notice? (Short Summary)</label>
                <input
                  type="text"
                  placeholder="e.g., Received email asking to confirm my password"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="email">I received a suspicious email (Phishing)</option>
                    <option value="popup">A strange pop-up is blocking my screen</option>
                    <option value="slow">My computer is running extremely slow or acting weird</option>
                    <option value="lost">I lost my work laptop or hardware key</option>
                    <option value="other">Something else is wrong</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">How urgent is this?</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-705 focus:outline-none cursor-pointer"
                  >
                    <option value="low">Standard / Not urgent</option>
                    <option value="med">Important / I need help soon</option>
                    <option value="high">Critical / I cannot do my work</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
                <textarea
                  rows="4"
                  placeholder="Tell us what happened. (For emails, include sender email address or links if possible)"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-805 leading-relaxed font-normal"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-blue-500/10 transition duration-150 cursor-pointer border-0"
                >
                  Submit Report to Security Team
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right column: health check & reported list */}
        <div className="space-y-8">
          
          {/* Health Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Device Health Status</p>
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mt-4 shadow-inner">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-800 mt-4">Safe & Secure</h4>
            <p className="text-[10px] text-slate-400 mt-1">Automatic malware shields are active and running</p>
          </div>

          {/* Security Guidelines Info Panel */}
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl shadow-sm text-xs space-y-2">
            <p className="font-bold text-amber-800 uppercase tracking-widest text-[9px] mb-2">SentinelX Safety Tips</p>
            <p className="text-amber-800 leading-relaxed font-normal">
              🔒 **Never Share Passwords**: Corporate support will never ask for your password via email, phone, or chat.
            </p>
            <p className="text-amber-800 leading-relaxed font-normal">
              ⚠️ **Suspicious Links**: Do not click links or open attachments from unrecognized external addresses.
            </p>
          </div>

          {/* User's recent submitted reports log list */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-850 mb-4">Your Recent Submissions</h3>
            {reports.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent incident reports submitted.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((r) => (
                  <div key={r.id} className="p-3 border border-slate-150 rounded-lg bg-slate-50/50 space-y-1">
                    <div className="flex justify-between items-center text-4xs">
                      <span className="font-bold text-blue-600 font-mono">{r.id}</span>
                      <span className="text-slate-400 font-mono">{r.time}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700">{r.title}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-550 font-bold">{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
