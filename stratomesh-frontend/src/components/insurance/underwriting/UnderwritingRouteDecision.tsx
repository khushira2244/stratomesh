import type { CSSProperties } from "react";
import type { UnderwritingBoxTemplate } from "../../../lib/underwriting-workspace";
import { underwritingBoxTemplates } from "../../../lib/underwriting-workspace";

type Props = {
  saving: boolean;
  hasCaseOpen: boolean;
  selectedBoxType: string;
  addingBoxType: string;
  onAddBlock: (template: UnderwritingBoxTemplate) => void;
};

export default function UnderwritingBoxLibrary({
  saving,
  hasCaseOpen,
  selectedBoxType,
  addingBoxType,
  onAddBlock,
}: Props) {
  return (
    <aside style={styles.wrapper}>
      <h2 style={styles.title}>Underwriting Box Library</h2>

      <p style={styles.description}>
        Add underwriting review boxes to the canvas. These boxes become part of
        the current case workspace after the user selects and adds them.
      </p>

      <div style={styles.templateList}>
        {underwritingBoxTemplates.map((template) => {
          const isSelected = selectedBoxType === template.boxType;
          const isAdding = addingBoxType === template.boxType;
          const isDisabled = saving || !hasCaseOpen || Boolean(addingBoxType);

          return (
            <button
              key={template.boxType}
              type="button"
              disabled={isDisabled}
              onClick={() => onAddBlock(template)}
              style={{
                ...styles.templateButton,
                ...(isSelected ? styles.templateButtonSelected : {}),
                ...(isDisabled ? styles.templateButtonDisabled : {}),
              }}
            >
              <strong>{isAdding ? "Adding..." : `+ ${template.name}`}</strong>

              <span style={styles.templateDescription}>
                {template.description}
              </span>

              <small style={isSelected ? styles.selectedHint : styles.hint}>
                Adds to: Underwriting Canvas
              </small>
            </button>
          );
        })}
      </div>

      {!hasCaseOpen && (
        <p style={styles.helpText}>
          Open a case first, then add boxes to the underwriting workspace.
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
    fontWeight: 900,
    color: "#0f172a",
  },

  description: {
    margin: 0,
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  templateList: {
    display: "grid",
    gap: "10px",
    marginTop: "8px",
  },

  templateButton: {
    width: "100%",
    textAlign: "left",
    border: "1px solid #dbe4ee",
    borderRadius: "16px",
    background: "#f8fafc",
    padding: "14px 16px",
    cursor: "pointer",
    display: "grid",
    gap: "6px",
    color: "#0f172a",
    transition: "all 0.15s ease",
  },

  templateButtonSelected: {
    background: "#e0f2fe",
    border: "1px solid #0284d8",
    boxShadow: "0 0 0 3px rgba(2, 132, 216, 0.12)",
  },

  templateButtonDisabled: {
    cursor: "not-allowed",
    opacity: 0.65,
  },

  templateDescription: {
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.45,
  },

  hint: {
    color: "#64748b",
    fontWeight: 800,
  },

  selectedHint: {
    color: "#0369a1",
    fontWeight: 900,
  },

  helpText: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
  },
};