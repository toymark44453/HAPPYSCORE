"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardKpiCards } from "@/components/DashboardKpiCards";
import { LeadFilters, defaultFilter } from "@/components/LeadFilters";
import { LeadQuickView } from "@/components/LeadQuickView";
import { LeadTable } from "@/components/LeadTable";
import { PriorityCallList } from "@/components/PriorityCallList";
import { exportLeadsToCsv } from "@/lib/exportCsv";
import { deleteLead, loadLeads } from "@/lib/storage";
import type { Lead } from "@/types/lead";
import type { FilterState } from "@/components/LeadFilters";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [quickViewLead, setQuickViewLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadLeads()
      .then(setLeads)
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filter.grade !== "all" && lead.grade !== filter.grade) return false;
      if (filter.temperature !== "all" && lead.temperature !== filter.temperature) return false;
      if (filter.segment !== "all" && lead.segment !== filter.segment) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const haystack = [lead.customerName, lead.phoneNumber, lead.province, lead.projectName, lead.lineId]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [leads, filter]);

  async function handleDelete(id: string) {
    const lead = leads.find((item) => item.id === id);
    if (!lead) return;
    if (!window.confirm(`ลบ Lead "${lead.customerName}" ใช่ไหม?`)) return;
    try {
      setLeads(await deleteLead(id));
    } catch (e) {
      alert("ลบไม่สำเร็จ: " + (e instanceof Error ? e.message : ""));
    }
  }

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <h1>HAPPY v0.1 Lead Scoring</h1>
          <p>ระบบให้คะแนน แบ่งเกรด และจัดลำดับความสำคัญลูกค้ากันสาดไฟฟ้า</p>
        </div>
        <div className="actions">
          <button
            className="button secondary"
            type="button"
            onClick={() => exportLeadsToCsv(filteredLeads)}
            disabled={filteredLeads.length === 0}
          >
            Export CSV ({filteredLeads.length})
          </button>
          <Link className="button" href="/leads/new">+ เพิ่ม Lead ใหม่</Link>
        </div>
      </div>

      {!loaded ? (
        <div className="empty">กำลังโหลดข้อมูลจาก Supabase...</div>
      ) : error ? (
        <div className="error-box">โหลดข้อมูลไม่สำเร็จ: {error}</div>
      ) : (
        <>
          <DashboardKpiCards leads={leads} />
          <section className="section">
            <PriorityCallList leads={leads} onQuickView={setQuickViewLead} />
          </section>
          <section className="section">
            <div className="section-header">
              <h2>Lead ทั้งหมด</h2>
              <span className="muted">{leads.length} รายการ · ข้อมูลจาก Supabase (ทีมใช้ร่วมกันได้)</span>
            </div>
            <LeadFilters value={filter} onChange={setFilter} total={leads.length} filtered={filteredLeads.length} />
            <LeadTable leads={filteredLeads} onDelete={handleDelete} onQuickView={setQuickViewLead} />
          </section>
        </>
      )}

      {quickViewLead && (
        <LeadQuickView lead={quickViewLead} onClose={() => setQuickViewLead(null)} />
      )}
    </main>
  );
}
