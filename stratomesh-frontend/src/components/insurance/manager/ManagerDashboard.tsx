"use client";

import { useEffect, useMemo, useState } from "react";
import ManagerCharts from "./ManagerCharts";
import ManagerCaseBranch from "./ManagerCaseBranch";
import ManagerCaseSearch from "./ManagerCaseSearch";
import {
  getCaseDetail,
  getExternalBrokerIssuesByCase,
  getExternalBrokerIssuesForManager,
  getInsuranceCases,
  getManagerObservations,
} from "../../../lib/manager-dashboard-api";
import { getActiveCaseId } from "../../../lib/demo-session";
import {
  simulatedExternalIssues,
  simulatedManagerCases,
} from "../../../lib/manager-dashboard-static";
import {
  findPreferredBackendCase,
  getManagerSummary,
  ManagerCaseItem,
  normalizeCaseList,
} from "../../../lib/manager-dashboard-normalizers";

// const ACTIVE_DEMO_CASE_ID = "cmqpe460e000gvkbsukc6rdlg";
const ACTIVE_DEMO_CASE_ID = "";

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [caseLoading, setCaseLoading] = useState(false);
  const [error, setError] = useState("");

  const [observations, setObservations] = useState<any>(null);
  const [backendCases, setBackendCases] = useState<ManagerCaseItem[]>([]);
  const [selectedCase, setSelectedCase] = useState<ManagerCaseItem | null>(
    null
  );
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<any>(null);

  const [managerExternalIssues, setManagerExternalIssues] = useState<any[]>([]);
  const [selectedCaseExternalIssues, setSelectedCaseExternalIssues] = useState<
    any[]
  >([]);

  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [observationsResponse, casesResponse, externalIssuesResponse] =
        await Promise.all([
          getManagerObservations(),
          getInsuranceCases(),
          getExternalBrokerIssuesForManager(),
        ]);

      const normalizedBackendCases = normalizeCaseList(casesResponse);

      const backendExternalIssues = Array.isArray(externalIssuesResponse?.data)
        ? externalIssuesResponse.data
        : Array.isArray(externalIssuesResponse)
          ? externalIssuesResponse
          : [];

      setObservations(observationsResponse);
      setBackendCases(normalizedBackendCases);
      setManagerExternalIssues(
        backendExternalIssues.length > 0
          ? backendExternalIssues
          : simulatedExternalIssues
      );

      await loadInitialCase(normalizedBackendCases);
    } catch (err: any) {
      setError(err?.message || "Unable to load manager dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialCase(cases: ManagerCaseItem[]) {
    const activeCaseId = getActiveCaseId();

    const selectedFromSession = activeCaseId
      ? cases.find((item) => item.id === activeCaseId)
      : null;

    const preferredCase = selectedFromSession || findPreferredBackendCase(cases);

    if (!preferredCase) return;

    await openCase(preferredCase, false);
  }

  async function openCase(caseItem: ManagerCaseItem, showLoading = true) {
    setSelectedCase(caseItem);

    if (caseItem.source === "simulated") {
      setSelectedCaseDetail({
        ...caseItem,
        isSimulated: true,
      });
      setSelectedCaseExternalIssues([]);
      return;
    }

    try {
      if (showLoading) {
        setCaseLoading(true);
      }

      localStorage.setItem("activeCaseId", caseItem.id);
      localStorage.setItem("managerActiveCaseId", caseItem.id);

      const [detailResponse, caseIssuesResponse] = await Promise.all([
        getCaseDetail(caseItem.id),
        getExternalBrokerIssuesByCase(caseItem.id),
      ]);

      const detail = detailResponse?.data || detailResponse;

      const caseIssues = Array.isArray(caseIssuesResponse?.data)
        ? caseIssuesResponse.data
        : Array.isArray(caseIssuesResponse)
          ? caseIssuesResponse
          : [];

      setSelectedCaseDetail(detail);
      setSelectedCaseExternalIssues(caseIssues);
    } catch (err: any) {
      setError(err?.message || "Unable to open selected case");
    } finally {
      setCaseLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const allCases = useMemo(() => {
    return [...backendCases, ...simulatedManagerCases];
  }, [backendCases]);

  const summary = getManagerSummary(observations);

  const combinedStats = useMemo(() => {
    const totalCases = allCases.length;

    const activeCases = allCases.filter((item) => {
      const status = String(item.currentStatus || "").toUpperCase();
      return !["COMPLETED", "CLOSED", "CANCELLED"].includes(status);
    }).length;

    const blockedCases = allCases.filter((item) => {
      return String(item.currentStatus || "").toUpperCase() === "BLOCKED";
    }).length;

    const waitingCases = allCases.filter((item) => {
      return String(item.currentStatus || "").toUpperCase() === "WAITING";
    }).length;

    const inProgressCases = allCases.filter((item) => {
      return String(item.currentStatus || "").toUpperCase() === "IN_PROGRESS";
    }).length;

    const monthEndPriority = allCases.filter(
      (item) => item.monthEndPriority
    ).length;

    return {
      totalCases,
      activeCases,
      blockedCases:
        blockedCases > 0 ? blockedCases : Number(summary.blockedCases || 0),
      waitingWork: Number(summary.waitingBlocks || 0) + waitingCases,
      inProgressWork: Number(summary.inProgressBlocks || 0) + inProgressCases,
      monthEndPriority,
      brokerIssues: managerExternalIssues.length,
    };
  }, [allCases, managerExternalIssues.length, summary]);

  const kpis = [
    {
      label: "Operating Cases",
      value: combinedStats.totalCases,
      helper: `${backendCases.length} backend + ${simulatedManagerCases.length} demo`,
      tone: "sky",
    },
    {
      label: "Active Workflows",
      value: combinedStats.activeCases,
      helper: "Live + demo operating view",
      tone: "emerald",
    },
    {
      label: "Manager Attention",
      value: combinedStats.blockedCases,
      helper: "Blocked / intervention needed",
      tone: "rose",
    },
    {
      label: "Month-End Risk",
      value: combinedStats.monthEndPriority,
      helper: "Closure priority cases",
      tone: "violet",
    },
    {
      label: "Waiting Work",
      value: combinedStats.waitingWork,
      helper: "Team queue pressure",
      tone: "orange",
    },
    {
      label: "In Progress Work",
      value: combinedStats.inProgressWork,
      helper: "Currently moving",
      tone: "blue",
    },
    {
      label: "Broker Follow-ups",
      value: combinedStats.brokerIssues,
      helper: "Manager observation",
      tone: "amber",
    },
    {
      label: "Selected Case",
      value: selectedCase ? 1 : 0,
      helper: selectedCase?.clientCompanyName || "Search and open case",
      tone: "slate",
    },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F3EA] p-6 text-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">
            Loading StratoMesh Manager Command Center...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] p-6 text-slate-950">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-700">
              STRATOMESH MANAGER VIEW
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Case Observation
            </h1>
            <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600">
              Search any case by case id, case code, client, broker, team, or
              block. Open the case to see its complete all-team communication
              history and broker observation trail.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadDashboard}
              className="rounded-xl border border-slate-300 bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              Refresh
            </button>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">
              Backend cases + demo scale
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-400">
          Operations overview
        </p>

        <div className="grid overflow-hidden rounded-xl sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <ManagerCharts
          stats={{
            inProgressWork: combinedStats.inProgressWork,
            waitingWork: combinedStats.waitingWork,
            blockedCases: combinedStats.blockedCases,
            monthEndPriority: combinedStats.monthEndPriority,
          }}
        />
      </section>

      <section className="mt-6">
        <ManagerCaseSearch
          cases={allCases}
          selectedCaseId={selectedCase?.id}
          searchText={searchText}
          activeFilter={activeFilter}
          onSearchChange={setSearchText}
          onFilterChange={setActiveFilter}
          onOpenCase={(caseItem) => openCase(caseItem, true)}
        />
      </section>

      <section className="mt-6">
        {caseLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Opening selected case history...
            </p>
          </div>
        ) : (
          <ManagerCaseBranch
            caseDetail={selectedCaseDetail}
            externalIssues={selectedCaseExternalIssues}
          />
        )}
      </section>
    </main>
  );
}

function KpiCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
  tone: string;
}) {
  return (
    <div className="bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-5xl font-thin text-slate-800">{value}</p>

      <p className="mt-2 text-xs font-medium text-amber-400">{helper}</p>
    </div>
  );
}