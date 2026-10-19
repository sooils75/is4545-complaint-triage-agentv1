import * as XLSX from "xlsx";
import { Complaint, ComplaintSource } from "../types/triage";

export interface ParsedUploadResult {
  complaints: Complaint[];
  totalRows: number;
  detectedColumns: {
    idCol?: string;
    textCol?: string;
    dateCol?: string;
    patientCol?: string;
    facilityCol?: string;
    sourceCol?: string;
  };
  filename: string;
}

export function parseSpreadsheetFile(
  file: File
): Promise<ParsedUploadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          throw new Error("The uploaded file does not contain any data rows.");
        }

        const headers = Object.keys(rawJson[0]);

        // Auto-detect columns with fuzzy matching
        const findCol = (candidates: string[]) => {
          return headers.find((h) => {
            const clean = h.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
            return candidates.some((c) => clean.includes(c) || c.includes(clean));
          });
        };

        const idCol = findCol(["id", "complaintid", "ticket", "ref", "caseno", "number"]);
        const textCol = findCol([
          "complaint",
          "complainttext",
          "text",
          "details",
          "description",
          "feedback",
          "comment",
          "message",
          "grievance",
          "issue"
        ]);
        const dateCol = findCol(["date", "datereceived", "timestamp", "createdat", "time"]);
        const patientCol = findCol(["patient", "patientid", "name", "patientname", "mrn", "submitter"]);
        const facilityCol = findCol(["facility", "unit", "clinic", "department", "location", "site"]);
        const sourceCol = findCol(["source", "channel", "type", "origin", "medium"]);

        // If no text column found, find the column with the highest average string length
        let actualTextCol = textCol;
        if (!actualTextCol) {
          let maxLength = -1;
          for (const h of headers) {
            const avgLen =
              rawJson.reduce((acc, row) => acc + String(row[h] || "").length, 0) /
              rawJson.length;
            if (avgLen > maxLength) {
              maxLength = avgLen;
              actualTextCol = h;
            }
          }
        }

        const now = new Date();
        const dateString = now.toISOString().replace("T", " ").slice(0, 16);

        const complaints: Complaint[] = rawJson
          .filter((row) => {
            const textVal = actualTextCol ? String(row[actualTextCol] || "").trim() : "";
            return textVal.length > 0;
          })
          .map((row, index) => {
            const rawId = idCol ? String(row[idCol]).trim() : "";
            const id = rawId || `UPL-${Date.now().toString().slice(-4)}-${String(index + 1).padStart(3, "0")}`;

            const text = actualTextCol ? String(row[actualTextCol]).trim() : "";
            const rawDate = dateCol ? String(row[dateCol]).trim() : "";
            const date = rawDate || dateString;
            const patient = patientCol ? String(row[patientCol]).trim() : `Patient #${10000 + index}`;
            const facility = facilityCol ? String(row[facilityCol]).trim() : "General Hospital / Outpatient";
            const rawSource = sourceCol ? String(row[sourceCol]).trim() : "";

            let source: ComplaintSource = "Feedback Submission";
            const sLower = rawSource.toLowerCase();
            if (sLower.includes("portal")) source = "Patient Portal";
            else if (sLower.includes("survey")) source = "Survey Comment";
            else if (sLower.includes("grievance")) source = "Grievance Report";
            else if (sLower.includes("review") || sLower.includes("google") || sLower.includes("yelp"))
              source = "Online Review";
            else if (sLower.includes("phone") || sLower.includes("person") || sLower.includes("call"))
              source = "In-Person / Phone";

            return {
              id,
              dateReceived: date,
              patientNameOrId: patient,
              source,
              facilityOrUnit: facility,
              complaintText: text,
              status: "Pending Triage",
            };
          });

        resolve({
          complaints,
          totalRows: complaints.length,
          detectedColumns: {
            idCol,
            textCol: actualTextCol,
            dateCol,
            patientCol,
            facilityCol,
            sourceCol,
          },
          filename: file.name,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (e) => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function exportComplaintsToSpreadsheet(complaints: Complaint[], format: "csv" | "xlsx" = "csv") {
  const exportData = complaints.map((c) => {
    const t = c.triageResult;
    return {
      "Complaint ID": c.id,
      "Date Received": c.dateReceived,
      "Patient Identifier": c.patientNameOrId,
      "Intake Source": c.source,
      "Facility / Unit": c.facilityOrUnit,
      "Complaint Text": c.complaintText,
      "Triage Status": c.status,
      "Primary Category": t?.primaryCategory || "Unassigned",
      "Secondary Categories": (t?.secondaryCategories || []).join(", "),
      "Severity Level": t?.severityLevel || "Unassigned",
      "Severity Justification": t?.severityJustification || "",
      "Risk Flags": (t?.riskFlags || []).map((r) => `${r.riskType}: ${r.explanation}`).join(" | "),
      "Recommended Department": t?.recommendedDepartment || "Unassigned",
      "Escalation Priority": t?.escalationPriority || "Unassigned",
      "Human Review Status": t?.humanReviewStatus || "Unassigned",
      "Human Review Reason": t?.humanReviewTriggerReason || "",
      "Executive Summary": t?.executiveSummary || "",
      "Reviewer Notes": c.humanReviewNotes || "",
      "Assigned Reviewer": c.assignedReviewer || "",
      "Triaged At": t?.triagedAt || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Triaged Complaints");

  const fileName = `complaint_triage_export_${new Date().toISOString().slice(0, 10)}.${format}`;
  XLSX.writeFile(workbook, fileName, { bookType: format });
}

export function generateTemplateFile(format: "csv" | "xlsx" = "csv") {
  const templateRows = [
    {
      "Complaint_ID": "TPL-001",
      "Date_Received": "2026-10-19 09:30",
      "Patient_ID": "Patient #10420",
      "Source": "Patient Portal",
      "Facility_Unit": "Emergency Department",
      "Complaint_Text": "I waited 4 hours with active chest pain while nurses ignored my call light. When medication was administered, the nurse brought penicillin despite my red allergy bracelet."
    },
    {
      "Complaint_ID": "TPL-002",
      "Date_Received": "2026-10-19 10:15",
      "Patient_ID": "Patient #88129",
      "Source": "Grievance Report",
      "Facility_Unit": "Radiology Pavilion",
      "Complaint_Text": "Technician refused to accommodate my wheelchair and made derogatory comments about disabled patients. The transfer board was missing."
    },
    {
      "Complaint_ID": "TPL-003",
      "Date_Received": "2026-10-19 11:00",
      "Patient_ID": "Patient #39281",
      "Source": "Survey Comment",
      "Facility_Unit": "Outpatient Pediatrics",
      "Complaint_Text": "Clinic waiting area was clean and nurse was gentle, but the billing statement charged $350 for a preventative vaccine that insurance told us was 100% covered."
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Complaint_Template");

  const fileName = `healthcare_complaints_sample_template.${format}`;
  XLSX.writeFile(workbook, fileName, { bookType: format });
}
