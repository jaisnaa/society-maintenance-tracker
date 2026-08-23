const STATUS_STYLES = {
  Open: "bg-slate-100 text-slate-700 border-slate-300",
  "In Progress": "bg-status-progress/10 text-status-progress border-status-progress/30",
  Resolved: "bg-status-resolved/10 text-status-resolved border-status-resolved/30",
};

const PRIORITY_STYLES = {
  Low: "bg-slate-100 text-slate-600 border-slate-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-300",
  High: "bg-danger/10 text-danger border-danger/30",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        PRIORITY_STYLES[priority] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {priority}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger text-white">
      Overdue
    </span>
  );
}