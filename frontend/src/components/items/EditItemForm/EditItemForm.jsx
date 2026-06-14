import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { updateItemAsync } from "../../../redux/slices/itemSlice";
import AddRecordModal from "../../common/AddRecordModal/AddRecordModal";
import {
  CATEGORIES, DEVELOPMENT_STATUS, TOT_STATUS,
  IPR_STATUS, DOCUMENTATION_ITEMS, PRIORITY,
} from "../../../utils/constants";
import { toInputDate } from "../../../utils/formatDate";
import "./EditItemForm.css";

const STEPS = [
  { id: 1, label: "Basic Information",    color: "blue"   },
  { id: 2, label: "ToT Details",          color: "orange" },
  { id: 3, label: "IPR Details",          color: "purple" },
  { id: 4, label: "Trial Stakeholders",   color: "teal"   },
  { id: 5, label: "Documentation Status", color: "teal"   },
  { id: 6, label: "Procurement Status",   color: "green"  },
];

const Icons = {
  check:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  plus:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  trash:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  edit:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  file:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>),
  arrowLeft:  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>),
  arrowRight: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
  close:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  upload:     (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>),
};

function CB({ checked, onChange }) {
  return (
    <div className={`eif__check${checked ? " eif__check--on" : ""}`} onClick={onChange}>
      {checked && <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5 6 4.5 9 10.5 3"/></svg>}
    </div>
  );
}

function EmptyRow({ cols, msg }) {
  return (
    <tr><td colSpan={cols} style={{textAlign:"center",padding:"20px 0",color:"#94a3b8",fontSize:12.5,fontWeight:500}}>{msg}</td></tr>
  );
}

let nid = 200;
const uid = () => ++nid;

export default function EditItemForm({ item, onCancel, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting } = useSelector((s) => s.items);
  const [step, setStep]     = useState(1);
  const [done, setDone]     = useState(new Set());
  const fileInputRef        = useRef(null);
  const [imagePreview, setImagePreview] = useState(item?.imageUrl || null);

  // Step 2
  const [totStatus,   setTotStatus]   = useState("");
  const [totCerts,    setTotCerts]    = useState({ TTD:false, TNF:false, TAC:false, CEC:false });
  const [totPartners, setTotPartners] = useState([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerData, setPartnerData] = useState({ name:"" });

  // Step 3
  const [iprData, setIprData] = useState({
    patent:    { filed:false, granted:false, fileNo:"", grantedNo:"" },
    trademark: { filed:false, granted:false, fileNo:"", grantedNo:"" },
    design:    { filed:false, granted:false, fileNo:"", grantedNo:"" },
  });

  // Step 4
  const [stakeholders, setStakeholders]     = useState([]);
  const [showShModal,  setShowShModal]      = useState(false);
  const [shData,       setShData]           = useState({ name:"", sampleReqDate:"", sampleSubDate:"", status:"Pending" });

  // Step 5
  const [checkedDocs,      setCheckedDocs]      = useState(new Set());
  const [customDocuments,  setCustomDocuments]  = useState([]);
  const [showDocModal,     setShowDocModal]      = useState(false);
  const [newDocName,       setNewDocName]        = useState("");

  // Step 6
  const [procurements, setProcurements] = useState([]);
  const [showFirmModal, setShowFirmModal] = useState(false);
  const [firmData, setFirmData] = useState({ firm:"", count:"", orderNo:"", date:"" });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Pre-populate when item loads
  useEffect(() => {
    if (!item) return;
    reset({
      name:                   item.name || "",
      code:                   item.code || "",
      category:               item.category || "",
      description:            item.description || "",
      priority:               item.priority || "High",
      expectedCompletionDate: toInputDate(item.expectedCompletionDate),
      developmentStatus:      item.developmentStatus || "",
      developmentDate:        toInputDate(item.developmentDate),
      remarks:                item.remarks || "",
      totDocumentNo:          item.totDocumentNo || "",
      filledDate:             toInputDate(item.filledDate),
      sampleRequestDate:      toInputDate(item.sampleRequestDate),
      sampleSubmissionDate:   toInputDate(item.sampleSubmissionDate),
      patentNumber:           item.patentNumber || "",
      filingDate:             toInputDate(item.filingDate),
      crbfCount:              item.crbfCount || "",
      ssbCount:               item.ssbCount || "",
    });
    setTotStatus(item.totStatus || "");
    setCheckedDocs(new Set(item.documentation || []));
    setImagePreview(item.imageUrl || null);
  }, [item, reset]);

  const goNext = () => { setDone((p) => new Set([...p, step])); setStep((s) => Math.min(s+1, STEPS.length)); };
  const goPrev = () => setStep((s) => Math.max(s-1, 1));

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      totStatus,
      trialStakeholders: stakeholders.map((s) => s.name),
      documentation: [...checkedDocs],
      crbfCount: procurements.reduce((sum, p) => sum + (Number(p.count)||0), 0) || data.crbfCount,
    };
    try {
      await dispatch(updateItemAsync({ id: item.id, data: payload })).unwrap();
      onSuccess?.();
    } catch (_) {}
  };

  const toggleDoc  = (item) => setCheckedDocs((p) => { const n=new Set(p); n.has(item)?n.delete(item):n.add(item); return n; });
  const togglePart = (id,f)  => setTotPartners((p) => p.map((x) => x.id===id?{...x,[f]:!x[f]}:x));
  const toggleIpr  = (s,f)   => setIprData((p) => ({...p,[s]:{...p[s],[f]:!p[s][f]}}));
  const toggleSh   = (id)    => setStakeholders((p) => p.map((s) => ({...s, open: s.id===id?!s.open:false})));
  const updateSh   = (id,f,v)=> setStakeholders((p) => p.map((s) => s.id===id?{...s,[f]:v}:s));

  const savePartner = () => {
    if (!partnerData.name.trim()) return;
    setTotPartners((p) => [...p, { id:uid(), name:partnerData.name.trim(), cert:false, sampleTAC:false, latoT:false }]);
    setPartnerData({ name:"" }); setShowPartnerModal(false);
  };
  const saveStakeholder = () => {
    if (!shData.name.trim()) return;
    setStakeholders((p) => [...p, { id:uid(), name:shData.name.trim(), status:shData.status||"Pending", open:true, sampleReqDate:shData.sampleReqDate, sampleSubDate:shData.sampleSubDate, feedback:"", corrections:"", furtherActions:"" }]);
    setShData({ name:"", sampleReqDate:"", sampleSubDate:"", status:"Pending" }); setShowShModal(false);
  };
  const saveFirm = () => {
    if (!firmData.firm.trim()) return;
    setProcurements((p) => [...p, { id:uid(), ...firmData }]);
    setFirmData({ firm:"", count:"", orderNo:"", date:"" }); setShowFirmModal(false);
  };
  const saveDoc = () => {
    if (!newDocName.trim()) return;
    const d = newDocName.trim();
    setCustomDocuments((p) => [...p, d]);
    setCheckedDocs((p) => { const n=new Set(p); n.add(d); return n; });
    setNewDocName(""); setShowDocModal(false);
  };

  const cur = STEPS[step-1];

  return (
    <>
      {/* Step tabs */}
      <div className="eif__tabs">
        {STEPS.map((s) => {
          const isDone = done.has(s.id) && s.id !== step;
          const isActive = s.id === step;
          return (
            <div key={s.id}
              className={`eif__tab eif__tab--clickable${isActive?" eif__tab--active":""}${isDone?" eif__tab--done":""}`}
              onClick={() => setStep(s.id)}>
              {isDone
                ? <span className="eif__tab-dot eif__tab-dot--done">{Icons.check}</span>
                : <span className={`eif__tab-dot${isActive?" eif__tab-dot--active":""}`}>{s.id}</span>
              }
              <span className="eif__tab-lbl">{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="eif__card">
        {/* Card header */}
        <div className="eif__card-head">
          <span className={`eif__card-dot eif__card-dot--${cur.color}`} />
          <span className="eif__card-title">{cur.label}</span>
        </div>

        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <div className="eif__s1-layout">
            {/* Image */}
            <div className="eif__img-col">
              <div className={`eif__img-box${imagePreview?" eif__img-box--filled":""}`}
                onClick={() => fileInputRef.current?.click()}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="eif__img-preview"/>
                  : <><span className="eif__img-icon">{Icons.upload}</span>
                      <span className="eif__img-label">Upload Image</span>
                      <span className="eif__img-hint">Click to browse<br/>JPG, PNG up to 5MB</span></>
                }
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" hidden
                onChange={(e) => { const f=e.target.files?.[0]; if(f) setImagePreview(URL.createObjectURL(f)); }}/>
              {imagePreview && <button type="button" className="eif__img-remove"
                onClick={() => { setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value=""; }}>Remove</button>}
            </div>

            <div className="eif__s1-fields">
              <div className="eif__row2">
                <div className="form-group">
                  <label className="form-label">Item Name <span className="required">*</span></label>
                  <input className={`form-control${errors.name?" form-control--error":""}`}
                    {...register("name",{required:"Required"})}/>
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Item Code <span className="required">*</span></label>
                  <input className={`form-control${errors.code?" form-control--error":""}`}
                    {...register("code",{required:"Required"})}/>
                  {errors.code && <span className="form-error">{errors.code.message}</span>}
                </div>
              </div>
              <div className="eif__row2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" {...register("category")}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c)=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Development Status</label>
                  <select className="form-control" {...register("developmentStatus")}>
                    <option value="">Select status</option>
                    {Object.values(DEVELOPMENT_STATUS).map((s)=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description <span className="required">*</span></label>
                <textarea className={`form-control${errors.description?" form-control--error":""}`}
                  rows={3} maxLength={200} {...register("description",{required:"Required"})}/>
                {errors.description && <span className="form-error">{errors.description.message}</span>}
              </div>
              <div className="eif__row2">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-control" {...register("priority")}>
                    {Object.values(PRIORITY).map((p)=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Completion Date</label>
                  <input type="date" className="form-control" {...register("expectedCompletionDate")}/>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: ToT ── */}
        {step === 2 && (
          <div className="eif__step-body">
            <div className="eif__row2">
              <div className="form-group">
                <label className="form-label">ToT Status</label>
                <div className="eif__radio-row">
                  {["To Be Filed","Filed"].map((opt)=>(
                    <label key={opt} className="eif__radio-item" onClick={()=>setTotStatus(opt)}>
                      <span className={`eif__radio${totStatus===opt?" eif__radio--on":""}`}>
                        {totStatus===opt && <span className="eif__radio-dot"/>}
                      </span>
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ToT Documents Available</label>
                <div className="eif__cert-row">
                  {Object.keys(totCerts).map((cert)=>(
                    <label key={cert} className="eif__cert-item"
                      onClick={()=>setTotCerts((p)=>({...p,[cert]:!p[cert]}))}>
                      <CB checked={totCerts[cert]} onChange={()=>{}}/>
                      {cert}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="eif__row2">
              <div className="form-group">
                <label className="form-label">ToT Document No.</label>
                <input className="form-control" placeholder="TNF/DRDO/2026/00125" {...register("totDocumentNo")}/>
              </div>
              <div className="form-group">
                <label className="form-label">Filed Date</label>
                <input type="date" className="form-control" {...register("filledDate")}/>
              </div>
            </div>
            <div>
              <div className="eif__tbl-head-row">
                <span className="eif__section-label">ToT Partners</span>
                <button type="button" className="eif__add-link" onClick={()=>setShowPartnerModal(true)}>
                  {Icons.plus} Add Partner
                </button>
              </div>
              <div className="eif__tbl-wrap">
                <table className="eif__tbl">
                  <thead><tr>
                    <th>Partner Name</th><th>Certificate Issued</th>
                    <th>Sample Submitted for TAC</th><th>LaToT Signed</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {totPartners.length===0
                      ? <EmptyRow cols={5} msg="No partners added yet"/>
                      : totPartners.map((p)=>(
                          <tr key={p.id}>
                            <td>{p.name}</td>
                            <td><CB checked={p.cert}      onChange={()=>togglePart(p.id,"cert")}      /></td>
                            <td><CB checked={p.sampleTAC} onChange={()=>togglePart(p.id,"sampleTAC")} /></td>
                            <td><CB checked={p.latoT}     onChange={()=>togglePart(p.id,"latoT")}     /></td>
                            <td><button type="button" className="eif__del-btn"
                              onClick={()=>setTotPartners((x)=>x.filter((t)=>t.id!==p.id))}>{Icons.trash}</button></td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: IPR ── */}
        {step === 3 && (
          <div className="eif__step-body">
            {[
              {key:"patent",    title:"Patent",    fLbl:"Patent / File Number",    gLbl:"Granted Number"},
              {key:"trademark", title:"Trademark", fLbl:"Trademark / File Number", gLbl:"Granted Number"},
              {key:"design",    title:"Design",    fLbl:"Design / File Number",    gLbl:"Granted Number"},
            ].map(({key,title,fLbl,gLbl})=>(
              <div key={key} className="eif__ipr-block">
                <div className="eif__ipr-title">{title}</div>
                <div className="eif__ipr-grid">
                  <div className="eif__ipr-check-row">
                    <CB checked={iprData[key].filed}   onChange={()=>toggleIpr(key,"filed")}/>
                    <span className="eif__ipr-lbl">Filed</span>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">{fLbl}</label>
                    <input className="form-control" value={iprData[key].fileNo}
                      onChange={(e)=>setIprData((p)=>({...p,[key]:{...p[key],fileNo:e.target.value}}))}/>
                  </div>
                  <div className="eif__ipr-check-row">
                    <CB checked={iprData[key].granted} onChange={()=>toggleIpr(key,"granted")}/>
                    <span className="eif__ipr-lbl">Granted</span>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">{gLbl}</label>
                    <input className="form-control" value={iprData[key].grantedNo}
                      onChange={(e)=>setIprData((p)=>({...p,[key]:{...p[key],grantedNo:e.target.value}}))}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Step 4: Stakeholders ── */}
        {step === 4 && (
          <div className="eif__step-body">
            <div className="eif__tbl-head-row">
              <span className="eif__section-label">{stakeholders.length} stakeholder{stakeholders.length!==1?"s":""}</span>
              <button type="button" className="eif__add-link" onClick={()=>setShowShModal(true)}>
                {Icons.plus} Add Stakeholder
              </button>
            </div>
            {stakeholders.length === 0
              ? <div className="eif__empty-card">No stakeholders added yet</div>
              : stakeholders.map((s)=>(
                  <div key={s.id} className="eif__sh-block">
                    <div className={`eif__sh-header${s.open?" eif__sh-header--open":""}`} onClick={()=>toggleSh(s.id)}>
                      <span className="eif__sh-name">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                          style={{width:13,height:13,color:"#94a3b8",transform:s.open?"rotate(90deg)":"none",transition:"transform 0.2s"}}>
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                        {s.name}
                      </span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span className={`eif__badge eif__badge--${(s.status||"pending").toLowerCase()}`}>{s.status}</span>
                        <button type="button" className="eif__del-btn"
                          onClick={(e)=>{e.stopPropagation();setStakeholders((p)=>p.filter((x)=>x.id!==s.id));}}>
                          {Icons.trash}
                        </button>
                      </div>
                    </div>
                    {s.open && (
                      <div className="eif__sh-body">
                        <div className="form-group">
                          <label className="form-label">Request for Sample Trial Date</label>
                          <input type="date" className="form-control" value={s.sampleReqDate}
                            onChange={(e)=>updateSh(s.id,"sampleReqDate",e.target.value)}/>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Date of Sample Submission</label>
                          <input type="date" className="form-control" value={s.sampleSubDate}
                            onChange={(e)=>updateSh(s.id,"sampleSubDate",e.target.value)}/>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Feedback</label>
                          <textarea rows={2} className="form-control" value={s.feedback}
                            onChange={(e)=>updateSh(s.id,"feedback",e.target.value)}/>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Corrections & Further Actions</label>
                          <textarea rows={2} className="form-control" value={s.corrections}
                            onChange={(e)=>updateSh(s.id,"corrections",e.target.value)}/>
                        </div>
                      </div>
                    )}
                  </div>
                ))
            }
          </div>
        )}

        {/* ── Step 5: Documentation ── */}
        {step === 5 && (
          <div className="eif__step-body">
            <div className="eif__tbl-head-row">
              <span className="eif__section-label">Documentation Status</span>
              <button type="button" className="eif__add-link" onClick={()=>setShowDocModal(true)}>
                {Icons.plus} Add Document
              </button>
            </div>
            <div className="eif__doc-list">
              {[...DOCUMENTATION_ITEMS, ...customDocuments].map((d)=>(
                <div key={d} className="eif__doc-row" onClick={()=>toggleDoc(d)}>
                  <div className="eif__doc-left">
                    <CB checked={checkedDocs.has(d)} onChange={()=>{}}/>
                    <span className="eif__doc-name">{d}</span>
                  </div>
                  <span className="eif__doc-icon">{Icons.file}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 6: Procurement ── */}
        {step === 6 && (
          <div className="eif__step-body">
            <div className="eif__tbl-head-row">
              <span className="eif__section-label">{procurements.length} firm{procurements.length!==1?"s":""} listed</span>
              <button type="button" className="eif__add-link" onClick={()=>setShowFirmModal(true)}>
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
                  {procurements.length===0
                    ? <EmptyRow cols={5} msg="No procurement entries yet"/>
                    : procurements.map((p)=>(
                        <tr key={p.id}>
                          <td>{p.firm}</td>
                          <td>{p.count}</td>
                          <td>{p.orderNo}</td>
                          <td>{p.date}</td>
                          <td>
                            <button type="button" className="eif__del-btn"
                              onClick={()=>setProcurements((x)=>x.filter((t)=>t.id!==p.id))}>
                              {Icons.trash}
                            </button>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
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
                  {submitting ? <span className="eif__spin"/> : Icons.check}
                  {submitting ? "Saving…" : "Update Item"}
                </button>
            }
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddRecordModal open={showPartnerModal} title="Add ToT Partner"
        fields={[{name:"name",label:"Partner Name"}]}
        values={partnerData}
        onChange={(n,v)=>setPartnerData((p)=>({...p,[n]:v}))}
        onClose={()=>setShowPartnerModal(false)} onSave={savePartner}/>

      <AddRecordModal open={showShModal} title="Add Stakeholder"
        fields={[
          {name:"name",label:"Stakeholder Name"},
          {name:"sampleReqDate",label:"Request Trial Date",type:"date"},
          {name:"sampleSubDate",label:"Sample Submission Date",type:"date"},
        ]}
        values={shData}
        onChange={(n,v)=>setShData((p)=>({...p,[n]:v}))}
        onClose={()=>setShowShModal(false)} onSave={saveStakeholder}/>

      <AddRecordModal open={showFirmModal} title="Add Organisation"
        fields={[
          {name:"firm",label:"Organisation Name"},
          {name:"count",label:"No. of Items Procured",type:"number"},
          {name:"orderNo",label:"Order Number"},
          {name:"date",label:"Order Date",type:"date"},
        ]}
        values={firmData}
        onChange={(n,v)=>setFirmData((p)=>({...p,[n]:v}))}
        onClose={()=>setShowFirmModal(false)} onSave={saveFirm}/>

      <AddRecordModal open={showDocModal} title="Add Document"
        fields={[{name:"name",label:"Document Name"}]}
        values={{name:newDocName}}
        onChange={(_,v)=>setNewDocName(v)}
        onClose={()=>setShowDocModal(false)} onSave={saveDoc}/>
    </>
  );
}