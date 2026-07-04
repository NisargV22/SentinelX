import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Threats from "./pages/Threats";
import Blockchain from "./pages/Blockchain";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import EmployeePortal from "./pages/EmployeePortal";
import Rules from "./pages/Rules";
import SOAR from "./pages/SOAR";
import UBA from "./pages/UBA";
import IncidentPlaybooks from "./pages/IncidentPlaybooks";
import Analytics from "./pages/Analytics";
import ApiSettings from "./pages/ApiSettings";
import RetentionSettings from "./pages/RetentionSettings";

function ProtectedRoute({ children, allowedRoles, userRole }) {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === "employee" ? "/report-incident" : "/"} replace />;
  }
  return children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");

  const [threats, setThreats] = useState([
    {
      id: "TH001",
      type: "Phishing",
      severity: "High",
      status: "Blocked",
      time: "12:01 PM",
      ip: "192.168.1.102",
      affected: "Mail Server",
      description: "Multiple inbound emails containing zero-day phishing link payloads targeting human resource personnel.",
      remediation: "Spam filter updated, credentials reset for targeted users, host domain blacklisted.",
    },
    {
      id: "TH002",
      type: "Malware",
      severity: "Medium",
      status: "Blocked",
      time: "12:05 PM",
      ip: "10.0.0.15",
      affected: "Financial Workstation",
      description: "Trojan infection attempt intercepted by active endpoint protection scanner during attachment download.",
      remediation: "Device quarantined, antivirus scan completed, infected files purged.",
    },
    {
      id: "TH003",
      type: "DDoS Attack",
      severity: "Critical",
      status: "Mitigated",
      time: "12:10 PM",
      ip: "185.220.101.5",
      affected: "API Gateway",
      description: "High-volume UDP flood targeting API authentication servers, causing momentary latency spikes.",
      remediation: "Dynamic rate limiting activated, traffic routed through CDN protection shield, server load normalized.",
    },
  ]);

  const [selectedThreat, setSelectedThreat] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [threatSearch, setThreatSearch] = useState("");
  const [blockchainSearch, setBlockchainSearch] = useState("");

  useEffect(() => {
    setThreatSearch(globalSearch);
    setBlockchainSearch(globalSearch);
  }, [globalSearch]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: "critical", message: "Critical Malware Attempt Blocked", time: "15:20:05", read: false },
    { id: 2, type: "high", message: "Suspicious Login Detected", time: "15:18:11", read: false },
    { id: 3, type: "medium", message: "DDoS probability increased by 12%", time: "15:05:00", read: false },
    { id: 4, type: "info", message: "Blockchain Record Verified", time: "14:48:22", read: true },
    { id: 5, type: "info", message: "AI Engine Completed Threat Analysis", time: "14:30:15", read: true },
  ]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const fetchLiveAlerts = async () => {
      try {
        const response = await fetch("/api/events/alerts", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        const data = await response.json();
        if (data.success && data.alerts && data.alerts.length > 0) {
          const formatted = data.alerts.map((a) => ({
            id: a.threatId,
            eventId: a.eventId,
            type: a.type,
            severity: a.severity,
            status: a.status,
            time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ip: a.ip,
            affected: a.affected,
            description: a.description,
            remediation: a.remediation
          }));
          setThreats(formatted);
        }
      } catch (err) {
        console.warn("REST API server offline. Using fallback simulation data.");
      }
    };

    fetchLiveAlerts();
    const interval = setInterval(fetchLiveAlerts, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated, accessToken]);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setAccessToken(userData.accessToken);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken("");
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-200">
        
        <Navbar
          user={user}
          onLogout={handleLogout}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          notifications={notifications}
          setNotifications={setNotifications}
        />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            
            <Route
              path="/"
              element={
                user.role === "employee" ? (
                  <Navigate to="/report-incident" replace />
                ) : (
                  <Dashboard user={user} accessToken={accessToken} globalSearch={globalSearch} />
                )
              }
            />

            <Route
              path="/threats"
              element={
                <ProtectedRoute allowedRoles={["soc", "admin"]} userRole={user.role}>
                  <Threats
                    threats={threats}
                    selectedThreat={selectedThreat}
                    setSelectedThreat={setSelectedThreat}
                    threatSearch={threatSearch}
                    setThreatSearch={setThreatSearch}
                    accessToken={accessToken}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["soc", "admin"]} userRole={user.role}>
                  <Analytics accessToken={accessToken} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/uba"
              element={
                <ProtectedRoute allowedRoles={["soc", "admin"]} userRole={user.role}>
                  <UBA accessToken={accessToken} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/playbook-guides"
              element={
                <ProtectedRoute allowedRoles={["soc", "admin"]} userRole={user.role}>
                  <IncidentPlaybooks accessToken={accessToken} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/rules"
              element={
                <ProtectedRoute allowedRoles={["soc"]} userRole={user.role}>
                  <Rules accessToken={accessToken} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/soar"
              element={
                <ProtectedRoute allowedRoles={["soc"]} userRole={user.role}>
                  <SOAR accessToken={accessToken} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/api-settings"
              element={
                <ProtectedRoute allowedRoles={["soc"]} userRole={user.role}>
                  <ApiSettings accessToken={accessToken} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/retention"
              element={
                <ProtectedRoute allowedRoles={["soc"]} userRole={user.role}>
                  <RetentionSettings accessToken={accessToken} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/blockchain"
              element={
                <ProtectedRoute allowedRoles={["soc", "admin"]} userRole={user.role}>
                  <Blockchain
                    blockchainSearch={blockchainSearch}
                    setBlockchainSearch={setBlockchainSearch}
                    accessToken={accessToken}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["soc", "admin"]} userRole={user.role}>
                  <Reports threats={threats} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["soc"]} userRole={user.role}>
                  <Settings user={user} accessToken={accessToken} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/report-incident"
              element={
                <ProtectedRoute allowedRoles={["employee"]} userRole={user.role}>
                  <EmployeePortal user={user} />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </main>

        <Footer />

      </div>
    </Router>
  );
}