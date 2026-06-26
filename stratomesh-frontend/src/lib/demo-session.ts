export type DemoSession = {
  userName?: string;
  role?: string;

  scenarioKey?: string;
  scenarioName?: string;

  agendaId?: string;
  agendaLabel?: string;

  activeCaseId?: string;

  caseCode?: string;
  title?: string;
  clientCompanyName?: string;
  insuranceType?: string;

  currentTeam?: string;
  currentBlockName?: string;
  currentStatus?: string;

  startTeam?: string;
};

export const DEMO_SESSION_KEY = "stratomesh-demo-session";

export const defaultDemoSession: DemoSession = {
  userName: "Demo User",
  role: "sales",
  scenarioKey: "happy-new-policy",
  scenarioName: "Sunrise Foods Insurance",
  agendaId: "new-policy-premium-closure",
  agendaLabel: "New Business / New Policy",
  activeCaseId: "",
};

export function getDemoSession(): DemoSession {
  if (typeof window === "undefined") {
    return defaultDemoSession;
  }

  const stored = window.localStorage.getItem(DEMO_SESSION_KEY);

  if (!stored) {
    const activeCaseId = window.localStorage.getItem("activeCaseId") || "";

    return {
      ...defaultDemoSession,
      activeCaseId,
      scenarioKey:
        window.localStorage.getItem("scenarioKey") ||
        defaultDemoSession.scenarioKey,
      scenarioName:
        window.localStorage.getItem("scenarioName") ||
        defaultDemoSession.scenarioName,
      agendaId:
        window.localStorage.getItem("agendaId") || defaultDemoSession.agendaId,
      agendaLabel:
        window.localStorage.getItem("agendaLabel") ||
        defaultDemoSession.agendaLabel,
      role: window.localStorage.getItem("activeRole") || defaultDemoSession.role,
      userName:
        window.localStorage.getItem("demoUserName") ||
        defaultDemoSession.userName,
      caseCode: window.localStorage.getItem("caseCode") || "",
      title: window.localStorage.getItem("caseTitle") || "",
      clientCompanyName: window.localStorage.getItem("clientCompanyName") || "",
      insuranceType: window.localStorage.getItem("insuranceType") || "",
      currentTeam: window.localStorage.getItem("currentTeam") || "",
      currentBlockName: window.localStorage.getItem("currentBlockName") || "",
      currentStatus: window.localStorage.getItem("currentStatus") || "",
    };
  }

  try {
    return {
      ...defaultDemoSession,
      ...JSON.parse(stored),
    };
  } catch {
    return defaultDemoSession;
  }
}

export function setDemoSession(session: Partial<DemoSession>) {
  if (typeof window === "undefined") return;

  const current = getDemoSession();

  const nextSession: DemoSession = {
    ...current,
    ...session,
  };

  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(nextSession));

  if (nextSession.activeCaseId !== undefined) {
    window.localStorage.setItem("activeCaseId", nextSession.activeCaseId || "");
  }

  if (nextSession.scenarioKey) {
    window.localStorage.setItem("scenarioKey", nextSession.scenarioKey);
  }

  if (nextSession.scenarioName) {
    window.localStorage.setItem("scenarioName", nextSession.scenarioName);
  }

  if (nextSession.agendaId) {
    window.localStorage.setItem("agendaId", nextSession.agendaId);
  }

  if (nextSession.agendaLabel) {
    window.localStorage.setItem("agendaLabel", nextSession.agendaLabel);
  }

  if (nextSession.role) {
    window.localStorage.setItem("activeRole", nextSession.role);
  }

  if (nextSession.userName) {
    window.localStorage.setItem("demoUserName", nextSession.userName);
  }

  if (nextSession.caseCode) {
    window.localStorage.setItem("caseCode", nextSession.caseCode);
  }

  if (nextSession.title) {
    window.localStorage.setItem("caseTitle", nextSession.title);
  }

  if (nextSession.clientCompanyName) {
    window.localStorage.setItem(
      "clientCompanyName",
      nextSession.clientCompanyName
    );
  }

  if (nextSession.insuranceType) {
    window.localStorage.setItem("insuranceType", nextSession.insuranceType);
  }

  if (nextSession.currentTeam) {
    window.localStorage.setItem("currentTeam", nextSession.currentTeam);
  }

  if (nextSession.currentBlockName) {
    window.localStorage.setItem(
      "currentBlockName",
      nextSession.currentBlockName
    );
  }

  if (nextSession.currentStatus) {
    window.localStorage.setItem("currentStatus", nextSession.currentStatus);
  }
}

export function getActiveCaseId() {
  if (typeof window === "undefined") return "";

  const session = getDemoSession();

  return (
    session.activeCaseId ||
    window.localStorage.getItem("activeCaseId") ||
    window.localStorage.getItem("managerActiveCaseId") ||
    ""
  );
}

export function clearDemoSession() {
  if (typeof window === "undefined") return;

  [
    DEMO_SESSION_KEY,
    "activeCaseId",
    "managerActiveCaseId",
    "scenarioKey",
    "scenarioName",
    "agendaId",
    "agendaLabel",
    "activeTeam",
    "activeRole",
    "demoUserName",
    "caseCode",
    "caseTitle",
    "clientCompanyName",
    "insuranceType",
    "currentTeam",
    "currentBlockName",
    "currentStatus",
  ].forEach((key) => window.localStorage.removeItem(key));
}