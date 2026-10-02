import api from "../api/axios";

export const createComplaint = async (data) => {
  const response = await api.post("/complaints", data);

  return response.data;
};

export const getMyComplaints = async () => {
  const response = await api.get("/complaints/my");

  return response.data.data;
};

export const getAllComplaints = async () => {
  const response = await api.get("/complaints");

  return response.data.data;
};

export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);

  return response.data.data;
};

export const getComplaintTimeline = async (id) => {
  const response = await api.get(`/complaints/${id}/timeline`);

  return response.data.data;
};

export const updateComplaint = async (id, data) => {
  const response = await api.put(`/complaints/${id}`, data);

  return response.data.data;
};

export const updateComplaintStatus = async (id, status) => {
  const response = await api.put(`/complaints/${id}/status`, {
    status,
  });

  return response.data.data;
};

export const assignComplaint = async (id, staffId) => {
  const response = await api.put(`/complaints/${id}/assign`, {
    staffId,
  });

  return response.data.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/complaints/${id}`);

  return response.data;
};
