export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Insurance Company Layer
          </div>
          <div className="text-xs text-slate-500">
            Broker intake → case creation → team workflow visibility
          </div>
        </div>

        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          Hackathon Demo
        </div>
      </div>
    </header>
  );
}