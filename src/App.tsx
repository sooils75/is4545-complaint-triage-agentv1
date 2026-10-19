import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { KpiMetrics } from "./components/KpiMetrics";
import { ComplaintFilters, FilterState } from "./components/ComplaintFilters";
import { ComplaintTable } from "./components/ComplaintTable";
import { TriageDetailModal } from "./components/TriageDetailModal";
import { UploadModal } from "./components/UploadModal";
import { QuickEntryModal } from "./components/QuickEntryModal";
import { BatchTriageProgress } from "./components/BatchTriageProgress";
import { AnalyticsView } from "./components/AnalyticsView";
import { Complaint, TriageResult } from "./types/triage";
import { SAMPLE_COMPLAINTS } from "./data/sampleComplaints";
import { exportComplaintsToSpreadsheet } from "./utils/fileParser";
import { BarChart3, ListFilter, Sparkles, AlertCircle } from "lucide-react";

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem("healthcare_complaints_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to restore saved complaints", e);
      }
    }
    return SAMPLE_COMPLAINTS;
  });

  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeViewMode, setActiveViewMode] = useState<"queue" | "analytics">("queue");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);

  // Processing state
  const [triagingId, setTriagingId] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    severity: "all",
    humanReview: "all",
    priority: "all",
    department: "all",
    category: "all",
    risk: "all",
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("healthcare_complaints_v1", JSON.stringify(complaints));
  }, [complaints]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run single triage with Gemini API via server endpoint
  const triageSingleComplaint = async (complaint: Complaint): Promise<TriageResult> => {
    setTriagingId(complaint.id);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintText: complaint.complaintText,
          metadata: {
            id: complaint.id,
            source: complaint.source,
            facility: complaint.facilityOrUnit,
            patient: complaint.patientNameOrId,
            dateReceived: complaint.dateReceived,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const triageResult: TriageResult = {
        ...data.result,
        triagedAt: new Date().toISOString(),
        modelUsed: data.modelUsed || "gemini-3.8-flash",
      };

      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaint.id
            ? {
                ...c,
                status: "Triaged",
                triageResult,
              }
            : c
        )
      );

      showToast(`Complaint ${complaint.id} triaged successfully.`);
      return triageResult;
    } catch (err: any) {
      console.error("Triage error:", err);
      showToast(`Error triaging complaint: ${err?.message || "Unknown error"}`);
      throw err;
    } finally {
      setTriagingId(null);
    }
  };

  // Batch triage pending or selected complaints
  const handleBatchTriage = async (itemsToTriage?: Complaint[]) => {
    const targets =
      itemsToTriage ||
      (selectedIds.length > 0
        ? complaints.filter((c) => selectedIds.includes(c.id) && !c.triageResult)
        : complaints.filter((c) => !c.triageResult));

    if (targets.length === 0) {
      showToast("All selected complaints have already been triaged.");
      return;
    }

    setIsProcessingBatch(true);
    setBatchProgress({ current: 0, total: targets.length });

    try {
      const batchPayload = targets.map((c) => ({
        id: c.id,
        text: c.complaintText,
        metadata: {
          source: c.source,
          facility: c.facilityOrUnit,
          patient: c.patientNameOrId,
        },
      }));

      const res = await fetch("/api/triage/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: batchPayload }),
      });

      if (!res.ok) {
        throw new Error(`Batch request failed: ${res.statusText}`);
      }

      const data = await res.json();
      const resultMap = new Map<string, any>();
      (data.results || []).forEach((r: any) => {
        if (r.status === "success" && r.result) {
          resultMap.set(r.id, {
            ...r.result,
            triagedAt: new Date().toISOString(),
            modelUsed: r.modelUsed || "gemini-3.8-flash",
          });
        }
      });

      setComplaints((prev) =>
        prev.map((c) => {
          if (resultMap.has(c.id)) {
            return {
              ...c,
              status: "Triaged",
              triageResult: resultMap.get(c.id),
            };
          }
          return c;
        })
      );

      setBatchProgress({ current: targets.length, total: targets.length });
      showToast(`Completed batch triage for ${targets.length} complaints.`);
    } catch (err: any) {
      console.error("Batch triage failed, executing sequential fallback:", err);
      // Fallback sequentially
      let count = 0;
      for (const item of targets) {
        try {
          await triageSingleComplaint(item);
          count++;
          setBatchProgress({ current: count, total: targets.length });
        } catch (e) {
          console.error(`Item ${item.id} failed`, e);
        }
      }
    } finally {
      setIsProcessingBatch(false);
    }
  };

  // Import complaints from UploadModal
  const handleImportComplaints = (newComplaints: Complaint[], autoTriage: boolean) => {
    setComplaints((prev) => [...newComplaints, ...prev]);
    showToast(`Imported ${newComplaints.length} complaints into queue.`);
    if (autoTriage) {
      handleBatchTriage(newComplaints);
    }
  };

  // Add single complaint from QuickEntry
  const handleAddSingleComplaint = async (newComplaint: Complaint, autoTriage: boolean) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    showToast(`Complaint ${newComplaint.id} logged.`);
    if (autoTriage) {
      await triageSingleComplaint(newComplaint);
    }
  };

  // Load sample dataset
  const handleLoadSamples = () => {
    setComplaints(SAMPLE_COMPLAINTS);
    setSelectedIds([]);
    showToast("Loaded sample clinical complaint dataset.");
  };

  // Export
  const handleExport = (format: "csv" | "xlsx") => {
    exportComplaintsToSpreadsheet(complaints, format);
    showToast(`Exported ${complaints.length} complaints as .${format}`);
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredComplaints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredComplaints.map((c) => c.id));
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((item) => {
    // Quick Tabs
    if (activeTab === "critical") {
      const lvl = item.triageResult?.severityLevel || "";
      const isCrit = lvl.includes("LEVEL 4") || lvl.includes("LEVEL 3") || lvl.toLowerCase().includes("critical") || lvl.toLowerCase().includes("high");
      if (!isCrit) return false;
    } else if (activeTab === "human_review") {
      if (item.triageResult?.humanReviewStatus !== "Human Review Required") return false;
    } else if (activeTab === "immediate") {
      if (item.triageResult?.escalationPriority !== "Immediate") return false;
    } else if (activeTab === "pending") {
      if (item.status !== "Pending Triage" && !!item.triageResult) return false;
    } else if (activeTab === "triaged") {
      if (item.status === "Pending Triage" || !item.triageResult) return false;
    }

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchText = item.complaintText.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      const matchPatient = item.patientNameOrId.toLowerCase().includes(q);
      const matchUnit = item.facilityOrUnit.toLowerCase().includes(q);
      const matchSummary = item.triageResult?.executiveSummary?.toLowerCase().includes(q) || false;
      const matchCategory = item.triageResult?.primaryCategory?.toLowerCase().includes(q) || false;
      if (!matchText && !matchId && !matchPatient && !matchUnit && !matchSummary && !matchCategory) {
        return false;
      }
    }

    // Severity
    if (filters.severity !== "all") {
      const s = (item.overriddenSeverity || item.triageResult?.severityLevel || "").toLowerCase();
      if (!s.includes(filters.severity.toLowerCase())) return false;
    }

    // Human Review
    if (filters.humanReview !== "all") {
      if (item.triageResult?.humanReviewStatus !== filters.humanReview) return false;
    }

    // Priority
    if (filters.priority !== "all") {
      if (item.triageResult?.escalationPriority !== filters.priority) return false;
    }

    // Department
    if (filters.department !== "all") {
      const d = item.overriddenDepartment || item.triageResult?.recommendedDepartment;
      if (d !== filters.department) return false;
    }

    // Category
    if (filters.category !== "all") {
      if (item.triageResult?.primaryCategory !== filters.category) return false;
    }

    // Risk
    if (filters.risk !== "all") {
      const hasRisk = item.triageResult?.riskFlags?.some((r) => r.riskType === filters.risk);
      if (!hasRisk) return false;
    }

    return true;
  });

  const pendingCount = complaints.filter(
    (c) => c.status === "Pending Triage" || !c.triageResult
  ).length;

  const tabCounts = {
    all: complaints.length,
    critical: complaints.filter(
      (c) =>
        c.triageResult?.severityLevel?.includes("LEVEL 4") ||
        c.triageResult?.severityLevel?.includes("LEVEL 3") ||
        c.triageResult?.severityLevel?.toLowerCase().includes("critical") ||
        c.triageResult?.severityLevel?.toLowerCase().includes("high")
    ).length,
    humanReview: complaints.filter(
      (c) => c.triageResult?.humanReviewStatus === "Human Review Required"
    ).length,
    pending: pendingCount,
    triaged: complaints.filter((c) => c.status !== "Pending Triage" && !!c.triageResult).length,
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
        onLoadSamples={handleLoadSamples}
        onExport={handleExport}
        onBatchTriageAll={() => handleBatchTriage()}
        pendingCount={pendingCount}
        isProcessingBatch={isProcessingBatch}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Metrics Cards */}
        <KpiMetrics
          complaints={complaints}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Batch Progress Bar if running */}
        <BatchTriageProgress
          current={batchProgress.current}
          total={batchProgress.total}
          isProcessing={isProcessingBatch}
        />

        {/* View Mode Toggle: Queue vs Analytics */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveViewMode("queue")}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeViewMode === "queue"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 mr-1.5" /> Triage Queue
            </button>
            <button
              onClick={() => setActiveViewMode("analytics")}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeViewMode === "analytics"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Department & Risk Matrix
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            Showing <strong>{filteredComplaints.length}</strong> of{" "}
            <strong>{complaints.length}</strong> records
          </div>
        </div>

        {activeViewMode === "analytics" ? (
          <AnalyticsView
            complaints={complaints}
            onSelectDepartment={(dept) => {
              setFilters({ ...filters, department: dept });
              setActiveViewMode("queue");
            }}
          />
        ) : (
          <>
            {/* Filter Bar */}
            <ComplaintFilters
              filters={filters}
              onChangeFilters={setFilters}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              counts={tabCounts}
            />

            {/* Selected batch action toolbar */}
            {selectedIds.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4 flex items-center justify-between animate-fadeIn">
                <span className="text-xs font-semibold text-indigo-900">
                  {selectedIds.length} complaints selected
                </span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleBatchTriage()}
                    disabled={isProcessingBatch}
                    className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Triage Selected
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="px-2.5 py-1 text-xs font-medium rounded bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}

            {/* Complaint Queue Table */}
            <ComplaintTable
              complaints={filteredComplaints}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
              onTriageSingle={(c) => triageSingleComplaint(c)}
              triagingId={triagingId}
            />
          </>
        )}
      </main>

      {/* Detail Inspection & Audit Modal */}
      <TriageDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdateComplaint={(updated) => {
          setComplaints((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
          setSelectedComplaint(updated);
          showToast(`Audit trail and review saved for ${updated.id}`);
        }}
        onReTriage={async (complaint) => {
          const newResult = await triageSingleComplaint(complaint);
          setSelectedComplaint({
            ...complaint,
            status: "Triaged",
            triageResult: newResult,
          });
        }}
        isTriaging={triagingId === selectedComplaint?.id}
      />

      {/* CSV / Excel Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportComplaints={handleImportComplaints}
      />

      {/* Quick Complaint Logger Modal */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        onSubmit={handleAddSingleComplaint}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-medium animate-fadeIn">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
