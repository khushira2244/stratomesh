"use client";

import {
  deriveStagesFromCaseItem,
  formatTeamLabel,
  ManagerCaseItem,
  searchManagerCases,
  TeamStageStatus,
} from "../../../lib/manager-dashboard-normalizers";

const filters = [
  { key: "all", label: "All" },
  { key: "inProgress", label: "In Progress" },
  { key: "waiting", label: "Waiting" },
  { key: "blocked", label: "Blocked" },
  { key: "monthEnd", label: "Month-End" },
  { key: "managerObservation", label: "Observed" },
  { key: "backend", label: "Backend" },
  { key: "simulated", label: "Demo" },
];

type ManagerCaseSearchProps = {
  cases: ManagerCaseItem[];
  selectedCaseId?: string;
  searchText: string;
  activeFilter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onOpenCase: (caseItem: ManagerCaseItem) => void;
};

export default function ManagerCaseSearch({
  cases,
  selectedCaseId,
  searchText,
  activeFilter,
  onSearchChange,
  onFilterChange,
  onOpenCase,
}: ManagerCaseSearchProps) {
  const filteredCases = searchManagerCases(cases, searchText, activeFilter);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">
            Case Observation Search
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Manager Case Control Chart
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Search by case id, case code, client, broker, team, block, or
            status. Open a row to see full all-team communication history.
          </p>
        </div>

        <div className="w-full xl:max-w-md">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Search case history
          </label>
          <input
            value={searchText}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search Sunrise, INS-SUNRISE, cmq..., finance, blocked..."
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => onFilterChange(filter.key)}
              className={`rounded-full px-4 py-2 text-xs font-black transition ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <div className="hidden grid-cols-[1.5fr_0.85fr_0.85fr_0.85fr_0.85fr_0.85fr_0.85fr_0.9fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 xl:grid">
          <div>Case / Client</div>
          <div>Sales</div>
          <div>UW</div>
          <div>Pricing</div>
          <div>Finance</div>
          <div>Policy</div>
          <div>Manager</div>
          <div>Status</div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="bg-white p-8 text-center">
            <p className="text-sm font-bold text-slate-700">
              No matching cases found.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try Sunrise, case code, broker name, current team, or status.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredCases.map((caseItem) => {
              const stages = deriveStagesFromCaseItem(caseItem);
              const isSelected = selectedCaseId === caseItem.id;

              return (
                <button
                  key={caseItem.id}
                  type="button"
                  onClick={() => onOpenCase(caseItem)}
                  className={`grid w-full gap-3 px-4 py-4 text-left transition xl:grid-cols-[1.5fr_0.85fr_0.85fr_0.85fr_0.85fr_0.85fr_0.85fr_0.9fr] xl:items-center ${
                    isSelected
                      ? "bg-sky-50"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-slate-950">
                        {caseItem.caseCode || caseItem.id}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                          caseItem.source === "backend"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-violet-50 text-violet-700"
                        }`}
                      >
                        {caseItem.source}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {caseItem.clientCompanyName || caseItem.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {caseItem.brokerName || "Broker pending"} •{" "}
                      {caseItem.expectedPremium ||
                        caseItem.targetPremium ||
                        "Premium pending"}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      ID: {caseItem.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 xl:contents">
                    {stages
                      .filter((stage) =>
                        [
                          "sales",
                          "underwriting",
                          "pricing",
                          "finance",
                          "policyIssuance",
                          "management",
                        ].includes(stage.teamKey)
                      )
                      .map((stage) => (
                        <StageCell key={stage.teamKey} status={stage.status} />
                      ))}
                  </div>

                  <div className="flex flex-col items-start gap-1 xl:items-end">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                      {caseItem.currentStatus || "PENDING"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {formatTeamLabel(caseItem.currentTeam)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
        <LegendDot label="Completed" status="completed" />
        <LegendDot label="Current" status="current" />
        <LegendDot label="Waiting" status="waiting" />
        <LegendDot label="Blocked" status="blocked" />
        <LegendDot label="Not started" status="notStarted" />
      </div>
    </section>
  );
}

function StageCell({ status }: { status: TeamStageStatus }) {
  const config = getStageConfig(status);

  return (
    <div
      className={`flex min-h-12 items-center justify-center rounded-2xl border px-3 py-2 ${config.className}`}
      title={config.label}
    >
      <span className="text-lg font-black">{config.symbol}</span>
      <span className="ml-2 hidden text-xs font-black xl:inline">
        {config.shortLabel}
      </span>
    </div>
  );
}

function LegendDot({
  label,
  status,
}: {
  label: string;
  status: TeamStageStatus;
}) {
  const config = getStageConfig(status);

  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full border ${config.dotClassName}`} />
      <span>{label}</span>
    </div>
  );
}

function getStageConfig(status: TeamStageStatus) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        shortLabel: "Done",
        symbol: "✓",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dotClassName: "border-emerald-200 bg-emerald-500",
      };

    case "current":
      return {
        label: "Current / in progress",
        shortLabel: "Now",
        symbol: "●",
        className: "border-sky-200 bg-sky-50 text-sky-700",
        dotClassName: "border-sky-200 bg-sky-500",
      };

    case "waiting":
      return {
        label: "Waiting",
        shortLabel: "Wait",
        symbol: "○",
        className: "border-orange-200 bg-orange-50 text-orange-700",
        dotClassName: "border-orange-200 bg-orange-500",
      };

    case "blocked":
      return {
        label: "Blocked / needs observation",
        shortLabel: "Risk",
        symbol: "⚠",
        className: "border-red-200 bg-red-50 text-red-700",
        dotClassName: "border-red-200 bg-red-500",
      };

    case "observed":
      return {
        label: "Manager observed",
        shortLabel: "Obs",
        symbol: "◆",
        className: "border-violet-200 bg-violet-50 text-violet-700",
        dotClassName: "border-violet-200 bg-violet-500",
      };

    case "notStarted":
    default:
      return {
        label: "Not started",
        shortLabel: "Open",
        symbol: "—",
        className: "border-slate-200 bg-slate-50 text-slate-400",
        dotClassName: "border-slate-200 bg-slate-300",
      };
  }
}