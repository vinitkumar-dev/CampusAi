import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import "./AnalyticsCharts.css";

// Premium balanced color palette matching CampusAI layout foundations
const COLORS = [
  "#2563EB", // Primary Blue
  "#22C55E", // Success Green
  "#EA580C", // Warning/Urgency Orange
  "#EF4444", // Danger Red
  "#7C3Aed", // AI Purple
  "#06B6D4", // Cyan Informational
  "#EC4899", // Accent Pink
];

function ChartTitle({ children }) {
  return <h3 className="chart-title">{children}</h3>;
}

// Custom Premium Tooltip to match enterprise UI requirements
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        {label && <p className="tooltip-label">{label}</p>}
        {payload.map((item, idx) => (
          <p
            key={idx}
            className="tooltip-value"
            style={{ color: item.color || item.payload.fill }}
          >
            <span
              className="tooltip-dot"
              style={{ backgroundColor: item.color || item.payload.fill }}
            />
            {`${item.name}: ${item.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function AnalyticsCharts({
  categoryData = [],
  statusData = [],
  urgencyData = [],
  monthlyData = [],
  departmentData = [],
}) {
  return (
    <div className="charts-container">
      {/* Category Distribution */}
      <div className="chart-card">
        <ChartTitle>Category Distribution</ChartTitle>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={categoryData}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#f1f5f9", opacity: 0.4 }}
            />
            <Bar
              dataKey="count"
              name="Tickets"
              fill="#2563EB"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Complaint Status */}
      <div className="chart-card">
        <ChartTitle>Complaint Status</ChartTitle>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {statusData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Complaint Trend */}
      <div className="chart-card full-width">
        <ChartTitle>Monthly Complaint Trend</ChartTitle>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={monthlyData}
            margin={{ top: 15, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              name="Active Issues"
              stroke="#2563EB"
              strokeWidth={3}
              activeDot={{ r: 6, strokeWidth: 0 }}
              dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#ffffff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Department Workload */}
      <div className="chart-card">
        <ChartTitle>Department Workload</ChartTitle>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={departmentData}
            layout="vertical"
            margin={{ top: 10, right: 15, left: -5, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#e2e8f0"
              horizontal={false}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="department"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              width={90}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "#f1f5f9", opacity: 0.4 }}
            />
            <Bar
              dataKey="complaints"
              name="Complaints"
              fill="#22C55E"
              radius={[0, 6, 6, 0]}
              maxBarSize={25}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Urgency Analysis */}
      <div className="chart-card">
        <ChartTitle>Urgency Analysis</ChartTitle>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={urgencyData}
              dataKey="count"
              nameKey="urgency"
              innerRadius={0}
              outerRadius={100}
              stroke="#ffffff"
              strokeWidth={3}
            >
              {urgencyData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[(index + 2) % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalyticsCharts;
