import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  Trash2,
  UserPlus,
  RefreshCw,
  Loader2,
  Inbox,
} from "lucide-react";

import {
  getAdminComplaints,
  assignComplaintToStaff,
  deleteComplaint,
  getAdminStaff,
} from "../../../services/adminService";

import "./AdminComplaints.css";

function AdminComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [staffList, setStaffList] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");

  // Wrapped in useCallback to safely use as a dependency and avoid recreation
  const loadComplaints = useCallback(async (isManualSync = false) => {
    try {
      if (isManualSync) setSyncing(true);
      else setLoading(true);

      const data = await getAdminComplaints();
      const list = data?.data || data || [];
      setComplaints(list);
    } catch (err) {
      console.error("Failed loading complaints ledger index:", err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // Combined effect to handle initial mounting cleanly
  useEffect(() => {
    loadComplaints();

    const loadStaff = async () => {
      try {
        const response = await getAdminStaff();
        const list = response?.data || response || [];
        setStaffList(list);
      } catch (error) {
        console.error("Staff loading failed", error);
      }
    };

    loadStaff();
  }, [loadComplaints]);

  // Filtering Logic
  useEffect(() => {
    const filterComplaints = () => {
      let list = [...complaints];

      if (search.trim()) {
        const query = search.toLowerCase();
        list = list.filter(
          (item) =>
            item.title?.toLowerCase().includes(query) ||
            item.category?.toLowerCase().includes(query),
        );
      }

      if (status) {
        list = list.filter((item) => item.status === status);
      }

      setFiltered(list);
    };

    filterComplaints();
  }, [search, status, complaints]);

  const handleDelete = async (id) => {
    if (actionId) return;
    const confirmPurge = window.confirm(
      "Are you sure you want to permanently delete this complaint ledger node? This action is irreversible.",
    );
    if (!confirmPurge) return;

    try {
      setActionId(id);
      await deleteComplaint(id);
      await loadComplaints(true);
    } catch (err) {
      console.error("Database deletion pipeline error:", err);
      alert("Error dropping target complaint index line.");
    } finally {
      setActionId(null);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff || !selectedComplaint) return;

    try {
      setActionId(selectedComplaint);

      await assignComplaintToStaff(selectedComplaint, Number(selectedStaff));

      setShowAssignModal(false);
      setSelectedStaff("");
      setSelectedComplaint(null);

      await loadComplaints(true);
    } catch (error) {
      console.error("Assignment failed", error);
      alert("Failed to assign complaint");
    } finally {
      setActionId(null);
    }
  };

  /**
   * Helper: Find recommended staff based on the complaint's classification (category).
   * It checks if the category matches the staff member's department, name, or role.
   */
  const getRecommendation = (complaintCategory, staff) => {
    if (!complaintCategory || !staff) return false;

    const categoryLower = complaintCategory.toLowerCase();
    const departmentLower = staff.department?.toLowerCase() || "";
    const nameLower = staff.name?.toLowerCase() || "";

    // Exact matches or substring matches (e.g., "IT" in "IT Support", "Hostel" in "Hostel Warden")
    return (
      departmentLower.includes(categoryLower) ||
      categoryLower.includes(departmentLower) ||
      nameLower.includes(categoryLower)
    );
  };

  // When opening the modal, find the complaint object and try to pre-select matching staff
  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint.id);
    setShowAssignModal(true);

    // Look for any staff member matching this complaint's category/classification
    const recommendedStaff = staffList.find((staff) =>
      getRecommendation(complaint.category, staff),
    );

    if (recommendedStaff) {
      setSelectedStaff(recommendedStaff.id);
    } else {
      setSelectedStaff(""); // No match, reset to default select placeholder
    }
  };

  // Retrieve category text for the modal label if a complaint is active
  const activeComplaintObj = complaints.find((c) => c.id === selectedComplaint);

  if (loading) {
    return (
      <div className="complaints-loading-viewport">
        <Loader2 size={36} className="complaints-sync-spinner" />
        <h3>Resolving campus ticket matrices...</h3>
      </div>
    );
  }

  return (
    <div className="admin-complaints-ledger-viewport">
      {/* Upper Registry Heading Panel Block */}
      <div className="ledger-header-panel">
        <div className="panel-identity">
          <h1>Operations Ledger</h1>
          <p>
            Triage, routing allocation, and structural system audits for active
            campus tickets
          </p>
        </div>

        <button
          type="button"
          className="ledger-refresh-btn"
          onClick={() => loadComplaints(true)}
          disabled={syncing || actionId !== null}
        >
          <RefreshCw
            size={14}
            className={syncing ? "complaints-sync-spinner" : ""}
          />
          <span>{syncing ? "Syncing Grid..." : "Synchronize System"}</span>
        </button>
      </div>

      {/* Control Configuration Filtering Matrix Row Card */}
      <div className="ledger-filter-control-card">
        <div className="search-input-field-box">
          <Search size={16} className="search-decor-icon" />
          <input
            type="text"
            placeholder="Search matching titles or classification fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={syncing}
          />
        </div>

        <div className="select-dropdown-wrapper">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={syncing}
          >
            <option value="">All Lifecycle Nodes</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Structured Ledger Data Layout Sheet Frame */}
      <div className="ledger-table-structural-card">
        {filtered.length === 0 ? (
          <div className="ledger-empty-records-box">
            <Inbox size={44} className="empty-decor-icon" />
            <h4>No Compliant Records Resolved</h4>
            <p>
              Adjust current telemetry filter matrices or sync structural data
              array streams.
            </p>
          </div>
        ) : (
          <div className="table-overflow-containment-scroller">
            <table className="ledger-native-table">
              <thead>
                <tr>
                  <th>Grievance Statement / Title</th>
                  <th>Classification</th>
                  <th>Urgency Scale</th>
                  <th>Workflow Node</th>
                  <th>Allocated Operator</th>
                  <th className="column-centered-header">System Operations</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isRowLocked = actionId === item.id;

                  const isAssigned = !!item.assigned_to;
                  const operatorDisplayName = isAssigned
                    ? typeof item.assigned_to === "object"
                      ? item.assigned_to.name ||
                        `Operator #${item.assigned_to.id}`
                      : `Operator #${item.assigned_to}`
                    : "Unallocated";

                  return (
                    <tr
                      key={item.id}
                      className={isRowLocked ? "ledger-row-mutating-lock" : ""}
                    >
                      <td className="column-payload-title">
                        <span className="title-text-string">{item.title}</span>
                      </td>
                      <td>
                        <span className="category-meta-string">
                          {item.category || "Unclassified"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`urgency-badge urgency-${item.urgency?.toLowerCase() || "medium"}`}
                        >
                          {item.urgency || "Normal"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill status-${item.status?.toLowerCase().replace(/\s+/g, "-") || "open"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`operator-field-text ${isAssigned ? "bound" : "unallocated"}`}
                        >
                          {operatorDisplayName}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-flex-row">
                          {/* View Complaint Details */}
                          <button
                            type="button"
                            className="operational-action-btn view-btn"
                            data-tooltip="View Complaint Details"
                            onClick={() =>
                              navigate(`/admin/complaints/${item.id}`)
                            }
                            disabled={actionId !== null}
                          >
                            <FileText size={16} />
                          </button>

                          {/* Assign Complaint */}
                          <button
                            type="button"
                            className="operational-action-btn assign-btn"
                            data-tooltip="Assign Complaint To Staff"
                            onClick={() => openAssignModal(item)}
                            disabled={actionId !== null}
                          >
                            {isRowLocked ? (
                              <Loader2
                                size={15}
                                className="complaints-sync-spinner"
                              />
                            ) : (
                              <UserPlus size={16} />
                            )}
                          </button>

                          {/* Delete Complaint */}
                          <button
                            type="button"
                            className="operational-action-btn delete-btn"
                            data-tooltip="Delete Complaint"
                            onClick={() => handleDelete(item.id)}
                            disabled={actionId !== null}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showAssignModal && (
          <div className="assign-modal-overlay">
            <div className="assign-modal">
              <h3>Assign Complaint</h3>
              {activeComplaintObj?.category && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginTop: "-10px",
                    marginBottom: "15px",
                  }}
                >
                  Classification: <strong>{activeComplaintObj.category}</strong>
                </p>
              )}

              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
              >
                <option value="">Select Staff</option>

                {staffList.map((staff) => {
                  const isRecommended = getRecommendation(
                    activeComplaintObj?.category,
                    staff,
                  );
                  return (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}{" "}
                      {staff.department ? `- ${staff.department}` : ""}
                      {isRecommended ? " ⭐ (Recommended Match)" : ""}
                    </option>
                  );
                })}
              </select>

              <div className="modal-actions-wrapper">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStaff("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="modal-submit-btn"
                  onClick={handleAssign}
                  disabled={!selectedStaff}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminComplaints;
