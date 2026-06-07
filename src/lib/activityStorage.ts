import type { ActivityEntry, ActivityType } from "@/types/activity";

const STORAGE_KEY = "happy_activities_v0_1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadActivities(): ActivityEntry[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ActivityEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveActivities(entries: ActivityEntry[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getActivitiesForLead(leadId: string): ActivityEntry[] {
  return loadActivities()
    .filter((a) => a.leadId === leadId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addActivity(
  leadId: string,
  type: ActivityType,
  note: string,
  createdBy?: string
): ActivityEntry {
  const entry: ActivityEntry = {
    id: crypto.randomUUID(),
    leadId,
    type,
    note: note.trim(),
    createdAt: new Date().toISOString(),
    createdBy,
  };
  const all = loadActivities();
  saveActivities([entry, ...all]);
  return entry;
}

export function deleteActivity(id: string): void {
  saveActivities(loadActivities().filter((a) => a.id !== id));
}

export function getLastContactDate(leadId: string): string | null {
  const entries = getActivitiesForLead(leadId);
  return entries.length > 0 ? entries[0].createdAt : null;
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
  const months = Math.floor(days / 30);
  return `${months} เดือนที่แล้ว`;
}
