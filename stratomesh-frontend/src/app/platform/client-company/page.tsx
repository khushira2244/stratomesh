export default function ClientCompanyPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">
          StratoMesh Client Company Layer
        </div>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Client Company Workspace
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Client-facing workspace placeholder for demo routing. The main demo
          flow is currently handled through the insurance company layer.
        </p>
      </section>
    </main>
  );
}