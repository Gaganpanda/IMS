import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { updateItemAsync, uploadImageAsync } from "../../../redux/slices/itemSlice";
import AddRecordModal from "../../common/AddRecordModal/AddRecordModal";
import {
  CATEGORIES, DEVELOPMENT_STATUS, TOT_STATUS, TOT_DOCUMENTS,
  DOCUMENTATION_ITEMS, PRIORITY,
} from "../../../utils/constants";
import { toInputDate } from "../../../utils/formatDate";
import { getImageUrl } from "../../../utils/imageUrl";
import "./EditItemForm.css";

const STEPS = [
  { id: 1, label: "Basic Information",    icon: "basic"       },
  { id: 2, label: "ToT Details",          icon: "tot"         },
  { id: 3, label: "IPR Details",          icon: "ipr"         },
  { id: 4, label: "Trial Stakeholders",   icon: "trials"      },
  { id: 5, label: "Documentation Status", icon: "docs"        },
  { id: 6, label: "Procurement Status",   icon: "procurement" },
];

const STEP_COLORS = {
  basic: "blue", tot: "orange", ipr: "purple",
  trials: "teal", docs: "teal", procurement: "green",
};

const Icons = {
  basic:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>),
  tot:         (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>),
  ipr:         (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>),
  trials:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6"/><path d="M10 3v5l-4 7a4 4 0 0 0 3.5 6h5a4 4 0 0 0 3.5-6l-4-7V3"/></svg>),
  docs:        (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/></svg>),
  procurement: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>),
  check:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  plus:        (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  trash:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  file:        (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>),
  arrowLeft:   (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>),
  arrowRight:  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
  close:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  upload:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>),
  chevronDown: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>),
};

function getInitials(name) {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Checkbox({ checked, onChange }) {
  return (
    <div className={`eif__check${checked ? " eif__check--on" : ""}`} onClick={onChange}>
      {checked && (
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1.5 6 4.5 9 10.5 3" />
        </svg>
      )}
    </div>
  );
}

let nid = 200;
const uid = () => ++nid;

export default function EditItemForm({ item, onCancel, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting } = useSelector((s) => s.items);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(new Set());
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Step 2 – ToT
  const [totStatus, setTotStatus]     = useState("");
  const [totCerts, setTotCerts]       = useState(
    Object.keys(TOT_DOCUMENTS).reduce((acc, k) => ({ ...acc, [k]: false }), {})
  );
  const [totPartners, setTotPartners] = useState([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerData, setPartnerData] = useState({ name: "" });

  // Step 3 – IPR
  const [iprData, setIprData] = useState({
    patent:    { filed: false, granted: false, fileNo: "", grantedNo: "" },
    trademark: { filed: false, granted: false, fileNo: "", grantedNo: "" },
    design:    { filed: false, granted: false, fileNo: "", grantedNo: "" },
  });

  // Step 4 – Stakeholders
  const [stakeholders, setStakeholders] = useState([]);
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const [stakeholderData, setStakeholderData] = useState({ name: "", sampleReqDate: "", sampleSubDate: "" });

  // Step 5 – Docs
  const [checkedDocs, setCheckedDocs]         = useState(new Set());
  const [customDocuments, setCustomDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");

  // Step 6 – Procurement
  const [procurements, setProcurements] = useState([]);
  const [showFirmModal, setShowFirmModal] = useState(false);
  const [firmData, setFirmData] = useState({ firm: "", count: "", orderNo: "", date: "" });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!item) return;

    const existingImage = item.imageUrl ? getImageUrl(item.imageUrl) : null;
    setImagePreview(existingImage);

    reset({
      name:                   item.name                || "",
      code:                   item.code                || "",
      category:               item.category            || "",
      description:            item.description         || "",
      priority:               item.priority            || "High",
      expectedCompletionDate: toInputDate(item.expectedCompletionDate),
      developmentStatus:      item.developmentStatus   || "",
      totDocumentNo:          item.totDocumentNo       || "",
      filledDate:             toInputDate(item.filledDate),
    });

    const normalizedTotStatus = /^Filed|^Filled/i.test(item.totStatus || "")
      ? TOT_STATUS.FILED
      : item.totStatus
        ? TOT_STATUS.TO_BE_FILED
        : "";
    setTotStatus(normalizedTotStatus);
    setTotCerts(
      Object.keys(TOT_DOCUMENTS).reduce(
        (acc, k) => ({ ...acc, [k]: (item.totDocumentsFiled || []).includes(k) }),
        {}
      )
    );
    setCheckedDocs(new Set(item.documentation || []));

    setTotPartners(
      item.totPartners?.map((p) => ({
        id: p.id || uid(),
        name: p.partnerName || "",
        cert: p.totCertificate || false,
        sampleTAC: p.sampleSubmittedForTac || false,
        latoT: p.latotSignature || false,
      })) || []
    );

    setIprData({
      patent: {
        filed:     item.iprDetail?.patentFiled         || false,
        granted:   item.iprDetail?.patentGranted       || false,
        fileNo:    item.iprDetail?.patentNumber        || "",
        grantedNo: item.iprDetail?.patentGrantedNumber || "",
      },
      trademark: {
        filed:     item.iprDetail?.trademarkFiled         || false,
        granted:   item.iprDetail?.trademarkGranted       || false,
        fileNo:    item.iprDetail?.trademarkNumber        || "",
        grantedNo: item.iprDetail?.trademarkGrantedNumber || "",
      },
      design: {
        filed:     item.iprDetail?.designFiled         || false,
        granted:   item.iprDetail?.designGranted       || false,
        fileNo:    item.iprDetail?.designNumber        || "",
        grantedNo: item.iprDetail?.designGrantedNumber || "",
      },
    });

    setStakeholders(
      item.trialStakeholders?.map((s) => ({
        id:             s.id || uid(),
        name:           s.stakeholderName || s.name || "",
        sampleReqDate:  s.sampleRequestDate    || "",
        sampleSubDate:  s.sampleSubmissionDate || "",
        feedback:       s.feedback      || "",
        corrections:    s.correction    || "",
        furtherActions: s.furtherAction || "",
        status:         s.status || "Not Started",
        open: false,
      })) || []
    );

    setProcurements(
      item.procurementDetails?.map((p) => ({
        id:      p.id || uid(),
        firm:    p.organisationName || "",
        count:   p.itemsProcured   || "",
        orderNo: p.orderNumber     || "",
        date:    p.orderDate       || "",
      })) || []
    );
  }, [item, reset]);

  const goNext = () => { setDone((p) => new Set([...p, step])); setStep((s) => Math.min(s + 1, STEPS.length)); };
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data) => {
    const payload = {
      name:                   data.name,
      code:                   data.code,
      category:               data.category,
      description:            data.description,
      priority:               data.priority,
      expectedCompletionDate: data.expectedCompletionDate || null,
      developmentStatus:      data.developmentStatus,
      totStatus,
      totDocumentNo: data.totDocumentNo || null,
      filledDate:    data.filledDate    || null,
      totDocumentsFiled: totStatus === TOT_STATUS.FILED
        ? Object.keys(totCerts).filter((k) => totCerts[k])
        : [],
      totPartners: totPartners.map((p) => ({
        partnerName:           p.name,
        totCertificate:        p.cert,
        sampleSubmittedForTac: p.sampleTAC,
        latotSignature:        p.latoT,
      })),
      iprDetail: {
        patentFiled:            iprData.patent.filed,
        patentGranted:          iprData.patent.granted,
        patentNumber:           iprData.patent.fileNo,
        patentGrantedNumber:    iprData.patent.grantedNo,
        trademarkFiled:         iprData.trademark.filed,
        trademarkGranted:       iprData.trademark.granted,
        trademarkNumber:        iprData.trademark.fileNo,
        trademarkGrantedNumber: iprData.trademark.grantedNo,
        designFiled:            iprData.design.filed,
        designGranted:          iprData.design.granted,
        designNumber:           iprData.design.fileNo,
        designGrantedNumber:    iprData.design.grantedNo,
      },
      trialStakeholders: stakeholders.map((s) => ({
        stakeholderName:      s.name,
        sampleRequestDate:    s.sampleReqDate || null,
        sampleSubmissionDate: s.sampleSubDate || null,
        feedback:             s.feedback      || "",
        correction:           s.corrections   || "",
        furtherAction:        s.furtherActions|| "",
        status:               s.status || "Not Started",
      })),
      documentation: [...checkedDocs],
      procurementDetails: procurements.map((p) => ({
        organisationName: p.firm,
        itemsProcured:    Number(p.count) || 0,
        orderNumber:      p.orderNo,
        orderDate:        p.date || null,
      })),
    };

    try {
      console.log("UPDATE PAYLOAD", payload);
      await dispatch(updateItemAsync({ id: item.id, data: payload })).unwrap();
      if (imageFile) {
        await dispatch(uploadImageAsync({ id: item.id, file: imageFile }));
      }
      onSuccess?.();
    } catch (_) {}
  };

  const toggleDoc  = (d)      => setCheckedDocs((p) => { const n = new Set(p); n.has(d) ? n.delete(d) : n.add(d); return n; });
  const togglePart = (id, f)  => setTotPartners((p) => p.map((x) => x.id === id ? { ...x, [f]: !x[f] } : x));
  const toggleIpr  = (sec, f) => setIprData((p) => ({ ...p, [sec]: { ...p[sec], [f]: !p[sec][f] } }));
  const toggleSh   = (id)     => setStakeholders((p) => p.map((s) => ({ ...s, open: s.id === id ? !s.open : false })));
  const updateSh   = (id, f, v) => setStakeholders((p) => p.map((s) => s.id === id ? { ...s, [f]: v } : s));

  const savePartner = () => {
    if (!partnerData.name.trim()) return;
    setTotPartners((p) => [...p, { id: uid(), name: partnerData.name.trim(), cert: false, sampleTAC: false, latoT: false }]);
    setPartnerData({ name: "" });
    setShowPartnerModal(false);
  };
  const saveStakeholder = () => {
    if (!stakeholderData.name.trim()) return;
    setStakeholders((p) => [...p, {
      id: uid(), name: stakeholderData.name.trim(), open: true,
      sampleReqDate: stakeholderData.sampleReqDate,
      sampleSubDate: stakeholderData.sampleSubDate,
      feedback: "", corrections: "", furtherActions: "",
    }]);
    setStakeholderData({ name: "", sampleReqDate: "", sampleSubDate: "" });
    setShowStakeholderModal(false);
  };
  const saveFirm = () => {
    if (!firmData.firm.trim()) return;
    setProcurements((p) => [...p, { id: uid(), ...firmData }]);
    setFirmData({ firm: "", count: "", orderNo: "", date: "" });
    setShowFirmModal(false);
  };
  const saveDocument = () => {
    if (!newDocumentName.trim()) return;
    const d = newDocumentName.trim();
    setCustomDocuments((p) => [...p, d]);
    setCheckedDocs((p) => { const n = new Set(p); n.add(d); return n; });
    setNewDocumentName("");
    setShowDocumentModal(false);
  };

  const cur = STEPS[step - 1];

  return (
    <>
      {/* ── Step tab bar ── */}
      <div className="eif__tabs">
        {STEPS.map((s) => {
          const isDone   = done.has(s.id) && s.id !== step;
          const isActive = s.id === step;
          return (
            <div key={s.id}
              className={`eif__tab eif__tab--clickable${isActive ? " eif__tab--active" : ""}${isDone ? " eif__tab--done" : ""}`}
              onClick={() => setStep(s.id)}>
              {isDone
                ? <span className="eif__tab-dot eif__tab-dot--done">{Icons.check}</span>
                : <span className={`eif__tab-dot${isActive ? " eif__tab-dot--active" : ""}`}>{s.id}</span>
              }
              <span className="eif__tab-lbl">{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="eif__card">
        {/* Card header */}
        <div className="eif__card-head">
          <span className={`eif__card-icon eif__card-icon--${STEP_COLORS[cur.icon]}`}>
            {Icons[cur.icon]}
          </span>
          <span className="eif__card-title">{cur.label}</span>
        </div>

        {/* ── STEP 1: Basic Information ── */}
        {step === 1 && (
          <div className="eif__s1-layout">
            <div className="eif__img-col">
              <div className={`eif__img-box${imagePreview ? " eif__img-box--filled" : ""}`}
                onClick={() => fileInputRef.current?.click()}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="eif__img-preview" />
                  : <>
                      <span className="eif__img-icon">{Icons.upload}</span>
                      <span className="eif__img-label">Upload Image</span>
                      <span className="eif__img-hint">Click to browse<br />JPG, PNG up to 5MB</span>
                    </>
                }
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                }} />
              {imagePreview && (
                <button type="button" className="eif__img-remove"
                  onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                  Remove
                </button>
              )}
            </div>

            <div className="eif__s1-fields">
              <div className="eif__row2">
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

              <div className="eif__row2">
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

              <div className="eif__row2">
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

        {/* ── STEP 2: ToT Details ── */}
        {step === 2 && (
          <div className="eif__step-body">
            <div className="form-group">
              <label className="form-label">ToT Status</label>
              <div className="eif__radio-row">
                {Object.values(TOT_STATUS).map((opt) => (
                  <label key={opt} className="eif__radio-item" onClick={() => setTotStatus(opt)}>
                    <span className={`eif__radio${totStatus === opt ? " eif__radio--on" : ""}`}>
                      {totStatus === opt && <span className="eif__radio-dot" />}
                    </span>
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {totStatus === TOT_STATUS.FILED && (
              <div className="form-group">
                <label className="form-label">ToT Document Filed</label>
                <div className="eif__cert-row">
                  {Object.keys(TOT_DOCUMENTS).map((cert) => (
                    <label key={cert} className="eif__cert-item"
                      onClick={() => setTotCerts((p) => ({ ...p, [cert]: !p[cert] }))}>
                      <Checkbox checked={totCerts[cert]} onChange={() => {}} />
                      {TOT_DOCUMENTS[cert]}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="eif__tbl-head-row">
                <span className="eif__section-label">ToT Partners</span>
                <button type="button" className="eif__add-link" onClick={() => setShowPartnerModal(true)}>
                  {Icons.plus} Add Partner
                </button>
              </div>
              <div className="eif__tbl-wrap">
                <table className="eif__tbl">
                  <thead><tr>
                    <th>Partner Name</th><th>ToT Certificate</th>
                    <th>Sample Submitted for TAC</th><th>LaToT Signature</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {totPartners.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign:"center", padding:"20px 0", color:"#94a3b8", fontSize:12.5 }}>No partners added yet</td></tr>
                    ) : totPartners.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td><Checkbox checked={p.cert}      onChange={() => togglePart(p.id, "cert")}      /></td>
                        <td><Checkbox checked={p.sampleTAC} onChange={() => togglePart(p.id, "sampleTAC")} /></td>
                        <td><Checkbox checked={p.latoT}     onChange={() => togglePart(p.id, "latoT")}     /></td>
                        <td><button type="button" className="eif__del-btn"
                          onClick={() => setTotPartners((x) => x.filter((t) => t.id !== p.id))}>{Icons.trash}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: IPR Details ── */}
        {step === 3 && (
          <div className="eif__step-body">
            {[
              { key: "patent",    title: "Patent",    fLbl: "Patent / File Number",    gLbl: "Granted Number" },
              { key: "trademark", title: "Trademark", fLbl: "Trademark / File Number", gLbl: "Granted Number" },
              { key: "design",    title: "Design",    fLbl: "Design / File Number",    gLbl: "Granted Number" },
            ].map(({ key, title, fLbl, gLbl }) => (
              <div key={key} className="eif__ipr-block">
                <div className="eif__ipr-title">{title}</div>
                <div className="eif__ipr-grid">
                  <div className="eif__ipr-check-row">
                    <Checkbox checked={iprData[key].filed}   onChange={() => toggleIpr(key, "filed")}   />
                    <span className="eif__ipr-lbl">Filed</span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{fLbl}</label>
                    <input className="form-control" value={iprData[key].fileNo}
                      onChange={(e) => setIprData((p) => ({ ...p, [key]: { ...p[key], fileNo: e.target.value } }))} />
                  </div>
                  <div className="eif__ipr-check-row">
                    <Checkbox checked={iprData[key].granted} onChange={() => toggleIpr(key, "granted")} />
                    <span className="eif__ipr-lbl">Granted</span>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{gLbl}</label>
                    <input className="form-control" value={iprData[key].grantedNo}
                      onChange={(e) => setIprData((p) => ({ ...p, [key]: { ...p[key], grantedNo: e.target.value } }))} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 4: Trial Stakeholders ── */}
        {step === 4 && (
          <div className="eif__step-body">
            <div className="eif__tbl-head-row">
              <span className="eif__section-label">
                Trial stakeholders
                <span className="eif__count-pill">{stakeholders.length}</span>
              </span>
              <button type="button" className="eif__add-link" onClick={() => setShowStakeholderModal(true)}>
                {Icons.plus} Add Stakeholder
              </button>
            </div>

            {stakeholders.length === 0 ? (
              <div className="eif__empty-card">
                <p>No stakeholders added yet</p>
              </div>
            ) : stakeholders.map((s) => (
              <div key={s.id} className={`eif__stakeholder-card${s.open ? " open" : ""}`}>

                {/* Header / toggle row */}
                <div className="eif__stakeholder-header" onClick={() => toggleSh(s.id)}>
                  <div className="eif__stakeholder-avatar">{getInitials(s.name)}</div>

                  <div className="eif__stakeholder-info">
                    <div className="eif__stakeholder-name">{s.name || "Unnamed stakeholder"}</div>
                    {(s.sampleReqDate || s.sampleSubDate) && (
                      <div className="eif__stakeholder-meta">
                        {s.sampleReqDate && `Req: ${s.sampleReqDate}`}
                        {s.sampleReqDate && s.sampleSubDate && " · "}
                        {s.sampleSubDate && `Sub: ${s.sampleSubDate}`}
                      </div>
                    )}
                  </div>

                  <select
                    className="eif__stakeholder-status-select"
                    value={s.status || "Not Started"}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateSh(s.id, "status", e.target.value)}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Testing">Testing</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>

                  <span className="eif__stakeholder-chevron">{Icons.chevronDown}</span>

                  <button
                    type="button"
                    className="eif__del-btn"
                    onClick={(e) => { e.stopPropagation(); setStakeholders((x) => x.filter((it) => it.id !== s.id)); }}
                  >
                    {Icons.trash}
                  </button>
                </div>

                {/* Expanded body */}
                {s.open && (
                  <div className="eif__stakeholder-body">
                    <div className="eif__stakeholder-dates">
                      <div className="form-group">
                        <label className="form-label">Request for sample trial date</label>
                        <input type="date" className="form-control" value={s.sampleReqDate}
                          onChange={(e) => updateSh(s.id, "sampleReqDate", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date of sample submission</label>
                        <input type="date" className="form-control" value={s.sampleSubDate}
                          onChange={(e) => updateSh(s.id, "sampleSubDate", e.target.value)} />
                      </div>
                    </div>

                    <div className="eif__stakeholder-divider" />

                    <div className="eif__stakeholder-fields">
                      <div className="form-group">
                        <label className="form-label">Feedback</label>
                        <textarea rows={3} className="form-control"
                          placeholder="Enter feedback from stakeholder…"
                          value={s.feedback}
                          onChange={(e) => updateSh(s.id, "feedback", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Corrections</label>
                        <textarea rows={3} className="form-control"
                          placeholder="List any corrections required…"
                          value={s.corrections}
                          onChange={(e) => updateSh(s.id, "corrections", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Further actions</label>
                        <textarea rows={3} className="form-control"
                          placeholder="Describe further actions…"
                          value={s.furtherActions || ""}
                          onChange={(e) => updateSh(s.id, "furtherActions", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 5: Documentation Status ── */}
        {step === 5 && (
          <div className="eif__step-body">
            <div className="eif__tbl-head-row">
              <span className="eif__section-label">Documentation Status</span>
              <button type="button" className="eif__add-link" onClick={() => setShowDocumentModal(true)}>
                {Icons.plus} Add Document
              </button>
            </div>
            <div className="eif__doc-list">
              {[...DOCUMENTATION_ITEMS, ...customDocuments].map((d) => (
                <div key={d} className="eif__doc-row" onClick={() => toggleDoc(d)}>
                  <div className="eif__doc-left">
                    <Checkbox checked={checkedDocs.has(d)} onChange={() => {}} />
                    <span className="eif__doc-name">{d}</span>
                  </div>
                  <span className="eif__doc-icon">{Icons.file}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 6: Procurement Status ── */}
        {step === 6 && (
          <div className="eif__step-body">
            <div className="eif__tbl-head-row">
              <span className="eif__section-label">
                {procurements.length} firm{procurements.length !== 1 ? "s" : ""} listed
              </span>
              <button type="button" className="eif__add-link" onClick={() => setShowFirmModal(true)}>
                {Icons.plus} Add Firm / Organisation
              </button>
            </div>
            <div className="eif__tbl-wrap">
              <table className="eif__tbl">
                <thead><tr>
                  <th>Firm / Organisation Name</th>
                  <th>No. of Items Procured</th>
                  <th>Order Number</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr></thead>
                <tbody>
                  {procurements.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign:"center", padding:"20px 0", color:"#94a3b8", fontSize:12.5 }}>No procurement entries yet</td></tr>
                  ) : procurements.map((p) => (
                    <tr key={p.id}>
                      <td>{p.firm}</td><td>{p.count}</td><td>{p.orderNo}</td><td>{p.date}</td>
                      <td>
                        <button type="button" className="eif__del-btn"
                          onClick={() => setProcurements((x) => x.filter((t) => t.id !== p.id))}>
                          {Icons.trash}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="eif__footer">
          <div>
            {step > 1 && (
              <button type="button" className="eif__nav-btn eif__nav-btn--prev" onClick={goPrev}>
                {Icons.arrowLeft} Previous
              </button>
            )}
          </div>
          <div className="eif__footer-right">
            <button type="button" className="eif__nav-btn eif__nav-btn--cancel" onClick={onCancel}>
              {Icons.close} Cancel
            </button>
            {step < STEPS.length
              ? <button type="button" className="eif__nav-btn eif__nav-btn--next" onClick={goNext}>
                  Next {Icons.arrowRight}
                </button>
              : <button type="button" className="eif__nav-btn eif__nav-btn--save"
                  disabled={submitting} onClick={handleSubmit(onSubmit)}>
                  {submitting ? <span className="eif__spin" /> : Icons.check}
                  {submitting ? "Saving…" : "Update Item"}
                </button>
            }
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AddRecordModal open={showPartnerModal} title="Add ToT Partner"
        fields={[{ name: "name", label: "Partner Name" }]}
        values={partnerData}
        onChange={(n, v) => setPartnerData((p) => ({ ...p, [n]: v }))}
        onClose={() => setShowPartnerModal(false)} onSave={savePartner} />

      <AddRecordModal open={showStakeholderModal} title="Add Stakeholder"
        fields={[
          { name: "name",          label: "Stakeholder Name" },
          { name: "sampleReqDate", label: "Request Trial Date",     type: "date" },
          { name: "sampleSubDate", label: "Sample Submission Date", type: "date" },
        ]}
        values={stakeholderData}
        onChange={(n, v) => setStakeholderData((p) => ({ ...p, [n]: v }))}
        onClose={() => setShowStakeholderModal(false)} onSave={saveStakeholder} />

      <AddRecordModal open={showFirmModal} title="Add Organisation"
        fields={[
          { name: "firm",    label: "Organisation Name" },
          { name: "count",   label: "No. of Items Procured", type: "number" },
          { name: "orderNo", label: "Order Number" },
          { name: "date",    label: "Order Date",             type: "date" },
        ]}
        values={firmData}
        onChange={(n, v) => setFirmData((p) => ({ ...p, [n]: v }))}
        onClose={() => setShowFirmModal(false)} onSave={saveFirm} />

      {showDocumentModal && (
        <div className="arm__overlay">
          <div className="arm__modal">
            <div className="arm__header">
              <h3>Add Document</h3>
              <button className="arm__close" onClick={() => setShowDocumentModal(false)}>✕</button>
            </div>
            <div className="arm__body">
              <div className="arm__group">
                <label>Document Name</label>
                <input type="text" value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                  placeholder="e.g. Trial Report" />
              </div>
            </div>
            <div className="arm__footer">
              <button className="arm__cancel" onClick={() => setShowDocumentModal(false)}>Cancel</button>
              <button className="arm__save" onClick={saveDocument}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}