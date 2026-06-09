"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardKpiCards } from "@/components/DashboardKpiCards";
import { LeadFilters, defaultFilter } from "@/components/LeadFilters";
import { LeadQuickView } from "@/components/LeadQuickView";
import { LeadTable } from "@/components/LeadTable";
import { PriorityCallList } from "@/components/PriorityCallList";
import { CurrentUserSelector } from "@/components/CurrentUserSelector";
import { exportLeadsToCsv } from "@/lib/exportCsv";
import { deleteLead, loadLeads } from "@/lib/storage";
import { getCurrentUser } from "@/lib/users";
import { getVisibleLeadsForUser } from "@/lib/visibilityFilter";
import type { Lead } from "@/types/lead";
import type { FilterState } from "@/components/LeadFilters";
import type { Salesperson } from "@/types/salesperson";

export default function DashboardPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [currentUser, setCurrentUserState] = useState<Salesperson>(getCurrentUser());
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [quickViewLead, setQuickViewLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadLeads()
      .then(setAllLeads)
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  const visibleLeads = useMemo(
    () => getVisibleLeadsForUser(allLeads, currentUser),
    [allLeads, currentUser]
  );

  const filteredLeads = useMemo(() => {
    return visibleLeads.filter((lead) => {
      if (filter.grade !== "all" && lead.grade !== filter.grade) return false;
      if (filter.temperature !== "all" && lead.temperature !== filter.temperature) return false;
      if (filter.segment !== "all" && lead.segment !== filter.segment) return false;
      if (filter.pipeline !== "all" && lead.pipelineStage !== filter.pipeline) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const haystack = [lead.customerName, lead.phoneNumber, lead.province, lead.projectName, lead.lineId]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [visibleLeads, filter]);

  async function handleDelete(id: string) {
    const lead = allLeads.find((item) => item.id === id);
    if (!lead) return;
    if (!window.confirm(`ลบ Lead "${lead.customerName}" ใช่ไหม?`)) return;
    try {
      setAllLeads(await deleteLead(id));
    } catch (e) {
      alert("ลบไม่สำเร็จ: " + (e instanceof Error ? e.message : ""));
    }
  }

  const isOwnerView = currentUser.role === "owner";

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <h1>HAPPY v0.1 Lead Scoring</h1>
          <p>ระบบให้คะแนน แบ่งเกรด และจัดลำดับความสำคัญลูกค้ากันสาดไฟฟ้า</p>
        </div>
        <div className="actions">
          <CurrentUserSelector onChange={setCurrentUserState} />
          <button
            className="button secondary"
            type="button"
            onClick={() => exportLeadsToCsv(filteredLeads)}
            disabled={filteredLeads.length === 0}
          >
            Export CSV ({filteredLeads.length})
          </button>
          {isOwnerView && (
            <Link className="button secondary" href="/team">👥 Team</Link>
          )}
          <Link className="button secondary" href="/performance">📊 Performance</Link>
          <Link className="button" href="/leads/new">+ เพิ่ม Lead ใหม่</Link>
        </div>
      </div>

      {!loaded ? (
        <div className="empty">กำลังโหลดข้อมูลจาก Supabase...</div>
      ) : error ? (
        <div className="error-box">โหลดข้อมูลไม่สำเร็จ: {error}</div>
      ) : (
        <>
          <DashboardKpiCards leads={visibleLeads} />
          <section className="section">
            <PriorityCallList leads={visibleLeads} onQuickView={setQuickViewLead} />
          </section>
          <section className="section">
            <div className="section-header">
              <h2>Lead ทั้งหมด</h2>
              <span className="muted">
                {visibleLeads.length} รายการ
                {isOwnerView ? " · ทีมทั้งหมด" : ` · ${currentUser.name}`}
              </span>
            </div>
            <LeadFilters value={filter} onChange={setFilter} total={visibleLeads.length} filtered={filteredLeads.length} />
            <LeadTable
              leads={filteredLeads}
              onDelete={handleDelete}
              onQuickView={setQuickViewLead}
              showSalesOwner={isOwnerView}
            />
          </section>
        </>
      )}

      {quickViewLead && (
        <LeadQuickView lead={quickViewLead} onClose={() => setQuickViewLead(null)} />
      )}
    </main>
  );
}
