import type { LeadGrade, LeadTemperature } from "@/types/lead";

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

export function calculateGrade(totalScore: number): LeadGrade {
  const score = clampScore(totalScore);
  if (score >= 80) return "A";
  if (score >= 59) return "B";
  if (score >= 30) return "C";
  return "D";
}

export function calculateTemperature(totalScore: number): LeadTemperature {
  const score = clampScore(totalScore);
  if (score >= 80) return "HOT";
  if (score >= 60) return "WARM";
  if (score >= 40) return "COOL";
  return "COLD";
}
