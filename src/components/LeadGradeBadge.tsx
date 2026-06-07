import type { LeadGrade } from "@/types/lead";

export function LeadGradeBadge({ grade }: { grade: LeadGrade }) {
  return <span className={`badge ${grade.toLowerCase()}`}>Grade {grade}</span>;
}
