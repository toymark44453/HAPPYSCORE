import { riskFlagLabels } from "@/lib/scoring";
import type { RiskFlag } from "@/types/lead";

export function RiskFlags({ flags }: { flags: RiskFlag[] }) {
  if (flags.length === 0) return <p className="muted">ยังไม่พบความเสี่ยงหลัก</p>;
  return (
    <div className="risk-list">
      {flags.map((flag) => (
        <span className="risk" key={flag}>
          {riskFlagLabels[flag]}
        </span>
      ))}
    </div>
  );
}
