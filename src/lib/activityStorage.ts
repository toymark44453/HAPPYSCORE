import { supabase } from "./supabase";
import type { ActivityEntry, ActivityType } from "@/types/activity";

export async function loadActivities(): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    leadId: row.lead_id as string,
    type: row.type as ActivityType,
    note: row.note as string,
    createdAt: row.created_at as string,
    createdBy: row.created_by as string | undefined,
  }));
}

export async function getActivitiesForLead(leadId: string): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    leadId: row.lead_id as string,
    type: row.type as ActivityType,
    note: row.note as string,
    createdAt: row.created_at as string,
    createdBy: row.created_by as string | undefined,
  }));
}

export async function addActivity(
  leadId: string,
  type: ActivityType,
  note: string,
  createdBy?: string
): Promise<ActivityEntry> {
  const { data, error } = await supabase
    .from("activities")
    .insert({ lead_id: leadId, type, note: note.trim(), created_by: createdBy ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return {
    id: data.id as string,
    leadId: data.lead_id as string,
    type: data.type as ActivityType,
    note: data.note as string,
    createdAt: data.created_at as string,
    createdBy: data.created_by as string | undefined,
  };
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getLastContactDate(leadId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("activities")
    .select("created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.created_at as string;
}

export function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "เมื่อกี้";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days === 1) return "เมื่อวาน";
  if (days < 30) return `${days} วันที่แล้ว`;
  return `${Math.floor(days / 30)} เดือนที่แล้ว`;
}
