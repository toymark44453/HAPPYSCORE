import { LeadGradeBadge } from "@/components/LeadGradeBadge";
import { LeadTemperatureBadge } from "@/components/LeadTemperatureBadge";
import type { Lead } from "@/types/lead";

export function LeadScoreCard({ lead }: { lead: Lead }) {
  return (
    <div className="card">
      <div className="kpi-label">คะแนนรวม</div>
      <div className="score-large">{lead.totalScore}</div>
      <p className="muted">จาก 100 คะแนน</p>
      <div className="actions">
        <LeadGradeBadge grade={lead.grade} />
        <LeadTemperatureBadge temperature={lead.temperature} />
      </div>
      <p>
        <strong>Segment:</strong> {lead.segment}
      </p>
    </div>
  );
}
