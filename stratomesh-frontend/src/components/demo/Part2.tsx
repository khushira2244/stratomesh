'use client';

import { useState } from 'react';
import './Part2.css';

// ─── DATA ────────────────────────────────────────────────────────────────────

const BLOCKS = [
  { name: 'Request Intake',     active: false, icon: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></> },
  { name: 'Document Check',    active: false, icon: <><path d="M9 12l2 2 4-4"/><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></> },
  { name: 'Data Check',        active: false, icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></> },
  { name: 'Risk Check',        active: true,  icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></> },
  { name: 'Review',            active: false, icon: <><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></> },
  { name: 'Approval Gate',     active: false, icon: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></> },
  { name: 'Internal Handoff',  active: false, icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { name: 'External Handoff',  active: false, icon: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></> },
  { name: 'Query',             active: false, icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></> },
  { name: 'Decision Route',    active: false, icon: <><circle cx="12" cy="12" r="9"/><path d="M8 12h8M15 9l3 3-3 3"/></> },
  { name: 'Observation Point', active: false, icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> },
  { name: 'Metric Check',      active: false, icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><path d="M2 20h20"/></> },
  { name: 'Escalation',        active: false, icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></> },
  { name: 'Output',            active: false, icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> },
  { name: 'Learning Note',     active: false, icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></> },
  { name: 'Closure',           active: false, icon: <><polyline points="20 6 9 17 4 12"/></> },
];

const AI_CAPS = [
  { text: 'Generate workflow from prompt',                    icon: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></> },
  { text: 'Suggest missing inputs and documents',             icon: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></> },
  { text: 'Suggest risk checks and weak points',              icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></> },
  { text: 'Suggest responsible owners and observers',         icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></> },
  { text: 'Suggest pass / fail / risky route logic',          icon: <><circle cx="12" cy="12" r="9"/><path d="M8 12h8M15 9l3 3-3 3"/></> },
  { text: 'Generate senior manager reports',                  icon: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 12h6M9 16h4"/></> },
  { text: 'Highlight weak workflow points before activation', icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></> },
  { text: 'Suggest SLA and escalation thresholds',            icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></> },
  { text: 'Add learning notes from past workflow runs',       icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></> },
];

const S7_CARDS = [
  {
    variant: 'client' as const,
    icon: 'ti ti-building-skyscraper',
    label: 'For Client Companies',
    title: 'Client Insurance Control',
    desc: <>Stop chasing your broker over email. <strong>StratoMesh gives your team a single control layer</strong> for all insurance actions — from submitting requirements to tracking renewals, claims, and approvals.</>,
    points: [
      'Submit requirements, documents, and renewal inputs from one place',
      'Always know what your broker or insurer is waiting for',
      'All comments, approvals, and decisions stay inside the case — not in email threads',
      'No more searching WhatsApp, Teams, or inbox to understand policy status',
      'Your full policy history is preserved for every future renewal and claim',
    ],
    cta: 'Get this for my company →',
    email: 'Client Company',
  },
  {
    variant: 'broker' as const,
    icon: 'ti ti-briefcase',
    label: 'For Broker Companies',
    title: 'Broker Placement Desk',
    desc: <>Run your entire placement operation from one desk. <strong>StratoMesh converts client requests into structured cases</strong>, broadcasts them to insurers, and tracks every response, quote, and clarification.</>,
    points: [
      'Convert client emails into structured, trackable placement cases instantly',
      'Broadcast one request to multiple insurers simultaneously',
      'Track quote status, insurer responses, and clarification threads in one view',
      'All documents, comments, and decisions stay inside the case — not scattered across inboxes',
      'Compare premium, coverage, exclusions, and insurer response speed side by side',
    ],
    cta: 'Get this for my brokerage →',
    email: 'Broker Company',
  },
  {
    variant: 'insurer' as const,
    icon: 'ti ti-shield-check',
    label: 'For Insurance Companies',
    title: 'Insurer Workflow Command',
    desc: <>Replace disconnected team handoffs with a structured operating layer. <strong>StratoMesh routes broker submissions</strong> across Underwriting, Pricing, Finance, Claims, and Management — with full visibility at every step.</>,
    points: [
      'Broker emails and documents convert into live, structured cases automatically',
      'Each team gets their own Send / Receive Desk, Working Space, and Communication Flow',
      'Documents, checks, waivers, and questioned items are configured inside the workflow',
      'Internal comments and broker-safe messages stay inside the case — never in email',
      'Managers see blockers, SLA risk, premium impact, and ownership in real time',
    ],
    cta: 'Get this for my insurer →',
    email: 'Insurance Company',
  },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function Part2() {
  const [toast, setToast] = useState(false);

  function sendInterest(type: string) {
    const subject = encodeURIComponent(`Interest in StratoMesh — ${type}`);
    const body = encodeURIComponent(`Hi,\n\nI am interested in StratoMesh for my ${type}.\n\nPlease reach out to discuss further.\n\nThank you.`);
    window.location.href = `mailto:khushira2244@gmail.com?subject=${subject}&body=${body}`;
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  return (
    <>
      {/* ══ SECTION 4: BLOCK BUILDER ════════════════════════════════ */}
      <section className="s4">
        <div className="s4-top">
          <div className="s4-label">Block Builder</div>
          <h2 className="s4-title">Blocks are business scope. <em>Inside blocks is how your team works.</em></h2>
          <p className="s4-sub">Every team builds its workflow using reusable blocks. A block may be "Document Check" or "Risk Check," but each team decides what that block requires, who owns it, who observes it, what output it produces, and where it routes next.</p>
        </div>

        <div className="s4-panels">
          {/* Block library */}
          <div className="panel-left">
            <div className="panel-title">Block library — drag into your workflow</div>
            <div className="block-grid">
              {BLOCKS.map(({ name, active, icon }) => (
                <div key={name} className={`bblock${active ? ' active' : ''}`}>
                  <div className="bblock-icon"><svg viewBox="0 0 24 24">{icon}</svg></div>
                  <span className="bblock-name">{name}</span>
                  <span className="bblock-drag">⠿</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inspector + hint */}
          <div className="panel-right">
            <div className="inspector">
              <div className="inspector-header">
                <div className="inspector-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <path d="M12 9v4M12 17h.01"/>
                  </svg>
                </div>
                <div>
                  <div className="inspector-name">Risk Check</div>
                  <div className="inspector-sub">Block inspector — configure how your team uses this block</div>
                </div>
              </div>
              <div className="config-rows">
                <div className="crow"><div className="crow-label">Inputs</div><div className="crow-tags">{['Company name','Industry','Sum insured','Claim history'].map(t=><span key={t} className="ctag">{t}</span>)}</div></div>
                <div className="crow"><div className="crow-label">Documents</div><div className="crow-tags">{['Previous policy copy','Claim history','Company proof'].map(t=><span key={t} className="ctag">{t}</span>)}</div></div>
                <div className="crow"><div className="crow-label">Checks</div><div className="crow-tags">{['New company?','High-risk industry?','Missing claim history?','High-value threshold?'].map(t=><span key={t} className="ctag">{t}</span>)}</div></div>
                <div className="crow"><div className="crow-label">Owner</div><div className="crow-val">Sales Team Lead</div></div>
                <div className="crow"><div className="crow-label">Observers</div><div className="crow-tags">{['Sales Manager','Underwriting Lead'].map(t=><span key={t} className="ctag">{t}</span>)}</div></div>
                <div className="crow"><div className="crow-label">SLA</div><div className="crow-val">2 days</div></div>
                <div className="crow"><div className="crow-label">Output</div><div className="crow-tags"><span className="ctag ctag-green">Low Risk</span><span className="ctag ctag-red">High Risk</span><span className="ctag ctag-amber">Missing Docs</span></div></div>
                <div className="crow">
                  <div className="crow-label">Route</div>
                  <div className="route-row">
                    {[['#10B981','Passed → Underwriting Handoff'],['#EF4444','Failed → Query Broker'],['#F59E0B','Risky → Manager Review']].map(([c,t])=>(
                      <div key={t} className="route-item"><div className="route-dot" style={{background:c}}/><span>{t}</span></div>
                    ))}
                  </div>
                </div>
                <div className="crow"><div className="crow-label">Comments</div><div className="crow-val crow-val-muted">Team discussion notes attached to this block instance</div></div>
                <div className="crow"><div className="crow-label">Learning note</div><div className="crow-val crow-val-muted">Add this check earlier if underwriting queries repeat</div></div>
              </div>
            </div>
            <div className="hint-card">
              <div className="hint-title">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
                Same block, different team logic.
              </div>
              <div className="hint-rows">
                {[['Sales','Uses Document Check for broker notes and claim history'],['Finance','Uses Document Check for UTR reference and payment proof'],['Claims','Uses Document Check for claim form, bills, and surveyor report']].map(([team,desc])=>(
                  <div key={team} className="hint-row">
                    <div className="hint-team">{team}</div>
                    <div className="hint-desc">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 5: AI ASSISTANT ═════════════════════════════════ */}
      <section className="s5">
        <div className="s5-top">
          <div className="s5-label">AI Assistant</div>
          <h2 className="s5-title">AI helps teams <em>build the workflow,</em> not blindly control it.</h2>
          <p className="s5-sub">StratoMesh AI sits beside the workflow builder. It suggests blocks, inputs, documents, checks, owners, observers, routes, and weak points before the workflow goes live.</p>
        </div>

        <div className="builder-wrap">
          <div className="builder-grid">
            <div className="b-panel">
              <div className="b-panel-label"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Team prompt</div>
              <div className="prompt-tag">Sales team · New workflow</div>
              <div className="prompt-box">"Create a sales workflow for new broker quotation requests."</div>
              <button className="gen-btn">Generate workflow →</button>
            </div>
            <div className="b-panel">
              <div className="b-panel-label"><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Generated workflow</div>
              <div className="wf-blocks">
                {[
                  {label:'Request Intake',       hl:false, icon:<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></>},
                  {label:'New Company Check',    hl:false, icon:<><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></>},
                  {label:'Document Check',       hl:true,  icon:<><path d="M9 12l2 2 4-4"/><path d="M14 3H7a2 2 0 0 0-2 2v14h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></>},
                  {label:'Risk Check',           hl:false, icon:<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></>},
                  {label:'Underwriting Handoff', hl:false, icon:<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></>},
                ].map(({label,hl,icon},i,arr)=>(
                  <div key={label}>
                    <div className={`wfb${hl?' highlight':''}`}><svg viewBox="0 0 24 24">{icon}</svg>{label}</div>
                    {i < arr.length-1 && <div className="wf-connector">↓</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="b-panel">
              <div className="b-panel-label"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>AI suggestions</div>
              <div className="ai-suggestions">
                {['Add Claim History Check before Risk Check','Add Sales Manager as observer','Route missing docs back to Broker','Add Month-End Priority tag','Set SLA: 2 days on Risk Check'].map(s=>(
                  <div key={s} className="ai-sug"><div className="ai-sug-dot"/><div className="ai-sug-text">{s}</div></div>
                ))}
              </div>
              <div className="ai-note">AI gives a better starting point. Team lead approves, edits, or disables before going live.</div>
            </div>
          </div>
        </div>

        <div className="caps-grid">
          {AI_CAPS.map(({text,icon})=>(
            <div key={text} className="cap-card">
              <div className="cap-icon"><svg viewBox="0 0 24 24">{icon}</svg></div>
              <div className="cap-text">{text}</div>
            </div>
          ))}
        </div>

        <div className="strong-line">
          <em>AI gives the team a better starting point.</em> The team lead approves, edits, disables, or routes the final workflow. AI suggests. Humans decide.
        </div>
      </section>

      {/* ══ SECTION 6: MANAGER DASHBOARD ════════════════════════════ */}
      <section className="s6">
        <div className="s6-inner">
          <div>
            <div className="s6-label">Manager Dashboard</div>
            <h2 className="s6-title">Managers see the line, the blocker, <em>and the business impact.</em></h2>
            <p className="s6-sub">Every workflow block feeds the manager dashboard — showing where work is stuck, who owns it, and how it affects premium closure, policy issuance, claims, and monthly targets.</p>
            <div className="s6-points">
              {['Live pipeline value, closed premium, and at-risk premium in one view','Team-wise blockers with responsible owner and observer visibility','SLA breach alerts and month-end closure risk indicator','AI manager insight linking workflow fix to business unblock'].map(p=>(
                <div key={p} className="s6-point"><div className="s6-point-dot"/><div className="s6-point-text">{p}</div></div>
              ))}
            </div>
            <div className="s6-stats">
              {[{label:'Closed premium',val:'₹6.8 Cr',cls:'green'},{label:'Premium at risk',val:'₹1.1 Cr',cls:'red'},{label:'Pipeline value',val:'₹2.4 Cr',cls:'blue'},{label:'SLA breaches',val:'14',cls:'amber'}].map(({label,val,cls})=>(
                <div key={label} className="s6stat"><div className="s6stat-label">{label}</div><div className={`s6stat-val ${cls}`}>{val}</div></div>
              ))}
            </div>
          </div>

          <div>
            <div className="screen-frame">
              <div className="screen-bar">
                <div className="screen-dot" style={{background:'#EF4444'}}/>
                <div className="screen-dot" style={{background:'#F59E0B'}}/>
                <div className="screen-dot" style={{background:'#10B981'}}/>
                <span className="screen-bar-title">StratoMesh — Senior Manager Pipeline</span>
              </div>
              <div className="screen-inner">
                <div className="dash-topbar">
                  <div className="dash-title">Senior Manager — June 2025 Pipeline View</div>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <span className="dash-meta">Last updated: 2 mins ago</span>
                    <span className="dash-badge">Month-end closure risk: High</span>
                  </div>
                </div>
                <div className="metrics-grid">
                  <div className="mc"><div className="mc-lbl">Monthly target</div><div className="mc-val">₹10 Cr</div><div className="mc-sub">June 2025</div></div>
                  <div className="mc"><div className="mc-lbl">Closed premium</div><div className="mc-val mc-val-green">₹6.8 Cr</div><div className="mc-sub">68% of target</div><div className="mc-bar"><div className="mc-bar-fill" style={{width:'68%',background:'#059669'}}/></div></div>
                  <div className="mc"><div className="mc-lbl">Pipeline value</div><div className="mc-val mc-val-blue">₹2.4 Cr</div><div className="mc-sub">Active cases</div><div className="mc-bar"><div className="mc-bar-fill" style={{width:'24%',background:'#2563EB'}}/></div></div>
                  <div className="mc"><div className="mc-lbl">Premium at risk</div><div className="mc-val mc-val-red">₹1.1 Cr</div><div className="mc-sub">Blocked/delayed</div><div className="mc-bar"><div className="mc-bar-fill" style={{width:'11%',background:'#DC2626'}}/></div></div>
                </div>
                <div className="row2">
                  <div className="mc2">
                    <div className="mc2-lbl">Team-wise blockers</div>
                    {[['Underwriting','₹65L blocked','r'],['Finance','₹42L blocked','r'],['Policy Issuance','₹28L delayed','a'],['Claims','₹18L pending','a']].map(([t,v,c])=>(
                      <div key={t} className="mc2-row"><span className="mc2-team">{t}</span><span className={`mc2-val mc2-val-${c}`}>{v}</span></div>
                    ))}
                  </div>
                  <div className="mc2">
                    <div className="mc2-lbl">Pipeline status</div>
                    {[['Pending policies','32','r'],['Pending claims','18','a'],['SLA breaches','14','r'],['Quotes pending','9','a']].map(([t,v,c])=>(
                      <div key={t} className="mc2-row"><span className="mc2-team">{t}</span><span className={`mc2-val mc2-val-${c}`}>{v}</span></div>
                    ))}
                  </div>
                </div>
                <div className="tbl-lbl">Active blockers — high value cases</div>
                <table className="dtbl">
                  <thead><tr><th>Case</th><th>Current block</th><th>Owner</th><th>Blocker</th><th>Value</th><th>SLA</th></tr></thead>
                  <tbody>
                    {[
                      ['ABC Mfg',   'Underwriting',   'UW Team',   'Claim history missing',   '₹42L','#DC2626','Breached'],
                      ['Delta Ltd', 'Finance Recon',  'Finance',   'UTR mismatch',            '₹18L','#D97706','Due today'],
                      ['Nova Corp', 'Policy Issuance','Ops',       'QA correction pending',   '₹25L','#D97706','1 day left'],
                      ['Prism Ind.','Risk Check',     'Sales Lead','High-risk industry flag', '₹31L','#059669','2 days left'],
                    ].map(([name,block,owner,blocker,val,slaColor,slaText])=>(
                      <tr key={name}>
                        <td><b>{name}</b></td>
                        <td><span className="btag">{block}</span></td>
                        <td>{owner}</td>
                        <td><span className="btext">{blocker}</span></td>
                        <td><b>{val}</b></td>
                        <td><span className="sla-dot" style={{background:slaColor}}/><span style={{fontSize:'8.5px',color:slaColor}}>{slaText}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="ai-bar">
                  <div className="ai-ico"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                  <div>
                    <div className="ai-lbl">AI Manager Insight</div>
                    <div className="ai-txt">11 high-value cases delayed because claim history is checked too late. Adding Claim History Check before Underwriting Handoff could unblock ₹65L.</div>
                  </div>
                </div>
              </div>
              <div className="screen-bottom">StratoMesh · Manager View · AWS Aurora DSQL</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 7: THREE CARDS ══════════════════════════════════ */}
      <section className="s7">
        <div className="s7-head">
          <div className="s7-section-label"><span>Our Platform</span></div>
          <h2>Built for Every Role in <em>Commercial Insurance.</em></h2>
          <p>StratoMesh gives client companies, brokers, and insurers a dedicated operating layer — replacing scattered emails, spreadsheets, and external tools with one structured workflow platform.</p>
          <span className="s7-pill">Every policy journey keeps its full history — from first request to quote, issuance, renewal, claim, and future decisions.</span>
        </div>

        <div className="s7-cards">
          {S7_CARDS.map(({variant,icon,label,title,desc,points,cta,email})=>(
            <div key={variant} className={`s7card s7card-${variant}`}>
              <div className={`s7-icon-box icon-${variant}`}>
                <i className={icon} aria-hidden="true"/>
              </div>
              <div className={`s7-card-label s7-label-${variant}`}>{label}</div>
              <div className="s7-card-title">{title}</div>
              <div className="s7-card-desc">{desc}</div>
              <div className="s7-divider"/>
              <ul className="s7-points">
                {points.map(p=>(
                  <li key={p}><span className={`s7-arrow arr-${variant}`}>→</span>{p}</li>
                ))}
              </ul>
              <button className={`s7-cta-btn btn-${variant}`} onClick={()=>sendInterest(email)}>{cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Toast */}
      <div className={`p2-toast${toast?' show':''}`}>Opening your email client…</div>
    </>
  );
}
