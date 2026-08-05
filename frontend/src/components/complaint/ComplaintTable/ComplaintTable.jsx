import { Eye, Pencil, Trash2, FileText } from "lucide-react";

import StatusBadge from "../StatusBadge/StatusBadge";

import "./ComplaintTable.css";

function ComplaintTable({
  complaints = [],
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  return (
    <div className="complaint-table-container">
      <table className="complaint-table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Complaint</th>
            <th scope="col">Category</th>
            <th scope="col">Urgency</th>
            <th scope="col">Status</th>
            <th scope="col">Date</th>
            <th scope="col" className="text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {complaints.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-row">
                <div className="empty-state">
                  <div className="empty-icon-wrapper">
                    <FileText size={32} />
                  </div>
                  <h3>No complaints found</h3>
                  <p>Complaints submitted by students will appear here.</p>
                </div>
              </td>
            </tr>
          ) : (
            complaints.map((complaint) => {
              const compId = complaint.id || complaint._id || Math.random();
              const urgencyClass = complaint.urgency
                ? complaint.urgency.toLowerCase()
                : "low";

              return (
                <tr key={compId}>
                  <td>
                    <span className="complaint-id">#{compId}</span>
                  </td>

                  <td>
                    <div className="complaint-title">
                      <strong>{complaint.title}</strong>
                      <span>
                        {complaint.description
                          ? complaint.description.length > 45
                            ? complaint.description.substring(0, 45) + "..."
                            : complaint.description
                          : "No description"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="category-badge">
                      {complaint.category || "General"}
                    </span>
                  </td>

                  <td>
                    <span className={`urgency-badge ${urgencyClass}`}>
                      {complaint.urgency || "Low"}
                    </span>
                  </td>

                  <td>
                    <StatusBadge status={complaint.status} />
                  </td>

                  <td>
                    <span className="table-date">
                      {complaint.created_at
                        ? new Date(complaint.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "-"}
                    </span>
                  </td>

                  <td>
                    <div className="action-group">
                      <button
                        type="button"
                        className="table-btn view"
                        onClick={() => onView(compId)}
                        title="View Details"
                        aria-label={`View complaint #${compId}`}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        className="table-btn edit"
                        onClick={() => onEdit(compId)}
                        title="Edit Complaint"
                        aria-label={`Edit complaint #${compId}`}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="table-btn delete"
                        onClick={() => onDelete(compId)}
                        title="Delete Complaint"
                        aria-label={`Delete complaint #${compId}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ComplaintTable;
