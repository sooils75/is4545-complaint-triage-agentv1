import React from "react";
import { Sparkles, ShieldAlert, Activity } from "lucide-react";

interface BatchTriageProgressProps {
  current: number;
  total: number;
  isProcessing: boolean;
}

export const BatchTriageProgress: React.FC<BatchTriageProgressProps> = ({
  current,
  total,
  isProcessing,
}) => {
  if (!isProcessing || total === 0) return null;

  const percentage = Math.round((current / total) * 100);

  return (
    <div className="bg-indigo-900 text-white rounded-xl p-4 mb-5 shadow-lg border border-indigo-700 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center">
              Executing AI Complaint Triage Protocol
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-800 text-indigo-200">
                <Activity className="w-3 h-3 mr-1 animate-pulse" /> Gemini 3.8 Flash
              </span>
            </h4>
            <p className="text-xs text-indigo-200">
              Assessing clinical severity, detecting safety/regulatory risks, and determining human review triggers
            </p>
          </div>
        </div>
        <span className="text-sm font-bold font-mono text-yellow-300">
          {current} / {total} ({percentage}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-indigo-950 rounded-full h-2.5 overflow-hidden mt-3">
        <div
          className="bg-gradient-to-r from-teal-400 to-indigo-400 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.max(percentage, 5)}%` }}
        />
      </div>
    </div>
  );
};
