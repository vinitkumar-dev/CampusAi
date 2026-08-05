import api from "../api/axios";

export const getSettings = async () => {
  const response = await api.get("/admin/settings");
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await api.put("/admin/settings", data);

  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put("/admin/change-password", data);

  return response.data;
};
