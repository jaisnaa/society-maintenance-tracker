import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyComplaints from "./pages/MyComplaints";
import RaiseComplaint from "./pages/RaiseComplaint";
import NoticeBoard from "./pages/NoticeBoard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminComplaints from "./pages/AdminComplaints";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/resident"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Resident routes */}
          <Route
            path="/resident"
            element={
              <ProtectedRoute requireRole="resident">
                <MyComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/new"
            element={
              <ProtectedRoute requireRole="resident">
                <RaiseComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resident/notices"
            element={
              <ProtectedRoute requireRole="resident">
                <NoticeBoard />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute requireRole="admin">
                <NoticeBoard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
