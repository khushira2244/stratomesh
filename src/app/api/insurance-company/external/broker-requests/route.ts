import { NextResponse } from "next/server";

const brokerRequests = [
  {
    id: "ext_broker_req_001",
    caseId: "cmqmbnxxz004rvkboom9qwi6z",
    source: "BROKER",
    brokerName: "Apex Risk Brokers",
    brokerContactPerson: "Rahul Mehta",
    brokerEmail: "rahul.mehta@apexrisk.example",
    requestType: "DOCUMENT_CLARIFICATION",
    title: "Fire Safety Certificate explanation received",
    subject: "Sunrise Foods — Fire Safety Certificate explanation",
    message:
      "Broker has shared an explanation that the existing fire safety certificate is still valid. Sales needs to review and decide whether to forward it internally.",
    relatedDocumentName: "Fire Safety Certificate",
    clientCompanyName: "Sunrise Foods Pvt Ltd",
    insuranceType: "Fire & Property Insurance",
    status: "PENDING_SALES_REVIEW",
    priority: "HIGH",
    ownerTeam: "sales",
    ownerRole: "Sales Executive",
    observerTeams: ["management"],
    managerObservationRequired: true,
    businessImpact:
      "Underwriting may remain waiting if the explanation is not accepted or forwarded.",
    externalSafeStatus: "Clarification received from broker",
    internalNote:
      "Broker response may resolve an underwriting dependency, but underwriting should not communicate directly with broker.",
    actionNeeded:
      "Sales should review the broker explanation and forward internally or ask broker for updated document.",
    receivedAt: "2026-06-19T13:20:00.000Z",
    createdAt: "2026-06-19T13:20:00.000Z",
    updatedAt: "2026-06-19T13:20:00.000Z",
  },
  {
    id: "ext_broker_req_002",
    caseId: "cmqmbnxxz004rvkboom9qwi6z",
    source: "BROKER",
    brokerName: "Apex Risk Brokers",
    brokerContactPerson: "Rahul Mehta",
    brokerEmail: "rahul.mehta@apexrisk.example",
    requestType: "QUOTE_DELAY_FOLLOW_UP",
    title: "Broker asked for quote status update",
    subject: "Sunrise Foods — Quote release follow-up",
    message:
      "Broker is asking whether the quote can be released before the deadline because client wants cover to start without gap.",
    relatedDocumentName: "",
    clientCompanyName: "Sunrise Foods Pvt Ltd",
    insuranceType: "Fire & Property Insurance",
    status: "PENDING_SALES_RESPONSE",
    priority: "MEDIUM",
    ownerTeam: "sales",
    ownerRole: "Sales Executive",
    observerTeams: ["management"],
    managerObservationRequired: true,
    businessImpact:
      "Quote deadline risk. Manager should observe if Sales does not respond on time.",
    externalSafeStatus: "Broker follow-up received",
    internalNote:
      "Sales should check current internal case stage before responding externally.",
    actionNeeded:
      "Sales should respond to broker with safe status or escalate internally.",
    receivedAt: "2026-06-19T14:05:00.000Z",
    createdAt: "2026-06-19T14:05:00.000Z",
    updatedAt: "2026-06-19T14:05:00.000Z",
  },
  {
    id: "ext_broker_req_003",
    caseId: "cmqmbnxxz004rvkboom9qwi6z",
    source: "BROKER",
    brokerName: "Apex Risk Brokers",
    brokerContactPerson: "Rahul Mehta",
    brokerEmail: "rahul.mehta@apexrisk.example",
    requestType: "MISSING_DOCUMENT_RESPONSE",
    title: "Broker uploaded missing risk location details",
    subject: "Sunrise Foods — Risk location details updated",
    message:
      "Broker has submitted updated risk location details for the warehouse and cold storage units.",
    relatedDocumentName: "Risk Location Details",
    clientCompanyName: "Sunrise Foods Pvt Ltd",
    insuranceType: "Fire & Property Insurance",
    status: "RECEIVED",
    priority: "LOW",
    ownerTeam: "sales",
    ownerRole: "Sales Executive",
    observerTeams: [],
    managerObservationRequired: false,
    businessImpact:
      "Can be forwarded internally if underwriting or pricing needs updated location details.",
    externalSafeStatus: "Document received",
    internalNote:
      "Sales should attach this response to the case context and forward if needed.",
    actionNeeded: "Review and attach to case context.",
    receivedAt: "2026-06-19T15:10:00.000Z",
    createdAt: "2026-06-19T15:10:00.000Z",
    updatedAt: "2026-06-19T15:10:00.000Z",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const ownerTeam = searchParams.get("ownerTeam");
    const managerObservationRequired = searchParams.get(
      "managerObservationRequired"
    );
    const caseId = searchParams.get("caseId");

    let filtered = brokerRequests;

    if (status) {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (ownerTeam) {
      filtered = filtered.filter((item) => item.ownerTeam === ownerTeam);
    }

    if (caseId) {
      filtered = filtered.filter((item) => item.caseId === caseId);
    }

    if (managerObservationRequired !== null) {
      const required = managerObservationRequired === "true";
      filtered = filtered.filter(
        (item) => item.managerObservationRequired === required
      );
    }

    const summary = {
      total: filtered.length,
      pendingSalesReview: filtered.filter(
        (item) => item.status === "PENDING_SALES_REVIEW"
      ).length,
      pendingSalesResponse: filtered.filter(
        (item) => item.status === "PENDING_SALES_RESPONSE"
      ).length,
      received: filtered.filter((item) => item.status === "RECEIVED").length,
      managerObservationRequired: filtered.filter(
        (item) => item.managerObservationRequired
      ).length,
    };

    return NextResponse.json({
      success: true,
      message: "External broker requests fetched",
      summary,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error("Get external broker requests error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch external broker requests",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newRequest = {
      id: `ext_broker_req_${Date.now()}`,
      caseId: body.caseId ?? "",
      source: "BROKER",
      brokerName: body.brokerName ?? "Unknown Broker",
      brokerContactPerson: body.brokerContactPerson ?? "",
      brokerEmail: body.brokerEmail ?? "",
      requestType: body.requestType ?? "GENERAL_BROKER_REQUEST",
      title: body.title ?? "Broker request received",
      subject: body.subject ?? "",
      message: body.message ?? "",
      relatedDocumentName: body.relatedDocumentName ?? "",
      clientCompanyName: body.clientCompanyName ?? "",
      insuranceType: body.insuranceType ?? "",
      status: body.status ?? "PENDING_SALES_REVIEW",
      priority: body.priority ?? "MEDIUM",
      ownerTeam: "sales",
      ownerRole: "Sales Executive",
      observerTeams: body.managerObservationRequired ? ["management"] : [],
      managerObservationRequired: Boolean(body.managerObservationRequired),
      businessImpact: body.businessImpact ?? "",
      externalSafeStatus: body.externalSafeStatus ?? "Broker request received",
      internalNote:
        body.internalNote ??
        "Sales should review this broker request before forwarding internally.",
      actionNeeded:
        body.actionNeeded ?? "Sales should review and decide next action.",
      receivedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "External broker request created",
      data: newRequest,
    });
  } catch (error) {
    console.error("Create external broker request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create external broker request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}