import { describe, expect, it } from "vitest";
import {
  calculateGradeMovement,
  calculateLeadProgressStatus,
  calculatePerformanceMetrics,
  calculateSalesOwnerPerformance,
} from "@/lib/performance";
import type { Lead } from "@/types/lead";
import type { LeadScoreSnapshot } from "@/types/performance";

function makeSnapshot(
  leadId: string,
  fromGrade: Lead["grade"],
  toGrade: Lead["grade"],
  fromScore: number,
  toScore: number,
  createdAt: string,
  salesOwner?: string
): LeadScoreSnapshot {
  return {
    id: `snap_${leadId}_${createdAt}`,
    leadId,
    salesOwner,
    previousTotalScore: fromScore,
    newTotalScore: toScore,
    previousGrade: fromGrade,
    newGrade: toGrade,
    previousTemperature: "COLD",
    newTemperature: "HOT",
    previousSegment: "Low Priority",
    newSegment: "Ideal Customer",
    changedReason: "test",
    changedFields: ["grade"],
    createdAt,
  };
}

function makeFirstSnapshot(
  leadId: string,
  grade: Lead["grade"],
  score: number,
  salesOwner?: string
): LeadScoreSnapshot {
  return {
    id: `snap_${leadId}_first`,
    leadId,
    salesOwner,
    previousTotalScore: undefined,
    newTotalScore: score,
    previousGrade: undefined,
    newGrade: grade,
    previousTemperature: undefined,
    newTemperature: "COLD",
    previousSegment: undefined,
    newSegment: "Low Priority",
    changedReason: "สร้าง Lead ใหม่",
    changedFields: [],
    createdAt: "2026-01-01T00:00:00Z",
  };
}

const baseLead: Lead = {
  id: "l1",
  customerName: "ทดสอบ",
  pipelineStage: "new",
  installationLocationType: "bangkok_metropolitan",
  projectValueLevel: "luxury_over_6m",
  sitePhotoStatus: "detailed_with_measurement",
  urgencyStatus: "within_1_month",
  quotationStatus: "quoted_and_price_accepted",
  communicationStatus: "highly_responsive",
  siteSurveyStatus: "scheduled_easy_site",
  installationLocationScore: 20,
  projectValueScore: 10,
  sitePhotoScore: 10,
  urgencyScore: 20,
  quotationAcceptanceScore: 20,
  communicationScore: 10,
  siteSurveyScore: 10,
  fitScore: 40,
  interestScore: 60,
  totalScore: 100,
  priorityScore: 100,
  grade: "A",
  temperature: "HOT",
  segment: "Ideal Customer",
  riskFlags: [],
  scoringReasons: [],
  recommendation: "",
  nextStep: "",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

// --- Grade Movement ---
describe("calculateGradeMovement", () => {
  it("C → A = major_upgrade", () => {
    expect(calculateGradeMovement("C", "A")).toBe("major_upgrade");
  });
  it("D → B = major_upgrade", () => {
    expect(calculateGradeMovement("D", "B")).toBe("major_upgrade");
  });
  it("C → B = upgrade", () => {
    expect(calculateGradeMovement("C", "B")).toBe("upgrade");
  });
  it("B → A = upgrade", () => {
    expect(calculateGradeMovement("B", "A")).toBe("upgrade");
  });
  it("D → C = upgrade", () => {
    expect(calculateGradeMovement("D", "C")).toBe("upgrade");
  });
  it("A → A = stable", () => {
    expect(calculateGradeMovement("A", "A")).toBe("stable");
  });
  it("A → B = downgrade", () => {
    expect(calculateGradeMovement("A", "B")).toBe("downgrade");
  });
  it("B → C = downgrade", () => {
    expect(calculateGradeMovement("B", "C")).toBe("downgrade");
  });
  it("A → C = major_downgrade", () => {
    expect(calculateGradeMovement("A", "C")).toBe("major_downgrade");
  });
  it("B → D = major_downgrade", () => {
    expect(calculateGradeMovement("B", "D")).toBe("major_downgrade");
  });
});

// --- Lead Progress Status ---
describe("calculateLeadProgressStatus", () => {
  it("คะแนนเพิ่ม 15+ = strongly_improved", () => {
    expect(calculateLeadProgressStatus(40, 55, "C", "C")).toBe("strongly_improved");
  });
  it("Grade ขึ้น 2 ขั้น = strongly_improved", () => {
    expect(calculateLeadProgressStatus(30, 85, "C", "A")).toBe("strongly_improved");
  });
  it("คะแนนเพิ่ม 5-14 = improved", () => {
    expect(calculateLeadProgressStatus(40, 50, "C", "C")).toBe("improved");
  });
  it("Grade ขึ้น 1 ขั้น = improved", () => {
    expect(calculateLeadProgressStatus(58, 65, "C", "B")).toBe("improved");
  });
  it("คะแนนเปลี่ยน -4 ถึง +4 = stable", () => {
    expect(calculateLeadProgressStatus(50, 52, "C", "C")).toBe("stable");
    expect(calculateLeadProgressStatus(50, 47, "C", "C")).toBe("stable");
  });
  it("คะแนนลด 5-14 = declined", () => {
    expect(calculateLeadProgressStatus(50, 40, "C", "C")).toBe("declined");
  });
  it("Grade ลด 1 ขั้น = declined", () => {
    expect(calculateLeadProgressStatus(60, 55, "B", "C")).toBe("declined");
  });
  it("คะแนนลด 15+ = strongly_declined", () => {
    expect(calculateLeadProgressStatus(60, 44, "B", "C")).toBe("strongly_declined");
  });
});

// --- Performance Metrics ---
describe("calculatePerformanceMetrics", () => {
  it("ไม่มี snapshot ให้ return ค่า 0 ทั้งหมด ไม่ crash", () => {
    const m = calculatePerformanceMetrics([baseLead], []);
    expect(m.totalLeads).toBe(1);
    expect(m.improvedLeads).toBe(0);
    expect(m.cToA).toBe(0);
    expect(m.improvedRate).toBe(0);
  });

  it("ตัวหารเป็น 0 ต้อง return 0", () => {
    const m = calculatePerformanceMetrics([], []);
    expect(m.cToARate).toBe(0);
    expect(m.improvedRate).toBe(0);
  });

  it("C → A นับถูกต้อง", () => {
    const lead = { ...baseLead, id: "l1", grade: "A" as const };
    const s1 = makeFirstSnapshot("l1", "C", 40);
    const s2 = makeSnapshot("l1", "C", "A", 40, 85, "2026-02-01T00:00:00Z");
    const m = calculatePerformanceMetrics([lead], [s1, s2]);
    expect(m.cToA).toBe(1);
    expect(m.improvedLeads).toBe(1);
  });

  it("C → B นับถูกต้อง", () => {
    const lead = { ...baseLead, id: "l2", grade: "B" as const };
    const s1 = makeFirstSnapshot("l2", "C", 40);
    const s2 = makeSnapshot("l2", "C", "B", 40, 65, "2026-02-01T00:00:00Z");
    const m = calculatePerformanceMetrics([lead], [s1, s2]);
    expect(m.cToB).toBe(1);
  });

  it("B → A นับถูกต้อง", () => {
    const lead = { ...baseLead, id: "l3", grade: "A" as const };
    const s1 = makeFirstSnapshot("l3", "B", 65);
    const s2 = makeSnapshot("l3", "B", "A", 65, 85, "2026-02-01T00:00:00Z");
    const m = calculatePerformanceMetrics([lead], [s1, s2]);
    expect(m.bToA).toBe(1);
  });

  it("Upgrade Rate คำนวณถูกต้อง", () => {
    const l1 = { ...baseLead, id: "u1", grade: "A" as const };
    const l2 = { ...baseLead, id: "u2", grade: "B" as const };
    const snapshots = [
      makeFirstSnapshot("u1", "C", 40),
      makeSnapshot("u1", "C", "A", 40, 85, "2026-02-01T00:00:00Z"),
      makeFirstSnapshot("u2", "B", 65),
      makeSnapshot("u2", "B", "C", 65, 45, "2026-02-01T00:00:00Z"),
    ];
    const m = calculatePerformanceMetrics([l1, l2], snapshots);
    expect(m.totalUpgrade).toBe(1);
    expect(m.totalDowngrade).toBe(1);
    expect(m.totalUpgradeRate).toBe(50);
    expect(m.totalDowngradeRate).toBe(50);
  });
});

// --- Sales Owner Performance ---
describe("calculateSalesOwnerPerformance", () => {
  it("แยก performance ตาม salesOwner ได้ถูกต้อง", () => {
    const l1 = { ...baseLead, id: "o1", grade: "A" as const, salesOwner: "สมชาย" };
    const l2 = { ...baseLead, id: "o2", grade: "B" as const, salesOwner: "สมหญิง" };
    const snapshots = [
      makeFirstSnapshot("o1", "C", 40, "สมชาย"),
      makeSnapshot("o1", "C", "A", 40, 85, "2026-02-01T00:00:00Z", "สมชาย"),
      makeFirstSnapshot("o2", "B", 65, "สมหญิง"),
    ];
    const perf = calculateSalesOwnerPerformance([l1, l2], snapshots);
    const somchai = perf.find((p) => p.salesOwner === "สมชาย")!;
    expect(somchai.cToA).toBe(1);
    expect(somchai.improvedLeads).toBe(1);
    const somying = perf.find((p) => p.salesOwner === "สมหญิง")!;
    expect(somying.totalLeadsOwned).toBe(1);
  });
});
