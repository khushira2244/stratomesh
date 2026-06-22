import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type BlockStatus =
  | "COMPLETED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "WAITING"
  | "NOT_STARTED"
  | "NOT_APPLICABLE";

type WorkflowCheck =
  | string
  | {
      name: string;
      status?: string;
      reason?: string;
      waivedByTeam?: string;
      managerObservationRequired?: boolean;
      canBlockNextTeam?: boolean;
      previousTeamDependency?: string;
      questionedByTeam?: string;
      managerDecision?: "PENDING" | "APPROVED" | "REJECTED" | "";
      config?: Record<string, unknown>;
    };

type WorkflowBlock = {
  name: string;
  status: BlockStatus;
  inputs: string[];
  requiredDocs: string[];
  checks: WorkflowCheck[];
  outputs: string[];
  responsibleRole: string;
  observers: string[];
  slaDays: number;
  pendingReason: string;
  routeToNext: string;
};

const makeBlock = (
  name: string,
  status: BlockStatus,
  responsibleRole: string,
  routeToNext: string,
  inputs: string[] = [],
  outputs: string[] = [],
  observers: string[] = ["Management"],
  slaDays = 1,
  pendingReason = "",
  requiredDocs: string[] = [],
  checks: WorkflowCheck[] = []
): WorkflowBlock => ({
  name,
  status,
  inputs,
  requiredDocs,
  checks,
  outputs,
  responsibleRole,
  observers,
  slaDays,
  pendingReason,
  routeToNext,
});

function buildHappyPathTeamFlows(): {
  sales: WorkflowBlock[];
  underwriting: WorkflowBlock[];
  pricing: WorkflowBlock[];
  policyIssuance: WorkflowBlock[];
  finance: WorkflowBlock[];
  claims: WorkflowBlock[];
  management: WorkflowBlock[];
} {
  return {
    sales: [
      makeBlock(
        "Request Received",
        "IN_PROGRESS",
        "Sales Executive",
        "sales → Opportunity Qualification",
        ["Broker email", "Broker request attachment"],
        ["Request logged"],
        ["Management"],
        1,
        "",
        ["Broker request document"],
        [
          "Confirm broker request is readable",
          "Confirm policy request type is identifiable",
          "Confirm client company name is present",
        ]
      ),
      makeBlock(
        "Opportunity Qualification",
        "NOT_STARTED",
        "Sales Executive",
        "sales → Existing Client Check",
        ["Request logged", "Broker requirement summary"],
        ["Opportunity qualified"],
        ["Sales Manager", "Management"],
        1,
        "",
        ["Broker request document"],
        [
          "Confirm requested insurance type is supported",
          "Confirm client requirement is commercially actionable",
          "Confirm quote timeline is captured",
        ]
      ),
      makeBlock(
        "Existing Client Check",
        "NOT_STARTED",
        "Sales Executive",
        "sales → Document Completeness Check",
        ["Client company name", "Broker details"],
        ["Client status confirmed"],
        ["Sales Manager", "Management"],
        1,
        "",
        ["Company Registration / GST"],
        [
          "Check whether client already exists in CRM",
          "Confirm broker-client mapping",
          "Identify renewal or new policy context",
        ]
      ),
      makeBlock(
        "Document Completeness Check",
        "NOT_STARTED",
        "Sales Executive",
        "sales → Risk Tagging",
        ["Received case documents", "Extracted policy requirement"],
        ["Document checklist verified"],
        ["Sales Manager", "Underwriting Lead"],
        1,
        "",
        [
          "Proposal Form",
          "Asset Schedule",
          "Sum Insured Breakup",
          "Company Registration / GST",
        ],
        [
          "Confirm mandatory new-policy documents are present",
          "Confirm asset values are readable",
          "Confirm document names match broker request",
        ]
      ),
      makeBlock(
        "Risk Tagging",
        "NOT_STARTED",
        "Sales Executive",
        "sales → Underwriting Handoff",
        ["Asset schedule", "Coverage requirement", "Client industry"],
        ["Initial risk tags"],
        ["Underwriting Lead", "Management"],
        1,
        "",
        ["Asset Schedule", "Risk Location Details"],
        [
          "Identify industry risk",
          "Identify location risk",
          "Tag case for underwriting review",
        ]
      ),
      makeBlock(
        "Underwriting Handoff",
        "NOT_STARTED",
        "Sales Executive",
        "underwriting → Risk Data Received",
        ["Qualified opportunity", "Document checklist", "Risk tags"],
        ["Underwriting handoff package"],
        ["Sales Manager", "Underwriting Lead"],
        1,
        "",
        ["Proposal Form", "Asset Schedule", "Coverage Requirement Summary"],
        [
          "Confirm sales notes are complete",
          "Confirm underwriting has enough context to begin review",
          "Confirm handoff route and owner",
        ]
      ),
    ],

    underwriting: [
      makeBlock(
        "Risk Data Received",
        "WAITING",
        "Underwriter",
        "underwriting → Asset Value Verification",
        ["Underwriting handoff package"],
        ["Risk data accepted"],
        ["Underwriting Lead", "Management"],
        1,
        "",
        ["Underwriting Handoff Package", "Risk Tags"],
        [
          "Confirm handoff package is accessible",
          "Confirm risk tags are clear",
          "Confirm underwriting review scope",
        ]
      ),
      makeBlock(
        "Asset Value Verification",
        "WAITING",
        "Underwriter",
        "underwriting → Fire Protection Review",
        ["Asset schedule", "Declared values"],
        ["Asset values verified"],
        ["Underwriting Lead"],
        2,
        "",
        ["Asset Schedule", "Sum Insured Breakup", "Valuation Support"],
        [
          "Check declared values against asset categories",
          "Identify unusually high or low values",
          "Confirm total sum insured matches schedule",
        ]
      ),
      makeBlock(
        "Fire Protection Review",
        "WAITING",
        "Underwriter",
        "underwriting → Claim / Loss History Check",
        ["Fire safety details", "Risk location details"],
        ["Fire protection assessment"],
        ["Underwriting Lead"],
        2,
        "",
        ["Fire Safety Details", "Occupancy Details"],
        [
          "Review available fire protection details",
          "Check occupancy exposure for property risk",
          "Flag missing fire protection information if required",
        ]
      ),
      makeBlock(
        "Claim / Loss History Check",
        "WAITING",
        "Underwriter",
        "underwriting → Industry / Location Risk Check",
        ["Claim history declaration"],
        ["Loss history reviewed"],
        ["Underwriting Lead"],
        1,
        "",
        ["Loss History Declaration"],
        [
          "Check whether prior losses are declared",
          "Identify material loss patterns",
          "Flag loss history gaps for broker clarification",
        ]
      ),
      makeBlock(
        "Industry / Location Risk Check",
        "WAITING",
        "Underwriter",
        "underwriting → Coverage Requirement Review",
        ["Industry details", "Location details"],
        ["Location and industry risk reviewed"],
        ["Underwriting Lead", "Management"],
        2,
        "",
        ["Client Industry Details", "Risk Location Details"],
        [
          "Assess industry risk category",
          "Assess risk location exposure",
          "Confirm location details support requested cover",
        ]
      ),
      makeBlock(
        "Coverage Requirement Review",
        "WAITING",
        "Underwriter",
        "underwriting → Underwriting Approval Decision",
        ["Coverage required", "Asset schedule", "Risk tags"],
        ["Coverage requirements validated"],
        ["Underwriting Lead"],
        1,
        "",
        ["Coverage Requirement Summary", "Asset Schedule"],
        [
          "Confirm requested cover is aligned to asset schedule",
          "Identify exclusions or special terms needed",
          "Confirm coverage limits are reviewable",
        ]
      ),
      makeBlock(
        "Underwriting Approval Decision",
        "WAITING",
        "Underwriting Manager",
        "underwriting → Terms Released",
        ["Risk review outputs", "Coverage validation"],
        ["Underwriting approval decision"],
        ["Management"],
        1,
        "",
        ["Underwriting Review Notes"],
        [
          "Approve, decline, or refer the risk",
          "Confirm any subjectivities",
          "Document approval rationale",
        ]
      ),
      makeBlock(
        "Terms Released",
        "WAITING",
        "Underwriter",
        "pricing → Underwriting Input Received",
        ["Underwriting approval decision", "Subjectivities"],
        ["Terms released to pricing"],
        ["Pricing Manager", "Management"],
        1,
        "",
        ["Approved Underwriting Terms"],
        [
          "Confirm terms are complete",
          "Confirm pricing constraints are stated",
          "Confirm handoff to pricing owner",
        ]
      ),
    ],

    pricing: [
      makeBlock(
        "Underwriting Input Received",
        "WAITING",
        "Pricing Analyst",
        "pricing → Pricing Data Check",
        ["Terms released to pricing"],
        ["Pricing case opened"],
        ["Pricing Manager"],
        1,
        "",
        ["Approved Underwriting Terms"],
        [
          "Confirm underwriting terms are available",
          "Confirm risk inputs needed for pricing",
          "Confirm pricing case owner",
        ]
      ),
      makeBlock(
        "Pricing Data Check",
        "WAITING",
        "Pricing Analyst",
        "pricing → Risk-Based Premium Calculation",
        ["Underwriting terms", "Risk tags"],
        ["Pricing inputs verified"],
        ["Pricing Manager"],
        1,
        "",
        ["Approved Underwriting Terms", "Risk Tags", "Sum Insured Breakup"],
        [
          "Check premium basis inputs",
          "Confirm sum insured values are usable",
          "Identify missing pricing assumptions",
        ]
      ),
      makeBlock(
        "Risk-Based Premium Calculation",
        "WAITING",
        "Pricing Analyst",
        "pricing → Margin / Loading Review",
        ["Pricing inputs verified", "Risk classification"],
        ["Base premium calculated"],
        ["Pricing Manager"],
        2,
        "",
        ["Pricing Inputs"],
        [
          "Calculate base premium from risk inputs",
          "Apply risk-based rate assumptions",
          "Record calculation assumptions",
        ]
      ),
      makeBlock(
        "Margin / Loading Review",
        "WAITING",
        "Pricing Analyst",
        "pricing → Pricing Approval",
        ["Base premium calculated"],
        ["Margin and loading reviewed"],
        ["Pricing Manager", "Management"],
        1,
        "",
        ["Base Premium Calculation"],
        [
          "Review margin requirements",
          "Apply approved loading or discount logic",
          "Flag pricing exceptions for approval",
        ]
      ),
      makeBlock(
        "Pricing Approval",
        "WAITING",
        "Pricing Manager",
        "pricing → Quote Released",
        ["Final pricing recommendation"],
        ["Pricing approved"],
        ["Management"],
        1,
        "",
        ["Final Pricing Recommendation"],
        [
          "Confirm final premium is approved",
          "Confirm any pricing exceptions are documented",
          "Confirm quote can be released",
        ]
      ),
      makeBlock(
        "Quote Released",
        "WAITING",
        "Pricing Analyst",
        "pricing → Handoff to Policy Issuance",
        ["Pricing approved"],
        ["Quote released"],
        ["Sales Manager", "Policy Issuance Lead"],
        1,
        "",
        ["Approved Quote"],
        [
          "Confirm quote version is final",
          "Confirm quote has been shared for binding",
          "Confirm quote release date",
        ]
      ),
      makeBlock(
        "Handoff to Policy Issuance",
        "WAITING",
        "Pricing Analyst",
        "policyIssuance → Binding Confirmation Received",
        ["Quote released", "Approved pricing terms"],
        ["Policy issuance handoff"],
        ["Policy Issuance Lead", "Management"],
        1,
        "",
        ["Approved Quote", "Pricing Approval Notes"],
        [
          "Confirm policy issuance has final quote details",
          "Confirm handoff includes premium and coverage terms",
          "Confirm next owner",
        ]
      ),
    ],

    policyIssuance: [
      makeBlock(
        "Binding Confirmation Received",
        "WAITING",
        "Policy Issuance Executive",
        "policyIssuance → Final Document Verification",
        ["Policy issuance handoff", "Client binding confirmation"],
        ["Binding confirmation recorded"],
        ["Policy Issuance Lead"],
        1,
        "",
        ["Binding Confirmation", "Approved Quote"],
        [
          "Confirm client or broker has accepted quote",
          "Confirm binding date is captured",
          "Confirm quote version matches binding confirmation",
        ]
      ),
      makeBlock(
        "Final Document Verification",
        "WAITING",
        "Policy Issuance Executive",
        "policyIssuance → Premium Confirmation Check",
        ["Final documents", "Binding confirmation"],
        ["Final documents verified"],
        ["Policy Issuance Lead", "Underwriting Lead"],
        1,
        "",
        ["Proposal Form", "Asset Schedule", "Binding Confirmation"],
        [
          "Confirm final documents match approved terms",
          "Confirm no mandatory issuance document is missing",
          "Confirm document versions are final",
        ]
      ),
      makeBlock(
        "Premium Confirmation Check",
        "WAITING",
        "Policy Issuance Executive",
        "policyIssuance → Policy Drafting",
        ["Premium confirmation", "Approved quote"],
        ["Premium confirmed for issuance"],
        ["Finance Executive", "Policy Issuance Lead"],
        1,
        "",
        ["Approved Quote", "Premium Confirmation"],
        [
          "Confirm premium amount matches approved quote",
          "Confirm tax or fee assumptions are available",
          "Confirm finance dependency if payment is required before issuance",
        ]
      ),
      makeBlock(
        "Policy Drafting",
        "WAITING",
        "Policy Issuance Executive",
        "policyIssuance → Policy QA",
        ["Final terms", "Client details", "Coverage details"],
        ["Policy draft prepared"],
        ["Policy Issuance Lead"],
        2,
        "",
        ["Approved Underwriting Terms", "Client Details", "Coverage Requirement Summary"],
        [
          "Draft policy with approved coverage terms",
          "Confirm insured name and location details",
          "Confirm policy period and sum insured",
        ]
      ),
      makeBlock(
        "Policy QA",
        "WAITING",
        "Policy QA Executive",
        "policyIssuance → Policy Issued",
        ["Policy draft"],
        ["Policy QA completed"],
        ["Policy Issuance Lead", "Management"],
        1,
        "",
        ["Policy Draft"],
        [
          "Check policy draft against approved quote",
          "Check endorsements or exclusions are included",
          "Approve policy for issuance",
        ]
      ),
      makeBlock(
        "Policy Issued",
        "WAITING",
        "Policy Issuance Executive",
        "finance → Debit Note Generated",
        ["QA-approved policy"],
        ["Policy issued"],
        ["Finance Executive", "Management"],
        1,
        "",
        ["QA-Approved Policy"],
        [
          "Issue final policy document",
          "Confirm policy number is generated",
          "Route issued policy to finance for debit note",
        ]
      ),
    ],

    finance: [
      makeBlock(
        "Debit Note Generated",
        "WAITING",
        "Finance Executive",
        "finance → Payment Proof Received",
        ["Policy issued", "Premium amount"],
        ["Debit note generated"],
        ["Finance Manager"],
        1,
        "",
        ["Issued Policy", "Approved Premium Details"],
        [
          "Generate debit note for approved premium",
          "Confirm debit note references policy details",
          "Share debit note for payment follow-up",
        ]
      ),
      makeBlock(
        "Payment Proof Received",
        "WAITING",
        "Finance Executive",
        "finance → UTR / Bank Reference Match",
        ["Payment proof"],
        ["Payment proof captured"],
        ["Finance Manager"],
        1,
        "",
        ["Payment Proof"],
        [
          "Confirm payment proof is readable",
          "Capture payment date and amount",
          "Identify bank reference or UTR",
        ]
      ),
      makeBlock(
        "UTR / Bank Reference Match",
        "WAITING",
        "Finance Executive",
        "finance → Amount Verification",
        ["UTR", "Bank reference"],
        ["Bank reference matched"],
        ["Finance Manager"],
        1,
        "",
        ["Payment Proof", "Bank Reference / UTR"],
        [
          "Match UTR or bank reference with bank statement",
          "Confirm payer details if available",
          "Flag unmatched payment reference",
        ]
      ),
      makeBlock(
        "Amount Verification",
        "WAITING",
        "Finance Executive",
        "finance → Premium Allocation",
        ["Bank reference matched", "Debit note amount"],
        ["Amount verified"],
        ["Finance Manager"],
        1,
        "",
        ["Debit Note", "Bank Reference / UTR"],
        [
          "Confirm received amount matches debit note",
          "Identify short payment or excess payment",
          "Confirm amount is ready for allocation",
        ]
      ),
      makeBlock(
        "Premium Allocation",
        "WAITING",
        "Finance Executive",
        "finance → Finance Confirmation Released",
        ["Verified premium amount"],
        ["Premium allocated"],
        ["Finance Manager"],
        1,
        "",
        ["Verified Payment", "Debit Note"],
        [
          "Allocate premium against correct policy",
          "Confirm allocation reference",
          "Update finance status for issuance closure",
        ]
      ),
      makeBlock(
        "Finance Confirmation Released",
        "WAITING",
        "Finance Executive",
        "management → Closure Review",
        ["Premium allocation"],
        ["Finance confirmation released"],
        ["Management"],
        1,
        "",
        ["Premium Allocation Confirmation"],
        [
          "Release finance confirmation to case team",
          "Confirm no finance hold remains",
          "Route case for closure review",
        ]
      ),
    ],

    claims: [
      makeBlock(
        "Claims Not Applicable",
        "NOT_APPLICABLE",
        "Claims Team",
        "No route - no claim event exists",
        ["New policy case"],
        ["Claims workflow not applicable"],
        ["Management"],
        0,
        "New policy placement has no claim event",
        [],
        [
          {
            name: "Claims workflow intentionally skipped for new policy case",
            status: "WAIVED",
            reason: "No claim event exists in this scenario",
            waivedByTeam: "Claims Team",
            managerObservationRequired: false,
          },
        ]
      ),
    ],

    management: [
      makeBlock(
        "SLA Observation",
        "WAITING",
        "Management",
        "management → Month-End Priority Observation",
        ["Workflow SLA data"],
        ["SLA observed"],
        [],
        1,
        "",
        ["Workflow SLA Data"],
        [
          "Review team SLA status",
          "Identify overdue blocks",
          "Escalate blocked workflow steps if needed",
        ]
      ),
      makeBlock(
        "Month-End Priority Observation",
        "WAITING",
        "Management",
        "management → Closure Review",
        ["Quote required date", "Month-end flag"],
        ["Month-end priority observed"],
        [],
        1,
        "",
        ["Quote Required Date"],
        [
          "Check whether case is month-end priority",
          "Confirm priority impact on SLA",
          "Observe escalations for deadline risk",
        ]
      ),
      makeBlock(
        "Closure Review",
        "WAITING",
        "Management",
        "Case closure",
        ["Policy issued", "Finance confirmation"],
        ["Case closure reviewed"],
        [],
        1,
        "",
        ["Issued Policy", "Finance Confirmation"],
        [
          "Confirm all active teams completed required blocks",
          "Confirm no unresolved problem remains",
          "Approve case closure",
        ]
      ),
    ],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawDocumentText = body.rawDocumentText;

    if (!rawDocumentText || typeof rawDocumentText !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "rawDocumentText is required",
        },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-5.2",
      instructions: `
You are StratoMesh insurance extraction engine.

Read the broker insurance request document.
Return ONLY valid JSON.
Do not include markdown.
Do not include explanation.

Important:
Extract case data only.
Create scenario-specific workflow blocks with block-specific checklists.
The backend will only use the happy-path template if AI teamFlows are missing.

Return JSON with this exact top-level shape:
{
  "caseSummary": {
    "caseTitle": string,
    "caseType": string,
    "insuranceType": string,
    "happyPath": boolean,
    "currentTeam": string,
    "currentBlock": string,
    "currentStatus": string,
    "businessImpact": string
  },
  "broker": {
    "name": string,
    "contactPerson": string,
    "email": string,
    "priority": string
  },
  "client": {
    "companyName": string,
    "industry": string,
    "clientType": string,
    "location": string,
    "businessSize": string
  },
  "policyRequirement": {
    "policyType": string,
    "policyStartDate": string,
    "policyEndDate": string,
    "quoteRequiredBy": string,
    "expectedPremiumRange": string,
    "targetPremium": string,
    "totalSumInsured": string,
    "monthEndPriority": boolean
  },
  "assetSchedule": [
    {
      "assetCategory": string,
      "description": string,
      "location": string,
      "declaredValue": string,
      "supportingDocument": string,
      "riskNotes": string
    }
  ],
  "coverageRequired": string[],
  "documents": {
    "received": string[],
    "missing": string[],
    "partial": string[],
    "notApplicable": string[]
  },
  "riskTags": string[],
  "problems": [
    {
      "team": string,
      "block": string,
      "reason": string,
      "responsibleRole": string,
      "observers": string[],
      "businessImpact": string
    }
  ],
  "teamFlows": {
    "sales": [
      {
        "name": string,
        "status": string,
        "inputs": string[],
        "requiredDocs": string[],
        "checks": [
          {
            "name": string,
            "status": string,
            "reason": string,
            "waivedByTeam": string,
            "managerObservationRequired": boolean,
            "canBlockNextTeam": boolean,
            "previousTeamDependency": string,
            "questionedByTeam": string,
            "managerDecision": string,
            "config": {}
          }
        ],
        "outputs": string[],
        "responsibleRole": string,
        "observers": string[],
        "slaDays": number,
        "pendingReason": string,
        "routeToNext": string
      }
    ],
    "underwriting": [],
    "pricing": [],
    "policyIssuance": [],
    "finance": [],
    "claims": [],
    "management": []
  }
}

Each team array in teamFlows must use the same workflow block object shape shown in sales above.

BLOCK-SPECIFIC CHECKLIST RULE:

Do not create one universal checklist for the whole case.
Do not force the same documents/checks into every team.

Each workflow block must have its own scenario-specific requiredDocs and checks.

For every block, return:
- inputs
- requiredDocs
- checks
- outputs
- responsibleRole
- observers
- slaDays
- pendingReason
- routeToNext

Only include requiredDocs/checks that are relevant to that exact:
- case type
- insurance type
- team
- workflow block
- scenario

If a document/check is not relevant to that block, do not include it.

If a team is not active in the scenario, create a NOT_APPLICABLE block with a clear reason.

Checklist waiver / previous-team dependency logic:

Teams work only on their own layer.
A previous team's checklist decision becomes structured input to the next team.
If a previous team's WAIVED / NOT_REQUIRED / disabled decision may stop the next team, preserve that dependency inside the next team's checks.

For every check object, use status from:
- PASSED
- PENDING
- WAIVED
- QUESTIONED
- MANAGER_REVIEW
- MANAGER_APPROVED
- MANAGER_REJECTED
- NOT_APPLICABLE

If a checklist item is intentionally skipped, disabled, or waived:
- status must be WAIVED or NOT_APPLICABLE
- reason must explain why
- waivedByTeam must name the team that waived it
- managerObservationRequired must be true if the decision can affect the next team
- canBlockNextTeam must be true if this missing/waived item can stop the next team
- previousTeamDependency should explain the source team/block/check if applicable

If the next team cannot work because of a previous team's waived/missing item:
- status must be QUESTIONED or MANAGER_REVIEW
- questionedByTeam must name the current team
- managerObservationRequired must be true
- reason must explain why the current team is blocked
- previousTeamDependency must point to the previous team decision

If the previous team later submits the missing data:
- the previous team checklist item should become PASSED
- the blocked next-team check can become PENDING or PASSED depending on whether work can resume
- managerDecision can remain APPROVED/REJECTED/PENDING when manager review was involved

Do not use generic examples like claim history, fire safety, payment proof, or claims team unless the case/block/scenario explicitly requires them.

Rules:
- If all required documents are received, happyPath must be true.
- If happyPath is true, problems must be [].
- If happyPath is true, documents.missing must be [].
- documents.partial should usually be [] for this product version; prefer RECEIVED, MISSING, NOT_REQUIRED, WAIVED, QUESTIONED, or MANAGER_REVIEW inside block checks.
- For a new policy with no claim event, claims are not applicable.
- Use empty strings instead of null.
- Use empty arrays instead of null.
      `,
      input: rawDocumentText,
    });

    const text = response.output_text;

    let extractedJson;

    try {
      extractedJson = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "AI response was not valid JSON",
          rawOutput: text,
        },
        { status: 500 }
      );
    }

    const fallbackTeamFlows = buildHappyPathTeamFlows();

    extractedJson.teamFlows = {
      sales:
        Array.isArray(extractedJson.teamFlows?.sales) &&
        extractedJson.teamFlows.sales.length > 0
          ? extractedJson.teamFlows.sales
          : fallbackTeamFlows.sales,

      underwriting:
        Array.isArray(extractedJson.teamFlows?.underwriting) &&
        extractedJson.teamFlows.underwriting.length > 0
          ? extractedJson.teamFlows.underwriting
          : fallbackTeamFlows.underwriting,

      pricing:
        Array.isArray(extractedJson.teamFlows?.pricing) &&
        extractedJson.teamFlows.pricing.length > 0
          ? extractedJson.teamFlows.pricing
          : fallbackTeamFlows.pricing,

      policyIssuance:
        Array.isArray(extractedJson.teamFlows?.policyIssuance) &&
        extractedJson.teamFlows.policyIssuance.length > 0
          ? extractedJson.teamFlows.policyIssuance
          : fallbackTeamFlows.policyIssuance,

      finance:
        Array.isArray(extractedJson.teamFlows?.finance) &&
        extractedJson.teamFlows.finance.length > 0
          ? extractedJson.teamFlows.finance
          : fallbackTeamFlows.finance,

      claims:
        Array.isArray(extractedJson.teamFlows?.claims) &&
        extractedJson.teamFlows.claims.length > 0
          ? extractedJson.teamFlows.claims
          : fallbackTeamFlows.claims,

      management:
        Array.isArray(extractedJson.teamFlows?.management) &&
        extractedJson.teamFlows.management.length > 0
          ? extractedJson.teamFlows.management
          : fallbackTeamFlows.management,
    };

    extractedJson.problems = extractedJson.problems ?? [];

    extractedJson.documents = {
      received: extractedJson.documents?.received ?? [],
      missing: extractedJson.documents?.missing ?? [],
      partial: extractedJson.documents?.partial ?? [],
      notApplicable: extractedJson.documents?.notApplicable ?? [],
    };

    extractedJson.caseSummary = {
      ...extractedJson.caseSummary,
      currentTeam: extractedJson.caseSummary?.currentTeam || "sales",
      currentBlock:
        extractedJson.caseSummary?.currentBlock || "Request Received",
      currentStatus:
        extractedJson.caseSummary?.currentStatus || "IN_PROGRESS",
    };

    return NextResponse.json({
      success: true,
      data: extractedJson,
      debug: {
        blockCounts: {
          sales: extractedJson.teamFlows.sales.length,
          underwriting: extractedJson.teamFlows.underwriting.length,
          pricing: extractedJson.teamFlows.pricing.length,
          policyIssuance: extractedJson.teamFlows.policyIssuance.length,
          finance: extractedJson.teamFlows.finance.length,
          claims: extractedJson.teamFlows.claims.length,
          management: extractedJson.teamFlows.management.length,
        },
      },
    });
  } catch (error) {
    console.error("Extract request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to extract broker request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}