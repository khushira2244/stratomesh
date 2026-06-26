export type WorkspaceItemStatus =
  | "ADDED"
  | "MISSING"
  | "OBSERVE"
  | "NOT_REQUIRED";

export type WorkspaceBoxType =
  | "QUOTE_BOX"
  | "PREMIUM_BOX"
  | "DOCUMENT_BOX"
  | "CLAIMS_LOSS_NOTE"
  | "MANAGER_OBSERVE_BOX"
  | "CUSTOM_BOX"
  | "QUOTATION_RELEASE_BOX"
  | "BROKER_COMMUNICATION_BOX"
  | "BROKER_ACCEPTANCE_BOX"
  | "FINANCE_HANDOFF_BOX"
  | "PREMIUM_TRANSFER_BOX"
  | "CLAIM_INTIMATION_BOX"
  | "POLICY_REFERENCE_BOX"
  | "LOSS_DETAILS_BOX"
  | "CLAIM_DOCUMENT_BOX"
  | "COVERAGE_CONCERN_BOX"
  | "BROKER_RESPONSE_REVIEW_BOX"
  | "DOCUMENT_ATTACHMENT_BOX"
  | "FORWARD_INTERNALLY_BOX";

export type SalesWorkItemType =
  | "BROKER_NEW_POLICY_REQUEST"
  | "INTERNAL_QUOTATION"
  | "BROKER_QUOTE_ACCEPTANCE"
  | "CLAIM_INTIMATION"
  | "BROKER_DOCUMENT_RESPONSE";

export type WorkspaceBoxItem = {
  id: string;
  label: string;
  status: WorkspaceItemStatus;
  observed: boolean;
  importantFor: string;
  required?: boolean;
  documentName?: string;
  comments?: string;
};

export type WorkspaceBoxTemplate = {
  name: string;
  boxType: WorkspaceBoxType;
  description: string;
  items: WorkspaceBoxItem[];
};

export const workspaceBoxTemplates: WorkspaceBoxTemplate[] = [
  {
    name: "Quote Box",
    boxType: "QUOTE_BOX",
    description: "Coverage and quotation package for Underwriting.",
    items: [
      {
        id: "coverage-required",
        label: "Coverage required",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Underwriting needs this to understand requested protection.",
      },
      {
        id: "sum-insured",
        label: "Sum insured",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Underwriting and Pricing need this for exposure size.",
      },
      {
        id: "expected-premium-range",
        label: "Expected premium range",
        status: "ADDED",
        observed: false,
        importantFor: "Pricing needs this to compare expected vs calculated premium.",
      },
      {
        id: "target-premium",
        label: "Target premium",
        status: "ADDED",
        observed: false,
        importantFor: "Sales and Pricing need this for quote negotiation.",
      },
      {
        id: "quote-deadline",
        label: "Quote required by date",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Manager can observe deadline and premium closure risk.",
      },
      {
        id: "policy-start-date",
        label: "Policy start date",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Policy Issuance needs this for coverage activation.",
      },
      {
        id: "policy-end-date",
        label: "Policy end date",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Policy Issuance needs this for coverage period.",
      },
      {
        id: "risk-location",
        label: "Risk location",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Underwriting needs location to evaluate exposure.",
      },
      {
        id: "special-terms",
        label: "Special terms / conditions",
        status: "OBSERVE",
        observed: true,
        importantFor: "Underwriting may need manager observation before accepting.",
      },
    ],
  },
  {
    name: "Premium Box",
    boxType: "PREMIUM_BOX",
    description: "Premium expectation, target, and closure pressure.",
    items: [
      {
        id: "expected-premium",
        label: "Expected premium",
        status: "ADDED",
        observed: false,
        importantFor: "Pricing needs this for quote preparation.",
      },
      {
        id: "target-premium",
        label: "Target premium",
        status: "ADDED",
        observed: false,
        importantFor: "Sales needs this for broker negotiation.",
      },
      {
        id: "previous-premium",
        label: "Previous premium if available",
        status: "NOT_REQUIRED",
        observed: false,
        importantFor: "Pricing can compare expiring premium with new quote.",
      },
      {
        id: "premium-sensitivity",
        label: "Premium sensitivity",
        status: "ADDED",
        observed: false,
        importantFor: "Sales and Pricing need negotiation context.",
      },
      {
        id: "month-end-priority",
        label: "Month-end priority",
        status: "OBSERVE",
        observed: true,
        importantFor: "Manager should observe premium closure pressure.",
      },
      {
        id: "payment-expectation",
        label: "Payment expectation",
        status: "ADDED",
        observed: false,
        importantFor: "Finance needs this later for reconciliation.",
      },
      {
        id: "broker-negotiation-note",
        label: "Broker negotiation note",
        status: "ADDED",
        observed: false,
        importantFor: "Sales gives Pricing context before quote release.",
      },
    ],
  },
  {
    name: "Document Box",
    boxType: "DOCUMENT_BOX",
    description: "Documents received from broker and missing document notes.",
    items: [
      {
        id: "broker-request-letter",
        label: "Broker request letter",
        status: "ADDED",
        observed: false,
        required: true,
        documentName: "Broker request letter",
        importantFor: "Sales and Underwriting need request context.",
      },
      {
        id: "proposal-form",
        label: "Proposal form",
        status: "ADDED",
        observed: false,
        required: true,
        documentName: "Proposal form",
        importantFor: "Underwriting needs proposal details.",
      },
      {
        id: "asset-schedule",
        label: "Asset schedule",
        status: "ADDED",
        observed: false,
        required: true,
        documentName: "Asset schedule",
        importantFor: "Underwriting needs asset values and locations.",
      },
      {
        id: "gst-certificate",
        label: "GST certificate",
        status: "ADDED",
        observed: false,
        documentName: "GST certificate",
        importantFor: "Finance and issuance need tax details.",
      },
      {
        id: "risk-location-details",
        label: "Risk location details",
        status: "ADDED",
        observed: false,
        required: true,
        documentName: "Risk location details",
        importantFor: "Underwriting needs location details for risk evaluation.",
      },
      {
        id: "previous-policy-copy",
        label: "Previous policy copy",
        status: "NOT_REQUIRED",
        observed: false,
        documentName: "Previous policy copy",
        importantFor: "Useful if client is shifting from another insurer.",
      },
      {
        id: "fire-safety-certificate",
        label: "Fire safety certificate",
        status: "OBSERVE",
        observed: true,
        documentName: "Fire safety certificate",
        importantFor: "Underwriting may question this if missing or expired.",
      },
      {
        id: "claim-history-loss-declaration",
        label: "Claim history / loss declaration",
        status: "ADDED",
        observed: false,
        required: true,
        documentName: "Claim history / loss declaration",
        importantFor: "Underwriting needs this to evaluate risk quality.",
      },
    ],
  },
  {
    name: "Claims / Loss Note",
    boxType: "CLAIMS_LOSS_NOTE",
    description: "Past claim or loss-history comment if needed.",
    items: [
      {
        id: "past-claim-history",
        label: "Past claim history",
        status: "ADDED",
        observed: false,
        importantFor: "Underwriting needs this to evaluate risk quality.",
      },
      {
        id: "loss-declaration",
        label: "Loss declaration",
        status: "ADDED",
        observed: false,
        importantFor: "Underwriting uses this for claim-risk judgement.",
      },
      {
        id: "no-claim-declaration",
        label: "No-claim declaration",
        status: "ADDED",
        observed: false,
        importantFor: "Supports happy-path underwriting if no losses exist.",
      },
      {
        id: "large-loss-note",
        label: "Large loss note",
        status: "NOT_REQUIRED",
        observed: false,
        importantFor: "Only needed if previous large losses exist.",
      },
      {
        id: "survey-inspection-dependency",
        label: "Survey / inspection dependency",
        status: "NOT_REQUIRED",
        observed: false,
        importantFor: "Needed only if underwriting requires inspection.",
      },
    ],
  },
  {
    name: "Manager Observe Box",
    boxType: "MANAGER_OBSERVE_BOX",
    description: "Special observation when something is waived or risky.",
    items: [
      {
        id: "manager-observation-reason",
        label: "Manager observation reason",
        status: "OBSERVE",
        observed: true,
        required: true,
        importantFor: "Manager needs a reason before approving waiver or exception.",
      },
      {
        id: "business-impact",
        label: "Business impact",
        status: "OBSERVE",
        observed: true,
        importantFor: "Shows premium, deadline, or underwriting impact.",
      },
    ],
  },
  {
    name: "Custom Box",
    boxType: "CUSTOM_BOX",
    description: "Flexible business note created by Sales.",
    items: [
      {
        id: "custom-note",
        label: "Custom note",
        status: "ADDED",
        observed: false,
        importantFor: "Sales can add scenario-specific business context.",
      },
    ],
  },
];


export const quotationReleaseBoxTemplates: WorkspaceBoxTemplate[] = [
  {
    name: "Quotation Release Box",
    boxType: "QUOTATION_RELEASE_BOX",
    description: "Approved quotation data received internally and prepared for broker release.",
    items: [
      {
        id: "quotation-number",
        label: "Quotation number",
        status: "ADDED",
        observed: false,
        importantFor: "Sales needs this to identify the quote sent to broker.",
      },
      {
        id: "quoted-premium",
        label: "Quoted premium",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Broker and Finance need the final quoted premium.",
      },
      {
        id: "sum-insured",
        label: "Sum insured",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Broker must see coverage value in the quotation.",
      },
      {
        id: "deductible-excess",
        label: "Deductible / excess",
        status: "ADDED",
        observed: false,
        importantFor: "Broker must understand claim sharing terms.",
      },
      {
        id: "special-conditions",
        label: "Special conditions",
        status: "OBSERVE",
        observed: true,
        importantFor: "Sales may need manager visibility before broker release.",
      },
      {
        id: "quotation-validity",
        label: "Quotation validity",
        status: "ADDED",
        observed: false,
        importantFor: "Broker needs quote expiry timeline.",
      },
    ],
  },
  {
    name: "Broker Communication Box",
    boxType: "BROKER_COMMUNICATION_BOX",
    description: "Broker-safe message and attachment selection for quote release.",
    items: [
      {
        id: "broker-name",
        label: "Broker name",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Sales sends quote to the correct broker.",
      },
      {
        id: "broker-email",
        label: "Broker email",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "External communication must be broker-safe and traceable.",
      },
      {
        id: "external-message",
        label: "External message",
        status: "ADDED",
        observed: false,
        importantFor: "Broker sees controlled wording, not internal team debate.",
      },
      {
        id: "quotation-attachment",
        label: "Quotation attachment selected",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Broker must receive the approved quotation document.",
      },
    ],
  },
  {
    name: "Broker Acceptance Box",
    boxType: "BROKER_ACCEPTANCE_BOX",
    description: "Tracks broker/client acceptance after quotation release.",
    items: [
      {
        id: "broker-response-status",
        label: "Broker response status",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Sales must know if broker accepted, rejected, or is waiting.",
      },
      {
        id: "acceptance-date",
        label: "Acceptance date",
        status: "ADDED",
        observed: false,
        importantFor: "Finance and issuance need acceptance timing.",
      },
      {
        id: "client-confirmation-note",
        label: "Client confirmation note",
        status: "ADDED",
        observed: false,
        importantFor: "Confirms broker acceptance is backed by client intent.",
      },
    ],
  },
  {
    name: "Finance Handoff Box",
    boxType: "FINANCE_HANDOFF_BOX",
    description: "Premium and payment handoff after broker acceptance.",
    items: [
      {
        id: "premium-payable",
        label: "Premium amount payable",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Finance needs final payable premium.",
      },
      {
        id: "gst-tax-breakup",
        label: "GST / tax breakup",
        status: "ADDED",
        observed: false,
        importantFor: "Finance needs tax breakup for reconciliation.",
      },
      {
        id: "payment-due-date",
        label: "Payment due date",
        status: "ADDED",
        observed: false,
        importantFor: "Sales and Finance track payment timeline.",
      },
      {
        id: "finance-note",
        label: "Finance note",
        status: "ADDED",
        observed: false,
        importantFor: "Sales passes broker/payment context to Finance.",
      },
    ],
  },
  workspaceBoxTemplates.find((box) => box.boxType === "CUSTOM_BOX")!,
];

export const brokerQuoteAcceptanceBoxTemplates: WorkspaceBoxTemplate[] = [
  {
    name: "Broker Acceptance Box",
    boxType: "BROKER_ACCEPTANCE_BOX",
    description: "Tracks broker/client acceptance after quotation release.",
    items: [
      {
        id: "broker-response-status",
        label: "Broker response status",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor:
          "Sales must confirm whether broker accepted, rejected, or is waiting.",
      },
      {
        id: "acceptance-date",
        label: "Acceptance date",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Finance and issuance need acceptance timing.",
      },
      {
        id: "client-confirmation-note",
        label: "Client confirmation note",
        status: "ADDED",
        observed: false,
        importantFor: "Confirms broker acceptance is backed by client intent.",
      },
    ],
  },
  {
    name: "Premium Transfer Box",
    boxType: "PREMIUM_TRANSFER_BOX",
    description: "Premium transfer details received from broker/client.",
    items: [
      {
        id: "premium-transfer-status",
        label: "Premium transfer status",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Finance needs to know whether premium transfer started.",
      },
      {
        id: "payment-proof",
        label: "Payment proof / advice",
        status: "ADDED",
        observed: false,
        required: true,
        documentName: "Payment proof",
        importantFor: "Finance needs payment proof for reconciliation.",
      },
      {
        id: "utr-reference",
        label: "UTR / bank reference",
        status: "ADDED",
        observed: false,
        importantFor: "Finance uses this to match bank transaction.",
      },
      {
        id: "premium-amount",
        label: "Premium amount transferred",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Finance validates amount against quoted premium.",
      },
    ],
  },
  {
    name: "Finance Handoff Box",
    boxType: "FINANCE_HANDOFF_BOX",
    description: "Premium and payment handoff after broker acceptance.",
    items: [
      {
        id: "premium-payable",
        label: "Premium amount payable",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Finance needs final payable premium.",
      },
      {
        id: "gst-tax-breakup",
        label: "GST / tax breakup",
        status: "ADDED",
        observed: false,
        importantFor: "Finance needs tax breakup for reconciliation.",
      },
      {
        id: "payment-due-date",
        label: "Payment due date",
        status: "ADDED",
        observed: false,
        importantFor: "Sales and Finance track payment timeline.",
      },
      {
        id: "finance-note",
        label: "Finance note",
        status: "ADDED",
        observed: false,
        importantFor: "Sales passes broker/payment context to Finance.",
      },
    ],
  },
  workspaceBoxTemplates.find((box) => box.boxType === "CUSTOM_BOX")!,
];

export const claimIntakeBoxTemplates: WorkspaceBoxTemplate[] = [
  {
    name: "Claim Intimation Box",
    boxType: "CLAIM_INTIMATION_BOX",
    description: "Initial claim report received from broker or client.",
    items: [
      {
        id: "claim-type",
        label: "Claim type",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Claims team needs claim category before review.",
      },
      {
        id: "incident-date",
        label: "Incident date",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Coverage review needs loss date validation.",
      },
      {
        id: "incident-location",
        label: "Incident location",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Underwriting coverage review checks declared location.",
      },
      {
        id: "reported-by",
        label: "Reported by",
        status: "ADDED",
        observed: false,
        importantFor: "Relationship trail must show who reported the claim.",
      },
      {
        id: "initial-claim-summary",
        label: "Initial claim summary",
        status: "ADDED",
        observed: false,
        importantFor: "Claims team needs incident context.",
      },
    ],
  },
  {
    name: "Policy Reference Box",
    boxType: "POLICY_REFERENCE_BOX",
    description: "Policy details needed to connect claim to coverage.",
    items: [
      {
        id: "policy-number",
        label: "Policy number",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Claims and Underwriting need policy reference.",
      },
      {
        id: "policy-holder",
        label: "Policy holder",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Confirms claim belongs to insured client.",
      },
      {
        id: "policy-period",
        label: "Policy period",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Coverage review checks if loss date falls inside policy period.",
      },
      {
        id: "sum-insured",
        label: "Sum insured",
        status: "ADDED",
        observed: false,
        importantFor: "Claims team uses this for limit check.",
      },
    ],
  },
  {
    name: "Loss Details Box",
    boxType: "LOSS_DETAILS_BOX",
    description: "Loss cause, estimated amount, and affected assets.",
    items: [
      {
        id: "cause-of-loss",
        label: "Cause of loss",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Coverage review checks whether the peril is covered.",
      },
      {
        id: "estimated-loss-amount",
        label: "Estimated loss amount",
        status: "ADDED",
        observed: false,
        importantFor: "Manager may observe high-value claims.",
      },
      {
        id: "affected-asset-location",
        label: "Affected asset / location",
        status: "ADDED",
        observed: false,
        importantFor: "Claims and surveyor need affected asset details.",
      },
      {
        id: "damage-summary",
        label: "Damage summary",
        status: "ADDED",
        observed: false,
        importantFor: "Claims team needs clear loss description.",
      },
    ],
  },
  {
    name: "Claim Document Box",
    boxType: "CLAIM_DOCUMENT_BOX",
    description: "Claim documents received or missing from broker/client.",
    items: [
      {
        id: "claim-form",
        label: "Claim form",
        status: "ADDED",
        observed: false,
        required: true,
        documentName: "Claim form",
        importantFor: "Claims team requires claim form for registration.",
      },
      {
        id: "loss-photos",
        label: "Loss photos",
        status: "ADDED",
        observed: false,
        documentName: "Loss photos",
        importantFor: "Surveyor and Claims team need visual evidence.",
      },
      {
        id: "repair-estimate",
        label: "Repair estimate",
        status: "MISSING",
        observed: false,
        documentName: "Repair estimate",
        importantFor: "Finance/Claims need estimate for settlement evaluation.",
      },
      {
        id: "policy-copy",
        label: "Policy copy",
        status: "ADDED",
        observed: false,
        documentName: "Policy copy",
        importantFor: "Coverage review uses policy terms.",
      },
      {
        id: "bank-details",
        label: "Bank details",
        status: "MISSING",
        observed: false,
        documentName: "Bank details",
        importantFor: "Finance needs this for settlement payment.",
      },
      {
        id: "surveyor-report",
        label: "Surveyor report",
        status: "NOT_REQUIRED",
        observed: false,
        documentName: "Surveyor report",
        importantFor: "May be required after surveyor appointment.",
      },
    ],
  },
  {
    name: "Coverage Concern Box",
    boxType: "COVERAGE_CONCERN_BOX",
    description: "Possible coverage issues that need underwriting or manager review.",
    items: [
      {
        id: "possible-exclusion",
        label: "Possible exclusion",
        status: "OBSERVE",
        observed: true,
        importantFor: "Underwriting coverage review may need manager observation.",
      },
      {
        id: "late-intimation",
        label: "Late intimation",
        status: "NOT_REQUIRED",
        observed: false,
        importantFor: "Can affect claim admissibility if delayed.",
      },
      {
        id: "location-mismatch",
        label: "Location mismatch",
        status: "NOT_REQUIRED",
        observed: false,
        importantFor: "Coverage may fail if loss happened at undeclared location.",
      },
    ],
  },
  workspaceBoxTemplates.find((box) => box.boxType === "MANAGER_OBSERVE_BOX")!,
  workspaceBoxTemplates.find((box) => box.boxType === "CUSTOM_BOX")!,
];

export const brokerDocumentResponseBoxTemplates: WorkspaceBoxTemplate[] = [
  {
    name: "Broker Response Review Box",
    boxType: "BROKER_RESPONSE_REVIEW_BOX",
    description: "Review clarification or missing document response from broker.",
    items: [
      {
        id: "response-type",
        label: "Response type",
        status: "ADDED",
        observed: false,
        importantFor: "Sales classifies broker reply before forwarding internally.",
      },
      {
        id: "response-summary",
        label: "Response summary",
        status: "ADDED",
        observed: false,
        importantFor: "Internal team can understand broker response quickly.",
      },
      {
        id: "response-acceptable",
        label: "Response acceptable for forwarding",
        status: "ADDED",
        observed: false,
        importantFor: "Sales decides if response is ready for internal team.",
      },
    ],
  },
  {
    name: "Document Attachment Box",
    boxType: "DOCUMENT_ATTACHMENT_BOX",
    description: "Attach broker document or explanation to existing case context.",
    items: [
      {
        id: "document-name",
        label: "Document name",
        status: "ADDED",
        observed: false,
        documentName: "Broker uploaded document",
        importantFor: "Links broker response to document dependency.",
      },
      {
        id: "document-status",
        label: "Document status",
        status: "ADDED",
        observed: false,
        importantFor: "Marks whether document is received, partial, or still missing.",
      },
    ],
  },
  {
    name: "Forward Internally Box",
    boxType: "FORWARD_INTERNALLY_BOX",
    description: "Forward broker response to the correct internal team.",
    items: [
      {
        id: "forward-to-team",
        label: "Forward to team",
        status: "ADDED",
        observed: false,
        required: true,
        importantFor: "Routes broker response to Underwriting, Pricing, Claims, or Finance.",
      },
      {
        id: "internal-note",
        label: "Internal note",
        status: "ADDED",
        observed: false,
        importantFor: "Sales adds broker-safe context before forwarding internally.",
      },
    ],
  },
  workspaceBoxTemplates.find((box) => box.boxType === "MANAGER_OBSERVE_BOX")!,
  workspaceBoxTemplates.find((box) => box.boxType === "CUSTOM_BOX")!,
];

export function getWorkspaceBoxTemplate(name: string) {
  return workspaceBoxTemplates.find((box) => box.name === name);
}

export function cloneWorkspaceItems(items: WorkspaceBoxItem[]) {
  return items.map((item) => ({
    ...item,
    comments: item.comments || "",
  }));
}

export function getObservedItems(items: WorkspaceBoxItem[]) {
  return items.filter((item) => item.status === "OBSERVE" || item.observed);
}

export function getMissingItems(items: WorkspaceBoxItem[]) {
  return items.filter((item) => item.status === "MISSING");
}

export function getBlockStatusFromItems(items: WorkspaceBoxItem[]) {
  if (getMissingItems(items).some((item) => item.required)) {
    return "BLOCKED";
  }

  if (getObservedItems(items).length > 0) {
    return "WAITING";
  }

  return "COMPLETED";
}

export function getPendingReasonFromItems(items: WorkspaceBoxItem[]) {
  const observedItems = getObservedItems(items);
  const missingItems = getMissingItems(items);

  if (missingItems.length > 0) {
    return `${missingItems.length} item(s) marked missing: ${missingItems
      .map((item) => item.label)
      .join(", ")}`;
  }

  if (observedItems.length > 0) {
    return `${observedItems.length} item(s) marked for manager observation: ${observedItems
      .map((item) => item.label)
      .join(", ")}`;
  }

  return "";
}
export function getSalesWorkspaceTemplates(
  workItemType: SalesWorkItemType,
  scenarioKey?: string
) {
  if (workItemType === "INTERNAL_QUOTATION") {
    return quotationReleaseBoxTemplates;
  }

  if (workItemType === "BROKER_QUOTE_ACCEPTANCE") {
    return brokerQuoteAcceptanceBoxTemplates;
  }

  if (workItemType === "BROKER_DOCUMENT_RESPONSE") {
    return brokerDocumentResponseBoxTemplates;
  }

  if (workItemType === "CLAIM_INTIMATION" || scenarioKey === "claim-settlement") {
    return claimIntakeBoxTemplates;
  }

  return workspaceBoxTemplates;
}

