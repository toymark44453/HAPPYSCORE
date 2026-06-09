import { supabase } from "./supabase";
import type { Lead } from "@/types/lead";

// snake_case DB row → camelCase Lead
function rowToLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    customerName: row.customer_name as string,
    phoneNumber: row.phone_number as string | undefined,
    lineId: row.line_id as string | undefined,
    province: row.province as string | undefined,
    district: row.district as string | undefined,
    installationAddress: row.installation_address as string | undefined,
    projectName: row.project_name as string | undefined,
    leadSource: row.lead_source as string | undefined,
    salesOwner: row.sales_owner as string | undefined,
    customerNote: row.customer_note as string | undefined,
    pipelineStage: (row.pipeline_stage as Lead["pipelineStage"]) ?? "new",
    installationLocationType: row.installation_location_type as Lead["installationLocationType"],
    projectValueLevel: row.project_value_level as Lead["projectValueLevel"],
    sitePhotoStatus: row.site_photo_status as Lead["sitePhotoStatus"],
    urgencyStatus: row.urgency_status as Lead["urgencyStatus"],
    quotationStatus: row.quotation_status as Lead["quotationStatus"],
    communicationStatus: row.communication_status as Lead["communicationStatus"],
    siteSurveyStatus: row.site_survey_status as Lead["siteSurveyStatus"],
    installationLocationScore: row.installation_location_score as number,
    projectValueScore: row.project_value_score as number,
    sitePhotoScore: row.site_photo_score as number,
    urgencyScore: row.urgency_score as number,
    quotationAcceptanceScore: row.quotation_acceptance_score as number,
    communicationScore: row.communication_score as number,
    siteSurveyScore: row.site_survey_score as number,
    fitScore: row.fit_score as number,
    interestScore: row.interest_score as number,
    totalScore: row.total_score as number,
    priorityScore: row.priority_score as number,
    grade: row.grade as Lead["grade"],
    temperature: row.temperature as Lead["temperature"],
    segment: row.segment as Lead["segment"],
    riskFlags: row.risk_flags as Lead["riskFlags"],
    scoringReasons: row.scoring_reasons as string[],
    recommendation: row.recommendation as string,
    nextStep: row.next_step as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// camelCase Lead → snake_case DB row
function leadToRow(lead: Lead) {
  return {
    id: lead.id,
    customer_name: lead.customerName,
    phone_number: lead.phoneNumber ?? null,
    line_id: lead.lineId ?? null,
    province: lead.province ?? null,
    district: lead.district ?? null,
    installation_address: lead.installationAddress ?? null,
    project_name: lead.projectName ?? null,
    lead_source: lead.leadSource ?? null,
    sales_owner: lead.salesOwner ?? null,
    customer_note: lead.customerNote ?? null,
    pipeline_stage: lead.pipelineStage,
    installation_location_type: lead.installationLocationType,
    project_value_level: lead.projectValueLevel,
    site_photo_status: lead.sitePhotoStatus,
    urgency_status: lead.urgencyStatus,
    quotation_status: lead.quotationStatus,
    communication_status: lead.communicationStatus,
    site_survey_status: lead.siteSurveyStatus,
    installation_location_score: lead.installationLocationScore,
    project_value_score: lead.projectValueScore,
    site_photo_score: lead.sitePhotoScore,
    urgency_score: lead.urgencyScore,
    quotation_acceptance_score: lead.quotationAcceptanceScore,
    communication_score: lead.communicationScore,
    site_survey_score: lead.siteSurveyScore,
    fit_score: lead.fitScore,
    interest_score: lead.interestScore,
    total_score: lead.totalScore,
    priority_score: lead.priorityScore,
    grade: lead.grade,
    temperature: lead.temperature,
    segment: lead.segment,
    risk_flags: lead.riskFlags,
    scoring_reasons: lead.scoringReasons,
    recommendation: lead.recommendation,
    next_step: lead.nextStep,
    created_at: lead.createdAt,
  };
}

export async function loadLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToLead(row as Record<string, unknown>));
}

export async function upsertLead(lead: Lead): Promise<Lead[]> {
  const { error } = await supabase
    .from("leads")
    .upsert(leadToRow(lead), { onConflict: "id" });

  if (error) throw new Error(error.message);
  return loadLeads();
}

export async function deleteLead(id: string): Promise<Lead[]> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return loadLeads();
}
