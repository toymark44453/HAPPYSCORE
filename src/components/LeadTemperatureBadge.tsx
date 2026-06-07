import type { LeadTemperature } from "@/types/lead";

export function LeadTemperatureBadge({ temperature }: { temperature: LeadTemperature }) {
  return <span className={`badge ${temperature.toLowerCase()}`}>{temperature}</span>;
}
