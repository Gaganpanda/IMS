import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchItemByIdAsync, deleteItemAsync, uploadDocumentAsync, deleteDocumentAsync,
} from "../../redux/slices/itemSlice";
import StatusBadge from "../../components/items/StatusBadge/StatusBadge";
import VariantSelectModal from "../../components/items/VariantSelectModal/VariantSelectModal";
import ConfirmPopup from "../../components/common/ConfirmPopup/ConfirmPopup";
import DropdownMenu from "../../components/common/DropdownMenu/DropdownMenu";
import Loader from "../../components/common/Loader/Loader";
import { formatDate } from "../../utils/formatDate";
import { getImageUrl } from "../../utils/imageUrl";
import { buildDocDownloadName } from "../../utils/helpers";
import AlertIcon from "../../components/common/AlertIcon/AlertIcon";
import "./ItemDetails.css";

/* ── Icons ── */
const Icons = {
  back:    (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>),
  edit:    (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  trash:   (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  file:    (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>),
  shield:  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  check:   (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  box:     (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>),
  cart:    (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>),
  flask:   (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6"/><path d="M10 3v5l-4 7a4 4 0 0 0 3.5 6h5a4 4 0 0 0 3.5-6l-4-7V3"/></svg>),
  uploadArrow: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><polyline points="7 8 12 3 17 8"/><path d="M5 21h14"/></svg>),
  download: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><path d="M5 21h14"/></svg>),
  moreVert: (<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>),
};

const TABS = [
  { id: "basic",       label: "Basic Information" },
  { id: "tot",         label: "ToT Details"       },
  { id: "ipr",         label: "IPR Details"       },
  { id: "trials",      label: "Trial Stakeholders"},
  { id: "docs",        label: "Documentation"     },
  { id: "procurement", label: "Procurement"       },
];

/* ── Reusable field row ── */
function Field({ label, value }) {
  return (
    <div className="idet__field">
      <span className="idet__field-label">{label}</span>
      <span className="idet__field-value">{value || "—"}</span>
    </div>
  );
}

/* ── IPR check indicator ── */
function IprCheck({ checked }) {
  return (
    <div className={`idet__ipr-check${checked ? " idet__ipr-check--on" : ""}`}>
      {checked && (
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1.5 6 4.5 9 10.5 3" />
        </svg>
      )}
    </div>
  );
}

/* ── Section card ── */
function Section({ title, icon, color = "blue", children }) {
  return (
    <div className="idet__section">
      <div className="idet__section-head">
        <span className={`idet__section-icon idet__section-icon--${color}`}>{Icons[icon]}</span>
        <span className="idet__section-title">{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ── BASIC TAB ── */
function BasicTab({ item, highlightVariantId, onManageVariants }) {
  const navigate = useNavigate();
  const hasKeyInfo = item.weight || item.size || item.material || item.color || item.unitCost || item.vendor || item.warranty;
  return (
    <>
      <Section title="Basic Information" icon="box" color="blue">
        <div className="idet__fields">
          <Field label="Item Name"           value={item.name} />
          <Field label="Category"            value={item.category} />
          <Field label="Development Status"  value={<StatusBadge status={item.developmentStatus} />} />
          <Field label="Inventor"            value={item.inventor} />
          <Field label="Product Development Completion Date" value={formatDate(item.productDevCompletionDate)} />
        </div>
        <div className="idet__desc-block">
          <span className="idet__field-label">Description</span>
          <p className="idet__desc">{item.description || "—"}</p>
        </div>
      </Section>

      {hasKeyInfo && (
        <Section title="Key Information" icon="box" color="teal">
          <div className="idet__fields">
            <Field label="Weight"      value={item.weight} />
            <Field label="Size"        value={item.size} />
            <Field label="Material"    value={item.material} />
            <Field label="Color"       value={item.color} />
            <Field label="Unit Cost"   value={item.unitCost != null ? `₹${item.unitCost}` : null} />
            <Field label="Vendor"      value={item.vendor} />
            <Field label="Warranty"    value={item.warranty} />
          </div>
        </Section>
      )}

      <Section title="Variants" icon="box" color="blue">
        <div
          className="idet__tbl-head-row"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}
        >
          <span className="idet__variant-count">
            {item.variants?.length || 0} variant{item.variants?.length === 1 ? "" : "s"}
          </span>
          <button type="button" className="btn btn--secondary idet__manage-variants-btn" onClick={onManageVariants}>
            {Icons.box}
            {item.variants?.length ? "Manage Variants" : "Add Variant"}
          </button>
        </div>
        {!item.variants?.length ? (
          <div className="idet__variant-empty">
            <span className="idet__variant-empty-icon">{Icons.box}</span>
            <p>No variants added yet.</p>
            <span>Variants let this item carry independent Basic Info, ToT, IPR, Trial
              Stakeholders, Documentation and Procurement details for each version.</span>
          </div>
        ) : (
          <div className="idet__variant-grid">
            {item.variants.map((v, i) => (
              <div
                key={v.id}
                className={`idet__variant-card${String(v.id) === String(highlightVariantId) ? " idet__variant-card--active" : ""}`}
                onClick={() => navigate(`/items/${item.id}?variant=${v.id}`)}
              >
                <div className="idet__variant-card-top">
                  <span className="idet__variant-index">V{i + 1}</span>
                  {v.developmentStatus && <StatusBadge status={v.developmentStatus} size="sm" />}
                </div>
                <div className="idet__variant-card-name">{v.name}</div>
                <p className="idet__variant-card-desc">{v.description || "No description added."}</p>
                <div className="idet__variant-card-foot">
                  <span>View details</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

/* ── TOT TAB ── */
function TotTab({ item }) {
  const status = item.totStatus || "";
  const isFiled = /^Filed|^Filled/i.test(status);
  const filedDocs = item.totDocumentsFiled || [];

  return (
    <div className="idet__tab-grid">
      <Section title="ToT Status" icon="file" color="orange">
        <div className="idet__fields">
          <Field label="ToT Status" value={<StatusBadge status={item.totStatus} />} />
          {isFiled ? (
            <>
              {filedDocs.length > 0 && (
                <div className="idet__field idet__field--full">
                  <span className="idet__field-label">ToT Documents Filed</span>
                  <div className="idet__doc-chip-row">
                    {filedDocs.map((doc) => (
                      <span key={doc} className="idet__doc-chip">
                        {Icons.check}
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {item.totDocumentNo && (
                <Field label="ToT Document No." value={item.totDocumentNo} />
              )}
              {item.filledDate && (
                <Field label="Filed Date" value={formatDate(item.filledDate)} />
              )}
            </>
          ) : (
            <div className="idet__field idet__field--full">
              <span className="idet__field-label">ToT Document</span>
              <span className="idet__tot-pending">
                {Icons.file}
                Document yet to be filed
              </span>
            </div>
          )}
        </div>
      </Section>

      <Section title="ToT Partners" icon="file" color="blue">
        {item.totPartners?.length ? (
          <div className="idet__partner-grid stagger-children">
            {item.totPartners.map((p) => {
              const isExpired = p.totValidityDate && new Date(p.totValidityDate) < new Date(new Date().toDateString());
              return (
                <div key={p.id} className={`idet__partner-card${isExpired ? " idet__partner-card--expired" : ""}`}>
                  <div className="idet__partner-card-head">
                    <span className="idet__partner-avatar">{(p.totFirm || "?").slice(0, 1).toUpperCase()}</span>
                    <span className="idet__partner-name">{p.totFirm || "—"}</span>
                    {isExpired && (
                      <AlertIcon
                        className="idet__partner-alert"
                        message={`ToT validity with ${p.totFirm || "this partner"} expired on ${formatDate(p.totValidityDate)} — renewal pending.`}
                      />
                    )}
                  </div>
                  <div className="idet__partner-grid-fields">
                    <Field label="LAToT Signing Date" value={formatDate(p.latotSigningDate)} />
                    <Field label="Sample Submission (Tech. Absorption)" value={formatDate(p.sampleSubmissionForTechAbsorptionDate)} />
                    <Field label="ToT Certificate Date" value={p.totCertificateDate ? formatDate(p.totCertificateDate) : "—"} />
                    <Field
                      label="ToT Validity Date"
                      value={
                        <span className={isExpired ? "idet__validity-expired" : ""}>
                          {formatDate(p.totValidityDate)}
                          {isExpired && <span className="idet__expired-pill">Expired</span>}
                        </span>
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="idet__empty">No ToT partners added.</p>
        )}
      </Section>
    </div>
  );
}

/* ── IPR TAB ── */
function IprTab({ item }) {
  const ipr = item.iprDetail;
  const rows = [
    {
      label:      "Patent",
      filed:      ipr?.patentFiled,
      granted:    ipr?.patentGranted,
      inventor:   ipr?.patentInventor,
      filingNo:   ipr?.patentFilingNo,
      filingDate: ipr?.patentFilingDate,
      grantNo:    ipr?.patentGrantNo,
      grantDate:  ipr?.patentGrantDate,
    },
    {
      label:      "Trademark",
      filed:      ipr?.trademarkFiled,
      granted:    ipr?.trademarkGranted,
      inventor:   ipr?.trademarkInventor,
      filingNo:   ipr?.trademarkFilingNo,
      filingDate: ipr?.trademarkFilingDate,
      grantNo:    ipr?.trademarkGrantNo,
      grantDate:  ipr?.trademarkGrantDate,
    },
    {
      label:      "Design",
      filed:      ipr?.designFiled,
      granted:    ipr?.designGranted,
      inventor:   ipr?.designInventor,
      filingNo:   ipr?.designFilingNo,
      filingDate: ipr?.designFilingDate,
      grantNo:    ipr?.designGrantNo,
      grantDate:  ipr?.designGrantDate,
    },
    {
      label:      "Copyright",
      filed:      ipr?.copyrightFiled,
      granted:    ipr?.copyrightGranted,
      inventor:   ipr?.copyrightInventor,
      filingNo:   ipr?.copyrightFilingNo,
      filingDate: ipr?.copyrightFilingDate,
      grantNo:    ipr?.copyrightGrantNo,
      grantDate:  ipr?.copyrightGrantDate,
    },
  ];

  // Only show a Patent/Trademark/Design/Copyright block once it actually has
  // something recorded — either "Filed" or "Granted" is checked. An IPR type
  // nobody has touched yet just clutters the detail page.
  const filledRows = rows.filter((r) => r.filed || r.granted);

  return (
    <Section title="IPR Details" icon="shield" color="purple">
      {!filledRows.length ? (
        <p className="idet__empty">No IPR details recorded.</p>
      ) : (
        <div className="idet__ipr-sections">
          {filledRows.map((r) => (
            <div key={r.label} className="idet__ipr-block">
              <div className="idet__ipr-block-title">{r.label}</div>

              <div className="idet__ipr-status-row">
                <div className="idet__ipr-check-row">
                  <IprCheck checked={r.filed} />
                  <span className="idet__ipr-lbl">Filed</span>
                </div>
                <div className="idet__ipr-check-row">
                  <IprCheck checked={r.granted} />
                  <span className="idet__ipr-lbl">Granted</span>
                </div>
              </div>

              <div className="idet__ipr-block-grid">
                <div className="idet__ipr-cell">
                  <span className="idet__field-label">Inventor</span>
                  <span className="idet__field-value">{r.inventor || "—"}</span>
                </div>
                <div className="idet__ipr-cell">
                  <span className="idet__field-label">{r.label} Filing No</span>
                  <span className="idet__field-value">{r.filingNo || "—"}</span>
                </div>
                <div className="idet__ipr-cell">
                  <span className="idet__field-label">Filing Date</span>
                  <span className="idet__field-value">{formatDate(r.filingDate)}</span>
                </div>
                <div className="idet__ipr-cell">
                  <span className="idet__field-label">{r.label} Grant No / Granting No</span>
                  <span className="idet__field-value">{r.grantNo || "—"}</span>
                </div>
                <div className="idet__ipr-cell">
                  <span className="idet__field-label">Grant Date</span>
                  <span className="idet__field-value">{formatDate(r.grantDate)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ── TRIALS TAB ── */
function TrialsTab({ item }) {
  const stakeholders = item.trialStakeholders || [];

  return (
    <Section title="Trial Stakeholders" icon="flask" color="teal">
      {!stakeholders.length ? (
        <p className="idet__empty">No stakeholders added.</p>
      ) : (
        <div className="idet__stakeholder-list stagger-children">
          {stakeholders.map((s) => {
            const feedbacks = s.feedbacks && s.feedbacks.length ? s.feedbacks : [];
            return (
              <div key={s.id} className="idet__stakeholder-card">
                <div className="idet__stakeholder-head">
                  <span className="idet__stakeholder-avatar">
                    {(s.stakeholderName || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="idet__stakeholder-head-info">
                    <div className="idet__stakeholder-name-row">
                      <span className="idet__stakeholder-name">{s.stakeholderName || "—"}</span>
                      {s.hasOverdueFeedback && (
                        <AlertIcon message="This stakeholder has a feedback round overdue — sample submitted but no feedback received." />
                      )}
                    </div>
                    {(s.contactPersonName || s.stakeholderAddress || s.stakeholderPhone) && (
                      <div className="idet__stakeholder-contact">
                        {s.contactPersonName && <span>{s.contactPersonName}</span>}
                        {s.stakeholderAddress && <span>{s.stakeholderAddress}</span>}
                        {s.stakeholderPhone && <span>{s.stakeholderPhone}</span>}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={s.trialStatus || "Not Started"} />
                </div>

                {!feedbacks.length ? (
                  <p className="idet__empty idet__empty--inset">No feedback rounds yet.</p>
                ) : (
                  <div className="idet__feedback-timeline">
                    {feedbacks.map((f, idx) => (
                      <div key={f.id || idx} className="idet__feedback-item">
                        <div className="idet__feedback-item-rail">
                          <span className="idet__feedback-dot" />
                          {idx < feedbacks.length - 1 && <span className="idet__feedback-line" />}
                        </div>
                        <div className="idet__feedback-item-body">
                          <div className="idet__feedback-item-head">
                            <span className="idet__feedback-round">
                              Round {idx + 1}
                              {f.feedbackOverdue && (
                                <AlertIcon message="Sample was submitted 7+ days ago but no feedback has been received yet." />
                              )}
                            </span>
                            <StatusBadge status={f.status || "Not Started"} size="sm" />
                            {f.sampleNo && <span className="idet__feedback-sample">Sample #{f.sampleNo}</span>}
                          </div>
                          <div className="idet__feedback-dates">
                            <span><em>Requested</em> {formatDate(f.requestTrialDate)}</span>
                            <span><em>Sample sent</em> {formatDate(f.sampleSubmissionDate)}</span>
                            <span><em>Feedback received</em> {formatDate(f.feedbackReceivedDate)}</span>
                          </div>
                          {(f.feedback || f.correction || f.furtherAction) && (
                            <div className="idet__feedback-notes">
                              {f.feedback && <div className="idet__feedback-note"><span>Feedback</span><p>{f.feedback}</p></div>}
                              {f.correction && <div className="idet__feedback-note"><span>Correction</span><p>{f.correction}</p></div>}
                              {f.furtherAction && <div className="idet__feedback-note"><span>Further Action</span><p>{f.furtherAction}</p></div>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

/* ── DOCS TAB ── */
function DocsTab({ item }) {
  const docs = item.documentation || [];
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [activeDocName, setActiveDocName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  const handleFileChosen = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      await dispatch(uploadDocumentAsync({ id: item.id, name: activeDocName, file: f })).unwrap();
    } catch (_) {}
    setUploading(false);
    setActiveDocName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (docId) => {
    setMenuOpenFor(null);
    setDeletingId(docId);
    try {
      await dispatch(deleteDocumentAsync({ id: item.id, docId })).unwrap();
    } catch (_) {}
    setDeletingId(null);
  };

  return (
    <Section title="Documentation Status" icon="file" color="teal">
      {docs.length === 0
        ? <p className="idet__empty">No documents added.</p>
        : (
          <div className="idet__doc-list">
            {docs.map((doc) => {
              const attached = item.uploadedDocuments?.find((f) => (f.docName || f.originalFileName) === doc);
              return (
                <div key={doc} className="idet__doc-row">
                  <div className="idet__doc-check">{Icons.check}</div>
                  <span className="idet__doc-name">{doc}</span>

                  {attached ? (
                    <DropdownMenu
                      trigger={Icons.moreVert}
                      open={menuOpenFor === doc}
                      onOpenChange={(v) => setMenuOpenFor(v ? doc : null)}
                    >
                      <a
                        href={getImageUrl(attached.fileUrl)}
                        target="_blank" rel="noreferrer"
                        download={buildDocDownloadName(doc, item.name, attached.originalFileName || attached.fileUrl)}
                        className="ddm__item"
                      >
                        {Icons.download} Download
                      </a>
                      <button
                        type="button"
                        className="ddm__item"
                        onClick={() => { setActiveDocName(doc); fileInputRef.current?.click(); }}
                      >
                        {Icons.uploadArrow} Replace
                      </button>
                      <button
                        type="button"
                        className="ddm__item ddm__item--danger"
                        disabled={deletingId === attached.id}
                        onClick={() => handleDelete(attached.id)}
                      >
                        {Icons.trash} Delete
                      </button>
                    </DropdownMenu>
                  ) : (
                    <button
                      type="button"
                      className="idet__doc-upload-btn"
                      disabled={uploading && activeDocName === doc}
                      title={`Upload file for ${doc}`}
                      onClick={() => { setActiveDocName(doc); fileInputRef.current?.click(); }}
                    >
                      {Icons.uploadArrow}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )
      }
      <input ref={fileInputRef} type="file" hidden onChange={handleFileChosen} />
    </Section>
  );
}

/* ── PROCUREMENT TAB ── */
function ProcurementTab({ item }) {
  const procs = item.procurementDetails || [];
  return (
    <Section title="Procurement Status" icon="cart" color="green">
      {procs.length === 0 ? (
        <p className="idet__empty">No procurement records added.</p>
      ) : (
        <div className="idet__partner-grid stagger-children">
          {procs.map((p) => (
            <div key={p.id} className="idet__partner-card idet__proc-card">
              <div className="idet__partner-card-head">
                <span className="idet__partner-avatar idet__partner-avatar--green">
                  {Icons.cart}
                </span>
                <span className="idet__partner-name">{p.procurementAgency || "—"}</span>
              </div>
              <div className="idet__partner-grid-fields">
                <Field label="ToT Firm" value={p.totFirmNo} />
                <Field label="No. of Items Procured" value={p.noOfItemProcured ?? "—"} />
                <Field label="Production Value" value={p.productionValue} />
                <Field label="Order Number" value={p.orderNumber} />
                <Field label="Order Date" value={formatDate(p.orderDate)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

const TAB_PANELS = {
  basic:       BasicTab,
  tot:         TotTab,
  ipr:         IprTab,
  trials:      TrialsTab,
  docs:        DocsTab,
  procurement: ProcurementTab,
};

export default function ItemDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const highlightVariantId = searchParams.get("variant");
  const { selectedItem, detailLoading, deleting } = useSelector((s) => s.items);
  const [tab, setTab]               = useState(() => searchParams.get("tab") || "basic");
  const [showDelete, setShowDelete] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  // Track image load failure so we can swap in the placeholder via React state
  // instead of fragile nextSibling DOM manipulation.
  const [imgError, setImgError]     = useState(false);

  useEffect(() => {
    dispatch(fetchItemByIdAsync(id));
    // Reset img error whenever item changes
    setImgError(false);
  }, [id, dispatch]);

  // An item lives in one of two valid states: no variants (the item itself
  // carries all product data) or one-or-more variants (each fully
  // independent). There is no useful "base variant" state where an item
  // HAS variants but is still being viewed via its own stale Basic Info —
  // that page is dead data once variants exist. So the moment an item with
  // variants is opened without one selected, jump straight to its first
  // variant instead of showing that unused base view.
  useEffect(() => {
    if (selectedItem && selectedItem.variants?.length > 0 && !highlightVariantId) {
      navigate(`/items/${id}?variant=${selectedItem.variants[0].id}`, { replace: true });
    }
  }, [selectedItem, id, highlightVariantId, navigate]);

  const handleDelete = async () => {
    await dispatch(deleteItemAsync(id)).unwrap();
    navigate("/items");
  };

  const pendingVariantRedirect = selectedItem?.variants?.length > 0 && !highlightVariantId;
  if (detailLoading || !selectedItem || pendingVariantRedirect) {
    return <Loader variant="page" text="Loading item..." />;
  }
  const item  = selectedItem;

  // When a variant is selected via ?variant=<id>, its own independent data
  // (Basic Info/ToT/IPR/Trial Stakeholders/Documentation/Procurement — every
  // tab) replaces the base item's. The backend always returns a complete
  // variant payload (falling back to the item's own value only for legacy
  // variants saved before a field existed), so a full spread here is safe
  // and correct — this used to hand-pick a handful of "override" fields,
  // which is why variant tabs beyond Basic Info never showed their own data.
  const activeVariant = highlightVariantId
    ? item.variants?.find((v) => String(v.id) === String(highlightVariantId))
    : null;

  const effectiveItem = activeVariant
    ? {
        ...item,
        ...activeVariant,
        id: item.id,
        name: item.name,
        // Keep the full variant list around for the Basic Info tab's table
        variants: item.variants,
      }
    : item;

  const Panel = TAB_PANELS[tab] || BasicTab;

  // Image is a single, item-level asset shared across the item and every
  // variant — always read it from `item`, never from `effectiveItem`
  // (which may carry a variant's own now-unused imageUrl field).
  const imgSrc = item.imageUrl ? getImageUrl(item.imageUrl) : null;
  const showImg = imgSrc && !imgError;

  return (
    <div className="idet animate-fade-in-up">
      {/* Breadcrumb */}
      <nav className="idet__breadcrumb">
        <span className="idet__breadcrumb-link" onClick={() => navigate("/items")}>Items</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ width:13, height:13, color:"var(--color-border-strong)" }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span className="idet__breadcrumb-cur">{item.name}</span>
      </nav>

      {/* Hero card */}
      <div className="idet__hero card">
        {activeVariant && item.variants?.length > 1 && (
          <div className="idet__variant-banner">
            <span>
              Viewing variant <strong>{activeVariant.name}</strong> — this variant has its own
              independent Basic Info, ToT, IPR, Trial Stakeholders, Documentation and Procurement data.
            </span>
            <button type="button" onClick={() => setShowVariantModal(true)}>
              Switch Variant
            </button>
          </div>
        )}
        <div className="idet__hero-body">
          {/* Image — uses React state instead of nextSibling DOM hack */}
          <div className="idet__hero-img">
            {showImg ? (
              <img
                src={imgSrc}
                alt={effectiveItem.name}
                onError={() => setImgError(true)}
              />
            ) : (
              /* Placeholder box shown when no image or load fails */
              <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ width:36, height:36 }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            )}
          </div>

          {/* Info */}
          <div className="idet__hero-info">
            <div className="idet__hero-title-row">
              <h1 className="idet__hero-name">
                {item.name}{activeVariant && <span className="idet__hero-variant-tag"> · {activeVariant.name}</span>}
                {effectiveItem.hasOverdueFeedback && (
                  <AlertIcon message="A trial sample was submitted but feedback hasn't been received in time." />
                )}
                {effectiveItem.hasOverdueTot && (
                  <AlertIcon message={effectiveItem.totOverdueMessage || "ToT validity has expired and renewal is pending."} />
                )}
              </h1>
              <StatusBadge status={effectiveItem.developmentStatus} />
            </div>
            <div className="idet__hero-meta">
              <span className="idet__hero-cat">{item.category || "—"}</span>
              {item.inventor && (
                <>
                  <span className="idet__hero-sep">•</span>
                  <span className="idet__hero-code">Inventor: {item.inventor}</span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="idet__hero-actions">
            <button className="btn btn--primary idet__action-btn"
              onClick={() => navigate(activeVariant
                ? `/items/${id}/variants/${activeVariant.id}/edit`
                : `/items/${id}/edit`)}>
              <span style={{ display:"flex", alignItems:"center", gap:6, width:14, height:14 }}>
                {Icons.edit}
              </span>
              {activeVariant ? "Edit Variant" : "Edit Item"}
            </button>
            <button className="idet__delete-btn" onClick={() => setShowDelete(true)}>
              <span style={{ width:14, height:14 }}>{Icons.trash}</span>
              Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="idet__tabs">
          {TABS.map((t) => (
            <button key={t.id}
              className={`idet__tab${tab === t.id ? " idet__tab--active" : ""}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div className="idet__panel">
        <Panel item={effectiveItem} highlightVariantId={highlightVariantId} onManageVariants={() => setShowVariantModal(true)} />
      </div>

      <VariantSelectModal
        item={item}
        open={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        onSelectVariant={(v) => { setShowVariantModal(false); navigate(`/items/${id}?variant=${v.id}`); }}
      />

      <ConfirmPopup
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}