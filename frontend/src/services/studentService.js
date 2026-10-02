import api from "../api/axios";

export const getStudentDashboard = async () => {
  const response = await api.get("/student/dashboard");

  return response.data;
};
