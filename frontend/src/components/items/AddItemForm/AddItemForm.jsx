import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import AddRecordModal from "../../common/AddRecordModal/AddRecordModal";
import { createItemAsync } from "../../../redux/slices/itemSlice";
import {
  CATEGORIES, DEVELOPMENT_STATUS, TOT_STATUS,
  IPR_STATUS, TRIAL_STAKEHOLDERS, DOCUMENTATION_ITEMS,
  PRIORITY,
} from "../../../utils/constants";
import SuccessPopup from "../SuccessPopup/SuccessPopup";
import "./AddItemForm.css";

const STEPS = [
  { id: 1, label: "Basic Information",    icon: "basic"       },
  { id: 2, label: "ToT Details",          icon: "tot"         },
  { id: 3, label: "IPR Details",          icon: "ipr"         },
  { id: 4, label: "Trial Stakeholders",   icon: "trials"      },
  { id: 5, label: "Documentation Status", icon: "docs"        },
  { id: 6, label: "Procurement Status",   icon: "procurement" },
];


const Icons = {
  basic: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>),
  tot: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>),
  ipr: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>),
  trials: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6"/><path d="M10 3v5l-4 7a4 4 0 0 0 3.5 6h5a4 4 0 0 0 3.5-6l-4-7V3"/></svg>),
  docs: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/></svg>),
  procurement: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>),
  check: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  plus: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  trash: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  edit: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  file: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>),
  arrowLeft: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>),
  arrowRight: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
  close: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  upload: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>),
};

const STEP_COLORS = { basic:"blue", tot:"orange", ipr:"purple", trials:"teal", docs:"teal", procurement:"green" };

function Checkbox({ checked, onChange }) {
  return (
    <div className={`aif__check${checked ? " aif__check--on" : ""}`} onClick={onChange}>
      {checked && <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5 6 4.5 9 10.5 3"/></svg>}
    </div>
  );
}

export default function AddItemForm({ onCancel, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting } = useSelector((s) => s.items);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(new Set());
  const [successData, setSuccessData] = useState(null);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const savePartner = () => {
  if (!partnerData.name.trim()) return;

  setTotPartners((prev) => [
    ...prev,
    {
      id: Date.now(),
      name: partnerData.name,
      cert: false,
      sampleTAC: false,
      latoT: false,
    },
  ]);

  setPartnerData({ name: "" });
  setShowPartnerModal(false);
};

const saveStakeholder = () => {
  if (!stakeholderData.name.trim()) return;

  setStakeholders((prev) => [
  ...prev,
  {
    id: Date.now(),
    name: stakeholderData.name,
    open: true,
    sampleReqDate: stakeholderData.sampleReqDate,
    sampleSubDate: stakeholderData.sampleSubDate,
    feedback: "",
    corrections: "",
    furtherActions: "",
  },
]);

  setStakeholderData({
    name: "",
    sampleReqDate: "",
    sampleSubDate: "",
    status: "Pending",
  });

  setShowStakeholderModal(false);
};

  const saveFirm = () => {
  if (!firmData.firm.trim()) return;

  setProcurements((prev) => [
    ...prev,
    {
      id: Date.now(),
      firm: firmData.firm,
      count: firmData.count,
      orderNo: firmData.orderNo,
      date: firmData.date,
    },
  ]);

  setFirmData({
    firm: "",
    count: "",
    orderNo: "",
    date: "",
  });

  setShowFirmModal(false);
};

const saveDocument = () => {
  if (!newDocumentName.trim()) return;

  setCustomDocuments((prev) => [
    ...prev,
    newDocumentName.trim(),
  ]);

  setNewDocumentName("");
  setShowDocumentModal(false);
};
  // Step 2 – ToT
  const [totStatus, setTotStatus] = useState("");
  const [totCerts, setTotCerts] = useState({ TTD: false, TNF: false, TAC: false, CEC: false});
  const [totPartners, setTotPartners] = useState([]);

  // Step 3 – IPR
  const [iprData, setIprData] = useState({
    patent:    { filed: false, granted: false, fileNo: "", grantedNo: "" },
    trademark: { filed: false, granted: false, fileNo: "", grantedNo: "" },
    design:    { filed: false, granted: false, fileNo: "", grantedNo: "" },
  });

  // Step 4 – Stakeholders
  const [stakeholders, setStakeholders] = useState([]);

  // Step 5 – Docs
  const [checkedDocs, setCheckedDocs] = useState(new Set());
    const [customDocuments, setCustomDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");

  // Step 6 – Procurement
  const [procurements, setProcurements] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: "", code: "", category: "", description: "",
      priority: "High", expectedCompletionDate: "",
      developmentStatus: "",
      totDocumentNo: "", filledDate: "",
    },
  });

  const goNext = () => {
    setDone((p) => new Set([...p, step]));
    setStep((s) => Math.min(s + 1, STEPS.length));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleStepClick = (id) => {
    setStep(id);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,

      totStatus,

      totPartners: totPartners.map(p => ({
        partnerName: p.name,
        totCertificate: p.cert,
        sampleSubmittedForTac: p.sampleTAC,
        latotSignature: p.latoT
      })),

      iprDetail: {
        patentFiled: iprData.patent.filed,
        patentGranted: iprData.patent.granted,
        patentNumber: iprData.patent.fileNo,
        patentGrantedNumber: iprData.patent.grantedNo,

        trademarkFiled: iprData.trademark.filed,
        trademarkGranted: iprData.trademark.granted,
        trademarkNumber: iprData.trademark.fileNo,
        trademarkGrantedNumber: iprData.trademark.grantedNo,

        designFiled: iprData.design.filed,
        designGranted: iprData.design.granted,
        designNumber: iprData.design.fileNo,
        designGrantedNumber: iprData.design.grantedNo
      },

      procurementDetails: procurements.map(p => ({
        organisationName: p.firm,
        itemsProcured: Number(p.count),
        orderNumber: p.orderNo,
        orderDate: p.date
      })),

      trialStakeholders: stakeholders.map(s => ({
        stakeholderName: s.name,
        sampleRequestDate: s.sampleReqDate,
        sampleSubmissionDate: s.sampleSubDate,
        feedback: s.feedback,
        correction: s.corrections,
        furtherAction: s.furtherActions
      })),

      documentation: [...checkedDocs]
    };

    try {
      console.log("PAYLOAD", payload);
      const result = await dispatch(createItemAsync(payload)).unwrap();
      setSuccessData(result);
    } catch (_) {}
  };

  const handleAddAnother = () => {
    setSuccessData(null); reset();
    setStep(1); setDone(new Set());
    setCheckedDocs(new Set());
    setImagePreview(null);
  };
  const [showPartnerModal, setShowPartnerModal] = useState(false);

const [partnerData, setPartnerData] = useState({
  name: "",
});

const [showStakeholderModal, setShowStakeholderModal] =
  useState(false);

const [stakeholderData, setStakeholderData] = useState({
  name: "",
  sampleReqDate: "",
  sampleSubDate: "",
  status: "Pending",
});

const [showFirmModal, setShowFirmModal] =
  useState(false);

const [firmData, setFirmData] = useState({
  firm: "",
  count: "",
  orderNo: "",
  date: "",
});

  const toggleDoc   = (item) => setCheckedDocs((p) => { const n = new Set(p); n.has(item) ? n.delete(item) : n.add(item); return n; });
  const togglePart  = (id, f) => setTotPartners((p) => p.map((x) => x.id === id ? { ...x, [f]: !x[f] } : x));
  const toggleIpr   = (sec, f) => setIprData((p) => ({ ...p, [sec]: { ...p[sec], [f]: !p[sec][f] } }));
  const toggleSh = (id) =>
    setStakeholders((prev) =>
      prev.map((s) => ({
        ...s,
        open: s.id === id ? !s.open : false,
      }))
    );
  const updateSh    = (id, f, v) => setStakeholders((p) => p.map((s) => s.id === id ? { ...s, [f]: v } : s));

  const cur = STEPS[step - 1];

  return (
    <>
      {/* ── Step tab bar ── */}
      <div className="aif__tabs">
        {STEPS.map((s) => {
          const isDone   = done.has(s.id) && s.id !== step;
          const isActive = s.id === step;
          const clickable= isDone || isActive || done.has(s.id);
          return (
            <div
              key={s.id}
              className={`aif__tab${isActive ? " aif__tab--active" : ""}${isDone ? " aif__tab--done" : ""} aif__tab--clickable`}
              onClick={() => handleStepClick(s.id)}
            >
              {isDone
                ? <span className="aif__tab-dot aif__tab-dot--done">{Icons.check}</span>
                : <span className={`aif__tab-dot${isActive ? " aif__tab-dot--active" : ""}`}>{s.id}</span>
              }
              <span className="aif__tab-lbl">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Step content card ── */}
      <div className="aif__card">
        {/* Card header */}
        <div className="aif__card-head">
          <span className={`aif__card-icon aif__card-icon--${STEP_COLORS[cur.icon]}`}>{Icons[cur.icon]}</span>
          <span className="aif__card-title">{cur.label}</span>
        </div>

        {/* ────────── STEP 1 ────────── */}
        {step === 1 && (
          <div className="aif__s1-layout">
            {/* Image upload */}
            <div className="aif__img-col">
              <div
                className={`aif__img-box${imagePreview ? " aif__img-box--filled" : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="aif__img-preview" />
                  : <>
                      <span className="aif__img-icon">{Icons.upload}</span>
                      <span className="aif__img-label">Upload Image</span>
                      <span className="aif__img-hint">Click to browse<br/>JPG, PNG up to 5MB</span>
                    </>
                }
              </div>
              <input
                ref={fileInputRef} type="file" accept="image/*" hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImagePreview(URL.createObjectURL(f));
                }}
              />
              {imagePreview && (
                <button type="button" className="aif__img-remove" onClick={() => { setImagePreview(null); fileInputRef.current.value = ""; }}>
                  Remove
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="aif__s1-fields">
              <div className="aif__row2">
                <div className="form-group">
                  <label className="form-label">Item Name <span className="required">*</span></label>
                  <input className={`form-control${errors.name ? " form-control--error" : ""}`}
                    placeholder="e.g. Knee Brace"
                    {...register("name", { required: "Required" })} />
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Item Code <span className="required">*</span></label>
                  <input className={`form-control${errors.code ? " form-control--error" : ""}`}
                    placeholder="PG-KB-001"
                    {...register("code", { required: "Required" })} />
                  {errors.code && <span className="form-error">{errors.code.message}</span>}
                </div>
              </div>

              <div className="aif__row2">
                <div className="form-group">
                  <label className="form-label">Category <span className="required">*</span></label>
                  <select className={`form-control${errors.category ? " form-control--error" : ""}`}
                    {...register("category", { required: "Required" })}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <span className="form-error">{errors.category.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Development Status <span className="required">*</span></label>
                  <select className={`form-control${errors.developmentStatus ? " form-control--error" : ""}`}
                    {...register("developmentStatus", { required: "Required" })}>
                    <option value="">Select status</option>
                    {Object.values(DEVELOPMENT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.developmentStatus && <span className="form-error">{errors.developmentStatus.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description <span className="required">*</span></label>
                <textarea className={`form-control${errors.description ? " form-control--error" : ""}`}
                  placeholder="Brief item description..." rows={3} maxLength={200}
                  {...register("description", { required: "Required" })} />
                {errors.description && <span className="form-error">{errors.description.message}</span>}
              </div>

              <div className="aif__row2">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-control" {...register("priority")}>
                    {Object.values(PRIORITY).map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Completion Date</label>
                  <input type="date" className="form-control" {...register("expectedCompletionDate")} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────── STEP 2: ToT ────────── */}
        {step === 2 && (
          <div className="aif__step-body">
            <div className="aif__row2">
              <div className="form-group">
                <label className="form-label">ToT Status</label>
                <div className="aif__radio-row">
                  {["Filed", "To Be Filed"].map((opt) => (
                    <label key={opt} className="aif__radio-item" onClick={() => setTotStatus(opt)}>
                      <span className={`aif__radio${totStatus === opt ? " aif__radio--on" : ""}`}>
                        {totStatus === opt && <span className="aif__radio-dot" />}
                      </span>
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ToT Document Filed</label>
                <div className="aif__cert-row">
                  {Object.keys(totCerts).map((cert) => (
                    <label key={cert} className="aif__cert-item"
                      onClick={() => setTotCerts((p) => ({ ...p, [cert]: !p[cert] }))}>
                      <Checkbox checked={totCerts[cert]} onChange={() => {}} />
                      {cert}
                    </label>
                  ))}
                </div>
              </div>
            </div>


            <div>
              <div className="aif__tbl-head-row">
                <span className="aif__section-label">ToT Partners</span>
                <button
                  type="button"
                  className="aif__add-link"
                  onClick={() => setShowPartnerModal(true)}
                >
                 {Icons.plus} Add Partner
                </button>
              </div>
              <div className="aif__tbl-wrap">
                <table className="aif__tbl">
                  <thead><tr>
                    <th>Partner Name</th>
                    <th>ToT Certificate</th>
                    <th>Sample Submitted for TAC</th>
                    <th>LaToT Signature</th>
                    <th>Actions</th>
                  </tr></thead>
                  <tbody>
  {totPartners.length === 0 ? (
    <tr>
      <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
        No partners available
      </td>
    </tr>
  ) : (
    totPartners.map((p) => (
      <tr key={p.id}>
        <td>{p.name}</td>
        <td>
          <Checkbox
            checked={p.cert}
            onChange={() => togglePart(p.id, "cert")}
          />
        </td>
        <td>
          <Checkbox
            checked={p.sampleTAC}
            onChange={() => togglePart(p.id, "sampleTAC")}
          />
        </td>
        <td>
          <Checkbox
            checked={p.latoT}
            onChange={() => togglePart(p.id, "latoT")}
          />
        </td>
        <td>
          <button
            type="button"
            className="aif__del-btn"
            onClick={() =>
              setTotPartners((x) =>
                x.filter((t) => t.id !== p.id)
              )
            }
          >
            {Icons.trash}
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ────────── STEP 3: IPR ────────── */}
        {step === 3 && (
          <div className="aif__step-body">
            {[
              { key:"patent",    title:"Patent",    fLbl:"Patent / File Number",    gLbl:"Granted Number" },
              { key:"trademark", title:"Trademark", fLbl:"Trademark / File Number", gLbl:"Granted Number" },
              { key:"design",    title:"Design",    fLbl:"Design / File Number",    gLbl:"Granted Number" },
            ].map(({ key, title, fLbl, gLbl }) => (
              <div key={key} className="aif__ipr-block">
                <div className="aif__ipr-title">{title}</div>
                <div className="aif__ipr-grid">
                  <div className="aif__ipr-check-row">
                    <Checkbox checked={iprData[key].filed}   onChange={() => toggleIpr(key,"filed")}   />
                    <span className="aif__ipr-lbl">Filed</span>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">{fLbl}</label>
                    <input className="form-control" defaultValue={iprData[key].fileNo}
                      onChange={(e) => setIprData((p) => ({...p,[key]:{...p[key],fileNo:e.target.value}}))} />
                  </div>
                  <div className="aif__ipr-check-row">
                    <Checkbox checked={iprData[key].granted} onChange={() => toggleIpr(key,"granted")} />
                    <span className="aif__ipr-lbl">Granted</span>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">{gLbl}</label>
                    <input className="form-control" defaultValue={iprData[key].grantedNo}
                      onChange={(e) => setIprData((p) => ({...p,[key]:{...p[key],grantedNo:e.target.value}}))} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ────────── STEP 4: Stakeholders ────────── */}
{/* ────────── STEP 4: Stakeholders ────────── */}
{step === 4 && (
  <div className="aif__step-body">

    <div className="aif__tbl-head-row">
      <span className="aif__section-label">
        {stakeholders.length} stakeholder
        {stakeholders.length !== 1 ? "s" : ""}
      </span>

      <button
        type="button"
        className="aif__add-link"
        onClick={() => setShowStakeholderModal(true)}
      >
        {Icons.plus} Add Stakeholder
      </button>
    </div>

    {stakeholders.length === 0 ? (
      <div className="aif__empty-card">
        No stakeholders available
      </div>
    ) : (
      stakeholders.map((s, index) => (
        <div
          key={s.id}
          className="aif__stakeholder-card"
        >
          <div className="aif__stakeholder-header">
            <button
              type="button"
              className="aif__stakeholder-toggle"
              onClick={() => toggleSh(s.id)}
            >
              <span className="aif__stakeholder-arrow">
                {s.open ? "▼" : "▶"}
              </span>

              <span className="aif__stakeholder-title">
                {s.name || "Unnamed Stakeholder"}
              </span>
            </button>

            <button
              type="button"
              className="aif__del-btn"
              onClick={() =>
                setStakeholders((x) =>
                  x.filter((item) => item.id !== s.id)
                )
              }
            >
              {Icons.trash}
            </button>

          </div>
          {s.open && (
           <>
          <div className="aif__row2">

  <div className="form-group">
    <label className="form-label">
      Request For Sample Trial Date
    </label>

    <input
      type="date"
      className="form-control"
      value={s.sampleReqDate}
      onChange={(e) =>
        updateSh(
          s.id,
          "sampleReqDate",
          e.target.value
        )
      }
    />
  </div>

  <div className="form-group">
    <label className="form-label">
      Date Of Sample Submission
    </label>

    <input
      type="date"
      className="form-control"
      value={s.sampleSubDate}
      onChange={(e) =>
        updateSh(
          s.id,
          "sampleSubDate",
          e.target.value
        )
      }
    />
  </div>

</div>

          <div className="form-group">
            <label className="form-label">
              Feedback
            </label>

            <textarea
              rows={3}
              className="form-control"
              value={s.feedback}
              onChange={(e) =>
                updateSh(
                  s.id,
                  "feedback",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Corrections
            </label>

            <textarea
              rows={3}
              className="form-control"
              value={s.corrections}
              onChange={(e) =>
                updateSh(
                  s.id,
                  "corrections",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Further Actions
            </label>

            <textarea
              rows={3}
              className="form-control"
              value={s.furtherActions || ""}
              onChange={(e) =>
                updateSh(
                  s.id,
                  "furtherActions",
                  e.target.value
                )
              }
            />
          </div>
            </>
            )}

        </div>
      ))
    )}
  </div>
)}

        {/* ────────── STEP 5: Documentation ────────── */}
        {step === 5 && (
  <div className="aif__step-body">

    <div className="aif__tbl-head-row">
      <span className="aif__section-label">
        Documentation Status
      </span>

      <button
        type="button"
        className="aif__add-link"
        onClick={() => setShowDocumentModal(true)}
      >
        {Icons.plus} Add Document
      </button>
    </div>

    <div className="aif__doc-list">

      {[...DOCUMENTATION_ITEMS, ...customDocuments].map(
        (item) => (
          <div
            key={item}
            className="aif__doc-row"
            onClick={() => toggleDoc(item)}
          >
            <div className="aif__doc-left">
              <Checkbox
                checked={checkedDocs.has(item)}
                onChange={() => {}}
              />

              <span className="aif__doc-name">
                {item}
              </span>
            </div>

            <span className="aif__doc-icon">
              {Icons.file}
            </span>
          </div>
        )
      )}

    </div>
  </div>
)}

        {/* ────────── STEP 6: Procurement ────────── */}
        {step === 6 && (
          <div className="aif__step-body">
            <div className="aif__tbl-head-row">
              <span className="aif__section-label">{procurements.length} firm{procurements.length!==1?"s":""} listed</span>
              <button
  type="button"
  className="aif__add-link"
  onClick={() => setShowFirmModal(true)}
>{Icons.plus} Add Firm / Organisation</button>
            </div>
            <div className="aif__tbl-wrap">
              <table className="aif__tbl">
                <thead><tr>
                  <th>Firm / Organisation Name</th>
                  <th>No. of Items Procured</th>
                  <th>Order Number</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr></thead>
                <tbody>
  {procurements.length === 0 ? (
    <tr>
      <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
        No organisations available
      </td>
    </tr>
  ) : (
    procurements.map((p) => (
      <tr key={p.id}>
        <td>{p.firm}</td>
        <td>{p.count}</td>
        <td>{p.orderNo}</td>
        <td>{p.date}</td>
        <td>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="aif__action-btn aif__action-btn--edit"
              style={{ padding: "4px 8px" }}
            >
              {Icons.edit}
            </button>

            <button
              type="button"
              className="aif__del-btn"
              onClick={() =>
                setProcurements((x) =>
                  x.filter((t) => t.id !== p.id)
                )
              }
            >
              {Icons.trash}
            </button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="aif__footer">
          <div>
            {step > 1 && (
              <button type="button" className="aif__nav-btn aif__nav-btn--prev" onClick={goPrev}>
                {Icons.arrowLeft} Previous
              </button>
            )}
          </div>
          <div className="aif__footer-right">
            <button type="button" className="aif__nav-btn aif__nav-btn--cancel" onClick={onCancel}>
              {Icons.close} Cancel
            </button>
            {step < STEPS.length
              ? <button type="button" className="aif__nav-btn aif__nav-btn--next" onClick={goNext}>
                  Next {Icons.arrowRight}
                </button>
              : <button type="button" className="aif__nav-btn aif__nav-btn--save"
                  disabled={submitting} onClick={handleSubmit(onSubmit)}>
                  {submitting ? <span className="aif__spin"/> : Icons.check}
                  {submitting ? "Saving…" : "Save Item"}
                </button>
            }
          </div>
        </div>
      </div>
      <AddRecordModal
        open={showPartnerModal}
        title="Add ToT Partner"
        fields={[
          {
            name: "name",
            label: "Partner Name",
          },
        ]}
        values={partnerData}
        onChange={(name, value) =>
          setPartnerData((prev) => ({
            ...prev,
            [name]: value,
          }))
        }
        onClose={() => setShowPartnerModal(false)}
        onSave={savePartner}
      />
      <AddRecordModal
        open={showStakeholderModal}
        title="Add Stakeholder"
        fields={[
          {
            name: "name",
            label: "Stakeholder Name",
          },
          {
            name: "sampleReqDate",
            label: "Request Trial Date",
            type: "date",
          },
          {
            name: "sampleSubDate",
            label: "Sample Submission Date",
            type: "date",
          },
        ]}
        values={stakeholderData}
        onChange={(name, value) =>
          setStakeholderData((prev) => ({
            ...prev,
            [name]: value,
          }))
        }
        onClose={() => setShowStakeholderModal(false)}
        onSave={saveStakeholder}
      />
      <AddRecordModal
      open={showFirmModal}
      title="Add Organisation"
      fields={[
        {
          name: "firm",
          label: "Organisation Name",
        },
        {
          name: "count",
          label: "No. of Items Procured",
          type: "number",
        },
        {
          name: "orderNo",
          label: "Order Number",
        },
        {
          name: "date",
          label: "Order Date",
          type: "date",
        },
      ]}
      values={firmData}
      onChange={(name, value) =>
        setFirmData((prev) => ({
          ...prev,
          [name]: value,
        }))
      }
      onClose={() => setShowFirmModal(false)}
      onSave={saveFirm}
    />
    {showDocumentModal && (
      <div className="arm__overlay">
        <div className="arm__modal">

          <div className="arm__header">
            <h3>Add Document</h3>

            <button
              className="arm__close"
              onClick={() =>
                setShowDocumentModal(false)
              }
            >
              ✕
            </button>
          </div>

          <div className="arm__body">

            <div className="arm__group">
              <label>Document Name</label>

              <input
                type="text"
                value={newDocumentName}
                onChange={(e) =>
                  setNewDocumentName(e.target.value)
                }
                placeholder="e.g. Trial Report"
              />
            </div>

          </div>

          <div className="arm__footer">

            <button
              className="arm__cancel"
              onClick={() =>
                setShowDocumentModal(false)
              }
            >
              Cancel
            </button>

            <button
              className="arm__save"
              onClick={saveDocument}
            >
              Save
            </button>

          </div>
        </div>
      </div>
    )}
      <SuccessPopup
        open={!!successData}
        onClose={() => { setSuccessData(null); onSuccess?.(); }}
        itemName={successData?.name}
        onAddAnother={handleAddAnother}
        onViewItem={successData ? () => onSuccess?.(successData.id) : undefined}
      />
    </>
  );
}