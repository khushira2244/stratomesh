"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  cloneWorkspaceItems,
  getBlockStatusFromItems,
  getMissingItems,
  getObservedItems,
  getPendingReasonFromItems,
  getSalesWorkspaceTemplates,
  getWorkspaceBoxTemplate,
  type SalesWorkItemType,
  type WorkspaceBoxItem,
  type WorkspaceBoxType,
  type WorkspaceItemStatus,
} from "../../../../lib/workspace-boxes";
import { getDemoSession, setDemoSession } from "../../../../lib/demo-session";

const API_BASE_URL = "/backend-api";
// const DEMO_ACTIVE_CASE_ID = "cmqpe460e000gvkbsukc6rdlg";
const DEMO_ACTIVE_CASE_ID = "";

type TabKey = "desk" | "workspace" | "flow";

type EmailItem = {
  id?: string;
  emailId?: string;
  requestId?: string;
  title?: string;
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  broker?: string;
  brokerName?: string;
  client?: string;
  clientCompany?: string;
  clientCompanyName?: string;
  policyType?: string;
  priority?: string;
  premium?: string;
  expectedPremium?: string;
  targetPremium?: string;
  sumInsured?: string;
  status?: string;
  type?: string;
  tag?: string;
  workItemType?: SalesWorkItemType;
  previewText?: string;
  attachment?:
  | string
  | {
    id?: string;
    fileName?: string;
    mimeType?: string;
    size?: number;
    sourcePath?: string;
  };
  attachments?: string[];
};

type CaseDetail = {
  id?: string;
  caseCode?: string;
  title?: string;
  currentTeam?: string;
  currentBlockName?: string;
  currentStatus?: string;
  brokerName?: string;
  clientCompanyName?: string;
  expectedPremium?: string;
  sumInsured?: string;
  documents?: any[];
  caseBlocks?: any[];
  blocksByTeam?: Record<string, any[]>;
  brokerRequestDocument?: any;
  extractedData?: any;
};

type DraftBox = {
  id: string;
  name: string;
  boxType: WorkspaceBoxType;
  description: string;
  items: WorkspaceBoxItem[];
};

const teams = [
  { value: "sales", label: "Sales" },
  { value: "underwriting", label: "Underwriting" },
  { value: "pricing", label: "Pricing" },
  { value: "finance", label: "Finance" },
  { value: "policyIssuance", label: "Policy Issuance" },
  { value: "claims", label: "Claims" },
  { value: "management", label: "Management" },
];

function getEmailId(email: EmailItem) {
  return email.id || email.emailId || email.requestId || "";
}

function getEmailTitle(email: EmailItem) {
  return email.title || email.subject || "Broker request received";
}

function getShortRequestTitle(email: EmailItem) {
  return getEmailTitle(email).split("—")[0].split("- Sunrise")[0].trim();
}

function getBroker(email: EmailItem) {
  return email.broker || email.brokerName || email.fromName || "Broker";
}

function getClient(email: EmailItem) {
  return (
    email.client ||
    email.clientCompany ||
    email.clientCompanyName ||
    "Client company"
  );
}

function getAttachmentName(email: EmailItem | null) {
  if (!email) return "Broker attachment";

  const attachment = email.attachment;

  if (typeof attachment === "string") return attachment;
  if (attachment?.fileName) return attachment.fileName;

  if (Array.isArray(email.attachments) && email.attachments.length > 0) {
    return email.attachments[0];
  }

  return "Broker attachment";
}

function getAttachmentId(email: EmailItem | null) {
  if (!email) return "att_sunrise_001";

  const attachment = email.attachment;

  if (typeof attachment !== "string" && attachment?.id) return attachment.id;

  return "att_sunrise_001";
}

function getTeamBlocks(caseDetail: CaseDetail | null, team: string) {
  if (!caseDetail?.blocksByTeam) return [];

  if (caseDetail.blocksByTeam[team]) return caseDetail.blocksByTeam[team];

  if (team === "policy-issuance" && caseDetail.blocksByTeam.policyIssuance) {
    return caseDetail.blocksByTeam.policyIssuance;
  }

  if (team === "policyIssuance" && caseDetail.blocksByTeam["policy-issuance"]) {
    return caseDetail.blocksByTeam["policy-issuance"];
  }

  return [];
}

function getStatusClass(status: WorkspaceItemStatus) {
  if (status === "ADDED") return "bg-green-50 text-green-700 border-green-200";
  if (status === "MISSING") return "bg-red-50 text-red-700 border-red-200";
  if (status === "OBSERVE") return "bg-purple-50 text-purple-700 border-purple-200";

  return "bg-slate-50 text-slate-600 border-slate-200";
}

export default function SalesIntakePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nameFromUrl = searchParams.get("name");
  const journeyFromUrl = searchParams.get("journey");
  const teamFromUrl = searchParams.get("team");

  const [name, setName] = useState(nameFromUrl || "Demo User");
  const [journey, setJourney] = useState(journeyFromUrl || "happy-new-policy");
  const [agendaLabel, setAgendaLabel] = useState("New Business / New Policy");
  const [agendaId, setAgendaId] = useState("new-policy-premium-closure");
  const [scenarioName, setScenarioName] = useState("Sunrise Foods Insurance");

  const [activeTab, setActiveTab] = useState<TabKey>("desk");
  const [selectedTeam, setSelectedTeam] = useState(teamFromUrl || "sales");

  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [selectedEmailDetail, setSelectedEmailDetail] = useState<any>(null);

  const [draftRequest, setDraftRequest] = useState<EmailItem | null>(null);
  const [draftBoxes, setDraftBoxes] = useState<DraftBox[]>([]);
  const [selectedWorkItemType, setSelectedWorkItemType] =
    useState<SalesWorkItemType>("BROKER_NEW_POLICY_REQUEST");
  const [receiveSource, setReceiveSource] = useState<"external" | "internal">(
    "external"
  );

  const [caseId, setCaseId] = useState("");
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [externalRequests, setExternalRequests] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [deskLoading, setDeskLoading] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [error, setError] = useState("");
  const [underwritingSent, setUnderwritingSent] = useState(false);

useEffect(() => {
  const session = getDemoSession();

  setName(nameFromUrl || session.userName || "Demo User");
  setJourney(journeyFromUrl || session.scenarioKey || "happy-new-policy");
  setSelectedTeam(teamFromUrl || session.role || "sales");
  setAgendaLabel(session.agendaLabel || "New Business / New Policy");
  setAgendaId(session.agendaId || "new-policy-premium-closure");
  setScenarioName(session.scenarioName || "Sunrise Foods Insurance");

  const activeCaseId = session.activeCaseId || "";

  if (activeCaseId) {
    setCaseId(activeCaseId);
  }
}, [nameFromUrl, journeyFromUrl, teamFromUrl]);

  const teamLabel = useMemo(() => {
    return teams.find((team) => team.value === selectedTeam)?.label || "Sales";
  }, [selectedTeam]);

  const teamBlocks = useMemo(() => {
    return getTeamBlocks(caseDetail, selectedTeam);
  }, [caseDetail, selectedTeam]);

  const salesBoxTemplates = useMemo(() => {
    return getSalesWorkspaceTemplates(selectedWorkItemType, journey);
  }, [selectedWorkItemType, journey]);

  const externalDeskRows: EmailItem[] = [
    {
      brokerName: "Apex Risk Brokers",
      clientCompanyName: "Sunrise Foods Pvt Ltd",
      title: "New Fire & Property Policy Request",
      priority: "HIGH",
      premium: "₹32L - ₹38L",
      tag: "Request",
      workItemType: "BROKER_NEW_POLICY_REQUEST",
    },
    {
      brokerName: "SecureRisk Brokers",
      clientCompanyName: "GreenPack Industries",
      title: "Missing Documents Pending",
      priority: "MEDIUM",
      premium: "₹18L - ₹22L",
      tag: "Request",
      workItemType: "BROKER_DOCUMENT_RESPONSE",
    },
    {
      brokerName: "PrimeShield Brokers",
      clientCompanyName: "Delta Logistics Pvt Ltd",
      title: "Claim Intimation",
      priority: "HIGH",
      premium: "N/A",
      tag: "Request",
      workItemType: "CLAIM_INTIMATION",
    },
    {
      brokerName: "Apex Risk Brokers",
      clientCompanyName: "Sunrise Foods Pvt Ltd",
      title: "Broker Accepted Quotation",
      priority: "HIGH",
      premium: "₹36L",
      tag: "Payment",
      workItemType: "BROKER_QUOTE_ACCEPTANCE",
    },
  ];

  const internalDeskRows: EmailItem[] = [
    {
      brokerName: "Underwriting / Pricing",
      clientCompanyName: "Sunrise Foods Pvt Ltd",
      title: "Approved Quotation Ready",
      priority: "HIGH",
      premium: "₹36L",
      tag: "Quotation",
      workItemType: "INTERNAL_QUOTATION",
    },
  ];

  const activeDeskRows =
    receiveSource === "external" ? externalDeskRows : internalDeskRows;

  const deskRows = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return activeDeskRows;

    return activeDeskRows.filter((item) => {
      return [
        getEmailTitle(item),
        getBroker(item),
        getClient(item),
        item.priority,
        item.status,
        item.type,
        item.tag,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value);
    });
  }, [activeDeskRows, search]);

  useEffect(() => {
    async function loadSalesEmails() {
      try {
        setDeskLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/insurance-company/intake/sales/emails?storyKey=${journey}`,
        );

        if (!response.ok) {
          throw new Error("Unable to load Sales emails");
        }

        const json = await response.json();
        const list = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.emails)
            ? json.emails
            : Array.isArray(json)
              ? json
              : [];

        setEmails(list);

        if (list.length > 0) {
          setSelectedEmail(list[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setDeskLoading(false);
      }
    }

    loadSalesEmails();
  }, [journey]);

  useEffect(() => {
    async function loadExternalRequests() {
      try {
        const url = caseId
          ? `${API_BASE_URL}/insurance-company/external/broker-requests?caseId=${caseId}`
          : `${API_BASE_URL}/insurance-company/external/broker-requests?ownerTeam=sales`;

        const response = await fetch(url);

        if (!response.ok) return;

        const json = await response.json();
        const list = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.requests)
            ? json.requests
            : Array.isArray(json)
              ? json
              : [];

        setExternalRequests(list);
      } catch {
        setExternalRequests([]);
      }
    }

    loadExternalRequests();
  }, [caseId]);

  useEffect(() => {
    async function loadActiveCaseFromSession() {
      if (!caseId || caseDetail) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/insurance-company/cases/${caseId}`
        );

        if (!response.ok) return;

        const json = await response.json();
        setCaseDetail(json?.data || json);
      } catch {
        // keep page usable even if previous case no longer exists
      }
    }

    loadActiveCaseFromSession();
  }, [caseId, caseDetail]);

  const handleRoleChange = (team: string) => {
    setSelectedTeam(team);

    setDemoSession({
      role: team,
      userName: name,
      scenarioKey: journey,
      agendaId,
      agendaLabel,
      scenarioName,
    });

    if (team === "sales") {
      router.push(
        `/platform/insurance-company/intake?journey=${journey}&layer=insurance-company&team=sales&name=${encodeURIComponent(
          name
        )}`
      );
      return;
    }

    router.push(
      `/platform/insurance-company/teams/${team}?journey=${journey}&layer=insurance-company&team=${team}&name=${encodeURIComponent(
        name
      )}`
    );
  };

  const handleOpenEmail = async (email: EmailItem) => {
    const emailId = getEmailId(email);

    setSelectedEmail(email);
    setError("");

    if (!emailId) {
      setSelectedEmailDetail(email);
      setActiveTab("desk");
      return;
    }

    try {
      setDeskLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/insurance-company/intake/sales/emails/${emailId}`,
      );

      if (!response.ok) {
        throw new Error("Unable to open broker email");
      }

      const json = await response.json();
      setSelectedEmailDetail(json?.data || json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open email");
    } finally {
      setDeskLoading(false);
    }
  };

  const handleSendDeskRowToWorkspace = (item: EmailItem) => {
    const workItemType =
      item.workItemType ||
      (journey === "claim-settlement"
        ? "CLAIM_INTIMATION"
        : "BROKER_NEW_POLICY_REQUEST");

    const caseIdForItem =
      workItemType === "INTERNAL_QUOTATION" ||
        workItemType === "BROKER_QUOTE_ACCEPTANCE" ||
        workItemType === "BROKER_DOCUMENT_RESPONSE"
        ? DEMO_ACTIVE_CASE_ID
        : caseId || getDemoSession().activeCaseId || DEMO_ACTIVE_CASE_ID;

    setSelectedWorkItemType(workItemType);
    setDraftRequest(item as any);
    setSelectedEmail(null);
    setDraftBoxes([]);
    setError("");
    setCaseDetail(null);
    setUnderwritingSent(false);

    setCaseId(caseIdForItem);

    setDemoSession({
      activeCaseId: caseIdForItem,
    });

    setActiveTab("workspace");
  };

  const handleAddBlock = async (blockName: string) => {
    const blockConfig = salesBoxTemplates.find(
      (block) => block.name === blockName
    );

    if (!draftRequest && !caseId) {
      setError("Send a broker request to Working Space before adding boxes.");
      return;
    }

    if (!caseId) {
      const template =
        salesBoxTemplates.find((block) => block.name === blockName) ||
        getWorkspaceBoxTemplate(blockName);

      setDraftBoxes((current) => [
        ...current,
        {
          id: `${blockName}-${Date.now()}`,
          name: blockName,
          boxType: template?.boxType || "CUSTOM_BOX",
          description:
            template?.description ||
            blockConfig?.description ||
            "Sales workspace box",
          items: cloneWorkspaceItems(
            template?.items || [
              {
                id: "custom-note",
                label: "Custom note",
                status: "ADDED",
                observed: false,
                importantFor:
                  "Sales can add scenario-specific business context.",
              },
            ],
          ),
        },
      ]);

      setError("");
      return;
    }

    try {
      setWorkspaceLoading(true);
      setError("");

      const template =
        salesBoxTemplates.find((block) => block.name === blockName) ||
        getWorkspaceBoxTemplate(blockName);
      const items = cloneWorkspaceItems(
        template?.items || [
          {
            id: "custom-note",
            label: "Custom note",
            status: "ADDED",
            observed: false,
            importantFor: "Sales can add scenario-specific business context.",
          },
        ],
      );
      const observedItems = getObservedItems(items);
      const missingItems = getMissingItems(items);

      const response = await fetch(
        `${API_BASE_URL}/insurance-company/cases/${caseId}/blocks/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamKey: selectedTeam,
            name: blockName,
            status: getBlockStatusFromItems(items),
            responsible: teamLabel,
            observers:
              observedItems.length > 0 || missingItems.length > 0
                ? ["Management / Compliance"]
                : [],
            inputs: [],
            output: [],
            slaDays: 1,
            pendingReason: getPendingReasonFromItems(items),
            routeToNext:
              selectedWorkItemType === "CLAIM_INTIMATION"
                ? "claims"
                : selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE"
                  ? "finance"
                  : selectedWorkItemType === "BROKER_DOCUMENT_RESPONSE"
                    ? "underwriting"
                    : selectedWorkItemType === "INTERNAL_QUOTATION"
                      ? "sales"
                      : "underwriting",
            comments: `${blockName} added from ${teamLabel} workspace.`,
            config: {
              workItemType: selectedWorkItemType,
              boxType: template?.boxType || "CUSTOM_BOX",

              sourceTeam: selectedTeam,
              sourceTeamLabel: teamLabel,
              fromTeam: selectedTeam,

              targetTeam:
                selectedWorkItemType === "CLAIM_INTIMATION"
                  ? "claims"
                  : selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE"
                    ? "finance"
                    : selectedWorkItemType === "BROKER_DOCUMENT_RESPONSE"
                      ? "underwriting"
                      : selectedWorkItemType === "INTERNAL_QUOTATION"
                        ? "sales"
                        : "underwriting",

              targetTeamLabel:
                selectedWorkItemType === "CLAIM_INTIMATION"
                  ? "Claims"
                  : selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE"
                    ? "Finance"
                    : selectedWorkItemType === "BROKER_DOCUMENT_RESPONSE"
                      ? "Underwriting"
                      : selectedWorkItemType === "INTERNAL_QUOTATION"
                        ? "Sales"
                        : "Underwriting",

              handoffType:
                selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE"
                  ? "SALES_TO_FINANCE_PREMIUM_HANDOFF"
                  : selectedWorkItemType === "INTERNAL_QUOTATION"
                    ? "SALES_TO_BROKER_QUOTE_RELEASE"
                    : selectedWorkItemType === "CLAIM_INTIMATION"
                      ? "SALES_TO_CLAIMS_INTAKE"
                      : selectedWorkItemType === "BROKER_DOCUMENT_RESPONSE"
                        ? "SALES_TO_INTERNAL_DOCUMENT_RESPONSE"
                        : "SALES_WORKSPACE_HANDOFF",

              items,
              observedItems,
              missingItems,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to add workspace box");
      }

      const detailResponse = await fetch(
        `${API_BASE_URL}/insurance-company/cases/${caseId}`,
      );

      if (!detailResponse.ok) {
        throw new Error("Block added, but case detail could not be refreshed.");
      }

      const detailJson = await detailResponse.json();
      setCaseDetail(detailJson?.data || detailJson);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add block");
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const updateDraftBoxItemStatus = (
    boxId: string,
    itemId: string,
    status: WorkspaceItemStatus,
  ) => {
    setDraftBoxes((current) =>
      current.map((box) =>
        box.id !== boxId
          ? box
          : {
            ...box,
            items: box.items.map((item) =>
              item.id === itemId
                ? {
                  ...item,
                  status,
                  observed: status === "OBSERVE",
                }
                : item,
            ),
          },
      ),
    );
  };

  const updateDraftBoxItemComment = (
    boxId: string,
    itemId: string,
    comments: string,
  ) => {
    setDraftBoxes((current) =>
      current.map((box) =>
        box.id !== boxId
          ? box
          : {
            ...box,
            items: box.items.map((item) =>
              item.id === itemId
                ? {
                  ...item,
                  comments,
                }
                : item,
            ),
          },
      ),
    );
  };

  const handleMoveToWorkspace = async () => {
    const workItem = draftRequest || selectedEmail;
    const emailId = workItem ? getEmailId(workItem) : "";
    const session = getDemoSession();

    const needsNewCase =
      selectedWorkItemType === "BROKER_NEW_POLICY_REQUEST" ||
      selectedWorkItemType === "CLAIM_INTIMATION";

    const isExistingCaseWork =
      selectedWorkItemType === "INTERNAL_QUOTATION" ||
      selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE" ||
      selectedWorkItemType === "BROKER_DOCUMENT_RESPONSE";

    if (!workItem) {
      setError("Send an item to Working Space first.");
      return;
    }

    if (draftBoxes.length === 0) {
      setError("Add at least one box before finalizing this Sales workspace item.");
      return;
    }

    try {
      setWorkspaceLoading(true);
      setError("");

      let targetCaseId = caseId || session.activeCaseId || DEMO_ACTIVE_CASE_ID;

      /**
       * Only first broker intake style items create a new case from email.
       * Internal quotation / broker acceptance / broker document response
       * must work on an existing active case.
       */
      if (needsNewCase && emailId && !targetCaseId) {
        const createResponse = await fetch(
          `${API_BASE_URL}/insurance-company/intake/sales/emails/${emailId}/create-case`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              attachmentId: getAttachmentId(workItem),
              agendaId,
              sessionId: "demo-session-sales",
            }),
          }
        );

        const createText = await createResponse.text();

        let createJson: any = null;

        try {
          createJson = createText ? JSON.parse(createText) : null;
        } catch {
          throw new Error(createText || "Create case returned invalid JSON.");
        }

        if (!createResponse.ok) {
          throw new Error(
            createJson?.message ||
            createJson?.error ||
            `Create case failed with status ${createResponse.status}`
          );
        }

        console.log("CREATE CASE RESPONSE:", createJson);

        targetCaseId =
          createJson?.data?.createdCase?.id ||
          createJson?.data?.case?.id ||
          createJson?.data?.id ||
          createJson?.createdCase?.id ||
          createJson?.case?.id ||
          createJson?.id ||
          "";

        if (!targetCaseId) {
          throw new Error("Case created, but case id was not returned.");
        }

        setCaseId(targetCaseId);

        setDemoSession({
          activeCaseId: targetCaseId,
        });
      }

      if (needsNewCase && !targetCaseId) {
        throw new Error(
          "No case id found. For a new broker request, send a real broker email item to Working Space first."
        );
      }

      if (isExistingCaseWork && !targetCaseId) {
        throw new Error(
          "No active case found for this item. Create/open the case first, then continue this Sales step."
        );
      }

      const routeToNext =
        selectedWorkItemType === "CLAIM_INTIMATION"
          ? "claims"
          : selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE"
            ? "finance"
            : selectedWorkItemType === "BROKER_DOCUMENT_RESPONSE"
              ? "underwriting"
              : selectedWorkItemType === "INTERNAL_QUOTATION"
                ? "sales"
                : "underwriting";

      for (const box of draftBoxes) {
        const normalizedItems = box.items.map((item) => ({
          ...item,
          comments: item.comments?.trim() || "No comments",
        }));

        const observedItems = getObservedItems(normalizedItems);
        const missingItems = getMissingItems(normalizedItems);
        const blockStatus = getBlockStatusFromItems(normalizedItems);
        const pendingReason = getPendingReasonFromItems(normalizedItems);

        const addBlockResponse = await fetch(
          `${API_BASE_URL}/insurance-company/cases/${targetCaseId}/blocks/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teamKey: selectedTeam,
              name: box.name,
              status: blockStatus,
              responsible: teamLabel,
              observers:
                observedItems.length > 0 || missingItems.length > 0
                  ? ["Management / Compliance"]
                  : [],
              inputs: [],
              output: [],
              slaDays: 1,
              pendingReason,
              routeToNext,
              comments: `${box.name} added from ${teamLabel} workspace.`,
              config: {
                workItemType: selectedWorkItemType,
                boxType: box.boxType,

                sourceTeam: selectedTeam,
                sourceTeamLabel: teamLabel,
                fromTeam: selectedTeam,

                targetTeam: routeToNext,
                targetTeamLabel:
                  routeToNext === "finance"
                    ? "Finance"
                    : routeToNext === "claims"
                      ? "Claims"
                      : routeToNext === "underwriting"
                        ? "Underwriting"
                        : "Sales",

                handoffType:
                  selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE"
                    ? "SALES_TO_FINANCE_PREMIUM_HANDOFF"
                    : selectedWorkItemType === "INTERNAL_QUOTATION"
                      ? "SALES_TO_BROKER_QUOTE_RELEASE"
                      : selectedWorkItemType === "CLAIM_INTIMATION"
                        ? "SALES_TO_CLAIMS_INTAKE"
                        : selectedWorkItemType === "BROKER_DOCUMENT_RESPONSE"
                          ? "SALES_TO_INTERNAL_DOCUMENT_RESPONSE"
                          : "SALES_WORKSPACE_HANDOFF",

                items: normalizedItems,
                observedItems,
                missingItems,
              },
            }),
          }
        );

        const addBlockText = await addBlockResponse.text();

        let addBlockJson: any = null;

        try {
          addBlockJson = addBlockText ? JSON.parse(addBlockText) : null;
        } catch {
          throw new Error(addBlockText || "Add block returned invalid JSON.");
        }

        if (!addBlockResponse.ok) {
          throw new Error(
            addBlockJson?.message ||
            addBlockJson?.error ||
            `Unable to add ${box.name}`
          );
        }
      }

      /**
       * Only broker acceptance should move to Finance immediately.
       * INTERNAL_QUOTATION only means quote sent to broker.
       * After broker accepts, user selects BROKER_QUOTE_ACCEPTANCE and then progresses to Finance.
       */
      if (selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE") {
        const financeHandoffResponse = await fetch(
          `${API_BASE_URL}/insurance-company/cases/${targetCaseId}/blocks/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teamKey: "finance",
              name: "Premium Handoff from Sales",
              status: "IN_PROGRESS",
              responsible: "Finance Executive",
              observers: ["Sales", "Management / Compliance"],
              inputs: [
                "Broker accepted quotation",
                "Premium amount",
                "Broker acceptance confirmation",
                "Payment proof / UTR if available",
              ],
              output: ["Finance premium clearance"],
              slaDays: 1,
              pendingReason: "Finance needs to verify premium/payment clearance.",
              routeToNext: "policy-issuance",
              comments:
                "Sales confirmed broker quotation acceptance and handed premium/payment context to Finance.",
              config: {
                workItemType: "BROKER_QUOTE_ACCEPTANCE",

                sourceTeam: "sales",
                sourceTeamLabel: "Sales",
                fromTeam: "sales",

                targetTeam: "finance",
                targetTeamLabel: "Finance",

                handoffType: "SALES_TO_FINANCE_PREMIUM_HANDOFF",

                clientCompanyName:
                  (workItem as any)?.clientName ||
                  (workItem as any)?.clientCompanyName ||
                  "Sunrise Foods Pvt Ltd",

                brokerName:
                  (workItem as any)?.brokerName || "Apex Risk Brokers",

                premium:
                  (workItem as any)?.premium || "₹36L",

                paymentStatus: "IN_PROGRESS",
                financeQueueTitle: "Premium Handoff from Sales",
              },
            }),
          }
        );

        const financeHandoffText = await financeHandoffResponse.text();

        let financeHandoffJson: any = null;

        try {
          financeHandoffJson = financeHandoffText
            ? JSON.parse(financeHandoffText)
            : null;
        } catch {
          throw new Error(
            financeHandoffText || "Finance handoff returned invalid JSON."
          );
        }

        if (!financeHandoffResponse.ok) {
          throw new Error(
            financeHandoffJson?.message ||
            financeHandoffJson?.error ||
            "Unable to create Finance handoff block."
          );
        }

        await fetch(
          `${API_BASE_URL}/insurance-company/cases/${targetCaseId}/progress`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        );
      }

      const detailResponse = await fetch(
        `${API_BASE_URL}/insurance-company/cases/${targetCaseId}`
      );

      const detailJson = await detailResponse.json();

      if (!detailResponse.ok) {
        throw new Error(
          detailJson?.message || "Case updated, but detail could not be loaded."
        );
      }

      setCaseId(targetCaseId);
      setCaseDetail(detailJson?.data || detailJson);
      setDraftBoxes([]);
      setDraftRequest(null);
      setSelectedEmail(null);
      setActiveTab("workspace");
      setError("");
    } catch (err) {
      console.error("FINALIZE SALES WORKSPACE ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Unable to finalize Sales workspace"
      );
    } finally {
      setWorkspaceLoading(false);
    }
  };

const handleProgressCase = async () => {
  if (!caseId) {
    setError("Create a case first.");
    return;
  }

  if (underwritingSent) {
    return;
  }

  try {
    setWorkspaceLoading(true);
    setError("");

    if (selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE") {
      const financeHandoffResponse = await fetch(
        `${API_BASE_URL}/insurance-company/cases/${caseId}/blocks/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamKey: "finance",
            name: "Premium Handoff from Sales",
            status: "IN_PROGRESS",
            responsible: "Finance Executive",
            observers: ["Sales", "Management / Compliance"],
            inputs: [
              "Broker accepted quotation",
              "Premium amount",
              "Broker acceptance confirmation",
              "Payment proof / UTR if available",
            ],
            output: ["Finance premium clearance"],
            slaDays: 1,
            pendingReason: "Finance needs to verify premium/payment clearance.",
            routeToNext: "policy-issuance",
            comments:
              "Sales confirmed broker quotation acceptance and handed premium/payment context to Finance.",
            config: {
              workItemType: "BROKER_QUOTE_ACCEPTANCE",

              sourceTeam: "sales",
              sourceTeamLabel: "Sales",
              fromTeam: "sales",

              targetTeam: "finance",
              targetTeamLabel: "Finance",

              handoffType: "SALES_TO_FINANCE_PREMIUM_HANDOFF",

              clientCompanyName:
                draftRequest?.clientCompanyName ||
                draftRequest?.client ||
                caseDetail?.clientCompanyName ||
                "Sunrise Foods Pvt Ltd",

              brokerName:
                draftRequest?.brokerName ||
                caseDetail?.brokerName ||
                "Apex Risk Brokers",

              premium:
                draftRequest?.premium ||
                caseDetail?.expectedPremium ||
                "₹36L",

              paymentStatus: "IN_PROGRESS",
              financeQueueTitle: "Premium Handoff from Sales",
            },
          }),
        }
      );

      const financeHandoffText = await financeHandoffResponse.text();

      let financeHandoffJson: any = null;

      try {
        financeHandoffJson = financeHandoffText
          ? JSON.parse(financeHandoffText)
          : null;
      } catch {
        throw new Error(
          financeHandoffText || "Finance handoff returned invalid JSON."
        );
      }

      if (!financeHandoffResponse.ok) {
        throw new Error(
          financeHandoffJson?.message ||
            financeHandoffJson?.error ||
            "Unable to create Finance handoff block."
        );
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/insurance-company/cases/${caseId}/progress`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      throw new Error("Unable to progress case");
    }

    const detailResponse = await fetch(
      `${API_BASE_URL}/insurance-company/cases/${caseId}`
    );

    if (!detailResponse.ok) {
      throw new Error("Case progressed, but case detail could not be refreshed.");
    }

    const detailJson = await detailResponse.json();
    setCaseDetail(detailJson?.data || detailJson);

    setUnderwritingSent(true);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unable to progress case");
  } finally {
    setWorkspaceLoading(false);
  }
};

  const getFinalActionText = () => {
    if (workspaceLoading) return "Finalizing...";

    if (selectedWorkItemType === "CLAIM_INTIMATION") {
      return "Finalize Claim Intake & Send to Claims";
    }

    if (selectedWorkItemType === "INTERNAL_QUOTATION") {
      return "Send Quote to Broker";
    }

    if (selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE") {
      return "Send Premium Handoff to Finance";
    }

    if (selectedWorkItemType === "BROKER_DOCUMENT_RESPONSE") {
      return "Attach to Case & Forward Internally";
    }

    return "Finalize Sales Package & Send to Underwriting";
  };

  return (
    <main className="min-h-screen bg-[#F6F7F4] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">
                StratoMesh Workspace
              </div>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                {teamLabel} Workforce Dashboard
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-bold text-slate-900">Agenda:</span>
                <span>{agendaLabel}</span>
                <span className="text-slate-300">•</span>
                <span>{scenarioName}</span>
                <span className="text-slate-300">•</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-black text-slate-950">{name}</div>
                <div className="text-xs font-semibold text-slate-500">
                  Demo user
                </div>
              </div>

              <select
                value={selectedTeam}
                onChange={(event) => handleRoleChange(event.target.value)}
                className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                {teams.map((team) => (
                  <option key={team.value} value={team.value}>
                    {team.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { id: "desk", label: "Send / Receive Desk" },
              { id: "workspace", label: "Working Space" },
              { id: "flow", label: "Communication Flow" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === tab.id
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-6">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {activeTab === "desk" && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Send / Receive Desk
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Broker and internal requests appear here. Send one item to
                    Working Space to start crafting.
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search broker, client, RFQ, document..."
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {(["external", "internal"] as const).map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setReceiveSource(source)}
                    className={`rounded-xl px-4 py-2 text-sm font-black ${receiveSource === source
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700"
                      }`}
                  >
                    {source === "external" ? "External" : "Internal"}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "All",
                  "Matched Agenda",
                  "Missing Documents",
                  "Quote Follow-up",
                  "Payment",
                ].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {deskLoading && (
                <div className="px-5 py-5 text-sm font-semibold text-slate-500">
                  Loading desk items...
                </div>
              )}

              {!deskLoading &&
                deskRows.map((email, index) => {
                  const isSelected =
                    selectedEmail && getEmailId(selectedEmail) === getEmailId(email);

                  return (
                    <article
                      key={getEmailId(email) || `${getEmailTitle(email)}-${index}`}
                      className={`px-5 py-4 transition ${isSelected ? "bg-sky-50/70" : "bg-white hover:bg-slate-50"
                        }`}
                    >
                      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1.2fr_1fr_0.8fr_0.7fr_0.8fr_auto]">
                        <div>
                          <div className="text-sm font-black text-slate-950">
                            {getBroker(email)}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-500">
                            Broker
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-black text-slate-950">
                            {getClient(email)}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-500">
                            Client
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {getShortRequestTitle(email)}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-500">
                            Request
                          </div>
                        </div>

                        <div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            {email.priority || "HIGH"}
                          </span>
                        </div>

                        <div>
                          <div className="text-sm font-black text-slate-950">
                            {email.premium || email.expectedPremium || "₹18L"}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-500">
                            Premium
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEmail(email)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            Open
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendDeskRowToWorkspace(email)}
                            disabled={workspaceLoading}
                            className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            Send →
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}

              {!deskLoading && deskRows.length === 0 && (
                <div className="px-5 py-5 text-sm font-semibold text-slate-500">
                  No desk items found.
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "workspace" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Working Space
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This space is crafted one item at a time. Add boxes, observe
                    exceptions, and send the case to the next team.
                  </p>
                </div>

                {caseId && (
                  <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    Case created
                  </div>
                )}
              </div>

              {!caseId && (
                <div className="mt-6 space-y-5">
                  {!draftRequest ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                      <div className="text-lg font-black text-slate-950">
                        No request in workspace yet.
                      </div>

                      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                        Send a broker request from Send / Receive Desk to begin
                        crafting the underwriting package.
                      </p>
                    </div>
                  ) : (
                    <>
                      <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
                        <div className="text-xs font-black uppercase tracking-wide text-sky-700">
                          Draft Broker Request
                        </div>

                        <div className="mt-2 text-lg font-black text-slate-950">
                          {getShortRequestTitle(draftRequest)}
                        </div>

                        <div className="mt-2 text-sm leading-6 text-slate-600">
                          Broker: {" "}
                          <span className="font-bold text-slate-900">
                            {getBroker(draftRequest)}
                          </span>
                          <br />
                          Client: {" "}
                          <span className="font-bold text-slate-900">
                            {getClient(draftRequest)}
                          </span>
                          <br />
                          Attachment: {" "}
                          <span className="font-bold text-slate-900">
                            {getAttachmentName(draftRequest)}
                          </span>
                        </div>
                      </article>

                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-black text-slate-950">
                              Sales Crafting Canvas
                            </div>

                            <p className="mt-1 text-sm text-slate-600">
                              Add boxes required for Underwriting. Set each item
                              as Added, Missing, Observe, or Not Required.
                            </p>
                          </div>

                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            Draft mode
                          </span>
                        </div>

                        <div className="mt-5 space-y-3">
                          {draftBoxes.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                              No boxes added yet. Add Quote Box, Premium Box,
                              Document Box, or Custom Box from the right panel.
                            </div>
                          ) : (
                            draftBoxes.map((box) => {
                              const observedItems = getObservedItems(box.items);
                              const missingItems = getMissingItems(box.items);

                              return (
                                <article
                                  key={box.id}
                                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <div className="text-sm font-black text-slate-950">
                                        {box.name}
                                      </div>

                                      <div className="mt-1 text-sm leading-6 text-slate-600">
                                        {box.description}
                                      </div>
                                    </div>

                                    {(observedItems.length > 0 ||
                                      missingItems.length > 0) && (
                                        <div className="flex flex-wrap justify-end gap-2">
                                          {observedItems.length > 0 && (
                                            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-black text-purple-700">
                                              {observedItems.length} Observe
                                            </span>
                                          )}
                                          {missingItems.length > 0 && (
                                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                                              {missingItems.length} Missing
                                            </span>
                                          )}
                                        </div>
                                      )}
                                  </div>

                                  <div className="mt-4 space-y-3">
                                    {box.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="rounded-xl border border-slate-200 bg-white p-3"
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div>
                                            <div className="text-sm font-black text-slate-900">
                                              {item.label}
                                            </div>
                                            <div className="mt-1 text-xs leading-5 text-slate-500">
                                              {item.importantFor}
                                            </div>
                                          </div>

                                          <span
                                            className={`rounded-full border px-2 py-1 text-[11px] font-black ${getStatusClass(
                                              item.status,
                                            )}`}
                                          >
                                            {item.status.replace("_", " ")}
                                          </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                          {(
                                            [
                                              "ADDED",
                                              "MISSING",
                                              "OBSERVE",
                                              "NOT_REQUIRED",
                                            ] as const
                                          ).map((status) => (
                                            <button
                                              key={status}
                                              type="button"
                                              onClick={() =>
                                                updateDraftBoxItemStatus(
                                                  box.id,
                                                  item.id,
                                                  status,
                                                )
                                              }
                                              className={`rounded-lg px-3 py-1.5 text-[11px] font-black ${item.status === status
                                                ? "bg-slate-950 text-white"
                                                : "border border-slate-200 bg-slate-50 text-slate-600"
                                                }`}
                                            >
                                              {status.replace("_", " ")}
                                            </button>
                                          ))}
                                        </div>

                                        <div className="mt-3">
                                          <label className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                                            Sales comment
                                          </label>

                                          <textarea
                                            value={item.comments || ""}
                                            onChange={(event) =>
                                              updateDraftBoxItemComment(
                                                box.id,
                                                item.id,
                                                event.target.value,
                                              )
                                            }
                                            placeholder="Add comment for Underwriting / Manager..."
                                            rows={2}
                                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                          />

                                          <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500">
                                            Comment saved as:{" "}
                                            <span className="text-slate-800">
                                              {item.comments?.trim()
                                                ? item.comments
                                                : "No comments"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </article>
                              );
                            })
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleMoveToWorkspace}
                          disabled={workspaceLoading || draftBoxes.length === 0}
                          className="mt-5 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-sky-100 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {getFinalActionText()}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {caseId && (
                <>
                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Active Case
                    </div>
                    <div className="mt-2 text-lg font-black text-slate-950">
                      {caseDetail?.title ||
                        getEmailTitle(selectedEmail || {}) ||
                        "Insurance case"}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      Current team: {" "}
                      <span className="font-bold text-slate-950">
                        {caseDetail?.currentTeam || teamLabel}
                      </span>{" "}
                      · Current status: {" "}
                      <span className="font-bold text-amber-700">
                        {caseDetail?.currentStatus || "In Progress"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {teamBlocks.length > 0 ? (
                      teamBlocks.map((block: any, index: number) => {
                        const configItems: WorkspaceBoxItem[] =
                          block?.config?.items || [];
                        const observedItems = block?.config?.observedItems || [];
                        const missingItems = block?.config?.missingItems || [];

                        return (
                          <article
                            key={block.id || `${block.name}-${index}`}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <div className="text-sm font-black text-slate-950">
                                  {block.name || `Workspace Box ${index + 1}`}
                                </div>
                                <div className="mt-1 text-sm text-slate-600">
                                  {block.comments ||
                                    block.pendingReason ||
                                    "Team workspace block"}
                                </div>
                              </div>

                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                {block.status || "NOT_STARTED"}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {block.observers?.length > 0 && (
                                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                                  Observed
                                </span>
                              )}
                              {observedItems.length > 0 && (
                                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                                  {observedItems.length} observed item
                                </span>
                              )}
                              {missingItems.length > 0 && (
                                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                                  {missingItems.length} missing item
                                </span>
                              )}
                              {block.isDisabled && (
                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                  Disabled
                                </span>
                              )}
                            </div>

                            {configItems.length > 0 && (
                              <div className="mt-4 space-y-2">
                                {configItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="text-xs font-bold text-slate-800">
                                        {item.label}
                                      </div>
                                      <span
                                        className={`rounded-full border px-2 py-1 text-[10px] font-black ${getStatusClass(
                                          item.status,
                                        )}`}
                                      >
                                        {item.status.replace("_", " ")}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </article>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                        No {teamLabel} blocks yet. Add a workspace box from the
                        right panel.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleProgressCase}
                      disabled={workspaceLoading || underwritingSent}
                      className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-sky-100 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {selectedWorkItemType === "BROKER_QUOTE_ACCEPTANCE"
                        ? "Send to Finance"
                        : selectedWorkItemType === "INTERNAL_QUOTATION"
                          ? "Quote Sent to Broker"
                          : selectedWorkItemType === "CLAIM_INTIMATION"
                            ? "Send to Claims"
                            : selectedTeam === "sales"
                              ? "Send to Underwriting"
                              : "Move Forward"}
                    </button>

                    <button
                      type="button"
                      className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Add Comment
                    </button>
                  </div>
                </>
              )}
            </section>

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-950">
                Add to Workspace
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add one box at a time. This keeps the case flexible and
                team-crafted.
              </p>

              <div className="mt-5 space-y-3">
                {salesBoxTemplates.map((block) => (
                  <button
                    key={block.name}
                    type="button"
                    onClick={() => handleAddBlock(block.name)}
                    disabled={(!draftRequest && !caseId) || workspaceLoading}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="text-sm font-black text-slate-950">
                      + {block.name}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      {block.description}
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        )}

        {activeTab === "flow" && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Communication Flow
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Every open case carries a live communication stage from broker
                  request to manager/business closure.
                </p>
              </div>

              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                {caseId ? "Live case flow" : "Waiting for case"}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-5">
              {[
                {
                  title: "Broker",
                  detail: "Request, documents, acceptance",
                  active: true,
                },
                {
                  title: "Sales Desk",
                  detail: "Broker-safe review and internal bridge",
                  active: Boolean(caseId || draftRequest),
                },
                {
                  title: "Underwriting",
                  detail: "Risk, coverage, terms",
                  active:
                    caseDetail?.currentTeam === "underwriting" ||
                    selectedTeam === "underwriting",
                },
                {
                  title: "Pricing",
                  detail: "Quote and premium calculation",
                  active:
                    caseDetail?.currentTeam === "pricing" ||
                    selectedTeam === "pricing",
                },
                {
                  title: "Finance / Policy",
                  detail: "Premium clearance and policy release",
                  active:
                    caseDetail?.currentTeam === "finance" ||
                    caseDetail?.currentTeam === "policyIssuance" ||
                    selectedTeam === "finance" ||
                    selectedTeam === "policyIssuance",
                },
              ].map((step, index) => (
                <div key={step.title} className="flex items-center gap-4">
                  <div
                    className={`min-h-32 flex-1 rounded-2xl border p-4 text-center ${step.active
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-slate-50"
                      }`}
                  >
                    <div className="text-sm font-black text-slate-950">
                      {step.title}
                    </div>
                    <div className="mt-2 text-xs leading-5 text-slate-500">
                      {step.detail}
                    </div>
                  </div>

                  {index < 4 && (
                    <div className="hidden text-2xl font-black text-sky-600 md:block">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Broker-facing communication stays controlled through Sales.
              Internal underwriting, pricing, waiver, disabled-item, and manager
              observation details stay inside the insurance company layer.
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-black text-slate-950">
                External Broker Requests
              </div>

              <div className="mt-3 space-y-2">
                {externalRequests.length > 0 ? (
                  externalRequests.map((request: any, index) => (
                    <div
                      key={request.id || index}
                      className="rounded-xl bg-slate-50 px-4 py-3 text-sm"
                    >
                      <div className="font-bold text-slate-900">
                        {request.title || request.subject || "Broker-side request"}
                      </div>
                      <div className="mt-1 text-slate-600">
                        Status: {request.status || "Pending"} · Owner: {" "}
                        {request.ownerTeam || "Sales"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                    No broker-side external request loaded yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
