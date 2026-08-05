import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ClipboardList,
  Calendar,
  AlertTriangle,
  Tag,
  CheckCircle2,
  Clock,
  Loader2,
  Image as ImageIcon,
  Upload,
  User,
} from "lucide-react";

import {
  getComplaintDetails,
  updateComplaintStatus,
} from "../../../services/staffService";

import "./StaffComplaintDetails.css";

function StaffComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [resolvedImage, setResolvedImage] = useState(null);
  const [resolvedImagePreview, setResolvedImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await getComplaintDetails(id);
      const data = response?.data || response;

      setComplaint(data);
      setStatus(data.status || "Assigned");
      setRemarks(data.resolution_note || "");
    } catch (error) {
      console.error("Complaint loading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResolvedImage(file);
      setResolvedImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    if (
      status === "Resolved" &&
      !resolvedImage &&
      !complaint.resolved_image_url
    ) {
      alert("A resolution proof image is required to resolve this complaint.");
      return;
    }

    try {
      setUpdating(true);
      const formData = new FormData();
      formData.append("status", status);
      formData.append("resolution_note", remarks);

      if (resolvedImage) {
        formData.append("resolved_image", resolvedImage);
      }

      await updateComplaintStatus(id, formData);
      await fetchComplaint();

      setResolvedImage(null);
      setResolvedImagePreview("");
      alert("Complaint updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update complaint. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (resolvedImagePreview) {
        URL.revokeObjectURL(resolvedImagePreview);
      }
    };
  }, [resolvedImagePreview]);

  if (loading) {
    return (
      <div className="details-loading-viewport">
        <Loader2 size={40} className="details-spin-loader" />
        <h3>Loading complaint details...</h3>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="details-loading-viewport">
        <AlertTriangle size={40} className="error-icon" />
        <h3>Complaint not found</h3>
        <button
          className="back-btn"
          onClick={() => navigate("/staff/complaints")}
        >
          <ArrowLeft size={16} />
          Back to list
        </button>
      </div>
    );
  }

  const statusClass = (complaint.status || "assigned")
    .toLowerCase()
    .replace(/\s+/g, "-");

  const urgencyClass = (complaint.urgency || "normal").toLowerCase();

  return (
    <div className="staff-complaint-page-root-viewport">
      {/* Header Actions */}
      <div className="details-header-action-strip">
        <button
          className="back-btn"
          onClick={() => navigate("/staff/complaints")}
        >
          <ArrowLeft size={16} />
          Back to Complaints
        </button>

        <span className={`status-badge-node status-${statusClass}`}>
          {complaint.status}
        </span>
      </div>

      {/* Main Card */}
      <div className="complaint-profile-containment-card">
        <div className="complaint-title-block">
          <h1>{complaint.title}</h1>
          <p>{complaint.description}</p>
        </div>

        {/* Informational Grid */}
        <div className="details-informational-grid">
          <div className="detail-data-node-box">
            <ClipboardList size={20} />
            <div>
              <label>Complaint ID</label>
              <strong>#{complaint.id}</strong>
            </div>
          </div>

          <div className="detail-data-node-box">
            <User size={20} />
            <div>
              <label>Student</label>
              <strong>{complaint.student?.name || "Unknown"}</strong>
            </div>
          </div>

          <div className="detail-data-node-box">
            <Tag size={20} />
            <div>
              <label>Category</label>
              <strong>{complaint.category || "General"}</strong>
            </div>
          </div>

          <div className="detail-data-node-box">
            <AlertTriangle size={20} className={`urgency-icon-${urgencyClass}`} />
            <div>
              <label>Urgency</label>
              <strong className={`urgency-text-${urgencyClass}`}>
                {complaint.urgency || "Normal"}
              </strong>
            </div>
          </div>

          <div className="detail-data-node-box layout-span-2-cols">
            <Calendar size={20} />
            <div>
              <label>Created Date</label>
              <strong>
                {complaint.created_at
                  ? new Date(complaint.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "N/A"}
              </strong>
            </div>
          </div>
        </div>

        {/* Submitted Evidence Images */}
        {complaint.image_url && (
          <div className="complaint-graphical-evidence-viewport">
            <h3>
              <ImageIcon size={16} />
              <span>Attached Evidence</span>
            </h3>
            <div className="image-bounding-wrapper">
              <img src={complaint.image_url} alt="User submitted evidence" />
            </div>
          </div>
        )}

        {complaint.resolved_image_url && (
          <div className="complaint-graphical-evidence-viewport resolved-evidence">
            <h3>
              <CheckCircle2 size={16} className="resolved-check" />
              <span>Uploaded Resolution Proof</span>
            </h3>
            <div className="image-bounding-wrapper">
              <img src={complaint.resolved_image_url} alt="Uploaded resolution proof" />
            </div>
          </div>
        )}

        {/* Workflow Mutation Form */}
        <div className="status-workflow-mutation-section">
          <h2>Update Complaint Status</h2>

          <div className="form-group">
            <label htmlFor="status-select">Select Work Stage</label>
            <select
              id="status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="remarks-box">
            <label htmlFor="remarks-textarea">Resolution Remarks</label>
            <textarea
              id="remarks-textarea"
              rows="4"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Describe the diagnostics, parts replaced, or actions completed..."
            />
          </div>

          {/* Conditional Proof Upload */}
          {status === "Resolved" && (
            <div className="resolution-upload-box">
              <label className="upload-input-label">
                <Upload size={16} />
                <span>Upload Proof of Work Image (Required)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-file-input"
                />
              </label>

              {resolvedImagePreview && (
                <div className="upload-preview-container">
                  <p>Preview Selected Image:</p>
                  <img
                    src={resolvedImagePreview}
                    alt="Upload Preview"
                    className="image-preview-thumbnail"
                  />
                </div>
              )}
            </div>
          )}

          <button
            className="commit-status-mutation-btn"
            disabled={updating}
            onClick={handleUpdate}
          >
            {updating ? (
              <Loader2 size={16} className="details-spin-loader" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            <span>{updating ? "Updating Workflow..." : "Save Status Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffComplaintDetails;