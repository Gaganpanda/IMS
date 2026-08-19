import { useState } from "react";
import AddRecordModal from "../../common/AddRecordModal/AddRecordModal";
import StatusBadge from "../StatusBadge/StatusBadge";
import "./TrialStakeholders.css";

/* Same status vocabulary used by feedback rounds, reused here for the
 * stakeholder's own overall "Trial Status" (set from the Add/Edit popup). */
const TRIAL_STATUS_OPTIONS = [
  { value: "Not Started", label: "Not Started" },
  { value: "In Progress",  label: "In Progress" },
  { value: "Completed",    label: "Completed" },
  { value: "On Hold",      label: "Pending" },
];

/* ── Icons (self-contained, matches the inline SVG style used across the
   item forms) ── */
const Icons = {
  plus:        (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  trash:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  chevronDown: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>),
  warning:     (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 1 21h22L12 2zm0 6a1.2 1.2 0 0 1 1.2 1.2v5a1.2 1.2 0 1 1-2.4 0v-5A1.2 1.2 0 0 1 12 8zm0 10.3a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z"/></svg>),
  edit:        (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
};

function getInitials(name) {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

let uidCounter = 0;
const uid = () => `local-${Date.now()}-${++uidCounter}`;

/* A feedback round is overdue once a sample has been submitted 7+ days ago
 * with no feedback received yet — mirrors the backend's isOverdue() check so
 * the ⚠ shows immediately while editing, before the record is even saved. */
function isOverdueLocally(f) {
  if (!f.sampleSubmissionDate || f.feedbackReceivedDate) return false;
  const days = (Date.now() - new Date(f.sampleSubmissionDate).getTime()) / 86400000;
  return days >= 7;
}

export function emptyFeedback() {
  return {
    _key: uid(),
    sampleNo: "", requestTrialDate: "", sampleSubmissionDate: "",
    feedbackReceivedDate: "", status: "Not Started",
    feedback: "", correction: "", furtherAction: "",
  };
}

export function emptyStakeholder() {
  return {
    _key: uid(), open: true,
    stakeholderName: "", contactPersonName: "", stakeholderAddress: "", stakeholderPhone: "",
    trialStatus: "Not Started",
    feedbacks: [],
  };
}

/** Converts a stakeholder as returned by the API (nested `feedbacks` list)
 *  into the shape this editor works with (adds local `_key`s for React and
 *  UI-only `open` flags). */
export function stakeholdersFromApi(list) {
  return (list || []).map((s) => ({
    _key: uid(),
    open: false,
    stakeholderName: s.stakeholderName || "",
    contactPersonName: s.contactPersonName || "",
    stakeholderAddress: s.stakeholderAddress || "",
    stakeholderPhone: s.stakeholderPhone || "",
    trialStatus: s.trialStatus || "Not Started",
    feedbacks: (s.feedbacks || []).map((f) => ({
      _key: uid(),
      sampleNo: f.sampleNo || "",
      requestTrialDate: f.requestTrialDate || "",
      sampleSubmissionDate: f.sampleSubmissionDate || "",
      feedbackReceivedDate: f.feedbackReceivedDate || "",
      status: f.status || "Not Started",
      feedback: f.feedback || "",
      correction: f.correction || "",
      furtherAction: f.furtherAction || "",
    })),
  }));
}

/** Converts this editor's local state back into the payload shape the
 *  backend's TrialStakeholderDTO/TrialFeedbackDTO expect. */
export function stakeholdersToApi(list) {
  return (list || []).map((s) => ({
    stakeholderName: s.stakeholderName || "",
    contactPersonName: s.contactPersonName || "",
    stakeholderAddress: s.stakeholderAddress || "",
    stakeholderPhone: s.stakeholderPhone || "",
    trialStatus: s.trialStatus || "Not Started",
    feedbacks: (s.feedbacks || []).map((f) => ({
      sampleNo: f.sampleNo || "",
      requestTrialDate: f.requestTrialDate || null,
      sampleSubmissionDate: f.sampleSubmissionDate || null,
      feedbackReceivedDate: f.feedbackReceivedDate || null,
      status: f.status || "Not Started",
      feedback: f.feedback || "",
      correction: f.correction || "",
      furtherAction: f.furtherAction || "",
    })),
  }));
}

/**
 * Editable list of trial stakeholders, each of which can accumulate any
 * number of independent feedback/trial rounds ("+ Add Trial / Feedback").
 * Fully controlled — `value` / `onChange` — so it can be dropped into
 * AddItemForm, EditItemForm, and EditVariantForm without any of them owning
 * the shape of the data.
 */
export default function TrialStakeholders({ value, onChange }) {
  const stakeholders = value || [];

  /* Tracks, per stakeholder, which single feedback round is expanded — an
   * accordion, not a multi-select set, so opening one round via its arrow
   * automatically closes whichever other round was open for that same
   * stakeholder. Seeded once from the incoming data so the most recent
   * round starts open, matching the previous default behaviour. */
  const [openFeedbackMap, setOpenFeedbackMap] = useState(() => {
    const map = {};
    (value || []).forEach((s) => {
      if (s.feedbacks && s.feedbacks.length) {
        map[s._key] = s.feedbacks[s.feedbacks.length - 1]._key;
      }
    });
    return map;
  });

  // Add/Edit popup — mirrors the "Add ToT Partner" popup pattern used
  // elsewhere in the item forms. `modalKey` is null when closed, "new" while
  // adding a stakeholder, or an existing stakeholder's _key while editing.
  const [modalKey, setModalKey] = useState(null);
  const [modalValues, setModalValues] = useState({});

  const setStakeholders = (updater) => {
    onChange(typeof updater === "function" ? updater(stakeholders) : updater);
  };

  const toggleStakeholder = (key) =>
    setStakeholders((p) => p.map((s) => ({ ...s, open: s._key === key ? !s.open : s.open })));

  const removeStakeholder = (key) =>
    setStakeholders((p) => p.filter((s) => s._key !== key));

  const openAddModal = () => {
    setModalValues({
      stakeholderName: "", trialStatus: "Not Started",
      contactPersonName: "", stakeholderPhone: "", stakeholderAddress: "",
    });
    setModalKey("new");
  };

  const openEditModal = (s) => {
    setModalValues({
      stakeholderName: s.stakeholderName || "",
      trialStatus: s.trialStatus || "Not Started",
      contactPersonName: s.contactPersonName || "",
      stakeholderPhone: s.stakeholderPhone || "",
      stakeholderAddress: s.stakeholderAddress || "",
    });
    setModalKey(s._key);
  };

  const closeModal = () => setModalKey(null);

  const saveModal = () => {
    if (modalKey === "new") {
      const s = { ...emptyStakeholder(), ...modalValues };
      setStakeholders((p) => [...p, s]);
    } else {
      setStakeholders((p) => p.map((s) => (s._key === modalKey ? { ...s, ...modalValues } : s)));
    }
    setModalKey(null);
  };

  /* Opening a round closes whichever other round was open for that same
   * stakeholder (one at a time); clicking the already-open round's arrow
   * closes it. */
  const toggleFeedback = (skey, fkey) =>
    setOpenFeedbackMap((p) => ({ ...p, [skey]: p[skey] === fkey ? null : fkey }));

  const addFeedback = (skey) => {
    const f = emptyFeedback();
    setOpenFeedbackMap((p) => ({ ...p, [skey]: f._key }));
    setStakeholders((p) => p.map((s) =>
      s._key === skey ? { ...s, feedbacks: [...s.feedbacks, f] } : s
    ));
  };

  const updateFeedback = (skey, fkey, field, val) =>
    setStakeholders((p) => p.map((s) =>
      s._key !== skey ? s : {
        ...s,
        feedbacks: s.feedbacks.map((f) => (f._key === fkey ? { ...f, [field]: val } : f)),
      }
    ));

  const removeFeedback = (skey, fkey) =>
    setStakeholders((p) => p.map((s) =>
      s._key !== skey ? s : { ...s, feedbacks: s.feedbacks.filter((f) => f._key !== fkey) }
    ));

  return (
    <div className="tse">
      <div className="tse__head-row">
        <span className="tse__section-label">
          Trial stakeholders
          <span className="tse__count-pill">{stakeholders.length}</span>
        </span>
        <button type="button" className="tse__add-link" onClick={openAddModal}>
          {Icons.plus} Add Stakeholder
        </button>
      </div>

      {stakeholders.length === 0 ? (
        <div className="tse__empty-card">
          <p>No stakeholders added yet</p>
        </div>
      ) : stakeholders.map((s) => {
        const overdueCount = s.feedbacks.filter(isOverdueLocally).length;
        return (
          <div key={s._key} className={`tse__card${s.open ? " open" : ""}`}>
            <div className="tse__header" onClick={() => toggleStakeholder(s._key)}>
              <div className="tse__avatar">{getInitials(s.stakeholderName)}</div>
              <div className="tse__info">
                <div className="tse__name">
                  {s.stakeholderName || "Unnamed stakeholder"}
                  <StatusBadge status={s.trialStatus || "Not Started"} size="sm" />
                  {overdueCount > 0 && (
                    <span className="tse__warn-badge" title={`${overdueCount} feedback round(s) overdue`}>
                      {Icons.warning} Overdue
                    </span>
                  )}
                </div>
                <div className="tse__meta">
                  {s.contactPersonName && `Contact: ${s.contactPersonName}`}
                  {s.contactPersonName && s.stakeholderPhone && " · "}
                  {s.stakeholderPhone && `Ph: ${s.stakeholderPhone}`}
                  {" · "}{s.feedbacks.length} feedback round{s.feedbacks.length === 1 ? "" : "s"}
                </div>
              </div>
              <button
                type="button"
                className="tse__edit-btn"
                onClick={(e) => { e.stopPropagation(); openEditModal(s); }}
                title="Edit stakeholder details"
              >
                {Icons.edit}
              </button>
              <span className="tse__chevron">{Icons.chevronDown}</span>
              <button
                type="button"
                className="tse__del-btn"
                onClick={(e) => { e.stopPropagation(); removeStakeholder(s._key); }}
                title="Remove stakeholder"
              >
                {Icons.trash}
              </button>
            </div>

            {s.open && (
              <div className="tse__body">
                {/* Everything captured in the Add/Edit Stakeholder popup, shown
                    back here so it isn't left hidden after saving. */}
                <div className="tse__basic-grid">
                  <div className="tse__detail-item">
                    <span className="tse__detail-label">Contact Person</span>
                    <span className="tse__detail-value">{s.contactPersonName || "—"}</span>
                  </div>
                  <div className="tse__detail-item">
                    <span className="tse__detail-label">Phone Number</span>
                    <span className="tse__detail-value">{s.stakeholderPhone || "—"}</span>
                  </div>
                  <div className="tse__detail-item">
                    <span className="tse__detail-label">Address</span>
                    <span className="tse__detail-value">{s.stakeholderAddress || "—"}</span>
                  </div>
                  <div className="tse__detail-item">
                    <span className="tse__detail-label">Trial Status</span>
                    <span className="tse__detail-value">{s.trialStatus || "Not Started"}</span>
                  </div>
                </div>

                <div className="tse__feedback-head-row">
                  <span className="tse__section-label">Feedback / Trial Rounds</span>
                  <button type="button" className="tse__add-link tse__add-link--sm"
                    onClick={() => addFeedback(s._key)}>
                    {Icons.plus} Add Trial / Feedback
                  </button>
                </div>

                {s.feedbacks.length === 0 ? (
                  <div className="tse__empty-card tse__empty-card--sm">
                    <p>No feedback rounds yet — click "Add Trial / Feedback" to start one.</p>
                  </div>
                ) : s.feedbacks.map((f, idx) => {
                  const overdue = isOverdueLocally(f);
                  const fOpen = openFeedbackMap[s._key] === f._key;
                  return (
                    <div key={f._key} className={`tse__fb-card${fOpen ? " open" : ""}${overdue ? " overdue" : ""}`}>
                      <div className="tse__fb-header" onClick={() => toggleFeedback(s._key, f._key)}>
                        <span className="tse__fb-title">
                          Feedback {idx + 1}
                          {f.sampleNo && <span className="tse__fb-sample"> · Sample {f.sampleNo}</span>}
                        </span>
                        {overdue && (
                          <span className="tse__warn-badge" title="No feedback received for 7+ days">
                            {Icons.warning} Overdue
                          </span>
                        )}
                        <span className="tse__chevron">{Icons.chevronDown}</span>
                        <button
                          type="button"
                          className="tse__del-btn"
                          onClick={(e) => { e.stopPropagation(); removeFeedback(s._key, f._key); }}
                          title="Remove this feedback round"
                        >
                          {Icons.trash}
                        </button>
                      </div>

                      {fOpen && (
                        <div className="tse__fb-body">
                          <div className="tse__fb-grid">
                            <div className="form-group">
                              <label className="form-label">Sample No.</label>
                              <input className="form-control" value={f.sampleNo}
                                placeholder="Sample number"
                                onChange={(e) => updateFeedback(s._key, f._key, "sampleNo", e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Request Trial Date</label>
                              <input type="date" className="form-control" value={f.requestTrialDate || ""}
                                onChange={(e) => updateFeedback(s._key, f._key, "requestTrialDate", e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Sample Submission Date</label>
                              <input type="date" className="form-control" value={f.sampleSubmissionDate || ""}
                                onChange={(e) => updateFeedback(s._key, f._key, "sampleSubmissionDate", e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Feedback Received Date</label>
                              <input type="date" className="form-control" value={f.feedbackReceivedDate || ""}
                                onChange={(e) => updateFeedback(s._key, f._key, "feedbackReceivedDate", e.target.value)} />
                            </div>
                          </div>

                          <div className="tse__fb-fields">
                            <div className="form-group">
                              <label className="form-label">Feedback</label>
                              <textarea rows={2} className="form-control"
                                placeholder="Enter feedback from stakeholder…"
                                value={f.feedback}
                                onChange={(e) => updateFeedback(s._key, f._key, "feedback", e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Corrections</label>
                              <textarea rows={2} className="form-control"
                                placeholder="List any corrections required…"
                                value={f.correction}
                                onChange={(e) => updateFeedback(s._key, f._key, "correction", e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Further actions</label>
                              <textarea rows={2} className="form-control"
                                placeholder="Describe further actions…"
                                value={f.furtherAction}
                                onChange={(e) => updateFeedback(s._key, f._key, "furtherAction", e.target.value)} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <AddRecordModal
        open={modalKey !== null}
        title={modalKey === "new" ? "Add Trial Stakeholder" : "Edit Trial Stakeholder"}
        fields={[
          { name: "stakeholderName", label: "Trial Stakeholder Name" },
          { name: "trialStatus", label: "Trial Status", type: "select", options: TRIAL_STATUS_OPTIONS },
          { name: "contactPersonName", label: "Contact Person Name" },
          { name: "stakeholderPhone", label: "Phone Number" },
          { name: "stakeholderAddress", label: "Address" },
        ]}
        values={modalValues}
        onChange={(name, val) => setModalValues((p) => ({ ...p, [name]: val }))}
        onClose={closeModal}
        onSave={saveModal}
      />
    </div>
  );
}
