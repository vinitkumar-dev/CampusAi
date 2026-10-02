import "./StatusBadge.css";

function StatusBadge({ status }) {
  // Normalize key variants (e.g. lowercase configurations from databases)
  const normalizedStatus = status ? status.trim() : "Open";

  const config = {
    Open: { className: "open", label: "Open" },
    Assigned: { className: "assigned", label: "Assigned" },
    "In Progress": { className: "progress", label: "In Progress" },
    in_progress: { className: "progress", label: "In Progress" },
    Resolved: { className: "resolved", label: "Resolved" },
    Closed: { className: "closed", label: "Closed" },
  };

  const activeConfig = config[normalizedStatus] || {
    className: "open",
    label: normalizedStatus,
  };

  return (
    <span className={`status-badge ${activeConfig.className}`}>
      <span className="badge-dot" aria-hidden="true" />
      <span className="badge-text">{activeConfig.label}</span>
    </span>
  );
}

export default StatusBadge;
