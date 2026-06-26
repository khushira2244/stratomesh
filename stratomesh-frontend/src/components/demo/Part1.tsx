'use client';

import { useState } from 'react';
import './Part1.css';
import Link from "next/link";

// ─── ARCH IMAGE ─────────────────────────────────────────────────────────────
// Place your architecture image in /public/arch.png and update this import
import archImg from '/public/arch.png';

// ─── DATA ────────────────────────────────────────────────────────────────────

type Card = { title: string; sub: string; icon: React.ReactNode };
type TabKey = 'client' | 'broker' | 'insurer';

const tabData: Record<TabKey, { desc: string; cards: Card[] }> = {
  client: {
    desc: 'Client companies struggle with internal coordination before anything even reaches the broker. HR, finance, legal, management, and operations all have their own approvals, documents, and visibility gaps.',
    cards: [
      { title: 'Scattered internal requests', sub: 'No single place to track insurance actions across teams', icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 4v5" /></> },
      { title: 'Approval delays across HR, finance, and legal', sub: 'Each team works on its own timeline with no shared visibility', icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></> },
      { title: 'Missing employee and company documents', sub: 'Documents get requested multiple times across departments', icon: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 17l2 2 4-4" /></> },
      { title: 'Poor visibility on renewal and premium deadlines', sub: 'Renewals get missed or rushed without advance tracking', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></> },
      { title: 'Broken claim request coordination', sub: 'Claims move slowly when internal approvals are unclear', icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></> },
      { title: 'Too many follow-up emails and tagged people', sub: 'Work runs through inboxes instead of structured workflows', icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></> },
      { title: 'No clear owner for insurance actions', sub: 'Responsibility is assumed, not assigned — things fall through', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><path d="M16 11l2 2 4-4" /></> },
      { title: 'Management cannot see business impact', sub: 'Leaders have no live view of insurance exposure or blockers', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><path d="M2 20h20" /></> },
    ],
  },
  broker: {
    desc: 'Brokers sit between client companies and insurers, but much of their work is still trapped in emails, follow-ups, quote comparison sheets, policy chasing, and claim coordination.',
    cards: [
      { title: 'Client requirement collection is fragmented', sub: 'Different clients send information in different formats and channels', icon: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 12h6M9 16h4" /></> },
      { title: 'RFQ follow-ups across multiple insurers are manual', sub: 'Tracking responses from 5–10 insurers per case is error-prone', icon: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></> },
      { title: 'Quote comparison is difficult and inconsistent', sub: 'No structured format to compare terms, limits, and premiums', icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" /></> },
      { title: 'Policy issuance follow-up is slow', sub: 'After quote acceptance, issuance tracking falls back to email', icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></> },
      { title: 'Premium follow-up and payment tracking are unclear', sub: 'Who paid, what is pending, and what is overdue is never clear', icon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" /></> },
      { title: 'Claim follow-up requires repeated coordination', sub: 'Surveyors, insurers, and clients all need separate follow-ups', icon: <><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.65" /></> },
      { title: 'No clean visibility across all client accounts', sub: 'Account managers lack a live pipeline view across their book', icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /><line x1="3" y1="3" x2="21" y2="21" /></> },
      { title: 'Too much dependency on email threads', sub: 'Critical decisions get buried inside long email chains', icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><line x1="2" y1="2" x2="22" y2="22" /></> },
    ],
  },
  insurer: {
    desc: 'Insurance companies face heavy internal workflow pressure across sales, underwriting, pricing, policy issuance, finance, claims, and management.',
    cards: [
      { title: 'Rigid vendor-controlled workflows', sub: 'Teams cannot adapt processes without IT or vendor involvement', icon: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
      { title: 'Missing document delays', sub: 'Cases stall repeatedly when documents are incomplete or missing', icon: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><line x1="9" y1="13" x2="15" y2="13" /><path d="M14 3v5h5" /></> },
      { title: 'Underwriting and pricing bottlenecks', sub: 'Complex cases queue up with no structured priority or routing', icon: <><circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8l4 4-4 4" /></> },
      { title: 'Policy issuance gets stuck after business is won', sub: 'Ops delays after underwriting approval lose momentum', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-4 0v2M12 12v4M10 14h4" /></> },
      { title: 'Premium reconciliation slows closure', sub: 'Finance and sales teams work on different records and timelines', icon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" /></> },
      { title: 'Claims and surveyor follow-up are delayed', sub: 'No structured handoff between claims, surveyors, and finance', icon: <><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.65" /></> },
      { title: 'No observer visibility across teams', sub: 'Senior managers cannot see who is watching critical cases', icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /><line x1="3" y1="3" x2="21" y2="21" /></> },
      { title: 'Managers cannot see blockers and SLA risk', sub: 'Month-end closure pressure builds with no early warning system', icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><path d="M2 20h20" /><line x1="2" y1="2" x2="22" y2="22" /></> },
    ],
  },
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function Part1() {
  const [activeTab, setActiveTab] = useState<TabKey>('client');
  const tab = tabData[activeTab];

  return (
    <>
      {/* ══ SECTION 1: HERO ══════════════════════════════════════════ */}
      <section className="hero">
        <div className="left">
          <div className="badge">Commercial Insurance · AI Workflow Platform</div>
          <h1 className="headline">
            The AI Workflow Mesh for<br />
            <span className="accent">Commercial Insurance</span>
          </h1>
          <p className="subtext">
            StratoMesh connects client companies, brokers, and insurance companies through flexible
            drag-and-drop workflow lines. Teams define inputs, documents, checks, owners, and routes
            — while AI helps design better workflows.
          </p>
          <div className="cta-row">
            <a href="#architecture" className="btn-primary">
              See Architecture
            </a>

            <Link href="/demo/stories" className="btn-secondary">
              View Insurance Demo
            </Link>
          </div>
          <div className="features">
            {[
              { dot: 'teal', text: 'Team-level drag-and-drop workflows' },
              { dot: 'teal', text: 'Client–broker–insurer handoff visibility' },
              { dot: 'amber', text: 'AI-assisted block and check suggestions' },
              { dot: 'teal', text: 'Manager pipeline and closure risk view' },
            ].map(({ dot, text }) => (
              <div key={text} className="feat">
                <span className={`feat-dot dot-${dot}`} />
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-right">
          {/* Mesh SVG */}
          <div className="mesh-wrap">
            <svg width="460" height="460" viewBox="0 0 460 460" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00C896" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#00C896" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00C896" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#00C896" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="230" cy="230" r="200" fill="url(#glow2)" stroke="#00C896" strokeWidth="0.5" strokeOpacity="0.15" />
              <circle cx="230" cy="230" r="155" fill="url(#glow1)" stroke="#00C896" strokeWidth="0.5" strokeOpacity="0.2" />
              <circle cx="230" cy="230" r="100" fill="#0d1f2d" stroke="#00C896" strokeWidth="0.8" strokeOpacity="0.3" />
              {[['230', '230', '230', '42'], ['230', '230', '60', '370'], ['230', '230', '400', '370'], ['230', '230', '42', '180'], ['230', '230', '418', '180'], ['230', '230', '130', '60'], ['230', '230', '330', '60'], ['230', '230', '60', '280'], ['230', '230', '400', '280'], ['230', '230', '160', '400'], ['230', '230', '300', '400']].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00C896" strokeWidth={i < 3 ? '0.6' : '0.4'} strokeOpacity={i < 3 ? '0.3' : i < 7 ? '0.2' : '0.15'} />
              ))}
              <line x1="230" y1="42" x2="60" y2="370" stroke="#00C896" strokeWidth="0.3" strokeOpacity="0.12" />
              <line x1="230" y1="42" x2="400" y2="370" stroke="#00C896" strokeWidth="0.3" strokeOpacity="0.12" />
              <line x1="60" y1="370" x2="400" y2="370" stroke="#00C896" strokeWidth="0.3" strokeOpacity="0.12" />
              <circle cx="230" cy="230" r="38" fill="#0a1628" stroke="#00C896" strokeWidth="1.5" strokeOpacity="0.7" />
              <text x="230" y="225" textAnchor="middle" fontSize="11" fontWeight="500" fill="#00C896">STRATO</text>
              <text x="230" y="240" textAnchor="middle" fontSize="11" fontWeight="500" fill="#00C896">MESH</text>
              {[{ cx: '230', cy: '42', tx: '230', ty: '26', label: 'CLIENT COMPANY' }, { cx: '60', cy: '370', tx: '60', ty: '392', label: 'INSURER' }, { cx: '400', cy: '370', tx: '400', ty: '392', label: 'BROKER' }].map(({ cx, cy, tx, ty, label }) => (
                <g key={label}>
                  <circle cx={cx} cy={cy} r="6" fill="#00C896" opacity="0.9" />
                  <text x={tx} y={ty} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="500">{label}</text>
                </g>
              ))}
              {[{ cx: '42', cy: '180', tx: '22', ty: '174', label: 'SLA Signals' }, { cx: '418', cy: '180', tx: '438', ty: '174', label: 'AI Workflow Builder' }, { cx: '130', cy: '60', tx: '120', ty: '50', label: 'Workflow UI' }, { cx: '330', cy: '60', tx: '350', ty: '50', label: 'DB Memory' }].map(({ cx, cy, tx, ty, label }) => (
                <g key={label}>
                  <circle cx={cx} cy={cy} r="3.5" fill="#00C896" opacity="0.5" />
                  <text x={tx} y={ty} textAnchor="middle" fontSize="9" fill="#4a8c78">{label}</text>
                </g>
              ))}
              {[{ cx: '165', cy: '148', tx: '148', ty: '142', label: 'Request Intake' }, { cx: '295', cy: '148', tx: '318', ty: '142', label: 'Document Check' }, { cx: '145', cy: '295', tx: '120', ty: '290', label: 'Closure' }, { cx: '315', cy: '295', tx: '340', ty: '290', label: 'Risk Check' }, { cx: '178', cy: '320', tx: '155', ty: '336', label: 'Ext. Handoff' }, { cx: '282', cy: '320', tx: '308', ty: '336', label: 'Approval Gate' }].map(({ cx, cy, tx, ty, label }) => (
                <g key={label}>
                  <circle cx={cx} cy={cy} r="3" fill="#00C896" opacity="0.4" />
                  <text x={tx} y={ty} textAnchor="middle" fontSize="8.5" fill="#4a6080">{label}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Floating metric cards */}
          <div className="fcard card-sla">
            <div className="fcard-label">SLA Breaches</div>
            <div className="fcard-value danger">14</div>
          </div>
          <div className="fcard card-premium">
            <div className="fcard-label">Premium Closure</div>
            <div className="fcard-value teal">68%</div>
          </div>
          <div className="fcard card-pipeline">
            <div className="fcard-label">Pipeline at Risk</div>
            <div className="fcard-value danger">₹1.1 Cr</div>
          </div>
          <div className="fcard card-pending">
            <div className="fcard-label">Pending Policies</div>
            <div className="fcard-value">32</div>
          </div>
          <div className="fcard card-db">
            <div className="fcard-label">AWS Database</div>
            <div className="fcard-value sm">Aurora DSQL</div>
            <div className="fcard-meta">Workflow memory</div>
          </div>
          <div className="fcard card-vercel-card">
            <div className="fcard-label">Vercel Deployed</div>
            <div className="fcard-value sm">Next.js</div>
            <div className="fcard-meta">Workflow UI · Live</div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 2: THE PROBLEM ══════════════════════════════════ */}
      <section className="s2">
        <div className="s2-top">
          <div className="s2-label">The Problem</div>
          <h2 className="s2-title">
            Insurance breaks differently <em>at every layer.</em>
          </h2>
          <p className="s2-sub">
            Commercial insurance is not one single workflow problem. Client companies, brokers, and
            insurance companies each face different delays, blind spots, and coordination issues.
          </p>
        </div>

        <div className="tabs">
          {([['client', 'Client Company'], ['broker', 'Broker'], ['insurer', 'Insurance Company']] as const).map(([key, label]) => (
            <button
              key={key}
              className={`tab${activeTab === key ? ' active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="tab-desc">{tab.desc}</p>
        <div className="prob-cards">
          {tab.cards.map((card) => (
            <div key={card.title} className="pcard">
              <div className="pcard-icon">
                <svg viewBox="0 0 24 24">{card.icon}</svg>
              </div>
              <div className="pcard-title">{card.title}</div>
              <div className="pcard-sub">{card.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SECTION 3: ARCHITECTURE ═════════════════════════════════ */}
      <section id="architecture" className="s3">
        <div className="s3-top">
          <div className="s3-label">Platform Architecture</div>
          <h2 className="s3-title">
            Production-scale infrastructure <em>behind StratoMesh.</em>
          </h2>
          <p className="s3-sub">
            Every layer — frontend, backend, workflow engine, database, AI, storage, queue, cache,
            search, and observability — designed to handle the full commercial insurance workflow at scale.
          </p>
        </div>

        <div className="arch-card">
          <div className="arch-card__bar">
            <div className="arch-card__dot arch-card__dot--r" />
            <div className="arch-card__dot arch-card__dot--y" />
            <div className="arch-card__dot arch-card__dot--g" />
            <div className="arch-card__title">StratoMesh — full platform architecture</div>
          </div>
          {/* Place your arch image in /public/arch.png */}
          <img className="arch-card__img" src="/arch.png" alt="StratoMesh Architecture" />
        </div>

        <div className="s3-caption">
          Vercel · Next.js · AWS Aurora PostgreSQL · Prisma ORM · AI Automation · Observability
        </div>
      </section>
    </>
  );
}
