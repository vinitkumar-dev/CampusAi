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

import Loader from "../../../components/common/Loader/Loader";
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

  /* =========================================================
     LOAD COMPLAINTS
  ========================================================= */

  const loadComplaints = useCallback(async (isManualSync = false) => {
    try {
      if (isManualSync) {
        setSyncing(true);
      } else {
        setLoading(true);
      }

      const data = await getAdminComplaints();

      const list = data?.data || data || [];

      setComplaints(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  /* =========================================================
     LOAD STAFF
  ========================================================= */

  const loadStaff = async () => {
    try {
      const response = await getAdminStaff();

      const list = response?.data || response || [];

      setStaffList(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load staff:", error);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadComplaints();
    loadStaff();
  }, [loadComplaints]);

  /* =========================================================
     FILTER COMPLAINTS
  ========================================================= */

  useEffect(() => {
    let list = [...complaints];

    if (search.trim()) {
      const query = search.toLowerCase();

      list = list.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query),
      );
    }

    if (status) {
      list = list.filter((item) => item.status === status);
    }

    setFiltered(list);
  }, [search, status, complaints]);

  /* =========================================================
     DELETE COMPLAINT
  ========================================================= */

  const handleDelete = async (id) => {
    if (actionId !== null) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this complaint?",
    );

    if (!confirmDelete) return;

    try {
      setActionId(id);

      await deleteComplaint(id);

      await loadComplaints(true);
    } catch (err) {
      console.error("Failed to delete complaint:", err);

      alert("Failed to delete complaint.");
    } finally {
      setActionId(null);
    }
  };

  /* =========================================================
     ASSIGN COMPLAINT
  ========================================================= */

  const handleAssign = async () => {
    if (!selectedStaff || !selectedComplaint) return;

    try {
      setActionId(selectedComplaint);

      await assignComplaintToStaff(
        selectedComplaint,
        Number(selectedStaff),
      );

      setShowAssignModal(false);
      setSelectedStaff("");
      setSelectedComplaint(null);

      await loadComplaints(true);
    } catch (error) {
      console.error("Failed to assign complaint:", error);

      alert("Failed to assign complaint.");
    } finally {
      setActionId(null);
    }
  };

  /* =========================================================
     STAFF RECOMMENDATION
  ========================================================= */

  const getRecommendation = (complaintCategory, staff) => {
    if (!complaintCategory || !staff) return false;

    const categoryLower = complaintCategory.toLowerCase();

    const departmentLower =
      staff.department?.toLowerCase() || "";

    const nameLower =
      staff.name?.toLowerCase() || "";

    return (
      departmentLower.includes(categoryLower) ||
      categoryLower.includes(departmentLower) ||
      nameLower.includes(categoryLower)
    );
  };

  /* =========================================================
     OPEN ASSIGN MODAL
  ========================================================= */

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint.id);
    setShowAssignModal(true);

    const recommendedStaff = staffList.find((staff) =>
      getRecommendation(complaint.category, staff),
    );

    if (recommendedStaff) {
      setSelectedStaff(String(recommendedStaff.id));
    } else {
      setSelectedStaff("");
    }
  };

  /* =========================================================
     CLOSE ASSIGN MODAL
  ========================================================= */

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedStaff("");
    setSelectedComplaint(null);
  };

  /* =========================================================
     ACTIVE COMPLAINT
  ========================================================= */

  const activeComplaintObj = complaints.find(
    (complaint) => complaint.id === selectedComplaint,
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return <Loader text="Loading complaints..." />;
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="admin-complaints-ledger-viewport">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="ledger-header-panel">
        <div className="panel-identity">
          <h1>Complaints</h1>

          <p>
            Manage and assign campus complaints
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
            className={
              syncing ? "complaints-sync-spinner" : ""
            }
          />

          <span>
            {syncing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="ledger-filter-control-card">

        <div className="search-input-field-box">
          <Search
            size={16}
            className="search-decor-icon"
          />

          <input
            type="text"
            placeholder="Search complaints..."
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
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">
              In Progress
            </option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

      </div>

      {/* =====================================================
          COMPLAINT TABLE
      ===================================================== */}

      <div className="ledger-table-structural-card">

        {filtered.length === 0 ? (
          <div className="ledger-empty-records-box">

            <Inbox
              size={44}
              className="empty-decor-icon"
            />

            <h4>No Complaints Found</h4>

            <p>
              Try changing your search or status filter.
            </p>

          </div>
        ) : (
          <div className="table-overflow-containment-scroller">

            <table className="ledger-native-table">

              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Category</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Assigned Staff</th>
                  <th className="column-centered-header">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {filtered.map((item) => {

                  const isRowLocked =
                    actionId === item.id;

                  const isAssigned =
                    !!item.assigned_to;

                  const operatorDisplayName =
                    isAssigned
                      ? typeof item.assigned_to ===
                        "object"
                        ? item.assigned_to.name ||
                          `Staff #${item.assigned_to.id}`
                        : `Staff #${item.assigned_to}`
                      : "Not Assigned";

                  return (
                    <tr
                      key={item.id}
                      className={
                        isRowLocked
                          ? "ledger-row-mutating-lock"
                          : ""
                      }
                    >

                      {/* Complaint */}

                      <td className="column-payload-title">
                        <span className="title-text-string">
                          {item.title}
                        </span>
                      </td>

                      {/* Category */}

                      <td>
                        <span className="category-meta-string">
                          {item.category ||
                            "Unclassified"}
                        </span>
                      </td>

                      {/* Urgency */}

                      <td>
                        <span
                          className={`urgency-badge urgency-${
                            item.urgency?.toLowerCase() ||
                            "medium"
                          }`}
                        >
                          {item.urgency || "Normal"}
                        </span>
                      </td>

                      {/* Status */}

                      <td>
                        <span
                          className={`status-pill status-${
                            item.status
                              ?.toLowerCase()
                              .replace(/\s+/g, "-") ||
                            "open"
                          }`}
                        >
                          {item.status || "Open"}
                        </span>
                      </td>

                      {/* Assigned Staff */}

                      <td>
                        <span
                          className={`operator-field-text ${
                            isAssigned
                              ? "bound"
                              : "unallocated"
                          }`}
                        >
                          {operatorDisplayName}
                        </span>
                      </td>

                      {/* Actions */}

                      <td>

                        <div className="action-buttons-flex-row">

                          {/* View */}

                          <button
                            type="button"
                            className="operational-action-btn view-btn"
                            data-tooltip="View Complaint"
                            onClick={() =>
                              navigate(
                                `/admin/complaints/${item.id}`,
                              )
                            }
                            disabled={actionId !== null}
                          >
                            <FileText size={16} />
                          </button>

                          {/* Assign */}

                          <button
                            type="button"
                            className="operational-action-btn assign-btn"
                            data-tooltip="Assign Complaint"
                            onClick={() =>
                              openAssignModal(item)
                            }
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

                          {/* Delete */}

                          <button
                            type="button"
                            className="operational-action-btn delete-btn"
                            data-tooltip="Delete Complaint"
                            onClick={() =>
                              handleDelete(item.id)
                            }
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

        {/* =====================================================
            ASSIGN STAFF MODAL
        ===================================================== */}

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
                  Category:{" "}
                  <strong>
                    {activeComplaintObj.category}
                  </strong>
                </p>
              )}

              <select
                value={selectedStaff}
                onChange={(e) =>
                  setSelectedStaff(e.target.value)
                }
              >
                <option value="">
                  Select Staff
                </option>

                {staffList.map((staff) => {

                  const isRecommended =
                    getRecommendation(
                      activeComplaintObj?.category,
                      staff,
                    );

                  return (
                    <option
                      key={staff.id}
                      value={staff.id}
                    >
                      {staff.name}

                      {staff.department
                        ? ` - ${staff.department}`
                        : ""}

                      {isRecommended
                        ? " (Recommended)"
                        : ""}
                    </option>
                  );
                })}

              </select>

              <div className="modal-actions-wrapper">

                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={closeAssignModal}
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
