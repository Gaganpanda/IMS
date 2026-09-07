import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addVariantAsync, convertToVariantAsync, deleteVariantAsync, archiveVariantAsync } from "../../../redux/slices/itemSlice";
import { getImageUrl } from "../../../utils/imageUrl";
import DropdownMenu from "../../common/DropdownMenu/DropdownMenu";
import ConfirmPopup from "../../common/ConfirmPopup/ConfirmPopup";
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

const CopyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
);

const BlankIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
);

/**
 * Shows an item's variants and lets the user add, edit, or delete them.
 *
 * An item can exist in one of two valid states — without variants (the item
 * itself carries all product data) or with one or more variants (each fully
 * independent). There is no mandatory "Base Variant".
 *
 * When the item has NO variants yet, "Add Variant" first asks the user how
 * to start the very first variant: copy the item's existing data across
 * (via POST /variants/convert), or start completely blank. Nothing is
 * auto-created — the user always makes an explicit choice.
 *
 * When the item ALREADY has variants, "Add Variant" opens a form to create
 * an additional one, blank by default or copied from an existing variant.
 */
export default function VariantSelectModal({ item, open, onClose, onSelectVariant }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [mode, setMode] = useState(null); // null (list) | 'first' | 'create'
  const [saving, setSaving] = useState(false);

  const [firstForm, setFirstForm] = useState({ name: "", startWith: "copy" });
  const [createForm, setCreateForm] = useState({ name: "", startWith: "blank", copyFromVariantId: "" });

  // Delete confirmation + "has related records, archive instead?" fallback
  // (see ItemService#deleteVariant / HasDependenciesException on the backend).
  const [deleteTarget, setDeleteTarget] = useState(null);   // variant pending a plain delete confirm
  const [dependencyBlock, setDependencyBlock] = useState(null); // { variant, message, counts } once delete is blocked
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  if (!open || !item) return null;

  const variants = item.variants || [];
  const activeVariants = variants.filter((v) => !v.archived);
  const archivedVariants = variants.filter((v) => v.archived);
  const hasVariants = variants.length > 0;
  const image = item.imageUrl ? getImageUrl(item.imageUrl) : null;
  const activeMode = mode ?? "list";

  const resetAndClose = () => {
    setMode(null);
    setMenuOpenFor(null);
    onClose();
  };

  const openCreate = () => {
    if (hasVariants) {
      setCreateForm({ name: "", startWith: "blank", copyFromVariantId: variants[0]?.id ?? "" });
      setMode("create");
    } else {
      setFirstForm({ name: "", startWith: "copy" });
      setMode("first");
    }
  };

  const goToEdit = (variantId) => {
    setMenuOpenFor(null);
    resetAndClose();
    navigate(`/items/${item.id}/variants/${variantId}/edit`);
  };

  const handleDelete = (v) => {
    setMenuOpenFor(null);
    setDeleteTarget(v);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await dispatch(deleteVariantAsync({ id: item.id, variantId: deleteTarget.id })).unwrap();
      setDeleteTarget(null);
    } catch (err) {
      if (err?.code === "HAS_DEPENDENCIES") {
        setDependencyBlock({ variant: deleteTarget, message: err.message, counts: err.counts || {} });
      }
      setDeleteTarget(null);
    }
    setDeleteBusy(false);
  };

  const confirmArchive = async () => {
    if (!dependencyBlock) return;
    setDeleteBusy(true);
    try {
      await dispatch(archiveVariantAsync({ id: item.id, variantId: dependencyBlock.variant.id })).unwrap();
      setDependencyBlock(null);
    } catch (_) { /* toast already shown by thunk */ }
    setDeleteBusy(false);
  };

  /* First variant on an item that currently has none — either copies the
   * item's own existing data across (item becomes the parent, this becomes
   * Variant 1) or starts fully blank. Either way, nothing is duplicated and
   * no "Base Variant" is force-created. */
  const handleCreateFirst = async () => {
    if (!firstForm.name.trim()) return;
    setSaving(true);
    try {
      if (firstForm.startWith === "copy") {
        await dispatch(convertToVariantAsync({ id: item.id, name: firstForm.name.trim() })).unwrap();
      } else {
        await dispatch(addVariantAsync({ id: item.id, name: firstForm.name.trim(), mode: "blank" })).unwrap();
      }
      setMode("list");
    } catch (_) { /* toast already shown by thunk */ }
    setSaving(false);
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    if (createForm.startWith === "copy" && !createForm.copyFromVariantId) return;
    setSaving(true);
    try {
      await dispatch(addVariantAsync({
        id: item.id,
        name: createForm.name.trim(),
        mode: createForm.startWith,
        copyFromVariantId: createForm.startWith === "copy" ? createForm.copyFromVariantId : null,
      })).unwrap();
      setMode("list");
    } catch (_) { /* toast already shown by thunk */ }
    setSaving(false);
  };

  // Shared row renderer for both the active-variant list and the collapsed
  // "Archived variants" section below it — identical markup either way,
  // just muted styling for archived rows via the `archived` class.
  const renderVariantRow = (v, i, isArchivedSection = false) => {
    // Image is a single item-level asset shared by every variant — never
    // per-variant — so each row uses the item's own image.
    const thumb = image;
    return (
      <div
        key={v.id || i}
        className={`vsm__row${isArchivedSection ? " vsm__row--archived" : ""}`}
        onClick={() => onSelectVariant(v)}>
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
            {v.archived && <span className="vsm__row-chip vsm__row-chip--archived">Archived</span>}
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
            {!v.archived && (
              <button
                type="button"
                className="ddm__item ddm__item--danger"
                onClick={() => handleDelete(v)}
              >
                {TrashIcon} Delete
              </button>
            )}
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
            <p>
              {activeMode === "list"
                ? (hasVariants ? "Select a variant to view details" : "This item does not have variants yet")
                : (activeMode === "first" ? "Add the first variant" : "Add a new variant")}
            </p>
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

        {/* ── FIRST VARIANT: item currently has none. Ask explicitly whether to
             copy the item's existing data across, or start blank. Never
             auto-create an empty variant, and never force a "Base Variant". ── */}
        {activeMode === "first" && (
          <div className="vsm__form vsm__form--static">
            <div className="vsm__field-block">
              <label className="vsm__field-label">Variant name <span className="vsm__required">*</span></label>
              <input
                className="form-control"
                placeholder="e.g. 5 Layer"
                value={firstForm.name}
                onChange={(e) => setFirstForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>

            <label className="vsm__field-label" style={{ marginTop: 2 }}>Start with</label>

            <div className="vsm__option-grid">
              <label className={`vsm__option-card${firstForm.startWith === "copy" ? " vsm__option-card--active" : ""}`}>
                <input
                  type="radio"
                  name="firstStartWith"
                  checked={firstForm.startWith === "copy"}
                  onChange={() => setFirstForm((f) => ({ ...f, startWith: "copy" }))}
                />
                <span className="vsm__option-icon">{CopyIcon}</span>
                <span className="vsm__option-body">
                  <strong>Copy Existing Data</strong>
                  <small>
                    Use this item's current Basic Info, ToT, IPR, Trial Stakeholders,
                    Documentation and Procurement details as the starting point. The item's
                    existing data moves onto this variant — nothing is duplicated.
                  </small>
                </span>
                <span className="vsm__option-recommended">Recommended</span>
              </label>

              <label className={`vsm__option-card${firstForm.startWith === "blank" ? " vsm__option-card--active" : ""}`}>
                <input
                  type="radio"
                  name="firstStartWith"
                  checked={firstForm.startWith === "blank"}
                  onChange={() => setFirstForm((f) => ({ ...f, startWith: "blank" }))}
                />
                <span className="vsm__option-icon">{BlankIcon}</span>
                <span className="vsm__option-body">
                  <strong>Start Blank</strong>
                  <small>Add all information manually. This variant will have completely independent details.</small>
                </span>
              </label>
            </div>

            <p className="vsm__form-note">
              {firstForm.startWith === "copy"
                ? "The item stays as the parent — this becomes its first variant, carrying everything the item currently holds."
                : "The item's existing data stays exactly as it is. This variant starts empty and independent."}
            </p>

            <div className="vsm__form-actions">
              <button type="button" className="vsm__form-cancel" onClick={() => setMode("list")}>Cancel</button>
              <button
                type="button"
                className="vsm__form-save"
                disabled={saving || !firstForm.name.trim()}
                onClick={handleCreateFirst}
              >
                {saving ? "Creating…" : "Create Variant"}
              </button>
            </div>
          </div>
        )}

        {/* ── CREATE: item already has variants — add another, blank by default or
             copied from an existing one. The item's own data is never touched. ── */}
        {activeMode === "create" && (
          <div className="vsm__form vsm__form--static">
            <div className="vsm__field-block">
              <label className="vsm__field-label">Variant name <span className="vsm__required">*</span></label>
              <input
                className="form-control"
                placeholder="e.g. 5 Layer"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>

            <label className="vsm__field-label" style={{ marginTop: 2 }}>Start with</label>

            <div className="vsm__option-grid">
              <label className={`vsm__option-card${createForm.startWith === "blank" ? " vsm__option-card--active" : ""}`}>
                <input
                  type="radio"
                  name="startWith"
                  checked={createForm.startWith === "blank"}
                  onChange={() => setCreateForm((f) => ({ ...f, startWith: "blank" }))}
                />
                <span className="vsm__option-icon">{BlankIcon}</span>
                <span className="vsm__option-body">
                  <strong>Create blank variant</strong>
                  <small>Add all information manually. This variant will have completely independent details.</small>
                </span>
              </label>
              <label className={`vsm__option-card${createForm.startWith === "copy" ? " vsm__option-card--active" : ""}`}>
                <input
                  type="radio"
                  name="startWith"
                  checked={createForm.startWith === "copy"}
                  onChange={() => setCreateForm((f) => ({ ...f, startWith: "copy" }))}
                />
                <span className="vsm__option-icon">{CopyIcon}</span>
                <span className="vsm__option-body">
                  <strong>Copy from existing variant</strong>
                  <small>Use an existing variant as a starting point and modify as needed.</small>
                </span>
              </label>
            </div>

            {createForm.startWith === "copy" && (
              <div className="vsm__field-block">
                <label className="vsm__field-label">Variant to copy from</label>
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
              </div>
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
            {activeVariants.length === 0 && archivedVariants.length === 0 ? (
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
            ) : activeVariants.length === 0 ? (
              <div className="vsm__empty">
                <span className="vsm__empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </span>
                <span className="vsm__empty-text">
                  All {archivedVariants.length === 1 ? "variant on this item is" : "variants on this item are"} archived —
                  none are active right now. Add a new variant, or view the archived{" "}
                  {archivedVariants.length === 1 ? "one" : "ones"} below.
                </span>
                <button type="button" className="vsm__empty-btn" onClick={openCreate}>
                  {PlusIcon} Add Variant
                </button>
              </div>
            ) : (
              activeVariants.map((v, i) => renderVariantRow(v, i))
            )}

            {archivedVariants.length > 0 && (
              <div className="vsm__archived-section">
                <button
                  type="button"
                  className="vsm__archived-toggle"
                  onClick={() => setShowArchived((s) => !s)}
                >
                  <span className={`vsm__archived-chevron${showArchived ? " open" : ""}`}>
                    {ChevronIcon}
                  </span>
                  Archived variants ({archivedVariants.length})
                </button>
                {showArchived && (
                  <div className="vsm__archived-list">
                    {archivedVariants.map((v, i) => renderVariantRow(v, i, true))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmPopup
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleteBusy}
        title={`Delete "${deleteTarget?.name ?? ""}"?`}
        message="This permanently removes the variant and its Basic Info, ToT, and IPR details. This can't be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmPopup
        open={!!dependencyBlock}
        onClose={() => setDependencyBlock(null)}
        onConfirm={confirmArchive}
        loading={deleteBusy}
        title="Cannot delete this variant"
        message={
          dependencyBlock
            ? `This variant has ${dependencyBlock.counts.documentCount || 0} document(s), `
              + `${dependencyBlock.counts.procurementCount || 0} procurement record(s), and `
              + `${dependencyBlock.counts.trialCount || 0} trial record(s) attached. `
              + `Archive it instead? Archived variants are hidden from active use but keep their history intact.`
            : ""
        }
        confirmLabel="Archive Variant"
        variant="warning"
      />
    </div>,
    document.body
  );
}
