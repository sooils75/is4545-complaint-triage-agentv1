import React from "react";
import {
  AlertTriangle,
  UserCheck,
  Zap,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { Complaint } from "../types/triage";

interface KpiMetricsProps {
  complaints: Complaint[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onFilterSeverity?: (severity: string) => void;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({
  complaints,
  activeTab,
  onSelectTab,
  onFilterSeverity,
}) => {
  const total = complaints.length;

  const level4Count = complaints.filter(
    (c) => c.triageResult?.severityLevel?.includes("LEVEL 4") || c.triageResult?.severityLevel?.toLowerCase().includes("critical")
  ).length;

  const level3Count = complaints.filter(
    (c) => c.triageResult?.severityLevel?.includes("LEVEL 3") || c.triageResult?.severityLevel?.toLowerCase().includes("high")
  ).length;

  const highCriticalTotal = level4Count + level3Count;

  const humanReviewRequiredCount = complaints.filter(
    (c) => c.triageResult?.humanReviewStatus === "Human Review Required"
  ).length;

  const immediateEscalationCount = complaints.filter(
    (c) => c.triageResult?.escalationPriority === "Immediate"
  ).length;

  const triagedCount = complaints.filter((c) => c.status !== "Pending Triage" && !!c.triageResult).length;
  const pendingCount = complaints.filter((c) => c.status === "Pending Triage" || !c.triageResult).length;

  // Calculate top risk flag
  const riskCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    c.triageResult?.riskFlags?.forEach((r) => {
      riskCounts[r.riskType] = (riskCounts[r.riskType] || 0) + 1;
    });
  });
  const topRisk = Object.entries(riskCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {/* Total Ingested */}
      <div
        onClick={() => onSelectTab("all")}
        className={`cursor-pointer rounded-xl p-4 transition-all border ${
          activeTab === "all"
            ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20"
            : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${activeTab === "all" ? "text-slate-300" : "text-slate-500"}`}>
            Total Ingested
          </span>
          <Layers className={`w-4 h-4 ${activeTab === "all" ? "text-slate-300" : "text-slate-400"}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight">{total}</span>
          <span className={`text-xs ${activeTab === "all" ? "text-slate-300" : "text-slate-500"}`}>
            {triagedCount} triaged
          </span>
        </div>
        <div className="mt-1 text-xs opacity-80 truncate">
          {pendingCount > 0 ? `⏳ ${pendingCount} awaiting triage` : "✓ All triaged"}
        </div>
      </div>

      {/* Critical & High Alerts */}
      <div
        onClick={() => onSelectTab("critical")}
        className={`cursor-pointer rounded-xl p-4 transition-all border ${
          activeTab === "critical"
            ? "bg-rose-900 text-white border-rose-900 shadow-md ring-2 ring-rose-500/30"
            : "bg-white hover:bg-rose-50/40 text-slate-800 border-rose-200 shadow-2xs"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${activeTab === "critical" ? "text-rose-200" : "text-rose-700"}`}>
            Critical & High
          </span>
          <AlertTriangle className={`w-4 h-4 ${activeTab === "critical" ? "text-rose-300" : "text-rose-600"}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className={`text-2xl font-bold tracking-tight ${activeTab === "critical" ? "text-white" : "text-rose-700"}`}>
            {highCriticalTotal}
          </span>
          <span className={`text-xs font-medium ${activeTab === "critical" ? "text-rose-200" : "text-rose-600"}`}>
            L4: {level4Count} | L3: {level3Count}
          </span>
        </div>
        <div className="mt-1 text-xs opacity-80 flex items-center">
          <Flame className="w-3 h-3 mr-1 text-rose-500" />
          <span>Patient safety & harm risk</span>
        </div>
      </div>

      {/* Human Review Required */}
      <div
        onClick={() => onSelectTab("human_review")}
        className={`cursor-pointer rounded-xl p-4 transition-all border ${
          activeTab === "human_review"
            ? "bg-amber-900 text-white border-amber-900 shadow-md ring-2 ring-amber-500/30"
            : "bg-white hover:bg-amber-50/40 text-slate-800 border-amber-200 shadow-2xs"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${activeTab === "human_review" ? "text-amber-200" : "text-amber-700"}`}>
            Human Review Queue
          </span>
          <UserCheck className={`w-4 h-4 ${activeTab === "human_review" ? "text-amber-300" : "text-amber-600"}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className={`text-2xl font-bold tracking-tight ${activeTab === "human_review" ? "text-white" : "text-amber-700"}`}>
            {humanReviewRequiredCount}
          </span>
          <span className={`text-xs ${activeTab === "human_review" ? "text-amber-200" : "text-amber-600"}`}>
            Mandatory
          </span>
        </div>
        <div className="mt-1 text-xs opacity-80 truncate">
          Safety, HIPAA, equity triggers
        </div>
      </div>

      {/* Immediate Escalation */}
      <div
        onClick={() => onSelectTab("immediate")}
        className={`cursor-pointer rounded-xl p-4 transition-all border ${
          activeTab === "immediate"
            ? "bg-red-800 text-white border-red-800 shadow-md ring-2 ring-red-500/30"
            : "bg-white hover:bg-red-50/40 text-slate-800 border-red-200 shadow-2xs"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold uppercase tracking-wider ${activeTab === "immediate" ? "text-red-200" : "text-red-700"}`}>
            Immediate Action
          </span>
          <Zap className={`w-4 h-4 ${activeTab === "immediate" ? "text-yellow-300" : "text-red-600"}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className={`text-2xl font-bold tracking-tight ${activeTab === "immediate" ? "text-white" : "text-red-700"}`}>
            {immediateEscalationCount}
          </span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${activeTab === "immediate" ? "bg-red-900 text-yellow-300" : "bg-red-100 text-red-800"}`}>
            Urgent
          </span>
        </div>
        <div className="mt-1 text-xs opacity-80 truncate">
          Risk Management & Leadership
        </div>
      </div>

      {/* Risk / Safety Intelligence */}
      <div className="col-span-2 md:col-span-4 lg:col-span-1 rounded-xl p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 text-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Top Risk Vector
          </span>
          <ShieldCheck className="w-4 h-4 text-teal-700" />
        </div>
        <div className="mt-2">
          <div className="text-sm font-bold text-teal-950 truncate">
            {topRisk ? topRisk[0] : "All Monitored"}
          </div>
          <div className="text-xs text-teal-700 mt-0.5">
            {topRisk ? `${topRisk[1]} active complaints` : "0 flagged risks"}
          </div>
        </div>
        <div className="mt-1.5 text-[11px] text-teal-800 font-medium flex items-center">
          <CheckCircle2 className="w-3 h-3 mr-1 text-teal-600" /> Human oversight protocol active
        </div>
      </div>
    </div>
  );
};
