"use client";

import {
  deriveStagesFromCaseDetail,
  flattenCaseTimeline,
  formatTeamLabel,
  TeamStageStatus,
} from "../../../lib/manager-dashboard-normalizers";

type ManagerCaseBranchProps = {
  caseDetail: any;
  externalIssues?: any[];
};

export default function ManagerCaseBranch({
  caseDetail,
  externalIssues = [],
}: ManagerCaseBranchProps) {
  if (!caseDetail) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          Case Communication History
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Search and open a case to see where it reached.
        </p>
      </section>
    );
  }

  if (caseDetail?.isSimulated) {
    return <SimulatedCaseBranch caseDetail={caseDetail} />;
  }

  const stages = deriveStagesFromCaseDetail(caseDetail);
  const timeline = flattenCaseTimeline(caseDetail);

  const documentsCount = Array.isArray(caseDetail?.documents)
    ? caseDetail.documents.length
    : caseDetail?._count?.documents || 0;

  const blocksCount = Array.isArray(caseDetail?.caseBlocks)
    ? caseDetail.caseBlocks.length
    : timeline.length;

  const riskTags = Array.isArray(caseDetail?.extractedData?.riskTags)
    ? caseDetail.extractedData.riskTags
    : Array.isArray(caseDetail?.riskTags)
      ? caseDetail.riskTags
      : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-700">
            Case Communication History
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {caseDetail.caseCode || "Selected Case"}
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            {caseDetail.title || "Full all-team case movement and observation history."}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-black uppercase text-emerald-700">
            Backend case
          </p>
          <p className="mt-1 text-sm font-black text-emerald-900">
            {blocksCount} blocks • {documentsCount} documents
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <SnapshotCard
          label="Current Team"
          value={formatTeamLabel(caseDetail.currentTeam)}
        />
        <SnapshotCard
          label="Current Block"
          value={caseDetail.currentBlockName || "Current block pending"}
        />
        <SnapshotCard
          label="Current Status"
          value={caseDetail.currentStatus || caseDetail.status || "PENDING"}
        />
        <SnapshotCard
          label="Premium"
          value={
            caseDetail.expectedPremium ||
            caseDetail.targetPremium ||
            caseDetail.extractedData?.policyRequirement?.targetPremium ||
            "Premium pending"
          }
        />
      </div>

      {caseDetail.businessImpact ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
            Business Impact
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            {caseDetail.businessImpact}
          </p>
        </div>
      ) : null}

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-950">
              Case Reached Stage
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Full team pipeline derived from backend blocksByTeam.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {stages.map((stage) => (
            <div
              key={stage.teamKey}
              className={`rounded-2xl border p-4 ${getStageClass(stage.status)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black">{stage.label}</p>
                <span className="text-lg font-black">
                  {getStageSymbol(stage.status)}
                </span>
              </div>

              <p className="mt-3 text-xs font-semibold opacity-80">
                {stage.blockCount} blocks
              </p>

              <p className="mt-1 text-[11px] opacity-75">
                W:{stage.waitingCount} IP:{stage.inProgressCount} B:
                {stage.blockedCount} C:{stage.completedCount}
              </p>

              {stage.currentBlockName ? (
                <p className="mt-3 line-clamp-2 text-xs font-semibold">
                  {stage.currentBlockName}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="text-xl font-black text-slate-950">
            All-Team Timeline History
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Sales, Underwriting, Pricing, Finance, Policy, Claims, and Manager
            blocks in case order.
          </p>

          <div className="mt-5 max-h-[720px] space-y-3 overflow-y-auto pr-2">
            {timeline.length === 0 ? (
              <p className="text-sm text-slate-500">
                No timeline blocks available for this case.
              </p>
            ) : (
              timeline.map((event) => (
                <TimelineEvent key={event.id} event={event} />
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-xl font-black text-slate-950">
              Broker Observation History
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Broker-safe communication requiring manager observation.
            </p>

            <div className="mt-5 space-y-3">
              {externalIssues.length === 0 ? (
                <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No broker observation history found for this case.
                </p>
              ) : (
                externalIssues.map((issue: any) => (
                  <ExternalIssueCard key={issue.id} issue={issue} />
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-xl font-black text-slate-950">Risk Tags</h3>

            {riskTags.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No risk tags available.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {riskTags.slice(0, 12).map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SnapshotCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 line-clamp-2 text-sm font-black text-slate-950">
        {value}
      </p>
    </div>
  );
}

function TimelineEvent({ event }: { event: any }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200">
              {event.teamLabel}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${getStatusPill(event.status)}`}>
              {event.status || "PENDING"}
            </span>
          </div>

          <p className="mt-3 text-sm font-black text-slate-950">
            {event.blockName || "Workflow block"}
          </p>
        </div>

        {event.responsible ? (
          <p className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
            {event.responsible}
          </p>
        ) : null}
      </div>

      {event.pendingReason ? (
        <p className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm leading-6 text-orange-900">
          Pending reason: {event.pendingReason}
        </p>
      ) : null}

      {event.comments ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {event.comments}
        </p>
      ) : null}

      {event.routeToNext ? (
        <p className="mt-3 text-xs font-bold text-slate-500">
          Route to next: {event.routeToNext}
        </p>
      ) : null}
    </div>
  );
}

function ExternalIssueCard({ issue }: { issue: any }) {
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-black text-violet-950">
            {issue.title || issue.requestType || "Broker observation"}
          </p>
          <p className="mt-1 text-xs font-semibold text-violet-700">
            {issue.brokerName || "Broker"} • {formatTeamLabel(issue.ownerTeam)}
          </p>
        </div>

        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-violet-700">
          {issue.status || "OBSERVATION"}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-violet-900">
        {issue.actionNeeded ||
          issue.message ||
          issue.description ||
          "Manager observation required."}
      </p>
    </div>
  );
}

function SimulatedCaseBranch({ caseDetail }: { caseDetail: any }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-700">
        Simulated Case History
      </p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">
        {caseDetail.caseCode || caseDetail.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {caseDetail.businessImpact || "Demo operating case for manager scale."}
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {["Sales", "Underwriting", "Pricing", "Finance", "Policy"].map(
          (team, index) => (
            <div
              key={team}
              className={`rounded-2xl border p-4 ${
                index < 2
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : index === 3
                    ? "border-orange-200 bg-orange-50 text-orange-800"
                    : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <p className="text-sm font-black">{team}</p>
              <p className="mt-2 text-xs font-semibold">
                {index < 2 ? "Completed" : index === 3 ? "Waiting" : "Open"}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function getStageClass(status: TeamStageStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "current":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "waiting":
      return "border-orange-200 bg-orange-50 text-orange-800";
    case "blocked":
      return "border-red-200 bg-red-50 text-red-800";
    case "observed":
      return "border-violet-200 bg-violet-50 text-violet-800";
    case "notStarted":
    default:
      return "border-slate-200 bg-white text-slate-500";
  }
}

function getStageSymbol(status: TeamStageStatus) {
  switch (status) {
    case "completed":
      return "✓";
    case "current":
      return "●";
    case "waiting":
      return "○";
    case "blocked":
      return "⚠";
    case "observed":
      return "◆";
    case "notStarted":
    default:
      return "—";
  }
}

function getStatusPill(status?: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "IN_PROGRESS":
      return "bg-sky-50 text-sky-700";
    case "WAITING":
      return "bg-orange-50 text-orange-700";
    case "BLOCKED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}