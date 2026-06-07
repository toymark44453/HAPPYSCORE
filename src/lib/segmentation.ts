import type { LeadSegment } from "@/types/lead";

export function calculateSegment(fitScore: number, interestScore: number): LeadSegment {
  if (fitScore >= 30 && interestScore >= 45) return "Ideal Customer";
  if (fitScore >= 30 && interestScore < 45) return "Nurture Target";
  if (fitScore < 30 && interestScore >= 45) return "Quick Win";
  return "Low Priority";
}
