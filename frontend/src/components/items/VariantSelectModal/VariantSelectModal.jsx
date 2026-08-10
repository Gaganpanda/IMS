import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addVariantAsync, deleteVariantAsync } from "../../../redux/slices/itemSlice";
import { getImageUrl } from "../../../utils/imageUrl";
import DropdownMenu from "../../common/DropdownMenu/DropdownMenu";
import "./VariantSelectModal.css";

const ChevronIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CloseIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlaceholderIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="22" height="22" opacity="0.3">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);

const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MoreVertIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
);

const EditIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);

const TrashIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
);

/**
 * Shows an item's variants. Variants only ever contain what the user
 * explicitly adds — the item's own Basic Info/ToT/IPR/Trial Stakeholders/
 * Documentation/Procurement data always stays on the item itself and is
 * never auto-converted into a "Variant 1" the user didn't ask for.
 * "+ Add Variant" creates a new variant, either blank or copied from an
 * existing one — each one fully independent of the item and of every
 * other variant.
 */
export default function VariantSelectModal({ item, open, onClose, onSelectVariant }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [mode, setMode] = useState(null); // null (list) | 'create'
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState({ name: "", code: "", startWith: "blank", copyFromVariantId: "" });

  if (!open || !item) return null;

  const variants = item.variants || [];
  const hasVariants = variants.length > 0;
  const image = item.imageUrl ? getImageUrl(item.imageUrl) : null;
  const activeMode = mode ?? "list";

  const resetAndClose = () => {
    setMode(null);
    setMenuOpenFor(null);
    onClose();
  };

  const openCreate = () => {
    setCreateForm({ name: "", code: "", startWith: "blank", copyFromVariantId: variants[0]?.id ?? "" });
    setMode("create");
  };

  const goToEdit = (variantId) => {
    setMenuOpenFor(null);
    resetAndClose();
    navigate(`/items/${item.id}/variants/${variantId}/edit`);
  };

  const handleDelete = async (v) => {
    setMenuOpenFor(null);
    await dispatch(deleteVariantAsync({ id: item.id, variantId: v.id }));
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    if (createForm.startWith === "copy" && !createForm.copyFromVariantId) return;
    setSaving(true);
    try {
      await dispatch(addVariantAsync({
        id: item.id,
        name: createForm.name.trim(),
        code: createForm.code.trim() || null,
        mode: createForm.startWith,
        copyFromVariantId: createForm.startWith === "copy" ? createForm.copyFromVariantId : null,
      })).unwrap();
      setMode("list");
    } catch (_) { /* toast already shown by thunk */ }
    setSaving(false);
  };

  // Portaled to <body> — see Modal.jsx for why: a transformed ancestor (e.g.
  // the `animate-fade-in-up` motion class used on pages like ItemDetails)
  // becomes the containing block for `position: fixed` children, which broke
  // full-page centering and made the backdrop/modal appear to shift or clip.
  return createPortal(
    <div className="vsm__overlay" onClick={resetAndClose}>
      <div className="vsm__modal" onClick={(e) => e.stopPropagation()}>
        <div className="vsm__header">
          <div className="vsm__header-thumb">
            {image
              ? <img src={image} alt={item.name} />
              : <div className="vsm__header-thumb-placeholder">{PlaceholderIcon}</div>
            }
          </div>
          <div className="vsm__header-text">
            <h3>{item.name}</h3>
            <p>{hasVariants ? "Select a variant to view details" : "This item does not have variants yet"}</p>
          </div>
          {activeMode === "list" && (
            <button type="button" className="vsm__add-btn" onClick={openCreate}>
              {PlusIcon} Add Variant
            </button>
          )}
          <button type="button" className="vsm__close" onClick={resetAndClose} aria-label="Close">
            {CloseIcon}
          </button>
        </div>

        {/* ── CREATE: add a variant, blank or copied from an existing one. The item's own
             Basic Info/ToT/IPR/Trial Stakeholders/Documentation/Procurement data is never
             touched by this — a variant is purely something the user adds on top. ── */}
        {activeMode === "create" && (
          <div className="vsm__form vsm__form--static">
            <div className="vsm__form-title">New Variant</div>
            <div className="vsm__form-row">
              <input
                className="form-control"
                placeholder="Variant name (e.g. 5 Layer)"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
              <input
                className="form-control"
                placeholder="Variant code (e.g. ECWSB-5L)"
                value={createForm.code}
                onChange={(e) => setCreateForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>

            <label className="vsm__form-hint" style={{ fontWeight: 700, color: "var(--color-text-secondary)" }}>
              Start with
            </label>
            <label className="vsm__radio-option">
              <input
                type="radio"
                name="startWith"
                checked={createForm.startWith === "blank"}
                onChange={() => setCreateForm((f) => ({ ...f, startWith: "blank" }))}
              />
              <span>
                <strong>Create blank variant</strong>
                <small>Add all information manually. This variant will have completely independent details.</small>
              </span>
            </label>
            {hasVariants && (
              <label className="vsm__radio-option">
                <input
                  type="radio"
                  name="startWith"
                  checked={createForm.startWith === "copy"}
                  onChange={() => setCreateForm((f) => ({ ...f, startWith: "copy" }))}
                />
                <span>
                  <strong>Copy from existing variant</strong>
                  <small>Use an existing variant as a starting point and modify as needed.</small>
                </span>
              </label>
            )}
            {hasVariants && createForm.startWith === "copy" && (
              <select
                className="form-control"
                value={createForm.copyFromVariantId}
                onChange={(e) => setCreateForm((f) => ({ ...f, copyFromVariantId: e.target.value }))}
              >
                <option value="">Select variant to copy from</option>
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            )}

            <div className="vsm__form-actions">
              <button type="button" className="vsm__form-cancel" onClick={() => setMode("list")}>Cancel</button>
              <button
                type="button"
                className="vsm__form-save"
                disabled={saving || !createForm.name.trim() || (createForm.startWith === "copy" && !createForm.copyFromVariantId)}
                onClick={handleCreate}
              >
                {saving ? "Creating…" : "Create Variant"}
              </button>
            </div>
          </div>
        )}

        {/* ── LIST: existing variants, each fully independent ── */}
        {activeMode === "list" && (
          <div className="vsm__list">
            {variants.length === 0 ? (
              <div className="vsm__empty">
                <span className="vsm__empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </span>
                <span className="vsm__empty-text">
                  This item doesn't have any variants yet. Add one to give it independent
                  Basic Info, ToT, IPR, Trial Stakeholders, Documentation and Procurement details.
                </span>
                <button type="button" className="vsm__empty-btn" onClick={openCreate}>
                  {PlusIcon} Add Variant
                </button>
              </div>
            ) : (
              variants.map((v, i) => {
                const thumb = v.imageUrl ? getImageUrl(v.imageUrl) : image;
                return (
                  <div key={v.id || i} className="vsm__row" onClick={() => onSelectVariant(v)}>
                    <div className="vsm__row-thumb">
                      {thumb
                        ? <img src={thumb} alt={v.name} />
                        : <div className="vsm__row-thumb-placeholder">{PlaceholderIcon}</div>
                      }
                    </div>
                    <div className="vsm__row-body">
                      <div className="vsm__row-name-line">
                        <span className="vsm__row-name">{v.name}</span>
                        <span className="vsm__row-chip">V{i + 1}</span>
                        {v.code && <span className="vsm__row-tag">{v.code}</span>}
                      </div>
                      {v.description && <span className="vsm__row-desc">{v.description}</span>}
                      <div className="vsm__row-meta">
                        {v.developmentStatus && <span className="vsm__row-tag">{v.developmentStatus}</span>}
                        {v.size && <span className="vsm__row-tag">Size: {v.size}</span>}
                        {v.color && <span className="vsm__row-tag">{v.color}</span>}
                        {v.unitCost != null && v.unitCost !== "" && <span className="vsm__row-tag">₹{v.unitCost}</span>}
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu
                        trigger={MoreVertIcon}
                        open={menuOpenFor === (v.id ?? i)}
                        onOpenChange={(open) => setMenuOpenFor(open ? (v.id ?? i) : null)}
                      >
                        <button type="button" className="ddm__item" onClick={() => goToEdit(v.id)}>
                          {EditIcon} Edit
                        </button>
                        <button
                          type="button"
                          className="ddm__item ddm__item--danger"
                          onClick={() => handleDelete(v)}
                        >
                          {TrashIcon} Delete
                        </button>
                      </DropdownMenu>
                    </div>

                    <button
                      type="button"
                      className="vsm__row-arrow"
                      aria-label={`View ${v.name}`}
                      onClick={(e) => { e.stopPropagation(); onSelectVariant(v); }}
                    >
                      {ChevronIcon}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
