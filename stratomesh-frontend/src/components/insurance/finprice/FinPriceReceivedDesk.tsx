import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

export type FinPriceInboxItem = {
  id: string;
  caseId: string;
  caseCode?: string;
  sourceTeam: string;
  clientName: string;
  requestTitle: string;
  requestType: string;
  priority: string;
  amountLabel: string;
  statusLabel: string;
  currentBlockName?: string;
  currentStatus?: string;
  rawCase?: any;
};

type Props = {
  title: string;
  description: string;
  filterChips: string[];
  items: FinPriceInboxItem[];
  loading?: boolean;
  errorMessage?: string;
  activeItemId?: string;
  amountLabelTitle: string;
  statusLabelTitle: string;
  onRefresh?: () => void;
  onSendToWorkspace: (item: FinPriceInboxItem) => void;
};

export default function FinPriceReceivedDesk({
  title,
  description,
  filterChips,
  items,
  loading = false,
  errorMessage = "",
  activeItemId,
  amountLabelTitle,
  statusLabelTitle,
  onRefresh,
  onSendToWorkspace,
}: Props) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchText, setSearchText] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter =
        activeFilter === "All" || item.requestType === activeFilter;

      const searchValue = [
        item.caseCode,
        item.sourceTeam,
        item.clientName,
        item.requestTitle,
        item.requestType,
        item.statusLabel,
        item.currentBlockName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchValue.includes(searchText.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, items, searchText]);

  return (
    <section style={styles.wrapper}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.description}>{description}</p>

          <div style={styles.filterRow}>
            {filterChips.map((chip) => (
              <button
                key={chip}
                type="button"
                style={activeFilter === chip ? styles.activeChip : styles.chip}
                onClick={() => setActiveFilter(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.searchColumn}>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search source team, client, request, status..."
            style={styles.searchInput}
          />

          {onRefresh && (
            <button
              type="button"
              style={styles.refreshButton}
              disabled={loading}
              onClick={onRefresh}
            >
              {loading ? "Refreshing..." : "Refresh Queue"}
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div style={styles.errorBox}>
          <strong>Queue error</strong>
          <span>{errorMessage}</span>
        </div>
      )}

      {loading && (
        <div style={styles.loadingBox}>Loading received cases from backend...</div>
      )}

      {!loading && (
        <div style={styles.table}>
          {filteredItems.map((item) => {
            const isActive = activeItemId === item.id;

            return (
              <article
                key={item.id}
                style={{
                  ...styles.row,
                  ...(isActive ? styles.activeRow : {}),
                }}
              >
                <div>
                  <strong style={styles.primaryText}>{item.sourceTeam}</strong>
                  <span style={styles.labelText}>Source Team</span>
                </div>

                <div>
                  <strong style={styles.primaryText}>{item.clientName}</strong>
                  <span style={styles.labelText}>
                    {item.caseCode || "Case"}
                  </span>
                </div>

                <div>
                  <strong style={styles.requestTitle}>
                    {item.requestTitle}
                  </strong>
                  <span style={styles.labelText}>{item.requestType}</span>
                </div>

                <div>
                  <span style={styles.priorityPill}>{item.priority}</span>
                </div>

                <div>
                  <strong style={styles.primaryText}>{item.amountLabel}</strong>
                  <span style={styles.labelText}>{amountLabelTitle}</span>
                </div>

                <div>
                  <span style={styles.statusPill}>{item.statusLabel}</span>
                  <span style={styles.labelText}>{statusLabelTitle}</span>
                </div>

                <div style={styles.actionGroup}>
                  <button
                    type="button"
                    style={styles.openButton}
                    onClick={() => onSendToWorkspace(item)}
                  >
                    Open
                  </button>

                  <button
                    type="button"
                    style={styles.sendButton}
                    onClick={() => onSendToWorkspace(item)}
                  >
                    Send →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && !filteredItems.length && (
        <div style={styles.emptyState}>
          No received items found for this filter/search.
        </div>
      )}
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    background: "#ffffff",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
  },

  headerRow: {
    display: "grid",
    gridTemplateColumns: "1fr minmax(320px, 520px)",
    gap: "24px",
    padding: "26px",
    alignItems: "start",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 950,
    color: "#020817",
  },

  description: {
    margin: "8px 0 0",
    color: "#334155",
    fontSize: "16px",
    lineHeight: 1.5,
  },

  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "22px",
  },

  chip: {
    border: 0,
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#334155",
    padding: "9px 15px",
    fontWeight: 900,
    cursor: "pointer",
  },

  activeChip: {
    border: 0,
    borderRadius: "999px",
    background: "#020817",
    color: "#ffffff",
    padding: "9px 15px",
    fontWeight: 900,
    cursor: "pointer",
  },

  searchColumn: {
    display: "grid",
    gap: "10px",
  },

  searchInput: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    padding: "16px 18px",
    fontSize: "16px",
    outline: "none",
    color: "#0f172a",
  },

  refreshButton: {
    justifySelf: "end",
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#0f172a",
    padding: "11px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },

  errorBox: {
    margin: "0 26px 18px",
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

  loadingBox: {
    borderTop: "1px solid #e2e8f0",
    padding: "28px",
    color: "#64748b",
    fontWeight: 900,
  },

  table: {
    display: "grid",
    borderTop: "1px solid #e2e8f0",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1.25fr 1.6fr 0.65fr 0.95fr 1fr auto",
    gap: "22px",
    alignItems: "center",
    padding: "22px 26px",
    borderBottom: "1px solid #e5e7eb",
    background: "#ffffff",
  },

  activeRow: {
    background: "#f0f9ff",
  },

  primaryText: {
    display: "block",
    fontSize: "18px",
    fontWeight: 950,
    color: "#020817",
  },

  requestTitle: {
    display: "block",
    fontSize: "17px",
    fontWeight: 950,
    color: "#020817",
    lineHeight: 1.25,
  },

  labelText: {
    display: "block",
    marginTop: "6px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 800,
  },

  priorityPill: {
    display: "inline-flex",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#0f172a",
    padding: "7px 14px",
    fontSize: "13px",
    fontWeight: 950,
  },

  statusPill: {
    display: "inline-flex",
    borderRadius: "999px",
    background: "#ecfeff",
    color: "#0e7490",
    border: "1px solid #a5f3fc",
    padding: "7px 12px",
    fontSize: "12px",
    fontWeight: 950,
  },

  actionGroup: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },

  openButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#0f172a",
    padding: "11px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },

  sendButton: {
    border: 0,
    borderRadius: "14px",
    background: "#0284d8",
    color: "#ffffff",
    padding: "11px 18px",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(2, 132, 216, 0.22)",
  },

  emptyState: {
    padding: "28px",
    color: "#64748b",
    fontWeight: 800,
  },
};