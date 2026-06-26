export type WorkspaceItemStatus =
  | "ADDED"
  | "MISSING"
  | "OBSERVE"
  | "NOT_REQUIRED";

export type UnderwritingBlockActionType =
  | "SAVE_BLOCK"
  | "COMPLETE_BLOCK"
  | "PROGRESS_TO_PRICING"
  | "ROUTE_TO_SALES"
  | "ROUTE_TO_FINANCE"
  | "REQUEST_MANAGER_CLEARANCE"
  | "ADD_PRICING_CONTEXT";

export type UnderwritingBlockAction = {
  id: string;
  label: string;
  actionType: UnderwritingBlockActionType;
  targetTeam?: string;
  variant?: "primary" | "secondary" | "warning";
};

export type UnderwritingBlockItem = {
  id: string;
  label: string;
  description?: string;
  status: WorkspaceItemStatus;
  observed: boolean;
  importantFor?: string;
  comment?: string;
  internalReason?: string;
  visibleTo?: string[];
  routeToTeam?: string;
};

export type UnderwritingBoxTemplate = {
  name: string;
  boxType: string;
  description: string;
  targetTeam: string;
  defaultRouteToNext: string;
  items: UnderwritingBlockItem[];
  actions: UnderwritingBlockAction[];
};

export type ReviewedSalesInput = {
  sourceTeam: "sales";
  sourceBox: string;
  sourceItem: string;
  sourceStatus: string;
  underwritingDecision: string;
  underwritingComment?: string;
};

export const underwritingBoxTemplates: UnderwritingBoxTemplate[] = [
  {
    name: "Risk Review Box",
    boxType: "RISK_REVIEW_BOX",
    description: "Risk exposure, occupancy, location, and asset reasonableness.",
    targetTeam: "pricing",
    defaultRouteToNext: "pricing",
    items: [
      {
        id: "business-activity",
        label: "Business activity / occupancy",
        description: "Underwriting checks business activity and occupancy exposure.",
        status: "ADDED",
        observed: false,
        importantFor: "Pricing needs this for risk rating.",
        visibleTo: ["underwriting", "pricing", "management"],
        routeToTeam: "pricing",
      },
      {
        id: "risk-location",
        label: "Risk location",
        description: "Underwriting needs location to evaluate exposure.",
        status: "ADDED",
        observed: false,
        importantFor: "Pricing needs this for location risk.",
        visibleTo: ["underwriting", "pricing", "management"],
        routeToTeam: "pricing",
      },
      {
        id: "fire-exposure",
        label: "Fire exposure level",
        description: "Fire risk, storage risk, and occupancy dependency.",
        status: "OBSERVE",
        observed: true,
        importantFor:
          "Manager and Pricing can see why risk loading may be needed.",
        visibleTo: ["underwriting", "pricing", "management"],
        routeToTeam: "pricing",
      },
    ],
    actions: [
      {
        id: "save-risk-review",
        label: "Save Risk Review",
        actionType: "SAVE_BLOCK",
        variant: "secondary",
      },
      {
        id: "complete-risk-review",
        label: "Mark Risk Review Complete",
        actionType: "COMPLETE_BLOCK",
        variant: "primary",
      },
      {
        id: "ask-manager-clearance",
        label: "Ask Manager Clearance",
        actionType: "REQUEST_MANAGER_CLEARANCE",
        targetTeam: "management",
        variant: "warning",
      },
    ],
  },
  {
    name: "Document Dependency Box",
    boxType: "DOCUMENT_DEPENDENCY_BOX",
    description: "Documents needed before underwriting or pricing can proceed.",
    targetTeam: "sales",
    defaultRouteToNext: "sales",
    items: [
      {
        id: "fire-safety-certificate",
        label: "Fire safety certificate",
        description: "Certificate dependency for fire/property risk.",
        status: "OBSERVE",
        observed: true,
        importantFor: "Underwriting may need this before accepting risk.",
        visibleTo: ["underwriting", "sales", "management"],
        routeToTeam: "sales",
      },
      {
        id: "asset-schedule",
        label: "Asset schedule",
        description: "Asset list and sum insured breakup.",
        status: "ADDED",
        observed: false,
        importantFor: "Pricing needs asset-level values.",
        visibleTo: ["underwriting", "pricing"],
        routeToTeam: "pricing",
      },
      {
        id: "previous-policy-copy",
        label: "Previous policy copy",
        description: "Previous policy details, if available.",
        status: "MISSING",
        observed: false,
        importantFor: "Useful for comparison and renewal context.",
        visibleTo: ["underwriting", "sales"],
        routeToTeam: "sales",
      },
    ],
    actions: [
      {
        id: "save-document-review",
        label: "Save Document Review",
        actionType: "SAVE_BLOCK",
        variant: "secondary",
      },
      {
        id: "route-clarification-sales",
        label: "Route Clarification to Source Team",
        actionType: "ROUTE_TO_SALES",
        targetTeam: "sales",
        variant: "warning",
      },
      {
        id: "ask-manager-clearance",
        label: "Ask Manager Clearance",
        actionType: "REQUEST_MANAGER_CLEARANCE",
        targetTeam: "management",
        variant: "warning",
      },
    ],
  },
  {
    name: "Claims / Loss Review Box",
    boxType: "CLAIMS_LOSS_REVIEW_BOX",
    description: "Past claims, loss declaration, loss ratio, and risk impact.",
    targetTeam: "pricing",
    defaultRouteToNext: "pricing",
    items: [
      {
        id: "claim-history",
        label: "Claim history / loss declaration",
        description: "Previous losses or no-claim declaration.",
        status: "ADDED",
        observed: false,
        importantFor: "Pricing needs claim history for risk loading.",
        visibleTo: ["underwriting", "pricing", "management"],
        routeToTeam: "pricing",
      },
      {
        id: "large-loss-flag",
        label: "Large loss flag",
        description: "Any large loss that should be observed.",
        status: "OBSERVE",
        observed: true,
        importantFor: "Manager can see why underwriting is cautious.",
        visibleTo: ["underwriting", "pricing", "management"],
        routeToTeam: "pricing",
      },
    ],
    actions: [
      {
        id: "save-claims-review",
        label: "Save Claims Review",
        actionType: "SAVE_BLOCK",
        variant: "secondary",
      },
      {
        id: "ask-manager-clearance",
        label: "Ask Manager Clearance",
        actionType: "REQUEST_MANAGER_CLEARANCE",
        targetTeam: "management",
        variant: "warning",
      },
      {
        id: "send-claim-context-pricing",
        label: "Send Claim Context to Pricing",
        actionType: "ADD_PRICING_CONTEXT",
        targetTeam: "pricing",
        variant: "primary",
      },
    ],
  },
  {
    name: "Finance Check Box",
    boxType: "FINANCE_CHECK_BOX",
    description: "Premium/payment dependency for Finance team.",
    targetTeam: "finance",
    defaultRouteToNext: "finance",
    items: [
      {
        id: "premium-confirmation",
        label: "Premium confirmation required",
        description: "Finance should confirm premium/payment basis.",
        status: "ADDED",
        observed: false,
        importantFor: "Finance needs this for reconciliation.",
        visibleTo: ["underwriting", "finance", "management"],
        routeToTeam: "finance",
      },
      {
        id: "payment-mode",
        label: "Payment mode dependency",
        description: "Check if payment mode or UTR dependency exists.",
        status: "OBSERVE",
        observed: true,
        importantFor: "Manager sees why Finance is involved.",
        visibleTo: ["underwriting", "finance", "management"],
        routeToTeam: "finance",
      },
    ],
    actions: [
      {
        id: "save-finance-check",
        label: "Save Finance Check",
        actionType: "SAVE_BLOCK",
        variant: "secondary",
      },
      {
        id: "route-to-finance",
        label: "Route to Finance",
        actionType: "ROUTE_TO_FINANCE",
        targetTeam: "finance",
        variant: "primary",
      },
    ],
  },
  {
    name: "Manager Clearance Box",
    boxType: "MANAGER_CLEARANCE_BOX",
    description: "Manager approval for risky waiver, exception, or observed item.",
    targetTeam: "management",
    defaultRouteToNext: "management",
    items: [
      {
        id: "manager-clearance",
        label: "Manager clearance required",
        description: "Manager must review before next team movement.",
        status: "OBSERVE",
        observed: true,
        importantFor: "Manager needs visibility on exception.",
        visibleTo: ["underwriting", "management"],
        routeToTeam: "management",
      },
      {
        id: "exception-reason",
        label: "Exception reason",
        description: "Why this case needs clearance.",
        status: "ADDED",
        observed: false,
        importantFor: "Audit trail for management/compliance.",
        visibleTo: ["underwriting", "management"],
        routeToTeam: "management",
      },
    ],
    actions: [
      {
        id: "save-clearance-request",
        label: "Save Clearance Request",
        actionType: "SAVE_BLOCK",
        variant: "secondary",
      },
      {
        id: "request-manager-clearance",
        label: "Request Manager Clearance",
        actionType: "REQUEST_MANAGER_CLEARANCE",
        targetTeam: "management",
        variant: "warning",
      },
    ],
  },
  {
    name: "Pricing Handoff Box",
    boxType: "PRICING_HANDOFF_BOX",
    description: "Final underwriting notes sent to Pricing.",
    targetTeam: "pricing",
    defaultRouteToNext: "pricing",
    items: [
      {
        id: "risk-accepted-for-pricing",
        label: "Risk accepted for pricing",
        description: "Underwriting accepts risk for pricing preparation.",
        status: "ADDED",
        observed: false,
        importantFor: "Pricing can begin quote preparation.",
        visibleTo: ["underwriting", "pricing"],
        routeToTeam: "pricing",
      },
      {
        id: "rating-factors",
        label: "Rating factors shared",
        description: "Risk factors that Pricing should consider.",
        status: "ADDED",
        observed: false,
        importantFor: "Pricing needs underwriting rating factors.",
        visibleTo: ["underwriting", "pricing"],
        routeToTeam: "pricing",
      },
      {
        id: "special-pricing-note",
        label: "Special pricing note",
        description: "Any pricing caution or special term.",
        status: "OBSERVE",
        observed: true,
        importantFor: "Pricing and manager see special condition.",
        visibleTo: ["underwriting", "pricing", "management"],
        routeToTeam: "pricing",
      },
    ],
    actions: [
      {
        id: "save-pricing-handoff",
        label: "Save Pricing Handoff",
        actionType: "SAVE_BLOCK",
        variant: "secondary",
      },
      {
        id: "send-to-pricing",
        label: "Send to Pricing",
        actionType: "PROGRESS_TO_PRICING",
        targetTeam: "pricing",
        variant: "primary",
      },
    ],
  },
  {
    name: "Clarification / Return Box",
    boxType: "CLARIFICATION_RETURN_BOX",
    description:
      "Send rejected, missing, or unclear package inputs back to the source team.",
    targetTeam: "source",
    defaultRouteToNext: "sales",
    items: [
      {
        id: "package-clarification",
        label: "Package clarification required",
        description: "The received package has an input/config that needs correction.",
        status: "OBSERVE",
        observed: true,
        importantFor: "Source team must fix or clarify this before review continues.",
        visibleTo: ["underwriting", "sales", "management"],
        routeToTeam: "sales",
      },
    ],
    actions: [
      {
        id: "save-clarification",
        label: "Save Clarification",
        actionType: "SAVE_BLOCK",
        variant: "secondary",
      },
      {
        id: "send-back-source",
        label: "Send Back to Source Team",
        actionType: "ROUTE_TO_SALES",
        targetTeam: "sales",
        variant: "warning",
      },
    ],
  },
  {
    name: "Custom Underwriting Note",
    boxType: "CUSTOM_UNDERWRITING_NOTE",
    description: "Flexible note for case-specific underwriting context.",
    targetTeam: "pricing",
    defaultRouteToNext: "pricing",
    items: [
      {
        id: "custom-note",
        label: "Custom underwriting note",
        description: "Add custom case-specific underwriting input.",
        status: "ADDED",
        observed: false,
        importantFor: "Keeps flexible underwriting context on the case.",
        visibleTo: ["underwriting", "pricing", "management"],
        routeToTeam: "pricing",
      },
    ],
    actions: [
      {
        id: "save-note",
        label: "Save Note",
        actionType: "SAVE_BLOCK",
        variant: "secondary",
      },
    ],
  },
];

export function getBlockItems(block: any): UnderwritingBlockItem[] {
  return block?.config?.items || [];
}

export function getBlockActions(block: any): UnderwritingBlockAction[] {
  return block?.config?.actions || [];
}

export function getObservedItemsFromBlock(block: any): UnderwritingBlockItem[] {
  const items = getBlockItems(block);

  if (Array.isArray(block?.config?.observedItems)) {
    return block.config.observedItems;
  }

  return items.filter((item) => item.observed || item.status === "OBSERVE");
}

export function getMissingItemsFromBlock(block: any): UnderwritingBlockItem[] {
  const items = getBlockItems(block);

  if (Array.isArray(block?.config?.missingItems)) {
    return block.config.missingItems;
  }

  return items.filter((item) => item.status === "MISSING");
}

export function getNotRequiredItemsFromBlock(
  block: any
): UnderwritingBlockItem[] {
  const items = getBlockItems(block);

  if (Array.isArray(block?.config?.notRequiredItems)) {
    return block.config.notRequiredItems;
  }

  return items.filter((item) => item.status === "NOT_REQUIRED");
}

export function getObservedItemCount(caseItem: any) {
  const blocks = caseItem?.teamBlocks || [];

  return blocks.reduce((total: number, block: any) => {
    return total + getObservedItemsFromBlock(block).length;
  }, 0);
}

export function getMissingItemCount(caseItem: any) {
  const blocks = caseItem?.teamBlocks || [];

  return blocks.reduce((total: number, block: any) => {
    return total + getMissingItemsFromBlock(block).length;
  }, 0);
}

export function getUnderwritingActiveBlock(caseDetail: any) {
  const underwritingBlocks = caseDetail?.blocksByTeam?.underwriting || [];

  return (
    underwritingBlocks.find((block: any) => block.status === "IN_PROGRESS") ||
    underwritingBlocks.find((block: any) => block.status === "WAITING") ||
    underwritingBlocks.find((block: any) => block.status === "NOT_STARTED") ||
    underwritingBlocks[0]
  );
}

export function buildAddUnderwritingBlockPayload(
  template: UnderwritingBoxTemplate,
  order: number
) {
  const observedItems = template.items.filter(
    (item) => item.observed || item.status === "OBSERVE"
  );

  const missingItems = template.items.filter((item) => item.status === "MISSING");

  const notRequiredItems = template.items.filter(
    (item) => item.status === "NOT_REQUIRED"
  );

  return {
    teamKey: "underwriting",
    teamName: "Underwriting",
    name: template.name,
    blockType: template.boxType,
    order,
    status: "IN_PROGRESS",
    inputs: template.items.map((item) => item.label),
    output: [`${template.name} added by Underwriting.`],
    responsible: "Underwriter",
    observers: ["Management / Compliance", template.targetTeam],
    slaDays: 1,
    routeToNext: template.defaultRouteToNext,
    pendingReason: observedItems.length
      ? `${observedItems.length} item(s) marked for observation.`
      : "",
    comments: `${template.name} added from Underwriting workspace.`,
    config: {
      boxType: template.boxType,
      sourceTeam: "underwriting",
      targetTeam: template.targetTeam,
      blockReason: template.description,
      managerObservationRequired: observedItems.length > 0,
      observerReason: observedItems.length
        ? `${observedItems.length} item(s) need visibility.`
        : "",
      internalNote: "",
      items: template.items,
      actions: template.actions,
      observedItems,
      missingItems,
      notRequiredItems,
    },
  };
}

export function buildUpdateUnderwritingBlockPayload(
  block: any,
  items: UnderwritingBlockItem[],
  comments?: string
) {
  const observedItems = items.filter(
    (item) => item.observed || item.status === "OBSERVE"
  );

  const missingItems = items.filter((item) => item.status === "MISSING");

  const notRequiredItems = items.filter((item) => item.status === "NOT_REQUIRED");

  return {
    status:
      observedItems.length || missingItems.length ? "WAITING" : "IN_PROGRESS",
    pendingReason: observedItems.length
      ? `${observedItems.length} item(s) marked for observation.`
      : missingItems.length
      ? `${missingItems.length} item(s) missing.`
      : "",
    comments: comments || block?.comments || "",
    config: {
      ...(block?.config || {}),
      items,
      observedItems,
      missingItems,
      notRequiredItems,
      managerObservationRequired: observedItems.length > 0,
      observerReason: observedItems.length
        ? `${observedItems.length} item(s) need visibility.`
        : "",
    },
  };
}

export function buildCompleteBlockPayload(block: any) {
  return {
    status: "COMPLETED",
    pendingReason: "",
    comments: block?.comments || `${block?.name || "Block"} completed.`,
    config: block?.config || {},
  };
}

export function buildUnderwritingAcceptPayload() {
  return {
    status: "COMPLETED",
    comments: "Underwriting package accepted for pricing handoff.",
    pendingReason: "",
    routeToNext: "pricing",
  };
}

export function buildUnderwritingSavePayload(block: any) {
  return {
    status: block?.status || "IN_PROGRESS",
    comments: block?.comments || "Underwriting review saved.",
    config: block?.config || {},
  };
}

export function buildUnderwritingQuestionPayload(
  selectedInput: ReviewedSalesInput
) {
  return {
    teamKey: "underwriting",
    teamName: "Underwriting",
    name: `Underwriting Question - ${selectedInput.sourceItem}`,
    blockType: "UNDERWRITING_QUESTION",
    status: "BLOCKED",
    responsible: "Underwriter",
    observers: ["Management / Compliance", "Sales"],
    pendingReason: `Source package item "${selectedInput.sourceItem}" needs clarification before Underwriting can continue.`,
    routeToNext: "sales",
    comments:
      selectedInput.underwritingComment ||
      "Underwriting did not accept part of the received package and is sending clarification back to the source team.",
    config: {
      boxType: "UNDERWRITING_QUESTION",
      sourceTeam: selectedInput.sourceTeam,
      targetTeam: selectedInput.sourceTeam,
      blockReason: "Underwriting clarification required from source team.",
      managerObservationRequired: true,
      observerReason: "Received package input was questioned by Underwriting.",
      items: [
        {
          id: selectedInput.sourceItem.toLowerCase().replace(/\s+/g, "-"),
          label: selectedInput.sourceItem,
          status: "OBSERVE",
          observed: true,
          comment: selectedInput.underwritingComment || "",
          internalReason: `Source status was ${selectedInput.sourceStatus}.`,
          visibleTo: [
            selectedInput.sourceTeam,
            "underwriting",
            "management",
          ],
          routeToTeam: selectedInput.sourceTeam,
        },
      ],
      actions: [
        {
          id: "save-question",
          label: "Save Question",
          actionType: "SAVE_BLOCK",
          variant: "secondary",
        },
      ],
      observedItems: [
        {
          id: selectedInput.sourceItem.toLowerCase().replace(/\s+/g, "-"),
          label: selectedInput.sourceItem,
          status: "OBSERVE",
          observed: true,
          comment: selectedInput.underwritingComment || "",
          internalReason: `Source status was ${selectedInput.sourceStatus}.`,
          visibleTo: [
            selectedInput.sourceTeam,
            "underwriting",
            "management",
          ],
          routeToTeam: selectedInput.sourceTeam,
        },
      ],
      missingItems: [],
      notRequiredItems: [],
      underwritingDecision: selectedInput.underwritingDecision || "QUESTIONED",
      sourceBox: selectedInput.sourceBox,
      sourceStatus: selectedInput.sourceStatus,
    },
  };
}