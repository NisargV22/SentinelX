import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar({
  user,
  onLogout,
  globalSearch,
  setGlobalSearch,
  notifications,
  setNotifications,
}) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'investigation', 'admin', null
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdown(null);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const toggleNotificationRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const navigationLinks = [
    { path: "/", label: "Log Console", allowedRoles: ["soc", "admin"] },
    { path: "/threats", label: "Threat Intelligence", allowedRoles: ["soc", "admin"] },
    { path: "/analytics", label: "Analytics Charts", allowedRoles: ["soc", "admin"] },
    { path: "/uba", label: "User Analytics", allowedRoles: ["soc", "admin"] },
    { path: "/playbook-guides", label: "Playbook Guides", allowedRoles: ["soc", "admin"] },
    { path: "/rules", label: "Detection Rules", allowedRoles: ["soc"] },
    { path: "/soar", label: "SOAR Actions", allowedRoles: ["soc"] },
    { path: "/api-settings", label: "API Settings", allowedRoles: ["soc"] },
    { path: "/retention", label: "Retention Policy", allowedRoles: ["soc"] },
    { path: "/blockchain", label: "Ledger Auditing", allowedRoles: ["soc", "admin"] },
    { path: "/reports", label: "Compliance Reports", allowedRoles: ["soc", "admin"] },
    { path: "/report-incident", label: "Incident Portal", allowedRoles: ["employee"] },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(user.role === "employee" ? "/report-incident" : "/")}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none font-sans">SentinelX</h1>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">SecOps Platform</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Core Console Links */}
            {(user.role === "soc" || user.role === "admin") && (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-xs font-semibold transition duration-150 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  Log Console
                </NavLink>
                <NavLink
                  to="/threats"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-xs font-semibold transition duration-150 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  Threat Intelligence
                </NavLink>
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-xs font-semibold transition duration-150 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  Charts
                </NavLink>

                {/* Dropdown: SIEM Investigation */}
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === "investigation" ? null : "investigation")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer transition border-0 bg-transparent ${
                      activeDropdown === "investigation"
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-655 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Investigation
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === "investigation" && (
                    <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 divide-y divide-slate-100 animate-in fade-in duration-150">
                      <div className="py-1">
                        <NavLink to="/uba" onClick={() => setActiveDropdown(null)} className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition font-semibold">
                          User Analytics (UBA)
                        </NavLink>
                        <NavLink to="/playbook-guides" onClick={() => setActiveDropdown(null)} className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition font-semibold">
                          Playbook Guides
                        </NavLink>
                        <NavLink to="/blockchain" onClick={() => setActiveDropdown(null)} className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition font-semibold">
                          Ledger Auditing
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Dropdown: SIEM Administration (SOC Analysts) */}
            {user.role === "soc" && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "admin" ? null : "admin")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer transition border-0 bg-transparent ${
                    activeDropdown === "admin"
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-655 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Administration
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === "admin" && (
                  <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 divide-y divide-slate-100 animate-in fade-in duration-150">
                    <div className="py-1">
                      <NavLink to="/rules" onClick={() => setActiveDropdown(null)} className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition font-semibold">
                        Detection Rules
                      </NavLink>
                      <NavLink to="/soar" onClick={() => setActiveDropdown(null)} className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition font-semibold">
                        SOAR Actions
                      </NavLink>
                      <NavLink to="/api-settings" onClick={() => setActiveDropdown(null)} className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition font-semibold">
                        API Settings
                      </NavLink>
                      <NavLink to="/retention" onClick={() => setActiveDropdown(null)} className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition font-semibold">
                        Retention Policy
                      </NavLink>
                      <NavLink to="/reports" onClick={() => setActiveDropdown(null)} className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition font-semibold">
                        Compliance Reports
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Incident Portal Link (Employee Only) */}
            {user.role === "employee" && (
              <NavLink
                to="/report-incident"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-semibold transition duration-150 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                Incident Portal
              </NavLink>
            )}
          </div>

          {/* Right Header components */}
          <div className="flex items-center gap-3">
            
            {/* Global Search Input */}
            {user.role !== "employee" && (
              <div className="relative hidden lg:block">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Global search..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-40 text-slate-805"
                />
              </div>
            )}

            {/* Clock */}
            <div className="hidden sm:block text-right pr-3 border-r border-slate-200">
              <p className="text-[8px] text-slate-400 uppercase tracking-widest leading-none font-bold">System Time</p>
              <p className="font-mono text-xs font-bold text-slate-700 mt-1">{time}</p>
            </div>

            {/* Notifications Bell */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="relative p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition duration-150 cursor-pointer focus:outline-none bg-transparent border-0"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-extrabold text-white bg-rose-500 rounded-full">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification drop */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-150">
                    <h3 className="font-bold text-xs text-blue-600 uppercase tracking-wider">Alert Center</h3>
                    <div className="flex gap-2">
                      <button onClick={markAllNotificationsAsRead} className="text-4xs text-slate-500 hover:text-blue-600 transition cursor-pointer bg-transparent border-0 font-bold">
                        Mark read
                      </button>
                      <span className="text-slate-300">|</span>
                      <button onClick={clearAllNotifications} className="text-4xs text-slate-500 hover:text-rose-600 transition cursor-pointer bg-transparent border-0 font-bold">
                        Clear all
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No active security notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => toggleNotificationRead(n.id)}
                          className={`p-3 transition duration-150 cursor-pointer flex flex-col gap-1 ${
                            n.read ? "bg-transparent hover:bg-slate-50" : "bg-blue-50/30 hover:bg-blue-50/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-4xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                              n.type === "critical" ? "bg-rose-100 text-rose-600 border border-rose-200" :
                              n.type === "high" ? "bg-amber-100 text-amber-600 border border-amber-200" :
                              "bg-blue-100 text-blue-600 border border-blue-200"
                            }`}>
                              {n.type}
                            </span>
                            <span className="text-4xs text-slate-400 font-mono">{n.time}</span>
                          </div>
                          <p className={`text-xs ${n.read ? "text-slate-400 line-through" : "text-slate-700 font-medium"}`}>
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar menu */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm cursor-pointer border-0"
              >
                {user.name.split(" ").map((w) => w[0]).join("")}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 p-2 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-805">{user.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">Role: {user.role}</p>
                  </div>
                  <NavLink
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="block w-full text-left px-3 py-1.5 text-xs text-slate-650 hover:bg-slate-100 rounded-md transition font-bold"
                  >
                    Account Settings
                  </NavLink>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer border-0 bg-transparent font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden cursor-pointer bg-transparent border-0"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

          </div>

        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2 shadow-inner transition-all max-h-60 overflow-y-auto">
          {navigationLinks
            .filter((link) => link.allowedRoles.includes(user.role))
            .map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-semibold transition ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-655 hover:bg-slate-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
        </div>
      )}
    </nav>
  );
}
