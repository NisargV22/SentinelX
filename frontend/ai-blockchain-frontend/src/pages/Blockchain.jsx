import ActivitySection from "../components/dashboard/ActivitySection";

export default function Blockchain({ blockchainSearch, setBlockchainSearch, accessToken }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">SIEM Ledger Auditing Console</h2>
        <p className="text-xs text-slate-500 mt-1">Audit cryptographically anchored security event logs</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Anchored Blocks</p>
          <span className="text-2xl font-black text-slate-900 font-mono mt-2 block">120</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Synchronized Validators</p>
          <span className="text-2xl font-black text-slate-900 font-mono mt-2 block">12 / 12</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Block Time</p>
          <span className="text-2xl font-black text-slate-900 font-mono mt-2 block">2.4s</span>
        </div>
      </div>

      {/* Activity Logs & Ledger Table */}
      <ActivitySection 
        blockchainSearch={blockchainSearch} 
        setBlockchainSearch={setBlockchainSearch} 
        accessToken={accessToken}
      />

    </div>
  );
}
