"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lead } from "@/types/lead";
import { LeadGradeBadge } from "@/components/LeadGradeBadge";
import { LeadTemperatureBadge } from "@/components/LeadTemperatureBadge";
import { getLastContactDate, formatRelativeTime } from "@/lib/activityStorage";

function LastContact({ leadId }: { leadId: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    getLastContactDate(leadId).then((date) => {
      setLabel(date ? formatRelativeTime(date) : null);
    }).catch(() => setLabel(null));
  }, [leadId]);

  if (!label) return <span className="muted">—</span>;
  return <span className="last-contact">{label}</span>;
}

export function LeadTable({
  leads,
  onDelete,
  onQuickView,
}: {
  leads: Lead[];
  onDelete: (id: string) => void;
  onQuickView?: (lead: Lead) => void;
}) {
  if (leads.length === 0)
    return <div className="empty">ไม่พบ Lead ที่ตรงกับเงื่อนไข</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ชื่อลูกค้า</th>
            <th>จังหวัด</th>
            <th>โครงการ</th>
            <th>คะแนนรวม</th>
            <th>Fit</th>
            <th>Interest</th>
            <th>Grade</th>
            <th>Temperature</th>
            <th>Segment</th>
            <th>ติดต่อล่าสุด</th>
            <th>Next Step</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <strong>{lead.customerName}</strong>
                <div className="muted">{lead.phoneNumber || lead.lineId}</div>
              </td>
              <td>{lead.province || "-"}</td>
              <td>{lead.projectName || "-"}</td>
              <td>
                <strong>{lead.totalScore}/100</strong>
              </td>
              <td>{lead.fitScore}/40</td>
              <td>{lead.interestScore}/60</td>
              <td>
                <LeadGradeBadge grade={lead.grade} />
              </td>
              <td>
                <LeadTemperatureBadge temperature={lead.temperature} />
              </td>
              <td>{lead.segment}</td>
              <td>
                <LastContact leadId={lead.id} />
              </td>
              <td className="next-step-cell">{lead.nextStep}</td>
              <td>
                <div className="actions">
                  {onQuickView && (
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() => onQuickView(lead)}
                    >
                      ดูเร็ว
                    </button>
                  )}
                  <Link className="button secondary" href={`/leads/${lead.id}`}>
                    แก้ไข
                  </Link>
                  <button
                    className="button danger"
                    onClick={() => onDelete(lead.id)}
                    type="button"
                  >
                    ลบ
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
