"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TeamKpiCards } from "@/components/TeamKpiCards";
import { SalespersonSummaryTable } from "@/components/SalespersonSummaryTable";
import { SalespersonDistributionTable } from "@/components/SalespersonDistributionTable";
import { loadLeads } from "@/lib/storage";
import { loadSnapshots } from "@/lib/snapshotStorage";
import { SALESPEOPLE } from "@/lib/users";
import {
  calculateTeamMetrics,
  calculateSalespersonSummary,
  calculateLeadDistributionBySalesperson,
} from "@/lib/teamMetrics";
import type { Lead } from "@/types/lead";
import type { LeadScoreSnapshot } from "@/types/performance";
import type { TeamMetrics, SalespersonSummary, SalespersonLeadDistribution } from "@/lib/teamMetrics";

const EMPTY_METRICS: TeamMetrics = {
  totalLeads: 0, gradeA: 0, gradeB: 0, gradeC: 0, gradeD: 0,
  hotLeads: 0, warmLeads: 0, coolLeads: 0, coldLeads: 0,
  averageScore: 0, totalPriorityLeads: 0, cToA: 0, cToARate: 0,
  upgradeCount: 0, downgradeCount: 0,
};

export default function TeamPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [snapshots, setSnapshots] = useState<LeadScoreSnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([loadLeads(), loadSnapshots()])
      .then(([l, s]) => { setLeads(l); setSnapshots(s); })
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  const metrics: TeamMetrics = loaded
    ? calculateTeamMetrics(leads, snapshots)
    : EMPTY_METRICS;

  const summaries: SalespersonSummary[] = loaded
    ? calculateSalespersonSummary(leads, snapshots, SALESPEOPLE)
    : [];

  const distribution: SalespersonLeadDistribution[] = loaded
    ? calculateLeadDistributionBySalesperson(leads, SALESPEOPLE)
    : [];

  const salesCount = SALESPEOPLE.filter((u) => u.role === "sales").length;

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <h1>Team Dashboard</h1>
          <p>ภาพรวมทีมขาย — Lead และ Performance แยกตามพนักงานขาย</p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/performance">📊 Performance</Link>
          <Link className="button secondary" href="/">กลับ Dashboard</Link>
        </div>
      </div>

      {!loaded ? (
        <div className="empty">กำลังโหลดข้อมูล...</div>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : (
        <div className="grid">
          <section className="section">
            <div className="section-header">
              <h2>KPI รวมทีม</h2>
              <span className="muted">{leads.length} leads · {salesCount} เซลล์</span>
            </div>
            <TeamKpiCards m={metrics} />
          </section>

          <section className="section">
            <div className="section-header">
              <h2>Performance แยกตามเซลล์</h2>
            </div>
            <SalespersonSummaryTable data={summaries} />
          </section>

          <section className="section">
            <div className="section-header">
              <h2>Lead Distribution (A/B/C/D) แยกตามเซลล์</h2>
            </div>
            <SalespersonDistributionTable data={distribution} />
          </section>
        </div>
      )}
    </main>
  );
}
