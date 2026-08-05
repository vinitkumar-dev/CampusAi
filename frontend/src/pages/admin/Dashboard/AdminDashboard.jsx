import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  UserCog,
  AlertTriangle,
  RefreshCcw,
  Loader2,
  LayoutDashboard,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";

import { getAdminDashboard } from "../../../services/adminService";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    total_complaints: 0,
    pending_complaints: 0,
    resolved_complaints: 0,
    students: 0,
    staff: 0,
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadDashboard = async (isManualSync = false) => {
    try {
      if (isManualSync) setSyncing(true);
      else setLoading(true);

      const response = await getAdminDashboard();
      const data = response?.data || {};

      setDashboard({
        total_complaints: Number(data.total_complaints) || 0,
        pending_complaints: Number(data.pending_complaints) || 0,
        resolved_complaints: Number(data.resolved_complaints) || 0,
        students: Number(data.students) || 0,
        staff: Number(data.staff) || 0,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading-viewport">
        <Loader2 size={40} className="dashboard-spin-loader" />
        <h3>Loading dashboard data...</h3>
      </div>
    );
  }

  // Calculations
  const activeBacklog = dashboard.pending_complaints;
  const resolutionRate =
    dashboard.total_complaints > 0
      ? Math.round(
          (dashboard.resolved_complaints / dashboard.total_complaints) * 100,
        )
      : 0;

  const statsCards = [
    {
      title: "Total Complaints",
      value: dashboard.total_complaints,
      icon: <ClipboardList size={22} />,
      className: "card-blue",
      desc: "All complaints submitted to date",
    },
    {
      title: "Pending Complaints",
      value: dashboard.pending_complaints,
      icon: <Clock3 size={22} />,
      className: "card-orange",
      desc: "Awaiting staff assignment",
    },
    {
      title: "Active Backlog",
      value: activeBacklog,
      icon: <AlertTriangle size={22} />,
      className: "card-purple",
      desc: "Complaints currently being handled",
    },
    {
      title: "Resolved Cases",
      value: dashboard.resolved_complaints,
      icon: <CheckCircle2 size={22} />,
      className: "card-green",
      desc: "Successfully closed complaints",
    },
    {
      title: "Registered Students",
      value: dashboard.students,
      icon: <GraduationCap size={22} />,
      className: "card-teal",
      desc: "Students registered in system",
    },
    {
      title: "Registered Staff",
      value: dashboard.staff,
      icon: <UserCog size={22} />,
      className: "card-indigo",
      desc: "Staff members handling complaints",
    },
  ];

  return (
    <div className="admin-dashboard-root-viewport">
      {/* Header Panel */}
      <div className="dashboard-identity-panel">
        <div className="identity-meta-stack">
          <h1>Admin Dashboard</h1>
          <p>
            Overview of campus complaints, student registry, and staff
            performance
          </p>
        </div>
        <button
          type="button"
          className="dashboard-sync-trigger-btn"
          onClick={() => loadDashboard(true)}
          disabled={syncing}
        >
          <RefreshCcw
            size={14}
            className={syncing ? "dashboard-spin-loader" : ""}
          />
          <span>{syncing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Grid of Stats Cards */}
      <div className="dashboard-telemetry-grid">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className={`telemetry-metric-node-card ${card.className}`}
          >
            <div className="metric-icon-bounding-shield">{card.icon}</div>
            <div className="metric-numerical-stack">
              <h2>{card.value.toLocaleString()}</h2>
              <p className="metric-label-string">{card.title}</p>
              <span className="metric-micro-desc">{card.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lower Analytics Section */}
      <div className="dashboard-split-composite-layout">
        {/* Performance & Efficiency */}
        <div className="composite-analysis-panel">
          <div className="composite-panel-header-row">
            <LayoutDashboard size={18} className="panel-accent-decor-icon" />
            <h3>Performance Metrics</h3>
          </div>

          <div className="efficiency-breakdown-container">
            <div className="efficiency-metric-row">
              <div className="efficiency-meta-strings">
                <span className="eff-title">Complaint Resolution Rate</span>
                <span className="eff-desc">
                  Percentage of resolved complaints out of all received
                </span>
              </div>
              <div className="efficiency-badge-wrapper">
                <span
                  className={`eff-percentage-pill ${resolutionRate > 75 ? "stable" : resolutionRate > 40 ? "warning" : "critical"}`}
                >
                  {resolutionRate}%
                </span>
              </div>
            </div>

            <div className="systemic-progress-track-wrapper">
              <div
                className={`systemic-progress-bar-fill ${resolutionRate > 75 ? "fill-stable" : resolutionRate > 40 ? "fill-warning" : "fill-critical"}`}
                style={{ width: `${resolutionRate}%` }}
              ></div>
            </div>

            <div className="efficiency-informational-grid">
              <div className="info-node">
                <span className="info-node-label">Total System Users</span>
                <strong className="info-node-value">
                  {(dashboard.students + dashboard.staff).toLocaleString()}
                </strong>
              </div>
              <div className="info-node">
                <span className="info-node-label">
                  Students per Staff Member
                </span>
                <strong className="info-node-value">
                  {dashboard.staff > 0
                    ? `~${Math.round(dashboard.students / dashboard.staff)}`
                    : "N/A"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* System Activity Log */}
        <div className="composite-analysis-panel">
          <div className="composite-panel-header-row">
            <ShieldAlert size={18} className="panel-accent-decor-icon" />
            <h3>System Status Logs</h3>
          </div>

          <div className="composite-empty-intercept-viewport">
            <div className="intercept-alignment-shield">
              <ClipboardList size={38} className="intercept-icon-decor" />
              <h4>No Activity Warnings</h4>
              <p>
                The system is running smoothly. No warnings or errors require
                your attention right now.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
