import api from "../api/axios";

/* ===========================
   DASHBOARD
=========================== */

export const getStaffDashboard = async () => {
  const response = await api.get("/staff/dashboard");
  return response.data?.data || {};
};

/* ===========================
   ASSIGNED COMPLAINTS
=========================== */

export const getAssignedComplaints = async () => {
  const response = await api.get("/staff/complaints");
  return response.data?.data || [];
};

/* ===========================
   COMPLAINT DETAILS
=========================== */

export const getComplaintDetails = async (id) => {
  const response = await api.get(`/staff/complaints/${id}`);
  return response.data?.data || {};
};

/* ===========================
   UPDATE STATUS
=========================== */

export const updateComplaintStatus = async (id, payload) => {
  const response = await api.put(`/staff/complaints/${id}`, payload);
  return response.data?.data || {};
};

/* ===========================
   ANALYTICS
=========================== */

export const getStaffAnalytics = async () => {
  const response = await api.get("/staff/analytics");
  return response.data?.data || {};
};
