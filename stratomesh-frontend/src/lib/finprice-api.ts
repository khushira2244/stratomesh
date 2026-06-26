import type { FinPriceInboxItem } from "../components/insurance/finprice/FinPriceReceivedDesk";
import type { FinPriceWorkspaceBox } from "../components/insurance/finprice/FinPriceWorkingSpace";

export type FinPriceTeamSlug = "pricing" | "finance";

type BackendTeamCase = {
  id: string;
  caseCode?: string;
  title?: string;
  clientCompanyName?: string;
  insuranceType?: string;
  currentTeam?: string;
  currentBlockName?: string;
  currentStatus?: string;
  status?: string;
  targetPremium?: string;
  expectedPremium?: string;
  sumInsured?: string;
  brokerPriority?: string;
  teamBlocks?: any[];
  teamBlockCount?: number;
  blockedCount?: number;
  waitingCount?: number;
  inProgressCount?: number;
  completedCount?: number;
};

type AddBlockPayload = {
  teamKey: FinPriceTeamSlug;
  name: string;
  order: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "WAITING" | "COMPLETED";
  inputs: string[];
  output: string[];
  responsible: string;
  observers: string[];
  slaDays: number;
  pendingReason: string;
  routeToNext: string;
  comments: string;
  config: Record<string, any>;
};

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || `Request failed: ${url}`);
  }

  return data;
}

export async function fetchFinPriceTeamCases(teamSlug: FinPriceTeamSlug) {
  return requestJson<{
    success: boolean;
    teamSlug: string;
    count: number;
    data: BackendTeamCase[];
  }>(`/backend-api/insurance-company/teams/${teamSlug}/cases`);
}

export async function fetchFinPriceCaseDetail(caseId: string) {
  return requestJson<{
    success: boolean;
    data: any;
  }>(`/backend-api/insurance-company/cases/${caseId}`);
}

export async function addFinPriceActionBlock(
  caseId: string,
  payload: AddBlockPayload
) {
  return requestJson<{
    success: boolean;
    message: string;
    data: {
      createdBlock?: any;
      teamBlocks?: any[];
    };
  }>(`/backend-api/insurance-company/cases/${caseId}/blocks/add`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function progressFinPriceCase(caseId: string, blockId?: string) {
  return requestJson<{
    success: boolean;
    message: string;
    data: any;
  }>(`/backend-api/insurance-company/cases/${caseId}/progress`, {
    method: "PATCH",
    body: JSON.stringify(blockId ? { blockId } : {}),
  });
}

export function mapBackendCaseToFinPriceInboxItem(
  item: BackendTeamCase,
  teamSlug: FinPriceTeamSlug
): FinPriceInboxItem {
  const amountLabel =
    item.targetPremium ||
    item.expectedPremium ||
    item.sumInsured ||
    "Not available";

  return {
    id: item.id,
    caseId: item.id,
    caseCode: item.caseCode,
    sourceTeam: getSourceTeam(item, teamSlug),
    clientName: item.clientCompanyName || item.title || "Unknown client",
    requestTitle: item.currentBlockName || item.title || "Team action required",
    requestType: item.insuranceType || "Insurance Case",
    priority: item.brokerPriority || "MEDIUM",
    amountLabel,
    statusLabel: item.currentStatus || item.status || "WAITING",
    currentBlockName: item.currentBlockName,
    currentStatus: item.currentStatus,
    rawCase: item,
  };
}

export function buildFinPriceAddBlockPayload({
  teamSlug,
  box,
  existingBlockCount,
  actionMode,
}: {
  teamSlug: FinPriceTeamSlug;
  box: FinPriceWorkspaceBox;
  existingBlockCount: number;
  actionMode: "draft" | "action";
}): AddBlockPayload {
  const isAction = actionMode === "action";

  return {
    teamKey: teamSlug,
    name: box.name,
    order: existingBlockCount + 1,
    status: isAction ? "COMPLETED" : "IN_PROGRESS",
    inputs: box.attachments.map((attachment) => attachment.label),
    output: [box.decision],
    responsible: teamSlug === "pricing" ? "Pricing Executive" : "Finance Executive",
    observers: [
      teamSlug === "pricing" ? "Pricing Manager" : "Finance Manager",
    ],
    slaDays: 1,
    pendingReason: "",
    routeToNext: box.targetTeam,
    comments: box.comment,
    config: {
      boxType: box.boxType,
      decision: box.decision,
      tags: box.tags,
      attachments: box.attachments,
      targetTeam: box.targetTeam,
      primaryAction: box.primaryAction,
    },
  };
}

function getSourceTeam(item: BackendTeamCase, teamSlug: FinPriceTeamSlug) {
  const blockSourceTeam = item.teamBlocks?.find(
    (block) => block?.config?.sourceTeam
  )?.config?.sourceTeam;

  if (blockSourceTeam) {
    return normalizeTeamLabel(blockSourceTeam);
  }

  if (teamSlug === "pricing") {
    return "Underwriting";
  }

  return "Pricing";
}

function normalizeTeamLabel(team: string) {
  return team
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}