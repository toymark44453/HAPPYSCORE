import type { PerformanceMetrics } from "@/types/performance";

const MOVEMENT_COLORS: Record<string, string> = {
  green: "#067647",
  red: "#b42318",
  blue: "#175cd3",
  muted: "#667085",
};

function KpiCard({
  label,
  value,
  sub,
  color = "muted",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: keyof typeof MOVEMENT_COLORS;
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-value" style={{ color: MOVEMENT_COLORS[color] }}>
        {value}
      </div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub muted">{sub}</div>}
    </div>
  );
}

export function PerformanceKpiCards({ m }: { m: PerformanceMetrics }) {
  return (
    <div className="kpi-grid">
      <KpiCard label="Lead ทั้งหมด" value={m.totalLeads} color="blue" />
      <KpiCard label="Lead ดีขึ้น" value={m.improvedLeads} sub={`${m.improvedRate}%`} color="green" />
      <KpiCard label="Lead ลดลง" value={m.declinedLeads} sub={`${m.declinedRate}%`} color="red" />
      <KpiCard label="Upgrade Rate" value={`${m.totalUpgradeRate}%`} color="green" />
      <KpiCard label="Downgrade Rate" value={`${m.totalDowngradeRate}%`} color="red" />
      <KpiCard label="C → A" value={m.cToA} sub={`${m.cToARate}%`} color="green" />
      <KpiCard label="C → B" value={m.cToB} sub={`${m.cToBRate}%`} color="green" />
      <KpiCard label="B → A" value={m.bToA} sub={`${m.bToARate}%`} color="green" />
      <KpiCard
        label="เฉลี่ยคะแนนเพิ่ม"
        value={m.averageScoreIncrease > 0 ? `+${m.averageScoreIncrease}` : m.averageScoreIncrease}
        color="green"
      />
    </div>
  );
}
