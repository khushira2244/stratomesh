export default function InsuranceCaseDetailPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.28em] text-amber-700">
          StratoMesh Case Detail
        </div>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Insurance Case Detail
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
          Case detail placeholder for demo routing. The active workflow case is
          handled through the team workspace and manager dashboard.
        </p>
      </section>
    </main>
  );
}