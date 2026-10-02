import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Bell,
  BarChart3,
  Users,
  User,
  Settings,
  LogOut,
  GraduationCap,
  ChevronRight,
  X,
} from "lucide-react";

import LogoutModal from "../../common/LogoutModal/LogoutModal";
import "./Sidebar.css";

function Sidebar({ open = false, toggleSidebar }) {
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [imgFallback, setImgFallback] = useState(false);

  /* ==========================================================
     GET USER FROM LOCAL STORAGE
  ========================================================== */

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  };

  const [user, setUser] = useState(getStoredUser);

  /* ==========================================================
     SYNC USER DATA
  ========================================================== */

  useEffect(() => {
    const syncUser = () => {
      const updatedUser = getStoredUser();

      setUser(updatedUser);

      // Important:
      // If profile image changes, allow the new image to load
      setImgFallback(false);
    };

    // Cross-tab localStorage changes
    window.addEventListener("storage", syncUser);

    // Same-tab custom event
    window.addEventListener("userUpdated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("userUpdated", syncUser);
    };
  }, []);

  const role = user?.role?.toLowerCase() || "student";

  /* ==========================================================
     MENU CONFIGURATION
  ========================================================== */

  const menus = useMemo(
    () => ({
      student: [
        {
          title: "Dashboard",
          path: "/student/dashboard",
          icon: <LayoutDashboard size={20} />,
        },
        {
          title: "Create Complaint",
          path: "/student/create",
          icon: <PlusCircle size={20} />,
        },
        {
          title: "My Complaints",
          path: "/student/my-complaints",
          icon: <ClipboardList size={20} />,
        },
        {
          title: "Notifications",
          path: "/notifications",
          icon: <Bell size={20} />,
        },
        {
          title: "Profile",
          path: "/student/profile",
          icon: <User size={20} />,
        },
      ],

      staff: [
        {
          title: "Dashboard",
          path: "/staff/dashboard",
          icon: <LayoutDashboard size={20} />,
        },
        {
          title: "Assigned Complaints",
          path: "/staff/complaints",
          icon: <ClipboardList size={20} />,
        },
        {
          title: "Analytics",
          path: "/staff/analytics",
          icon: <BarChart3 size={20} />,
        },
        {
          title: "Notifications",
          path: "/notifications",
          icon: <Bell size={20} />,
        },
        {
          title: "Profile",
          path: "/staff/profile",
          icon: <User size={20} />,
        },
      ],

      admin: [
        {
          title: "Dashboard",
          path: "/admin/dashboard",
          icon: <LayoutDashboard size={20} />,
        },
        {
          title: "Complaints",
          path: "/admin/complaints",
          icon: <ClipboardList size={20} />,
        },
        {
          title: "Analytics",
          path: "/admin/analytics",
          icon: <BarChart3 size={20} />,
        },
        {
          title: "Staff",
          path: "/admin/staff",
          icon: <Users size={20} />,
        },
        {
          title: "Notifications",
          path: "/notifications",
          icon: <Bell size={20} />,
        },
        {
          title: "Settings",
          path: "/admin/settings",
          icon: <Settings size={20} />,
        },
        {
          title: "Profile",
          path: "/admin/profile",
          icon: <User size={20} />,
        },
      ],
    }),
    [],
  );

  const menu = menus[role] || menus.student;

  /* ==========================================================
     SIDEBAR CONTROL
  ========================================================== */

  const closeSidebar = () => {
    if (typeof toggleSidebar === "function") {
      toggleSidebar();
    }
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

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

    setUser({});
    setImgFallback(false);

    closeSidebar();

    navigate("/login", {
      replace: true,
    });

    window.location.replace("/login");
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />

      <aside
        className={`sidebar ${open ? "show" : ""}`}
        aria-label="Sidebar Navigation"
      >
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <X size={22} />
        </button>

        <div className="sidebar-top-wrapper">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <div className="logo-glow"></div>
              <GraduationCap size={30} />
            </div>

            <div className="brand-text">
              <h2>CampusAI</h2>
              <p>Smart Campus Platform</p>
            </div>
          </div>

          <nav className="sidebar-menu">
            {menu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? " active" : ""}`
                }
              >
                <div className="link-left">
                  {item.icon}
                  <span>{item.title}</span>
                </div>

                <ChevronRight className="arrow" size={18} />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ======================================================
            SIDEBAR USER
        ====================================================== */}

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            {user?.profile_image && !imgFallback ? (
              <img
                key={user.profile_image}
                src={user.profile_image}
                alt={`${user?.name || "User"} profile`}
                className="avatar-img"
                onError={() => setImgFallback(true)}
              />
            ) : (
              <div className="avatar">
                {(user?.name?.trim()?.charAt(0) || "U").toUpperCase()}
              </div>
            )}

            <div className="user-info">
              <strong>{user?.name || "User"}</strong>
              <span>{role}</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
