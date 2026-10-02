import { TrendingUp, TrendingDown } from "lucide-react";

import "./StatCard.css";

function StatCard({
  title,
  value,
  icon,
  color = "#2563EB",
  change = null,
  isPositive = true,
}) {
  return (
    <div
      className="stat-card"
      style={{
        "--card-color": color,
      }}
    >
      <div className="stat-card-top">
        <div className="stat-icon" aria-hidden="true">
          {icon}
        </div>

        {change !== null && change !== undefined && (
          <div
            className={`stat-change ${isPositive ? "positive" : "negative"}`}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{change}</span>
          </div>
        )}
      </div>

      <div className="stat-card-content">
        <h2>{value}</h2>
        <p>{title}</p>
      </div>

      <div className="stat-glow" aria-hidden="true" />
    </div>
  );
}

export default StatCard;
