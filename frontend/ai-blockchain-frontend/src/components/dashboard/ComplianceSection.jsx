export default function ComplianceSection() {
  const checklists = [
    { framework: "NIST SP 800-53", controls: "32/35 Audited", rating: "91% Pass", status: "Nominal" },
    { framework: "GDPR Article 32", controls: "12/12 Audited", rating: "100% Pass", status: "Nominal" },
    { framework: "ISO/IEC 27001", controls: "27/30 Audited", rating: "90% Pass", status: "Nominal" },
    { framework: "SOC 2 Type II", controls: "18/20 Audited", rating: "90% Pass", status: "Nominal" }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-850">Compliance Framework Monitoring</h3>
        <p className="text-xs text-slate-400 mt-1">Cross-referencing telemetry logs against global security regulations</p>
      </div>

      <div className="space-y-4">
        {checklists.map((check) => (
          <div key={check.framework} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-200 rounded-lg hover:shadow-sm transition bg-slate-50/50 gap-2">
            <div>
              <p className="text-xs font-bold text-slate-805">{check.framework}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{check.controls} controls verified</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-mono font-bold text-blue-600">{check.rating}</span>
              <span className="px-2.5 py-0.5 rounded-full text-4xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                {check.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
