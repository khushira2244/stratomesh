"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDemoSession, setDemoSession } from "../../../lib/demo-session";

const teams = [
  { value: "sales", label: "Sales" },
  { value: "underwriting", label: "Underwriting" },
  { value: "pricing", label: "Pricing" },
  { value: "finance", label: "Finance" },
  { value: "policy-issuance", label: "Policy Issuance" },
  { value: "claims", label: "Claims" },
  { value: "management", label: "Management / Compliance" },
];

export default function DemoSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const journeyFromUrl = searchParams.get("journey") || "happy-new-policy";
  const layer = searchParams.get("layer") || "insurance-company";

  const [name, setName] = useState("");
  const [team, setTeam] = useState("sales");
  const [scenarioName, setScenarioName] = useState("Sunrise Foods Insurance");
  const [agendaLabel, setAgendaLabel] = useState("New Business / New Policy");

 useEffect(() => {
  const session = getDemoSession();

  setName(
    !session.userName || session.userName === "Demo User"
      ? ""
      : session.userName
  );

  setTeam(session.role || "sales");
  setScenarioName(session.scenarioName || "Sunrise Foods Insurance");
  setAgendaLabel(session.agendaLabel || "New Business / New Policy");
}, []);

  const handleContinue = () => {
    const userName = name.trim() || "Demo User";

    setDemoSession({
      userName,
      role: team,
      scenarioKey: journeyFromUrl,
      scenarioName,
      agendaLabel,
    });

    const query = `journey=${journeyFromUrl}&layer=${layer}&team=${team}&name=${encodeURIComponent(
      userName
    )}`;

    if (team === "sales") {
      router.push(`/platform/insurance-company/intake?${query}`);
      return;
    }

    if (team === "management") {
      router.push(`/platform/insurance-company/manager?${query}`);
      return;
    }

    router.push(`/platform/insurance-company/teams/${team}?${query}`);
  };

  return (
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-10 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-10 lg:grid-cols-2">
        <section>
          <div className="text-sm font-bold uppercase tracking-[0.3em] text-amber-700">
            Insurance Company Layer
          </div>

          <h1 className="mt-5 text-6xl font-black tracking-tight text-slate-950 md:text-7xl">
            StratoMesh
          </h1>

          <h2 className="mt-5 max-w-xl text-2xl font-bold leading-snug text-slate-900">
            Visibility for every insurance team movement.
          </h2>

          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Broker requests become internal team workspaces with documents,
            checklist decisions, comments, manager observation, and premium
            visibility.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-950">
              Demo Sign In
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter your name and choose the team workspace to start.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Your name
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Select team
              </label>
              <select
                value={team}
                onChange={(event) => setTeam(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                {teams.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div>
                Journey:{" "}
                <span className="font-semibold text-slate-900">
                  {scenarioName}
                </span>
              </div>
              <div className="mt-1">
                Agenda:{" "}
                <span className="font-semibold text-slate-900">
                  {agendaLabel}
                </span>
              </div>
              <div className="mt-1">
                Layer:{" "}
                <span className="font-semibold text-slate-900">
                  Insurance Company
                </span>
              </div>
              <div className="mt-1">
                Route:{" "}
                <span className="font-semibold text-slate-900">
                  {team === "management"
                    ? "Manager Command Center"
                    : team === "sales"
                      ? "Sales Intake"
                      : "Team Workspace"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-sky-100 transition hover:bg-sky-700"
            >
              Enter Workspace
            </button>

            <Link
              href={`/demo/layers?journey=${journeyFromUrl}`}
              className="block text-center text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              Back to layer selection
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}