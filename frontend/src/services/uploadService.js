import api from "../api/axios";

export const uploadFile = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  console.log("Upload Response:", response.data);

  let url = response.data?.data?.fileUrl;

  if (!url) {
    throw new Error("fileUrl not returned from backend");
  }

  // Convert relative path to full URL
  if (!url.startsWith("http")) {
    url = `https://campusai-ssm9.onrender.com${url}`;
  }
  return url;
};
