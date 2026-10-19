import React, { useState } from "react";
import {
  PlusCircle,
  X,
  Sparkles,
  Building,
  User,
  Tag,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Complaint, ComplaintSource } from "../types/triage";

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (complaint: Complaint, autoTriage: boolean) => void;
}

const SOURCES: ComplaintSource[] = [
  "Patient Portal",
  "Grievance Report",
  "Survey Comment",
  "Online Review",
  "Feedback Submission",
  "In-Person / Phone",
];

const PRESETS = [
  {
    title: "Medication Error",
    source: "Grievance Report" as ComplaintSource,
    unit: "Inpatient Oncology",
    patient: "Patient #55219",
    text: "The nurse gave me 50mg of morphine instead of the ordered 5mg dose. I suffered severe respiratory depression, had to receive Narcan, and my transfer to the regular floor was delayed.",
  },
  {
    title: "HIPAA / Privacy Breach",
    source: "Patient Portal" as ComplaintSource,
    unit: "Women's Health Pavilion",
    patient: "Patient #33910",
    text: "When I checked in at the desk, the receptionist loudly announced my positive pregnancy test and full name to the entire waiting room of 20 people. My neighbor was sitting right next to me.",
  },
  {
    title: "ADA Accessibility & Equity",
    source: "Feedback Submission" as ComplaintSource,
    unit: "Outpatient Imaging",
    patient: "Patient #19028",
    text: "The clinic elevator was out of order with no handicap alternative. The staff told me they would not reschedule and charged me a $75 no-show fee because I couldn't climb the stairs in my wheelchair.",
  },
  {
    title: "Surprise Medical Bill",
    source: "Grievance Report" as ComplaintSource,
    unit: "Surgical Services",
    patient: "Patient #67123",
    text: "I was told my knee arthroscopy was 100% pre-authorized and in-network. Three weeks later I received an unexpected bill for $6,200 from an out-of-network anesthesiologist who was assigned without my consent.",
  },
];

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [source, setSource] = useState<ComplaintSource>("Patient Portal");
  const [patient, setPatient] = useState("");
  const [facility, setFacility] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    setSource(preset.source);
    setFacility(preset.unit);
    setPatient(preset.patient);
    setComplaintText(preset.text);
    setError(null);
  };

  const handleSubmit = (autoTriage: boolean) => {
    if (!complaintText.trim()) {
      setError("Please enter the patient complaint narrative.");
      return;
    }

    const now = new Date();
    const dateReceived = now.toISOString().replace("T", " ").slice(0, 16);
    const id = `CMP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint: Complaint = {
      id,
      dateReceived,
      patientNameOrId: patient.trim() || `Patient #${Math.floor(10000 + Math.random() * 90000)}`,
      source,
      facilityOrUnit: facility.trim() || "Main Hospital / Outpatient",
      complaintText: complaintText.trim(),
      status: "Pending Triage",
    };

    onSubmit(newComplaint, autoTriage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Log New Patient Complaint
              </h3>
              <p className="text-xs text-slate-500">
                Enter grievance narrative, survey feedback, or portal escalation
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Quick preset chips */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Load Realistic Clinical Scenario
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200 transition-colors font-medium"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Source */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intake Source / Channel
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as ComplaintSource)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Name / Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Identifier / Name
              </label>
              <input
                type="text"
                value={patient}
                onChange={(e) => setPatient(e.target.value)}
                placeholder="e.g. Patient #40291 or Anonymous"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Facility / Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facility / Clinical Unit
              </label>
              <input
                type="text"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="e.g. Emergency Dept, Med-Surg"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Narrative */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Patient Complaint Narrative <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                {complaintText.length} characters
              </span>
            </div>
            <textarea
              rows={5}
              value={complaintText}
              onChange={(e) => {
                setComplaintText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste or enter the full complaint statement, patient portal message, or incident details..."
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </button>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              Save as Pending
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Triage with AI Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
