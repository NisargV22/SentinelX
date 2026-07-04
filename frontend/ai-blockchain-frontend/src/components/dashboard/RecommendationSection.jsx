export default function RecommendationSection() {
  const recommendations = [
    { id: "REC01", title: "Enable Zero-Trust Micro-segmentation", desc: "Block lateral transit vectors on network subnet cluster C-14.", priority: "Critical", action: "Apply Segments" },
    { id: "REC02", title: "Revoke Outdated SSH Keychains", desc: "Found keys inactive for 90 days on backend API service ports.", priority: "High", action: "Revoke Keys" },
    { id: "REC03", title: "Rotate Node Ledger Signatures", desc: "Recommend rotating validators keyrings to preserve chain integrity.", priority: "Medium", action: "Rotate Keys" }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-850">AI Strategic Recommendations</h3>
        <p className="text-xs text-slate-400 mt-1">Machine intelligence actionable items generated for risk mitigation</p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  rec.priority === "Critical" ? "bg-rose-100 text-rose-700" :
                  rec.priority === "High" ? "bg-orange-100 text-orange-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {rec.priority}
                </span>
                <p className="text-xs font-bold text-slate-805">{rec.title}</p>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-normal">{rec.desc}</p>
            </div>
            <button
              onClick={() => alert(`AI recommendation override action initiated for ${rec.id}`)}
              className="w-full md:w-auto px-4 py-2 text-xs font-bold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition duration-150 cursor-pointer"
            >
              {rec.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
