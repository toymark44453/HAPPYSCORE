import type { Lead, LeadGrade } from "@/types/lead";
import type {
  GradeMovementType,
  LeadProgressEntry,
  LeadProgressStatus,
  LeadScoreSnapshot,
  PerformanceMetrics,
  SalesOwnerPerformance,
} from "@/types/performance";

const GRADE_INDEX: Record<LeadGrade, number> = { D: 0, C: 1, B: 2, A: 3 };

export function gradeToIndex(grade: LeadGrade): number {
  return GRADE_INDEX[grade];
}

export function calculateGradeMovement(
  previousGrade: LeadGrade,
  newGrade: LeadGrade
): GradeMovementType {
  const diff = gradeToIndex(newGrade) - gradeToIndex(previousGrade);
  if (diff >= 2) return "major_upgrade";
  if (diff === 1) return "upgrade";
  if (diff === 0) return "stable";
  if (diff === -1) return "downgrade";
  return "major_downgrade";
}

export function calculateLeadProgressStatus(
  previousTotalScore: number,
  newTotalScore: number,
  previousGrade: LeadGrade,
  newGrade: LeadGrade
): LeadProgressStatus {
  const scoreDiff = newTotalScore - previousTotalScore;
  const gradeDiff = gradeToIndex(newGrade) - gradeToIndex(previousGrade);

  if (scoreDiff >= 15 || gradeDiff >= 2) return "strongly_improved";
  if (scoreDiff >= 5 || gradeDiff >= 1) return "improved";
  if (scoreDiff <= -15 || gradeDiff <= -2) return "strongly_declined";
  if (scoreDiff <= -5 || gradeDiff <= -1) return "declined";
  return "stable";
}

function safeRate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100 * 10) / 10;
}

// For each lead, get first and latest snapshots (sorted by createdAt)
function getLeadSnapshotBounds(
  snapshots: LeadScoreSnapshot[]
): Map<string, { first: LeadScoreSnapshot; latest: LeadScoreSnapshot }> {
  const grouped = new Map<string, LeadScoreSnapshot[]>();
  for (const s of snapshots) {
    if (!grouped.has(s.leadId)) grouped.set(s.leadId, []);
    grouped.get(s.leadId)!.push(s);
  }

  const bounds = new Map<string, { first: LeadScoreSnapshot; latest: LeadScoreSnapshot }>();
  for (const [leadId, snaps] of grouped) {
    const sorted = [...snaps].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    bounds.set(leadId, { first: sorted[0], latest: sorted[sorted.length - 1] });
  }
  return bounds;
}

export function calculatePerformanceMetrics(
  leads: Lead[],
  snapshots: LeadScoreSnapshot[]
): PerformanceMetrics {
  const totalLeads = leads.length;
  const bounds = getLeadSnapshotBounds(snapshots);

  // Only count leads that have been updated (>= 2 snapshots = have movement)
  const movedLeads = [...bounds.entries()].filter(
    ([, { first, latest }]) => first.id !== latest.id
  );

  let improved = 0, declined = 0, stable = 0;
  let cToA = 0, cToB = 0, bToA = 0, dToC = 0;
  let totalUpgrade = 0, totalDowngrade = 0;
  const scoreIncreases: number[] = [];
  const scoreDecreases: number[] = [];

  for (const [, { first, latest }] of movedLeads) {
    const fromGrade = first.newGrade;
    const toGrade = latest.newGrade;
    const scoreDiff = latest.newTotalScore - first.newTotalScore;
    const progress = calculateLeadProgressStatus(
      first.newTotalScore,
      latest.newTotalScore,
      fromGrade,
      toGrade
    );

    if (progress === "improved" || progress === "strongly_improved") {
      improved++;
      totalUpgrade++;
      scoreIncreases.push(scoreDiff);
    } else if (progress === "declined" || progress === "strongly_declined") {
      declined++;
      totalDowngrade++;
      scoreDecreases.push(Math.abs(scoreDiff));
    } else {
      stable++;
    }

    if (fromGrade === "C" && toGrade === "A") cToA++;
    if (fromGrade === "C" && toGrade === "B") cToB++;
    if (fromGrade === "B" && toGrade === "A") bToA++;
    if (fromGrade === "D" && toGrade === "C") dToC++;
  }

  // Stable leads = leads with only 1 snapshot or no change
  const stableTotal = stable + (totalLeads - movedLeads.length);
  const trackedLeads = movedLeads.length;

  const cLeads = leads.filter((l) => l.grade === "C").length;
  const bLeads = leads.filter((l) => l.grade === "B").length;

  return {
    totalLeads,
    improvedLeads: improved,
    declinedLeads: declined,
    stableLeads: stableTotal,
    improvedRate: safeRate(improved, trackedLeads),
    declinedRate: safeRate(declined, trackedLeads),
    stableRate: safeRate(stableTotal, totalLeads),
    cToA,
    cToARate: safeRate(cToA, cLeads),
    cToB,
    cToBRate: safeRate(cToB, cLeads),
    bToA,
    bToARate: safeRate(bToA, bLeads),
    dToC,
    dToCRate: safeRate(dToC, leads.filter((l) => l.grade === "D").length),
    totalUpgrade,
    totalUpgradeRate: safeRate(totalUpgrade, trackedLeads),
    totalDowngrade,
    totalDowngradeRate: safeRate(totalDowngrade, trackedLeads),
    averageScoreIncrease:
      scoreIncreases.length === 0
        ? 0
        : Math.round(scoreIncreases.reduce((a, b) => a + b, 0) / scoreIncreases.length),
    averageScoreDecrease:
      scoreDecreases.length === 0
        ? 0
        : Math.round(scoreDecreases.reduce((a, b) => a + b, 0) / scoreDecreases.length),
  };
}

export function calculateSalesOwnerPerformance(
  leads: Lead[],
  snapshots: LeadScoreSnapshot[]
): SalesOwnerPerformance[] {
  const bounds = getLeadSnapshotBounds(snapshots);
  const owners = new Set(leads.map((l) => l.salesOwner ?? "ไม่ระบุ"));

  return [...owners].map((owner) => {
    const ownerLeads = leads.filter((l) => (l.salesOwner ?? "ไม่ระบุ") === owner);
    const ownerLeadIds = new Set(ownerLeads.map((l) => l.id));

    let improved = 0, declined = 0, stable = 0;
    let cToA = 0, cToB = 0, bToA = 0;
    const scoreChanges: number[] = [];

    for (const [leadId, { first, latest }] of bounds) {
      if (!ownerLeadIds.has(leadId)) continue;
      if (first.id === latest.id) { stable++; continue; }

      const scoreDiff = latest.newTotalScore - first.newTotalScore;
      scoreChanges.push(scoreDiff);

      const progress = calculateLeadProgressStatus(
        first.newTotalScore, latest.newTotalScore, first.newGrade, latest.newGrade
      );

      if (progress === "improved" || progress === "strongly_improved") improved++;
      else if (progress === "declined" || progress === "strongly_declined") declined++;
      else stable++;

      if (first.newGrade === "C" && latest.newGrade === "A") cToA++;
      if (first.newGrade === "C" && latest.newGrade === "B") cToB++;
      if (first.newGrade === "B" && latest.newGrade === "A") bToA++;
    }

    const tracked = ownerLeads.length;
    const avgChange =
      scoreChanges.length === 0
        ? 0
        : Math.round(scoreChanges.reduce((a, b) => a + b, 0) / scoreChanges.length);

    return {
      salesOwner: owner,
      totalLeadsOwned: ownerLeads.length,
      improvedLeads: improved,
      declinedLeads: declined,
      stableLeads: stable + (ownerLeads.length - (improved + declined + stable)),
      improvedRate: safeRate(improved, tracked),
      downgradeRate: safeRate(declined, tracked),
      cToA,
      cToB,
      bToA,
      averageScoreChange: avgChange,
      hotLeadsCreated: ownerLeads.filter((l) => l.temperature === "HOT").length,
      gradeAConverted: ownerLeads.filter((l) => l.grade === "A").length,
    };
  });
}

export function buildLeadProgressEntries(
  leads: Lead[],
  snapshots: LeadScoreSnapshot[]
): LeadProgressEntry[] {
  const bounds = getLeadSnapshotBounds(snapshots);
  const leadMap = new Map(leads.map((l) => [l.id, l]));
  const entries: LeadProgressEntry[] = [];

  for (const [leadId, { first, latest }] of bounds) {
    if (first.id === latest.id) continue; // no change
    const lead = leadMap.get(leadId);
    if (!lead) continue;

    const scoreDiff = latest.newTotalScore - first.newTotalScore;
    entries.push({
      leadId,
      customerName: lead.customerName,
      salesOwner: lead.salesOwner,
      firstScore: first.newTotalScore,
      latestScore: latest.newTotalScore,
      firstGrade: first.newGrade,
      latestGrade: latest.newGrade,
      scoreDiff,
      movement: calculateGradeMovement(first.newGrade, latest.newGrade),
      progressStatus: calculateLeadProgressStatus(
        first.newTotalScore, latest.newTotalScore, first.newGrade, latest.newGrade
      ),
      changedReason: latest.changedReason,
      updatedAt: latest.createdAt,
    });
  }

  return entries.sort((a, b) => Math.abs(b.scoreDiff) - Math.abs(a.scoreDiff));
}
