import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wrench, LayoutDashboard, FileText, Megaphone, LogOut, PlusCircle } from "lucide-react";

const residentLinks = [
  { to: "/resident", label: "My Complaints", icon: FileText, end: true },
  { to: "/resident/new", label: "Raise Complaint", icon: PlusCircle },
  { to: "/resident/notices", label: "Notice Board", icon: Megaphone },
];

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/complaints", label: "All Complaints", icon: FileText },
  { to: "/admin/notices", label: "Notice Board", icon: Megaphone },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "admin" ? adminLinks : residentLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <Wrench size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-sm leading-tight text-slate-900">
            Society
            <br />
            Tracker
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-100 text-amber-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-200">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle,_#e2e8f0_1px,_transparent_1px)] bg-[length:24px_24px]">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}