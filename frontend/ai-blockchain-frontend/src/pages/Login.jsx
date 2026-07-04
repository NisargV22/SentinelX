import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick-fill helper state
  const [selectedRole, setSelectedRole] = useState("soc");
  const [selectedUserIndex, setSelectedUserIndex] = useState("1");

  const navigate = useNavigate();

  // Populate list of seeded users for quick-fill
  const getHelperUsers = () => {
    const list = [];
    if (selectedRole === "soc") {
      for (let i = 1; i <= 5; i++) {
        list.push({
          email: `analyst${i}@sentinelx.io`,
          password: `Analyst@123456`,
          label: `SOC Analyst ${i}`
        });
      }
    } else {
      for (let i = 1; i <= 10; i++) {
        list.push({
          email: `employee${i}@sentinelx.io`,
          password: `Employee@123456`,
          label: `Employee Operator ${i}`
        });
      }
    }
    return list;
  };

  const handleApplyHelper = (e) => {
    const users = getHelperUsers();
    const idx = parseInt(selectedUserIndex) - 1;
    const matched = users[idx] || users[0];
    if (matched) {
      setEmail(matched.email);
      setPassword(matched.password);
      setError("");
    }
  };

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all credential fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Direct login bypass of MFA
        onLogin({
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
          accessToken: data.accessToken
        });
        if (data.user.role === "employee") {
          navigate("/report-incident");
        } else {
          navigate("/");
        }
        return;
      } else {
        setError(data.message || "Invalid security credentials provided.");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Backend API offline. Authenticating against local simulation database.");
    }

    // Local simulation fallback authentication (MFA Bypassed)
    const allHelpers = [
      ...Array.from({ length: 5 }, (_, i) => ({
        email: `analyst${i + 1}@sentinelx.io`,
        password: `Analyst@123456`,
        role: "soc",
        name: `SOC Analyst ${i + 1}`
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        email: `employee${i + 1}@sentinelx.io`,
        password: `Employee@123456`,
        role: "employee",
        name: `Employee Operator ${i + 1}`
      }))
    ];

    const match = allHelpers.find(
      (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
    );

    if (match) {
      onLogin({
        email: match.email,
        role: match.role,
        name: match.name,
        accessToken: "mock-session-token"
      });
      if (match.role === "employee") {
        navigate("/report-incident");
      } else {
        navigate("/");
      }
    } else {
      setError("Invalid security credentials provided.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 animate-in fade-in duration-300">
      
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-3">SentinelX Security Center</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Immutability Ledger & AI threat analytics</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleCredentialSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Corporate Email / ID</label>
            <input
              type="email"
              placeholder="e.g. analyst1@sentinelx.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Security Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-blue-500/10 transition duration-150 cursor-pointer border-0 mt-2 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Authenticate Portal"}
          </button>
        </form>

        {/* Corporate Credential Selector Dropdown */}
        <div className="border-t border-slate-150 pt-4 space-y-3">
          <p className="text-[10px] text-center text-slate-450 uppercase tracking-widest font-bold">
            Select Seeded Credentials Helper
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-2xs text-slate-400 font-bold uppercase mb-1">User Role</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setSelectedUserIndex("1");
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold cursor-pointer"
              >
                <option value="soc">SOC Analyst (5 Users)</option>
                <option value="employee">Employee (10 Users)</option>
              </select>
            </div>
            <div>
              <label className="block text-2xs text-slate-400 font-bold uppercase mb-1">User Index</label>
              <select
                value={selectedUserIndex}
                onChange={(e) => setSelectedUserIndex(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold cursor-pointer"
              >
                {Array.from({ length: selectedRole === "soc" ? 5 : 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Account #{i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleApplyHelper}
            className="w-full py-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition"
          >
            Apply Selected Account to Form
          </button>
        </div>

      </div>

    </div>
  );
}
