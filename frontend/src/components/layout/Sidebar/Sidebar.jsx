import React, { useState, useEffect, useMemo } from "react";
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

  const role = user?.role?.toLowerCase() || "student";

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

  const closeSidebar = () => {
    if (typeof toggleSidebar === "function") {
      toggleSidebar();
    }
  };

  const logout = () => {
    setShowLogoutModal(false);

    // Remove every auth-related key
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

    closeSidebar();

    navigate("/login", {
      replace: true,
    });

    // Prevent browser Back from showing dashboard
    window.location.replace("/login");
  };

  return (
    <>
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />

      {/* {open && <div className="sidebar-overlay" onClick={closeSidebar} />} */}

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

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={user?.name || "User"}
                className="avatar-img"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            <div
              className="avatar"
              style={{ display: user?.profile_image ? "none" : "flex" }}
            >
              {(user?.name?.trim()?.charAt(0) || "U").toUpperCase()}
            </div>

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
