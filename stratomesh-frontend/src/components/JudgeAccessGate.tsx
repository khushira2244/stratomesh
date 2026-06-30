"use client";

import { useEffect, useState } from "react";

const JUDGE_ACCESS_CODE = "JudgeSolomon2026";

export default function JudgeAccessGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [code, setCode] = useState("");
  const [isAllowed, setIsAllowed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("stratomesh_judge_access");
    if (saved === "granted") {
      setIsAllowed(true);
    }
  }, []);

  const handleSubmit = () => {
    if (code.trim() === JUDGE_ACCESS_CODE) {
      window.localStorage.setItem("stratomesh_judge_access", "granted");
      setIsAllowed(true);
      setError("");
      return;
    }

    setError("Invalid judge access code.");
  };

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
          <div className="text-xs font-black uppercase tracking-[0.28em] text-emerald-400">
            StratoMesh Judge Access
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Enter demo access code
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-300">
            This demo is shared for hackathon judges and organizers. Please use
            the access code provided in the Devpost testing instructions.
          </p>

          <div className="mt-6">
            <label className="text-sm font-bold text-slate-200">
              Access code
            </label>

            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
              }}
              placeholder="Enter judge access code"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
            />

            {error && (
              <div className="mt-3 text-sm font-bold text-red-300">
                {error}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
          >
            Enter StratoMesh Demo
          </button>

          <p className="mt-5 text-xs leading-5 text-slate-400">
            Contact: khushira2244@gmail.com
          </p>
        </section>
      </div>
    </main>
  );
}