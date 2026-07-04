import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function Analytics({ accessToken }) {
  const [trafficData, setTrafficData] = useState([]);
  const [portsData, setPortsData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const COLORS = ["#f43f5e", "#f97316", "#eab308", "#3b82f6"]; // Rose, Orange, Amber, Blue

  const fetchAnalytics = async () => {
    try {
      const hourRes = await fetch("/api/analytics/traffic-by-hour", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const hourData = await hourRes.json();
      if (hourData.success) setTrafficData(hourData.data);

      const portsRes = await fetch("/api/analytics/top-ports", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const portsData = await portsRes.json();
      if (portsData.success) setPortsData(portsData.data);

      const trendRes = await fetch("/api/analytics/alert-trend", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const trendData = await trendRes.json();
      if (trendData.success) setTrendData(trendData.data);
    } catch (err) {
      console.warn("API offline. Loading mock charts data.");
      setTrafficData(Array.from({ length: 12 }, (_, i) => ({ hour: `${i * 2}:00`, count: Math.floor(10 + Math.random() * 50) })));
      setPortsData([
        { port: "80 (HTTP)", count: 240 },
        { port: "443 (HTTPS)", count: 180 },
        { port: "22 (SSH)", count: 65 },
        { port: "53 (DNS)", count: 32 }
      ]);
      setTrendData(Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return { date: date.toLocaleDateString([], { month: "short", day: "numeric" }), alerts: Math.floor(1 + Math.random() * 6) };
      }));
    }
  };

  useEffect(() => {
    if (accessToken) fetchAnalytics();
  }, [accessToken]);

  const severityPieData = [
    { name: "Critical", value: 3 },
    { name: "High", value: 5 },
    { name: "Medium", value: 12 },
    { name: "Low", value: 20 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-xl font-bold text-slate-900">Security Analytics Dashboard</h2>
        <p className="text-xs text-slate-500 mt-1">Audit time-series statistics and metric distributions across all SIEM channels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Time-Series logs count (AreaChart) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ingested Logs By Hour</h3>
            <p className="text-2xs text-slate-400 font-medium">Hourly log traffic volume flowing through ingestion channels</p>
          </div>
          <div className="h-64 w-full text-2xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Top Target Ports (BarChart) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Top Target Network Ports</h3>
            <p className="text-2xs text-slate-400 font-medium">Telemetry distribution of destination ports hit by external traffic</p>
          </div>
          <div className="h-64 w-full text-2xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="port" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. 7-Day Alert Trend (AreaChart) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">7-Day Threat Warning Trend</h3>
            <p className="text-2xs text-slate-400 font-medium">Critical and High-risk alerts warning counts trend</p>
          </div>
          <div className="h-64 w-full text-2xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="alerts" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAlerts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Event Severity Distribution (PieChart) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Event Severity Distribution</h3>
            <p className="text-2xs text-slate-400 font-medium">Categorization profile of security threat warnings</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center relative">
            <div className="w-1/2 h-full text-2xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend list */}
            <div className="w-1/2 space-y-2 text-xs font-bold">
              {severityPieData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></span>
                  <span className="text-slate-500 font-medium">{item.name}:</span>
                  <span className="text-slate-800 font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
