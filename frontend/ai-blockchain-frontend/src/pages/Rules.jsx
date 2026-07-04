import { useState, useEffect } from "react";

export default function Rules({ accessToken }) {
  const [rules, setRules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [field, setField] = useState("type");
  const [operator, setOperator] = useState("equals");
  const [value, setValue] = useState("");
  const [timeWindow, setTimeWindow] = useState(60);
  const [threshold, setThreshold] = useState(1);
  const [action, setAction] = useState("alert");
  const [severity, setSeverity] = useState("Medium");

  const fieldsList = ["type", "sourceIP", "destPort", "bytes", "requestCount", "protocol"];

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/rules", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setRules(data.rules);
      }
    } catch (err) {
      console.warn("API offline. Loading mock correlation rules.");
      setRules([
        { _id: "1", name: "Brute Force Protection Threshold", condition: { field: "type", operator: "equals", value: "brute_force", timeWindow: 60, threshold: 5 }, action: "alert", severity: "High", enabled: true },
        { _id: "2", name: "SQL Injection Payload Query Block", condition: { field: "type", operator: "equals", value: "sql_injection", timeWindow: 30, threshold: 1 }, action: "soar", severity: "Critical", enabled: true },
        { _id: "3", name: "Outlier High Bytes Exfiltration", condition: { field: "bytes", operator: "gt", value: "10000", timeWindow: 60, threshold: 1 }, action: "alert", severity: "Critical", enabled: false }
      ]);
    }
  };

  useEffect(() => {
    if (accessToken) fetchRules();
  }, [accessToken]);

  const openCreateModal = () => {
    setSelectedRule(null);
    setName("");
    setField("type");
    setOperator("equals");
    setValue("");
    setTimeWindow(60);
    setThreshold(1);
    setAction("alert");
    setSeverity("Medium");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setSelectedRule(rule);
    setName(rule.name);
    setField(rule.condition.field);
    setOperator(rule.condition.operator);
    setValue(rule.condition.value);
    setTimeWindow(rule.condition.timeWindow);
    setThreshold(rule.condition.threshold);
    setAction(rule.action);
    setSeverity(rule.severity);
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !value) {
      setError("Please fill out the rule name and matching condition value.");
      return;
    }

    const payload = {
      name,
      condition: { field, operator, value, timeWindow: Number(timeWindow), threshold: Number(threshold) },
      action,
      severity
    };

    try {
      const url = selectedRule ? `/api/rules/${selectedRule._id}` : "/api/rules";
      const method = selectedRule ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsModalOpen(false);
        fetchRules();
      } else {
        setError(data.message || "Failed to submit rule config.");
      }
    } catch (err) {
      // Offline fallback state update
      const mockRule = {
        _id: selectedRule ? selectedRule._id : `mock-rule-${Date.now()}`,
        name,
        condition: { field, operator, value, timeWindow: Number(timeWindow), threshold: Number(threshold) },
        action,
        severity,
        enabled: selectedRule ? selectedRule.enabled : true
      };
      if (selectedRule) {
        setRules(rules.map(r => r._id === selectedRule._id ? mockRule : r));
      } else {
        setRules([...rules, mockRule]);
      }
      setIsModalOpen(false);
    }
  };

  const handleToggle = async (rule) => {
    const updatedStatus = !rule.enabled;
    try {
      const response = await fetch(`/api/rules/${rule._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ enabled: updatedStatus })
      });
      if (response.ok) fetchRules();
    } catch (err) {
      setRules(rules.map(r => r._id === rule._id ? { ...r, enabled: updatedStatus } : r));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this custom detection rule?")) return;
    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.ok) fetchRules();
    } catch (err) {
      setRules(rules.filter(r => r._id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Custom Correlation Rules</h2>
          <p className="text-xs text-slate-500 mt-1">Manage detection patterns and alert thresholds for incoming traffic</p>
        </div>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-blue-500/10 transition cursor-pointer border-0"
        >
          Create Correlation Rule
        </button>
      </div>

      {/* Rules Registry Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] lg:min-w-0">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider">Rule Name</th>
                <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider font-mono">Condition Expression</th>
                <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider">Severity</th>
                <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider">Action Trigger</th>
                <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider">Status</th>
                <th className="p-4 text-right text-xs uppercase text-slate-400 font-semibold tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No custom correlation rules currently deployed.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => {
                  const cond = rule.condition;
                  const expression = `IF [${cond.field}] ${cond.operator} "${cond.value}" (Threshold: >= ${cond.threshold} in ${cond.timeWindow}s)`;
                  return (
                    <tr key={rule._id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-900">{rule.name}</td>
                      <td className="p-4 font-mono text-[10px] text-blue-600">{expression}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          rule.severity === "Critical" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                          rule.severity === "High" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                          "bg-amber-50 text-amber-705 border border-amber-200"
                        }`}>
                          {rule.severity}
                        </span>
                      </td>
                      <td className="p-4 font-semibold uppercase">{rule.action}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggle(rule)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition border-0 ${
                            rule.enabled 
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {rule.enabled ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="text-blue-600 hover:underline cursor-pointer border-0 bg-transparent font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rule._id)}
                          className="text-rose-600 hover:underline cursor-pointer border-0 bg-transparent font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900">
              {selectedRule ? "Edit Correlation Rule" : "Create Correlation Rule"}
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Brute Force Login Defense"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Condition Field</label>
                  <select
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                  >
                    {fieldsList.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Operator</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                  >
                    <option value="equals">equals</option>
                    <option value="contains">contains</option>
                    <option value="regex">regex matching</option>
                    <option value="gt">&gt; (Greater than)</option>
                    <option value="lt">&lt; (Less than)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Matching Value / Pattern</label>
                <input
                  type="text"
                  placeholder="e.g. brute_force or \d{3}\.\d{3}"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Threshold (Frequency count)</label>
                  <input
                    type="number"
                    min="1"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Time Window (Seconds)</label>
                  <input
                    type="number"
                    min="5"
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Action Trigger</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                  >
                    <option value="alert">Generate Alert</option>
                    <option value="soar">SOAR Playbook Execution</option>
                    <option value="ignore">Ignore Log</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer border-0"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
