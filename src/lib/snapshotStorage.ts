import { supabase } from "./supabase";
import type { Lead } from "@/types/lead";
import type { LeadScoreSnapshot } from "@/types/performance";

function rowToSnapshot(row: Record<string, unknown>): LeadScoreSnapshot {
  return {
    id: row.id as string,
    leadId: row.lead_id as string,
    salesOwner: row.sales_owner as string | undefined,
    previousTotalScore: row.previous_total_score as number | undefined,
    newTotalScore: row.new_total_score as number,
    previousGrade: row.previous_grade as LeadScoreSnapshot["previousGrade"],
    newGrade: row.new_grade as LeadScoreSnapshot["newGrade"],
    previousTemperature: row.previous_temperature as LeadScoreSnapshot["previousTemperature"],
    newTemperature: row.new_temperature as LeadScoreSnapshot["newTemperature"],
    previousSegment: row.previous_segment as LeadScoreSnapshot["previousSegment"],
    newSegment: row.new_segment as LeadScoreSnapshot["newSegment"],
    changedReason: row.changed_reason as string,
    changedFields: row.changed_fields as string[],
    createdAt: row.created_at as string,
  };
}

export async function loadSnapshots(): Promise<LeadScoreSnapshot[]> {
  const { data, error } = await supabase
    .from("score_snapshots")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToSnapshot(row as Record<string, unknown>));
}

export async function addSnapshot(snapshot: Omit<LeadScoreSnapshot, "id" | "createdAt">): Promise<void> {
  const { error } = await supabase.from("score_snapshots").insert({
    lead_id: snapshot.leadId,
    sales_owner: snapshot.salesOwner ?? null,
    previous_total_score: snapshot.previousTotalScore ?? null,
    new_total_score: snapshot.newTotalScore,
    previous_grade: snapshot.previousGrade ?? null,
    new_grade: snapshot.newGrade,
    previous_temperature: snapshot.previousTemperature ?? null,
    new_temperature: snapshot.newTemperature,
    previous_segment: snapshot.previousSegment ?? null,
    new_segment: snapshot.newSegment,
    changed_reason: snapshot.changedReason,
    changed_fields: snapshot.changedFields,
  });
  if (error) throw new Error(error.message);
}

export function buildFirstSnapshot(lead: Lead): Omit<LeadScoreSnapshot, "id" | "createdAt"> {
  return {
    leadId: lead.id,
    salesOwner: lead.salesOwner,
    previousTotalScore: undefined,
    newTotalScore: lead.totalScore,
    previousGrade: undefined,
    newGrade: lead.grade,
    previousTemperature: undefined,
    newTemperature: lead.temperature,
    previousSegment: undefined,
    newSegment: lead.segment,
    changedReason: "สร้าง Lead ใหม่",
    changedFields: [],
  };
}

export function buildUpdateSnapshot(
  previousLead: Lead,
  newLead: Lead
): Omit<LeadScoreSnapshot, "id" | "createdAt"> | null {
  const hasChange =
    previousLead.totalScore !== newLead.totalScore ||
    previousLead.grade !== newLead.grade ||
    previousLead.temperature !== newLead.temperature ||
    previousLead.segment !== newLead.segment;

  if (!hasChange) return null;

  const changedFields: string[] = [];
  if (previousLead.totalScore !== newLead.totalScore) changedFields.push("totalScore");
  if (previousLead.grade !== newLead.grade) changedFields.push("grade");
  if (previousLead.temperature !== newLead.temperature) changedFields.push("temperature");
  if (previousLead.segment !== newLead.segment) changedFields.push("segment");

  return {
    leadId: newLead.id,
    salesOwner: newLead.salesOwner,
    previousTotalScore: previousLead.totalScore,
    newTotalScore: newLead.totalScore,
    previousGrade: previousLead.grade,
    newGrade: newLead.grade,
    previousTemperature: previousLead.temperature,
    newTemperature: newLead.temperature,
    previousSegment: previousLead.segment,
    newSegment: newLead.segment,
    changedReason: `แก้ไข Lead (${changedFields.join(", ")})`,
    changedFields,
  };
}
