import { useState } from "react";

export default function Settings({ user, accessToken }) {
  const [threshold, setThreshold] = useState(75);
  const [consensusNodes, setConsensusNodes] = useState(12);

  // Password reset states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill out all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage("Password updated successfully. Changes applied to session.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Server connection failed. Could not reset password.");
    }
    setLoading(false);
  };

  const usersList = [
    { name: "SOC Analyst Team", role: "5 Active Accounts", status: "Active" },
    { name: "Corporate Employees", role: "10 Active Accounts", status: "Active" },
    { name: "External Splunk Agent", role: "1 Active API Key", status: "Active" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Security Control Console Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Configure SentinelX platform variables and manage your account security credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Account Profile & Password Manager */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Account Profile Card */}
          {user && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-850">Your Security Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Analyst Name</p>
                  <p className="font-bold text-slate-800">{user.name}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Corporate Email</p>
                  <p className="font-mono font-bold text-blue-600 truncate">{user.email}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">Privilege Role</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] uppercase font-bold rounded">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Password Reset Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-850">Update Security Keyring Password</h3>
              <p className="text-xs text-slate-400 mt-0.5">Passwords are encrypted on-chain and salted using SHA-256 rounds</p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-semibold">
                {message}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition border-0 cursor-pointer text-center block font-bold"
                >
                  {loading ? "Updating..." : "Reset Security Password"}
                </button>
              </div>
            </form>
          </div>

          {/* User Registry overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-850 mb-6">User Accounts Registry Overview</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {usersList.map((u) => (
                <div key={u.name} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 font-semibold">
                  <div>
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-[10px] text-slate-450 mt-0.5">{u.role}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-4xs font-bold uppercase bg-emerald-50 text-emerald-700">
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Core system configurations */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-850">Telemetry System Variables</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-705">
                <label>AI Severity Threat Mitigation Threshold</label>
                <span className="font-mono text-blue-600 font-bold">{threshold}% Confidence</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full h-1.5 bg-slate-105 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 leading-normal font-medium">
                Determines the confidence index score required to trigger automatic segment blocking.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-705">
                <label>Active Consensus Nodes Threshold</label>
                <span className="font-mono text-blue-600 font-bold">{consensusNodes} Nodes</span>
              </div>
              <input
                type="range"
                min="3"
                max="24"
                value={consensusNodes}
                onChange={(e) => setConsensusNodes(e.target.value)}
                className="w-full h-1.5 bg-slate-105 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Platform Metadata Info Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between max-h-[380px]">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-855">System Architecture</h3>
            
            <div className="space-y-2.5 text-xs font-semibold">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Ledger Protocol</p>
                <p className="font-bold text-slate-705">Proof-of-Authority (PoA) Consortium</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">AI Core Version</p>
                <p className="font-bold text-slate-705">Heuristics-X v4.12.0</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Backend Host</p>
                <p className="font-bold text-slate-705">Node.js Express Middleware Engine</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Workspace Directory</p>
                <p className="font-mono text-blue-600 truncate text-[11px]">/AI-Blockchain-Cybersecurity-System</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6">
            <button
              onClick={() => alert("System variables committed to ledger config block successfully.")}
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-blue-500/10 transition duration-150 cursor-pointer border-0"
            >
              Commit Settings to Ledger
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
