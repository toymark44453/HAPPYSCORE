import type { Lead } from "@/types/lead";
import type { Salesperson } from "@/types/salesperson";

export function filterLeadsBySalesOwner(leads: Lead[], salesOwnerId: string): Lead[] {
  return leads.filter((lead) => lead.salesOwnerId === salesOwnerId);
}

export function getVisibleLeadsForUser(leads: Lead[], currentUser: Salesperson): Lead[] {
  if (currentUser.role === "owner") return leads;
  return filterLeadsBySalesOwner(leads, currentUser.id);
}
