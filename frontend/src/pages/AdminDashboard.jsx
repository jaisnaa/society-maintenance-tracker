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
} from "recharts";
import { AlertTriangle, FileText, Clock, CheckCircle2 } from "lucide-react";

const STATUS_COLORS = {
  Open: "#647195",
  "In Progress": "#2c5580",
  Resolved: "#15803d",
};

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
    { label: "Total Complaints", value: data.total_complaints, icon: FileText, color: "text-slate-700 bg-slate-100" },
    { label: "Open", value: openCount, icon: AlertTriangle, color: "text-slate-700 bg-slate-100" },
    { label: "In Progress", value: inProgressCount, icon: Clock, color: "text-amber-700 bg-amber-100" },
    { label: "Resolved", value: resolvedCount, icon: CheckCircle2, color: "text-green-700 bg-green-100" },
  ];

  return (
    <Layout>
      <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">
        Dashboard
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Overview of all society maintenance complaints
      </p>

      {data.overdue_count > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertTriangle size={20} className="text-red-600 shrink-0" />
          <p className="text-sm text-red-800">
            <strong>{data.overdue_count}</strong> complaint
            {data.overdue_count !== 1 ? "s are" : " is"} overdue and need attention.
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-display font-semibold text-slate-900">
              {value}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            By Status
          </h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#647195" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#647195" }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || "#647195"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            By Category
          </h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e9f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#647195" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#647195" }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2c5580" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Layout>
  );
}