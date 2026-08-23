import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import * as api from "../api/endpoints";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { AlertTriangle, FileText, Clock, CheckCircle2 } from "lucide-react";

// All-blue palette — light slate-blue -> mid blue -> deep navy
const STATUS_COLORS = {
  Open: "#93c5fd",         // light blue
  "In Progress": "#2563eb", // mid blue
  Resolved: "#0f2a5c",      // deep navy
};

const CATEGORY_BAR_COLOR = "#1d4ed8";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </Layout>
    );
  }

  const statusData = Object.entries(data.by_status).map(([name, value]) => ({
    name,
    value,
  }));
  const categoryData = Object.entries(data.by_category).map(([name, value]) => ({
    name,
    value,
  }));

  const openCount = data.by_status["Open"] || 0;
  const inProgressCount = data.by_status["In Progress"] || 0;
  const resolvedCount = data.by_status["Resolved"] || 0;

  const statCards = [
    {
      label: "Total Complaints",
      value: data.total_complaints,
      icon: FileText,
      iconBg: "bg-slate-900",
      iconColor: "text-white",
      accent: "before:bg-slate-900",
    },
    {
      label: "Open",
      value: openCount,
      icon: AlertTriangle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
      accent: "before:bg-blue-300",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      icon: Clock,
      iconBg: "bg-blue-600",
      iconColor: "text-white",
      accent: "before:bg-blue-600",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      icon: CheckCircle2,
      iconBg: "bg-slate-900",
      iconColor: "text-white",
      accent: "before:bg-[#0f2a5c]",
    },
  ];

  return (
    <Layout>
      <div className="-m-6 p-6 bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-50 min-h-full">
        <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Overview of all society maintenance complaints
        </p>

        {data.overdue_count > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
            <AlertTriangle size={20} className="text-blue-700 shrink-0" />
            <p className="text-sm text-blue-900">
              <strong>{data.overdue_count}</strong> complaint
              {data.overdue_count !== 1 ? "s are" : " is"} overdue and need attention.
            </p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, iconBg, iconColor, accent }) => (
            <div
              key={label}
              className={`relative overflow-hidden bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${accent}`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconBg} ${iconColor}`}
              >
                <Icon size={18} />
              </div>
              <p className="text-2xl font-display font-semibold text-slate-900">
                {value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Donut chart — status split */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Status Split
            </h3>
            {statusData.length === 0 ? (
              <p className="text-sm text-slate-400">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || "#2563eb"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, color: "#475569" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar chart — by status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              By Status
            </h3>
            {statusData.length === 0 ? (
              <p className="text-sm text-slate-400">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#647195" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#647195" }} />
                  <Tooltip cursor={{ fill: "#eff6ff" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || "#2563eb"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar chart — by category */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              By Category
            </h3>
            {categoryData.length === 0 ? (
              <p className="text-sm text-slate-400">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#647195" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#647195" }} />
                  <Tooltip cursor={{ fill: "#eff6ff" }} />
                  <Bar dataKey="value" fill={CATEGORY_BAR_COLOR} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}