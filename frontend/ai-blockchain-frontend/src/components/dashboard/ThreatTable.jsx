import { useState } from "react";

export default function ThreatTable({ threats, setSelectedThreat, threatSearch, setThreatSearch }) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting Handler
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter & Sort logic
  const filteredThreats = threats
    .filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(threatSearch.toLowerCase()) ||
        t.type.toLowerCase().includes(threatSearch.toLowerCase()) ||
        t.status.toLowerCase().includes(threatSearch.toLowerCase());
      const matchesSeverity =
        severityFilter === "all" || t.severity.toLowerCase() === severityFilter.toLowerCase();
      return matchesSearch && matchesSeverity;
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredThreats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedThreats = filteredThreats.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6">
      
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-850">Recent Threat Alerts</h3>
          <p className="text-xs text-slate-400 mt-1">Audit security alerts compiled via real-time vector analysis</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Local search */}
          <div className="relative w-full sm:w-44">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search threats..."
              value={threatSearch}
              onChange={(e) => {
                setThreatSearch(e.target.value);
                setCurrentPage(1); // reset to page 1 on search
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1); // reset to page 1 on filter
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-650 focus:outline-none cursor-pointer border-slate-200"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[600px] lg:min-w-0">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th onClick={() => requestSort("id")} className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider cursor-pointer hover:text-blue-600 select-none">
                Threat ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => requestSort("type")} className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider cursor-pointer hover:text-blue-600 select-none">
                Type {sortConfig.key === "type" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => requestSort("severity")} className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider cursor-pointer hover:text-blue-600 select-none">
                Severity {sortConfig.key === "severity" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => requestSort("status")} className="p-4 text-left text-xs uppercase text-slate-400 font-semibold tracking-wider cursor-pointer hover:text-blue-600 select-none">
                Status {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-4 text-right text-xs uppercase text-slate-400 font-semibold tracking-wider">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedThreats.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-xs text-slate-400">
                  No threat incidents matched the query.
                </td>
              </tr>
            ) : (
              paginatedThreats.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedThreat(t)}
                  className="hover:bg-slate-50/50 transition cursor-pointer group"
                >
                  <td className="p-4 font-mono font-bold text-xs text-blue-600">{t.id}</td>
                  <td className="p-4 text-xs font-semibold text-slate-700">{t.type}</td>
                  <td className="p-4 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-4xs font-bold uppercase ${
                      t.severity === "Critical" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                      t.severity === "High" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                      "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {t.severity}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-semibold">
                    <span className={`px-2 py-0.5 rounded-full text-4xs font-bold uppercase ${
                      t.status === "Blocked" ? "bg-emerald-50 text-emerald-700 border border-emerald-255" :
                      "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-xs">
                    <span className="text-blue-600 group-hover:underline font-semibold flex items-center justify-end gap-1.5">
                      Inspect
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
          <p>
            Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
            <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredThreats.length)}</span> of{" "}
            <span className="font-semibold">{filteredThreats.length}</span> threats
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg border border-slate-200 font-semibold cursor-pointer ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg border border-slate-200 font-semibold cursor-pointer ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
