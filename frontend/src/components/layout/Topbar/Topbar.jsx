import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, ChevronDown, User, LogOut } from "lucide-react";

import { getUnreadCount } from "../../../services/notificationService";
import LogoutModal from "../../common/LogoutModal/LogoutModal";

import "./Topbar.css";

function Topbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Sync with localStorage properly for state updates
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")) || {});

        setImgFallback(false);
      } catch {
        setUser({});
      }
    };

    window.addEventListener("storage", syncUser);

    window.addEventListener("userUpdated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);

      window.removeEventListener("userUpdated", syncUser);
    };
  }, []);
  const role = user?.role || "student";

  // Dynamic header titles based on matching the active route path
  const pageTitle = useMemo(() => {
    const path = location.pathname;

    if (path.includes("/dashboard")) return "Dashboard";
    if (path.includes("/create")) return "Create Complaint";
    if (path.includes("/my-complaints")) return "My Complaints";
    if (path.includes("/notifications")) return "Notifications";
    if (path.includes("/profile")) return "Profile";
    if (path.includes("/analytics")) return "Analytics";
    if (path.includes("/staff")) return "Staff";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/complaint/edit")) return "Edit Complaint";
    if (path.includes("/complaint")) return "Complaint Details";

    return "CampusAI";
  }, [location.pathname]);

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const [openProfile, setOpenProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [imgFallback, setImgFallback] = useState(false);

  const loadUnread = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setNotificationCount(Number(count) || 0);
    } catch {
      setNotificationCount(0);
    }
  }, []);

  // Set up the notification background refresh polling loop
  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 5000);
    return () => clearInterval(interval);
  }, [loadUnread]);

  // Handle dropdown utility event cleanup separately to prevent listener churn
  useEffect(() => {
    if (!openProfile) return;

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openProfile]);

  const goProfile = () => {
    setOpenProfile(false);
    switch (role.toLowerCase()) {
      case "staff":
        navigate("/staff/profile");
        break;
      case "admin":
        navigate("/admin/profile");
        break;
      default:
        navigate("/student/profile");
    }
  };

  const logout = () => {
    setShowLogoutModal(false);

    [
      "token",
      "accessToken",
      "authToken",
      "user",
      "currentUser",
      "role",
    ].forEach((key) => localStorage.removeItem(key));

    sessionStorage.clear();

    navigate("/login", { replace: true });

    window.location.replace("/login");
  };
  return (
    <>
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />

      <header className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="menu-btn"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="page-info">
            <h2>{pageTitle}</h2>
            <p>{currentDate}</p>
          </div>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="icon-btn notification-btn"
            aria-label="Notifications"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="notification-badge" aria-live="polite">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>

          <div className="profile-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className={`profile-btn ${openProfile ? "active" : ""}`}
              onClick={() => setOpenProfile((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={openProfile}
            >
              {user?.profile_image && !imgFallback ? (
                <img
                  src={user.profile_image}
                  alt={`${user?.name || "User"} profile`}
                  className="profile-avatar-img"
                  onError={() => setImgFallback(true)}
                />
              ) : (
                <div className="profile-avatar">
                  {(user?.name?.trim()?.charAt(0) || "U").toUpperCase()}
                </div>
              )}

              <div className="profile-info">
                <h4>{user?.name || "User"}</h4>
                <p>{role}</p>
              </div>

              <ChevronDown
                size={16}
                className={`profile-arrow ${openProfile ? "rotate" : ""}`}
              />
            </button>

            {openProfile && (
              <div className="profile-dropdown" role="menu">
                <button type="button" onClick={goProfile} role="menuitem">
                  <User size={16} />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="logout-option"
                  onClick={() => {
                    setOpenProfile(false);
                    setShowLogoutModal(true);
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Topbar;
