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

  const toPercent = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 1) return null;
    return Number((n * 100).toFixed(2));
  };

  const categoryConfidence = toPercent(
    prediction.categoryConfidence ?? prediction.category_confidence,
  );
  const urgencyConfidence = toPercent(
    prediction.urgencyConfidence ?? prediction.urgency_confidence,
  );

  const urgencyClass = prediction.urgency?.toLowerCase()?.trim() || "low";

  return (
    <section className="ai-card" aria-labelledby="ai-card-title">
      <div className="ai-glow ai-glow-one" aria-hidden="true"></div>
      <div className="ai-glow ai-glow-two" aria-hidden="true"></div>

      <div className="ai-header">
        <div className="ai-icon" aria-hidden="true">
          <Sparkles size={24} />
        </div>

        <div>
          <h2 id="ai-card-title">AI Prediction</h2>
          <p>Powered by CampusAI</p>
        </div>
      </div>

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
        <strong>
          {value == null ? "Not available" : `${value.toFixed(2)}%`}
        </strong>
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-valuenow={value ?? undefined}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className={`progress-fill ${type}`}
          style={{ width: `${value ?? 0}%` }}
        ></div>
      </div>
    </div>
  );
}

export default AIPredictionCard;
