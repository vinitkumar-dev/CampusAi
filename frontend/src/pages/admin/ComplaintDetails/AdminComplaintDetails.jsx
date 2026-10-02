import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ExternalLink,
  FileText,
  Hash,
  ImageOff,
  Loader2,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import { getAdminComplaintDetails, deleteComplaint } from "../../../services/adminService";
import { getComplaintTimeline } from "../../../services/complaintService";
import { formatDateTimeIST } from "../../../utils/dateTime";

import Loader from "../../../components/common/Loader/Loader";
import "./AdminComplaintDetails.css";

/* ---------- Presentation helpers ---------- */

const STATUS_TONES = {
  open: "info",
  assigned: "primary",
  "in progress": "warning",
  in_progress: "warning",
  resolved: "success",
  rejected: "danger",
  closed: "neutral",
};

const PRIORITY_TONES = {
  low: "success",
  medium: "warning",
  high: "danger",
  critical: "danger-solid",
};

const ROLE_LABELS = { admin: "Admin", staff: "Staff", student: "Student" };

const ACTION_LABELS = {
  COMPLAINT_CREATED: "Complaint Created",
  COMPLAINT_ASSIGNED: "Complaint Assigned",
  STATUS_CHANGED: "Status Changed",
  COMPLAINT_RESOLVED: "Complaint Resolved",
  COMPLAINT_UPDATED: "Complaint Updated",
  COMPLAINT_DELETED: "Complaint Deleted",
};

const toneOf = (map, value, fallback = "neutral") =>
  map[String(value || "").toLowerCase()] || fallback;

const humanizeAction = (action) => {
  if (!action) return "System Update";
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  return String(action)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const actorLabel = (entry) => {
  const role = ROLE_LABELS[String(entry.actor_role || "").toLowerCase()];
  if (entry.actor_name) return role ? `${entry.actor_name} (${role})` : entry.actor_name;
  return role || "System";
};

const initialsOf = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

// image_url is a single Cloudinary URL today; tolerate a JSON array of URLs too.
const parseAttachments = (raw) => {
  if (!raw) return [];
  const text = String(raw).trim();
  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      /* fall through to single URL */
    }
  }
  return [text];
};

const isPdf = (url) => /\.pdf(\?|#|$)/i.test(url);

/* ---------- Small presentational components ---------- */

function Badge({ tone = "neutral", children }) {
  return <span className={`acd-badge acd-badge--${tone}`}>{children}</span>;
}

function InfoItem({ label, children }) {
  return (
    <div className="acd-info-item">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ContactRow({ icon: Icon, children }) {
  return (
    <li className="acd-contact-row">
      <Icon size={15} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

function AttachmentCard({ url, index }) {
  const [failed, setFailed] = useState(false);
  const asFile = isPdf(url) || failed;

  return (
    <a
      className={`acd-attachment ${asFile ? "acd-attachment--file" : ""}`}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open attachment ${index + 1} in a new tab`}
    >
      {asFile ? (
        <div className="acd-attachment-fallback">
          {failed && !isPdf(url) ? (
            <ImageOff size={28} aria-hidden="true" />
          ) : (
            <FileText size={28} aria-hidden="true" />
          )}
          <span>{failed && !isPdf(url) ? "Preview unavailable" : "PDF document"}</span>
        </div>
      ) : (
        <img
          src={url}
          alt={`Complaint attachment ${index + 1}`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
      <span className="acd-attachment-overlay">
        <ExternalLink size={14} aria-hidden="true" /> Open
      </span>
    </a>
  );
}

/* ---------- Page ---------- */

function AdminComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelineError, setTimelineError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadComplaint = async () => {
      setLoading(true);

      const [detailsRes, timelineRes] = await Promise.allSettled([
        getAdminComplaintDetails(id),
        getComplaintTimeline(id),
      ]);

      if (!isMounted) return;

      if (detailsRes.status === "fulfilled") {
        const payload = detailsRes.value;
        setComplaint(payload?.data || payload || null);
      } else {
        console.error("Error loading complaint details:", detailsRes.reason);
        setComplaint(null);
      }

      if (timelineRes.status === "fulfilled") {
        const payload = timelineRes.value;
        const entries = Array.isArray(payload) ? payload : payload?.timeline;
        setTimeline(Array.isArray(entries) ? entries : []);
        setTimelineError(false);
      } else {
        console.error("Error loading activity timeline:", timelineRes.reason);
        setTimeline([]);
        setTimelineError(true);
      }

      setLoading(false);
    };

    loadComplaint();

    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  const goBack = () => {
    // Direct visits have no in-app history to return to.
    if (location.key !== "default") navigate(-1);
    else navigate("/admin/complaints");
  };

  const handleDelete = async () => {
    if (deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this complaint? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      setActionError("");
      await deleteComplaint(id);
      navigate("/admin/complaints");
    } catch (err) {
      console.error("Failed to delete complaint:", err);
      setActionError("Could not delete this complaint. Please try again.");
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading complaint details..." />;
  }

  if (!complaint) {
    return (
      <div className="acd-page">
        <div className="acd-empty-state">
          <ShieldAlert size={44} className="acd-empty-icon" aria-hidden="true" />
          <h3>Complaint unavailable</h3>
          <p>It may have been deleted, or it could not be loaded right now.</p>
          <div className="acd-empty-actions">
            <button type="button" className="acd-btn" onClick={goBack}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="acd-btn acd-btn--primary"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const student = complaint.student;
  const assignee = complaint.assignee;
  const attachments = parseAttachments(complaint.image_url);
  const statusLabel = complaint.status || "Open";

  return (
    <div className="acd-page">
      {/* ---------- Header ---------- */}
      <header className="acd-header">
        <button type="button" className="acd-btn acd-btn--ghost" onClick={goBack} disabled={deleting}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back</span>
        </button>

        <p className="acd-eyebrow">Complaint #{complaint.id ?? id}</p>
        <h1 className="acd-title">{complaint.title || "Untitled complaint"}</h1>

        <div className="acd-header-badges">
          <Badge tone={toneOf(STATUS_TONES, statusLabel)}>
            <span className="acd-badge-dot" aria-hidden="true" />
            {statusLabel}
          </Badge>
          <Badge tone="neutral">{complaint.category || "Uncategorized"}</Badge>
          <Badge tone={toneOf(PRIORITY_TONES, complaint.urgency, "warning")}>
            {complaint.urgency || "Medium"} priority
          </Badge>
        </div>
      </header>

      <div className="acd-layout">
        {/* ---------- Main column ---------- */}
        <main className="acd-main">
          <section className="acd-card">
            <h2 className="acd-card-title">Description</h2>
            <p className="acd-description">{complaint.description || "No description provided."}</p>
          </section>

          <section className="acd-card">
            <div className="acd-card-head">
              <h2 className="acd-card-title">Attachments</h2>
              {attachments.length > 0 && <span className="acd-count">{attachments.length}</span>}
            </div>

            {attachments.length === 0 ? (
              <div className="acd-empty-inline">
                <Paperclip size={22} aria-hidden="true" />
                <p>No attachments were uploaded with this complaint.</p>
              </div>
            ) : (
              <div className="acd-attachments">
                {attachments.map((url, index) => (
                  <AttachmentCard key={`${url}-${index}`} url={url} index={index} />
                ))}
              </div>
            )}
          </section>

          <section className="acd-card">
            <h2 className="acd-card-title">Complaint information</h2>
            <dl className="acd-info-grid">
              <InfoItem label="Complaint ID">#{complaint.id ?? id}</InfoItem>
              <InfoItem label="Category">{complaint.category || "Uncategorized"}</InfoItem>
              <InfoItem label="Priority">
                <Badge tone={toneOf(PRIORITY_TONES, complaint.urgency, "warning")}>
                  {complaint.urgency || "Medium"}
                </Badge>
              </InfoItem>
              <InfoItem label="Status">
                <Badge tone={toneOf(STATUS_TONES, statusLabel)}>{statusLabel}</Badge>
              </InfoItem>
              <InfoItem label="Submitted">{formatDateTimeIST(complaint.created_at)}</InfoItem>
              <InfoItem label="Last updated">{formatDateTimeIST(complaint.updated_at)}</InfoItem>
              {complaint.predicted_category && (
                <InfoItem label="AI predicted category">{complaint.predicted_category}</InfoItem>
              )}
              {complaint.predicted_urgency && (
                <InfoItem label="AI predicted priority">{complaint.predicted_urgency}</InfoItem>
              )}
            </dl>
          </section>

          <section className="acd-card">
            <div className="acd-card-head">
              <h2 className="acd-card-title">Activity</h2>
              {timeline.length > 0 && <span className="acd-count">{timeline.length}</span>}
            </div>

            {timelineError ? (
              <div className="acd-empty-inline">
                <p>Activity history could not be loaded.</p>
                <button type="button" className="acd-btn" onClick={() => setReloadKey((key) => key + 1)}>
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            ) : timeline.length === 0 ? (
              <div className="acd-empty-inline">
                <p>No activity has been recorded for this complaint yet.</p>
              </div>
            ) : (
              <ol className="acd-timeline">
                {timeline.map((entry, index) => {
                  const showTransition =
                    entry.action === "STATUS_CHANGED" && entry.old_value && entry.new_value;

                  return (
                    <li className="acd-timeline-item" key={entry.id ?? index}>
                      <span className="acd-timeline-marker" aria-hidden="true" />
                      <div className="acd-timeline-body">
                        <p className="acd-timeline-action">{humanizeAction(entry.action)}</p>
                        <p className="acd-timeline-actor">By {actorLabel(entry)}</p>

                        {showTransition ? (
                          <p className="acd-timeline-transition">
                            <Badge tone={toneOf(STATUS_TONES, entry.old_value)}>{entry.old_value}</Badge>
                            <ArrowRight size={14} aria-hidden="true" />
                            <Badge tone={toneOf(STATUS_TONES, entry.new_value)}>{entry.new_value}</Badge>
                          </p>
                        ) : (
                          entry.description && <p className="acd-timeline-remark">{entry.description}</p>
                        )}

                        <time className="acd-timeline-time">
                          {formatDateTimeIST(entry.created_at || entry.createdAt)}
                        </time>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </main>

        {/* ---------- Sidebar ---------- */}
        <aside className="acd-sidebar">
          <section className="acd-card">
            <h2 className="acd-card-title">Student information</h2>
            {student ? (
              <div className="acd-person">
                <div className="acd-person-head">
                  {student.profile_image ? (
                    <img className="acd-avatar" src={student.profile_image} alt="" />
                  ) : (
                    <span className="acd-avatar acd-avatar--initials" aria-hidden="true">
                      {initialsOf(student.name)}
                    </span>
                  )}
                  <div>
                    <p className="acd-person-name">{student.name}</p>
                    <p className="acd-person-role">Student</p>
                  </div>
                </div>
                <ul className="acd-contact-list">
                  {student.email && (
                    <ContactRow icon={Mail}>
                      <a href={`mailto:${student.email}`}>{student.email}</a>
                    </ContactRow>
                  )}
                  {student.phone && <ContactRow icon={Phone}>{student.phone}</ContactRow>}
                  {student.roll_number && <ContactRow icon={Hash}>{student.roll_number}</ContactRow>}
                  {student.department && <ContactRow icon={Building2}>{student.department}</ContactRow>}
                  {student.hostel && <ContactRow icon={MapPin}>{student.hostel}</ContactRow>}
                </ul>
              </div>
            ) : (
              <p className="acd-muted">Student details are not available.</p>
            )}
          </section>

          <section className="acd-card">
            <h2 className="acd-card-title">Assignment information</h2>
            {assignee ? (
              <div className="acd-person">
                <div className="acd-person-head">
                  {assignee.profile_image ? (
                    <img className="acd-avatar" src={assignee.profile_image} alt="" />
                  ) : (
                    <span className="acd-avatar acd-avatar--initials" aria-hidden="true">
                      {initialsOf(assignee.name)}
                    </span>
                  )}
                  <div>
                    <p className="acd-person-name">{assignee.name}</p>
                    <p className="acd-person-role">Assigned staff</p>
                  </div>
                </div>
                <ul className="acd-contact-list">
                  {assignee.email && (
                    <ContactRow icon={Mail}>
                      <a href={`mailto:${assignee.email}`}>{assignee.email}</a>
                    </ContactRow>
                  )}
                  {assignee.phone && <ContactRow icon={Phone}>{assignee.phone}</ContactRow>}
                  {assignee.department && <ContactRow icon={Building2}>{assignee.department}</ContactRow>}
                </ul>
              </div>
            ) : (
              <p className="acd-muted">This complaint has not been assigned to a staff member yet.</p>
            )}
          </section>

          <section className="acd-card">
            <h2 className="acd-card-title">Current status</h2>
            <div className="acd-status-block">
              <Badge tone={toneOf(STATUS_TONES, statusLabel)}>
                <span className="acd-badge-dot" aria-hidden="true" />
                {statusLabel}
              </Badge>
              <p className="acd-muted">Updated {formatDateTimeIST(complaint.updated_at)}</p>
            </div>
          </section>

          <section className="acd-card">
            <h2 className="acd-card-title">Admin actions</h2>
            <div className="acd-actions">
              <button
                type="button"
                className="acd-btn"
                onClick={() => navigate("/admin/complaints")}
                disabled={deleting}
              >
                <ArrowRight size={16} aria-hidden="true" />
                <span>Go to complaints list</span>
              </button>

              <button
                type="button"
                className="acd-btn acd-btn--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 size={16} className="acd-spinner" aria-hidden="true" />
                ) : (
                  <Trash2 size={16} aria-hidden="true" />
                )}
                <span>{deleting ? "Deleting…" : "Delete complaint"}</span>
              </button>

              {actionError && (
                <p className="acd-action-error" role="alert">
                  {actionError}
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default AdminComplaintDetails;
