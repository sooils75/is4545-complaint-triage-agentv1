import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  Send,
  Copy,
  Check,
  Building,
  Clock,
  Sparkles,
  FileText,
  AlertOctagon,
  Flame,
  CheckCircle2,
  Edit3,
  RefreshCw,
  Share2,
} from "lucide-react";
import { Complaint, EscalationDepartment, SeverityLevel } from "../types/triage";
import {
  formatOfficialOutput,
  getHumanReviewBadgeStyle,
  getPriorityBadgeStyle,
  getRiskColor,
  getSeverityBadgeStyle,
} from "../utils/formatters";

interface TriageDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onUpdateComplaint: (updated: Complaint) => void;
  onReTriage: (complaint: Complaint) => Promise<void>;
  isTriaging: boolean;
}

const DEPARTMENTS: EscalationDepartment[] = [
  "Patient Experience Team",
  "Nursing Leadership",
  "Physician Leadership",
  "Quality Improvement Team",
  "Compliance Office",
  "Information Technology",
  "Revenue Cycle / Billing",
  "Accessibility Coordinator",
  "Risk Management",
  "Executive Review",
];

const SEVERITIES: SeverityLevel[] = [
  "LEVEL 1 – Low",
  "LEVEL 2 – Moderate",
  "LEVEL 3 – High",
  "LEVEL 4 – Critical",
];

export const TriageDetailModal: React.FC<TriageDetailModalProps> = ({
  complaint,
  onClose,
  onUpdateComplaint,
  onReTriage,
  isTriaging,
}) => {
  if (!complaint) return null;

  const t = complaint.triageResult;
  const [activeViewTab, setActiveViewTab] = useState<"protocol" | "official" | "review">("protocol");
  const [copied, setCopied] = useState(false);

  // Human review form state
  const [reviewerName, setReviewerName] = useState(complaint.assignedReviewer || "");
  const [reviewNotes, setReviewNotes] = useState(complaint.humanReviewNotes || "");
  const [overrideSeverity, setOverrideSeverity] = useState(complaint.overriddenSeverity || "");
  const [overrideDepartment, setOverrideDepartment] = useState(complaint.overriddenDepartment || "");

  const handleCopyOfficialOutput = () => {
    if (!t) return;
    const text = formatOfficialOutput(t);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveReview = (newStatus?: Complaint["status"]) => {
    const updated: Complaint = {
      ...complaint,
      assignedReviewer: reviewerName || "Clinical Reviewer",
      humanReviewNotes: reviewNotes,
      overriddenSeverity: overrideSeverity || undefined,
      overriddenDepartment: overrideDepartment || undefined,
      humanSignOffDate: new Date().toISOString(),
      status: newStatus || "Human Review Completed",
    };
    onUpdateComplaint(updated);
  };

  const isCritical =
    t?.severityLevel?.includes("LEVEL 4") ||
    t?.severityLevel?.toLowerCase().includes("critical");
  const isHigh =
    t?.severityLevel?.includes("LEVEL 3") ||
    t?.severityLevel?.toLowerCase().includes("high");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                isCritical
                  ? "bg-rose-600 shadow-md shadow-rose-500/20"
                  : isHigh
                  ? "bg-amber-600 shadow-md shadow-amber-500/20"
                  : "bg-teal-600 shadow-md shadow-teal-500/20"
              }`}
            >
              {isCritical ? (
                <Flame className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {complaint.id}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-800">
                  {complaint.source}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadgeStyle(
                    complaint.overriddenSeverity || t?.severityLevel
                  )}`}
                >
                  {complaint.overriddenSeverity || t?.severityLevel || "Pending Triage"}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center space-x-3 mt-1">
                <span>{complaint.patientNameOrId}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Building className="w-3 h-3 mr-1" /> {complaint.facilityOrUnit}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> {complaint.dateReceived}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 py-2 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveViewTab("protocol")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeViewTab === "protocol"
                  ? "bg-teal-50 text-teal-800 border border-teal-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              6-Step Triage Protocol
            </button>
            <button
              onClick={() => setActiveViewTab("official")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeViewTab === "official"
                  ? "bg-teal-50 text-teal-800 border border-teal-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Official Output Format
            </button>
            <button
              onClick={() => setActiveViewTab("review")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center ${
                activeViewTab === "review"
                  ? "bg-teal-50 text-teal-800 border border-teal-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              Human Oversight & Audit
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {t && (
              <button
                type="button"
                onClick={handleCopyOfficialOutput}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1 text-slate-600" /> Copy Report
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onReTriage(complaint)}
              disabled={isTriaging}
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50"
            >
              {isTriaging ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Triaging...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Re-Triage AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* Patient Complaint Narrative Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Patient Complaint Narrative
              </span>
              <span className="text-xs text-slate-400">
                {complaint.complaintText.length} characters
              </span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
              {complaint.complaintText}
            </p>

            {/* Key concerns extracted if available */}
            {t?.keyConcernsExtracted && t.keyConcernsExtracted.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                  Extracted Key Concerns
                </span>
                <ul className="space-y-1">
                  {t.keyConcernsExtracted.map((kc, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mr-2 mt-1.5 shrink-0" />
                      <span>{kc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {!t ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <Sparkles className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-800">
                This complaint has not been triaged yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Execute the 6-step Healthcare Complaint Triage Protocol with Gemini.
              </p>
              <button
                type="button"
                onClick={() => onReTriage(complaint)}
                disabled={isTriaging}
                className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
              >
                {isTriaging ? "Triaging..." : "Run Triage Agent"}
              </button>
            </div>
          ) : activeViewTab === "protocol" ? (
            /* 6-Step Triage Protocol Visual View */
            <div className="space-y-4">
              {/* STEP 1: Complaint Category */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      STEP 1: Complaint Category
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400">Classification</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-3">
                    <div className="text-[11px] font-semibold text-indigo-800 uppercase">
                      Primary Category
                    </div>
                    <div className="text-sm font-bold text-indigo-950 mt-1">
                      {t.primaryCategory}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase">
                      Secondary Categories
                    </div>
                    <div className="text-xs font-medium text-slate-800 mt-1">
                      {t.secondaryCategories && t.secondaryCategories.length > 0
                        ? t.secondaryCategories.join(", ")
                        : "None identified"}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Severity Assessment */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      STEP 2: Severity Assessment
                    </h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadgeStyle(
                      complaint.overriddenSeverity || t.severityLevel
                    )}`}
                  >
                    {complaint.overriddenSeverity || t.severityLevel}
                  </span>
                </div>

                {/* Severity indicator scale */}
                <div className="grid grid-cols-4 gap-1 mt-3 mb-3">
                  {[
                    { lvl: "LEVEL 1", label: "Low", desc: "Minor inconvenience" },
                    { lvl: "LEVEL 2", label: "Moderate", desc: "Service failure" },
                    { lvl: "LEVEL 3", label: "High", desc: "Potential harm" },
                    { lvl: "LEVEL 4", label: "Critical", desc: "Immediate safety/legal" },
                  ].map((s) => {
                    const isSelected = (complaint.overriddenSeverity || t.severityLevel).includes(s.lvl);
                    return (
                      <div
                        key={s.lvl}
                        className={`p-2 rounded-lg text-center border text-[11px] transition-all ${
                          isSelected
                            ? s.lvl === "LEVEL 4"
                              ? "bg-rose-600 text-white border-rose-600 font-bold shadow-xs"
                              : s.lvl === "LEVEL 3"
                              ? "bg-amber-600 text-white border-amber-600 font-bold shadow-xs"
                              : s.lvl === "LEVEL 2"
                              ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                              : "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-500 opacity-60"
                        }`}
                      >
                        <div className="font-semibold">{s.lvl}</div>
                        <div className="text-[10px] truncate">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Severity Justification
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {t.severityJustification}
                  </p>
                </div>
              </div>

              {/* STEP 3: Risk Detection */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      STEP 3: Risk Detection
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {t.riskFlags?.length || 0} Risk Vectors Flagged
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                  {t.riskFlags && t.riskFlags.length > 0 ? (
                    t.riskFlags.map((risk, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${getRiskColor(risk.riskType)}`}
                      >
                        <div className="font-bold text-xs flex items-center">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          {risk.riskType}
                        </div>
                        <p className="text-[11px] mt-1 leading-relaxed opacity-95">
                          {risk.explanation}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                      No high-risk vectors detected.
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 4 & STEP 5: Escalation & Human Review in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* STEP 4: Escalation Recommendation */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                      4
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      STEP 4: Escalation Recommendation
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg">
                      <div className="text-[11px] font-semibold text-teal-800 uppercase">
                        Route To Department
                      </div>
                      <div className="text-sm font-bold text-teal-950 mt-0.5">
                        {complaint.overriddenDepartment || t.recommendedDepartment}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-xs font-semibold text-slate-700">
                        Escalation Priority
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded text-xs ${getPriorityBadgeStyle(
                          t.escalationPriority
                        )}`}
                      >
                        {t.escalationPriority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* STEP 5: Human Review Requirement */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                      5
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      STEP 5: Human Review Requirement
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded-lg border ${getHumanReviewBadgeStyle(
                        t.humanReviewStatus
                      )}`}
                    >
                      <div className="text-[11px] uppercase font-semibold">
                        Oversight Requirement
                      </div>
                      <div className="text-sm font-bold mt-0.5 flex items-center">
                        <UserCheck className="w-4 h-4 mr-1.5" />
                        {t.humanReviewStatus}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                        Trigger Justification
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {t.humanReviewTriggerReason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 6: Executive Summary */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      6
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      STEP 6: Executive Summary
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Briefing Ready
                  </span>
                </div>
                <div className="p-3.5 bg-gradient-to-r from-slate-50 to-teal-50/30 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  {t.executiveSummary}
                </div>
              </div>
            </div>
          ) : activeViewTab === "official" ? (
            /* Official Output Format View */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Standardized Healthcare Triage Output
                  </h4>
                  <p className="text-xs text-slate-500">
                    Compliant with prompt output requirements for grievance logging and EHR integration
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOfficialOutput}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" /> Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Official Text
                    </>
                  )}
                </button>
              </div>

              <pre className="font-mono text-xs sm:text-sm text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {formatOfficialOutput(t)}
              </pre>
            </div>
          ) : (
            /* Human Oversight & Audit View */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Human Oversight & Clinical Sign-Off
                </h4>
                <p className="text-xs text-slate-500">
                  Record reviewer verification, clinical override rationale, and action disposition.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Clinical Reviewer / Quality Officer
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins, RN / Risk Lead"
                    className="w-full text-xs sm:text-sm p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Complaint Status
                  </label>
                  <div className="text-xs sm:text-sm p-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-800 font-semibold">
                    {complaint.status}
                  </div>
                </div>
              </div>

              {/* Clinical Overrides */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200/80 space-y-3">
                <div className="text-xs font-bold text-purple-900 flex items-center">
                  <Edit3 className="w-3.5 h-3.5 mr-1.5 text-purple-700" />
                  Clinical & Operational Overrides (Optional)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-purple-800 mb-1">
                      Override Severity Level
                    </label>
                    <select
                      value={overrideSeverity}
                      onChange={(e) => setOverrideSeverity(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-purple-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">(Keep AI Severity: {t.severityLevel})</option>
                      {SEVERITIES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-purple-800 mb-1">
                      Override Escalation Department
                    </label>
                    <select
                      value={overrideDepartment}
                      onChange={(e) => setOverrideDepartment(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-purple-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">(Keep AI Route: {t.recommendedDepartment})</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Reviewer Clinical Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Human Reviewer Findings & Clinical Notes
                </label>
                <textarea
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Document clinical investigation steps, staff interviews, corrective action plans, or reason for severity adjustments..."
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Audit Sign-off buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveReview("Human Review Completed")}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Sign Off & Complete Review
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveReview("Escalated")}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Confirm Escalation to Department
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveReview("Closed")}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  Close Complaint
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Model: {t?.modelUsed || "gemini-3.8-flash"}</span>
            {t?.triagedAt && (
              <>
                <span>•</span>
                <span>Triaged: {new Date(t.triagedAt).toLocaleString()}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
