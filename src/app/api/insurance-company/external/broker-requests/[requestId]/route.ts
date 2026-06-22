import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

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
    allowedSalesActions: [
      "ACCEPT_AND_ATTACH_TO_CASE",
      "FORWARD_TO_UNDERWRITING",
      "ASK_BROKER_FOR_UPDATED_DOCUMENT",
      "ESCALATE_TO_MANAGER",
      "MARK_RESOLVED",
    ],
    managerObservation: {
      required: true,
      reason:
        "Broker clarification may affect underwriting continuation and quote deadline.",
      status: "PENDING",
    },
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
    allowedSalesActions: [
      "RESPOND_WITH_SAFE_STATUS",
      "ESCALATE_TO_MANAGER",
      "CHECK_INTERNAL_STAGE",
      "MARK_RESOLVED",
    ],
    managerObservation: {
      required: true,
      reason: "Quote deadline follow-up may affect broker/client confidence.",
      status: "PENDING",
    },
    receivedAt: "2026-06-19T14:05:00.000Z",
    createdAt: "2026-06-19T14:05:00.000Z",
    updatedAt: "2026-06-19T14:05:00.000Z",
  },
];

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { requestId } = await context.params;

    const brokerRequest = brokerRequests.find((item) => item.id === requestId);

    if (!brokerRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "External broker request not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "External broker request detail fetched",
      data: brokerRequest,
    });
  } catch (error) {
    console.error("Get external broker request detail error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch external broker request detail",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { requestId } = await context.params;
    const body = await request.json();

    const brokerRequest = brokerRequests.find((item) => item.id === requestId);

    if (!brokerRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "External broker request not found",
        },
        { status: 404 }
      );
    }

    const updatedRequest = {
      ...brokerRequest,
      status: body.status ?? brokerRequest.status,
      priority: body.priority ?? brokerRequest.priority,
      ownerTeam: body.ownerTeam ?? brokerRequest.ownerTeam,
      actionNeeded: body.actionNeeded ?? brokerRequest.actionNeeded,
      internalNote: body.internalNote ?? brokerRequest.internalNote,
      managerObservationRequired:
        body.managerObservationRequired ??
        brokerRequest.managerObservationRequired,
      salesDecision: body.salesDecision ?? "",
      salesComment: body.salesComment ?? "",
      forwardedInternallyTo: body.forwardedInternallyTo ?? "",
      resolvedBy: body.resolvedBy ?? "",
      resolvedAt: body.status === "RESOLVED" ? new Date().toISOString() : "",
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "External broker request updated",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Update external broker request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update external broker request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}