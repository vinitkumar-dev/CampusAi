import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Loader2,
  Layers,
} from "lucide-react";

import { getStaffAnalytics } from "../../../services/staffService";
import "./StaffAnalytics.css";

function StaffAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    completed: 0,
    pending: 0,
    urgent: 0,
    categories: [],
  });

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getStaffAnalytics();

      setStats({
        totalAssigned: data?.totalAssigned ?? 0,
        completed: data?.completed ?? 0,
        pending: data?.pending ?? 0,
        urgent: data?.urgent ?? 0,
        categories: Array.isArray(data?.categories) ? data.categories : [],
      });
    } catch (err) {
      console.error("Analytics metrics resolution error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading-viewport">
        <Loader2 size={40} className="analytics-spin-loader" />
        <h3>Compiling processing telemetry...</h3>
      </div>
    );
  }

  // Calculate high mark dynamically to determine percentage distribution bars
  const maximumCategoryCount = Math.max(
    ...stats.categories.map((c) => c.count || 0),
    1,
  );

  return (
    <div className="staff-analytics-page-root-viewport">
      {/* Upper Framework Identity Header Panel */}
      <div className="analytics-header-panel">
        <div className="identity-meta-stack">
          <h1>
            <BarChart3 size={24} />
            <span>Performance Analytics</span>
          </h1>
          <p>
            Historical audit of resolved cases, processing metrics, and
            categoric volumes
          </p>
        </div>
      </div>

      {/* Grid Matrix of Counter Telemetry Cards */}
      <div className="analytics-metric-cards-grid">
        <div className="analytics-metric-node-card focus-intent-blue">
          <div className="metric-icon-wrapper">
            <ClipboardList size={22} />
          </div>
          <div className="metric-data-block">
            <h2>{stats.totalAssigned}</h2>
            <span>Total Assigned</span>
          </div>
        </div>

        <div className="analytics-metric-node-card focus-intent-success">
          <div className="metric-icon-wrapper">
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-data-block">
            <h2>{stats.completed}</h2>
            <span>Completed</span>
          </div>
        </div>

        <div className="analytics-metric-node-card focus-intent-warning">
          <div className="metric-icon-wrapper">
            <Clock3 size={22} />
          </div>
          <div className="metric-data-block">
            <h2>{stats.pending}</h2>
            <span>Pending Triage</span>
          </div>
        </div>

        <div className="analytics-metric-node-card focus-intent-danger">
          <div className="metric-icon-wrapper">
            <AlertTriangle size={22} />
          </div>
          <div className="metric-data-block">
            <h2>{stats.urgent}</h2>
            <span>Urgent Flags</span>
          </div>
        </div>
      </div>

      {/* Categoric Distribution Chart Layout Section */}
      <div className="category-distribution-panel-card">
        <h2>Volume Breakdown by Category Node</h2>
        <p className="panel-subheading-meta">
          Distribution split across organizational vectors
        </p>

        <div className="category-visualizer-list-stack">
          {stats.categories.length === 0 ? (
            <div className="analytics-empty-intercept-viewport">
              <Layers size={32} />
              <p>No historical categorization logs available for this node.</p>
            </div>
          ) : (
            stats.categories.map((item) => {
              const computationPercentage = Math.min(
                Math.round(((item.count || 0) / maximumCategoryCount) * 100),
                100,
              );

              return (
                <div key={item.category} className="category-data-row-item">
                  <div className="category-meta-labels-strip">
                    <span className="category-identity-string">
                      {item.category}
                    </span>
                    <strong className="category-raw-count-badge">
                      {item.count}
                    </strong>
                  </div>

                  {/* Custom CSS Native Bar Chart Component mapping visualization progress lines */}
                  <div className="category-bar-track-background">
                    <div
                      className="category-bar-progress-filler"
                      style={{ width: `${computationPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffAnalytics;
