import type { Lead } from "@/types/lead";
import { mockLeads } from "@/data/mockLeads";

const STORAGE_KEY = "happy_leads_v0_1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadLeads(): Lead[] {
  if (!isBrowser()) return mockLeads;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveLeads(mockLeads);
    return mockLeads;
  }
  try {
    const parsed = JSON.parse(raw) as Lead[];
    return Array.isArray(parsed) ? parsed : mockLeads;
  } catch {
    return mockLeads;
  }
}

export function saveLeads(leads: Lead[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function upsertLead(lead: Lead): Lead[] {
  const leads = loadLeads();
  const next = leads.some((item) => item.id === lead.id)
    ? leads.map((item) => (item.id === lead.id ? lead : item))
    : [lead, ...leads];
  saveLeads(next);
  return next;
}

export function deleteLead(id: string): Lead[] {
  const next = loadLeads().filter((lead) => lead.id !== id);
  saveLeads(next);
  return next;
}
