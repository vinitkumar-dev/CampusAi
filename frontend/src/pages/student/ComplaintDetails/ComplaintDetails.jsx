import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import StatusBadge from "../../../components/complaint/StatusBadge/StatusBadge";
import {
  getComplaintById,
  getComplaintTimeline,
} from "../../../services/complaintService";

import "./ComplaintDetails.css";

function ComplaintDetails() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadComplaintData = async () => {
      setLoading(true);

      try {
        const [complaintRes, timelineRes] = await Promise.allSettled([
          getComplaintById(id),
          getComplaintTimeline(id),
        ]);

        if (!mounted) return;

        if (complaintRes.status === "fulfilled") {
          const data = complaintRes.value?.data || complaintRes.value;
          setComplaint(data);
        } else {
          console.error("Complaint:", complaintRes.reason);
          setComplaint(null);
        }

        if (timelineRes.status === "fulfilled") {
          const data = timelineRes.value?.data || timelineRes.value;
          setTimeline(Array.isArray(data) ? data : []);
        } else {
          console.error("Timeline:", timelineRes.reason);
          setTimeline([]);
        }
      } catch (err) {
        console.error(err);
        setComplaint(null);
        setTimeline([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadComplaintData();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="details-loader">
        <div className="loader-circle"></div>
        <p>Loading Complaint Details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="error-container">
        <h3>Complaint Not Found</h3>

        <p>
          The complaint you are trying to view does not exist or has been
          removed.
        </p>

        <Link to="/student/my-complaints" className="back-home-btn">
          <ArrowLeft size={16} />
          <span>Back to Complaints</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="complaint-details-layout">
      <div className="details-action-bar">
        <Link to="/student/my-complaints" relative="path" className="back-link-btn">
          <ArrowLeft size={16} />
          <span>Back to Complaints</span>
        </Link>
      </div>

      <div className="complaint-details-grid">
        <div className="details-card">
          <div className="details-header">
            <div className="header-meta-title">
              <h1>Complaint #{complaint.id}</h1>

              <div className="meta-date">
                <Calendar size={14} />

                <span>
                  {complaint.created_at
                    ? new Date(complaint.created_at).toLocaleDateString(
                        undefined,
                        {
                          dateStyle: "medium",
                        },
                      )
                    : "-"}
                </span>
              </div>
            </div>

            <StatusBadge status={complaint.status || "Pending"} />
          </div>

          <div className="details-section">
            <label>Subject Title</label>

            <p className="content-text title-strong">
              {complaint.title || "-"}
            </p>
          </div>

          <div className="details-section">
            <label>Description</label>

            <p className="content-text desc-body">
              {complaint.description || "-"}
            </p>
          </div>

          {(complaint.image_url || complaint.image) && (
            <div className="details-section">
              <label>Attached Evidence</label>

              <div className="img-frame-wrapper">
                <img
                  className="complaint-image"
                  src={complaint.image_url || complaint.image}
                  alt="Complaint Evidence"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          <div className="prediction-grid">
            <div className="prediction-box premium-ai-box">
              <div className="box-icon-label">
                <Sparkles size={14} className="ai-star" />
                <span>Predicted Category</span>
              </div>

              <h4>
                {complaint.predicted_category || complaint.category || "N/A"}
              </h4>
            </div>

            <div className="prediction-box premium-ai-box">
              <div className="box-icon-label">
                <ShieldAlert size={14} className="ai-star" />
                <span>Predicted Urgency</span>
              </div>

              <h4>
                {complaint.predicted_urgency || complaint.urgency || "N/A"}
              </h4>
            </div>

            <div className="prediction-box standard-box">
              <div className="box-icon-label">
                <User size={14} />
                <span>Assigned Staff</span>
              </div>

              <h4>
                {complaint.assigned_staff_name ||
                  complaint.assigned_to ||
                  "Not Assigned"}
              </h4>
            </div>

            <div className="prediction-box standard-box">
              <div className="box-icon-label">
                <Tag size={14} />
                <span>Current Category</span>
              </div>

              <h4>{complaint.category || "General"}</h4>
            </div>
          </div>
        </div>

        <div className="timeline-card">
          <div className="timeline-header">
            <h2>Activity Log Timeline</h2>

            <span className="badge-count">{timeline.length} Updates</span>
          </div>

          <div className="timeline-scroller">
            {timeline.length === 0 ? (
              <div className="empty-timeline">
                <p>No logged activity found.</p>
              </div>
            ) : (
              <div className="timeline-stream">
                {timeline.map((item, index) => (
                  <div className="timeline-item" key={item.id || index}>
                    <div className="timeline-line-track">
                      <div className="timeline-dot-marker"></div>
                    </div>

                    <div className="timeline-content-block">
                      <h4>
                        {item.description ||
                          item.action ||
                          item.status ||
                          "System Update"}
                      </h4>

                      <span className="timestamp-label">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString(
                              undefined,
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              },
                            )
                          : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetails;
