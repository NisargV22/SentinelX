import { useState } from "react";
import ThreatTable from "../components/dashboard/ThreatTable";
import ThreatModal from "../components/modals/ThreatModal";

export default function Threats({ threats, setSelectedThreat, selectedThreat, threatSearch, setThreatSearch, accessToken }) {
  const [predictions] = useState([
    { id: "PRD01", vector: "SQL Injection Probe", probability: "94.5%", target: "Database API Cluster 3", priority: "High" },
    { id: "PRD02", vector: "Credential Stuffing", probability: "89.2%", target: "User Authentication Service", priority: "Medium" }
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">SIEM Threat Intelligence Queue</h2>
        <p className="text-xs text-slate-500 mt-1">Review live threat signatures and inspect vector indicators</p>
      </div>

      {/* Severity Metrics Sub-cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Critical Threats Active</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {threats.filter(t => t.severity === "Critical").length || 1}
            </span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">High Threats Active</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {threats.filter(t => t.severity === "High").length || 1}
            </span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Threats Blocked</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {threats.length}
            </span>
          </div>
        </div>
      </div>

      {/* Threat alerts table */}
      <ThreatTable 
        threats={threats} 
        setSelectedThreat={setSelectedThreat} 
        threatSearch={threatSearch} 
        setThreatSearch={setThreatSearch} 
      />

      {/* AI Threat Predictions Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-850">AI Threat Predictions Queue</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Predictive analysis of incoming traffic signatures based on heuristics</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[500px] lg:min-w-0">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider">Predict ID</th>
                <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider">Vector Type</th>
                <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider">Target Endpoint</th>
                <th className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider">Probability Score</th>
                <th className="p-4 text-right text-xs uppercase text-slate-400 font-semibold tracking-wider">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {predictions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 text-xs font-mono font-bold text-slate-850">{p.id}</td>
                  <td className="p-4 text-xs font-semibold text-slate-705">{p.vector}</td>
                  <td className="p-4 text-xs font-mono text-slate-500">{p.target}</td>
                  <td className="p-4 text-xs font-mono font-bold text-blue-600">{p.probability}</td>
                  <td className="p-4 text-right text-xs">
                    <span className={`px-2 py-0.5 rounded text-4xs font-bold uppercase ${
                       p.priority === "High" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {p.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <ThreatModal 
          threat={selectedThreat} 
          onClose={() => setSelectedThreat(null)} 
          accessToken={accessToken}
        />
      )}

    </div>
  );
}
