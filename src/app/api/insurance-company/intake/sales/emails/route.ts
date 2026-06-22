import { NextResponse } from "next/server";

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

All required documents are attached.

Regards,
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
    attachment: {
      id: "att_metro_renewal_001",
      fileName: "02_policy_renewal_metro_health.md",
      mimeType: "text/markdown",
      size: 0,
      sourcePath: "docs/broker-docs/02_policy_renewal_metro_health.md",
    },
    suggestedAction: "Coming next",
  },
  {
    id: "email_ravi_claim_001",
    storyKey: "claim-problem",
    fromName: "SecureLine Brokers",
    fromEmail: "claims@secureline.example",
    subject: "Claim Settlement Follow-up — Ravi Industrial Works",
    receivedAt: "2026-06-19T11:20:00.000Z",
    priority: "HIGH",
    status: "COMING_NEXT",
    agendaMatch: ["missing-documents"],
    clientCompanyName: "Ravi Industrial Works",
    policyType: "Fire Claim Settlement",
    expectedPremium: "N/A",
    targetPremium: "N/A",
    sumInsured: "₹5 Cr",
    previewText:
      "Claim settlement is delayed due to pending surveyor report and supporting loss documents.",
    body: "Claim problem story coming next.",
    attachment: {
      id: "att_ravi_claim_001",
      fileName: "03_claim_settlement_ravi_industrial.md",
      mimeType: "text/markdown",
      size: 0,
      sourcePath: "docs/broker-docs/03_claim_settlement_ravi_industrial.md",
    },
    suggestedAction: "Coming next",
  },
  {
    id: "email_abc_missing_docs_001",
    storyKey: "document-missing-problem",
    fromName: "Apex Risk Brokers",
    fromEmail: "broker@apexrisk.example",
    subject: "New Policy Request — ABC Manufacturing Documents Pending",
    receivedAt: "2026-06-19T12:10:00.000Z",
    priority: "HIGH",
    status: "COMING_NEXT",
    agendaMatch: ["missing-documents", "new-policy-premium-closure"],
    clientCompanyName: "ABC Manufacturing",
    policyType: "Fire & Property Insurance",
    expectedPremium: "₹42L",
    targetPremium: "₹40L",
    sumInsured: "₹15 Cr",
    previewText:
      "New policy request received, but claim history declaration and fire safety certificate are missing.",
    body: "Document missing problem story coming next.",
    attachment: {
      id: "att_abc_missing_docs_001",
      fileName: "04_document_missing_abc_manufacturing.md",
      mimeType: "text/markdown",
      size: 0,
      sourcePath: "docs/broker-docs/04_document_missing_abc_manufacturing.md",
    },
    suggestedAction: "Coming next",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const agendaId = searchParams.get("agendaId");
    const storyKey = searchParams.get("storyKey");
    const status = searchParams.get("status");

    let filteredEmails = salesEmails;

    if (agendaId) {
      filteredEmails = filteredEmails.filter((email) =>
        email.agendaMatch.includes(agendaId)
      );
    }

    if (storyKey) {
      filteredEmails = filteredEmails.filter(
        (email) => email.storyKey === storyKey
      );
    }

    if (status) {
      filteredEmails = filteredEmails.filter((email) => email.status === status);
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
        clientCompanyName: email.clientCompanyName,
        policyType: email.policyType,
        expectedPremium: email.expectedPremium,
        targetPremium: email.targetPremium,
        sumInsured: email.sumInsured,
        previewText: email.previewText,
        attachment: email.attachment,
        suggestedAction: email.suggestedAction,
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