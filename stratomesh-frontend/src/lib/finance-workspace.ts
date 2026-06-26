export type FinanceBoxTemplate = {
  boxType: string;
  name: string;
  description: string;
  decisionOptions: string[];
  tagOptions: string[];
  targetTeams: string[];
  primaryAction: string;
};

export const financeBoxTemplates: FinanceBoxTemplate[] = [
  {
    boxType: "PAYMENT_DECISION_BOX",
    name: "Payment Decision Box",
    description:
      "Verify payment status, UTR, receipt readiness, and finance clearance.",
    decisionOptions: [
      "PAYMENT_RECEIVED",
      "PAYMENT_PENDING",
      "PAYMENT_MISMATCH",
      "FINANCE_HOLD",
    ],
    tagOptions: [
      "PAYMENT_RECEIVED",
      "PAYMENT_PENDING",
      "UTR_MISSING",
      "RECEIPT_READY",
      "CLEAR_FOR_POLICY",
    ],
    targetTeams: ["policyIssuance", "sales", "management"],
    primaryAction: "Send to Policy Issuance",
  },
  {
    boxType: "PREMIUM_CLEARANCE_BOX",
    name: "Premium Clearance Box",
    description:
      "Check final premium, tax, discount approval, and premium mismatch risk.",
    decisionOptions: [
      "PREMIUM_MATCHED",
      "PREMIUM_MISMATCH",
      "TAX_CHECK_REQUIRED",
      "DISCOUNT_APPROVAL_REQUIRED",
      "CLEAR_FOR_POLICY",
    ],
    tagOptions: [
      "PREMIUM_MATCHED",
      "PREMIUM_MISMATCH",
      "TAX_CHECK_REQUIRED",
      "CLEAR_FOR_POLICY",
    ],
    targetTeams: ["policyIssuance", "pricing", "management"],
    primaryAction: "Ask Manager Clearance",
  },
  {
    boxType: "INVOICE_RECEIPT_BOX",
    name: "Invoice / Receipt Box",
    description: "Confirm invoice and receipt readiness before policy issuance.",
    decisionOptions: [
      "INVOICE_READY",
      "RECEIPT_READY",
      "INVOICE_REQUIRED",
      "RECEIPT_PENDING",
    ],
    tagOptions: [
      "INVOICE_READY",
      "RECEIPT_READY",
      "GST_CHECK_REQUIRED",
      "DOCUMENT_ATTACHED",
    ],
    targetTeams: ["policyIssuance", "sales"],
    primaryAction: "Send to Policy Issuance",
  },
  {
    boxType: "CREDIT_APPROVAL_BOX",
    name: "Credit Approval Box",
    description:
      "Handle deferred payment, credit approval, and manager clearance.",
    decisionOptions: [
      "CREDIT_APPROVED",
      "CREDIT_REJECTED",
      "MANAGER_APPROVAL_REQUIRED",
      "FINANCE_HOLD",
    ],
    tagOptions: [
      "CREDIT_APPROVAL_REQUIRED",
      "MANAGER_CLEARANCE",
      "FINANCE_HOLD",
    ],
    targetTeams: ["management", "sales", "policyIssuance"],
    primaryAction: "Ask Manager Clearance",
  },
  {
    boxType: "FINANCE_HOLD_BOX",
    name: "Finance Hold Box",
    description:
      "Block movement due to payment, premium, document, or approval issue.",
    decisionOptions: [
      "HOLD_FOR_PAYMENT",
      "HOLD_FOR_PREMIUM_MISMATCH",
      "HOLD_FOR_DOCUMENT",
      "HOLD_FOR_APPROVAL",
    ],
    tagOptions: [
      "FINANCE_HOLD",
      "PAYMENT_PENDING",
      "PREMIUM_MISMATCH",
      "DOCUMENT_MISSING",
    ],
    targetTeams: ["sales", "pricing", "management"],
    primaryAction: "Save Hold",
  },
  {
    boxType: "CUSTOM_FINANCE_NOTE",
    name: "Custom Finance Note",
    description: "Add a flexible internal finance note.",
    decisionOptions: ["NOTE_ADDED"],
    tagOptions: ["CUSTOM_NOTE", "INTERNAL_NOTE"],
    targetTeams: ["finance"],
    primaryAction: "Save Note",
  },
];

export const financeInboxItems = [
  {
    id: "finance-inbox-001",
    sourceTeam: "Pricing",
    clientName: "Sunrise Foods Pvt Ltd",
    requestTitle: "Premium clearance required",
    requestType: "Payment",
    priority: "HIGH",
    amountLabel: "₹32L - ₹38L",
    statusLabel: "PAYMENT_PENDING",
  },
  {
    id: "finance-inbox-002",
    sourceTeam: "Sales",
    clientName: "GreenPack Industries",
    requestTitle: "Invoice required before issuance",
    requestType: "Invoice / Receipt",
    priority: "MEDIUM",
    amountLabel: "₹18L - ₹22L",
    statusLabel: "INVOICE_REQUIRED",
  },
  {
    id: "finance-inbox-003",
    sourceTeam: "Pricing",
    clientName: "Metro Health Services",
    requestTitle: "Premium mismatch review",
    requestType: "Premium Mismatch",
    priority: "HIGH",
    amountLabel: "₹24L - ₹28L",
    statusLabel: "PREMIUM_MISMATCH",
  },
];