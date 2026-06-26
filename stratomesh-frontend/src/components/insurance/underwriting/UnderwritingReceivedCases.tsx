import { useState } from "react";

type Props = {
  cases: any[];
  loading: boolean;
  onOpenCase: (caseId: string) => Promise<void> | void;
};

export default function UnderwritingReceivedCases({
  cases,
  loading,
  onOpenCase,
}: Props) {
  const [openingCaseId, setOpeningCaseId] = useState("");

  async function handleOpenCase(caseId: string) {
    try {
      setOpeningCaseId(caseId);
      await onOpenCase(caseId);
    } finally {
      setOpeningCaseId("");
    }
  }

  if (loading) {
    return <p style={styles.muted}>Loading underwriting cases...</p>;
  }

  if (!cases.length) {
    return <p style={styles.muted}>No underwriting cases received yet.</p>;
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.caseList}>
        {cases.map((item) => {
          const isOpening = openingCaseId === item.id;

          return (
            <article key={item.id} style={styles.caseCard}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.caseTitle}>
                    {item.clientCompanyName || item.title || "Insurance Case"}
                  </h3>

                  <p style={styles.caseMeta}>
                    {item.insuranceType || "Insurance Case"} ·{" "}
                    {item.caseCode || "No case code"}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isOpening}
                  onClick={() => handleOpenCase(item.id)}
                  style={{
                    ...styles.openButton,
                    ...(isOpening ? styles.openButtonLoading : {}),
                  }}
                >
                  {isOpening ? "Opening..." : "Open Workspace"}
                </button>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoBox}>
                  <span style={styles.label}>Current Block</span>
                  <strong style={styles.value}>
                    {item.currentBlockName || item.currentBlock || "-"}
                  </strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.label}>Status</span>
                  <strong style={styles.value}>
                    {item.currentStatus || item.status || "-"}
                  </strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.label}>Premium</span>
                  <strong style={styles.value}>
                    {item.expectedPremium || item.targetPremium || "-"}
                  </strong>
                </div>

                <div style={styles.infoBox}>
                  <span style={styles.label}>Team Blocks</span>
                  <strong style={styles.value}>
                    {item.teamBlockCount || item._count?.caseBlocks || 0}
                  </strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginTop: "24px",
  },

  caseList: {
    display: "grid",
    gap: "16px",
  },

  caseCard: {
    border: "1px solid #dbeafe",
    borderRadius: "18px",
    padding: "18px",
    background: "#f0f9ff",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "center",
  },

  caseTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 900,
    color: "#020817",
  },

  caseMeta: {
    margin: "8px 0 0",
    color: "#334155",
    fontSize: "15px",
  },

  openButton: {
    border: 0,
    borderRadius: "12px",
    background: "#0284d8",
    color: "#fff",
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
    minWidth: "150px",
  },

  openButtonLoading: {
    opacity: 0.7,
    cursor: "wait",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "16px",
  },

  infoBox: {
    background: "#ffffff",
    border: "1px solid #dbeafe",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "6px",
  },

  label: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  value: {
    color: "#020817",
    fontSize: "14px",
  },

  muted: {
    color: "#64748b",
    fontWeight: 700,
  },
};