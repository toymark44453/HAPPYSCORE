import type { Lead } from "@/types/lead";

export function DashboardKpiCards({ leads }: { leads: Lead[] }) {
  const count = (predicate: (lead: Lead) => boolean) => leads.filter(predicate).length;
  const items = [
    ["Lead ทั้งหมด", leads.length],
    ["Grade A", count((lead) => lead.grade === "A")],
    ["Grade B", count((lead) => lead.grade === "B")],
    ["Grade C", count((lead) => lead.grade === "C")],
    ["Grade D", count((lead) => lead.grade === "D")],
    ["HOT Lead", count((lead) => lead.temperature === "HOT")],
    ["ควรโทรวันนี้", count((lead) => lead.temperature === "HOT" || lead.temperature === "WARM")]
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
