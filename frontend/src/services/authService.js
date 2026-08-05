import api from "../api/axios";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const normalizeLoginResponse = (response) => {
  const payload = response?.data ?? response;

  // New backend format
  if (payload?.data) {
    return {
      success: payload.success,
      message: payload.message,
      token: payload.data.token,
      user: payload.data.user,
      errors: payload.errors ?? null,
    };
  }

  // Backward compatibility
  return {
    success: payload.success,
    message: payload.message,
    token: payload.token,
    user: payload.user,
    errors: payload.errors ?? null,
  };
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  const result = normalizeLoginResponse(response);

  if (result.success && result.token && result.user) {
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));

    // Backward compatibility with existing code
    localStorage.setItem("accessToken", result.token);
    localStorage.setItem("authToken", result.token);
    localStorage.setItem("currentUser", JSON.stringify(result.user));
    localStorage.setItem("role", result.user.role);
  }

  return result;
};

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

export const logoutUser = () => {
  [
    TOKEN_KEY,
    USER_KEY,
    "accessToken",
    "authToken",
    "currentUser",
    "role",
  ].forEach((key) => localStorage.removeItem(key));
};

export const getToken = () => {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken")
  );
};

export const getCurrentUser = () => {
  const raw =
    localStorage.getItem(USER_KEY) || localStorage.getItem("currentUser");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getCurrentRole = () => {
  const user = getCurrentUser();
  return user?.role || localStorage.getItem("role");
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};
