"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GradeMovementTable } from "@/components/GradeMovementTable";
import { LeadProgressTable } from "@/components/LeadProgressTable";
import { PerformanceKpiCards } from "@/components/PerformanceKpiCards";
import { SalesOwnerPerformanceTable } from "@/components/SalesOwnerPerformanceTable";
import { CurrentUserSelector } from "@/components/CurrentUserSelector";
import {
  buildLeadProgressEntries,
  calculatePerformanceMetrics,
  calculateSalesOwnerPerformance,
} from "@/lib/performance";
import { loadLeads } from "@/lib/storage";
import { loadSnapshots } from "@/lib/snapshotStorage";
import { getCurrentUser } from "@/lib/users";
import { getVisibleLeadsForUser } from "@/lib/visibilityFilter";
import type { Lead } from "@/types/lead";
import type { Salesperson } from "@/types/salesperson";
import type { LeadScoreSnapshot, PerformanceMetrics, SalesOwnerPerformance, LeadProgressEntry } from "@/types/performance";

export default function PerformancePage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [snapshots, setSnapshots] = useState<LeadScoreSnapshot[]>([]);
  const [currentUser, setCurrentUserState] = useState<Salesperson>(getCurrentUser());
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([loadLeads(), loadSnapshots()])
      .then(([l, s]) => { setAllLeads(l); setSnapshots(s); })
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  const visibleLeads = useMemo(
    () => getVisibleLeadsForUser(allLeads, currentUser),
    [allLeads, currentUser]
  );

  const metrics: PerformanceMetrics = loaded
    ? calculatePerformanceMetrics(visibleLeads, snapshots)
    : {
        totalLeads: 0, improvedLeads: 0, declinedLeads: 0, stableLeads: 0,
        improvedRate: 0, declinedRate: 0, stableRate: 0,
        cToA: 0, cToARate: 0, cToB: 0, cToBRate: 0,
        bToA: 0, bToARate: 0, dToC: 0, dToCRate: 0,
        totalUpgrade: 0, totalUpgradeRate: 0, totalDowngrade: 0, totalDowngradeRate: 0,
        averageScoreIncrease: 0, averageScoreDecrease: 0,
      };

  const salesPerf: SalesOwnerPerformance[] = loaded
    ? calculateSalesOwnerPerformance(visibleLeads, snapshots)
    : [];

  const progressEntries: LeadProgressEntry[] = loaded
    ? buildLeadProgressEntries(visibleLeads, snapshots)
    : [];

  return (
    <main className="app-shell">
      <div className="topbar">
        <div className="brand">
          <h1>Sales Performance</h1>
          <p>วัดผลทีมขาย — Lead ดีขึ้นกี่คน กี่เปอร์เซ็นต์</p>
        </div>
        <div className="actions">
          <CurrentUserSelector onChange={setCurrentUserState} />
          <Link className="button secondary" href="/team">👥 Team</Link>
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
              <h2>KPI Overview</h2>
              <span className="muted">
                {snapshots.length} snapshots · {visibleLeads.length} leads
                {currentUser.role !== "owner" ? ` · ${currentUser.name}` : " · ทีมทั้งหมด"}
              </span>
            </div>
            <PerformanceKpiCards m={metrics} />
          </section>

          <GradeMovementTable snapshots={snapshots} />

          <SalesOwnerPerformanceTable data={salesPerf} />

          <LeadProgressTable entries={progressEntries} />
        </div>
      )}
    </main>
  );
}
