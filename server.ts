import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

const SYSTEM_INSTRUCTION = `
You are a Healthcare Complaint Triage Assistant.
Your purpose is to help healthcare organizations review, prioritize, and route patient complaints efficiently while maintaining patient safety, fairness, compliance, and appropriate human oversight.
You will receive patient complaints, patient portal messages, survey comments, grievance reports, online reviews, or feedback submissions.

Your role is NOT to resolve complaints.
Your role is to triage complaints and determine:
- What happened
- How serious it is
- Who should review it
- How quickly it should be addressed
- Whether human intervention is required

For every complaint, complete all 6 steps:

STEP 1: Complaint Category
Classify the complaint into one primary category from:
- Communication
- Scheduling
- Wait Time
- Technology / Patient Portal
- Billing
- Clinical Care
- Discharge and Follow-Up
- Accessibility and Equity
- Patient Safety
- Privacy or Security
- Staff Conduct
- Other
Identify primary category and any secondary categories.

STEP 2: Severity Assessment
Assign a severity level:
- LEVEL 1 – Low (Minor inconvenience, routine dissatisfaction, general suggestion)
- LEVEL 2 – Moderate (Repeated service failures, significant frustration, communication breakdown)
- LEVEL 3 – High (Potential patient harm, medication-related concern, serious accessibility issue, escalated complaint)
- LEVEL 4 – Critical (Immediate patient safety risk, potential legal exposure, serious privacy violation, discrimination allegation)
Provide reasoning for the assigned severity.

STEP 3: Risk Detection
Identify applicable risks from:
- Patient Safety Risk
- Clinical Risk
- Compliance Risk
- Privacy Risk
- Accessibility Risk
- Equity Risk
- Reputational Risk
- Operational Risk
Explain why each risk was flagged.

STEP 4: Escalation Recommendation
ROUTE TO one of:
- Patient Experience Team
- Nursing Leadership
- Physician Leadership
- Quality Improvement Team
- Compliance Office
- Information Technology
- Revenue Cycle / Billing
- Accessibility Coordinator
- Risk Management
- Executive Review
Indicate whether escalation is: Routine, Priority, or Immediate.

STEP 5: Human Review Requirement
Determine: AI Review Only, Human Review Recommended, or Human Review Required.
CRITICAL MANDATE: Human Review Required MUST be selected whenever:
- Patient safety concerns exist
- Discrimination is alleged
- Privacy concerns exist
- Legal or compliance risks are present
- The complaint is ambiguous and requires investigation

STEP 6: Executive Summary
Create a concise executive summary including:
- Complaint category
- Severity level
- Major risk
- Recommended action
`;

const triageSchema = {
  type: Type.OBJECT,
  properties: {
    primaryCategory: {
      type: Type.STRING,
      description: "Primary category from: Communication, Scheduling, Wait Time, Technology / Patient Portal, Billing, Clinical Care, Discharge and Follow-Up, Accessibility and Equity, Patient Safety, Privacy or Security, Staff Conduct, Other"
    },
    secondaryCategories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Any secondary categories"
    },
    severityLevel: {
      type: Type.STRING,
      description: "Exact string: 'LEVEL 1 – Low', 'LEVEL 2 – Moderate', 'LEVEL 3 – High', or 'LEVEL 4 – Critical'"
    },
    severityJustification: {
      type: Type.STRING,
      description: "Reasoning for the assigned severity level"
    },
    riskFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          riskType: {
            type: Type.STRING,
            description: "From: Patient Safety Risk, Clinical Risk, Compliance Risk, Privacy Risk, Accessibility Risk, Equity Risk, Reputational Risk, Operational Risk"
          },
          explanation: {
            type: Type.STRING,
            description: "Why this risk was flagged"
          }
        },
        required: ["riskType", "explanation"]
      },
      description: "All flagged risks with specific explanations"
    },
    recommendedDepartment: {
      type: Type.STRING,
      description: "From: Patient Experience Team, Nursing Leadership, Physician Leadership, Quality Improvement Team, Compliance Office, Information Technology, Revenue Cycle / Billing, Accessibility Coordinator, Risk Management, Executive Review"
    },
    escalationPriority: {
      type: Type.STRING,
      description: "Exact string: 'Routine', 'Priority', or 'Immediate'"
    },
    humanReviewStatus: {
      type: Type.STRING,
      description: "Exact string: 'AI Review Only', 'Human Review Recommended', or 'Human Review Required'"
    },
    humanReviewTriggerReason: {
      type: Type.STRING,
      description: "Explanation of why human review status was assigned (citing safety, discrimination, privacy, compliance, or ambiguity)"
    },
    executiveSummary: {
      type: Type.STRING,
      description: "Concise executive summary covering category, severity, major risk, and recommended action"
    },
    keyConcernsExtracted: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Concise bullet points of factual issues raised in complaint"
    }
  },
  required: [
    "primaryCategory",
    "secondaryCategories",
    "severityLevel",
    "severityJustification",
    "riskFlags",
    "recommendedDepartment",
    "escalationPriority",
    "humanReviewStatus",
    "humanReviewTriggerReason",
    "executiveSummary"
  ]
};

// Helper to retry Gemini calls if 503/429 occurs
async function generateWithRetry(contents: string, maxRetries = 2) {
  let lastError: any = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
      return await ai!.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: triageSchema as any,
          temperature: 0.1,
        },
      });
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 503 ||
        err?.message?.includes("503") ||
        err?.message?.includes("UNAVAILABLE") ||
        err?.status === 429 ||
        err?.message?.includes("429") ||
        err?.message?.includes("RESOURCE_EXHAUSTED");
      if (!isTransient || attempt === maxRetries) {
        throw err;
      }
    }
  }
  throw lastError;
}

// Fallback rule-based triage if API is unavailable or offline
function fallbackTriage(complaintText: string, metadata?: Record<string, any>) {
  const text = complaintText.toLowerCase();

  let primaryCategory = "Communication";
  const secondaryCategories: string[] = [];

  const isSafetyMed =
    text.includes("dose") ||
    text.includes("medication") ||
    text.includes("morphine") ||
    text.includes("insulin") ||
    text.includes("narcan") ||
    text.includes("mg ") ||
    text.includes("allergic") ||
    text.includes("allergy") ||
    text.includes("overdose") ||
    text.includes("wrong drug") ||
    text.includes("fall") ||
    text.includes("infection") ||
    text.includes("surgical") ||
    text.includes("safety") ||
    text.includes("bleed") ||
    text.includes("breath") ||
    text.includes("respirat") ||
    text.includes("code blue") ||
    text.includes("rapid response") ||
    text.includes("icu");

  const isClinical =
    text.includes("doctor") ||
    text.includes("misdiagnos") ||
    text.includes("treatment") ||
    text.includes("surgery") ||
    text.includes("physician") ||
    text.includes("pain") ||
    text.includes("wound") ||
    text.includes("clinical") ||
    text.includes("biopsy") ||
    text.includes("pathology") ||
    text.includes("nurse");

  const isPrivacy =
    text.includes("hipaa") ||
    text.includes("privacy") ||
    text.includes("confidential") ||
    text.includes("record leak") ||
    text.includes("neighbor") ||
    text.includes("unauthorized") ||
    text.includes("security") ||
    text.includes("social security") ||
    text.includes("ssn") ||
    text.includes("mailbox");

  const isBilling =
    text.includes("bill") ||
    text.includes("charge") ||
    text.includes("insurance") ||
    text.includes("copay") ||
    text.includes("out-of-network") ||
    text.includes("financial") ||
    text.includes("cost") ||
    text.includes("collection") ||
    text.includes("no surprises act") ||
    text.includes("balance bill") ||
    text.includes("statement");

  const isAccessibility =
    text.includes("wheelchair") ||
    text.includes("ramp") ||
    text.includes("sign language") ||
    text.includes("interpreter") ||
    text.includes("discriminat") ||
    text.includes("racist") ||
    text.includes("racism") ||
    text.includes("bias") ||
    text.includes("ada ") ||
    text.includes("equity") ||
    text.includes("mandarin") ||
    text.includes("spanish") ||
    text.includes("translator") ||
    text.includes("elevator") ||
    text.includes("handicap");

  const isTechPortal =
    text.includes("portal") ||
    text.includes("password") ||
    text.includes("app") ||
    text.includes("login") ||
    text.includes("website") ||
    text.includes("down") ||
    text.includes("server error") ||
    text.includes("system error") ||
    text.includes("mychart") ||
    text.includes("error 500");

  const isDischarge =
    text.includes("discharge") ||
    text.includes("instructions") ||
    text.includes("follow up") ||
    text.includes("home health") ||
    text.includes("staples") ||
    text.includes("aftercare");

  const isStaffConduct =
    text.includes("rude") ||
    text.includes("yelled") ||
    text.includes("attitude") ||
    text.includes("mock") ||
    text.includes("disrespect") ||
    text.includes("dismissive") ||
    text.includes("laughed at") ||
    text.includes("arrogant");

  const isWaitTime =
    text.includes("wait") ||
    text.includes("delay") ||
    text.includes("waiting room") ||
    text.includes("tardy") ||
    text.includes("hour");

  const isScheduling =
    text.includes("appointment") ||
    text.includes("cancel") ||
    text.includes("reschedul") ||
    text.includes("calendar") ||
    text.includes("check-in") ||
    text.includes("booking");

  if (isSafetyMed) {
    primaryCategory = "Patient Safety";
    if (isClinical) secondaryCategories.push("Clinical Care");
    if (isStaffConduct) secondaryCategories.push("Staff Conduct");
  } else if (isPrivacy) {
    primaryCategory = "Privacy or Security";
    if (isStaffConduct) secondaryCategories.push("Staff Conduct");
  } else if (isAccessibility) {
    primaryCategory = "Accessibility and Equity";
    if (isStaffConduct) secondaryCategories.push("Staff Conduct");
  } else if (isClinical) {
    primaryCategory = "Clinical Care";
    if (isWaitTime) secondaryCategories.push("Wait Time");
  } else if (isBilling) {
    primaryCategory = "Billing";
  } else if (isTechPortal) {
    primaryCategory = "Technology / Patient Portal";
  } else if (isDischarge) {
    primaryCategory = "Discharge and Follow-Up";
  } else if (isStaffConduct) {
    primaryCategory = "Staff Conduct";
  } else if (isScheduling) {
    primaryCategory = "Scheduling";
  } else if (isWaitTime) {
    primaryCategory = "Wait Time";
  }

  // Severity & Risk calculation
  let severityLevel = "LEVEL 2 – Moderate";
  let severityJustification = "Moderate operational and patient service friction identified.";
  let escalationPriority: "Routine" | "Priority" | "Immediate" = "Routine";
  let humanReviewStatus: "AI Review Only" | "Human Review Recommended" | "Human Review Required" = "Human Review Recommended";
  let humanReviewTriggerReason = "Supervisory review recommended for patient feedback resolution.";
  let recommendedDepartment = "Patient Experience Team";
  const riskFlags: { riskType: string; explanation: string }[] = [];

  const hasCriticalHarmRisk =
    text.includes("narcan") ||
    text.includes("morphine") ||
    text.includes("overdose") ||
    text.includes("stopped breathing") ||
    text.includes("unresponsive") ||
    text.includes("code blue") ||
    text.includes("rapid response") ||
    text.includes("died") ||
    text.includes("critical") ||
    text.includes("icu") ||
    text.includes("severe allergic") ||
    text.includes("anaphylaxis") ||
    text.includes("wrong patient") ||
    text.includes("sue") ||
    text.includes("lawyer") ||
    text.includes("malpractice");

  const hasHighRiskMedOrClinical =
    isSafetyMed ||
    text.includes("medication") ||
    text.includes("wrong dose") ||
    text.includes("prescrib") ||
    text.includes("infection") ||
    text.includes("misdiagnos") ||
    text.includes("sepsis");

  if (hasCriticalHarmRisk || (primaryCategory === "Patient Safety" && (text.includes("wrong") || text.includes("severe") || text.includes("harm") || text.includes("insulin") || text.includes("fall")))) {
    severityLevel = "LEVEL 4 – Critical";
    severityJustification = "Critical acute patient safety hazard or severe clinical adverse event with immediate life-safety or legal liability implications.";
    escalationPriority = "Immediate";
    humanReviewStatus = "Human Review Required";
    humanReviewTriggerReason = "Patient safety risk and potential severe regulatory/legal exposure necessitates mandatory human review.";
    recommendedDepartment = "Risk Management";
    riskFlags.push({ riskType: "Patient Safety Risk", explanation: "Critical medication, physiological, or procedural safety incident with high potential for acute harm." });
    riskFlags.push({ riskType: "Clinical Risk", explanation: "Immediate clinical intervention and sentinel event containment required." });
    riskFlags.push({ riskType: "Compliance Risk", explanation: "Mandatory clinical governance and regulatory oversight threshold met." });
  } else if (isPrivacy) {
    severityLevel = "LEVEL 3 – High";
    severityJustification = "Significant unauthorized exposure of Protected Health Information (PHI) requiring formal compliance breach review.";
    escalationPriority = "Priority";
    humanReviewStatus = "Human Review Required";
    humanReviewTriggerReason = "Privacy and HIPAA compliance concerns trigger mandatory Human Review.";
    recommendedDepartment = "Compliance Office";
    riskFlags.push({ riskType: "Privacy Risk", explanation: "Potential unauthorized disclosure or breach of confidential patient health information." });
    riskFlags.push({ riskType: "Compliance Risk", explanation: "Statutory HIPAA Privacy Rule compliance investigation warranted." });
  } else if (isAccessibility) {
    severityLevel = "LEVEL 3 – High";
    severityJustification = "Serious barrier to healthcare access, physical accessibility violation, or alleged discrimination.";
    escalationPriority = "Priority";
    humanReviewStatus = "Human Review Required";
    humanReviewTriggerReason = "Discrimination allegation or accessibility violation triggers mandatory Human Review.";
    recommendedDepartment = "Accessibility Coordinator";
    riskFlags.push({ riskType: "Accessibility Risk", explanation: "Physical or structural impediment compromising patient access." });
    riskFlags.push({ riskType: "Equity Risk", explanation: "Denial of equitable care, language access, or fair accommodation." });
    riskFlags.push({ riskType: "Compliance Risk", explanation: "Title VI and Section 1557 ACA regulatory compliance review required." });
  } else if (hasHighRiskMedOrClinical || primaryCategory === "Clinical Care") {
    severityLevel = "LEVEL 3 – High";
    severityJustification = "Substantive clinical care or medication concern requiring prompt medical leadership review.";
    escalationPriority = "Priority";
    humanReviewStatus = "Human Review Required";
    humanReviewTriggerReason = "Clinical care quality and patient safety risks mandate physician/nursing leadership investigation.";
    recommendedDepartment = "Physician Leadership";
    riskFlags.push({ riskType: "Clinical Risk", explanation: "Adherence to clinical guidelines or diagnostic execution under review." });
    riskFlags.push({ riskType: "Patient Safety Risk", explanation: "Vulnerability in care delivery that could impact clinical recovery." });
  } else if (isBilling) {
    severityLevel = "LEVEL 2 – Moderate";
    severityJustification = "Billing dispute, unexpected out-of-network charge, or insurance balance dispute causing patient grievance.";
    escalationPriority = "Routine";
    humanReviewStatus = "Human Review Recommended";
    humanReviewTriggerReason = "Financial review recommended by patient financial counselors to clarify billing and prevent dispute escalation.";
    recommendedDepartment = "Revenue Cycle / Billing";
    riskFlags.push({ riskType: "Operational Risk", explanation: "Discrepancy in billing adjudication or insurance pre-authorization." });
    riskFlags.push({ riskType: "Reputational Risk", explanation: "Billing friction impacting patient loyalty and institutional trust." });
  } else if (isTechPortal) {
    severityLevel = "LEVEL 2 – Moderate";
    severityJustification = "Patient portal outage or authentication failure impacting access to results or communication.";
    escalationPriority = "Routine";
    humanReviewStatus = "AI Review Only";
    humanReviewTriggerReason = "Technical portal incident logged for IT system maintenance without clinical dispute.";
    recommendedDepartment = "Information Technology";
    riskFlags.push({ riskType: "Operational Risk", explanation: "Digital portal connectivity or server outage." });
  } else if (isStaffConduct) {
    severityLevel = "LEVEL 2 – Moderate";
    severityJustification = "Interpersonal friction and perceived unprofessional demeanor by clinical or support staff.";
    escalationPriority = "Routine";
    humanReviewStatus = "Human Review Recommended";
    humanReviewTriggerReason = "Service recovery and unit manager coaching recommended.";
    recommendedDepartment = "Nursing Leadership";
    riskFlags.push({ riskType: "Reputational Risk", explanation: "Staff conduct negatively impacting patient experience and satisfaction." });
  } else if (text.includes("cold") || text.includes("parking") || text.includes("cafeteria") || text.includes("sanitizer") || text.length < 50) {
    severityLevel = "LEVEL 1 – Low";
    severityJustification = "Minor routine convenience or environmental issue with no impact on clinical safety.";
    escalationPriority = "Routine";
    humanReviewStatus = "AI Review Only";
    humanReviewTriggerReason = "Routine low-impact service feedback logged into experience dashboard.";
    recommendedDepartment = "Patient Experience Team";
    riskFlags.push({ riskType: "Operational Risk", explanation: "Minor facility or environmental convenience item." });
  } else {
    severityLevel = "LEVEL 2 – Moderate";
    severityJustification = "Service delay or communication breakdown impacting the care experience.";
    escalationPriority = "Routine";
    humanReviewStatus = "Human Review Recommended";
    humanReviewTriggerReason = "Routine human review recommended for service recovery.";
    recommendedDepartment = "Patient Experience Team";
    riskFlags.push({ riskType: "Operational Risk", explanation: "Service delivery breakdown or workflow delay." });
    riskFlags.push({ riskType: "Reputational Risk", explanation: "Patient dissatisfaction with hospital service flow." });
  }

  const executiveSummary = `${primaryCategory} concern assessed at ${severityLevel}. Major risks identified: ${riskFlags.map((r) => r.riskType).join(", ") || "Operational"}. Recommended routing to ${recommendedDepartment} with ${escalationPriority} priority; ${humanReviewStatus}.`;

  return {
    primaryCategory,
    secondaryCategories,
    severityLevel,
    severityJustification,
    riskFlags,
    recommendedDepartment,
    escalationPriority,
    humanReviewStatus,
    humanReviewTriggerReason,
    executiveSummary,
    keyConcernsExtracted: [
      complaintText.slice(0, 120) + (complaintText.length > 120 ? "..." : "")
    ]
  };
}

// Single complaint triage route
app.post("/api/triage", async (req: Request, res: Response) => {
  const { complaintText, metadata } = req.body;

  if (!complaintText || typeof complaintText !== "string" || !complaintText.trim()) {
    return res.status(400).json({ error: "complaintText is required" });
  }

  if (!ai) {
    // Return high quality rule-based response
    const result = fallbackTriage(complaintText, metadata);
    return res.json({ result, modelUsed: "heuristic-fallback" });
  }

  try {
    const prompt = `
Please triage this patient complaint according to your 6-step Healthcare Complaint Triage Protocol.

COMPLAINT DETAILS:
${complaintText}

METADATA (if available):
${metadata ? JSON.stringify(metadata, null, 2) : "None provided"}

OUTPUT REQUIREMENTS:
Follow all 6 steps strictly. Ensure humanReviewStatus is 'Human Review Required' if any patient safety, privacy/HIPAA, discrimination, or legal risks exist.
`;

    const response = await generateWithRetry(prompt, 2);

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini model");
    }

    const parsed = JSON.parse(responseText.trim());
    return res.json({ result: parsed, modelUsed: "gemini-3.8-flash" });
  } catch (err: any) {
    console.error("Gemini triage error, using robust clinical fallback:", err);
    const fallback = fallbackTriage(complaintText, metadata);
    return res.json({ result: fallback, modelUsed: "heuristic-fallback", errorNote: err?.message });
  }
});

// Batch triage route for rapid processing of uploaded CSV/Excel files
app.post("/api/triage/batch", async (req: Request, res: Response) => {
  const { items } = req.body; // Array of { id, text, metadata }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items array is required" });
  }

  const results: any[] = [];

  // Process in small parallel chunks (up to 4 at a time) to stay within rate limits and maintain low latency
  const CHUNK_SIZE = 4;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const chunkPromises = chunk.map(async (item) => {
      const text = item.text || item.complaintText || "";
      if (!text.trim()) {
        return {
          id: item.id,
          error: "Empty complaint text",
          status: "failed",
        };
      }

      if (!ai) {
        return {
          id: item.id,
          result: fallbackTriage(text, item.metadata),
          status: "success",
          modelUsed: "heuristic-fallback",
        };
      }

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Triage this healthcare complaint following all 6 steps:\n${text}`,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: triageSchema as any,
            temperature: 0.1,
          },
        });

        const parsed = JSON.parse(response.text?.trim() || "{}");
        return {
          id: item.id,
          result: parsed,
          status: "success",
          modelUsed: "gemini-3.8-flash",
        };
      } catch (err: any) {
        return {
          id: item.id,
          result: fallbackTriage(text, item.metadata),
          status: "success",
          modelUsed: "heuristic-fallback",
          warning: err?.message,
        };
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  res.json({ results });
});

// API health endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Complaint Triage Agent server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
