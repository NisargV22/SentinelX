import { useState, useEffect } from "react";

export default function SOAR({ accessToken }) {
  const [playbooks, setPlaybooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [triggerRules, setTriggerRules] = useState("");
  const [steps, setSteps] = useState([]);
  const [newAction, setNewAction] = useState("block_ip");
  const [newTarget, setNewTarget] = useState("");

  const fetchPlaybooks = async () => {
    try {
      const response = await fetch("/api/playbooks", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setPlaybooks(data.playbooks);
      }
    } catch (err) {
      console.warn("API offline. Loading mock playbooks.");
      setPlaybooks([
        { _id: "1", name: "Auto-Mitigate Brute Force & Malware", trigger_rules: ["BRUTE_FORCE", "MALWARE"], steps: [{ action: "block_ip", target: "Firewall Gateway" }, { action: "notify_slack", target: "#sec-ops" }, { action: "create_case", target: "IR System" }], enabled: true },
        { _id: "2", name: "DDoS Mitigation Rate-Limit", trigger_rules: ["DDOS"], steps: [{ action: "block_ip", target: "Cloudflare CDN" }, { action: "send_email", target: "lead-analyst@company.com" }], enabled: false }
      ]);
    }
  };

  useEffect(() => {
    if (accessToken) fetchPlaybooks();
  }, [accessToken]);

  const openCreateModal = () => {
    setSelectedPlaybook(null);
    setName("");
    setTriggerRules("");
    setSteps([]);
    setNewAction("block_ip");
    setNewTarget("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (pb) => {
    setSelectedPlaybook(pb);
    setName(pb.name);
    setTriggerRules(pb.trigger_rules.join(", "));
    setSteps(pb.steps);
    setNewAction("block_ip");
    setNewTarget("");
    setError("");
    setIsModalOpen(true);
  };

  const addStep = () => {
    if (newAction === "notify_slack" && !newTarget) {
      setError("Please specify a Slack channel or webhook target.");
      return;
    }
    setSteps([...steps, { action: newAction, target: newTarget || "Default Target" }]);
    setNewTarget("");
    setError("");
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !triggerRules || steps.length === 0) {
      setError("Please provide a playbook name, triggers, and at least one action step.");
      return;
    }

    const payload = {
      name,
      trigger_rules: triggerRules.split(",").map(s => s.trim()).filter(Boolean),
      steps
    };

    try {
      const url = selectedPlaybook ? `/api/playbooks/${selectedPlaybook._id}` : "/api/playbooks";
      const method = selectedPlaybook ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchPlaybooks();
      }
    } catch (err) {
      // Offline fallback state update
      const mockPb = {
        _id: selectedPlaybook ? selectedPlaybook._id : `mock-pb-${Date.now()}`,
        name,
        trigger_rules: triggerRules.split(",").map(s => s.trim()).filter(Boolean),
        steps,
        enabled: selectedPlaybook ? selectedPlaybook.enabled : true
      };
      if (selectedPlaybook) {
        setPlaybooks(playbooks.map(p => p._id === selectedPlaybook._id ? mockPb : p));
      } else {
        setPlaybooks([...playbooks, mockPb]);
      }
      setIsModalOpen(false);
    }
  };

  const handleToggle = async (pb) => {
    const updatedStatus = !pb.enabled;
    try {
      const response = await fetch(`/api/playbooks/${pb._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ enabled: updatedStatus })
      });
      if (response.ok) fetchPlaybooks();
    } catch (err) {
      setPlaybooks(playbooks.map(p => p._id === pb._id ? { ...p, enabled: updatedStatus } : p));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this SOAR response playbook?")) return;
    try {
      const response = await fetch(`/api/playbooks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.ok) fetchPlaybooks();
    } catch (err) {
      setPlaybooks(playbooks.filter(p => p._id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">SOAR Orchestration Playbooks</h2>
          <p className="text-xs text-slate-500 mt-1">Configure automated workflows to respond to high-priority security incidents</p>
        </div>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-blue-500/10 transition cursor-pointer border-0"
        >
          Create SOAR Playbook
        </button>
      </div>

      {/* Playbook List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {playbooks.map((pb) => (
          <div key={pb._id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-slate-900">{pb.name}</h3>
                <button
                  onClick={() => handleToggle(pb)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition border-0 ${
                    pb.enabled 
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {pb.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Triggers:</p>
                <div className="flex flex-wrap gap-1.5">
                  {pb.trigger_rules.map(trig => (
                    <span key={trig} className="bg-slate-50 border border-slate-200 text-slate-650 px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold">
                      {trig}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Workflow Checklist Steps:</p>
                <ol className="space-y-1.5">
                  {pb.steps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-650 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold font-mono flex items-center justify-center text-[10px] border border-blue-100">
                        {idx + 1}
                      </span>
                      <span className="font-bold uppercase text-[10px] text-slate-800">{step.action.replace("_", " ")}</span>
                      <span className="text-[10px] text-slate-400">({step.target})</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => openEditModal(pb)}
                className="px-3 py-1.5 text-xs text-blue-600 hover:underline cursor-pointer bg-transparent border-0 font-semibold"
              >
                Edit Playbook
              </button>
              <button
                onClick={() => handleDelete(pb._id)}
                className="px-3 py-1.5 text-xs text-rose-600 hover:underline cursor-pointer bg-transparent border-0 font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900">
              {selectedPlaybook ? "Edit SOAR Response" : "Create SOAR Response Playbook"}
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Playbook Name</label>
                <input
                  type="text"
                  placeholder="e.g. SQL Injection Auto-Defense"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Trigger Rules (comma-separated event types)</label>
                <input
                  type="text"
                  placeholder="e.g. BRUTE_FORCE, MALWARE"
                  value={triggerRules}
                  onChange={(e) => setTriggerRules(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 font-mono text-[10px]"
                />
              </div>

              {/* Steps configuration */}
              <div className="space-y-3">
                <label className="block font-semibold text-slate-700">Configure Action Steps</label>
                
                <div className="flex gap-2">
                  <select
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 cursor-pointer"
                  >
                    <option value="block_ip">Block Source IP</option>
                    <option value="send_email">Send Email Alert</option>
                    <option value="create_case">Create Incident Ticket Case</option>
                    <option value="notify_slack">Notify Slack Channel</option>
                    <option value="auto_escalate">Auto-Escalate Severity</option>
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. #sec-ops or lead@company.com"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={addStep}
                    className="px-3.5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer border-0"
                  >
                    Add
                  </button>
                </div>

                <div className="border border-slate-150 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto bg-slate-50/50">
                  {steps.length === 0 ? (
                    <p className="p-4 text-center text-slate-400">No action steps configured yet.</p>
                  ) : (
                    steps.map((step, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5">
                        <span className="font-bold text-slate-800 font-mono text-[10px]">
                          {idx + 1}. {step.action.replace("_", " ").toUpperCase()} ({step.target})
                        </span>
                        <button
                          type="button"
                          onClick={() => removeStep(idx)}
                          className="text-rose-600 hover:underline cursor-pointer border-0 bg-transparent font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer border-0"
                >
                  Deploy Playbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
