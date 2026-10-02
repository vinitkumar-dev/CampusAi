import {
  Sparkles,
  Layers3,
  TriangleAlert,
  Building2,
  Clock3,
} from "lucide-react";

import "./AIPredictionCard.css";

function AIPredictionCard({ prediction }) {
  if (!prediction) return null;

  const categoryConfidence = Math.min(
    100,
    Math.max(0, Math.round((prediction.categoryConfidence || 0) * 100)),
  );

  const urgencyConfidence = Math.min(
    100,
    Math.max(0, Math.round((prediction.urgencyConfidence || 0) * 100)),
  );

  const urgencyClass = prediction.urgency?.toLowerCase()?.trim() || "low";

  return (
    <section className="ai-card" aria-labelledby="ai-card-title">
      <div className="ai-glow ai-glow-one" aria-hidden="true"></div>
      <div className="ai-glow ai-glow-two" aria-hidden="true"></div>

      {/* Header */}
      <div className="ai-header">
        <div className="ai-icon" aria-hidden="true">
          <Sparkles size={24} />
        </div>

        <div>
          <h2 id="ai-card-title">AI Prediction</h2>
          <p>Powered by CampusAI Intelligence Engine</p>
        </div>
      </div>

      {/* Prediction Data Grid */}
      <div className="prediction-grid">
        <PredictionItem
          icon={<Layers3 size={18} />}
          title="Category"
          value={prediction.category}
        />

        <PredictionItem
          icon={<TriangleAlert size={18} />}
          title="Urgency"
          value={prediction.urgency}
          className={`urgency-card ${urgencyClass}`}
        />

        <PredictionItem
          icon={<Building2 size={18} />}
          title="Department"
          value={prediction.department}
        />

        <PredictionItem
          icon={<Clock3 size={18} />}
          title="Expected Resolution"
          value={prediction.resolutionTime}
        />
      </div>

      {/* Confidence Metrics */}
      <div className="confidence-section">
        <ConfidenceBar
          title="Category Confidence"
          value={categoryConfidence}
          type="category"
        />

        <ConfidenceBar
          title="Urgency Confidence"
          value={urgencyConfidence}
          type="urgency"
        />
      </div>
    </section>
  );
}

function PredictionItem({ icon, title, value, className = "" }) {
  return (
    <div className={`prediction-item ${className}`}>
      <div className="item-icon" aria-hidden="true">
        {icon}
      </div>

      <div className="item-content">
        <span>{title}</span>
        <h3 title={value || "-"}>{value || "-"}</h3>
      </div>
    </div>
  );
}

function ConfidenceBar({ title, value, type }) {
  return (
    <div className="confidence-card">
      <div className="confidence-header">
        <span>{title}</span>
        <strong>{value}%</strong>
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className={`progress-fill ${type}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

export default AIPredictionCard;
