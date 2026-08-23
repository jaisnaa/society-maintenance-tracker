import api from "./client";

// ---- Auth ----
export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);

// ---- Complaints ----
export const createComplaint = (formData) =>
  api.post("/complaints", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMyComplaints = () => api.get("/complaints/mine");

export const getAllComplaints = (params) => api.get("/complaints", { params });

export const getComplaint = (id) => api.get(`/complaints/${id}`);

export const updateComplaintStatus = (id, data) =>
  api.patch(`/complaints/${id}/status`, data);

export const updateComplaintPriority = (id, data) =>
  api.patch(`/complaints/${id}/priority`, data);

// ---- Notices ----
export const getNotices = () => api.get("/notices");
export const createNotice = (data) => api.post("/notices", data);
export const deleteNotice = (id) => api.delete(`/notices/${id}`);

// ---- Dashboard ----
export const getDashboard = () => api.get("/dashboard");
