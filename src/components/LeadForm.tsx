"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buildScoredLead } from "@/lib/leadFactory";
import { validateLeadInput } from "@/lib/validation";
import type { Lead, LeadInput } from "@/types/lead";
import { AudioAnalyzer } from "@/components/AudioAnalyzer";
import { LeadScoringForm } from "@/components/LeadScoringForm";
import { LeadScoreCard } from "@/components/LeadScoreCard";
import { FitInterestScoreCard } from "@/components/FitInterestScoreCard";
import { RiskFlags } from "@/components/RiskFlags";
import { LeadRecommendation } from "@/components/LeadRecommendation";

export const defaultLeadInput: LeadInput = {
  customerName: "",
  phoneNumber: "",
  lineId: "",
  province: "",
  district: "",
  installationAddress: "",
  projectName: "",
  leadSource: "Line",
  salesOwner: "",
  customerNote: "",
  installationLocationType: "unknown",
  projectValueLevel: "unknown",
  sitePhotoStatus: "not_sent",
  urgencyStatus: "unknown",
  quotationStatus: "not_quoted",
  communicationStatus: "partially_responsive",
  siteSurveyStatus: "not_scheduled"
};

export function LeadForm({
  initialValue = defaultLeadInput,
  existing,
  submitLabel,
  onSubmit
}: {
  initialValue?: LeadInput;
  existing?: Pick<Lead, "id" | "createdAt">;
  submitLabel: string;
  onSubmit: (lead: Lead) => void;
}) {
  const [value, setValue] = useState<LeadInput>(initialValue);
  const [errors, setErrors] = useState<string[]>([]);
  const previewLead = useMemo(() => buildScoredLead(value, existing), [value, existing]);

  function updateField<T extends keyof LeadInput>(name: T, fieldValue: LeadInput[T]) {
    setValue((current) => ({ ...current, [name]: fieldValue }));
  }

  function applyAudioResult(partial: Partial<LeadInput>) {
    setValue((current) => ({ ...current, ...partial }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateLeadInput(value);
    setErrors(nextErrors);
    if (nextErrors.length > 0) return;
    onSubmit(buildScoredLead(value, existing));
  }

  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <div className="error-box">
          <strong>กรุณาตรวจสอบข้อมูล</strong>
          <ul className="list">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="layout-two">
        <div className="grid">
          <AudioAnalyzer onApply={applyAudioResult} />
          <div className="card">
            <h2>ข้อมูลพื้นฐานลูกค้า</h2>
            <div className="grid form-grid">
              <div className="field">
                <label htmlFor="customerName">ชื่อลูกค้า *</label>
                <input id="customerName" value={value.customerName} onChange={(event) => updateField("customerName", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="phoneNumber">เบอร์โทร</label>
                <input id="phoneNumber" value={value.phoneNumber ?? ""} onChange={(event) => updateField("phoneNumber", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="lineId">Line ID</label>
                <input id="lineId" value={value.lineId ?? ""} onChange={(event) => updateField("lineId", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="province">จังหวัด</label>
                <input id="province" value={value.province ?? ""} onChange={(event) => updateField("province", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="district">เขต/อำเภอ</label>
                <input id="district" value={value.district ?? ""} onChange={(event) => updateField("district", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="projectName">โครงการ</label>
                <input id="projectName" value={value.projectName ?? ""} onChange={(event) => updateField("projectName", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="leadSource">ช่องทาง</label>
                <input id="leadSource" value={value.leadSource ?? ""} onChange={(event) => updateField("leadSource", event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="salesOwner">เซลล์ผู้ดูแล</label>
                <input id="salesOwner" value={value.salesOwner ?? ""} onChange={(event) => updateField("salesOwner", event.target.value)} />
              </div>
              <div className="field full">
                <label htmlFor="installationAddress">ที่อยู่ติดตั้ง</label>
                <input id="installationAddress" value={value.installationAddress ?? ""} onChange={(event) => updateField("installationAddress", event.target.value)} />
              </div>
              <div className="field full">
                <label htmlFor="customerNote">Note ลูกค้า</label>
                <textarea id="customerNote" value={value.customerNote ?? ""} onChange={(event) => updateField("customerNote", event.target.value)} />
              </div>
            </div>
          </div>

          <LeadScoringForm value={value} onChange={updateField} />

          <div className="actions">
            <button className="button" type="submit">
              {submitLabel}
            </button>
            <Link className="button secondary" href="/">
              กลับ Dashboard
            </Link>
          </div>
        </div>

        <aside className="grid">
          <LeadScoreCard lead={previewLead} />
          <FitInterestScoreCard lead={previewLead} />
          <div className="card">
            <h3>ความเสี่ยง</h3>
            <RiskFlags flags={previewLead.riskFlags} />
          </div>
          <LeadRecommendation lead={previewLead} />
        </aside>
      </div>
    </form>
  );
}
