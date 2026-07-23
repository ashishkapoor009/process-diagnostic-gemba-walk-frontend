// Mirrors the Pydantic schemas in the Python backend (app/schemas/*.py).
// Kept in sync by hand - if the backend schema changes, update here too.

export interface ProcessMetadata {
  process_name: string;
  team_name: string;
  current_fte: number;
  current_volume: number;
  aht_minutes: number;
  lob: string;
  annual_fte_cost: number;
  pain_areas?: string | null;
  customer_complaints?: string | null;
  dependencies?: string | null;
  current_sla?: string | null;
  known_risks?: string | null;
  applications_used?: string | null;
  systems_used?: string | null;
  manual_activities?: string | null;
  automation_already_implemented?: string | null;
  compliance_requirements?: string | null;
}

export interface ProcessStepInput {
  step_number: number;
  step_name: string;
  description?: string;
  owner?: string | null;
  system_used?: string | null;
  input_data?: string | null;
  output_data?: string | null;
  is_decision?: boolean;
  cycle_time_minutes?: number | null;
}

export interface ProcessStepDiagnostic {
  step_number: number;
  step_name: string;
  purpose: string;
  owner: string;
  input_data: string;
  output_data: string;
  cycle_time_minutes: number;
  touch_time_minutes: number;
  wait_time_minutes: number;
  value_classification: "Value Added" | "Non-Value Added" | "Business Non-Value Added";
  business_risk: string;
  customer_impact: string;
  compliance_risk: string;
  lean_wastes: string[];
  root_cause: string;
  automation_score: number;
  ai_readiness_score: number;
  complexity_score: number;
  implementation_effort_days: number;
  savings_potential_pct: number;
  system_used?: string | null;
  is_decision: boolean;
}

export interface PrioritizationScore {
  business_impact: number;
  implementation_effort: number;
  cost: number;
  roi: number;
  risk: number;
  time_to_value_weeks: number;
}

export interface SavingsEstimate {
  time_savings_minutes_per_txn: number;
  fte_savings: number;
  annual_cost_savings: number;
  cycle_time_reduction_pct: number;
  aht_reduction_pct: number;
  quality_improvement_pct: number;
  sla_improvement_pct: number;
  productivity_increase_pct: number;
  assumptions: string[];
}

export interface Recommendation {
  id?: number | null;
  step_number?: number | null;
  category: string;
  sub_category?: string | null;
  title: string;
  description: string;
  rationale: string;
  proposed_by_agent: string;
  roadmap_horizon: string;
  complexity: string;
  risk_level: string;
  prioritization: PrioritizationScore;
  savings: SavingsEstimate;
  confidence_score: number;
  source_type: string;
  retrieved_context_refs: string[];
  reviewer_notes?: string | null;
  is_duplicate: boolean;
  reviewer_approved: boolean;
}

export interface SavingsSummary {
  total_recommendations: number;
  quick_win_count: number;
  strategic_count: number;
  total_fte_savings: number;
  in_year_savings: number;
  twelve_month_savings: number;
  months_remaining_in_year: number;
  annual_fte_cost: number;
  monthly_fte_cost: number;
  blended_efficiency_improvement_pct: number;
  target_efficiency_range_pct: string;
  meets_target: boolean;
  recommendations_by_category: Record<string, number>;
}

export interface ProcessSummary {
  id: number;
  process_name: string;
  team_name: string;
  lob: string;
  current_fte: number;
  current_volume: number;
  aht_minutes: number;
  created_at: string;
}

export interface ProcessDetail {
  metadata: ProcessMetadata;
  diagnostics: ProcessStepDiagnostic[];
  recommendations: Recommendation[];
  savings_summary: SavingsSummary;
  executive_summary: string;
  flow_mermaid_current: string;
  flow_mermaid_future: string;
}

export interface JobStartResponse {
  job_id: string;
  status: "queued";
}

export interface JobStatusResponse {
  job_id: string;
  status: "queued" | "running" | "completed" | "failed";
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  process_id?: number;
  error?: string;
  result?: {
    diagnostics_count: number;
    recommendations_count: number;
    executive_summary: string;
    savings_summary: SavingsSummary;
  };
}

// The three main categories every recommendation rolls up to, and their
// specific sub-category labels - mirrors app/schemas/enums.py.
export const MAIN_CATEGORY_MAP: Record<string, "People" | "Process" | "Technology"> = {
  Training: "People",
  "Change Management": "People",
  "Knowledge Management": "People",
  Lean: "Process",
  "Process Simplification": "Process",
  "Process Standardization": "Process",
  "SOP Improvement": "Process",
  "Business Rules": "Process",
  "Decision Simplification": "Process",
  "Governance & Control": "Process",
  Compliance: "Process",
};

export function mainCategoryFor(category: string): "People" | "Process" | "Technology" {
  return MAIN_CATEGORY_MAP[category] ?? "Technology";
}
