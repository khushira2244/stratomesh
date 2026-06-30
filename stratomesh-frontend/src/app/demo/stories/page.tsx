"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import JudgeAccessGate from "../../../components/JudgeAccessGate";
import {
  startDemoScenario,
  type DemoScenarioKey,
} from "../../../lib/demo-scenarios-api";

const insuranceTypes = [
  {
    title: "Sunrise Foods Insurance",
    subtitle: "Fire & Property — Happy New Policy",
    description:
      "A broker sends a new policy request with documents. Sales reviews the package, internal teams process it, quotation is sent, premium is cleared, and policy is released.",
    status: "Active Demo",
    agenda: "New Business / New Policy",
    agendaId: "new-policy-premium-closure",
    scenarioKey: "happy-new-policy" as DemoScenarioKey,
    startTeam: "Sales",
    startRole: "sales",
    href: "/demo/layers?journey=happy-new-policy",
    active: true,
  },
  {
    title: "Claim Settlement Journey",
    subtitle: "Claim intimation and review",
    description:
      "Claims team reviews claim documents, surveyor notes, policy coverage, settlement checks, and manager observations.",
    status: "Second Demo",
    agenda: "Claim Review",
    agendaId: "claim-review",
    scenarioKey: "claim-settlement" as DemoScenarioKey,
    startTeam: "Claims",
    startRole: "claims",
    href: "/demo/layers?journey=claim-settlement",
    active: true,
  },
  {
    title: "Marine Cargo Insurance",
    subtitle: "Shipment and transit risk",
    description:
      "Marine cargo policy request, shipment details, route risk, invoice documents, and transit coverage.",
    status: "Coming Soon",
    agenda: "Marine Policy",
    startTeam: "Sales",
    active: false,
  },
  {
    title: "Group Health Insurance",
    subtitle: "Employee health coverage",
    description:
      "Corporate employee census, coverage benefits, pricing, underwriting conditions, and policy issuance.",
    status: "Coming Soon",
    agenda: "Group Health",
    startTeam: "Sales",
    active: false,
  },
  {
    title: "Engineering Insurance",
    subtitle: "Project and machinery risk",
    description:
      "Engineering asset schedule, project risk, machinery breakdown coverage, and underwriting checks.",
    status: "Coming Soon",
    agenda: "Engineering Risk",
    startTeam: "Underwriting",
    active: false,
  },
  {
    title: "Renewal Journey",
    subtitle: "Existing policy renewal",
    description:
      "Past policy memory, renewal quote, claim history, revised terms, and premium closure.",
    status: "Coming Soon",
    agenda: "Renewal",
    startTeam: "Sales",
    active: false,
  },
];

export default function InsuranceTypePage() {
  const router = useRouter();

  const [loadingKey, setLoadingKey] = useState<DemoScenarioKey | "">("");
  const [error, setError] = useState("");

  const handleStartJourney = async (item: any) => {
    if (!item.active || !item.scenarioKey || !item.href) return;

    try {
      setError("");
      setLoadingKey(item.scenarioKey);

      await startDemoScenario(item.scenarioKey);

      router.push(item.href);
    } catch (err) {
      console.error("Unable to start demo scenario:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start demo scenario"
      );
    } finally {
      setLoadingKey("");
    }
  };

  return (
    <JudgeAccessGate>
      <main className="min-h-screen bg-[#F7F3EA] px-6 py-10 text-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <div className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
                StratoMesh Demo Setup
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950">
                Choose Insurance Type
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Select the insurance journey you want to run. For the hackathon
                demo, Sunrise Foods Fire & Property insurance is the primary
                happy path.
              </p>
            </div>

            <Link
              href="/demo"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Back
            </Link>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {insuranceTypes.map((item) => (
              <article
                key={item.title}
                className={`rounded-3xl border bg-white p-6 shadow-md transition ${
                  item.active
                    ? "border-sky-200 hover:-translate-y-1 hover:shadow-xl"
                    : "border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-slate-950">
                      {item.title}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-600">
                      {item.subtitle}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.active
                        ? "bg-sky-50 text-sky-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="mt-4 min-h-24 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Agenda
                      </div>
                      <div className="mt-1 font-semibold text-slate-800">
                        {item.agenda}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Starts With
                      </div>
                      <div className="mt-1 font-semibold text-slate-800">
                        {item.startTeam}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {item.active && item.href ? (
                    <button
                      type="button"
                      onClick={() => handleStartJourney(item)}
                      disabled={loadingKey === item.scenarioKey}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-sky-100 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {loadingKey === item.scenarioKey
                        ? "Starting..."
                        : "Start Journey"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-400"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </JudgeAccessGate>
  );
}