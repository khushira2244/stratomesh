import type { CSSProperties } from "react";

export type FinPriceBoxTemplate = {
  boxType: string;
  name: string;
  description: string;
  decisionOptions: string[];
  tagOptions: string[];
  targetTeams: string[];
  primaryAction: string;
};

type Props = {
  title?: string;
  description?: string;
  templates: FinPriceBoxTemplate[];
  saving: boolean;
  hasActiveItem: boolean;
  selectedBoxType: string;
  addingBoxType: string;
  onAddBox: (template: FinPriceBoxTemplate) => void;
};

export default function FinPriceAddBoxPanel({
  title = "Add to Workspace",
  description = "Add one decision box at a time. Each box can carry attachments, comments, tags, buttons, and API actions.",
  templates,
  saving,
  hasActiveItem,
  selectedBoxType,
  addingBoxType,
  onAddBox,
}: Props) {
  return (
    <aside style={styles.wrapper}>
      <h2 style={styles.title}>{title}</h2>

      <p style={styles.description}>{description}</p>

      <div style={styles.templateList}>
        {templates.map((template) => {
          const isSelected = selectedBoxType === template.boxType;
          const isAdding = addingBoxType === template.boxType;
          const isDisabled = saving || !hasActiveItem || Boolean(addingBoxType);

          return (
            <button
              key={template.boxType}
              type="button"
              disabled={isDisabled}
              onClick={() => onAddBox(template)}
              style={{
                ...styles.templateButton,
                ...(isSelected ? styles.templateButtonSelected : {}),
                ...(isDisabled ? styles.templateButtonDisabled : {}),
              }}
            >
              <strong style={styles.templateName}>
                {isAdding ? "Adding..." : `+ ${template.name}`}
              </strong>

              <span style={styles.templateDescription}>
                {template.description}
              </span>

              <small style={isSelected ? styles.selectedHint : styles.hint}>
                {template.primaryAction}
              </small>
            </button>
          );
        })}
      </div>

      {!hasActiveItem && (
        <p style={styles.helpText}>
          Send one item from the Send / Receive Desk to start building the
          workspace.
        </p>
      )}
    </aside>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: "grid",
    gap: "12px",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 950,
    color: "#020817",
  },

  description: {
    margin: 0,
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  templateList: {
    display: "grid",
    gap: "12px",
    marginTop: "10px",
  },

  templateButton: {
    width: "100%",
    textAlign: "left",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    background: "#f8fafc",
    padding: "16px",
    cursor: "pointer",
    display: "grid",
    gap: "7px",
    color: "#0f172a",
    transition: "all 0.15s ease",
  },

  templateButtonSelected: {
    background: "#ecfeff",
    border: "1px solid #0891b2",
    boxShadow: "0 0 0 3px rgba(8, 145, 178, 0.12)",
  },

  templateButtonDisabled: {
    cursor: "not-allowed",
    opacity: 0.6,
  },

  templateName: {
    fontSize: "15px",
    fontWeight: 950,
  },

  templateDescription: {
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.45,
  },

  hint: {
    color: "#64748b",
    fontWeight: 900,
  },

  selectedHint: {
    color: "#0e7490",
    fontWeight: 950,
  },

  helpText: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
  },
};