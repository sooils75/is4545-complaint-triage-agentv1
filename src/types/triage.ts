export type ComplaintCategory =
  | "Communication"
  | "Scheduling"
  | "Wait Time"
  | "Technology / Patient Portal"
  | "Billing"
  | "Clinical Care"
  | "Discharge and Follow-Up"
  | "Accessibility and Equity"
  | "Patient Safety"
  | "Privacy or Security"
  | "Staff Conduct"
  | "Other";

export type SeverityLevel =
  | "LEVEL 1 – Low"
  | "LEVEL 2 – Moderate"
  | "LEVEL 3 – High"
  | "LEVEL 4 – Critical";

export type RiskType =
  | "Patient Safety Risk"
  | "Clinical Risk"
  | "Compliance Risk"
  | "Privacy Risk"
  | "Accessibility Risk"
  | "Equity Risk"
  | "Reputational Risk"
  | "Operational Risk";

export type EscalationDepartment =
  | "Patient Experience Team"
  | "Nursing Leadership"
  | "Physician Leadership"
  | "Quality Improvement Team"
  | "Compliance Office"
  | "Information Technology"
  | "Revenue Cycle / Billing"
  | "Accessibility Coordinator"
  | "Risk Management"
  | "Executive Review";

export type EscalationPriority = "Routine" | "Priority" | "Immediate";

export type HumanReviewStatus =
  | "AI Review Only"
  | "Human Review Recommended"
  | "Human Review Required";

export type ComplaintSource =
  | "Patient Portal"
  | "Survey Comment"
  | "Grievance Report"
  | "Online Review"
  | "Feedback Submission"
  | "In-Person / Phone"
  | "External Agency / Ombudsman";

export interface RiskFlag {
  riskType: RiskType | string;
  explanation: string;
}

export interface TriageResult {
  primaryCategory: ComplaintCategory | string;
  secondaryCategories: (ComplaintCategory | string)[];
  severityLevel: SeverityLevel | string;
  severityJustification: string;
  riskFlags: RiskFlag[];
  recommendedDepartment: EscalationDepartment | string;
  escalationPriority: EscalationPriority;
  humanReviewStatus: HumanReviewStatus;
  humanReviewTriggerReason: string;
  executiveSummary: string;
  keyConcernsExtracted?: string[];
  triagedAt?: string;
  modelUsed?: string;
}

export interface Complaint {
  id: string;
  dateReceived: string;
  patientNameOrId: string;
  source: ComplaintSource;
  facilityOrUnit: string;
  complaintText: string;
  status: "Pending Triage" | "Triaged" | "Human Review Completed" | "Escalated" | "Closed";
  triageResult?: TriageResult;
  humanReviewNotes?: string;
  assignedReviewer?: string;
  humanSignOffDate?: string;
  overriddenSeverity?: SeverityLevel | string;
  overriddenDepartment?: EscalationDepartment | string;
}
