import { describe, expect, it } from "vitest";
import { getVisibleLeadsForUser, filterLeadsBySalesOwner } from "@/lib/visibilityFilter";
import {
  calculateTeamMetrics,
  calculateSalespersonSummary,
  calculateLeadDistributionBySalesperson,
} from "@/lib/teamMetrics";
import type { Lead } from "@/types/lead";
import type { Salesperson } from "@/types/salesperson";
import type { LeadScoreSnapshot } from "@/types/performance";

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

const owner: Salesperson = { id: "owner_01", name: "เจ้าของ", role: "owner", isActive: true };
const sales01: Salesperson = { id: "sales_01", name: "เซลล์ 1", role: "sales", isActive: true };
const sales02: Salesperson = { id: "sales_02", name: "เซลล์ 2", role: "sales", isActive: true };

const leadA: Lead = { ...baseLead, id: "la", salesOwnerId: "sales_01", grade: "A", temperature: "HOT", totalScore: 90 };
const leadB: Lead = { ...baseLead, id: "lb", salesOwnerId: "sales_01", grade: "C", temperature: "COOL", totalScore: 50 };
const leadC: Lead = { ...baseLead, id: "lc", salesOwnerId: "sales_02", grade: "B", temperature: "WARM", totalScore: 70 };

// --- filterLeadsBySalesOwner ---
describe("filterLeadsBySalesOwner", () => {
  it("คืนเฉพาะ Lead ของ sales_01", () => {
    const result = filterLeadsBySalesOwner([leadA, leadB, leadC], "sales_01");
    expect(result).toHaveLength(2);
    expect(result.every((l) => l.salesOwnerId === "sales_01")).toBe(true);
  });

  it("คืน [] ถ้าไม่มี Lead ของ sales_03", () => {
    const result = filterLeadsBySalesOwner([leadA, leadB, leadC], "sales_03");
    expect(result).toHaveLength(0);
  });
});

// --- getVisibleLeadsForUser ---
describe("getVisibleLeadsForUser", () => {
  it("Owner เห็น Lead ทั้งหมด", () => {
    const result = getVisibleLeadsForUser([leadA, leadB, leadC], owner);
    expect(result).toHaveLength(3);
  });

  it("Sales เห็นเฉพาะ Lead ของตัวเอง", () => {
    const result = getVisibleLeadsForUser([leadA, leadB, leadC], sales01);
    expect(result).toHaveLength(2);
    expect(result.every((l) => l.salesOwnerId === "sales_01")).toBe(true);
  });

  it("Sales ที่มี Lead 1 คนเห็น 1 Lead", () => {
    const result = getVisibleLeadsForUser([leadA, leadB, leadC], sales02);
    expect(result).toHaveLength(1);
    expect(result[0].salesOwnerId).toBe("sales_02");
  });
});

// --- calculateTeamMetrics ---
describe("calculateTeamMetrics", () => {
  it("คำนวณ totalLeads ถูกต้อง", () => {
    const m = calculateTeamMetrics([leadA, leadB, leadC], []);
    expect(m.totalLeads).toBe(3);
  });

  it("คำนวณ gradeA, hotLeads ถูกต้อง", () => {
    const m = calculateTeamMetrics([leadA, leadB, leadC], []);
    expect(m.gradeA).toBe(1);
    expect(m.hotLeads).toBe(1);
    expect(m.warmLeads).toBe(1);
    expect(m.coolLeads).toBe(1);
  });

  it("คำนวณ averageScore ถูกต้อง", () => {
    const m = calculateTeamMetrics([leadA, leadB, leadC], []);
    expect(m.averageScore).toBe(Math.round((90 + 50 + 70) / 3));
  });

  it("cToA นับจาก snapshots ถูกต้อง", () => {
    const s1: LeadScoreSnapshot = {
      id: "s1", leadId: "lb", previousTotalScore: 50, newTotalScore: 50,
      previousGrade: undefined, newGrade: "C", previousTemperature: undefined,
      newTemperature: "COOL", previousSegment: undefined, newSegment: "Low Priority",
      changedReason: "สร้าง Lead ใหม่", changedFields: [], createdAt: "2026-01-01T00:00:00Z",
    };
    const s2: LeadScoreSnapshot = {
      id: "s2", leadId: "lb", previousTotalScore: 50, newTotalScore: 85,
      previousGrade: "C", newGrade: "A", previousTemperature: "COOL",
      newTemperature: "HOT", previousSegment: "Low Priority", newSegment: "Ideal Customer",
      changedReason: "update", changedFields: ["grade"], createdAt: "2026-02-01T00:00:00Z",
    };
    const m = calculateTeamMetrics([leadA, leadB, leadC], [s1, s2]);
    expect(m.cToA).toBe(1);
    expect(m.upgradeCount).toBe(1);
  });

  it("ไม่มี leads คืน 0 ทั้งหมด", () => {
    const m = calculateTeamMetrics([], []);
    expect(m.totalLeads).toBe(0);
    expect(m.averageScore).toBe(0);
    expect(m.cToARate).toBe(0);
  });
});

// --- calculateSalespersonSummary ---
describe("calculateSalespersonSummary", () => {
  it("คำนวณ totalLeads แยกตามเซลล์ถูกต้อง", () => {
    const result = calculateSalespersonSummary([leadA, leadB, leadC], [], [sales01, sales02]);
    const s1 = result.find((r) => r.salesOwnerId === "sales_01")!;
    const s2 = result.find((r) => r.salesOwnerId === "sales_02")!;
    expect(s1.totalLeads).toBe(2);
    expect(s2.totalLeads).toBe(1);
  });

  it("คำนวณ gradeA, hotLeads แยกตามเซลล์ถูกต้อง", () => {
    const result = calculateSalespersonSummary([leadA, leadB, leadC], [], [sales01, sales02]);
    const s1 = result.find((r) => r.salesOwnerId === "sales_01")!;
    expect(s1.gradeA).toBe(1);
    expect(s1.gradeC).toBe(1);
    expect(s1.hotLeads).toBe(1);
  });

  it("owner ไม่ถูกรวมในผลลัพธ์", () => {
    const result = calculateSalespersonSummary([leadA, leadB, leadC], [], [owner, sales01, sales02]);
    expect(result.find((r) => r.salesOwnerId === "owner_01")).toBeUndefined();
    expect(result).toHaveLength(2);
  });
});

// --- calculateLeadDistributionBySalesperson ---
describe("calculateLeadDistributionBySalesperson", () => {
  it("คำนวณ distribution A/B/C/D ถูกต้อง", () => {
    const result = calculateLeadDistributionBySalesperson([leadA, leadB, leadC], [sales01, sales02]);
    const s1 = result.find((r) => r.salesOwnerId === "sales_01")!;
    expect(s1.gradeA).toBe(1);
    expect(s1.gradeC).toBe(1);
    expect(s1.total).toBe(2);
    const s2 = result.find((r) => r.salesOwnerId === "sales_02")!;
    expect(s2.gradeB).toBe(1);
    expect(s2.total).toBe(1);
  });

  it("เซลล์ที่ไม่มี Lead คืน total=0", () => {
    const sales03: Salesperson = { id: "sales_03", name: "เซลล์ 3", role: "sales", isActive: true };
    const result = calculateLeadDistributionBySalesperson([leadA, leadB], [sales03]);
    expect(result[0].total).toBe(0);
  });
});
