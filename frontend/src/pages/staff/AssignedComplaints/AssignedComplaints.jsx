import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Search, Eye, Loader2, AlertCircle } from "lucide-react";

import { getAssignedComplaints } from "../../../services/staffService";

import "./AssignedComplaints.css";

function AssignedComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added for robust error tracking

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAssignedComplaints();
      const data = response.data || response;

      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      setError("Unable to load complaints. Please try again later.");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to turn ISO strings into human-readable dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const filteredComplaints = useMemo(() => {
    const searchLower = search.toLowerCase().trim();

    return complaints.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const student = (item.student_name || "").toLowerCase();
      const status = item.status || "Pending";
      const priority = item.priority || "Normal";

      const matchesSearch =
        searchLower === "" ||
        title.includes(searchLower) ||
        student.includes(searchLower);

      const matchesStatus = statusFilter === "All" || status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [complaints, search, statusFilter, priorityFilter]);

  if (loading) {
    return (
      <div className="assigned-loading">
        <Loader2 className="spin" size={38} />
        <h2>Loading Complaints...</h2>
      </div>
    );
  }

  return (
    <div className="assigned-page">
      <div className="assigned-header">
        <div>
          <h1>Assigned Complaints</h1>
          <p>Manage complaints assigned to you.</p>
        </div>
      </div>

      {/* Error Alert Display */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadComplaints} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="filter-card">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search complaint or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      <div className="complaint-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Student</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">
                  {error ? "Could not retrieve data." : "No complaints found."}
                </td>
              </tr>
            ) : (
              filteredComplaints.map((item) => {
                const status = item.status || "Pending";
                const priority = item.priority || "Normal";

                return (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.title || "Untitled Complaint"}</td>
                    <td>{item.student_name || "N/A"}</td>
                    <td>
                      <span
                        className={`status ${status
                          .replace(/\s/g, "_")
                          .toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>
                      <span className={`priority ${priority.toLowerCase()}`}>
                        {priority}
                      </span>
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/staff/complaints/${item.id}`)}
                      >
                        <Eye size={17} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignedComplaints;
