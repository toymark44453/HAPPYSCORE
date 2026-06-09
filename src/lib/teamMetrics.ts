import type { Lead } from "@/types/lead";
import type { LeadScoreSnapshot } from "@/types/performance";
import type { Salesperson } from "@/types/salesperson";

export interface TeamMetrics {
  totalLeads: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  hotLeads: number;
  warmLeads: number;
  coolLeads: number;
  coldLeads: number;
  averageScore: number;
  totalPriorityLeads: number;
  cToA: number;
  cToARate: number;
  upgradeCount: number;
  downgradeCount: number;
}

export interface SalespersonSummary {
  salesOwnerId: string;
  salesOwnerName: string;
  totalLeads: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  hotLeads: number;
  warmLeads: number;
  coolLeads: number;
  coldLeads: number;
  averageScore: number;
  priorityLeads: number;
  cToA: number;
  cToB: number;
  bToA: number;
  upgradeRate: number;
  downgradeRate: number;
}

export interface SalespersonLeadDistribution {
  salesOwnerId: string;
  salesOwnerName: string;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  total: number;
}

const GRADE_IDX: Record<string, number> = { D: 0, C: 1, B: 2, A: 3 };

function safeRate(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 100 * 10) / 10;
}

function getLeadBounds(snapshots: LeadScoreSnapshot[]) {
  const grouped = new Map<string, LeadScoreSnapshot[]>();
  for (const s of snapshots) {
    if (!grouped.has(s.leadId)) grouped.set(s.leadId, []);
    grouped.get(s.leadId)!.push(s);
  }
  const bounds = new Map<string, { first: LeadScoreSnapshot; latest: LeadScoreSnapshot }>();
  for (const [id, snaps] of grouped) {
    const sorted = [...snaps].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    bounds.set(id, { first: sorted[0], latest: sorted[sorted.length - 1] });
  }
  return bounds;
}

export function calculateTeamMetrics(leads: Lead[], snapshots: LeadScoreSnapshot[]): TeamMetrics {
  const bounds = getLeadBounds(snapshots);
  let cToA = 0, upgradeCount = 0, downgradeCount = 0;

  for (const [, { first, latest }] of bounds) {
    if (first.id === latest.id) continue;
    const diff = (GRADE_IDX[latest.newGrade] ?? 0) - (GRADE_IDX[first.newGrade] ?? 0);
    if (diff > 0) upgradeCount++;
    if (diff < 0) downgradeCount++;
    if (first.newGrade === "C" && latest.newGrade === "A") cToA++;
  }

  const cLeads = leads.filter((l) => l.grade === "C").length;
  const avgScore =
    leads.length === 0
      ? 0
      : Math.round(leads.reduce((acc, l) => acc + l.totalScore, 0) / leads.length);

  return {
    totalLeads: leads.length,
    gradeA: leads.filter((l) => l.grade === "A").length,
    gradeB: leads.filter((l) => l.grade === "B").length,
    gradeC: leads.filter((l) => l.grade === "C").length,
    gradeD: leads.filter((l) => l.grade === "D").length,
    hotLeads: leads.filter((l) => l.temperature === "HOT").length,
    warmLeads: leads.filter((l) => l.temperature === "WARM").length,
    coolLeads: leads.filter((l) => l.temperature === "COOL").length,
    coldLeads: leads.filter((l) => l.temperature === "COLD").length,
    averageScore: avgScore,
    totalPriorityLeads: leads.filter((l) => l.temperature === "HOT" || l.temperature === "WARM").length,
    cToA,
    cToARate: safeRate(cToA, cLeads),
    upgradeCount,
    downgradeCount,
  };
}

export function calculateSalespersonSummary(
  leads: Lead[],
  snapshots: LeadScoreSnapshot[],
  salespeople: Salesperson[]
): SalespersonSummary[] {
  const bounds = getLeadBounds(snapshots);

  return salespeople
    .filter((s) => s.role === "sales")
    .map((sp) => {
      const myLeads = leads.filter((l) => l.salesOwnerId === sp.id);
      const myLeadIds = new Set(myLeads.map((l) => l.id));

      let cToA = 0, cToB = 0, bToA = 0, upgradeCount = 0, downgradeCount = 0;

      for (const [leadId, { first, latest }] of bounds) {
        if (!myLeadIds.has(leadId) || first.id === latest.id) continue;
        const diff = (GRADE_IDX[latest.newGrade] ?? 0) - (GRADE_IDX[first.newGrade] ?? 0);
        if (diff > 0) upgradeCount++;
        if (diff < 0) downgradeCount++;
        if (first.newGrade === "C" && latest.newGrade === "A") cToA++;
        if (first.newGrade === "C" && latest.newGrade === "B") cToB++;
        if (first.newGrade === "B" && latest.newGrade === "A") bToA++;
      }

      const tracked = myLeads.length;
      const avgScore =
        myLeads.length === 0
          ? 0
          : Math.round(myLeads.reduce((acc, l) => acc + l.totalScore, 0) / myLeads.length);

      return {
        salesOwnerId: sp.id,
        salesOwnerName: sp.name,
        totalLeads: myLeads.length,
        gradeA: myLeads.filter((l) => l.grade === "A").length,
        gradeB: myLeads.filter((l) => l.grade === "B").length,
        gradeC: myLeads.filter((l) => l.grade === "C").length,
        gradeD: myLeads.filter((l) => l.grade === "D").length,
        hotLeads: myLeads.filter((l) => l.temperature === "HOT").length,
        warmLeads: myLeads.filter((l) => l.temperature === "WARM").length,
        coolLeads: myLeads.filter((l) => l.temperature === "COOL").length,
        coldLeads: myLeads.filter((l) => l.temperature === "COLD").length,
        averageScore: avgScore,
        priorityLeads: myLeads.filter((l) => l.temperature === "HOT" || l.temperature === "WARM").length,
        cToA,
        cToB,
        bToA,
        upgradeRate: safeRate(upgradeCount, tracked),
        downgradeRate: safeRate(downgradeCount, tracked),
      };
    });
}

export function calculateLeadDistributionBySalesperson(
  leads: Lead[],
  salespeople: Salesperson[]
): SalespersonLeadDistribution[] {
  return salespeople
    .filter((s) => s.role === "sales")
    .map((sp) => {
      const myLeads = leads.filter((l) => l.salesOwnerId === sp.id);
      return {
        salesOwnerId: sp.id,
        salesOwnerName: sp.name,
        gradeA: myLeads.filter((l) => l.grade === "A").length,
        gradeB: myLeads.filter((l) => l.grade === "B").length,
        gradeC: myLeads.filter((l) => l.grade === "C").length,
        gradeD: myLeads.filter((l) => l.grade === "D").length,
        total: myLeads.length,
      };
    });
}
