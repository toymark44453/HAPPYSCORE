import type { Lead } from "@/types/lead";

export function FitInterestScoreCard({ lead }: { lead: Lead }) {
  return (
    <div className="grid score-subgrid">
      <div className="card">
        <div className="kpi-label">Fit Score</div>
        <div className="kpi-value">{lead.fitScore}/40</div>
      </div>
      <div className="card">
        <div className="kpi-label">Interest Score</div>
        <div className="kpi-value">{lead.interestScore}/60</div>
      </div>
      <div className="card">
        <div className="kpi-label">Priority Score</div>
        <div className="kpi-value">{lead.priorityScore}</div>
      </div>
    </div>
  );
}
