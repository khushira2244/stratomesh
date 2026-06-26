import type { CSSProperties } from "react";
import type { FinPriceInboxItem } from "./FinPriceReceivedDesk";
import type { FinPriceWorkspaceBox } from "./FinPriceWorkingSpace";

type PipelineStep = {
  team: string;
  status: "COMPLETED" | "CURRENT" | "WAITING" | "BLOCKED";
};

type Props = {
  teamName: string;
  activeItem: FinPriceInboxItem | null;
  boxes: FinPriceWorkspaceBox[];
  pipelineSteps: PipelineStep[];
};

function getStepSymbol(status: PipelineStep["status"]) {
  if (status === "COMPLETED") return "✓";
  if (status === "CURRENT") return "●";
  if (status === "BLOCKED") return "!";
  return "○";
}

export default function FinPriceCommunicationFlow({
  teamName,
  activeItem,
  boxes,
  pipelineSteps,
}: Props) {
  if (!activeItem) {
    return (
      <section style={styles.emptyState}>
        <h2 style={styles.emptyTitle}>No communication history selected</h2>
        <p style={styles.emptyText}>
          Send one item from the Send / Receive Desk to view its pipeline
          history and current case status.
        </p>
      </section>
    );
  }

  return (
    <section style={styles.wrapper}>
      <section style={styles.panel}>
        <div>
          <p style={styles.kicker}>Pipeline Map</p>
          <h2 style={styles.title}>{activeItem.clientName}</h2>
          <p style={styles.description}>
            {activeItem.requestTitle} · Current desk: {teamName}
          </p>
        </div>

        <div style={styles.pipeline}>
          {pipelineSteps.map((step, index) => (
            <div key={step.team} style={styles.pipelineItem}>
              <div
                style={{
                  ...styles.pipelineCircle,
                  ...(step.status === "COMPLETED"
                    ? styles.completedCircle
                    : {}),
                  ...(step.status === "CURRENT" ? styles.currentCircle : {}),
                  ...(step.status === "BLOCKED" ? styles.blockedCircle : {}),
                }}
              >
                {getStepSymbol(step.status)}
              </div>

              <strong style={styles.pipelineTeam}>{step.team}</strong>
              <span style={styles.pipelineStatus}>{step.status}</span>

              {index < pipelineSteps.length - 1 && (
                <div style={styles.pipelineLine} />
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={styles.grid}>
        <div style={styles.panel}>
          <p style={styles.kicker}>Timeline History</p>
          <h2 style={styles.sectionTitle}>Case Journey Events</h2>

          <div style={styles.timeline}>
            <article style={styles.timelineCard}>
              <div style={styles.timelineDot} />
              <div>
                <h3 style={styles.eventTitle}>Package received</h3>
                <p style={styles.eventMeta}>
                  Source Team: {activeItem.sourceTeam}
                </p>
                <p style={styles.eventText}>
                  {activeItem.sourceTeam} sent this package to {teamName} for
                  decision work.
                </p>
                <div style={styles.tagRow}>
                  <span style={styles.statusTag}>{activeItem.statusLabel}</span>
                  <span style={styles.statusTag}>{activeItem.priority}</span>
                </div>
              </div>
            </article>

            {boxes.map((box) => (
              <article key={box.id} style={styles.timelineCard}>
                <div style={styles.timelineDot} />
                <div>
                  <h3 style={styles.eventTitle}>{box.name}</h3>
                  <p style={styles.eventMeta}>
                    Decision: {box.decision} · Target: {box.targetTeam}
                  </p>
                  <p style={styles.eventText}>
                    {box.comment || "Decision box added without comment yet."}
                  </p>

                  <div style={styles.tagRow}>
                    {box.tags.map((tag) => (
                      <span key={tag} style={styles.statusTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}

            {!boxes.length && (
              <div style={styles.noEvents}>
                No decision events yet. Add boxes in Working Space to create
                communication history.
              </div>
            )}
          </div>
        </div>

        <aside style={styles.statusPanel}>
          <p style={styles.kicker}>Current Status</p>
          <h2 style={styles.sectionTitle}>Next Action Summary</h2>

          <div style={styles.statusGrid}>
            <span>Current Team</span>
            <strong>{teamName}</strong>

            <span>Source Team</span>
            <strong>{activeItem.sourceTeam}</strong>

            <span>Request</span>
            <strong>{activeItem.requestType}</strong>

            <span>Amount</span>
            <strong>{activeItem.amountLabel}</strong>

            <span>Status</span>
            <strong>{activeItem.statusLabel}</strong>
          </div>

          <div style={styles.actionPreview}>
            <h3 style={styles.previewTitle}>Possible Routes</h3>
            <p>Send Forward</p>
            <p>Send Back to Source Team</p>
            <p>Ask Manager Clearance</p>
          </div>
        </aside>
      </section>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: "grid",
    gap: "18px",
  },

  emptyState: {
    border: "1px dashed #cbd5e1",
    borderRadius: "24px",
    background: "#ffffff",
    padding: "36px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.06)",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 950,
    color: "#020817",
  },

  emptyText: {
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  panel: {
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    background: "#ffffff",
    padding: "22px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.07)",
  },

  kicker: {
    margin: 0,
    color: "#0284d8",
    fontSize: "12px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  title: {
    margin: "8px 0 0",
    fontSize: "28px",
    fontWeight: 950,
    color: "#020817",
  },

  sectionTitle: {
    margin: "8px 0 0",
    fontSize: "22px",
    fontWeight: 950,
    color: "#020817",
  },

  description: {
    margin: "8px 0 0",
    color: "#475569",
    fontSize: "15px",
    lineHeight: 1.5,
  },

  pipeline: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "24px",
  },

  pipelineItem: {
    position: "relative",
    display: "grid",
    justifyItems: "center",
    gap: "8px",
    textAlign: "center",
  },

  pipelineCircle: {
    width: "42px",
    height: "42px",
    borderRadius: "999px",
    border: "2px solid #cbd5e1",
    background: "#f8fafc",
    color: "#64748b",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    zIndex: 2,
  },

  completedCircle: {
    border: "2px solid #22c55e",
    background: "#dcfce7",
    color: "#166534",
  },

  currentCircle: {
    border: "2px solid #0284d8",
    background: "#e0f2fe",
    color: "#0369a1",
    boxShadow: "0 0 0 4px rgba(2, 132, 216, 0.12)",
  },

  blockedCircle: {
    border: "2px solid #f97316",
    background: "#ffedd5",
    color: "#9a3412",
  },

  pipelineTeam: {
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: 950,
  },

  pipelineStatus: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 900,
  },

  pipelineLine: {
    position: "absolute",
    top: "21px",
    left: "50%",
    width: "100%",
    height: "2px",
    background: "#dbeafe",
    zIndex: 1,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 360px",
    gap: "18px",
    alignItems: "start",
  },

  timeline: {
    display: "grid",
    gap: "14px",
    marginTop: "20px",
  },

  timelineCard: {
    display: "grid",
    gridTemplateColumns: "18px 1fr",
    gap: "14px",
    border: "1px solid #dbeafe",
    borderRadius: "18px",
    background: "#f8fafc",
    padding: "15px",
  },

  timelineDot: {
    width: "14px",
    height: "14px",
    borderRadius: "999px",
    background: "#0284d8",
    marginTop: "4px",
  },

  eventTitle: {
    margin: 0,
    color: "#020817",
    fontSize: "16px",
    fontWeight: 950,
  },

  eventMeta: {
    margin: "5px 0 0",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 800,
  },

  eventText: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },

  statusTag: {
    borderRadius: "999px",
    background: "#ecfeff",
    border: "1px solid #67e8f9",
    color: "#0e7490",
    padding: "6px 10px",
    fontSize: "11px",
    fontWeight: 950,
  },

  noEvents: {
    border: "1px dashed #cbd5e1",
    borderRadius: "16px",
    background: "#ffffff",
    padding: "18px",
    color: "#64748b",
    fontWeight: 800,
  },

  statusPanel: {
    position: "sticky",
    top: "24px",
    border: "1px solid #dbeafe",
    borderRadius: "24px",
    background: "#ffffff",
    padding: "22px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: "12px",
    marginTop: "18px",
    color: "#475569",
    fontSize: "13px",
  },

  actionPreview: {
    marginTop: "20px",
    border: "1px solid #bae6fd",
    borderRadius: "18px",
    background: "#f0f9ff",
    padding: "14px",
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: 800,
    lineHeight: 1.5,
  },

  previewTitle: {
    margin: "0 0 8px",
    fontSize: "15px",
    fontWeight: 950,
    color: "#020817",
  },
};