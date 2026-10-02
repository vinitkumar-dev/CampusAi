import api from "../api/axios";
import { resolveImageUrl } from "../utils/imageUtils";

export const uploadFile = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const url = response.data?.data?.fileUrl;

  if (!url) {
    throw new Error("fileUrl not returned from backend");
  }

  // Cloudinary returns an absolute https URL -> keep untouched.
  // Legacy/local fallback returns a relative path -> resolve against the API host.
  return resolveImageUrl(url);
};
