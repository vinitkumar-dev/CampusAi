// Resolves whatever is stored in complaints.image_url into a loadable URL.
// - Cloudinary / any absolute http(s) URL  -> returned untouched
// - protocol-relative "//host/..."          -> https:
// - legacy relative "/uploads/x.jpg"        -> prefixed with the API host
//   (old records created before Cloudinary was introduced)
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://campusai-ssm9.onrender.com/api";

export const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return null;
  const url = value.trim();
  if (!url || url === "null" || url === "undefined") return null;

  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  if (url.startsWith("//")) return `https:${url}`;
  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
};

// complaint objects may carry the image under different keys
export const getComplaintImage = (c) =>
  resolveImageUrl(
    c?.image_url ?? c?.imageUrl ?? c?.complaint_image ?? c?.complaintImage ?? c?.image,
  );
