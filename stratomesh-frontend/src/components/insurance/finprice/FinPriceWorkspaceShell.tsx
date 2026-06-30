"use client";

import { Suspense, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FinPriceReceivedDesk from "./FinPriceReceivedDesk";
import type { FinPriceInboxItem } from "./FinPriceReceivedDesk";
import FinPriceWorkingSpace from "./FinPriceWorkingSpace";
import type { FinPriceWorkspaceBox } from "./FinPriceWorkingSpace";
import FinPriceCommunicationFlow from "./FinPriceCommunicationFlow";
import FinPriceAddBoxPanel from "./FinPriceAddBoxPanel";
import type { FinPriceBoxTemplate } from "./FinPriceAddBoxPanel";
import {
  addFinPriceActionBlock,
  buildFinPriceAddBlockPayload,
  fetchFinPriceCaseDetail,
  fetchFinPriceTeamCases,
  mapBackendCaseToFinPriceInboxItem,
  progressFinPriceCase,
} from "../../../lib/finprice-api";
import type { FinPriceTeamSlug } from "../../../lib/finprice-api";

type TabKey = "received" | "workspace" | "communication";

type PipelineStep = {
  team: string;
  status: "COMPLETED" | "CURRENT" | "WAITING" | "BLOCKED";
};

type Props = {
  teamSlug: FinPriceTeamSlug;
  teamName: string;
  teamKicker: string;
  heading: string;
  subheading: string;
  receivedDeskTitle: string;
  receivedDeskDescription: string;
  filterChips: string[];
  fallbackInboxItems?: FinPriceInboxItem[];
  boxTemplates: FinPriceBoxTemplate[];
  amountLabelTitle: string;
  statusLabelTitle: string;
  pipelineSteps: PipelineStep[];
};

function FinPriceWorkspaceShellContent({
  teamSlug,
  teamName,
  heading,
  receivedDeskTitle,
  receivedDeskDescription,
  filterChips,
  fallbackInboxItems = [],
  boxTemplates,
  amountLabelTitle,
  statusLabelTitle,
  pipelineSteps,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const journey = searchParams.get("journey") || "happy-new-policy";
  const layer = searchParams.get("layer") || "insurance-company";
  const name = searchParams.get("name") || "khushboo";

  const [activeTab, setActiveTab] = useState<TabKey>("received");
  const [inboxItems, setInboxItems] =
    useState<FinPriceInboxItem[]>(fallbackInboxItems);
  const [activeItem, setActiveItem] = useState<FinPriceInboxItem | null>(null);
  const [activeCaseDetail, setActiveCaseDetail] = useState<any | null>(null);
  const [boxes, setBoxes] = useState<FinPriceWorkspaceBox[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [loadingCaseDetail, setLoadingCaseDetail] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBoxType, setSelectedBoxType] = useState("");
  const [addingBoxType, setAddingBoxType] = useState("");

  useEffect(() => {
    loadTeamQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamSlug]);

  async function loadTeamQueue() {
    try {
      setLoadingQueue(true);
      setErrorMessage("");

      const response = await fetchFinPriceTeamCases(teamSlug);

      const mappedItems = (response.data || []).map((item) =>
        mapBackendCaseToFinPriceInboxItem(item, teamSlug)
      );

      setInboxItems(mappedItems);

      if (activeItem) {
        const refreshedActiveItem = mappedItems.find(
          (item) => item.caseId === activeItem.caseId
        );

        if (refreshedActiveItem) {
          setActiveItem(refreshedActiveItem);
        }
      }
    } catch (error) {
      console.error("Failed to load FinPrice queue", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load received cases from backend."
      );

      if (!inboxItems.length && fallbackInboxItems.length) {
        setInboxItems(fallbackInboxItems);
      }
    } finally {
      setLoadingQueue(false);
    }
  }

  async function handleSendToWorkspace(item: FinPriceInboxItem) {
    try {
      setActiveItem(item);
      setActiveTab("workspace");
      setLoadingCaseDetail(true);
      setErrorMessage("");
      setBoxes([]);

      const response = await fetchFinPriceCaseDetail(item.caseId);

      setActiveCaseDetail(response.data);
    } catch (error) {
      console.error("Failed to open case detail", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to open full case detail."
      );
      setActiveCaseDetail(null);
    } finally {
      setLoadingCaseDetail(false);
    }
  }

  function handleAddBox(template: FinPriceBoxTemplate) {
    if (!activeItem) {
      return;
    }

    setSelectedBoxType(template.boxType);
    setAddingBoxType(template.boxType);

    const draftBox: FinPriceWorkspaceBox = {
      id: `${template.boxType}-${Date.now()}`,
      boxType: template.boxType,
      name: template.name,
      description: template.description,
      decision: template.decisionOptions[0] || "DRAFT",
      targetTeam: template.targetTeams[0] || "next-team",
      comment: "",
      tags: template.tagOptions.slice(0, 3),
      attachments: [],
      primaryAction: template.primaryAction,
    };

    setBoxes((previousBoxes) => [...previousBoxes, draftBox]);

    window.setTimeout(() => {
      setAddingBoxType("");
    }, 250);
  }

  function handleUpdateBox(
    boxId: string,
    updates: Partial<FinPriceWorkspaceBox>
  ) {
    setBoxes((previousBoxes) =>
      previousBoxes.map((box) =>
        box.id === boxId
          ? {
              ...box,
              ...updates,
            }
          : box
      )
    );
  }

  async function handleSaveBox(box: FinPriceWorkspaceBox) {
    if (!activeItem?.caseId) {
      setErrorMessage("Open a case before saving a decision box.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const payload = buildFinPriceAddBlockPayload({
        teamSlug,
        box,
        existingBlockCount: getExistingTeamBlockCount(),
        actionMode: "draft",
      });

      const response = await addFinPriceActionBlock(activeItem.caseId, payload);
      const createdBlock = response.data?.createdBlock || response.data;

      const savedBlockId = createdBlock?.id;

      if (savedBlockId) {
        setBoxes((previousBoxes) =>
          previousBoxes.map((item) =>
            item.id === box.id
              ? {
                  ...item,
                  savedBlockId,
                }
              : item
          )
        );
      }

      await refreshActiveCaseDetail(activeItem.caseId);
    } catch (error) {
      console.error("Failed to save FinPrice box", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save decision box."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRunBoxAction(box: FinPriceWorkspaceBox) {
    if (!activeItem?.caseId) {
      setErrorMessage("Open a case before running an action.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const payload = buildFinPriceAddBlockPayload({
        teamSlug,
        box,
        existingBlockCount: getExistingTeamBlockCount(),
        actionMode: "action",
      });

      const response = await addFinPriceActionBlock(activeItem.caseId, payload);
      const createdBlock = response.data?.createdBlock || response.data;
      const createdBlockId = createdBlock?.id;

      if (createdBlockId) {
        setBoxes((previousBoxes) =>
          previousBoxes.map((item) =>
            item.id === box.id
              ? {
                  ...item,
                  savedBlockId: createdBlockId,
                }
              : item
          )
        );

        await progressFinPriceCase(activeItem.caseId, createdBlockId);
      } else {
        await progressFinPriceCase(activeItem.caseId);
      }

      await refreshActiveCaseDetail(activeItem.caseId);
      await loadTeamQueue();

      setActiveTab("communication");
    } catch (error) {
      console.error("Failed to run FinPrice action", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to run decision action."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePrimaryAction() {
    if (!activeItem?.caseId) {
      setErrorMessage("Open a case before sending forward.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const lastSavedBox = [...boxes].reverse().find((box) => box.savedBlockId);

      await progressFinPriceCase(activeItem.caseId, lastSavedBox?.savedBlockId);

      await refreshActiveCaseDetail(activeItem.caseId);
      await loadTeamQueue();

      setActiveTab("communication");
    } catch (error) {
      console.error("Failed to progress FinPrice case", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send case forward."
      );
    } finally {
      setSaving(false);
    }
  }

  async function refreshActiveCaseDetail(caseId: string) {
    const response = await fetchFinPriceCaseDetail(caseId);
    setActiveCaseDetail(response.data);
  }

  function getExistingTeamBlockCount() {
    const blocksByTeam = activeCaseDetail?.blocksByTeam || {};
    const teamBlocks = blocksByTeam[teamSlug] || [];

    return Array.isArray(teamBlocks) ? teamBlocks.length : 0;
  }
function handleRoleChange(nextTeam: string) {
  if (nextTeam === "sales") {
    router.push(
      `/platform/insurance-company/intake?journey=${journey}&layer=${layer}&team=sales&name=${encodeURIComponent(
        name
      )}`
    );
    return;
  }

  if (nextTeam === "management") {
    router.push(
      `/platform/insurance-company/manager?journey=${journey}&layer=${layer}&team=management&name=${encodeURIComponent(
        name
      )}`
    );
    return;
  }

  router.push(
    `/platform/insurance-company/teams/${nextTeam}?journey=${journey}&layer=${layer}&team=${nextTeam}&name=${encodeURIComponent(
      name
    )}`
  );
}
  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.kicker}>STRATOMESH WORKSPACE</p>

          <h1 style={styles.heading}>{heading}</h1>

          <p style={styles.agenda}>
            Agenda:{" "}
            <span>
              {teamName === "Pricing"
                ? "New Business / Quote Calculation"
                : "Premium / Payment Clearance"}
            </span>
            {"  ·  "}
            <span>{activeItem?.clientName || "No active package"}</span>
            {"  ·  "}
            <strong>{activeItem?.amountLabel || "Pending"}</strong>
          </p>
        </div>

        <div style={styles.userBox}>
          <div style={styles.userText}>
            <strong>khushboo</strong>
            <span>Demo user</span>
          </div>

          <select
            value={teamSlug}
            onChange={(event) => handleRoleChange(event.target.value)}
            style={styles.roleSelect}
          >
            <option value="sales">Sales</option>
            <option value="underwriting">Underwriting</option>
            <option value="pricing">Pricing</option>
            <option value="finance">Finance</option>
            <option value="claims">Claims</option>
            <option value="management">Management</option>
          </select>
        </div>
      </section>

      <nav style={styles.tabs}>
        <button
          type="button"
          style={activeTab === "received" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("received")}
        >
          Send / Receive Desk
        </button>

        <button
          type="button"
          style={activeTab === "workspace" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("workspace")}
        >
          Working Space
        </button>

        <button
          type="button"
          style={activeTab === "communication" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("communication")}
        >
          Communication Flow
        </button>
      </nav>

      {activeTab === "received" && (
        <section style={styles.content}>
          <FinPriceReceivedDesk
            title={receivedDeskTitle}
            description={receivedDeskDescription}
            filterChips={filterChips}
            items={inboxItems}
            loading={loadingQueue}
            errorMessage={errorMessage}
            activeItemId={activeItem?.id}
            amountLabelTitle={amountLabelTitle}
            statusLabelTitle={statusLabelTitle}
            onRefresh={loadTeamQueue}
            onSendToWorkspace={handleSendToWorkspace}
          />
        </section>
      )}

      {activeTab === "workspace" && (
        <section style={styles.workspaceGrid}>
          <div style={styles.leftColumn}>
            {errorMessage && (
              <div style={styles.errorBox}>
                <strong>Action error</strong>
                <span>{errorMessage}</span>
              </div>
            )}

            <FinPriceWorkingSpace
              teamName={teamName}
              activeItem={activeItem}
              activeCaseDetail={activeCaseDetail}
              boxes={boxes}
              saving={saving}
              loadingCaseDetail={loadingCaseDetail}
              onUpdateBox={handleUpdateBox}
              onSaveBox={handleSaveBox}
              onRunBoxAction={handleRunBoxAction}
              onPrimaryAction={handlePrimaryAction}
            />
          </div>

          <aside style={styles.rightColumn}>
            <FinPriceAddBoxPanel
              templates={boxTemplates}
              saving={saving}
              hasActiveItem={Boolean(activeItem)}
              selectedBoxType={selectedBoxType}
              addingBoxType={addingBoxType}
              onAddBox={handleAddBox}
            />
          </aside>
        </section>
      )}

      {activeTab === "communication" && (
        <section style={styles.content}>
          {errorMessage && (
            <div style={styles.errorBox}>
              <strong>Communication error</strong>
              <span>{errorMessage}</span>
            </div>
          )}

          <FinPriceCommunicationFlow
            teamName={teamName}
            activeItem={activeItem}
            boxes={boxes}
            pipelineSteps={pipelineSteps}
          />
        </section>
      )}
    </main>
  );
}

export default function FinPriceWorkspaceShell(props: Props) {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            background: "#f8fafc",
            color: "#0f172a",
            padding: "24px 28px",
          }}
        >
          <section
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "24px",
              background: "#ffffff",
              padding: "24px",
              fontSize: "14px",
              fontWeight: 800,
            }}
          >
            Loading workspace...
          </section>
        </main>
      }
    >
      <FinPriceWorkspaceShellContent {...props} />
    </Suspense>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
    background: "#ffffff",
    padding: "20px 28px 16px",
    borderBottom: "1px solid #e2e8f0",
  },

  kicker: {
    margin: 0,
    color: "#b45309",
    fontSize: "13px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.32em",
  },

  heading: {
    margin: "8px 0 0",
    fontSize: "34px",
    fontWeight: 950,
    color: "#020817",
    letterSpacing: "-0.04em",
  },

  agenda: {
    margin: "8px 0 0",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 900,
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#020817",
    fontSize: "13px",
  },

  userText: {
    display: "grid",
    justifyItems: "end",
    lineHeight: 1.2,
  },

  roleSelect: {
    minWidth: "150px",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    background: "#ffffff",
    padding: "12px 14px",
    color: "#0f172a",
    fontWeight: 900,
    outline: "none",
    opacity: 1,
  },

  tabs: {
    display: "flex",
    gap: "10px",
    background: "#ffffff",
    padding: "0 28px 16px",
    borderBottom: "1px solid #e2e8f0",
    marginBottom: "0",
  },

  tab: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#f1f5f9",
    color: "#334155",
    padding: "11px 18px",
    fontWeight: 950,
    cursor: "pointer",
  },

  activeTab: {
    border: "1px solid #020817",
    borderRadius: "12px",
    background: "#020817",
    color: "#ffffff",
    padding: "11px 18px",
    fontWeight: 950,
    cursor: "pointer",
  },

  content: {
    padding: "24px 28px",
  },

  workspaceGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 390px",
    gap: "18px",
    alignItems: "start",
    padding: "24px 28px",
  },

  leftColumn: {
    minWidth: 0,
    display: "grid",
    gap: "16px",
  },

  rightColumn: {
    position: "sticky",
    top: "24px",
    border: "1px solid #dbeafe",
    borderRadius: "24px",
    background: "#ffffff",
    padding: "20px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.09)",
  },

  errorBox: {
    border: "1px solid #fed7aa",
    borderRadius: "16px",
    background: "#fff7ed",
    color: "#9a3412",
    padding: "14px 16px",
    display: "grid",
    gap: "4px",
    fontSize: "13px",
    fontWeight: 800,
  },
};