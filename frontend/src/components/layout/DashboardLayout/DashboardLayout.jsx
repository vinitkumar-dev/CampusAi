import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";

import "./DashboardLayout.css";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`dashboard-main ${sidebarOpen ? "sidebar-mobile-open" : ""}`}
      >
        <Topbar toggleSidebar={toggleSidebar} />

        <main className="dashboard-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
