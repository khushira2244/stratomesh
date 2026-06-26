import Link from "next/link";

export default function LayerSelectionPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
              Sunrise Foods Insurance
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950">
              Choose Product Layer
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              StratoMesh is designed across three insurance relationship layers.
              For this demo, the Insurance Company layer is active. Broker and
              Client Company layers are shown as future visibility portals.
            </p>
          </div>

          <Link
            href="/demo/stories"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-sky-200 bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Insurance Company Level
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Internal insurer workspace for Sales, Underwriting, Pricing,
                  Finance, Policy Issuance, Claims, and Management.
                </p>
              </div>

              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                Active
              </span>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div>Broker request intake</div>
              <div>Team-level workspaces</div>
              <div>Checklist governance</div>
              <div>Manager premium visibility</div>
            </div>

            <Link
              href="/demo/signin?journey=happy-new-policy&layer=insurance-company"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-sky-100 transition hover:bg-sky-700"
            >
              Enter Insurance Layer
            </Link>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 opacity-70 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Broker Level
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Future broker-safe portal for quote status, missing document
                  requests, clarification replies, and policy delivery.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                Coming Soon
              </span>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              <div>Broker-safe status updates</div>
              <div>Document upload responses</div>
              <div>Quote and policy communication</div>
              <div>No internal underwriting drama exposed</div>
            </div>

            <button
              disabled
              className="mt-6 w-full rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-400"
            >
              Coming Soon
            </button>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 opacity-70 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Client Company Level
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Future client-side view for insurance request progress,
                  required actions, policy status, and renewal/claim memory.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                Coming Soon
              </span>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              <div>Policy request progress</div>
              <div>Client-side required actions</div>
              <div>Trust-safe status visibility</div>
              <div>Future renewal and claim memory</div>
            </div>

            <button
              disabled
              className="mt-6 w-full rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-400"
            >
              Coming Soon
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}