import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||  "https://campusai-ssm9.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("authToken");

const clearAuthStorage = () => {
  ["token", "accessToken", "authToken", "user", "currentUser", "role"].forEach(
    (key) => localStorage.removeItem(key),
  );
};

// ----------------------------
// Request Interceptor
// ----------------------------
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ----------------------------
// Response Interceptor
// ----------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: "Unable to connect to the server.",
        errors: null,
      });
    }

    const { status, data } = error.response;

    if (status === 401) {
      clearAuthStorage();

      const currentPath = window.location.pathname;

      if (currentPath !== "/login" && currentPath !== "/register") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(
      data || {
        success: false,
        message: "Something went wrong.",
        errors: null,
      },
    );
  },
);

export default api;
