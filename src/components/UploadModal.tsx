import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Complaint } from "../types/triage";
import { generateTemplateFile, parseSpreadsheetFile } from "../utils/fileParser";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplaints: (newComplaints: Complaint[], autoTriage: boolean) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onImportComplaints,
}) => {
  if (!isOpen) return null;

  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    complaints: Complaint[];
    filename: string;
    columns: any;
  } | null>(null);
  const [autoTriageOnImport, setAutoTriageOnImport] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const validExts = [".csv", ".xlsx", ".xls"];
    const hasValidExt = validExts.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setError("Please upload a valid CSV or Excel file (.csv, .xlsx, .xls).");
      return;
    }

    setError(null);
    setIsParsing(true);

    try {
      const result = await parseSpreadsheetFile(file);
      if (result.complaints.length === 0) {
        throw new Error(
          "Could not detect any complaint text rows in this file. Please verify the columns."
        );
      }
      setParsedData({
        complaints: result.complaints,
        filename: result.filename,
        columns: result.detectedColumns,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to parse the file. Please check file formatting.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;
    onImportComplaints(parsedData.complaints, autoTriageOnImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Upload Complaints Data Source
              </h3>
              <p className="text-xs text-slate-500">
                Import CSV or Excel (.xlsx / .xls) files from grievance systems, EHR, or surveys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {!parsedData ? (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-teal-500 bg-teal-50/50 scale-[1.01]"
                    : "border-slate-300 hover:border-teal-400 bg-slate-50/60 hover:bg-slate-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isParsing ? "Analyzing and parsing file..." : "Click or drag & drop CSV or Excel file here"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Supports CSV, XLSX, XLS. Auto-detects columns for complaints, dates, patient IDs, and channels.
                </p>
              </div>

              {/* Sample template actions */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="text-xs text-slate-600">
                  Need a formatted sample file to get started?
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => generateTemplateFile("csv")}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 shadow-2xs"
                  >
                    <Download className="w-3 h-3 mr-1 text-slate-500" /> Sample CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => generateTemplateFile("xlsx")}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-white border border-slate-300 hover:bg-slate-100 text-emerald-700 shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3 h-3 mr-1 text-emerald-600" /> Sample Excel
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Parsed File Preview */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Successfully parsed {parsedData.filename}
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Found <strong>{parsedData.complaints.length}</strong> valid patient complaint records.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setParsedData(null)}
                  className="text-xs text-emerald-800 underline hover:text-emerald-950"
                >
                  Choose different file
                </button>
              </div>

              {/* Detected Column Mapping */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-semibold text-slate-700">Auto-Detected Field Mappings:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 pt-1">
                  <div>
                    <span className="font-medium text-slate-500">Narrative:</span>{" "}
                    <code className="text-teal-700 font-mono text-[11px]">
                      {parsedData.columns.textCol || "auto-detected"}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">ID:</span>{" "}
                    <code className="text-teal-700 font-mono text-[11px]">
                      {parsedData.columns.idCol || "auto-generated"}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Date:</span>{" "}
                    <code className="text-teal-700 font-mono text-[11px]">
                      {parsedData.columns.dateCol || "current date"}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Patient:</span>{" "}
                    <code className="text-teal-700 font-mono text-[11px]">
                      {parsedData.columns.patientCol || "auto-numbered"}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Facility:</span>{" "}
                    <code className="text-teal-700 font-mono text-[11px]">
                      {parsedData.columns.facilityCol || "default"}
                    </code>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Channel:</span>{" "}
                    <code className="text-teal-700 font-mono text-[11px]">
                      {parsedData.columns.sourceCol || "Feedback"}
                    </code>
                  </div>
                </div>
              </div>

              {/* Preview records snippet */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Patient</th>
                      <th className="px-3 py-2 text-left">Complaint Excerpt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedData.complaints.slice(0, 5).map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 font-mono text-[11px] font-semibold text-slate-700">
                          {c.id}
                        </td>
                        <td className="px-3 py-1.5 text-slate-600 whitespace-nowrap">
                          {c.patientNameOrId}
                        </td>
                        <td className="px-3 py-1.5 text-slate-600 truncate max-w-xs">
                          {c.complaintText}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Auto triage checkbox */}
              <div className="flex items-center space-x-2 p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                <input
                  type="checkbox"
                  id="autoTriageCheckbox"
                  checked={autoTriageOnImport}
                  onChange={(e) => setAutoTriageOnImport(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label
                  htmlFor="autoTriageCheckbox"
                  className="text-xs font-semibold text-indigo-900 cursor-pointer flex items-center"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                  Automatically run AI Triage on imported complaints immediately
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          {parsedData && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors"
            >
              Import {parsedData.complaints.length} Records
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
