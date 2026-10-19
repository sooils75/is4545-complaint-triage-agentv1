import React from "react";
import {
  ShieldAlert,
  Upload,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Activity,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenQuickEntry: () => void;
  onLoadSamples: () => void;
  onExport: (format: "csv" | "xlsx") => void;
  onBatchTriageAll: () => void;
  pendingCount: number;
  isProcessingBatch: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  onOpenQuickEntry,
  onLoadSamples,
  onExport,
  onBatchTriageAll,
  pendingCount,
  isProcessingBatch,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  return (
    <header className="border-b border-slate-200 bg-white shadow-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Clinical Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  Complaint Triage Agent
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" /> Healthcare Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                AI-assisted clinical severity scoring, risk detection, routing & human oversight
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Batch Triage Button if pending items exist */}
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={onBatchTriageAll}
                disabled={isProcessingBatch}
                className="inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50"
              >
                {isProcessingBatch ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                    Triaging ({pendingCount})...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Triage Pending ({pendingCount})
                  </>
                )}
              </button>
            )}

            {/* Quick Entry */}
            <button
              type="button"
              onClick={onOpenQuickEntry}
              className="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Add Single Complaint"
            >
              <PlusCircle className="w-4 h-4 sm:mr-1.5 text-teal-600" />
              <span className="hidden sm:inline">New Complaint</span>
            </button>

            {/* Upload CSV/Excel */}
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              <Upload className="w-4 h-4 sm:mr-1.5 text-teal-700" />
              <span className="hidden sm:inline">Upload CSV / Excel</span>
              <span className="sm:hidden">Upload</span>
            </button>

            {/* Load Sample Batch */}
            <button
              type="button"
              onClick={onLoadSamples}
              className="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Load Pre-built Healthcare Dataset"
            >
              <FileSpreadsheet className="w-4 h-4 sm:mr-1.5 text-indigo-600" />
              <span className="hidden sm:inline">Load Sample Batch</span>
            </button>

            {/* Export dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Export triaged complaints"
              >
                <Download className="w-4 h-4 sm:mr-1.5 text-slate-600" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-40 py-1"
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <button
                    onClick={() => {
                      onExport("csv");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                  >
                    <Download className="w-3.5 h-3.5 mr-2 text-slate-500" /> Export as CSV (.csv)
                  </button>
                  <button
                    onClick={() => {
                      onExport("xlsx");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Export as Excel (.xlsx)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
