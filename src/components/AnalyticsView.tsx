import React from "react";
import {
  BarChart3,
  ShieldAlert,
  Building,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { Complaint } from "../types/triage";
import { getRiskColor, getSeverityBadgeStyle } from "../utils/formatters";

interface AnalyticsViewProps {
  complaints: Complaint[];
  onSelectDepartment: (dept: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  complaints,
  onSelectDepartment,
}) => {
  const triaged = complaints.filter((c) => !!c.triageResult);

  // Department counts
  const deptCounts: Record<string, number> = {};
  triaged.forEach((c) => {
    const d = c.overriddenDepartment || c.triageResult?.recommendedDepartment || "Unassigned";
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });

  // Severity counts
  const severityCounts: Record<string, number> = {
    "LEVEL 4 – Critical": 0,
    "LEVEL 3 – High": 0,
    "LEVEL 2 – Moderate": 0,
    "LEVEL 1 – Low": 0,
  };
  triaged.forEach((c) => {
    const s = c.overriddenSeverity || c.triageResult?.severityLevel;
    if (s && severityCounts[s] !== undefined) {
      severityCounts[s]++;
    } else if (s?.includes("LEVEL 4")) {
      severityCounts["LEVEL 4 – Critical"]++;
    } else if (s?.includes("LEVEL 3")) {
      severityCounts["LEVEL 3 – High"]++;
    } else if (s?.includes("LEVEL 2")) {
      severityCounts["LEVEL 2 – Moderate"]++;
    } else if (s?.includes("LEVEL 1")) {
      severityCounts["LEVEL 1 – Low"]++;
    }
  });

  // Category counts
  const categoryCounts: Record<string, number> = {};
  triaged.forEach((c) => {
    const cat = c.triageResult?.primaryCategory || "Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Risk counts
  const riskCounts: Record<string, number> = {};
  triaged.forEach((c) => {
    c.triageResult?.riskFlags?.forEach((r) => {
      riskCounts[r.riskType] = (riskCounts[r.riskType] || 0) + 1;
    });
  });

  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const sortedRisks = Object.entries(riskCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 mb-8 animate-fadeIn">
      {/* Top Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Escalation Route Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center">
              <Building className="w-4 h-4 mr-2 text-teal-600" />
              Routing by Department
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              {sortedDepts.length} departments
            </span>
          </div>

          <div className="space-y-2.5">
            {sortedDepts.map(([dept, count]) => {
              const pct = triaged.length > 0 ? Math.round((count / triaged.length) * 100) : 0;
              return (
                <div
                  key={dept}
                  onClick={() => onSelectDepartment(dept)}
                  className="cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                >
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                      {dept}
                    </span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2 text-rose-600" />
              Severity Assessment Matrix
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              {triaged.length} triaged
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                key: "LEVEL 4 – Critical",
                color: "bg-rose-600",
                badge: "bg-rose-50 text-rose-800 border-rose-200",
              },
              {
                key: "LEVEL 3 – High",
                color: "bg-amber-600",
                badge: "bg-amber-50 text-amber-800 border-amber-200",
              },
              {
                key: "LEVEL 2 – Moderate",
                color: "bg-blue-600",
                badge: "bg-blue-50 text-blue-800 border-blue-200",
              },
              {
                key: "LEVEL 1 – Low",
                color: "bg-emerald-600",
                badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
              },
            ].map(({ key, color, badge }) => {
              const count = severityCounts[key] || 0;
              const pct = triaged.length > 0 ? Math.round((count / triaged.length) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badge}`}>
                      {key}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Complaints rated Level 4 Critical require immediate leadership intervention.
          </div>
        </div>

        {/* Risk Vectors Detected */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
              Risk Vector Frequency
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              {sortedRisks.length} types detected
            </span>
          </div>

          <div className="space-y-2">
            {sortedRisks.map(([risk, count]) => (
              <div
                key={risk}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-medium text-slate-800">{risk}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getRiskColor(risk)}`}>
                  {count} flagged
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
