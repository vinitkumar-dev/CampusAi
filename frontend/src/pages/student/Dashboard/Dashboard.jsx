import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  RefreshCcw,
  Clock3,
} from "lucide-react";

import StatCard from "../../../components/common/StatCard/StatCard";
import { getStudentDashboard } from "../../../services/studentService";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getStudentDashboard();
        if (isMounted) {
          setDashboard(data || {});
        }
      } catch (err) {
        console.error("Dashboard mount error:", err);
        if (isMounted) setError("Unable to load dashboard configurations.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError("");
      const data = await getStudentDashboard();
      setDashboard(data || {});
    } catch (err) {
      console.error("Dashboard manual refresh error:", err);
      setError("Failed to sync current dashboard updates.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNewComplaint = () => {
    navigate("/student/create");
  };

  if (loading) {
    return (
      <div className="dashboard-loading" role="status">
        <div className="loader-ring"></div>
        <h2>Loading CampusAI Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error" role="alert">
        <div className="error-icon-box">
          <AlertTriangle size={36} />
        </div>
        <h2>System Sync Error</h2>
        <p>{error}</p>
        <button type="button" className="retry-btn" onClick={handleRefresh}>
          <RefreshCcw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const overview = dashboard?.overview || {};
  const activity = dashboard?.recentActivity || [];

  return (
    <div className="student-dashboard">
      {/* Premium Hero Banner */}
      <section className="welcome-banner">
        <div className="banner-text">
          <h1>
            Welcome back, <span>{dashboard?.name || "Student"} 👋</span>
          </h1>
          <p>
            Submit academic or facility complaints, monitor resolution states,
            and track automated routing insights.
          </p>
        </div>

        <button
          type="button"
          className="create-complaint-btn"
          onClick={handleNewComplaint}
        >
          <Plus size={18} />
          <span>New Complaint</span>
        </button>
      </section>

      {/* Analytics Counter Metrics Grid */}
      <section className="stats-grid" aria-label="Overview Statistics Matrix">
        <StatCard
          title="Open Complaints"
          value={overview.open ?? 0}
          icon={<ClipboardList size={22} />}
          color="#2563EB"
        />

        <StatCard
          title="Resolved"
          value={overview.resolved ?? 0}
          icon={<CheckCircle2 size={22} />}
          color="#22C55E"
        />

        <StatCard
          title="Critical"
          value={overview.critical ?? 0}
          icon={<AlertTriangle size={22} />}
          color="#EF4444"
          isPositive={false}
        />

        <StatCard
          title="Total Complaints"
          value={overview.total ?? 0}
          icon={<FileText size={22} />}
          color="#8B5CF6"
        />
      </section>

      {/* Real-time Activity Timeline Audit Log Component */}
      <section className="activity-card" aria-labelledby="activity-title">
        <div className="activity-header">
          <h2 id="activity-title">Recent Updates & Activity</h2>

          <button
            type="button"
            className={`refresh-action-btn ${isRefreshing ? "spinning" : ""}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw size={14} />
            <span>{isRefreshing ? "Syncing..." : "Refresh Status"}</span>
          </button>
        </div>

        {activity.length === 0 ? (
          <div className="empty-activity">
            <div className="empty-icon-box">
              <Clock3 size={32} />
            </div>
            <h3>Timeline is Empty</h3>
            <p>
              Updates on newly filed tickets or routing changes will populate
              live here.
            </p>
          </div>
        ) : (
          <div className="activity-stream">
            {activity.map((item, index) => (
              <div key={item.id || index} className="activity-item">
                <div className="activity-track-line">
                  <div className="activity-dot-marker" />
                </div>

                <div className="activity-content-block">
                  <p>{item.message}</p>
                  {item.time && (
                    <span className="activity-timestamp">
                      {new Date(item.time).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
