import { useEffect, useState, useCallback } from "react";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  Loader2,
  BarChart3,
  Percent,
} from "lucide-react";

import { getAdminAnalytics } from "../../../services/adminService";
import "./AdminAnalytics.css";

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalComplaints: 0,
    openComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    criticalComplaints: 0,
    categories: [],
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadAnalytics = useCallback(async (manual = false) => {
    try {
      if (manual) {
        setSyncing(true);
      } else {
        setLoading(true);
      }

      // Calls the Promise.all aggregated workflow inside adminService.js
      const response = await getAdminAnalytics();

      // Extracts the transformed combined object data envelope block safely
      const container = response?.data || {};
      const rawSummary = container.summary || {};
      const rawCategories = container.category || [];

      // Destructure telemetry key indicators from your live API signature
      const totalComplaints = Number(rawSummary.totalComplaints) || 0;
      const openComplaints = Number(rawSummary.openComplaints) || 0;
      const inProgressComplaints = Number(rawSummary.inProgressComplaints) || 0;
      const resolvedComplaints = Number(rawSummary.resolvedComplaints) || 0;

      const categoryList = Array.isArray(rawCategories) ? rawCategories : [];

      // Extract specific high-risk system isolation indicators via field item.category
      const criticalComplaints = categoryList
        .filter((item) =>
          ["Security", "Medical", "Electricity"].includes(item?.category),
        )
        .reduce((sum, item) => sum + Number(item?.count || 0), 0);

      setAnalytics({
        totalComplaints,
        openComplaints,
        inProgressComplaints,
        resolvedComplaints,
        criticalComplaints,
        categories: categoryList.map((item, index) => ({
          id: item.id || `${item.category || "category"}-${index}`,
          name: item.category || "Unknown Division",
          count: Number(item.count || 0),
        })),
      });
    } catch (error) {
      console.error(
        "Admin analytics processing telemetry stream error:",
        error,
      );
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="analytics-loading-viewport">
        <Loader2 size={40} className="analytics-spin-loader" />
        <h3>Loading analytics...</h3>
      </div>
    );
  }

  const cards = [
    {
      id: "total",
      title: "Total Complaints",
      value: analytics.totalComplaints,
      icon: <ClipboardList size={22} />,
      className: "metric-blue",
    },
    {
      id: "open",
      title: "Pending Complaints",
      value: analytics.openComplaints,
      icon: <Clock3 size={22} />,
      className: "metric-orange",
    },
    {
      id: "inprogress",
      title: "In Progress",
      value: analytics.inProgressComplaints,
      icon: <RefreshCcw size={22} />,
      className: "metric-purple",
    },
    {
      id: "resolved",
      title: "Resolved",
      value: analytics.resolvedComplaints,
      icon: <CheckCircle2 size={22} />,
      className: "metric-green",
    },
    {
      id: "critical",
      title: "Critical Issues",
      value: analytics.criticalComplaints,
      icon: <AlertTriangle size={22} />,
      className: "metric-red",
    },
  ];

  const resolvedRate = analytics.totalComplaints
    ? Math.round(
        (analytics.resolvedComplaints / analytics.totalComplaints) * 100,
      )
    : 0;

  return (
    <div className="admin-analytics-container">
      <div className="analytics-dashboard-header">
        <div className="header-identity">
          <h1>Analytics Engine</h1>
          <p>Real-time campus complaint monitoring system</p>
        </div>

        <button
          type="button"
          className="telemetry-sync-btn"
          disabled={syncing}
          onClick={() => loadAnalytics(true)}
        >
          <RefreshCcw
            size={14}
            className={syncing ? "analytics-spin-loader" : ""}
          />
          <span>{syncing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      <div className="analytics-cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`analytics-metric-card ${card.className}`}
          >
            <div className="metric-icon-shield">{card.icon}</div>
            <div className="metric-content-stack">
              <h2>{Number(card.value).toLocaleString()}</h2>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-dual-panel-layout">
        <div className="analysis-data-card">
          <div className="panel-header-row">
            <BarChart3 size={18} />
            <h3>Category Distribution</h3>
          </div>

          <div className="summary-list-stack">
            {analytics.categories.length === 0 ? (
              <p className="empty-panel-placeholder">No complaints available</p>
            ) : (
              analytics.categories.map((item) => {
                const percentage = analytics.totalComplaints
                  ? Math.round((item.count / analytics.totalComplaints) * 100)
                  : 0;
                return (
                  <div key={item.id} className="summary-list-row">
                    <div className="row-label-group">
                      <span className="item-title-string">{item.name}</span>
                      <span className="item-ratio-pill">{percentage}%</span>
                    </div>

                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <strong>{item.count.toLocaleString()}</strong>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="analysis-data-card">
          <div className="panel-header-row">
            <Percent size={18} />
            <h3>System Health</h3>
          </div>

          <div className="summary-list-stack">
            <div className="summary-list-row">
              <span>Total Complaints</span>
              <strong>{analytics.totalComplaints}</strong>
            </div>

            <div className="summary-list-row">
              <span>Resolution Rate</span>
              <strong>{resolvedRate}%</strong>
            </div>

            <div className="summary-list-row">
              <span>Active Backlog</span>
              <strong>
                {analytics.openComplaints + analytics.inProgressComplaints}
              </strong>
            </div>

            <div className="summary-list-row">
              <span>High Risk Complaints</span>
              <strong>{analytics.criticalComplaints}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
