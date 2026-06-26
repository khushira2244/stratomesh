import { NextResponse } from "next/server";

type SalesEmail = {
  id: string;
  storyKey: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  receivedAt: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status:
    | "NEW"
    | "PENDING_DOCUMENTS"
    | "CLAIM_INTIMATION"
    | "FOLLOW_UP"
    | "COMING_NEXT";
  agendaMatch: string[];
  category:
    | "matched-agenda"
    | "missing-documents"
    | "claim"
    | "quote-follow-up"
    | "payment";
  clientCompanyName: string;
  policyType: string;
  expectedPremium: string;
  targetPremium: string;
  sumInsured: string;
  previewText: string;
  body: string;
  attachment: {
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    sourcePath: string;
  };
  suggestedAction: string;
  isCaseCreatable: boolean;
};

const salesEmails: SalesEmail[] = [
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
    category: "matched-agenda",
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
    attachment: {
      id: "att_sunrise_001",
      fileName: "01_happy_new_policy_sunrise_foods.md",
      mimeType: "text/markdown",
      size: 6016,
      sourcePath: "docs/broker-docs/01_happy_new_policy_sunrise_foods.md",
    },
    suggestedAction: "Start Sales Journey",
    isCaseCreatable: true,
  },
  {
    id: "email_greenpack_missing_docs_001",
    storyKey: "document-missing-problem",
    fromName: "SecureRisk Brokers",
    fromEmail: "docs@securerisk.example",
    subject: "Missing Documents Pending — GreenPack Industries",
    receivedAt: "2026-06-19T10:05:00.000Z",
    priority: "MEDIUM",
    status: "PENDING_DOCUMENTS",
    agendaMatch: ["missing-documents", "document-followups"],
    category: "missing-documents",
    clientCompanyName: "GreenPack Industries",
    policyType: "Fire & Property Insurance",
    expectedPremium: "₹18L - ₹22L",
    targetPremium: "₹20L",
    sumInsured: "₹6 Cr",
    previewText:
      "Proposal form and asset schedule are received, but fire safety certificate and previous policy copy are still pending.",
    body: `
Dear Guardian General Insurance Team,

We are following up for GreenPack Industries.

Current submission includes:
- Proposal Form
- Asset Schedule
- GST Registration

Pending from client:
- Fire Safety Certificate
- Previous Policy Copy
- Claim History Declaration

Please keep the request open while we collect the remaining documents.

Regards,
SecureRisk Brokers
    `.trim(),
    attachment: {
      id: "att_greenpack_001",
      fileName: "02_missing_docs_greenpack.md",
      mimeType: "text/markdown",
      size: 4200,
      sourcePath: "docs/broker-docs/02_missing_docs_greenpack.md",
    },
    suggestedAction: "Review Missing Documents",
    isCaseCreatable: false,
  },
  {
    id: "email_delta_claim_001",
    storyKey: "claim-case",
    fromName: "PrimeShield Brokers",
    fromEmail: "claims@primeshield.example",
    subject: "Claim Intimation — Delta Logistics Warehouse Loss",
    receivedAt: "2026-06-19T11:20:00.000Z",
    priority: "HIGH",
    status: "CLAIM_INTIMATION",
    agendaMatch: ["claims", "loss-intimation"],
    category: "claim",
    clientCompanyName: "Delta Logistics Pvt Ltd",
    policyType: "Warehouse / Fire Claim",
    expectedPremium: "N/A",
    targetPremium: "N/A",
    sumInsured: "₹8 Cr",
    previewText:
      "Client has reported warehouse stock loss after a fire incident. Claim form, loss photos, and initial estimate are attached.",
    body: `
Dear Claims Team,

We are intimating a warehouse loss claim for Delta Logistics Pvt Ltd.

Incident:
Fire-related stock loss at warehouse location.

Documents attached:
- Claim intimation form
- Loss photos
- Initial loss estimate
- Policy copy

Surveyor appointment and claim review are requested.

Regards,
PrimeShield Brokers
    `.trim(),
    attachment: {
      id: "att_delta_claim_001",
      fileName: "03_claim_delta_logistics.md",
      mimeType: "text/markdown",
      size: 5100,
      sourcePath: "docs/broker-docs/03_claim_delta_logistics.md",
    },
    suggestedAction: "Route to Claims",
    isCaseCreatable: false,
  },
  {
    id: "email_metro_renewal_001",
    storyKey: "renewal-problem",
    fromName: "Apex Risk Brokers",
    fromEmail: "renewals@apexrisk.example",
    subject: "Renewal Quote Follow-up — Metro Health Services",
    receivedAt: "2026-06-19T12:10:00.000Z",
    priority: "MEDIUM",
    status: "FOLLOW_UP",
    agendaMatch: ["renewals", "quote-followups"],
    category: "quote-follow-up",
    clientCompanyName: "Metro Health Services",
    policyType: "Property Renewal",
    expectedPremium: "₹24L - ₹28L",
    targetPremium: "₹26L",
    sumInsured: "₹7.5 Cr",
    previewText:
      "Broker is following up on renewal quote. Existing policy expires soon and client wants confirmation before month-end.",
    body: `
Dear Guardian General Insurance Team,

Following up on the renewal quote for Metro Health Services.

The existing policy expires soon, and the client is asking for confirmation before month-end.

Please confirm current renewal status and any pending requirements.

Regards,
Apex Risk Brokers
    `.trim(),
    attachment: {
      id: "att_metro_renewal_001",
      fileName: "04_renewal_metro_health.md",
      mimeType: "text/markdown",
      size: 3900,
      sourcePath: "docs/broker-docs/04_renewal_metro_health.md",
    },
    suggestedAction: "Review Renewal Follow-up",
    isCaseCreatable: false,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const agendaId = searchParams.get("agendaId");
    const storyKey = searchParams.get("storyKey");
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    let filteredEmails = [...salesEmails];

    if (agendaId) {
      filteredEmails = filteredEmails.filter((email) =>
        email.agendaMatch.includes(agendaId)
      );
    }

    // Important:
    // If frontend sends storyKey=happy-new-policy, we still show all desk emails
    // so the Sales desk looks real. Use category/status filters for tabs.
    if (storyKey && storyKey !== "happy-new-policy") {
      filteredEmails = filteredEmails.filter(
        (email) => email.storyKey === storyKey
      );
    }

    if (status) {
      filteredEmails = filteredEmails.filter((email) => email.status === status);
    }

    if (category && category !== "all") {
      filteredEmails = filteredEmails.filter(
        (email) => email.category === category
      );
    }

    return NextResponse.json({
      success: true,
      count: filteredEmails.length,
      data: filteredEmails.map((email) => ({
        id: email.id,
        storyKey: email.storyKey,
        fromName: email.fromName,
        fromEmail: email.fromEmail,
        subject: email.subject,
        receivedAt: email.receivedAt,
        priority: email.priority,
        status: email.status,
        agendaMatch: email.agendaMatch,
        category: email.category,
        clientCompanyName: email.clientCompanyName,
        policyType: email.policyType,
        expectedPremium: email.expectedPremium,
        targetPremium: email.targetPremium,
        sumInsured: email.sumInsured,
        previewText: email.previewText,
        attachment: email.attachment,
        suggestedAction: email.suggestedAction,
        isCaseCreatable: email.isCaseCreatable,
      })),
    });
  } catch (error) {
    console.error("Get sales intake emails error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get sales intake emails",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}