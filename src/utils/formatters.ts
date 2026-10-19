import { Complaint, TriageResult } from "../types/triage";

export function formatOfficialOutput(triage: TriageResult): string {
  const secondary =
    triage.secondaryCategories && triage.secondaryCategories.length > 0
      ? triage.secondaryCategories.join(", ")
      : "None";

  const risksFormatted =
    triage.riskFlags && triage.riskFlags.length > 0
      ? triage.riskFlags.map((r) => `  - ${r.riskType}: ${r.explanation}`).join("\n")
      : "  - None identified";

  return `Complaint Category: ${triage.primaryCategory}
Secondary Categories: ${secondary}
Severity Level: ${triage.severityLevel}
Severity Justification: ${triage.severityJustification}
Risk Flags:
${risksFormatted}
Recommended Department: ${triage.recommendedDepartment}
Escalation Priority: ${triage.escalationPriority}
Human Review Status: ${triage.humanReviewStatus}
Executive Summary:
${triage.executiveSummary}`;
}

export function getSeverityBadgeStyle(level?: string) {
  if (!level) return "bg-slate-100 text-slate-700 border-slate-300";

  if (level.includes("LEVEL 4") || level.toLowerCase().includes("critical")) {
    return "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
  }
  if (level.includes("LEVEL 3") || level.toLowerCase().includes("high")) {
    return "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
  }
  if (level.includes("LEVEL 2") || level.toLowerCase().includes("moderate")) {
    return "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
  }
  return "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
}

export function getPriorityBadgeStyle(priority?: string) {
  if (priority === "Immediate") {
    return "bg-red-600 text-white font-semibold animate-pulse";
  }
  if (priority === "Priority") {
    return "bg-amber-500 text-white font-medium";
  }
  return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
}

export function getHumanReviewBadgeStyle(status?: string) {
  if (status === "Human Review Required") {
    return "bg-red-50 text-red-700 border-red-300 font-semibold";
  }
  if (status === "Human Review Recommended") {
    return "bg-amber-50 text-amber-700 border-amber-300";
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export function getRiskColor(riskType: string) {
  switch (riskType) {
    case "Patient Safety Risk":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "Clinical Risk":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Compliance Risk":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "Privacy Risk":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "Accessibility Risk":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Equity Risk":
      return "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200";
    case "Reputational Risk":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Operational Risk":
      return "bg-slate-100 text-slate-800 border-slate-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
