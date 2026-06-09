import type { Lead } from "@/types/lead";

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="score-bar-label">{value}/{max}</span>
    </div>
  );
}

export function FitInterestScoreCard({ lead }: { lead: Lead }) {
  return (
    <div className="card">
      <div className="score-bar-section">
        <div className="score-bar-row">
          <span className="score-bar-title">Fit Score</span>
          <ScoreBar value={lead.fitScore} max={40} color="var(--color-fit)" />
        </div>
        <div className="score-bar-row">
          <span className="score-bar-title">Interest Score</span>
          <ScoreBar value={lead.interestScore} max={60} color="var(--color-interest)" />
        </div>
        <div className="score-bar-row">
          <span className="score-bar-title">Total Score</span>
          <ScoreBar value={lead.totalScore} max={100} color="var(--color-total)" />
        </div>
        <div className="score-bar-meta muted">Priority Score: {lead.priorityScore}</div>
      </div>
    </div>
  );
}
