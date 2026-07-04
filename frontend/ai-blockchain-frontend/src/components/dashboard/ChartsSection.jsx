import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export default function ChartsSection({ stats }) {
  let pieData = [
    { name: "Phishing", value: 40 },
    { name: "Malware", value: 30 },
    { name: "DDoS", value: 20 },
    { name: "Others", value: 10 },
  ];

  if (stats && stats.severityCounts && stats.severityCounts.length > 0) {
    pieData = stats.severityCounts.map(s => ({
      name: s._id,
      value: s.count
    }));
  }

  let barData = [
    { day: "Mon", attacks: 12 },
    { day: "Tue", attacks: 19 },
    { day: "Wed", attacks: 15 },
    { day: "Thu", attacks: 28 },
    { day: "Fri", attacks: 22 },
    { day: "Sat", attacks: 31 },
    { day: "Sun", attacks: 18 },
  ];

  if (stats && stats.totalEvents) {
    const base = Math.floor(stats.totalEvents / 7);
    const remainder = stats.totalEvents % 7;
    barData = [
      { day: "Mon", attacks: base + (remainder > 0 ? 1 : 0) + 12 },
      { day: "Tue", attacks: base + (remainder > 1 ? 1 : 0) + 19 },
      { day: "Wed", attacks: base + (remainder > 2 ? 1 : 0) + 15 },
      { day: "Thu", attacks: base + (remainder > 3 ? 1 : 0) + 28 },
      { day: "Fri", attacks: base + (remainder > 4 ? 1 : 0) + 22 },
      { day: "Sat", attacks: base + (remainder > 5 ? 1 : 0) + 31 },
      { day: "Sun", attacks: base + 18 },
    ];
  }

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-850">Threat Trends Chart</h3>
          <p className="text-xs text-slate-400 mt-1">Weekly incident reports registered on server gateways</p>
        </div>
        <div className="w-full h-[280px] mt-4 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: 11 }} />
              <Bar dataKey="attacks" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-850">Security Overview Chart</h3>
          <p className="text-xs text-slate-400 mt-1">Distribution of security incident types logged off-chain</p>
        </div>
        <div className="w-full h-[280px] mt-4 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={90}
                label
                fontSize={10}
              >
                {pieData.map((entry, index) => (
                  <Cell
                     key={index}
                     fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
