import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wrench } from "lucide-react";
import toast from "react-hot-toast";
import loginBg from "../assets/login-bg.jpg";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("resident");
  const [loading, setLoading] = useState(false);
  const { signupUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signupUser(name, email, password, role);
      toast.success(`Welcome, ${user.name.split(" ")[0]}`);
      navigate(user.role === "admin" ? "/admin" : "/resident");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* dark overlay so the form stays readable over the photo */}
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
            <Wrench size={20} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-white">
            Society Tracker
          </span>
        </div>

        <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-sm border border-white/30 p-8">
          <h1 className="font-display text-2xl font-semibold text-gray-900 mb-1">
            Create account
          </h1>
          <p className="text-gray-900 text-sm mb-6">
            Raise and track maintenance complaints
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Priya Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["resident", "admin"].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                      role === r
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white/70 text-slate-700 border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-900 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}