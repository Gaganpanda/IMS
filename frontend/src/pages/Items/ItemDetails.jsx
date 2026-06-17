import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchItemByIdAsync, deleteItemAsync } from "../../redux/slices/itemSlice";
import StatusBadge from "../../components/items/StatusBadge/StatusBadge";
import ConfirmPopup from "../../components/common/ConfirmPopup/ConfirmPopup";
import Loader from "../../components/common/Loader/Loader";
import { formatDate, formatDateLong, timeAgo } from "../../utils/formatDate";
import "./ItemDetails.css";

/* ── Icons ── */
const Icons = {
  back:     (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>),
  edit:     (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  trash:    (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  file:     (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>),
  shield:   (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  check:    (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  box:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>),
  cart:     (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>),
};

const TABS = [
  { id:"overview",     label:"Overview",         icon:"box"    },
  { id:"tot",          label:"ToT Details",      icon:"file"   },
  { id:"ipr",          label:"IPR Details",      icon:"shield" },
  { id:"trials",       label:"Trial Stakeholders",icon:"box"   },
  { id:"docs",         label:"Documentation",    icon:"file"   },
  { id:"procurement",  label:"Procurement",      icon:"cart"   },
];

/* ── Field row ── */
function Field({ label, value }) {
  return (
    <div className="idet__field">
      <span className="idet__field-label">{label}</span>
      <span className="idet__field-value">{value || "—"}</span>
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

/* ── OVERVIEW TAB ── */
function OverviewTab({ item }) {
  return (
    <div className="idet__overview-grid">
      <Section title="Basic Information" icon="box" color="blue">
        <div className="idet__fields">
          <Field label="Item Code"          value={item.code} />
          <Field label="Category"           value={item.category} />
          <Field label="Priority"           value={item.priority} />
          <Field label="Expected Completion" value={formatDate(item.expectedCompletionDate)} />
          <Field label="Created By"         value={item.createdBy || "Admin"} />
          <Field label="Created On"         value={formatDateLong(item.createdAt)} />
          <Field label="Last Updated"       value={formatDateLong(item.updatedAt)} />
        </div>
        <div className="idet__desc-block">
          <span className="idet__field-label">Description</span>
          <p className="idet__desc">{item.description || "—"}</p>
        </div>
      </Section>

      <Section title="Status Summary" icon="shield" color="purple">
        {[
          { label:"Development", value: item.developmentStatus },
          { label:"ToT",         value: item.totStatus         },
          { label:"IPR",         value: item.iprStatus         },
          { label:"Trials",      value: item.trialsStatus      },
        ].map(({ label, value }) => (
          <div key={label} className="idet__status-row">
            <span className="idet__status-label">{label}</span>
            <StatusBadge status={value} />
          </div>
        ))}
      </Section>

      <Section title="Recent Activity" icon="box" color="teal">
        {(item.recentActivity || []).length === 0
          ? <p className="idet__empty">No recent activity.</p>
          : (item.recentActivity || []).slice(0, 6).map((a, i) => (
              <div key={i} className="idet__activity-row">
                <span className="idet__activity-dot" style={{ background: a.color || "#3b82f6" }} />
                <div>
                  <div className="idet__activity-msg">{a.message}</div>
                  <div className="idet__activity-time">{timeAgo(a.createdAt)}</div>
                </div>
              </div>
            ))
        }
      </Section>
    </div>
  );
}

/* ── TOT TAB ── */
function TotTab({ item }) {
  return (
    <div className="idet__tab-grid">
      <Section title="ToT Status" icon="file" color="orange">
        <div className="idet__fields">
          <Field label="ToT Status"      value={<StatusBadge status={item.totStatus} />} />
          <Field label="ToT Document No." value={item.totDocumentNo} />
          <Field label="Filled Date"      value={formatDate(item.filledDate)} />
          <Field label="Development Date" value={formatDate(item.developmentDate)} />
          <Field label="Remarks"          value={item.remarks} />
        </div>
      </Section>

      <Section title="ToT Documents Available" icon="file" color="blue">
        <div className="idet__cert-row">
          {["TNF","TAC","TEC"].map((c) => (
            <div key={c} className="idet__cert-chip">
              <span className="idet__cert-check">{Icons.check}</span>
              {c}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ── IPR TAB ── */
function IprTab({ item }) {
  return (
    <div className="idet__tab-grid">
      {[
        { title:"Patent",    fileLabel:"Patent / File Number",    fileVal: item.patentNumber, grantVal:"—" },
        { title:"Trademark", fileLabel:"Trademark / File Number", fileVal:"—",               grantVal:"—" },
        { title:"Design",    fileLabel:"Design / File Number",    fileVal:"—",               grantVal:"—" },
      ].map(({ title, fileLabel, fileVal, grantVal }) => (
        <Section key={title} title={title} icon="shield" color="purple">
          <div className="idet__ipr-grid">
            <div className="idet__ipr-check-row">
              <div className="idet__ipr-check idet__ipr-check--on">{Icons.check}</div>
              <span className="idet__ipr-lbl">Filed</span>
            </div>
            <Field label={fileLabel} value={fileVal} />
            <div className="idet__ipr-check-row">
              <div className="idet__ipr-check">{}</div>
              <span className="idet__ipr-lbl">Granted</span>
            </div>
            <Field label="Granted Number" value={grantVal} />
          </div>
        </Section>
      ))}
      <Section title="IPR Status" icon="shield" color="red">
        <Field label="IPR Status"   value={<StatusBadge status={item.iprStatus} />} />
        <Field label="Patent Number" value={item.patentNumber} />
        <Field label="Filing Date"   value={formatDate(item.filingDate)} />
      </Section>
    </div>
  );
}

/* ── TRIALS TAB ── */
function TrialsTab({ item }) {
  return (
    <div className="idet__tab-grid">
      <Section title="Trial Stakeholders" icon="box" color="teal">
        {(!item.trialStakeholders || item.trialStakeholders.length === 0)
          ? <p className="idet__empty">No stakeholders added.</p>
          : (
            <div className="idet__tbl-wrap">
              <table className="idet__tbl">
                <thead><tr>
                  <th>Stakeholder Name</th>
                  <th>Sample Request Date</th>
                  <th>Sample Submission Date</th>
                  <th>Status</th>
                </tr></thead>
                <tbody>
                  {item.trialStakeholders.map((s, i) => (
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{s}</td>
                      <td>{formatDate(item.sampleRequestDate) || "—"}</td>
                      <td>{formatDate(item.sampleSubmissionDate) || "—"}</td>
                      <td><StatusBadge status={item.trialsStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Section>
      <Section title="Trial Details" icon="box" color="orange">
        <div className="idet__fields">
          <Field label="Trials Status"        value={<StatusBadge status={item.trialsStatus} />} />
          <Field label="Sample Request Date"  value={formatDate(item.sampleRequestDate)} />
          <Field label="Sample Submission"    value={formatDate(item.sampleSubmissionDate)} />
        </div>
      </Section>
    </div>
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
  return (
    <Section title="Procurement Status" icon="cart" color="green">
      {(!item.crbfCount && !item.ssbCount)
        ? <p className="idet__empty">No procurement data.</p>
        : (
          <div className="idet__tbl-wrap">
            <table className="idet__tbl">
              <thead><tr>
                <th>Organisation Type</th>
                <th>No. of Items Procured</th>
              </tr></thead>
              <tbody>
                {item.crbfCount ? <tr><td style={{fontWeight:600}}>CRBF</td><td>{item.crbfCount}</td></tr> : null}
                {item.ssbCount  ? <tr><td style={{fontWeight:600}}>SSB</td> <td>{item.ssbCount}</td></tr>  : null}
              </tbody>
            </table>
          </div>
        )
      }
    </Section>
  );
}

const TAB_PANELS = {
  overview:    OverviewTab,
  tot:         TotTab,
  ipr:         IprTab,
  trials:      TrialsTab,
  docs:        DocsTab,
  procurement: ProcurementTab,
};

export default function ItemDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { selectedItem, detailLoading, deleting } = useSelector((s) => s.items);
  const [tab, setTab]           = useState("overview");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => { dispatch(fetchItemByIdAsync(id)); }, [id, dispatch]);

  const handleDelete = async () => {
    await dispatch(deleteItemAsync(id)).unwrap();
    navigate("/items");
  };

  if (detailLoading || !selectedItem) return <Loader variant="page" text="Loading item..." />;
  const item = selectedItem;
  const Panel = TAB_PANELS[tab] || OverviewTab;

  return (
    <div className="idet">
      {/* Breadcrumb */}
      <nav className="idet__breadcrumb">
        <span className="idet__breadcrumb-link" onClick={() => navigate("/items")}>Items</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{width:13,height:13,color:"#cbd5e1"}}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span className="idet__breadcrumb-cur">{item.name}</span>
      </nav>

      {/* Hero card */}
      <div className="idet__hero card">
        <div className="idet__hero-body">
          {/* Image */}
          <div className="idet__hero-img">
            {item.imageUrl
              ? <img src={item.imageUrl} alt={item.name} />
              : <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:36,height:36}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            }
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
              <span style={{display:"flex",alignItems:"center",gap:6,width:14,height:14}}>
                {Icons.edit}
              </span>
              Edit Item
            </button>
            <button className="idet__delete-btn" onClick={() => setShowDelete(true)}>
              <span style={{width:14,height:14}}>{Icons.trash}</span>
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