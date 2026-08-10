import { createPortal } from "react-dom";
import "./AddRecordModal.css";

export default function AddRecordModal({
  open,
  title,
  fields,
  values,
  onChange,
  onClose,
  onSave,
}) {
  if (!open) return null;

  // Portaled to <body> — see Modal.jsx for why: a transformed ancestor
  // (e.g. any page using the `animate-fade-in-up` motion class) becomes the
  // containing block for `position: fixed` children, which broke full-page
  // centering and made the backdrop/modal appear to shift or clip.
  return createPortal(
    <div className="arm__overlay">
      <div className="arm__modal">

        <div className="arm__header">
          <h3>{title}</h3>

          <button
            className="arm__close"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="arm__body">
          {fields.map((field, idx) => (
            <div key={field.name}>
              {field.section && field.section !== fields[idx - 1]?.section && (
                <div className={`arm__section-label${idx === 0 ? " arm__section-label--first" : ""}`}>
                  {field.section}
                </div>
              )}
              <div className="arm__group">
              <label>{field.label}</label>

              {field.type === "textarea" ? (
                <textarea
                  value={values[field.name] || ""}
                  onChange={(e) =>
                    onChange(field.name, e.target.value)
                  }
                />
              ) : field.type === "select" ? (
                <select
                  value={values[field.name] ?? ""}
                  onChange={(e) =>
                    onChange(field.name, e.target.value)
                  }
                >
                  {(field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  value={values[field.name] || ""}
                  onChange={(e) =>
                    onChange(field.name, e.target.value)
                  }
                />
              )}
              </div>
            </div>
          ))}
        </div>

        <div className="arm__footer">
          <button
            type="button"
            className="arm__cancel"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="arm__save"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}