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

  return (
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
          {fields.map((field) => (
            <div className="arm__group" key={field.name}>
              <label>{field.label}</label>

              {field.type === "textarea" ? (
                <textarea
                  value={values[field.name] || ""}
                  onChange={(e) =>
                    onChange(field.name, e.target.value)
                  }
                />
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
    </div>
  );
}