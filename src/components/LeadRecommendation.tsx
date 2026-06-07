import type { Lead } from "@/types/lead";

export function LeadRecommendation({ lead }: { lead: Lead }) {
  return (
    <div className="card">
      <h3>สิ่งที่ควรทำต่อ</h3>
      <p>{lead.recommendation}</p>
      <strong>{lead.nextStep}</strong>
    </div>
  );
}
