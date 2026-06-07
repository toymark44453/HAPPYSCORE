"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ActivityLog } from "@/components/ActivityLog";
import { FitInterestScoreCard } from "@/components/FitInterestScoreCard";
import { LeadForm } from "@/components/LeadForm";
import { LeadGradeBadge } from "@/components/LeadGradeBadge";
import { LeadRecommendation } from "@/components/LeadRecommendation";
import { LeadScoreCard } from "@/components/LeadScoreCard";
import { LeadTemperatureBadge } from "@/components/LeadTemperatureBadge";
import { RiskFlags } from "@/components/RiskFlags";
import { deleteLead, loadLeads, upsertLead } from "@/lib/storage";
import { toLeadInput } from "@/lib/leadFactory";
import type { Lead } from "@/types/lead";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const lead = useMemo(() => leads.find((item) => item.id === params.id), [leads, params.id]);

  useEffect(() => {
    loadLeads()
      .then(setLeads)
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  async function handleSave(nextLead: Lead) {
    setSaving(true);
    setError("");
    try {
      setLeads(await upsertLead(nextLead));
      setIsEditing(false);
    } catch (e) {
      setError("บันทึกไม่สำเร็จ: " + (e instanceof Error ? e.message : ""));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!lead) return;
    if (!window.confirm(`ลบ Lead "${lead.customerName}" ใช่ไหม?`)) return;
    try {
      await deleteLead(lead.id);
      router.push("/");
    } catch (e) {
      alert("ลบไม่สำเร็จ: " + (e instanceof Error ? e.message : ""));
    }
  }

  if (!loaded) {
    return <main className="app-shell"><div className="empty">กำลังโหลด...</div></main>;
  }

  if (error) {
    return <main className="app-shell"><div className="error-box">{error}</div></main>;
  }

  if (!lead) {
    return (
      <main className="app-shell">
        <div className="empty">
          ไม่พบ Lead นี้
          <div className="section">
            <Link className="button secondary" href="/">กลับ Dashboard</Link>
          </div>
        </div>
      </main>
    );
  }

  if (isEditing) {
    return (
      <main className="app-shell">
        <div className="topbar">
          <div className="brand">
            <h1>แก้ไข Lead: {lead.customerName}</h1>
            <p>บันทึกแล้วระบบจะคำนวณคะแนนใหม่อัตโนมัติ</p>
          </div>
        </div>
        {error && <div className="error-box">{error}</div>}
        <LeadForm
          initialValue={toLeadInput(lead)}
          existing={{ id: lead.id, createdAt: lead.createdAt }}
          submitLabel={saving ? "กำลังบันทึก..." : "บันทึก"}
          onSubmit={handleSave}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <h1>{lead.customerName}</h1>
          <p>
            {lead.phoneNumber || "-"}
            {lead.lineId ? ` | Line: ${lead.lineId}` : ""}
            {lead.province ? ` | ${lead.province}` : ""}
          </p>
        </div>
        <div className="actions">
          <button className="button" onClick={() => setIsEditing(true)} type="button">แก้ไข</button>
          <button className="button danger" onClick={handleDelete} type="button">ลบ</button>
          <Link className="button secondary" href="/">กลับ Dashboard</Link>
        </div>
      </div>

      <div className="layout-two">
        <div className="grid">
          <FitInterestScoreCard lead={lead} />
          <div className="card">
            <h2>สรุป</h2>
            <p>{lead.recommendation}</p>
            <div className="actions">
              <LeadGradeBadge grade={lead.grade} />
              <LeadTemperatureBadge temperature={lead.temperature} />
              <span className="badge cold">{lead.segment}</span>
            </div>
          </div>
          <div className="card">
            <h2>เหตุผลหลัก</h2>
            <ol className="list">
              {lead.scoringReasons.map((reason) => <li key={reason}>{reason}</li>)}
            </ol>
          </div>
          <div className="card">
            <h2>ความเสี่ยง</h2>
            <RiskFlags flags={lead.riskFlags} />
          </div>
          <LeadRecommendation lead={lead} />
          <div className="card">
            <h2>Note ลูกค้า</h2>
            <p>{lead.customerNote || "ไม่มี note"}</p>
          </div>
          <ActivityLog leadId={lead.id} />
        </div>
        <aside>
          <LeadScoreCard lead={lead} />
        </aside>
      </div>
    </main>
  );
}
