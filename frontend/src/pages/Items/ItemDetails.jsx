import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchItemByIdAsync, deleteItemAsync } from "../../redux/slices/itemSlice";
import StatusBadge from "../../components/items/StatusBadge/StatusBadge";
import ConfirmPopup from "../../components/common/ConfirmPopup/ConfirmPopup";
import Loader from "../../components/common/Loader/Loader";
import { formatDate } from "../../utils/formatDate";
import { getImageUrl } from "../../utils/imageUrl";
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
function BasicTab({ item }) {
  return (
    <Section title="Basic Information" icon="box" color="blue">
      <div className="idet__fields">
        <Field label="Item Name"           value={item.name} />
        <Field label="Item Code"           value={item.code} />
        <Field label="Category"            value={item.category} />
        <Field label="Development Status"  value={<StatusBadge status={item.developmentStatus} />} />
        <Field label="Priority"            value={item.priority} />
        <Field label="Expected Completion" value={formatDate(item.expectedCompletionDate)} />
      </div>
      <div className="idet__desc-block">
        <span className="idet__field-label">Description</span>
        <p className="idet__desc">{item.description || "—"}</p>
      </div>
    </Section>
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
          <div className="idet__tbl-wrap">
            <table className="idet__tbl">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Certificate</th>
                  <th>TAC Sample</th>
                  <th>LATOT</th>
                </tr>
              </thead>
              <tbody>
                {item.totPartners.map((p) => (
                  <tr key={p.id}>
                    <td>{p.partnerName}</td>
                    <td>
                      <span className={`idet__bool-badge idet__bool-badge--${p.totCertificate ? "yes" : "no"}`}>
                        {p.totCertificate ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <span className={`idet__bool-badge idet__bool-badge--${p.sampleSubmittedForTac ? "yes" : "no"}`}>
                        {p.sampleSubmittedForTac ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <span className={`idet__bool-badge idet__bool-badge--${p.latotSignature ? "yes" : "no"}`}>
                        {p.latotSignature ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      label:     "Patent",
      filed:     ipr?.patentFiled,
      granted:   ipr?.patentGranted,
      fileNo:    ipr?.patentNumber,
      grantedNo: ipr?.patentGrantedNumber,
    },
    {
      label:     "Trademark",
      filed:     ipr?.trademarkFiled,
      granted:   ipr?.trademarkGranted,
      fileNo:    ipr?.trademarkNumber,
      grantedNo: ipr?.trademarkGrantedNumber,
    },
    {
      label:     "Design",
      filed:     ipr?.designFiled,
      granted:   ipr?.designGranted,
      fileNo:    ipr?.designNumber,
      grantedNo: ipr?.designGrantedNumber,
    },
  ];

  const hasAny = rows.some((r) => r.filed || r.granted || r.fileNo || r.grantedNo);

  return (
    <Section title="IPR Details" icon="shield" color="purple">
      {!hasAny ? (
        <p className="idet__empty">No IPR details recorded.</p>
      ) : (
        <div className="idet__ipr-sections">
          {rows.map((r) => (
            <div key={r.label} className="idet__ipr-block">
              <div className="idet__ipr-block-title">{r.label}</div>
              <div className="idet__ipr-block-grid">
                <div className="idet__ipr-check-row">
                  <IprCheck checked={r.filed} />
                  <span className="idet__ipr-lbl">Filed</span>
                </div>
                <Field label="File Number" value={r.fileNo} />
                <div className="idet__ipr-check-row">
                  <IprCheck checked={r.granted} />
                  <span className="idet__ipr-lbl">Granted</span>
                </div>
                <Field label="Granted Number" value={r.grantedNo} />
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
  return (
    <Section title="Trial Stakeholders" icon="flask" color="teal">
      {!item.trialStakeholders?.length ? (
        <p className="idet__empty">No stakeholders added.</p>
      ) : (
        <div className="idet__tbl-wrap">
          <table className="idet__tbl">
            <thead>
              <tr>
                <th>Stakeholder Name</th>
                <th>Sample Request Date</th>
                <th>Sample Submission Date</th>
                <th>Feedback</th>
                <th>Correction</th>
                <th>Further Action</th>
              </tr>
            </thead>
            <tbody>
              {item.trialStakeholders.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.stakeholderName}</td>
                  <td>{formatDate(s.sampleRequestDate)}</td>
                  <td>{formatDate(s.sampleSubmissionDate)}</td>
                  <td>{s.feedback    || "—"}</td>
                  <td>{s.correction  || "—"}</td>
                  <td>{s.furtherAction || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

/* ── DOCS TAB ── */
function DocsTab({ item }) {
  const docs = item.documentation || [];
  return (
    <Section title="Documentation Status" icon="file" color="teal">
      {docs.length === 0
        ? <p className="idet__empty">No documents added.</p>
        : (
          <div className="idet__doc-list">
            {docs.map((doc) => (
              <div key={doc} className="idet__doc-row">
                <div className="idet__doc-check">{Icons.check}</div>
                <span className="idet__doc-name">{doc}</span>
                <span className="idet__doc-file">{Icons.file}</span>
              </div>
            ))}
          </div>
        )
      }
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
        <div className="idet__tbl-wrap">
          <table className="idet__tbl">
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Items Procured</th>
                <th>Order Number</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              {procs.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.organisationName}</td>
                  <td>{p.itemsProcured}</td>
                  <td>{p.orderNumber || "—"}</td>
                  <td>{formatDate(p.orderDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const { selectedItem, detailLoading, deleting } = useSelector((s) => s.items);
  const [tab, setTab]               = useState("basic");
  const [showDelete, setShowDelete] = useState(false);
  // Track image load failure so we can swap in the placeholder via React state
  // instead of fragile nextSibling DOM manipulation.
  const [imgError, setImgError]     = useState(false);

  useEffect(() => {
    dispatch(fetchItemByIdAsync(id));
    // Reset img error whenever item changes
    setImgError(false);
  }, [id, dispatch]);

  const handleDelete = async () => {
    await dispatch(deleteItemAsync(id)).unwrap();
    navigate("/items");
  };

  if (detailLoading || !selectedItem) return <Loader variant="page" text="Loading item..." />;
  const item  = selectedItem;
  const Panel = TAB_PANELS[tab] || BasicTab;

  // Resolve image URL using fixed getImageUrl (now uses API base URL directly)
  const imgSrc = item.imageUrl ? getImageUrl(item.imageUrl) : null;
  const showImg = imgSrc && !imgError;

  return (
    <div className="idet">
      {/* Breadcrumb */}
      <nav className="idet__breadcrumb">
        <span className="idet__breadcrumb-link" onClick={() => navigate("/items")}>Items</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ width:13, height:13, color:"#cbd5e1" }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span className="idet__breadcrumb-cur">{item.name}</span>
      </nav>

      {/* Hero card */}
      <div className="idet__hero card">
        <div className="idet__hero-body">
          {/* Image — uses React state instead of nextSibling DOM hack */}
          <div className="idet__hero-img">
            {showImg ? (
              <img
                src={imgSrc}
                alt={item.name}
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
              <h1 className="idet__hero-name">{item.name}</h1>
              <StatusBadge status={item.developmentStatus} />
            </div>
            <div className="idet__hero-meta">
              <span className="idet__hero-code">{item.code}</span>
              <span className="idet__hero-sep">•</span>
              <span className="idet__hero-cat">{item.category || "—"}</span>
              {item.priority && (
                <>
                  <span className="idet__hero-sep">•</span>
                  <span className={`idet__hero-priority idet__hero-priority--${item.priority?.toLowerCase()}`}>
                    {item.priority} Priority
                  </span>
                </>
              )}
            </div>
            <p className="idet__hero-desc">{item.description}</p>
          </div>

          {/* Actions */}
          <div className="idet__hero-actions">
            <button className="btn btn--primary idet__action-btn"
              onClick={() => navigate(`/items/${id}/edit`)}>
              <span style={{ display:"flex", alignItems:"center", gap:6, width:14, height:14 }}>
                {Icons.edit}
              </span>
              Edit Item
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
        <Panel item={item} />
      </div>

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