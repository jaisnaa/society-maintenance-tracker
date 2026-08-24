import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import toast from "react-hot-toast";
import { Pin, Trash2, Plus, X } from "lucide-react";

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadNotices = () => {
    api
      .getNotices()
      .then((res) => setNotices(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createNotice({ title, content, is_important: isImportant });
      toast.success("Notice posted");
      setTitle("");
      setContent("");
      setIsImportant(false);
      setShowForm(false);
      loadNotices();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to post notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this notice?")) return;
    try {
      await api.deleteNotice(id);
      toast.success("Notice deleted");
      loadNotices();
    } catch {
      toast.error("Failed to delete notice");
    }
  };

  const formatPostedAt = (dateStr) => {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} · ${timePart}`;
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">
            Notice Board
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Announcements from the society admin
          </p>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "Post Notice"}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-4"
        >
          <input
            type="text"
            required
            placeholder="Notice title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <textarea
            required
            rows={3}
            placeholder="Notice content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="rounded border-slate-300"
            />
            Mark as important (pins to top, emails all residents)
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post Notice"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          No notices posted yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl p-5 ${
                n.is_important
                  ? "border border-slate-200 border-l-[3px] border-l-blue-600"
                  : "border border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    {n.is_important && (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                        <Pin size={11} />
                        Pinned
                      </span>
                    )}
                    <h3 className="font-semibold text-slate-900">{n.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {n.content}
                  </p>
                  <p className="text-xs text-slate-400 mt-2.5">
                    Posted by {n.posted_by_name} · {formatPostedAt(n.created_at)}
                  </p>
                </div>
                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}