"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Lead } from "@/types/lead";
import { LeadGradeBadge } from "@/components/LeadGradeBadge";
import { LeadTemperatureBadge } from "@/components/LeadTemperatureBadge";
import { RiskFlags } from "@/components/RiskFlags";
import { riskFlagLabels } from "@/lib/scoring";

export function LeadQuickView({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{lead.customerName}</h2>
            <p className="muted">
              {lead.phoneNumber || "-"}
              {lead.lineId ? ` | Line: ${lead.lineId}` : ""}
              {lead.province ? ` | ${lead.province}` : ""}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} type="button">×</button>
        </div>

        <div className="modal-score-row">
          <div className="modal-score-big">
            <span className="score-large">{lead.totalScore}</span>
            <span className="muted">/100</span>
          </div>
          <div className="modal-badges">
            <LeadGradeBadge grade={lead.grade} />
            <LeadTemperatureBadge temperature={lead.temperature} />
            <span className="badge cold">{lead.segment}</span>
          </div>
          <div className="modal-subscores">
            <div>
              <span className="muted">Fit</span>
              <strong> {lead.fitScore}/40</strong>
            </div>
            <div>
              <span className="muted">Interest</span>
              <strong> {lead.interestScore}/60</strong>
            </div>
          </div>
        </div>

        <div className="modal-section">
          <h4>สรุป</h4>
          <p>{lead.recommendation}</p>
        </div>

        <div className="modal-section">
          <h4>สิ่งที่ควรทำต่อ</h4>
          <p><strong>{lead.nextStep}</strong></p>
        </div>

        {lead.riskFlags.length > 0 && (
          <div className="modal-section">
            <h4>ความเสี่ยง</h4>
            <RiskFlags flags={lead.riskFlags} />
          </div>
        )}

        <div className="modal-section">
          <h4>เหตุผลหลัก</h4>
          <ol className="list">
            {lead.scoringReasons.map((r) => (
              <li key={r} className="muted">{r}</li>
            ))}
          </ol>
        </div>

        <div className="modal-footer">
          <Link className="button" href={`/leads/${lead.id}`}>
            ดูรายละเอียดเต็ม / แก้ไข
          </Link>
          <button className="button secondary" type="button" onClick={onClose}>
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
