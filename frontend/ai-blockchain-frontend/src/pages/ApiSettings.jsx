import { useState, useEffect } from "react";

export default function ApiSettings({ accessToken }) {
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("external_agent");
  const [newKey, setNewKey] = useState("");
  const [error, setError] = useState("");

  const fetchKeys = async () => {
    try {
      const response = await fetch("/api/api-keys", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setKeys(data.keys);
      }
    } catch (err) {
      console.warn("API offline. Loading mock API keys.");
      setKeys([
        { _id: "1", name: "Splunk Integration Link", key: "7f8a3c91e5d7f22a1b5c8f6e4a2d1b0c", role: "external_agent", createdBy: "admin@sentinelx.io", enabled: true }
      ]);
    }
  };

  useEffect(() => {
    if (accessToken) fetchKeys();
  }, [accessToken]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!name) {
      setError("Please specify a descriptive name for this API key.");
      return;
    }
    setError("");

    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name, role })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNewKey(data.key.key);
        setName("");
        fetchKeys();
      } else {
        setError(data.message || "Failed to generate key.");
      }
    } catch (err) {
      // Mock generate fallback
      const mockKeyVal = "ab8f7a6b5c4d3e2f1a0987654321abcd";
      setNewKey(mockKeyVal);
      setKeys([...keys, { _id: `mock-${Date.now()}`, name, key: mockKeyVal, role, createdBy: "admin@sentinelx.io", enabled: true }]);
      setName("");
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm("Are you sure you want to revoke this API Key? Any external tools using it will be blocked immediately.")) return;
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.ok) fetchKeys();
    } catch (err) {
      setKeys(keys.filter(k => k._id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-xl font-bold text-slate-900">External Integration Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Issue API keys for Splunk, Elastic, EDR agents, or custom log routing tools</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Key Generator Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Generate API Access Key</h3>
            <p className="text-2xs text-slate-400 mt-0.5">API keys authenticate queries to external ingestion endpoints</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Key Label / Name</label>
              <input
                type="text"
                placeholder="e.g. SOC Splunk Collector"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Access Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
              >
                <option value="external_agent">External Agent (Read-only logs)</option>
                <option value="soc">SOC Read/Write Access</option>
                <option value="admin">Platform Admin Access</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition border-0 cursor-pointer"
            >
              Generate Token
            </button>
          </form>

          {newKey && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-2 animate-in slide-in-from-bottom duration-250">
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Generated Token Key:</p>
              <p className="font-mono text-xs font-bold bg-white border border-emerald-100 p-2.5 rounded break-all select-all select-none">
                {newKey}
              </p>
              <p className="text-[10px] text-emerald-500 font-medium">
                * Copy this key now. It will not be shown again for security reasons.
              </p>
            </div>
          )}
        </div>

        {/* Key List table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider">Active API Keys</h3>
            <p className="text-2xs text-slate-400 mt-0.5 font-medium">Active integration endpoints currently authenticated</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[500px] lg:min-w-0 text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-3 text-left text-slate-400 font-semibold tracking-wider">Label Name</th>
                  <th className="p-3 text-left text-slate-400 font-semibold tracking-wider font-mono">Key Signature</th>
                  <th className="p-3 text-left text-slate-400 font-semibold tracking-wider">Role</th>
                  <th className="p-3 text-right text-slate-400 font-semibold tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                {keys.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-400 font-sans">
                      No active API keys found.
                    </td>
                  </tr>
                ) : (
                  keys.map((k) => (
                    <tr key={k._id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-bold text-slate-900">{k.name}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {k.key.substring(0, 8)}********************
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold">
                          {k.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleRevoke(k._id)}
                          className="text-rose-600 hover:underline cursor-pointer border-0 bg-transparent font-bold"
                        >
                          Revoke Key
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
