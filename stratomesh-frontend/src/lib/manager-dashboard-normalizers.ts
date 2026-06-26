export type ManagerCaseSource = "backend" | "simulated";

export type ManagerCaseItem = {
  id: string;
  caseCode?: string;
  title?: string;
  clientCompanyName?: string;
  brokerName?: string;
  insuranceType?: string;
  currentTeam?: string;
  currentBlockName?: string;
  currentStatus?: string;
  expectedPremium?: string;
  targetPremium?: string;
  monthEndPriority?: boolean;
  businessImpact?: string;
  source: ManagerCaseSource;
  documentsCount?: number;
  blocksCount?: number;
};

export type TeamStageStatus =
  | "completed"
  | "current"
  | "waiting"
  | "blocked"
  | "notStarted"
  | "observed";

export type ManagerCaseStage = {
  teamKey: string;
  label: string;
  status: TeamStageStatus;
  blockCount: number;
  currentBlockName?: string;
  waitingCount: number;
  blockedCount: number;
  inProgressCount: number;
  completedCount: number;
};

export const MANAGER_TEAM_ORDER = [
  { key: "sales", label: "Sales" },
  { key: "underwriting", label: "Underwriting" },
  { key: "pricing", label: "Pricing" },
  { key: "finance", label: "Finance" },
  { key: "policyIssuance", label: "Policy" },
  { key: "claims", label: "Claims" },
  { key: "management", label: "Manager" },
];

export function normalizeBackendCase(caseItem: any): ManagerCaseItem {
  return {
    id: caseItem.id,
    caseCode: caseItem.caseCode,
    title: caseItem.title,
    clientCompanyName: caseItem.clientCompanyName,
    brokerName: caseItem.brokerName,
    insuranceType: caseItem.insuranceType,
    currentTeam: normalizeTeamKey(caseItem.currentTeam),
    currentBlockName: caseItem.currentBlockName,
    currentStatus: caseItem.currentStatus,
    expectedPremium: caseItem.expectedPremium,
    targetPremium: caseItem.targetPremium,
    monthEndPriority: Boolean(caseItem.monthEndPriority),
    businessImpact: caseItem.businessImpact,
    source: "backend",
    documentsCount: caseItem?._count?.documents,
    blocksCount: caseItem?._count?.caseBlocks,
  };
}

export function normalizeCaseList(response: any): ManagerCaseItem[] {
  let list: any[] = [];

  if (Array.isArray(response?.data)) {
    list = response.data;
  } else if (Array.isArray(response)) {
    list = response;
  }

  return list.map(normalizeBackendCase).filter((item) => Boolean(item.id));
}

export function normalizeTeamKey(team?: string | null) {
  if (!team) return "";

  const value = String(team).trim();

  const map: Record<string, string> = {
    "policy-issuance": "policyIssuance",
    policyissuance: "policyIssuance",
    policy_issuance: "policyIssuance",
    sales: "sales",
    underwriting: "underwriting",
    pricing: "pricing",
    finance: "finance",
    claims: "claims",
    management: "management",
    manager: "management",
  };

  return map[value] || value;
}

export function formatTeamLabel(team?: string) {
  const normalized = normalizeTeamKey(team);

  const item = MANAGER_TEAM_ORDER.find((teamItem) => {
    return teamItem.key === normalized;
  });

  return item?.label || team || "Team pending";
}

export function searchManagerCases(
  cases: ManagerCaseItem[],
  searchText: string,
  filter: string
) {
  const q = searchText.trim().toLowerCase();

  return cases.filter((item) => {
    const status = String(item.currentStatus || "").toUpperCase();
    const source = item.source;
    const currentTeam = normalizeTeamKey(item.currentTeam);

    const matchesFilter =
      filter === "all" ||
      (filter === "backend" && source === "backend") ||
      (filter === "simulated" && source === "simulated") ||
      (filter === "monthEnd" && item.monthEndPriority) ||
      (filter === "blocked" && status === "BLOCKED") ||
      (filter === "waiting" && status === "WAITING") ||
      (filter === "inProgress" && status === "IN_PROGRESS") ||
      (filter === "managerObservation" &&
        ["BLOCKED", "WAITING", "IN_PROGRESS"].includes(status));

    if (!matchesFilter) return false;

    if (!q) return true;

    return [
      item.id,
      item.caseCode,
      item.title,
      item.clientCompanyName,
      item.brokerName,
      item.insuranceType,
      item.currentTeam,
      currentTeam,
      item.currentBlockName,
      item.currentStatus,
      item.expectedPremium,
      item.targetPremium,
      item.businessImpact,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  });
}

export function findPreferredBackendCase(cases: ManagerCaseItem[]) {
  const backendCases = cases.filter((item) => item.source === "backend");

  const sunriseCase = backendCases.find((item) => {
    return [item.title, item.clientCompanyName, item.caseCode]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes("sunrise"));
  });

  return sunriseCase || backendCases[0] || null;
}

export function getManagerSummary(observations: any) {
  return observations?.summary || {};
}

export function getManagerData(observations: any) {
  return observations?.data || {};
}

export function deriveStagesFromCaseItem(
  caseItem: ManagerCaseItem
): ManagerCaseStage[] {
  const currentTeam = normalizeTeamKey(caseItem.currentTeam);
  const currentStatus = String(caseItem.currentStatus || "").toUpperCase();

  let hasReachedCurrent = false;

  return MANAGER_TEAM_ORDER.map((teamItem) => {
    if (teamItem.key === currentTeam) {
      hasReachedCurrent = true;

      return {
        teamKey: teamItem.key,
        label: teamItem.label,
        status:
          currentStatus === "BLOCKED"
            ? "blocked"
            : currentStatus === "WAITING"
              ? "waiting"
              : "current",
        blockCount: 1,
        currentBlockName: caseItem.currentBlockName,
        waitingCount: currentStatus === "WAITING" ? 1 : 0,
        blockedCount: currentStatus === "BLOCKED" ? 1 : 0,
        inProgressCount: currentStatus === "IN_PROGRESS" ? 1 : 0,
        completedCount: 0,
      };
    }

    if (!hasReachedCurrent) {
      return {
        teamKey: teamItem.key,
        label: teamItem.label,
        status: "completed",
        blockCount: 1,
        waitingCount: 0,
        blockedCount: 0,
        inProgressCount: 0,
        completedCount: 1,
      };
    }

    return {
      teamKey: teamItem.key,
      label: teamItem.label,
      status: "notStarted",
      blockCount: 0,
      waitingCount: 0,
      blockedCount: 0,
      inProgressCount: 0,
      completedCount: 0,
    };
  });
}

export function deriveStagesFromCaseDetail(caseDetail: any): ManagerCaseStage[] {
  const blocksByTeam = caseDetail?.blocksByTeam || {};

  return MANAGER_TEAM_ORDER.map((teamItem) => {
    const blocks = Array.isArray(blocksByTeam?.[teamItem.key])
      ? blocksByTeam[teamItem.key]
      : [];

    const waitingCount = blocks.filter(
      (block: any) => block.status === "WAITING"
    ).length;

    const blockedCount = blocks.filter(
      (block: any) => block.status === "BLOCKED"
    ).length;

    const inProgressCount = blocks.filter(
      (block: any) => block.status === "IN_PROGRESS"
    ).length;

    const completedCount = blocks.filter(
      (block: any) => block.status === "COMPLETED"
    ).length;

    const currentBlock =
      blocks.find((block: any) => block.status === "IN_PROGRESS") ||
      blocks.find((block: any) => block.status === "BLOCKED") ||
      blocks.find((block: any) => block.status === "WAITING") ||
      blocks[0];

    let status: TeamStageStatus = "notStarted";

    if (blockedCount > 0) {
      status = "blocked";
    } else if (inProgressCount > 0) {
      status = "current";
    } else if (waitingCount > 0) {
      status = "waiting";
    } else if (blocks.length > 0 && completedCount === blocks.length) {
      status = "completed";
    } else if (blocks.length > 0) {
      status = "waiting";
    }

    return {
      teamKey: teamItem.key,
      label: teamItem.label,
      status,
      blockCount: blocks.length,
      currentBlockName: currentBlock?.name,
      waitingCount,
      blockedCount,
      inProgressCount,
      completedCount,
    };
  });
}

export function flattenCaseTimeline(caseDetail: any) {
  const blocksByTeam = caseDetail?.blocksByTeam || {};

  return MANAGER_TEAM_ORDER.flatMap((teamItem) => {
    const blocks = Array.isArray(blocksByTeam?.[teamItem.key])
      ? blocksByTeam[teamItem.key]
      : [];

    return blocks.map((block: any, index: number) => ({
      id: block.id || `${teamItem.key}-${index}`,
      teamKey: teamItem.key,
      teamLabel: teamItem.label,
      blockName: block.name,
      status: block.status,
      responsible: block.responsible,
      pendingReason: block.pendingReason,
      comments: block.comments,
      routeToNext: block.routeToNext,
      output: block.output,
      config: block.config,
      order: block.order ?? index,
    }));
  });
}