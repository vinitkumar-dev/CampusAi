import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout/DashboardLayout";

import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register/Register";

// ===========================
// STUDENT
// ===========================
import Dashboard from "./pages/student/Dashboard/Dashboard";
import CreateComplaint from "./pages/student/CreateComplaint/CreateComplaint";
import MyComplaints from "./pages/student/MyComplaints/MyComplaints";
import ComplaintDetails from "./pages/student/ComplaintDetails/ComplaintDetails";
import EditComplaint from "./pages/student/EditComplaint/EditComplaint";
import Profile from "./pages/student/Profile/Profile";

// ===========================
// ADMIN
// ===========================
import AdminDashboard from "./pages/admin/Dashboard/AdminDashboard";
import AdminComplaints from "./pages/admin/Complaints/AdminComplaints";
import AdminComplaintDetails from "./pages/admin/ComplaintDetails/AdminComplaintDetails";
import AdminStaff from "./pages/admin/Staff/AdminStaff";
import AdminAnalytics from "./pages/admin/Analytics/AdminAnalytics";
import AdminSettings from "./pages/admin/Settings/Settings";
import AdminProfile from "./pages/admin/Profile/AdminProfile";

// ===========================
// STAFF
// ===========================
import StaffDashboard from "./pages/staff/Dashboard/StaffDashboard";
import AssignedComplaints from "./pages/staff/AssignedComplaints/AssignedComplaints";
import StaffComplaintDetails from "./pages/staff/ComplaintDetails/StaffComplaintDetails";
import StaffAnalytics from "./pages/staff/Analytics/StaffAnalytics";
import StaffProfile from "./pages/staff/Profile/StaffProfile";

// ===========================
// COMMON
// ===========================
import Notifications from "./pages/notifications/Notifications/Notifications";

// ======================================================
// AUTH HELPERS
// ======================================================
const getStoredToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("authToken");

const getStoredUser = () => {
  const raw =
    localStorage.getItem("user") || localStorage.getItem("currentUser");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const clearAuth = () => {
  ["token", "accessToken", "authToken", "user", "currentUser", "role"].forEach(
    (key) => localStorage.removeItem(key),
  );
};

const getAuthData = () => {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return {
      token: null,
      user: null,
    };
  }

  return {
    token,
    user,
  };
};

// ======================================================
// HOME REDIRECT
// ======================================================
function HomeRedirect() {
  const { token, user } = getAuthData();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "student":
      return <Navigate to="/student/dashboard" replace />;

    case "staff":
      return <Navigate to="/staff/dashboard" replace />;

    case "admin":
      return <Navigate to="/admin/dashboard" replace />;

    default:
      clearAuth();
      return <Navigate to="/login" replace />;
  }
}

// ======================================================
// PUBLIC ROUTE
// ======================================================
function PublicRoute({ children }) {
  const { token, user } = getAuthData();

  if (token && user) {
    switch (user.role) {
      case "student":
        return <Navigate to="/student/dashboard" replace />;
      case "staff":
        return <Navigate to="/staff/dashboard" replace />;
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      default:
        clearAuth();
    }
  }

  return children;
}

// ======================================================
// PROTECTED ROUTE
// ======================================================
function ProtectedRoute({ children, roles }) {
  const { token, user } = getAuthData();

  if (!token || !user) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <HomeRedirect />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomeRedirect />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* STUDENT */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["student"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create" element={<CreateComplaint />} />
          <Route path="my-complaints" element={<MyComplaints />} />
          <Route path="complaint/:id" element={<ComplaintDetails />} />
          <Route path="complaint/edit/:id" element={<EditComplaint />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* STAFF */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={["staff"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="complaints" element={<AssignedComplaints />} />
          <Route path="complaints/:id" element={<StaffComplaintDetails />} />
          <Route path="analytics" element={<StaffAnalytics />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="complaints/:id" element={<AdminComplaintDetails />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* COMMON */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute roles={["student", "staff", "admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Notifications />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
