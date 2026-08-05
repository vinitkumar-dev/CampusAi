import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCcw,
  Plus,
  FileSearch,
  LoaderCircle,
} from "lucide-react";

import ComplaintTable from "../../../components/complaint/ComplaintTable/ComplaintTable";
import {
  getMyComplaints,
  deleteComplaint,
} from "../../../services/complaintService";

import "./MyComplaints.css";

function MyComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = await getMyComplaints();
        if (isMounted) {
          setComplaints(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load component resources:", err);
        if (isMounted) setComplaints([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComplaints();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await getMyComplaints();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Sync sync connection aborted:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...complaints];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      result = result.filter((item) =>
        `${item.title || ""} ${item.description || ""}`
          .toLowerCase()
          .includes(keyword),
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (item) =>
          (item.status || "").toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    return result;
  }, [complaints, search, statusFilter]);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently drop this log record?",
      )
    )
      return;

    try {
      await deleteComplaint(id);
      setComplaints((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Entity mutation lifecycle validation exception:", err);
      alert("Unable to delete complaint registry record.");
    }
  };

  if (loading) {
    return (
      <div className="page-loading" role="status">
        <LoaderCircle className="spin" size={38} />
        <h2>Syncing Complaint Records...</h2>
      </div>
    );
  }

  return (
    <div className="my-complaints-layout">
      {/* Dynamic Header Section */}
      <div className="page-header">
        <div className="header-identity">
          <h1>My Complaints</h1>
          <p className="ticket-counter">
            <strong>{filtered.length}</strong> ticket
            {filtered.length !== 1 && "s"} found matching view criteria
          </p>
        </div>

        <button
          type="button"
          className="new-btn"
          onClick={() => navigate("/student/create")}
        >
          <Plus size={16} />
          <span>New Complaint</span>
        </button>
      </div>

      {/* Grid Filter Operations Tool Bar Component */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="search"
            placeholder="Search matching items via context tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          <div className="select-wrapper">
            <select
              value={statusFilter}
              className="filter-select"
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter records via status attribute"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <button
            type="button"
            className={`refresh-btn ${isRefreshing ? "sync-spinning" : ""}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw size={14} />
            <span>{isRefreshing ? "Syncing..." : "Sync List"}</span>
          </button>
        </div>
      </div>

      {/* Main Structural View Presentation Router Break */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-frame">
            <FileSearch size={32} />
          </div>
          <h2>No Matching Records Found</h2>
          <p>
            We couldn't track logs corresponding to these parameters. Clear
            active queries or start a fresh claim report.
          </p>
        </div>
      ) : (
        <div className="table-responsive-container">
          <ComplaintTable
            complaints={filtered}
            onView={(id) => navigate(`/student/complaint/${id}`)}
            onEdit={(id) => navigate(`/student/complaint/edit/${id}`)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}

export default MyComplaints;
