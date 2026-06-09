import type { LeadGrade, LeadSegment, LeadTemperature } from "./lead";

export interface LeadScoreSnapshot {
  id: string;
  leadId: string;
  salesOwner?: string;
  previousTotalScore?: number;
  newTotalScore: number;
  previousGrade?: LeadGrade;
  newGrade: LeadGrade;
  previousTemperature?: LeadTemperature;
  newTemperature: LeadTemperature;
  previousSegment?: LeadSegment;
  newSegment: LeadSegment;
  changedReason: string;
  changedFields: string[];
  createdAt: string;
}

export type GradeMovementType =
  | "major_upgrade"
  | "upgrade"
  | "stable"
  | "downgrade"
  | "major_downgrade";

export type LeadProgressStatus =
  | "strongly_improved"
  | "improved"
  | "stable"
  | "declined"
  | "strongly_declined";

export interface PerformanceMetrics {
  totalLeads: number;
  improvedLeads: number;
  declinedLeads: number;
  stableLeads: number;
  improvedRate: number;
  declinedRate: number;
  stableRate: number;
  cToA: number;
  cToARate: number;
  cToB: number;
  cToBRate: number;
  bToA: number;
  bToARate: number;
  dToC: number;
  dToCRate: number;
  totalUpgrade: number;
  totalUpgradeRate: number;
  totalDowngrade: number;
  totalDowngradeRate: number;
  averageScoreIncrease: number;
  averageScoreDecrease: number;
}

export interface SalesOwnerPerformance {
  salesOwner: string;
  totalLeadsOwned: number;
  improvedLeads: number;
  declinedLeads: number;
  stableLeads: number;
  improvedRate: number;
  downgradeRate: number;
  cToA: number;
  cToB: number;
  bToA: number;
  averageScoreChange: number;
  hotLeadsCreated: number;
  gradeAConverted: number;
}

export interface LeadProgressEntry {
  leadId: string;
  customerName: string;
  salesOwner?: string;
  firstScore: number;
  latestScore: number;
  firstGrade: LeadGrade;
  latestGrade: LeadGrade;
  scoreDiff: number;
  movement: GradeMovementType;
  progressStatus: LeadProgressStatus;
  changedReason: string;
  updatedAt: string;
}
