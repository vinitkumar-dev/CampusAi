import { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  Bell,
  Activity,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Layers,
} from "lucide-react";

import { getStaffDashboard } from "../../../services/staffService";
import "./StaffDashboard.css";

function StaffDashboard() {
  const defaultDashboard = {
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    unread_notifications: 0,
    recent: [],
  };

  const [dashboard, setDashboard] = useState(defaultDashboard);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await getStaffDashboard();
      // Handle response.data nesting safely
      const data = response?.data || response || {};

      setDashboard({
        total: Number(data.total) || 0,
        pending: Number(data.pending) || 0,
        in_progress: Number(data.in_progress) || 0,
        resolved: Number(data.resolved) || 0,
        unread_notifications: Number(data.unread_notifications) || 0,
        recent: data.recent || [],
      });
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = [
    {
      title: "Total Assigned",
      value: dashboard.total,
      icon: <ClipboardList size={22} />,
      color: "blue",
    },
    {
      title: "Pending Action",
      value: dashboard.pending,
      icon: <Clock3 size={22} />,
      color: "orange",
    },
    {
      title: "In Progress",
      value: dashboard.in_progress,
      icon: <Activity size={22} />,
      color: "purple",
    },
    {
      title: "Resolved Cases",
      value: dashboard.resolved,
      icon: <CheckCircle2 size={22} />,
      color: "green",
    },
    {
      title: "Unread Notifications",
      value: dashboard.unread_notifications,
      icon: <Bell size={22} />,
      color: "red",
    },
  ];

  if (loading) {
    return (
      <div className="staff-loading-viewport">
        <Loader2 size={40} className="staff-spin-loader" />
        <h3>Loading your dashboard...</h3>
      </div>
    );
  }

  return (
    <div className="staff-dashboard-root-viewport">
      {/* Header Panel */}
      <div className="dashboard-header-panel">
        <div className="identity-meta-stack">
          <h1>Staff Dashboard</h1>
          <p>
            Track assigned student complaints, manage unresolved tickets, and
            update progress.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh-trigger-btn"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={14}
            className={refreshing ? "staff-spin-loader" : ""}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh Dashboard"}</span>
        </button>
      </div>

      {/* Stats Counters Grid */}
      <div className="stats-telemetry-grid">
        {cards.map((card) => (
          <div
            key={card.title}
            className={`stat-metric-card color-intent-${card.color}`}
          >
            <div className="metric-icon-shield">{card.icon}</div>
            <div className="metric-data-stack">
              <h2>{card.value}</h2>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="dashboard-composite-split-matrix">
        {/* Recent Complaints Table */}
        <div className="recent-tickets-section-card">
          <div className="section-header-title-row">
            <h2>Recently Assigned Complaints</h2>
          </div>

          <div className="table-responsive-containment-shield">
            <table className="telemetry-data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Complaint Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Urgency</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty-fallback-cell">
                      <div className="table-empty-view-stack">
                        <Layers size={32} />
                        <p>No complaints assigned to you yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dashboard.recent.map((item) => (
                    <tr key={item.id}>
                      <td className="font-variant-mono">#{item.id}</td>
                      <td>
                        <div
                          className="table-text-truncate-cell"
                          title={item.title}
                        >
                          {item.title || "No Title"}
                        </div>
                      </td>
                      <td>
                        <span className="category-neutral-tag">
                          {item.category || "General"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge-status-pill status-${(
                            item.status || "Pending"
                          )
                            .replace(/\s/g, "_")
                            .toLowerCase()}`}
                        >
                          {item.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge-priority-pill priority-${(
                            item.urgency || "Medium"
                          ).toLowerCase()}`}
                        >
                          {item.urgency || "Medium"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Breakdown Overview */}
        <div className="progress-insights-sidebar-card">
          <h2>Queue Status Overview</h2>
          <p className="insights-subtext-meta">
            A quick visual check of your assigned workload.
          </p>

          <div className="progress-indicators-list-stack">
            <div className="progress-indicator-item accent-intent-orange">
              <div className="indicator-label-meta">
                <span className="indicator-bullet"></span>
                <span>Pending Action</span>
              </div>
              <strong className="indicator-value-string">
                {dashboard.pending}
              </strong>
            </div>

            <div className="progress-indicator-item accent-intent-purple">
              <div className="indicator-label-meta">
                <span className="indicator-bullet"></span>
                <span>In Progress</span>
              </div>
              <strong className="indicator-value-string">
                {dashboard.in_progress}
              </strong>
            </div>

            <div className="progress-indicator-item accent-intent-green">
              <div className="indicator-label-meta">
                <span className="indicator-bullet"></span>
                <span>Successfully Resolved</span>
              </div>
              <strong className="indicator-value-string">
                {dashboard.resolved}
              </strong>
            </div>
          </div>

          <div className="progress-motivational-footer-strip">
            <ArrowUpRight size={16} />
            <p>
              Keep resolving tickets to maintain a high level of campus
              satisfaction!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
