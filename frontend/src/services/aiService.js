import api from "../api/axios";

export const analyzeComplaint = async (complaint) => {
  const response = await api.post("/ai/analyze", {
    complaint,
  });

  return response.data;
};
