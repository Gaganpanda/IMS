import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchItemByIdAsync, deleteItemAsync } from "../../redux/slices/itemSlice";
import { ITEM_DETAIL_TABS } from "../../utils/constants";
import StatusBadge from "../../components/items/StatusBadge/StatusBadge";
import ConfirmPopup from "../../components/common/ConfirmPopup/ConfirmPopup";
import Loader from "../../components/common/Loader/Loader";
import { formatDateLong, formatDate, timeAgo } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/helpers";
import "./ItemDetails.css";

/* ── Tab panels ── */
function OverviewTab({ item }) {
  return (
    <div className="item-detail__overview">
      {/* Details */}
      <div className="card item-detail__section">
        <h3 className="item-detail__section-title">Details</h3>
        <dl className="item-detail__dl">
          {[
            ["Item Code",           item.code],
            ["Category",            item.category],
            ["Development Status",  <StatusBadge status={item.developmentStatus} />],
            ["ToT Status",          <StatusBadge status={item.totStatus} />],
            ["IPR Status",          <StatusBadge status={item.iprStatus} />],
            ["Trials Status",       <StatusBadge status={item.trialsStatus} />],
            ["Priority",            item.priority],
            ["Created On",          formatDateLong(item.createdAt)],
            ["Last Updated",        formatDateLong(item.updatedAt)],
            ["Created By",          item.createdBy || "Admin User"],
          ].map(([label, value]) => (
            <div key={label} className="item-detail__dl-row">
              <dt className="item-detail__dt">{label}</dt>
              <dd className="item-detail__dd">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Key Information */}
      <div className="card item-detail__section">
        <h3 className="item-detail__section-title">Key Information</h3>
        <dl className="item-detail__dl">
          {[
            ["Weight",    item.weight],
            ["Size",      item.size],
            ["Material",  item.material],
            ["Color",     item.color],
            ["Unit Cost", formatCurrency(item.unitCost)],
            ["Vendor",    item.vendor],
            ["Warranty",  item.warranty],
          ].map(([label, value]) => (
            <div key={label} className="item-detail__dl-row">
              <dt className="item-detail__dt">{label}</dt>
              <dd className="item-detail__dd">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Current Status */}
      <div className="item-detail__right-col">
        <div className="card item-detail__section">
          <h3 className="item-detail__section-title">Current Status</h3>
          <div className="item-detail__status-grid">
            {[
              { label: "Development", value: item.developmentStatus, ok: item.developmentStatus === "Developed" },
              { label: "ToT",         value: item.totStatus,         ok: item.totStatus?.startsWith("Filled") },
              { label: "IPR",         value: item.iprStatus,         ok: item.iprStatus === "Granted" || item.iprStatus === "Patent Filed" },
              { label: "Trials",      value: item.trialsStatus,      ok: item.trialsStatus === "Completed" },
            ].map(({ label, value, ok }) => (
              <div key={label} className="item-detail__status-tile">
                <div className={`item-detail__status-dot ${ok ? "item-detail__status-dot--ok" : "item-detail__status-dot--warn"}`} />
                <span className="item-detail__status-label">{label}</span>
                <StatusBadge status={value} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card item-detail__section">
          <div className="item-detail__section-header">
            <h3 className="item-detail__section-title">Recent Activity</h3>
            <button className="item-detail__view-all">View All</button>
          </div>
          <div className="item-detail__activity">
            {(item.recentActivity || []).map((a, i) => (
              <div key={i} className="item-detail__activity-row">
                <span className="item-detail__activity-dot" style={{ background: a.color || "#3b82f6" }} />
                <div>
                  <div className="item-detail__activity-msg">{a.message}</div>
                  <div className="item-detail__activity-time">{timeAgo(a.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card item-detail__section item-detail__section--full">
        <h3 className="item-detail__section-title">Description</h3>
        <p className="item-detail__desc">{item.description || "—"}</p>
      </div>
    </div>
  );
}

function DevelopmentTab({ item }) {
  return (
    <div className="card item-detail__section" style={{ maxWidth: 600 }}>
      <h3 className="item-detail__section-title">Development & ToT Details</h3>
      <dl className="item-detail__dl">
        {[
          ["Development Status", <StatusBadge status={item.developmentStatus} />],
          ["Development Date",   formatDate(item.developmentDate)],
          ["Remarks",            item.remarks],
          ["ToT Status",         <StatusBadge status={item.totStatus} />],
          ["ToT Document No.",   item.totDocumentNo],
          ["Filled Date",        formatDate(item.filledDate)],
        ].map(([label, value]) => (
          <div key={label} className="item-detail__dl-row">
            <dt className="item-detail__dt">{label}</dt>
            <dd className="item-detail__dd">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function TrialsTab({ item }) {
  return (
    <div className="card item-detail__section" style={{ maxWidth: 600 }}>
      <h3 className="item-detail__section-title">Trials & Stakeholders</h3>
      <dl className="item-detail__dl">
        {[
          ["Trials Status",          <StatusBadge status={item.trialsStatus} />],
          ["Sample Request Date",    formatDate(item.sampleRequestDate)],
          ["Sample Submission Date", formatDate(item.sampleSubmissionDate)],
        ].map(([label, value]) => (
          <div key={label} className="item-detail__dl-row">
            <dt className="item-detail__dt">{label}</dt>
            <dd className="item-detail__dd">{value || "—"}</dd>
          </div>
        ))}
      </dl>
      <div style={{ marginTop: 16 }}>
        <span className="item-detail__dt">Trial Stakeholders</span>
        <div className="item-detail__tags">
          {(item.trialStakeholders || []).map((s) => (
            <span key={s} className="item-detail__tag">{s}</span>
          ))}
          {(!item.trialStakeholders || item.trialStakeholders.length === 0) && (
            <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
          )}
        </div>
      </div>
    </div>
  );
}

function IPRTab({ item }) {
  return (
    <div className="card item-detail__section" style={{ maxWidth: 600 }}>
      <h3 className="item-detail__section-title">IPR Details</h3>
      <dl className="item-detail__dl">
        {[
          ["IPR Status",    <StatusBadge status={item.iprStatus} />],
          ["Patent Number", item.patentNumber],
          ["Filing Date",   formatDate(item.filingDate)],
        ].map(([label, value]) => (
          <div key={label} className="item-detail__dl-row">
            <dt className="item-detail__dt">{label}</dt>
            <dd className="item-detail__dd">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function DocumentsTab({ item }) {
  return (
    <div className="card item-detail__section" style={{ maxWidth: 600 }}>
      <h3 className="item-detail__section-title">Documentation Status</h3>
      <div className="item-detail__doc-list">
        {(item.documentation || []).map((doc) => (
          <div key={doc} className="item-detail__doc-row">
            <span className="item-detail__doc-check">✓</span>
            <span className="item-detail__doc-name">{doc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcurementTab({ item }) {
  return (
    <div className="card item-detail__section" style={{ maxWidth: 500 }}>
      <h3 className="item-detail__section-title">Procurement Status</h3>
      <dl className="item-detail__dl">
        {[
          ["CRBF (No. of Items)", item.crbfCount],
          ["SSB (No. of Items)",  item.ssbCount],
        ].map(([label, value]) => (
          <div key={label} className="item-detail__dl-row">
            <dt className="item-detail__dt">{label}</dt>
            <dd className="item-detail__dd">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const TAB_CONTENT = {
  Overview:     OverviewTab,
  Development:  DevelopmentTab,
  Trials:       TrialsTab,
  IPR:          IPRTab,
  ToT:          DevelopmentTab,
  Procurement:  ProcurementTab,
  Documents:    DocumentsTab,
  Stakeholders: TrialsTab,
  History:      () => (
    <div className="card item-detail__section">
      <p style={{ color: "#94a3b8", fontSize: 13 }}>History coming soon.</p>
    </div>
  ),
};

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedItem, detailLoading, deleting } = useSelector((s) => s.items);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    dispatch(fetchItemByIdAsync(id));
  }, [id, dispatch]);

  const handleDelete = async () => {
    await dispatch(deleteItemAsync(id)).unwrap();
    navigate("/items");
  };

  if (detailLoading || !selectedItem) return <Loader variant="page" text="Loading item..." />;

  const item = selectedItem;
  const ActivePanel = TAB_CONTENT[activeTab] || OverviewTab;

  return (
    <div className="item-detail">

      {/* Breadcrumb — matches AddItem pattern */}
      <nav className="item-detail__breadcrumb">
        <span className="item-detail__crumb-link" onClick={() => navigate("/items")}>Items</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" className="item-detail__crumb-arrow">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="item-detail__crumb-current">{item.name}</span>
      </nav>

      {/* Hero card */}
      <div className="card item-detail__hero">
        <div className="item-detail__hero-body">
          {/* Thumbnail */}
          <div className="item-detail__thumb">
            {item.imageUrl
              ? <img src={item.imageUrl} alt={item.name} />
              : <span>📦</span>}
          </div>

          {/* Info */}
          <div className="item-detail__hero-info">
            <div className="item-detail__hero-title-row">
              <h1 className="item-detail__hero-name">{item.name}</h1>
              <StatusBadge status={item.developmentStatus} />
              <button className="item-detail__star" title="Favourite">☆</button>
            </div>
            <div className="item-detail__hero-meta">
              <span className="item-detail__code">{item.code}</span>
              <span className="item-detail__sep">•</span>
              <span className="item-detail__category">{item.category}</span>
            </div>
            <p className="item-detail__hero-desc">{item.description}</p>
          </div>

          {/* Actions */}
          <div className="item-detail__hero-actions">
            <button className="btn btn--primary" onClick={() => navigate(`/items/${id}/edit`)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Item
            </button>
            <button
              className="btn btn--secondary item-detail__delete-btn"
              onClick={() => setShowDelete(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="item-detail__tabs">
          {ITEM_DETAIL_TABS.map((tab) => (
            <button
              key={tab}
              className={`item-detail__tab ${activeTab === tab ? "item-detail__tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Active tab panel */}
      <div className="item-detail__content">
        <ActivePanel item={item} />
      </div>

      {/* Delete confirm */}
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