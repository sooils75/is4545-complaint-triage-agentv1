import React from "react";
import {
  Sparkles,
  ChevronRight,
  UserCheck,
  AlertOctagon,
  Clock,
  Building,
  Tag,
  ArrowRight,
  ShieldAlert,
  Flame,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Complaint } from "../types/triage";
import {
  getHumanReviewBadgeStyle,
  getPriorityBadgeStyle,
  getRiskColor,
  getSeverityBadgeStyle,
} from "../utils/formatters";

interface ComplaintTableProps {
  complaints: Complaint[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onTriageSingle: (complaint: Complaint) => void;
  triagingId: string | null;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  complaints,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onSelectComplaint,
  onTriageSingle,
  triagingId,
}) => {
  const allSelected =
    complaints.length > 0 && selectedIds.length === complaints.length;

  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Info className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No matching complaints found</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Try resetting your search query or filters, or upload a new CSV/Excel data source or sample batch.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th scope="col" className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </th>
              <th scope="col" className="px-4 py-3">
                Complaint & Source
              </th>
              <th scope="col" className="px-4 py-3">
                Patient & Facility
              </th>
              <th scope="col" className="px-4 py-3">
                Category
              </th>
              <th scope="col" className="px-4 py-3">
                Severity Level
              </th>
              <th scope="col" className="px-4 py-3">
                Risk Flags
              </th>
              <th scope="col" className="px-4 py-3">
                Route & Priority
              </th>
              <th scope="col" className="px-4 py-3">
                Human Oversight
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs text-slate-700 bg-white">
            {complaints.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isTriaging = triagingId === item.id;
              const t = item.triageResult;
              const isCritical =
                t?.severityLevel?.includes("LEVEL 4") ||
                t?.severityLevel?.toLowerCase().includes("critical");
              const isHigh =
                t?.severityLevel?.includes("LEVEL 3") ||
                t?.severityLevel?.toLowerCase().includes("high");

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isCritical
                      ? "bg-rose-50/30"
                      : isHigh
                      ? "bg-amber-50/20"
                      : isSelected
                      ? "bg-teal-50/30"
                      : ""
                  }`}
                >
                  {/* Select */}
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                  </td>

                  {/* ID & Narrative Excerpt */}
                  <td className="px-4 py-3 max-w-xs sm:max-w-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-semibold text-slate-900">
                        {item.id}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {item.source}
                      </span>
                      {item.status === "Human Review Completed" && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                          Reviewed
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-1 text-slate-600 line-clamp-2 text-xs leading-relaxed cursor-pointer hover:text-teal-700"
                      onClick={() => onSelectComplaint(item)}
                      title="Click to view full complaint details"
                    >
                      {item.complaintText}
                    </p>
                  </td>

                  {/* Patient & Facility */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-slate-900 font-medium">
                      {item.patientNameOrId}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center mt-0.5">
                      <Building className="w-3 h-3 mr-1 text-slate-400" />
                      <span className="truncate max-w-[130px]">{item.facilityOrUnit}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {item.dateReceived}
                    </div>
                  </td>

                  {/* Primary & Secondary Category */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {t ? (
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Tag className="w-3 h-3 mr-1" />
                          {t.primaryCategory}
                        </span>
                        {t.secondaryCategories && t.secondaryCategories.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[140px]">
                            +{t.secondaryCategories.join(", ")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Pending Triage</span>
                    )}
                  </td>

                  {/* Severity Level */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {t ? (
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadgeStyle(
                            t.severityLevel
                          )}`}
                        >
                          {isCritical && <Flame className="w-3 h-3 mr-1 text-rose-600" />}
                          {isHigh && <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />}
                          {t.severityLevel}
                        </span>
                        {item.overriddenSeverity && (
                          <div className="text-[10px] text-purple-700 font-medium">
                            Overridden: {item.overriddenSeverity}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">--</span>
                    )}
                  </td>

                  {/* Risk Flags */}
                  <td className="px-4 py-3">
                    {t?.riskFlags && t.riskFlags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {t.riskFlags.slice(0, 2).map((r, i) => (
                          <span
                            key={i}
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRiskColor(
                              r.riskType
                            )}`}
                            title={r.explanation}
                          >
                            {r.riskType.replace(" Risk", "")}
                          </span>
                        ))}
                        {t.riskFlags.length > 2 && (
                          <span className="inline-block px-1 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                            +{t.riskFlags.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">None</span>
                    )}
                  </td>

                  {/* Route & Priority */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {t ? (
                      <div>
                        <div className="text-slate-900 font-medium text-xs">
                          {item.overriddenDepartment || t.recommendedDepartment}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${getPriorityBadgeStyle(
                              t.escalationPriority
                            )}`}
                          >
                            {t.escalationPriority} Escalation
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">--</span>
                    )}
                  </td>

                  {/* Human Oversight */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {t ? (
                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border ${getHumanReviewBadgeStyle(
                            t.humanReviewStatus
                          )}`}
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          {t.humanReviewStatus}
                        </span>
                        {item.assignedReviewer && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            By: {item.assignedReviewer}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">--</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {!t ? (
                        <button
                          type="button"
                          onClick={() => onTriageSingle(item)}
                          disabled={isTriaging}
                          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-teal-600 text-white hover:bg-teal-700 shadow-2xs transition-colors disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {isTriaging ? "Triaging..." : "Triage"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectComplaint(item)}
                          className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          Inspect
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-slate-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
