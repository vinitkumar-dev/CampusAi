import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  UserPlus,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import {
  getAdminComplaintDetails,
  updateComplaint,
  assignComplaintToStaff,
  deleteComplaint,
} from "../../../services/adminService";

import "./AdminComplaintDetails.css";

function AdminComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [staffId, setStaffId] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadComplaint = async () => {
      try {
        setLoading(true);
        const data = await getAdminComplaintDetails(id);
        const item = data?.data || data;

        if (isMounted) {
          setComplaint(item);
          setStatus(item?.status || "Open");
          setStaffId(item?.assigned_to || "");
        }
      } catch (err) {
        console.error(
          "Error retrieving administrative task allocation details:",
          err,
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadComplaint();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const refreshComplaintData = async () => {
    try {
      const data = await getAdminComplaintDetails(id);
      const item = data?.data || data;
      setComplaint(item);
      setStatus(item?.status || "Open");
      setStaffId(item?.assigned_to || "");
    } catch (err) {
      console.error("Error refreshing task state:", err);
    }
  };

  const handleStatusUpdate = async () => {
    if (updatingStatus) return;
    try {
      setUpdatingStatus(true);
      await updateComplaint(id, { status });
      alert("Ticket lifecycle state updated successfully.");
      await refreshComplaintData();
    } catch (err) {
      console.error("Failure processing status state mutation:", err);
      alert("Failed to modify ticket status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssign = async () => {
    if (!staffId || assigningStaff) return;
    try {
      setAssigningStaff(true);
      await assignComplaintToStaff(id, Number(staffId));
      alert("Resource assignment successfully committed.");
      await refreshComplaintData();
    } catch (err) {
      console.error("Failure assigning staff resource parameter:", err);
      alert("Failed to assign ticket to the designated staff ID.");
    } finally {
      setAssigningStaff(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    const confirmDestruction = window.confirm(
      "Are you sure you want to permanently delete this complaint ticket record? This action cannot be undone.",
    );

    if (!confirmDestruction) return;

    try {
      setDeleting(true);
      await deleteComplaint(id);
      navigate("/admin/complaints");
    } catch (err) {
      console.error("Failure executing destructive deletion pipeline:", err);
      alert("Error destroying database log record.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-details-loading-state">
        <Loader2 size={36} className="admin-sync-spinner" />
        <h3>Retrieving secure audit ledger...</h3>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="admin-details-empty-state">
        <ShieldAlert size={48} className="error-shield-icon" />
        <h3>Ticket Context Resolution Error</h3>
        <p>
          The requested complaint matrix could not be resolved or does not
          exist.
        </p>
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Return to Grid
        </button>
      </div>
    );
  }

  return (
    <div className="admin-complaint-details-viewport">
      {/* Upper Navigation Action Bar */}
      <div className="admin-details-action-toolbar">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate(-1)}
          disabled={deleting}
        >
          <ArrowLeft size={16} />
          <span>Back to Ledger</span>
        </button>

        <button
          type="button"
          className="destructive-delete-btn"
          onClick={handleDelete}
          disabled={deleting || updatingStatus || assigningStaff}
        >
          {deleting ? (
            <Loader2 size={16} className="admin-sync-spinner" />
          ) : (
            <Trash2 size={16} />
          )}
          <span>{deleting ? "Purging Record..." : "Delete Ticket"}</span>
        </button>
      </div>

      <div className="admin-details-structural-grid">
        {/* Left Side Column: Core Ticket Payload Details */}
        <div className="details-data-main-card">
          <div className="card-identity-header">
            <span
              className={`urgency-badge urgency-${complaint.urgency?.toLowerCase() || "medium"}`}
            >
              {complaint.urgency || "Normal Priority"}
            </span>
            <h1>{complaint.title}</h1>
            <span className="unique-id-tag">Reference Hex: #{id}</span>
          </div>

          <div className="payload-description-block">
            <h4>Statement of Grievance</h4>
            <p>{complaint.description}</p>
          </div>

          <div className="metadata-parameter-matrix">
            <div className="matrix-item">
              <label>Classification Category</label>
              <span className="value-string">
                {complaint.category || "Unassigned"}
              </span>
            </div>

            <div className="matrix-item">
              <label>Current Status Node</label>
              <span
                className={`status-pill status-${complaint.status?.toLowerCase().replace(/\s+/g, "-") || "open"}`}
              >
                {complaint.status}
              </span>
            </div>

            <div className="matrix-item">
              <label>Originating Tenant (User)</label>
              <span className="value-string user-ident">
                {complaint.created_by || "Anonymous ID"}
              </span>
            </div>

            <div className="matrix-item">
              <label>Assigned Operator Field</label>
              <span className="value-string staff-ident">
                {complaint.assigned_to
                  ? `Staff Agent #${complaint.assigned_to}`
                  : "Unallocated Resource"}
              </span>
            </div>

            <div className="matrix-item">
              <label>Ingestion Timestamp</label>
              <span className="value-string date-metrics">
                {complaint.created_at
                  ? new Date(complaint.created_at).toLocaleString()
                  : "No timestamp available"}
              </span>
            </div>
          </div>

          {complaint.image_url && (
            <div className="evidence-attachment-container">
              <h4>System Image Telemetry Evidence</h4>
              <div className="image-frame">
                <img
                  src={complaint.image_url}
                  alt="Grievance context graphic evidence attachment"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side Column: Operations and Command Center */}
        <div className="operations-control-panel-card">
          <h3>Command & Dispatch Core</h3>
          <p className="panel-subtitle">
            Modify execution tracking states and assign resources.
          </p>

          {/* Module 1: Status Intercept Mutation */}
          <div className="control-module-section">
            <label htmlFor="control-status-select">Modify Workflow State</label>
            <div className="control-input-action-row">
              <div className="select-wrapper">
                <select
                  id="control-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={updatingStatus || deleting}
                >
                  <option value="Open">Open (Pending Triage)</option>
                  <option value="Assigned">Assigned (Dispatched)</option>
                  <option value="In Progress">In Progress (Active Work)</option>
                  <option value="Resolved">Resolved (Fix Applied)</option>
                  <option value="Closed">Closed (System Terminated)</option>
                </select>
              </div>

              <button
                type="button"
                className="action-commit-save-btn"
                onClick={handleStatusUpdate}
                disabled={updatingStatus || deleting}
              >
                {updatingStatus ? (
                  <Loader2 size={15} className="admin-sync-spinner" />
                ) : (
                  <Save size={15} />
                )}
                <span>Commit</span>
              </button>
            </div>
          </div>

          <hr className="panel-divider" />

          {/* Module 2: Resource Assignment Mutation */}
          <div className="control-module-section">
            <label htmlFor="control-staff-input">
              Dispatch Operator Assignment
            </label>
            <div className="control-input-action-row">
              <div className="input-numerical-wrapper">
                <input
                  id="control-staff-input"
                  type="number"
                  placeholder="Insert target Operator ID"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  disabled={assigningStaff || deleting}
                  min="1"
                />
              </div>

              <button
                type="button"
                className="action-commit-assign-btn"
                onClick={handleAssign}
                disabled={!staffId || assigningStaff || deleting}
              >
                {assigningStaff ? (
                  <Loader2 size={15} className="admin-sync-spinner" />
                ) : (
                  <UserPlus size={15} />
                )}
                <span>Assign</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminComplaintDetails;
