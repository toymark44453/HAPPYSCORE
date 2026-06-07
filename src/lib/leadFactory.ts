import type { Lead, LeadInput } from "@/types/lead";
import { calculateGrade, calculateTemperature, clampScore } from "@/lib/grading";
import { calculateSegment } from "@/lib/segmentation";
import { generateNextStep, generateRecommendation } from "@/lib/recommendations";
import { calculatePriorityScore } from "@/lib/priority";
import { calculateScores, generateRiskFlags, generateScoringReasons } from "@/lib/scoring";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function buildScoredLead(input: LeadInput, existing?: Pick<Lead, "id" | "createdAt">): Lead {
  const now = new Date().toISOString();
  const scores = calculateScores(input);
  const totalScore = clampScore(scores.totalScore);
  const grade = calculateGrade(totalScore);
  const temperature = calculateTemperature(totalScore);
  const segment = calculateSegment(scores.fitScore, scores.interestScore);
  const riskFlags = generateRiskFlags(input);
  const draft: Lead = {
    ...input,
    id: existing?.id ?? createId(),
    ...scores,
    totalScore,
    grade,
    temperature,
    segment,
    riskFlags,
    scoringReasons: generateScoringReasons(input),
    recommendation: generateRecommendation(temperature, riskFlags),
    nextStep: generateNextStep(temperature, riskFlags),
    priorityScore: 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
  return {
    ...draft,
    priorityScore: calculatePriorityScore(draft)
  };
}

export function toLeadInput(lead: Lead): LeadInput {
  return {
    customerName: lead.customerName,
    phoneNumber: lead.phoneNumber,
    lineId: lead.lineId,
    province: lead.province,
    district: lead.district,
    installationAddress: lead.installationAddress,
    projectName: lead.projectName,
    leadSource: lead.leadSource,
    salesOwner: lead.salesOwner,
    customerNote: lead.customerNote,
    installationLocationType: lead.installationLocationType,
    projectValueLevel: lead.projectValueLevel,
    sitePhotoStatus: lead.sitePhotoStatus,
    urgencyStatus: lead.urgencyStatus,
    quotationStatus: lead.quotationStatus,
    communicationStatus: lead.communicationStatus,
    siteSurveyStatus: lead.siteSurveyStatus
  };
}
