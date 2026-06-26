"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import UnderwritingReceivedCases from "./UnderwritingReceivedCases";
import SalesInputReview from "./SalesInputReview";
import UnderwritingRouteDecision from "./UnderwritingRouteDecision";

import {
  addCaseBlock,
  getCaseDetail,
  getTeamCases,
  progressCase,
  updateCaseBlock,
} from "../../../lib/insurance-team-api";

import {
  type UnderwritingBoxTemplate,
  buildAddUnderwritingBlockPayload,
  buildUnderwritingAcceptPayload,
  buildUnderwritingQuestionPayload,
  buildUnderwritingSavePayload,
  getUnderwritingActiveBlock,
} from "../../../lib/underwriting-workspace";

import { getDemoSession, setDemoSession } from "../../../lib/demo-session";

type TabKey = "received" | "workspace" | "communication";

type DraftBox = {
  id: string;
  template: UnderwritingBoxTemplate;
};

const ACTIVE_DEMO_CASE_ID = "";

const teams = [
  { value: "sales", label: "Sales" },
  { value: "underwriting", label: "Underwriting" },
  { value: "pricing", label: "Pricing" },
  { value: "finance", label: "Finance" },
  { value: "policy-issuance", label: "Policy Issuance" },
  { value: "claims", label: "Claims" },
  { value: "management", label: "Management / Compliance" },
];

export default function UnderwritingWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const journey = searchParams.get("journey") || "happy-new-policy";

  const [activeTab, setActiveTab] = useState<TabKey>("received");

  const [name, setName] = useState("Demo User");
  const [agendaLabel, setAgendaLabel] = useState("New Business / New Policy");
  const [scenarioName, setScenarioName] = useState("Sunrise Foods Insurance");
  const [selectedTeam, setSelectedTeam] = useState("underwriting");

  const [cases, setCases] = useState<any[]>([]);
  const [caseDetail, setCaseDetail] = useState<any>(null);

  const [draftBoxes, setDraftBoxes] = useState<DraftBox[]>([]);

  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedBoxType, setSelectedBoxType] = useState("");
  const [addingBoxType, setAddingBoxType] = useState("");

  useEffect(() => {
    const session = getDemoSession();

    setName(session.userName || "Demo User");
    setAgendaLabel(session.agendaLabel || "New Business / New Policy");
    setScenarioName(session.scenarioName || "Sunrise Foods Insurance");
    setSelectedTeam(session.role || "underwriting");
  }, []);

  useEffect(() => {
    loadUnderwritingCases();
  }, []);

  function handleRoleChange(team: string) {
    setSelectedTeam(team);

    const session = getDemoSession();

    setDemoSession({
      ...session,
      role: team,
    });

    if (team === "sales") {
      router.push(
        `/platform/insurance-company/intake?journey=${journey}&layer=insurance-company&team=sales&name=${encodeURIComponent(
          name
        )}`
      );
      return;
    }

    router.push(
      `/platform/insurance-company/teams/${team}?journey=${journey}&layer=insurance-company&team=${team}&name=${encodeURIComponent(
        name
      )}`
    );
  }

  async function loadUnderwritingCases() {
    try {
      setLoadingCases(true);
      setMessage("");

      const response: any = await getTeamCases("underwriting");

      const receivedCases = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.cases)
          ? response.cases
          : Array.isArray(response)
            ? response
            : [];

      setCases(receivedCases);

      const session = getDemoSession();
      const activeCaseId =
        session.activeCaseId || localStorage.getItem("activeCaseId") || "";

      if (activeCaseId) {
        const matchedCase = receivedCases.find((item: any) => item.id === activeCaseId);

        if (matchedCase) {
          await openWorkspace(activeCaseId);
        }
      }

      if (!receivedCases.length) {
        setMessage("No underwriting queue item found yet.");
      }
    } catch (error: any) {
      setMessage(error?.message || "Failed to load underwriting cases.");
    } finally {
      setLoadingCases(false);
    }
  }

async function openWorkspace(caseId: string) {
  try {
    setLoadingWorkspace(true);
    setMessage("");

    localStorage.setItem("activeCaseId", caseId);

    setDemoSession({
      activeCaseId: caseId,
      role: "underwriting",
    });

    const response: any = await getCaseDetail(caseId);

    setCaseDetail(response?.data || response);
    setDraftBoxes([]);
    setActiveTab("workspace");
  } catch (error: any) {
    setMessage(error?.message || "Failed to open underwriting workspace.");
  } finally {
    setLoadingWorkspace(false);
  }
}

 async function openActiveDemoCase() {
  const session = getDemoSession();

  const activeCaseId =
    session.activeCaseId ||
    localStorage.getItem("activeCaseId") ||
    ACTIVE_DEMO_CASE_ID;

  if (!activeCaseId) {
    setMessage("No active demo case selected. Please choose Happy or Claim card first.");
    return;
  }

  await openWorkspace(activeCaseId);
}

  function handleAddUnderwritingBlock(template: UnderwritingBoxTemplate) {
    if (!caseDetail?.id) {
      setMessage("Open a case before adding a workspace box.");
      return;
    }

    setSelectedBoxType(template.boxType);
    setAddingBoxType(template.boxType);

    setDraftBoxes((current) => [
      ...current,
      {
        id: `${template.boxType}-${Date.now()}`,
        template,
      },
    ]);

    setMessage(`${template.name} added to draft canvas.`);

    window.setTimeout(() => {
      setAddingBoxType("");
    }, 350);
  }

  async function persistDraftBoxes(status: "IN_PROGRESS" | "COMPLETED") {
    if (!caseDetail?.id) {
      setMessage("Open a case first.");
      return false;
    }

    const existingBlocks = caseDetail?.blocksByTeam?.underwriting || [];

    for (let index = 0; index < draftBoxes.length; index += 1) {
      const draft = draftBoxes[index];
      const nextOrder = existingBlocks.length + index + 1;
      const payload = buildAddUnderwritingBlockPayload(
        draft.template,
        nextOrder
      );

      await addCaseBlock(caseDetail.id, {
        ...payload,
        status,
      });
    }

    return true;
  }

  async function handleSaveReview() {
    if (!caseDetail?.id) {
      setMessage("Open a case first.");
      return;
    }

    const activeBlock = getUnderwritingActiveBlock(caseDetail);

    try {
      setSaving(true);
      setMessage("");

      if (draftBoxes.length) {
        await persistDraftBoxes("IN_PROGRESS");
        setDraftBoxes([]);
      }

      if (activeBlock?.id) {
        await updateCaseBlock(
          caseDetail.id,
          activeBlock.id,
          buildUnderwritingSavePayload(activeBlock)
        );
      }

      setMessage("Underwriting draft saved.");
      await openWorkspace(caseDetail.id);
    } catch (error: any) {
      setMessage(error?.message || "Failed to save underwriting review.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAcceptPackage() {
    if (!caseDetail?.id) {
      setMessage("Open a case first.");
      return;
    }

    const activeBlock = getUnderwritingActiveBlock(caseDetail);

    try {
      setSaving(true);
      setMessage("");

      if (draftBoxes.length) {
        await persistDraftBoxes("COMPLETED");
        setDraftBoxes([]);
      }

      if (activeBlock?.id) {
        await updateCaseBlock(
          caseDetail.id,
          activeBlock.id,
          buildUnderwritingAcceptPayload()
        );

        await progressCase(caseDetail.id, activeBlock.id);
      } else {
        await progressCase(caseDetail.id);
      }

      setMessage("Underwriting package sent to Pricing.");
      await openWorkspace(caseDetail.id);
    } catch (error: any) {
      setMessage(error?.message || "Failed to send underwriting package.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendBackToSourceTeam() {
    if (!caseDetail?.id) {
      setMessage("Open a case first.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await addCaseBlock(
        caseDetail.id,
        buildUnderwritingQuestionPayload({
          sourceTeam: "sales",
          sourceBox: "Received Package",
          sourceItem: "Received package input/config",
          sourceStatus: "OBSERVE",
          underwritingDecision: "QUESTIONED",
          underwritingComment:
            "Underwriting did not accept part of the received package and is sending clarification back to the source team.",
        })
      );

      setMessage("Clarification package created for source team.");
      await openWorkspace(caseDetail.id);
    } catch (error: any) {
      setMessage(error?.message || "Failed to create clarification package.");
    } finally {
      setSaving(false);
    }
  }

  const salesBlocks = caseDetail?.blocksByTeam?.sales || [];
  const underwritingBlocks = caseDetail?.blocksByTeam?.underwriting || [];
  const activeUnderwritingBlock = getUnderwritingActiveBlock(caseDetail);

  return (
    <main style={styles.page}>
      <header style={styles.topHeader}>
        <div style={styles.headerInner}>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.workspaceLabel}>StratoMesh Workspace</div>

              <h1 style={styles.title}>Underwriting Workforce Dashboard</h1>

              <div style={styles.metaLine}>
                <span style={styles.metaStrong}>Agenda:</span>
                <span>{agendaLabel}</span>
                <span style={styles.dot}>•</span>
                <span>{scenarioName}</span>
                <span style={styles.dot}>•</span>
                <span style={styles.metaStrong}>Premium ₹18L</span>
              </div>
            </div>

            <div style={styles.userBox}>
              <div style={{ textAlign: "right" }}>
                <div style={styles.userName}>{name}</div>
                <div style={styles.demoLabel}>Demo user</div>
              </div>

              <select
                value={selectedTeam}
                onChange={(event) => handleRoleChange(event.target.value)}
                style={styles.teamSelect}
              >
                {teams.map((team) => (
                  <option key={team.value} value={team.value}>
                    {team.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.tabs}>
            <button
              style={activeTab === "received" ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab("received")}
            >
              Received Cases
            </button>

            <button
              style={activeTab === "workspace" ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab("workspace")}
            >
              Working Space
            </button>

            <button
              style={
                activeTab === "communication" ? styles.activeTab : styles.tab
              }
              onClick={() => setActiveTab("communication")}
            >
              Communication Flow
            </button>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {message && <div style={styles.message}>{message}</div>}

        {activeTab === "received" && (
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Received Cases</h2>
                <p style={styles.panelText}>
                  Team packages received for Underwriting review.
                </p>
              </div>

              <button
                style={styles.secondaryButton}
                onClick={openActiveDemoCase}
              >
                Open Active Case
              </button>
            </div>

            <UnderwritingReceivedCases
              cases={cases}
              loading={loadingCases}
              onOpenCase={openWorkspace}
            />
          </section>
        )}

        {activeTab === "workspace" && (
          <section style={styles.workspaceGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeader}>
                <div>
                  <h2 style={styles.panelTitle}>Working Space</h2>
                  <p style={styles.panelText}>
                    Review the received package, add workspace boxes, then send
                    the underwriting package.
                  </p>
                </div>

                {loadingWorkspace && <span>Loading workspace...</span>}
              </div>

              {!caseDetail ? (
                <div style={styles.emptyState}>
                  <p>No case opened yet.</p>
                  <button
                    style={styles.primaryButton}
                    onClick={openActiveDemoCase}
                  >
                    Open Active Case
                  </button>
                </div>
              ) : (
                <>
                  <section style={styles.caseSummary}>
                    <p style={styles.kicker}>CASE DETAIL</p>
                    <h3 style={{ margin: "6px 0" }}>{caseDetail.title}</h3>
                    <p>
                      Case Code: <strong>{caseDetail.caseCode || "-"}</strong>
                    </p>
                    <p>
                      Current Underwriting Block:{" "}
                      <strong>{activeUnderwritingBlock?.name || "-"}</strong>
                    </p>
                  </section>

                  <SalesInputReview
                    receivedBlocks={salesBlocks}
                    sourceTeam="Sales"
                    reviewingTeam="underwriting"
                    caseDetail={caseDetail}
                  />

                  <section style={styles.canvasSection}>
                    <div style={styles.canvasHeader}>
                      <div>
                        <h2 style={styles.canvasTitle}>
                          Underwriting Crafting Canvas
                        </h2>
                        <p style={styles.canvasText}>
                          Add boxes required for Pricing, Finance, Sales
                          clarification, or Manager visibility.
                        </p>
                      </div>

                      <span style={styles.draftBadge}>Draft mode</span>
                    </div>

                    <div style={styles.canvasBlocks}>
                      {underwritingBlocks.map((block: any) => (
                        <article key={block.id} style={styles.canvasBlock}>
                          <h3 style={styles.canvasBlockTitle}>{block.name}</h3>
                          <p style={styles.canvasBlockText}>
                            {block?.config?.blockReason ||
                              block?.comments ||
                              "Saved underwriting workspace block."}
                          </p>
                        </article>
                      ))}

                      {draftBoxes.map((draft) => (
                        <article key={draft.id} style={styles.draftBlock}>
                          <h3 style={styles.canvasBlockTitle}>
                            {draft.template.name}
                          </h3>
                          <p style={styles.canvasBlockText}>
                            {draft.template.description}
                          </p>
                          <span style={styles.localBadge}>
                            Local draft · not sent yet
                          </span>
                        </article>
                      ))}

                      {!underwritingBlocks.length && !draftBoxes.length && (
                        <div style={styles.emptyCanvas}>
                          No underwriting boxes added yet. Use Add to Workspace
                          on the right.
                        </div>
                      )}
                    </div>

                    <div style={styles.workspaceActions}>
                      <button
                        type="button"
                        disabled={saving || !caseDetail?.id}
                        onClick={handleSaveReview}
                        style={styles.secondaryButton}
                      >
                        Save Draft
                      </button>

                      <button
                        type="button"
                        disabled={saving || !caseDetail?.id}
                        onClick={handleAcceptPackage}
                        style={styles.primaryButton}
                      >
                        Accept Package & Send to Pricing
                      </button>

                      <button
                        type="button"
                        disabled={saving || !caseDetail?.id}
                        onClick={handleSendBackToSourceTeam}
                        style={styles.warningButton}
                      >
                        Send Back to Source Team
                      </button>
                    </div>
                  </section>
                </>
              )}
            </div>

            <aside style={styles.sidePanel}>
              <UnderwritingRouteDecision
                saving={saving}
                hasCaseOpen={Boolean(caseDetail?.id)}
                selectedBoxType={selectedBoxType}
                addingBoxType={addingBoxType}
                onAddBlock={handleAddUnderwritingBlock}
              />
            </aside>
          </section>
        )}

        {activeTab === "communication" && (
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Communication Flow</h2>
                <p style={styles.panelText}>
                  Underwriting is internal. Broker-facing wording stays
                  controlled through the source/relationship team.
                </p>
              </div>

              <span style={styles.badge}>Internal-safe view</span>
            </div>

            <div style={styles.flow}>
              {["Source Team", "Underwriting", "Pricing", "Finance / Policy"].map(
                (item, index) => (
                  <div key={item} style={styles.flowWrap}>
                    <div style={styles.flowBox}>
                      <strong>{item}</strong>
                      <p>
                        {item === "Underwriting"
                          ? "Risk, terms, and document dependency review"
                          : item === "Pricing"
                            ? "Quote and premium calculation"
                            : item === "Finance / Policy"
                              ? "Clearance and policy release"
                              : "Broker-safe handoff package"}
                      </p>
                    </div>

                    {index < 3 && <span style={styles.arrow}>→</span>}
                  </div>
                )
              )}
            </div>

            <div style={styles.noteBox}>
              Underwriting questions, pricing debate, manager observations, and
              waived-item discussions are internal. Broker sees only controlled
              source-team communication.
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fa",
    color: "#020817",
  },

  topHeader: {
    borderBottom: "1px solid #e2e8f0",
    background: "#ffffff",
  },

  headerInner: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "20px 24px",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
  },

  workspaceLabel: {
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.28em",
    color: "#b45309",
  },

  title: {
    margin: "8px 0 0",
    fontSize: "32px",
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: "-0.8px",
  },

  metaLine: {
    marginTop: "8px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    color: "#475569",
    fontSize: "14px",
  },

  metaStrong: {
    color: "#0f172a",
    fontWeight: 800,
  },

  dot: {
    color: "#cbd5e1",
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  userName: {
    fontSize: "14px",
    fontWeight: 900,
    color: "#020817",
  },

  demoLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b",
  },

  teamSelect: {
    height: "40px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    padding: "0 14px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#0f172a",
    outline: "none",
  },

  tabs: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  tab: {
    border: 0,
    borderRadius: "12px",
    background: "#f1f5f9",
    color: "#475569",
    padding: "10px 16px",
    fontWeight: 800,
    fontSize: "14px",
    cursor: "pointer",
  },

  activeTab: {
    border: 0,
    borderRadius: "12px",
    background: "#020817",
    color: "#fff",
    padding: "10px 16px",
    fontWeight: 900,
    fontSize: "14px",
    cursor: "pointer",
  },

  content: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "24px",
  },

  message: {
    background: "#eef6ff",
    border: "1px solid #bae6fd",
    borderRadius: "14px",
    padding: "14px 18px",
    marginBottom: "18px",
    color: "#075985",
    fontWeight: 700,
  },

  panel: {
    background: "#fff",
    border: "1px solid #dfe7ef",
    borderRadius: "28px",
    padding: "28px 32px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
  },

  panelTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 900,
  },

  panelText: {
    marginTop: "10px",
    color: "#334155",
    fontSize: "16px",
  },

  workspaceGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 0.85fr",
    gap: "20px",
    alignItems: "start",
  },

  sidePanel: {
    background: "#fff",
    border: "1px solid #dfe7ef",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
  },

  emptyState: {
    marginTop: "24px",
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "18px",
    padding: "28px",
  },

  caseSummary: {
    marginTop: "24px",
    background: "#f0f9ff",
    border: "1px solid #7dd3fc",
    borderRadius: "18px",
    padding: "18px",
  },

  kicker: {
    margin: 0,
    color: "#cc4e00",
    fontWeight: 900,
    letterSpacing: "4px",
    fontSize: "13px",
  },

  canvasSection: {
    marginTop: "24px",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
    background: "#ffffff",
  },

  canvasHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "14px",
  },

  canvasTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 900,
  },

  canvasText: {
    margin: "6px 0 0",
    color: "#475569",
    fontSize: "14px",
  },

  draftBadge: {
    background: "#fff7ed",
    color: "#c2410c",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 900,
  },

  canvasBlocks: {
    display: "grid",
    gap: "12px",
  },

  canvasBlock: {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    background: "#f8fafc",
    padding: "16px",
  },

  draftBlock: {
    border: "1px solid #0284d8",
    borderRadius: "16px",
    background: "#e0f2fe",
    padding: "16px",
    boxShadow: "0 0 0 3px rgba(2, 132, 216, 0.12)",
  },

  canvasBlockTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 900,
  },

  canvasBlockText: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  localBadge: {
    display: "inline-block",
    marginTop: "10px",
    background: "#ffffff",
    color: "#0369a1",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 900,
  },

  emptyCanvas: {
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    padding: "18px",
    color: "#64748b",
    background: "#f8fafc",
    fontWeight: 700,
  },

  workspaceActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "18px",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0",
  },

  primaryButton: {
    background: "#0284d8",
    color: "#fff",
    border: 0,
    borderRadius: "12px",
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },

  secondaryButton: {
    background: "#fff",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "12px 18px",
    fontWeight: 800,
    cursor: "pointer",
  },

  warningButton: {
    border: "1px solid #fed7aa",
    borderRadius: "12px",
    background: "#fff7ed",
    color: "#9a3412",
    padding: "12px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },

  badge: {
    background: "#f3e8ff",
    color: "#7e22ce",
    borderRadius: "999px",
    padding: "8px 14px",
    fontWeight: 900,
  },

  flow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "18px",
    alignItems: "center",
    marginTop: "34px",
  },

  flowWrap: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  flowBox: {
    background: "#f8fafc",
    border: "1px solid #dbe4ee",
    borderRadius: "18px",
    padding: "22px",
    minHeight: "110px",
    textAlign: "center",
    width: "100%",
  },

  arrow: {
    color: "#0284d8",
    fontSize: "28px",
    fontWeight: 900,
  },

  noteBox: {
    marginTop: "32px",
    background: "#fff8ea",
    borderRadius: "18px",
    padding: "22px",
    color: "#7c2d12",
    fontSize: "17px",
    lineHeight: 1.6,
  },
};