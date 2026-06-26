import { setDemoSession } from "./demo-session";

export type DemoScenarioKey = "happy-new-policy" | "claim-settlement";

const API_BASE_URL = "/backend-api";

export async function startDemoScenario(scenarioKey: DemoScenarioKey) {
  // clean old selected demo before starting new card
  if (typeof window !== "undefined") {
    localStorage.removeItem("demoSession");
    localStorage.removeItem("activeCaseId");
    localStorage.removeItem("caseCode");
    localStorage.removeItem("scenarioKey");
    localStorage.removeItem("scenarioName");
    localStorage.removeItem("agendaId");
    localStorage.removeItem("agendaLabel");
    localStorage.removeItem("activeTeam");
    localStorage.removeItem("activeRole");
  }

  const response = await fetch(
    `${API_BASE_URL}/insurance-company/demo-scenarios/${scenarioKey}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const json = await response.json();

  if (!response.ok || !json?.success || !json?.data?.activeCaseId) {
    throw new Error(json?.message || "Unable to start demo scenario");
  }

  const scenario = json.data;

  setDemoSession({
    scenarioKey: scenario.scenarioKey,
    scenarioName: scenario.scenarioName,
    agendaId: scenario.agendaId,
    agendaLabel: scenario.agendaLabel,
    activeCaseId: scenario.activeCaseId,
    caseCode: scenario.caseCode,
    title: scenario.title,
    clientCompanyName: scenario.clientCompanyName,
    insuranceType: scenario.insuranceType,
    currentTeam: scenario.currentTeam,
    currentBlockName: scenario.currentBlockName,
    currentStatus: scenario.currentStatus,
    role: scenario.startTeam || scenario.currentTeam || "sales",
  });

  return scenario;
}