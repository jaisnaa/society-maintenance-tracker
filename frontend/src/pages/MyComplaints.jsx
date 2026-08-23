import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { StatusBadge, PriorityBadge, OverdueBadge } from "../components/Badges";
import * as api from "../api/endpoints";
import { ImageIcon, ChevronDown, ChevronUp, PlusCircle, ClipboardList, Wrench } from "lucide-react";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api
      .getMyComplaints()
      .then((res) => setComplaints(res.data))
      .finally(() => setLoading(false));
  }, []);

  const openCount = complaints.filter((c) => c.status === "Open").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">
            My Complaints
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track the status of complaints you've raised
          </p>
        </div>
        <Link
          to="/resident/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <PlusCircle size={16} />
          Raise Complaint
        </Link>
      </div>

      {!loading && complaints.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-display font-semibold text-orange-700">{openCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Open</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-display font-semibold text-amber-700">{inProgressCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">In Progress</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-display font-semibold text-green-700">{resolvedCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Resolved</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 px-8 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <Wrench size={28} className="text-amber-600" />
          </div>
          <h3 className="font-display text-lg font-semibold text-slate-900 mb-1.5">
            No complaints yet
          </h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
            Got a maintenance issue in your apartment or the common areas?
            Raise a complaint and track it right here from start to finish.
          </p>
          <Link
            to="/resident/new"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <PlusCircle size={16} />
            Raise your first complaint
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                className="w-full flex items-start justify-between p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs font-medium text-slate-400">
                      #{c.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} />
                    {c.is_overdue && <OverdueBadge />}
                    {c.photo_url && (
                      <ImageIcon size={14} className="text-slate-400" />
                    )}
                  </div>
                  <p className="text-slate-800 text-sm">{c.description}</p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Raised {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                {expanded === c.id ? (
                  <ChevronUp size={18} className="text-slate-400 shrink-0 ml-3" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400 shrink-0 ml-3" />
                )}
              </button>

              {expanded === c.id && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                  {c.photo_url && (
                    <img
                      src={c.photo_url}
                      alt="Complaint"
                      className="w-full max-w-xs rounded-lg mb-4 border border-slate-200"
                    />
                  )}
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Status History
                  </p>
                  <div className="space-y-3">
                    {c.history.map((h) => (
                      <div key={h.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={h.status} />
                            <span className="text-xs text-slate-400">
                              {new Date(h.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {h.note && (
                            <p className="text-sm text-slate-600 mt-1">{h.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}