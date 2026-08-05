import api from "../api/axios";

/*
=================================
 ADMIN DASHBOARD
=================================
*/

export const getAdminDashboard = async () => {
  const { data } = await api.get("/admin/dashboard");

  return data;
};

/*
=================================
 ADMIN COMPLAINTS
=================================
*/

export const getAdminComplaints = async () => {
  const { data } = await api.get("/admin/complaints");

  return data;
};

export const getAdminComplaintDetails = async (id) => {
  const { data } = await api.get(`/admin/complaints/${id}`);

  return data;
};

export const updateComplaint = async (id, payload) => {
  const { data } = await api.put(`/admin/complaints/${id}`, payload);

  return data;
};

export const assignComplaintToStaff = async (complaintId, staffId) => {
  const response = await api.put(`/admin/complaints/${complaintId}/assign`, {
    staff_id: staffId,
  });

  return response.data;
};
export const deleteComplaint = async (id) => {
  const { data } = await api.delete(`/admin/complaints/${id}`);

  return data;
};

export const getAdminStaff = async () => {
  const response = await api.get("/admin/staff");

  return response.data;
};
/*
=================================
 STAFF MANAGEMENT
=================================
*/

export const getStaffList = async () => {
  const { data } = await api.get("/admin/staff");

  return data;
};

export const deleteStaff = async (id) => {
  const { data } = await api.delete(`/admin/staff/${id}`);

  return data;
};

export const toggleStaffStatus = async (id) => {
  const { data } = await api.put(`/admin/staff/${id}/toggle`);

  return data;
};

/*
=================================
 ANALYTICS
=================================
*/

// Summary Analytics
// GET /api/analytics/summary

export const getAnalyticsSummary = async () => {
  const { data } = await api.get("/analytics/summary");

  return data;
};

// Category Analytics
// GET /api/analytics/categories

export const getCategoryAnalytics = async () => {
  const { data } = await api.get("/analytics/categories");

  return data;
};

// Status Analytics
// GET /api/analytics/status

export const getStatusAnalytics = async () => {
  const { data } = await api.get("/analytics/status");

  return data;
};

// Combined Analytics
// Used by old components

export const getAdminAnalytics = async () => {
  try {
    const [summaryResponse, categoryResponse, statusResponse] =
      await Promise.all([
        getAnalyticsSummary(),

        getCategoryAnalytics(),

        getStatusAnalytics(),
      ]);

    return {
      data: {
        summary: summaryResponse?.data || {},

        category: categoryResponse?.data || [],

        status: statusResponse?.data || [],
      },
    };
  } catch (error) {
    console.error(
      "Analytics API Error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

/*
=================================
 ADMIN PROFILE / SETTINGS
=================================
*/

export const updateAdminProfile = async (profileData) => {
  const { data } = await api.put("/admin/settings/profile", profileData);

  return data;
};

export const changeAdminPassword = async (passwordData) => {
  const { data } = await api.put("/admin/settings/password", passwordData);

  return data;
};

export const updateSystemSettings = async (settings) => {
  const { data } = await api.put("/admin/settings", settings);

  return data;
};

/*
=================================
 CREATE STAFF
=================================
*/

export const createStaff = async (payload) => {
  const { data } = await api.post("/admin/staff", payload);

  return data;
};

/*
=================================
 UPDATE STAFF
=================================
*/

export const updateStaff = async (id, payload) => {
  const { data } = await api.put(`/admin/staff/${id}`, payload);

  return data;
};
