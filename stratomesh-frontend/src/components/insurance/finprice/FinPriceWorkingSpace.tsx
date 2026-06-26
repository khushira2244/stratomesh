import type { CSSProperties } from "react";
import type { FinPriceInboxItem } from "./FinPriceReceivedDesk";

export type FinPriceWorkspaceBox = {
  id: string;
  boxType: string;
  name: string;
  description?: string;
  decision: string;
  targetTeam: string;
  comment: string;
  tags: string[];
  attachments: Array<{
    id: string;
    label: string;
    sourceTeam: string;
  }>;
  primaryAction: string;
  savedBlockId?: string;
};

type Props = {
  teamName: string;
  activeItem: FinPriceInboxItem | null;
  activeCaseDetail?: any;
  boxes: FinPriceWorkspaceBox[];
  saving: boolean;
  loadingCaseDetail?: boolean;
  onUpdateBox: (boxId: string, updates: Partial<FinPriceWorkspaceBox>) => void;
  onSaveBox: (box: FinPriceWorkspaceBox) => void;
  onRunBoxAction: (box: FinPriceWorkspaceBox) => void;
  onPrimaryAction: () => void;
};

export default function FinPriceWorkingSpace({
  teamName,
  activeItem,
  activeCaseDetail,
  boxes,
  saving,
  loadingCaseDetail = false,
  onUpdateBox,
  onSaveBox,
  onRunBoxAction,
  onPrimaryAction,
}: Props) {
  if (!activeItem) {
    return (
      <section style={styles.emptyState}>
        <h2 style={styles.emptyTitle}>No active package selected</h2>
        <p style={styles.emptyText}>
          Send one item from the Send / Receive Desk. The selected package will
          appear here for {teamName} decision work.
        </p>
      </section>
    );
  }

  const documents = activeCaseDetail?.documents || [];
  const extractedData = activeCaseDetail?.extractedData || {};
  const currentTeamBlocks =
    activeCaseDetail?.blocksByTeam?.[teamName.toLowerCase()] || [];

  return (
    <section style={styles.wrapper}>
      <section style={styles.caseCard}>
        <div>
          <p style={styles.kicker}>Active Received Package</p>
          <h2 style={styles.caseTitle}>{activeItem.clientName}</h2>
          <p style={styles.caseDescription}>{activeItem.requestTitle}</p>
        </div>

        <div style={styles.caseMetaGrid}>
          <div style={styles.metaBox}>
            <span>Source Team</span>
            <strong>{activeItem.sourceTeam}</strong>
          </div>

          <div style={styles.metaBox}>
            <span>Priority</span>
            <strong>{activeItem.priority}</strong>
          </div>

          <div style={styles.metaBox}>
            <span>Amount</span>
            <strong>{activeItem.amountLabel}</strong>
          </div>

          <div style={styles.metaBox}>
            <span>Status</span>
            <strong>{activeItem.statusLabel}</strong>
          </div>
        </div>
      </section>

      <section style={styles.packagePanel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Received Package Review</h2>
            <p style={styles.mutedText}>
              This package came from {activeItem.sourceTeam}. It is opened from
              backend case detail and can be used for decision actions.
            </p>
          </div>

          <button type="button" style={styles.secondaryButton}>
            Download Package
          </button>
        </div>

        {loadingCaseDetail && (
          <div style={styles.loadingBox}>Loading full case detail...</div>
        )}

        {!loadingCaseDetail && (
          <>
            <div style={styles.packageGrid}>
              <div style={styles.packageItem}>
                <span>Case Code</span>
                <strong>{activeItem.caseCode || "Not available"}</strong>
              </div>

              <div style={styles.packageItem}>
                <span>Request Type</span>
                <strong>{activeItem.requestType}</strong>
              </div>

              <div style={styles.packageItem}>
                <span>Current Status</span>
                <strong>{activeItem.statusLabel}</strong>
              </div>

              <div style={styles.packageItem}>
                <span>Documents</span>
                <strong>{documents.length}</strong>
              </div>

              <div style={styles.packageItem}>
                <span>{teamName} Blocks</span>
                <strong>{currentTeamBlocks.length}</strong>
              </div>

              <div style={styles.packageItem}>
                <span>Policy Type</span>
                <strong>
                  {extractedData?.policyRequirement?.policyType ||
                    activeCaseDetail?.insuranceType ||
                    "Not available"}
                </strong>
              </div>
            </div>

            {documents.length > 0 && (
              <div style={styles.documentStrip}>
                {documents.slice(0, 6).map((document: any) => (
                  <span key={document.id || document.name} style={styles.documentPill}>
                    {document.name || document.documentName || "Document"}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section style={styles.canvas}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.sectionTitle}>{teamName} Decision Canvas</h2>
            <p style={styles.mutedText}>
              Added boxes become decision modules with attachments, tags,
              comments, buttons, and backend actions.
            </p>
          </div>

          <button
            type="button"
            style={styles.primaryButton}
            disabled={saving || !boxes.length}
            onClick={onPrimaryAction}
          >
            Send Forward
          </button>
        </div>

        {!boxes.length && (
          <div style={styles.noBoxes}>
            No boxes added yet. Use the right panel to add a decision box.
          </div>
        )}

        <div style={styles.boxList}>
          {boxes.map((box) => (
            <article key={box.id} style={styles.decisionBox}>
              <div style={styles.boxHeader}>
                <div>
                  <h3 style={styles.boxTitle}>{box.name}</h3>
                  <p style={styles.mutedText}>{box.description}</p>
                </div>

                <span style={styles.boxTypePill}>{box.boxType}</span>
              </div>

              <div style={styles.formGrid}>
                <label style={styles.field}>
                  <span>Decision</span>
                  <input
                    value={box.decision}
                    onChange={(event) =>
                      onUpdateBox(box.id, { decision: event.target.value })
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.field}>
                  <span>Target Team</span>
                  <input
                    value={box.targetTeam}
                    onChange={(event) =>
                      onUpdateBox(box.id, { targetTeam: event.target.value })
                    }
                    style={styles.input}
                  />
                </label>
              </div>

              <div style={styles.attachmentArea}>
                <div style={styles.attachmentHeader}>
                  <strong>Attachments</strong>
                  <span>Attach package items or documents later</span>
                </div>

                {box.attachments.length ? (
                  <div style={styles.attachmentList}>
                    {box.attachments.map((attachment) => (
                      <div key={attachment.id} style={styles.attachmentItem}>
                        <strong>{attachment.label}</strong>
                        <span>{attachment.sourceTeam}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={styles.noAttachmentText}>
                    No attachments selected yet.
                  </p>
                )}
              </div>

              <div>
                <strong style={styles.smallHeading}>Tags</strong>
                <div style={styles.tagRow}>
                  {box.tags.map((tag) => (
                    <span key={tag} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <label style={styles.field}>
                <span>Comment</span>
                <textarea
                  value={box.comment}
                  onChange={(event) =>
                    onUpdateBox(box.id, { comment: event.target.value })
                  }
                  placeholder="Write decision note, reason, blocker, or clearance comment..."
                  style={styles.textarea}
                />
              </label>

              {box.savedBlockId && (
                <p style={styles.savedText}>
                  Saved block: <strong>{box.savedBlockId}</strong>
                </p>
              )}

              <div style={styles.buttonRow}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  disabled={saving}
                  onClick={() => onSaveBox(box)}
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  style={styles.primaryButton}
                  disabled={saving}
                  onClick={() => onRunBoxAction(box)}
                >
                  {box.primaryAction}
                </button>
              </div>
            </article>
          ))}
        </div>
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

  caseCard: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "18px",
    border: "1px solid #dbeafe",
    borderRadius: "26px",
    background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
    padding: "22px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },

  kicker: {
    margin: 0,
    color: "#0284d8",
    fontSize: "12px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  caseTitle: {
    margin: "8px 0 0",
    fontSize: "28px",
    fontWeight: 950,
    color: "#020817",
  },

  caseDescription: {
    margin: "8px 0 0",
    color: "#475569",
    fontSize: "15px",
    lineHeight: 1.5,
  },

  caseMetaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(130px, 1fr))",
    gap: "10px",
    minWidth: "340px",
  },

  metaBox: {
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.86)",
    padding: "13px",
    display: "grid",
    gap: "5px",
  },

  packagePanel: {
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    background: "#ffffff",
    padding: "20px",
    boxShadow: "0 16px 38px rgba(15, 23, 42, 0.06)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 950,
    color: "#020817",
  },

  mutedText: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  loadingBox: {
    marginTop: "16px",
    border: "1px dashed #cbd5e1",
    borderRadius: "16px",
    background: "#f8fafc",
    padding: "16px",
    color: "#64748b",
    fontWeight: 900,
  },

  packageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "18px",
  },

  packageItem: {
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    background: "#f8fafc",
    padding: "14px",
    display: "grid",
    gap: "6px",
  },

  documentStrip: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "14px",
  },

  documentPill: {
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#334155",
    padding: "7px 11px",
    fontSize: "12px",
    fontWeight: 900,
  },

  canvas: {
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    background: "#ffffff",
    padding: "20px",
    boxShadow: "0 16px 38px rgba(15, 23, 42, 0.06)",
  },

  noBoxes: {
    marginTop: "16px",
    border: "1px dashed #cbd5e1",
    borderRadius: "18px",
    background: "#f8fafc",
    padding: "18px",
    color: "#64748b",
    fontWeight: 800,
  },

  boxList: {
    display: "grid",
    gap: "16px",
    marginTop: "18px",
  },

  decisionBox: {
    border: "1px solid #bae6fd",
    borderRadius: "22px",
    background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 82%)",
    padding: "18px",
    display: "grid",
    gap: "16px",
  },

  boxHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },

  boxTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 950,
    color: "#020817",
  },

  boxTypePill: {
    borderRadius: "999px",
    background: "#ecfeff",
    border: "1px solid #67e8f9",
    color: "#0e7490",
    padding: "6px 10px",
    fontSize: "11px",
    fontWeight: 950,
    whiteSpace: "nowrap",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  field: {
    display: "grid",
    gap: "7px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 900,
  },

  input: {
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    background: "#ffffff",
    padding: "12px 13px",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
  },

  textarea: {
    minHeight: "92px",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    background: "#ffffff",
    padding: "12px 13px",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
  },

  attachmentArea: {
    border: "1px solid #dbeafe",
    borderRadius: "18px",
    background: "#ffffff",
    padding: "14px",
  },

  attachmentHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#334155",
    fontSize: "13px",
  },

  attachmentList: {
    display: "grid",
    gap: "8px",
    marginTop: "10px",
  },

  attachmentItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    borderRadius: "12px",
    background: "#f8fafc",
    padding: "10px",
    fontSize: "13px",
  },

  noAttachmentText: {
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 700,
  },

  smallHeading: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "13px",
  },

  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  tag: {
    borderRadius: "999px",
    background: "#ecfeff",
    border: "1px solid #67e8f9",
    color: "#0e7490",
    padding: "6px 10px",
    fontSize: "11px",
    fontWeight: 950,
  },

  savedText: {
    margin: 0,
    border: "1px solid #bbf7d0",
    borderRadius: "14px",
    background: "#f0fdf4",
    color: "#166534",
    padding: "10px 12px",
    fontSize: "13px",
    fontWeight: 800,
  },

  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#0f172a",
    padding: "11px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },

  primaryButton: {
    border: 0,
    borderRadius: "14px",
    background: "#0284d8",
    color: "#ffffff",
    padding: "11px 18px",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(2, 132, 216, 0.22)",
  },
};