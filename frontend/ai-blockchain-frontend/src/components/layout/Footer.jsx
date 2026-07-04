export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-850">SentinelX Platform</span>
          <span>• final-year SecOps engineering project demonstration</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-slate-700 font-mono">SLA Uptime Status: 99.99% Nominal</span>
        </div>
        <p>© {new Date().getFullYear()} SentinelX. All rights reserved.</p>
      </div>
    </footer>
  );
}
