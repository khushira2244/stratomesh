import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Props = {
  receivedBlocks: any[];
  sourceTeam?: string;
  reviewingTeam?: string;
  caseDetail?: any;
};

function getBlockItems(block: any) {
  const configItems = block?.config?.items || [];
  const inputs = block?.inputs || [];

  if (Array.isArray(configItems) && configItems.length) {
    return configItems;
  }

  return inputs.map((input: string, index: number) => ({
    id: `${block.id}-input-${index}`,
    label: input,
    status: "ADDED",
  }));
}

function getItemLabel(item: any) {
  return item?.label || item?.name || item?.title || String(item);
}

function getItemStatus(item: any) {
  return item?.status || "ADDED";
}

function getObservedItems(block: any) {
  const configObserved = block?.config?.observedItems;

  if (Array.isArray(configObserved)) {
    return configObserved;
  }

  return getBlockItems(block).filter(
    (item: any) => item?.observed || item?.status === "OBSERVE"
  );
}

function getMissingItems(block: any) {
  const configMissing = block?.config?.missingItems;

  if (Array.isArray(configMissing)) {
    return configMissing;
  }

  return getBlockItems(block).filter((item: any) => item?.status === "MISSING");
}

function getNotRequiredItems(block: any) {
  const configNotRequired = block?.config?.notRequiredItems;

  if (Array.isArray(configNotRequired)) {
    return configNotRequired;
  }

  return getBlockItems(block).filter(
    (item: any) => item?.status === "NOT_REQUIRED"
  );
}

function downloadJson(fileName: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

export default function SalesInputReview({
  receivedBlocks,
  sourceTeam = "Previous Team",
  reviewingTeam = "underwriting",
  caseDetail,
}: Props) {
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

  const packageSummary = useMemo(() => {
    const totalInputs = receivedBlocks.reduce(
      (total, block) => total + getBlockItems(block).length,
      0
    );

    const observedCount = receivedBlocks.reduce(
      (total, block) => total + getObservedItems(block).length,
      0
    );

    const missingCount = receivedBlocks.reduce(
      (total, block) => total + getMissingItems(block).length,
      0
    );

    const notRequiredCount = receivedBlocks.reduce(
      (total, block) => total + getNotRequiredItems(block).length,
      0
    );

    return {
      totalInputs,
      observedCount,
      missingCount,
      notRequiredCount,
    };
  }, [receivedBlocks]);

  function handleDownloadPackage() {
    const packageData = {
      packageType: "RECEIVED_TEAM_PACKAGE",
      sourceTeam,
      reviewingTeam,
      downloadedAt: new Date().toISOString(),
      case: {
        id: caseDetail?.id,
        caseCode: caseDetail?.caseCode,
        title: caseDetail?.title,
      },
      summary: packageSummary,
      blocks: receivedBlocks.map((block) => ({
        id: block.id,
        name: block.name,
        teamKey: block.teamKey,
        status: block.status,
        comments: block.comments,
        pendingReason: block.pendingReason,
        inputs: block.inputs || [],
        output: block.output || [],
        items: getBlockItems(block),
        observedItems: getObservedItems(block),
        missingItems: getMissingItems(block),
        notRequiredItems: getNotRequiredItems(block),
        config: block.config || {},
      })),
      documents: caseDetail?.documents || [],
    };

    const safeCaseCode = caseDetail?.caseCode || "received-package";
    const safeSourceTeam = sourceTeam.toLowerCase().replace(/\s+/g, "-");

    downloadJson(`${safeCaseCode}-${safeSourceTeam}-package.json`, packageData);
  }

  if (!receivedBlocks.length) {
    return (
      <section style={styles.wrapper}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Received Package Review</h2>
            <p style={styles.description}>
              No package found from the source team for this case.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Received Package Review</h2>
          <p style={styles.description}>
            From <strong>{sourceTeam}</strong>. Review or download this package
            before building the {reviewingTeam} workspace.
          </p>
        </div>

        <button
          type="button"
          style={styles.downloadButton}
          onClick={handleDownloadPackage}
        >
          Download Package
        </button>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryBox}>
          <span>Blocks</span>
          <strong>{receivedBlocks.length}</strong>
        </div>

        <div style={styles.summaryBox}>
          <span>Inputs</span>
          <strong>{packageSummary.totalInputs}</strong>
        </div>

        <div style={styles.summaryBox}>
          <span>Observed</span>
          <strong>{packageSummary.observedCount}</strong>
        </div>

        <div style={styles.summaryBox}>
          <span>Missing</span>
          <strong>{packageSummary.missingCount}</strong>
        </div>
      </div>

      <div style={styles.blockList}>
        {receivedBlocks.map((block) => {
          const items = getBlockItems(block);
          const observedItems = getObservedItems(block);
          const missingItems = getMissingItems(block);
          const isExpanded = expandedBlockId === block.id;

          return (
            <article key={block.id} style={styles.packageCard}>
              <div style={styles.blockHeader}>
                <div>
                  <h3 style={styles.blockTitle}>{block.name}</h3>

                  <p style={styles.blockMeta}>
                    {items.length} inputs · {observedItems.length} observed ·{" "}
                    {missingItems.length} missing
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.viewButton}
                  onClick={() =>
                    setExpandedBlockId(isExpanded ? null : block.id)
                  }
                >
                  {isExpanded ? "Hide Config" : "View Config"}
                </button>
              </div>

              {block.comments && (
                <p style={styles.commentText}>Comment: {block.comments}</p>
              )}

              {block.pendingReason && (
                <p style={styles.pendingText}>Pending: {block.pendingReason}</p>
              )}

              {isExpanded && (
                <div style={styles.configPanel}>
                  {items.map((item: any, index: number) => (
                    <div
                      key={item.id || `${block.id}-${index}`}
                      style={styles.itemRow}
                    >
                      <span>{getItemLabel(item)}</span>
                      <strong>{getItemStatus(item)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    marginTop: "24px",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    background: "#ffffff",
    padding: "18px",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
  },

  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 900,
    color: "#020817",
  },

  description: {
    margin: "6px 0 0",
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  downloadButton: {
    border: 0,
    borderRadius: "12px",
    background: "#0284d8",
    color: "#ffffff",
    padding: "11px 16px",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "16px",
  },

  summaryBox: {
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    background: "#f8fafc",
    padding: "12px",
    display: "grid",
    gap: "4px",
  },

  blockList: {
    display: "grid",
    gap: "12px",
    marginTop: "16px",
  },

  packageCard: {
    border: "1px solid #dbeafe",
    borderRadius: "16px",
    background: "#f0f9ff",
    padding: "14px",
  },

  blockHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },

  blockTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 900,
    color: "#0f172a",
  },

  blockMeta: {
    margin: "5px 0 0",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 700,
  },

  viewButton: {
    border: "1px solid #bae6fd",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#0369a1",
    padding: "9px 12px",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  commentText: {
    margin: "10px 0 0",
    color: "#334155",
    fontSize: "13px",
  },

  pendingText: {
    margin: "8px 0 0",
    color: "#9a3412",
    background: "#fff7ed",
    borderRadius: "10px",
    padding: "8px 10px",
    fontSize: "13px",
    fontWeight: 800,
  },

  configPanel: {
    display: "grid",
    gap: "8px",
    marginTop: "12px",
    borderTop: "1px solid #bae6fd",
    paddingTop: "12px",
  },

  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    borderRadius: "10px",
    background: "#ffffff",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#0f172a",
  },
};