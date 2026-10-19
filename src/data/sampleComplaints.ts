import { Complaint } from "../types/triage";

export const SAMPLE_COMPLAINTS: Complaint[] = [
  {
    id: "CMP-2026-0841",
    dateReceived: "2026-10-18 09:15",
    patientNameOrId: "Patient #40921 (J. Miller)",
    source: "Grievance Report",
    facilityOrUnit: "Memorial Hospital - 4-West Med-Surg",
    complaintText:
      "My father was admitted for pneumonia on Tuesday. At 2:00 AM, the night nurse came in with insulin. My father is NOT diabetic and had no insulin orders. When he questioned it, the nurse stated 'just take it, the doctor ordered it.' Within 45 minutes his blood sugar crashed to 38, he became non-responsive, and a rapid response code had to be called. He had to be transferred to the ICU for severe hypoglycemia. This was a catastrophic near-fatal medication error and we want an immediate formal investigation.",
    status: "Triaged",
    triageResult: {
      primaryCategory: "Patient Safety",
      secondaryCategories: ["Clinical Care", "Staff Conduct"],
      severityLevel: "LEVEL 4 – Critical",
      severityJustification:
        "Administration of incorrect high-risk medication (insulin to a non-diabetic patient) resulted in profound hypoglycemia, patient collapse, and urgent ICU transfer. Poses immediate patient safety risk and substantial institutional liability.",
      riskFlags: [
        {
          riskType: "Patient Safety Risk",
          explanation: "Wrong-patient or wrong-drug medication administration leading to physiological collapse and ICU escalation."
        },
        {
          riskType: "Clinical Risk",
          explanation: "Failure to adhere to the five rights of medication administration and failure to verify when challenged by patient."
        },
        {
          riskType: "Compliance Risk",
          explanation: "Mandatory Sentinel Event reporting threshold under Joint Commission / CMS hospital condition of participation."
        },
        {
          riskType: "Reputational Risk",
          explanation: "Family explicitly requesting formal outside legal and regulatory investigation."
        }
      ],
      recommendedDepartment: "Risk Management",
      escalationPriority: "Immediate",
      humanReviewStatus: "Human Review Required",
      humanReviewTriggerReason:
        "Severe patient safety incident with critical adverse outcome and mandatory regulatory disclosure triggers mandatory immediate human review.",
      executiveSummary:
        "Patient Safety incident (medication error) rated LEVEL 4 – Critical. Non-diabetic patient given insulin resulting in severe hypoglycemic collapse and ICU transfer. Immediate escalation to Risk Management and Executive Review with mandatory human investigation.",
      keyConcernsExtracted: [
        "Wrong medication administered: insulin given to non-diabetic patient",
        "Staff ignored patient verbal challenge prior to injection",
        "Severe physiological harm: blood sugar 38, patient non-responsive",
        "Rapid response called; required ICU transfer"
      ],
      triagedAt: "2026-10-18T09:16:12Z",
      modelUsed: "gemini-3.8-flash"
    }
  },
  {
    id: "CMP-2026-0842",
    dateReceived: "2026-10-18 11:30",
    patientNameOrId: "Patient #11843 (M. Rodriguez)",
    source: "Patient Portal",
    facilityOrUnit: "Ambulatory Health Pavilion",
    complaintText:
      "I received a phone call from my next-door neighbor yesterday who handed me an unsealed medical envelope containing my complete surgical biopsy pathology results, full name, DOB, and social security number. It was delivered to their mailbox with my name handwritten on an open sleeve. How could your clinic send my sensitive cancer biopsy records to a stranger without any seal or verification? This is a blatant violation of my privacy rights.",
    status: "Triaged",
    triageResult: {
      primaryCategory: "Privacy or Security",
      secondaryCategories: ["Communication", "Staff Conduct"],
      severityLevel: "LEVEL 3 – High",
      severityJustification:
        "Unauthorized physical disclosure of sensitive Protected Health Information (PHI) including diagnostic cancer pathology and Social Security Number to an unrelated third party.",
      riskFlags: [
        {
          riskType: "Privacy Risk",
          explanation: "Direct HIPAA Privacy and Security Rule breach involving unsealed mailing of highly sensitive biopsy records."
        },
        {
          riskType: "Compliance Risk",
          explanation: "Potential Office for Civil Rights (OCR) breach notification requirement and institutional sanction risk."
        },
        {
          riskType: "Reputational Risk",
          explanation: "Severe breach of patient trust regarding medical record confidentiality."
        }
      ],
      recommendedDepartment: "Compliance Office",
      escalationPriority: "Priority",
      humanReviewStatus: "Human Review Required",
      humanReviewTriggerReason:
        "HIPAA Protected Health Information (PHI) disclosure involving sensitive pathology data and SSN demands compliance officer breach assessment.",
      executiveSummary:
        "Privacy or Security complaint rated LEVEL 3 – High. Unsealed mailing containing surgical biopsy pathology and SSN delivered to neighbor. Routed to Compliance Office on Priority escalation with Human Review Required for HIPAA breach reporting assessment.",
      keyConcernsExtracted: [
        "Unsealed envelope containing cancer biopsy pathology mailed to neighbor",
        "Disclosure of full name, DOB, and Social Security Number to third party",
        "Direct HIPAA violation reported by patient"
      ],
      triagedAt: "2026-10-18T11:31:05Z",
      modelUsed: "gemini-3.8-flash"
    }
  },
  {
    id: "CMP-2026-0843",
    dateReceived: "2026-10-18 14:02",
    patientNameOrId: "Patient #58390 (L. Chen)",
    source: "Feedback Submission",
    facilityOrUnit: "Urgent Care West Clinic",
    complaintText:
      "I brought my 78-year-old mother who uses an electric wheelchair to the clinic. The disabled access ramp was blocked completely with heavy trash bins and construction palettes. When I entered to ask for assistance, the receptionist said 'she will just have to walk up the 4 steps or wait outside.' My mother cannot walk. Furthermore, when my mother tried to explain her severe breathing difficulty in Mandarin, the triage staff laughed and refused to dial the certified medical interpreter phone line, saying 'we don't have time for translators today.'",
    status: "Triaged",
    triageResult: {
      primaryCategory: "Accessibility and Equity",
      secondaryCategories: ["Staff Conduct", "Patient Safety", "Clinical Care"],
      severityLevel: "LEVEL 3 – High",
      severityJustification:
        "Severe physical accessibility obstruction (ADA violation) combined with refusal of federally mandated Language Access Services for an acutely dyspneic elderly patient.",
      riskFlags: [
        {
          riskType: "Accessibility Risk",
          explanation: "Wheelchair access ramp physically obstructed in violation of Americans with Disabilities Act (ADA) standards."
        },
        {
          riskType: "Equity Risk",
          explanation: "Direct denial of certified medical interpretation services to a Limited English Proficiency (LEP) patient under Section 1557 ACA."
        },
        {
          riskType: "Clinical Risk",
          explanation: "Patient experiencing acute respiratory distress ('severe breathing difficulty') subjected to delay in evaluation."
        },
        {
          riskType: "Compliance Risk",
          explanation: "Civil Rights Title VI & Affordable Care Act Section 1557 language access non-compliance."
        }
      ],
      recommendedDepartment: "Accessibility Coordinator",
      escalationPriority: "Priority",
      humanReviewStatus: "Human Review Required",
      humanReviewTriggerReason:
        "Allegations of civil rights violations, ADA physical inaccessibility, and discriminatory denial of interpreter services require immediate human investigation.",
      executiveSummary:
        "Accessibility and Equity grievance rated LEVEL 3 – High. Obstructed wheelchair ramp and explicit refusal to provide medical interpreter for dyspneic LEP patient. Routed to Accessibility Coordinator & Quality Improvement with Priority escalation; Human Review Required.",
      keyConcernsExtracted: [
        "Wheelchair ramp blocked with trash bins and construction palettes",
        "Staff demanded non-ambulatory patient walk up 4 steps",
        "Explicit refusal to connect certified Mandarin medical interpreter",
        "Delayed clinical triage for acute breathing difficulty"
      ],
      triagedAt: "2026-10-18T14:03:19Z",
      modelUsed: "gemini-3.8-flash"
    }
  },
  {
    id: "CMP-2026-0844",
    dateReceived: "2026-10-18 16:45",
    patientNameOrId: "Patient #98124 (T. Washington)",
    source: "Online Review",
    facilityOrUnit: "Cardiology Specialty Center",
    complaintText:
      "I was scheduled for an urgent echocardiogram review with Dr. Vance. I took 3 hours off work and arrived 15 minutes early. The waiting room was crowded and nobody called my name. After waiting 1 hour and 45 minutes past my slot, I asked the desk. They realized they never clicked 'check-in' on their computer and the doctor had already left for the day. They offered no apology and rescheduled me 6 weeks out for an urgent heart valve check.",
    status: "Triaged",
    triageResult: {
      primaryCategory: "Scheduling",
      secondaryCategories: ["Wait Time", "Communication", "Staff Conduct"],
      severityLevel: "LEVEL 2 – Moderate",
      severityJustification:
        "Administrative check-in system failure resulting in a missed cardiology specialist visit and unacceptable 6-week postponement of an urgent clinical follow-up.",
      riskFlags: [
        {
          riskType: "Operational Risk",
          explanation: "Front desk electronic check-in workflow failure leaving patient un-queued in waiting room."
        },
        {
          riskType: "Clinical Risk",
          explanation: "6-week delay in cardiac valve assessment for an order marked urgent."
        },
        {
          riskType: "Reputational Risk",
          explanation: "Public 1-star online review describing lack of staff empathy and clinical delay."
        }
      ],
      recommendedDepartment: "Patient Experience Team",
      escalationPriority: "Routine",
      humanReviewStatus: "Human Review Recommended",
      humanReviewTriggerReason:
        "Urgent cardiac evaluation delayed by 6 weeks; clinical coordinator should expedite rescheduling while service recovery addresses patient frustration.",
      executiveSummary:
        "Scheduling and front-office breakdown rated LEVEL 2 – Moderate. Failure to register check-in caused missed cardiology consult and inappropriate 6-week delay. Routed to Patient Experience Team with Routine priority; Human Review Recommended.",
      keyConcernsExtracted: [
        "Patient waited 1 hour 45 minutes; staff failed to check patient in on system",
        "Physician departed; appointment lost",
        "Rescheduled 6 weeks out despite urgent cardiac referral",
        "Public online review posted"
      ],
      triagedAt: "2026-10-18T16:46:11Z",
      modelUsed: "gemini-3.8-flash"
    }
  },
  {
    id: "CMP-2026-0845",
    dateReceived: "2026-10-19 08:20",
    patientNameOrId: "Patient #23901 (K. Patel)",
    source: "Grievance Report",
    facilityOrUnit: "Revenue Cycle / Emergency Dept",
    complaintText:
      "I was taken by ambulance to your in-network emergency department for acute chest pain. My insurance fully covered the hospital facility fee. Now, four months later, I received a threatening collection notice for $8,450 from 'Independent Trauma Associates' which I have never heard of. When I called your billing office, the agent was dismissive and said 'hospital doctors are contractors, pay them or your credit will be ruined.' Under the Federal No Surprises Act, emergency balance billing is illegal. Fix this immediately or I am reporting you to CMS.",
    status: "Triaged",
    triageResult: {
      primaryCategory: "Billing",
      secondaryCategories: ["Communication", "Staff Conduct"],
      severityLevel: "LEVEL 2 – Moderate",
      severityJustification:
        "Alleged balance billing for emergency medical services in potential violation of the federal No Surprises Act, accompanied by aggressive debt collection threats.",
      riskFlags: [
        {
          riskType: "Compliance Risk",
          explanation: "Potential violation of the Federal No Surprises Act prohibiting out-of-network balance billing in emergency settings."
        },
        {
          riskType: "Reputational Risk",
          explanation: "Threatened complaint to CMS federal regulators and harm to patient credit score."
        },
        {
          riskType: "Operational Risk",
          explanation: "Lack of billing coordination between contracted emergency physician groups and hospital billing customer service."
        }
      ],
      recommendedDepartment: "Revenue Cycle / Billing",
      escalationPriority: "Priority",
      humanReviewStatus: "Human Review Required",
      humanReviewTriggerReason:
        "Legal/statutory compliance risk regarding Federal No Surprises Act emergency balance billing and collection freeze required.",
      executiveSummary:
        "Billing dispute rated LEVEL 2 – Moderate with high regulatory sensitivity. In-network ER patient received $8,450 balance bill sent to collections in possible No Surprises Act breach. Routed to Revenue Cycle / Billing on Priority escalation with Human Review Required.",
      keyConcernsExtracted: [
        "Emergency visit resulted in $8,450 surprise out-of-network physician bill",
        "Account sent to collections after 4 months",
        "Staff stated contractors are exempt; patient cited Federal No Surprises Act",
        "Threatened regulatory complaint to CMS"
      ],
      triagedAt: "2026-10-19T08:21:40Z",
      modelUsed: "gemini-3.8-flash"
    }
  },
  {
    id: "CMP-2026-0846",
    dateReceived: "2026-10-19 09:05",
    patientNameOrId: "Patient #77412 (A. Dubois)",
    source: "Survey Comment",
    facilityOrUnit: "Outpatient Family Medicine",
    complaintText:
      "The waiting area temperature was freezing cold on Monday morning, around 62 degrees. Several older patients were shivering with thin coats. Also, the hand sanitizer dispenser by the front door was completely empty. Overall Dr. Davis was very thorough and kind as always.",
    status: "Triaged",
    triageResult: {
      primaryCategory: "Wait Time",
      secondaryCategories: ["Other"],
      severityLevel: "LEVEL 1 – Low",
      severityJustification:
        "Minor facility comfort issue (cold waiting room thermostat) and depleted hygiene supply. No clinical harm or breakdown of medical care occurred.",
      riskFlags: [
        {
          riskType: "Operational Risk",
          explanation: "Facilities HVAC adjustment and environmental services hygiene refill needed."
        }
      ],
      recommendedDepartment: "Patient Experience Team",
      escalationPriority: "Routine",
      humanReviewStatus: "AI Review Only",
      humanReviewTriggerReason:
        "Routine low-level environmental feedback with positive clinical feedback; no safety or compliance concerns requiring human oversight.",
      executiveSummary:
        "Facility feedback classified under Wait Time / Other at LEVEL 1 – Low. Waiting room temperature too cold and empty hand sanitizer dispenser. Routed to Patient Experience Team with Routine priority; AI Review Only.",
      keyConcernsExtracted: [
        "Waiting room temperature cold (approx 62F)",
        "Front entrance hand sanitizer station empty",
        "Patient praised physician care"
      ],
      triagedAt: "2026-10-19T09:06:01Z",
      modelUsed: "gemini-3.8-flash"
    }
  },
  {
    id: "CMP-2026-0847",
    dateReceived: "2026-10-19 10:14",
    patientNameOrId: "Patient #62198 (E. Kowalski)",
    source: "Patient Portal",
    facilityOrUnit: "Cardiology Anticoagulation Clinic",
    complaintText:
      "Your patient portal has been throwing a 'Server Error 500' since Friday afternoon whenever I click 'Test Results' or 'My Medications'. I had an urgent INR blood draw for my Warfarin dose titration on Friday morning. The clinic nurse said 'check your portal by 3 PM for your updated weekend dose or your risk of bleeding or blood clot increases.' I cannot see my dose, nobody answered the clinic phone line over the weekend, and I didn't know whether to take my pills.",
    status: "Pending Triage",
    triageResult: undefined
  },
  {
    id: "CMP-2026-0848",
    dateReceived: "2026-10-19 11:00",
    patientNameOrId: "Patient #83015 (S. Al-Mansoor)",
    source: "Feedback Submission",
    facilityOrUnit: "Surgical Step-Down Unit",
    complaintText:
      "My husband was discharged following a gallbladder removal. We were handed a two-page paper packet with zero verbal explanation. When we asked what medications he should continue, the discharge nurse said 'it is all in the packet, we need this bed immediately.' When we got home, we noticed two contradictory prescriptions for blood thinners, and we were never told when or where to have his surgical staples removed or what signs of infection to watch for. He had a fever of 101.8 yesterday.",
    status: "Pending Triage",
    triageResult: undefined
  }
];
