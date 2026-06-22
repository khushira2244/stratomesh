import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    emailId: string;
  }>;
};

const salesEmails = [
  {
    id: "email_sunrise_happy_001",
    storyKey: "happy-new-policy",
    fromName: "Apex Risk Brokers",
    fromEmail: "broker@apexrisk.example",
    subject: "New Fire & Property Policy Request — Sunrise Foods",
    receivedAt: "2026-06-19T09:15:00.000Z",
    priority: "HIGH",
    status: "NEW",
    agendaMatch: ["new-policy-premium-closure", "quote-followups"],
    clientCompanyName: "Sunrise Foods Pvt Ltd",
    policyType: "Fire & Property Insurance",
    expectedPremium: "₹32L - ₹38L",
    targetPremium: "₹36L",
    sumInsured: "₹10 Cr",
    previewText:
      "Please release quotation before 25 June 2026 for Sunrise Foods Pvt Ltd. All required documents are attached for Fire & Property Insurance.",
    body: `
Dear Guardian General Insurance Team,

We are submitting a new Fire & Property Insurance quotation request for Sunrise Foods Pvt Ltd.

Client: Sunrise Foods Pvt Ltd
Industry: Food Processing
Location: Nashik, Maharashtra
Policy Type: Fire & Property Insurance
Expected Premium Range: ₹32L - ₹38L
Target Premium: ₹36L
Total Sum Insured: ₹10 Cr
Quote Required By: 25 June 2026

Documents attached:
- Proposal Form
- Previous Policy Copy
- Company Registration / GST
- Sum Insured Breakup
- Risk Location Details
- Claim History
- Fire Safety Certificate
- Risk Inspection Report

Please release quotation before 25 June 2026 and proceed with policy issuance after premium confirmation.

Regards,
Rahul Mehta
Apex Risk Brokers
    `.trim(),
    attachments: [
      {
        id: "att_sunrise_001",
        fileName: "01_happy_new_policy_sunrise_foods.md",
        mimeType: "text/markdown",
        size: 6016,
        sourcePath: "docs/broker-docs/01_happy_new_policy_sunrise_foods.md",
      },
    ],
    extractedHints: {
      possibleCaseType: "New Policy",
      possibleCurrentTeam: "sales",
      possiblePriority: "HIGH",
      possibleMissingDocs: [],
      possibleReceivedDocs: [
        "Proposal Form",
        "Previous Policy Copy",
        "Company Registration / GST",
        "Sum Insured Breakup",
        "Risk Location Details",
        "Claim History",
        "Fire Safety Certificate",
        "Risk Inspection Report",
      ],
    },
    suggestedAction: "Start Sales Journey",
  },
  {
    id: "email_metro_renewal_001",
    storyKey: "renewal-problem",
    fromName: "PrimeShield Brokers",
    fromEmail: "renewals@primeshield.example",
    subject: "Renewal Request — Metro Health Policy Expiring Soon",
    receivedAt: "2026-06-19T10:05:00.000Z",
    priority: "MEDIUM",
    status: "COMING_NEXT",
    agendaMatch: ["quote-followups", "missing-documents"],
    clientCompanyName: "Metro Health Services",
    policyType: "Health / Property Renewal",
    expectedPremium: "₹24L",
    targetPremium: "₹22L",
    sumInsured: "₹7 Cr",
    previewText:
      "Renewal request received, but previous claim data and updated employee/property schedule need review.",
    body: "Renewal problem story coming next.",
    attachments: [
      {
        id: "att_metro_renewal_001",
        fileName: "02_policy_renewal_metro_health.md",
        mimeType: "text/markdown",
        size: 0,
        sourcePath: "docs/broker-docs/02_policy_renewal_metro_health.md",
      },
    ],
    extractedHints: {
      possibleCaseType: "Renewal",
      possibleCurrentTeam: "sales",
      possiblePriority: "MEDIUM",
      possibleMissingDocs: ["Updated claim data"],
      possibleReceivedDocs: [],
    },
    suggestedAction: "Coming next",
  },
];

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { emailId } = await context.params;

    const email = salesEmails.find((item) => item.id === emailId);

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Sales intake email not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: email,
    });
  } catch (error) {
    console.error("Get sales intake email detail error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get sales intake email detail",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}