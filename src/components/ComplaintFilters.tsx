import React from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import {
  ComplaintCategory,
  EscalationDepartment,
  EscalationPriority,
  HumanReviewStatus,
  RiskType,
  SeverityLevel,
} from "../types/triage";

export interface FilterState {
  search: string;
  severity: string;
  humanReview: string;
  priority: string;
  department: string;
  category: string;
  risk: string;
}

interface ComplaintFiltersProps {
  filters: FilterState;
  onChangeFilters: (filters: FilterState) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  counts: {
    all: number;
    critical: number;
    humanReview: number;
    pending: number;
    triaged: number;
  };
}

const CATEGORIES: ComplaintCategory[] = [
  "Communication",
  "Scheduling",
  "Wait Time",
  "Technology / Patient Portal",
  "Billing",
  "Clinical Care",
  "Discharge and Follow-Up",
  "Accessibility and Equity",
  "Patient Safety",
  "Privacy or Security",
  "Staff Conduct",
  "Other",
];

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

const RISKS: RiskType[] = [
  "Patient Safety Risk",
  "Clinical Risk",
  "Compliance Risk",
  "Privacy Risk",
  "Accessibility Risk",
  "Equity Risk",
  "Reputational Risk",
  "Operational Risk",
];

export const ComplaintFilters: React.FC<ComplaintFiltersProps> = ({
  filters,
  onChangeFilters,
  activeTab,
  onSelectTab,
  counts,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.severity !== "all" ||
    filters.humanReview !== "all" ||
    filters.priority !== "all" ||
    filters.department !== "all" ||
    filters.category !== "all" ||
    filters.risk !== "all";

  const clearAllFilters = () => {
    onChangeFilters({
      search: "",
      severity: "all",
      humanReview: "all",
      priority: "all",
      department: "all",
      category: "all",
      risk: "all",
    });
  };

  const tabs = [
    { id: "all", label: "All Complaints", count: counts.all },
    { id: "critical", label: "🚨 Critical & Urgent", count: counts.critical },
    { id: "human_review", label: "👥 Human Review Queue", count: counts.humanReview },
    { id: "pending", label: "⏳ Pending Triage", count: counts.pending },
    { id: "triaged", label: "✅ Triage Completed", count: counts.triaged },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 mb-5">
      {/* Quick View Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-3 mb-3 border-b border-slate-100">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? "bg-teal-700 text-white shadow-xs"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`ml-2 px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                  isActive ? "bg-teal-800 text-teal-100" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient ID, keyword, clinical term, or narrative..."
            value={filters.search}
            onChange={(e) => onChangeFilters({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
          />
          {filters.search && (
            <button
              onClick={() => onChangeFilters({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Severity dropdown */}
        <div className="min-w-[150px]">
          <select
            value={filters.severity}
            onChange={(e) => onChangeFilters({ ...filters, severity: e.target.value })}
            className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Severity: All Levels</option>
            <option value="critical">Level 4 – Critical</option>
            <option value="high">Level 3 – High</option>
            <option value="moderate">Level 2 – Moderate</option>
            <option value="low">Level 1 – Low</option>
          </select>
        </div>

        {/* Human Review Status dropdown */}
        <div className="min-w-[170px]">
          <select
            value={filters.humanReview}
            onChange={(e) => onChangeFilters({ ...filters, humanReview: e.target.value })}
            className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Human Review: All</option>
            <option value="Human Review Required">Required Only</option>
            <option value="Human Review Recommended">Recommended Only</option>
            <option value="AI Review Only">AI Review Only</option>
          </select>
        </div>

        {/* Toggle Advanced Filters */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm rounded-lg border font-medium transition-colors ${
            showAdvancedFilters || hasActiveFilters
              ? "bg-teal-50 border-teal-300 text-teal-800"
              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Filter className="w-3.5 h-3.5 mr-1.5" />
          More Filters
          <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
        </button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center justify-center px-2.5 py-2 text-xs sm:text-sm text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-medium"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Clear
          </button>
        )}
      </div>

      {/* Advanced Filter drawer */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-100 animate-fadeIn">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Complaint Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => onChangeFilters({ ...filters, category: e.target.value })}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Department Route */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Route to Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => onChangeFilters({ ...filters, department: e.target.value })}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Escalation Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => onChangeFilters({ ...filters, priority: e.target.value })}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Priorities</option>
              <option value="Immediate">Immediate</option>
              <option value="Priority">Priority</option>
              <option value="Routine">Routine</option>
            </select>
          </div>

          {/* Flagged Risk */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Specific Risk Vector
            </label>
            <select
              value={filters.risk}
              onChange={(e) => onChangeFilters({ ...filters, risk: e.target.value })}
              className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Flagged Risks</option>
              {RISKS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
