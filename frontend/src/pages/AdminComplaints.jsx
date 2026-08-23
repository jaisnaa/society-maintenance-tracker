import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { StatusBadge, PriorityBadge, OverdueBadge } from "../components/Badges";
import * as api from "../api/endpoints";
import toast from "react-hot-toast";
import { ImageIcon, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORIES = ["Plumbing", "Electrical", "Security", "Housekeeping", "Parking", "Other"];
const STATUSES = ["Open", "In Progress", "Resolved"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("");

  const loadComplaints = () => {
    setLoading(true);
    const params = {};
    if (categoryFilter) params.category = categoryFilter;
    if (statusFilter) params.status = statusFilter;
    api
      .getAllComplaints(params)
      .then((res) => setComplaints(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter]);

  const toggleExpand = (c) => {
    if (expanded === c.id) {
      setExpanded(null);
    } else {
      setExpanded(c.id);
      setStatusDraft(c.status);
      setNoteDraft("");
    }
  };

  const handleStatusUpdate = async (id) => {
    try {
      await api.updateComplaintStatus(id, { status: statusDraft, note: noteDraft || null });
      toast.success("Status updated");
      setNoteDraft("");
      loadComplaints();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update status");
    }
  };

  const handlePriorityUpdate = async (id, priority) => {
    try {
      await api.updateComplaintPriority(id, { priority });
      toast.success("Priority updated");
      loadComplaints();
    } catch {
      toast.error("Failed to update priority");
    }
  };

  return (
    <Layout>
      <h1 className="font-display text-2xl font-semibold text-slate-900 mb-1">
        All Complaints
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Overdue complaints are surfaced at the top
      </p>

      <div className="flex gap-3 mb-5">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          No complaints match these filters.
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-xl border overflow-hidden ${
                c.is_overdue ? "border-red-300" : "border-slate-200"
              }`}
            >
              <button
                onClick={() => toggleExpand(c)}
                className="w-full flex items-start justify-between p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs font-medium text-slate-400">#{c.id}</span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    {c.is_overdue && <OverdueBadge />}
                    {c.photo_url && <ImageIcon size={14} className="text-slate-400" />}
                  </div>
                  <p className="text-slate-800 text-sm">{c.description}</p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {c.resident_name} · Raised {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                {expanded === c.id ? (
                  <ChevronUp size={18} className="text-slate-400 shrink-0 ml-3" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400 shrink-0 ml-3" />
                )}
              </button>

              {expanded === c.id && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 space-y-5">
                  {c.photo_url && (
                    <img
                      src={c.photo_url}
                      alt="Complaint"
                      className="w-full max-w-xs rounded-lg border border-slate-200"
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Priority
                      </label>
                      <div className="flex gap-1.5">
                        {PRIORITIES.map((p) => (
                          <button
                            key={p}
                            onClick={() => handlePriorityUpdate(c.id, p)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                              c.priority === p
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Update Status
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={statusDraft}
                        onChange={(e) => setStatusDraft(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Optional note..."
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => handleStatusUpdate(c.id)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  <div>
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}