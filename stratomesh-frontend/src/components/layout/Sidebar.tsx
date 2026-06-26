import Link from "next/link";

const insuranceLinks = [
  { label: "Overview", href: "/platform/insurance-company" },
  { label: "Sales Intake", href: "/platform/insurance-company/intake" },
  { label: "Cases", href: "/platform/insurance-company/cases" },
  { label: "Manager View", href: "/platform/insurance-company/manager" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 border-r border-slate-200 bg-white p-5">
      <Link href="/demo" className="block">
        <div className="text-xl font-bold text-slate-950">StratoMesh</div>
        <div className="mt-1 text-xs text-slate-500">
          Insurance Pipeline Platform
        </div>
      </Link>

      <div className="mt-8">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Demo
        </div>

        <nav className="space-y-1">
          <Link
            href="/demo"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Demo Home
          </Link>

          <Link
            href="/demo/stories"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Story Cases
          </Link>
        </nav>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Insurance Company
        </div>

        <nav className="space-y-1">
          {insuranceLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Future Layers
        </div>

        <nav className="space-y-1">
          <Link
            href="/platform/broker"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Broker Portal
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
              Soon
            </span>
          </Link>

          <Link
            href="/platform/client-company"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Client Company
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
              Soon
            </span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}