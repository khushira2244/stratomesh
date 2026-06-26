export type PricingBoxTemplate = {
  boxType: string;
  name: string;
  description: string;
  decisionOptions: string[];
  tagOptions: string[];
  targetTeams: string[];
  primaryAction: string;
};

export const pricingBoxTemplates: PricingBoxTemplate[] = [
  {
    boxType: "BASE_PREMIUM_BOX",
    name: "Base Premium Calculation",
    description:
      "Create the base premium from coverage, sum insured, and policy requirement.",
    decisionOptions: [
      "BASE_PREMIUM_READY",
      "BASE_PREMIUM_PENDING",
      "MORE_DATA_REQUIRED",
    ],
    tagOptions: [
      "BASE_PREMIUM_READY",
      "SUM_INSURED_CHECKED",
      "COVERAGE_MAPPED",
      "MORE_DATA_REQUIRED",
    ],
    targetTeams: ["sales", "finance", "management"],
    primaryAction: "Save Base Premium",
  },
  {
    boxType: "RISK_LOADING_BOX",
    name: "Risk Loading Box",
    description:
      "Apply risk loading based on underwriting notes, claim history, or high-risk exposure.",
    decisionOptions: [
      "RISK_LOADING_APPLIED",
      "NO_LOADING_REQUIRED",
      "RISK_DATA_MISSING",
      "SEND_BACK_TO_UNDERWRITING",
    ],
    tagOptions: [
      "RISK_LOADING_APPLIED",
      "UNDERWRITING_NOTE_USED",
      "CLAIM_HISTORY_CHECKED",
      "RISK_DATA_MISSING",
    ],
    targetTeams: ["sales", "underwriting", "management"],
    primaryAction: "Apply Risk Loading",
  },
  {
    boxType: "DISCOUNT_DEVIATION_BOX",
    name: "Discount / Deviation Box",
    description:
      "Handle discount approval, deviation approval, and quote competitiveness.",
    decisionOptions: [
      "DISCOUNT_APPLIED",
      "DISCOUNT_REJECTED",
      "MANAGER_APPROVAL_REQUIRED",
      "QUOTE_HOLD",
    ],
    tagOptions: [
      "DISCOUNT_APPLIED",
      "DEVIATION_REQUESTED",
      "MANAGER_APPROVAL_REQUIRED",
      "QUOTE_HOLD",
    ],
    targetTeams: ["sales", "management"],
    primaryAction: "Ask Manager Approval",
  },
  {
    boxType: "QUOTE_APPROVAL_BOX",
    name: "Quote Approval Box",
    description:
      "Approve quote amount before release to Sales, Broker, or Finance.",
    decisionOptions: [
      "QUOTE_APPROVED",
      "QUOTE_REJECTED",
      "QUOTE_REVISION_REQUIRED",
      "QUOTE_READY",
    ],
    tagOptions: [
      "QUOTE_APPROVED",
      "QUOTE_READY",
      "PREMIUM_CALCULATED",
      "CLEAR_FOR_FINANCE",
    ],
    targetTeams: ["sales", "finance"],
    primaryAction: "Send Quote",
  },
  {
    boxType: "FINAL_QUOTE_RELEASE_BOX",
    name: "Final Quote Release Box",
    description:
      "Prepare the final quote package with premium, tags, comments, and next route.",
    decisionOptions: [
      "FINAL_QUOTE_READY",
      "SEND_TO_SALES",
      "SEND_TO_FINANCE",
      "QUOTE_HOLD",
    ],
    tagOptions: [
      "FINAL_QUOTE_READY",
      "QUOTE_READY",
      "CLEAR_FOR_FINANCE",
      "QUOTE_HOLD",
    ],
    targetTeams: ["sales", "finance"],
    primaryAction: "Release Final Quote",
  },
  {
    boxType: "CUSTOM_PRICING_NOTE",
    name: "Custom Pricing Note",
    description: "Add a flexible internal pricing note.",
    decisionOptions: ["NOTE_ADDED"],
    tagOptions: ["CUSTOM_NOTE", "INTERNAL_NOTE"],
    targetTeams: ["pricing"],
    primaryAction: "Save Note",
  },
];

export const pricingInboxItems = [
  {
    id: "pricing-inbox-001",
    sourceTeam: "Sales",
    clientName: "Sunrise Foods Pvt Ltd",
    requestTitle: "New Fire & Property Quote",
    requestType: "New Quote",
    priority: "HIGH",
    amountLabel: "₹32L - ₹38L",
    statusLabel: "QUOTE_PENDING",
  },
  {
    id: "pricing-inbox-002",
    sourceTeam: "Underwriting",
    clientName: "GreenPack Industries",
    requestTitle: "Risk loading required",
    requestType: "Risk Loading",
    priority: "MEDIUM",
    amountLabel: "₹18L - ₹22L",
    statusLabel: "RISK_LOADING_REQUIRED",
  },
  {
    id: "pricing-inbox-003",
    sourceTeam: "Sales",
    clientName: "Metro Health Services",
    requestTitle: "Discount approval requested",
    requestType: "Discount Approval",
    priority: "HIGH",
    amountLabel: "₹24L - ₹28L",
    statusLabel: "DISCOUNT_APPROVAL_REQUIRED",
  },
];