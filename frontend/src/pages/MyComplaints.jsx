import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { OverdueBadge } from "../components/Badges";
import * as api from "../api/endpoints";
import { ImageIcon, PlusCircle, Wrench, X, Clock } from "lucide-react";

const STATUSES = ["Open", "In Progress", "Resolved"];

const COLUMN_STYLES = {
  Open: {
    headerBg: "bg-blue-50",
    headerText: "text-blue-700",
    dot: "bg-blue-400",
  },
  "In Progress": {
    headerBg: "bg-blue-100",
    headerText: "text-blue-800",
    dot: "bg-blue-600",
  },
  Resolved: {
    headerBg: "bg-slate-100",
    headerText: "text-slate-700",
    dot: "bg-[#0f2a5c]",
  },
};

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  useEffect(() => {
    api
      .getMyComplaints()
      .then((res) => setComplaints(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (lightboxUrl) setLightboxUrl(null);
        else if (selected) setSelected(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxUrl, selected]);

  const columns = STATUSES.map((status) => ({
    status,
    items: complaints
      .filter((c) => c.status === status)
      .sort((a, b) => (b.is_overdue === a.is_overdue ? 0 : b.is_overdue ? 1 : -1)),
  }));

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">
            My Complaints
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Click any complaint to view its full status history
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

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 px-8 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-5">
            <Wrench size={28} className="text-blue-700" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {columns.map(({ status, items }) => {
            const style = COLUMN_STYLES[status];
            return (
              <div key={status} className="bg-slate-50 rounded-xl border border-slate-200 flex flex-col">
                <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${style.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span className={`text-sm font-semibold ${style.headerText}`}>{status}</span>
                  </div>
                  <span className={`text-xs font-medium ${style.headerText} bg-white/70 px-2 py-0.5 rounded-full`}>
                    {items.length}
                  </span>
                </div>

                <div className="p-3 space-y-3 min-h-[120px]">
                  {items.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Nothing here</p>
                  ) : (
                    items.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelected(c)}
                        className={`w-full text-left bg-white rounded-lg border p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all ${
                          c.is_overdue ? "border-red-300" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          <span className="text-[11px] font-medium text-slate-400">#{c.id}</span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {c.category}
                          </span>
                          {c.is_overdue && <OverdueBadge />}
                          {c.photo_url && <ImageIcon size={12} className="text-slate-400" />}
                        </div>
                        <p className="text-sm text-slate-800 font-medium line-clamp-2 mb-1.5">
                          {c.description}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock size={11} />
                          Raised {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal (read-only) */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-slate-400">#{selected.id}</span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {selected.category}
                </span>
                {selected.is_overdue && <OverdueBadge />}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-slate-800 text-sm">{selected.description}</p>
                <p className="text-xs text-slate-400 mt-1.5">
                  Raised {new Date(selected.created_at).toLocaleDateString()}
                </p>
              </div>

              {selected.photo_url && (
                <button
                  type="button"
                  onClick={() => setLightboxUrl(selected.photo_url)}
                  className="block cursor-zoom-in group relative w-full max-w-xs"
                >
                  <img
                    src={selected.photo_url}
                    alt="Complaint"
                    className="w-full rounded-lg border border-slate-200 group-hover:opacity-90 transition-opacity"
                  />
                  <span className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-[11px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to zoom
                  </span>
                </button>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Status History
                </p>
                <div className="space-y-3">
                  {selected.history.map((h) => (
                    <div key={h.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-700">{h.status}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {h.note && <p className="text-sm text-slate-600 mt-1">{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox overlay */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
          <img
            src={lightboxUrl}
            alt="Complaint full size"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      )}
    </Layout>
  );
}