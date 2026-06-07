import { generatePriorityCallList } from "@/lib/priority";
import type { Lead } from "@/types/lead";
import { LeadGradeBadge } from "@/components/LeadGradeBadge";
import { LeadTemperatureBadge } from "@/components/LeadTemperatureBadge";

export function PriorityCallList({
  leads,
  onQuickView,
}: {
  leads: Lead[];
  onQuickView?: (lead: Lead) => void;
}) {
  const priorityLeads = generatePriorityCallList(leads).slice(0, 6);
  return (
    <div className="card">
      <h2>Priority Call List วันนี้</h2>
      {priorityLeads.length === 0 ? (
        <p className="muted">ยังไม่มี Lead</p>
      ) : (
        <ol className="priority-list">
          {priorityLeads.map((lead, i) => (
            <li key={lead.id} className="priority-item">
              <span className="priority-rank">{i + 1}</span>
              <div className="priority-body">
                <div className="priority-header">
                  <strong>{lead.customerName}</strong>
                  <LeadTemperatureBadge temperature={lead.temperature} />
                  <LeadGradeBadge grade={lead.grade} />
                  <span className="muted">{lead.totalScore}/100</span>
                </div>
                <p className="muted priority-nextstep">{lead.nextStep}</p>
              </div>
              {onQuickView && (
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => onQuickView(lead)}
                >
                  ดูเร็ว
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
