import type { TeamMetrics } from "@/lib/teamMetrics";

export function TeamKpiCards({ m }: { m: TeamMetrics }) {
  const items = [
    ["Lead ทั้งหมด", m.totalLeads],
    ["Grade A", m.gradeA],
    ["HOT Lead", m.hotLeads],
    ["WARM Lead", m.warmLeads],
    ["ต้องโทรวันนี้", m.totalPriorityLeads],
    ["C → A รวม", m.cToA],
    ["C → A %", `${m.cToARate}%`],
    ["Avg Score", m.averageScore],
  ] as const;

  return (
    <div className="grid kpi-grid">
      {items.map(([label, value]) => (
        <div className="card" key={label}>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
        </div>
      ))}
    </div>
  );
}
