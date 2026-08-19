import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getVariantDetailAsync, updateVariantAsync, fetchItemByIdAsync, uploadImageAsync,
} from "../../redux/slices/itemSlice";
import AddRecordModal from "../../components/common/AddRecordModal/AddRecordModal";
import TrialStakeholders, { stakeholdersFromApi, stakeholdersToApi } from "../../components/items/TrialStakeholders/TrialStakeholders";
import Loader from "../../components/common/Loader/Loader";
import {
  CATEGORIES, DEVELOPMENT_STATUS, TOT_STATUS, TOT_DOCUMENTS, DOCUMENTATION_ITEMS,
} from "../../utils/constants";
import { getImageUrl } from "../../utils/imageUrl";
import "../../components/items/AddItemForm/AddItemForm.css";
import "./EditVariantForm.css";

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
  upload:      (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>),
  check:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  plus:        (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  trash:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  edit:        (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  arrowLeft:   (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>),
  chevron:     (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>),
  arrowRight:  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>),
  close:       (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  chevronDown: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>),
};

function Checkbox({ checked, onChange, disabled }) {
  return (
    <div className={`aif__check${checked ? " aif__check--on" : ""}`} onClick={disabled ? undefined : onChange}>
      {checked && (
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1.5 6 4.5 9 10.5 3" />
        </svg>
      )}
    </div>
  );
}

let nid = 0;
const uid = () => ++nid;

const emptyIprType = () => ({
  filed: false, granted: false, inventor: "",
  filingNo: "", filingDate: "", grantNo: "", grantDate: "",
});

const iprTypeFromDto = (dto, prefix) => ({
  filed:     !!dto?.[`${prefix}Filed`],
  granted:   !!dto?.[`${prefix}Granted`],
  inventor:  dto?.[`${prefix}Inventor`]  || "",
  filingNo:  dto?.[`${prefix}FilingNo`] || "",
  filingDate: dto?.[`${prefix}FilingDate`] || "",
  grantNo:   dto?.[`${prefix}GrantNo`]  || "",
  grantDate: dto?.[`${prefix}GrantDate`] || "",
});

export default function EditVariantForm() {
  const { id: itemId, variantId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedItem, submitting } = useSelector((s) => s.items);

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(new Set());

  // Step 1 – Basic Info + Key Information
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [inventor, setInventor] = useState("");
  const [productDevCompletionDate, setProductDevCompletionDate] = useState("");
  const [developmentStatus, setDevelopmentStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [weight, setWeight] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [vendor, setVendor] = useState("");
  const [warranty, setWarranty] = useState("");

  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Step 2 – ToT
  const [totStatus, setTotStatus] = useState("");
  const [totDocumentNo, setTotDocumentNo] = useState("");
  const [filledDate, setFilledDate] = useState("");
  const [totCerts, setTotCerts] = useState(
    Object.keys(TOT_DOCUMENTS).reduce((acc, k) => ({ ...acc, [k]: false }), {})
  );
  const [totPartners, setTotPartners] = useState([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState(null);
  const [partnerData, setPartnerData] = useState({
    totFirm: "", latotSigningDate: "", sampleSubmissionForTechAbsorptionDate: "",
    totCertificateDate: "", totValidityDate: "",
  });

  // Step 3 – IPR
  const [iprData, setIprData] = useState({
    patent: emptyIprType(), trademark: emptyIprType(),
    design: emptyIprType(), copyright: emptyIprType(),
  });

  // Step 4 – Stakeholders
  const [sampleRequestDate, setSampleRequestDate] = useState("");
  const [sampleSubmissionDate, setSampleSubmissionDate] = useState("");
  const [stakeholders, setStakeholders] = useState([]);

  // Step 5 – Docs
  const [checkedDocs, setCheckedDocs] = useState(new Set());
  const [customDocuments, setCustomDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");

  // Step 6 – Procurement
  const [crbfCount, setCrbfCount] = useState("");
  const [ssbCount, setSsbCount] = useState("");
  const [procurements, setProcurements] = useState([]);
  const [showFirmModal, setShowFirmModal] = useState(false);
  const [editingFirmId, setEditingFirmId] = useState(null);
  const [firmData, setFirmData] = useState({
    agency: "", totFirmNo: "", noOfItemProcured: "", productionValue: "", orderNo: "", date: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let parentItem = selectedItem;
      if (!parentItem || String(parentItem.id) !== String(itemId)) {
        parentItem = await dispatch(fetchItemByIdAsync(itemId)).unwrap().catch(() => null);
      }
      const v = await dispatch(getVariantDetailAsync({ id: itemId, variantId })).unwrap().catch(() => null);
      if (cancelled || !v) { setLoading(false); return; }

      setName(v.name || "");
      setCategory(v.category || "");
      setDescription(v.description || "");
      setInventor(v.inventor || "");
      setProductDevCompletionDate(v.productDevCompletionDate || "");
      setDevelopmentStatus(v.developmentStatus || "");
      setRemarks(v.remarks || "");
      setWeight(v.weight || "");
      setSize(v.size || "");
      setMaterial(v.material || "");
      setColor(v.color || "");
      setUnitCost(v.unitCost ?? "");
      setVendor(v.vendor || "");
      setWarranty(v.warranty || "");
      // Image is a single, item-level asset shared by the item and every
      // variant — never per-variant — so preload from the item, not `v`.
      setImagePreview(parentItem?.imageUrl ? getImageUrl(parentItem.imageUrl) : null);

      setTotStatus(v.totStatus || "");
      setTotDocumentNo(v.totDocumentNo || "");
      setFilledDate(v.filledDate || "");
      const filed = new Set(v.totDocumentsFiled || []);
      setTotCerts(Object.keys(TOT_DOCUMENTS).reduce((acc, k) => ({ ...acc, [k]: filed.has(k) }), {}));
      setTotPartners((v.totPartners || []).map((p) => ({ id: uid(), ...p })));

      setIprData({
        patent:    iprTypeFromDto(v.iprDetail, "patent"),
        trademark: iprTypeFromDto(v.iprDetail, "trademark"),
        design:    iprTypeFromDto(v.iprDetail, "design"),
        copyright: iprTypeFromDto(v.iprDetail, "copyright"),
      });

      setSampleRequestDate(v.sampleRequestDate || "");
      setSampleSubmissionDate(v.sampleSubmissionDate || "");
      setStakeholders(stakeholdersFromApi(v.trialStakeholders));

      const docs = v.documentation || [];
      setCheckedDocs(new Set(docs));
      setCustomDocuments(docs.filter((d) => !DOCUMENTATION_ITEMS.includes(d)));

      setCrbfCount(v.crbfCount ?? "");
      setSsbCount(v.ssbCount ?? "");
      setProcurements((v.procurementDetails || []).map((p) => ({
        id: uid(), agency: p.procurementAgency || "", totFirmNo: p.totFirmNo || "",
        noOfItemProcured: p.noOfItemProcured ?? "", productionValue: p.productionValue || "",
        orderNo: p.orderNumber || "", date: p.orderDate || "",
      })));

      setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, variantId]);

  const iprHasErrors = () => ["patent", "trademark", "design", "copyright"].some((key) =>
    (iprData[key].filed && !iprData[key].filingNo) ||
    (iprData[key].granted && !iprData[key].grantNo)
  );
  const goNext = () => {
    if (step === 3 && iprHasErrors()) return;
    setDone((p) => new Set([...p, step])); setStep((s) => Math.min(s + 1, STEPS.length));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const toggleDoc = (d) => setCheckedDocs((p) => { const n = new Set(p); n.has(d) ? n.delete(d) : n.add(d); return n; });
  const toggleIpr = (sec, f) => setIprData((p) => {
    const updated = { ...p[sec], [f]: !p[sec][f] };
    if (f === "filed" && p[sec].filed) { updated.granted = false; updated.grantNo = ""; updated.grantDate = ""; }
    return { ...p, [sec]: updated };
  });
  const openAddPartner = () => {
    setEditingPartnerId(null);
    setPartnerData({ totFirm: "", latotSigningDate: "", sampleSubmissionForTechAbsorptionDate: "", totCertificateDate: "", totValidityDate: "" });
    setShowPartnerModal(true);
  };
  const openEditPartner = (p) => {
    setEditingPartnerId(p.id);
    setPartnerData({
      totFirm: p.totFirm, latotSigningDate: p.latotSigningDate || "",
      sampleSubmissionForTechAbsorptionDate: p.sampleSubmissionForTechAbsorptionDate || "",
      totCertificateDate: p.totCertificateDate || "", totValidityDate: p.totValidityDate || "",
    });
    setShowPartnerModal(true);
  };
  const savePartner = () => {
    if (!partnerData.totFirm.trim()) return;
    const record = { ...partnerData, totFirm: partnerData.totFirm.trim() };
    if (editingPartnerId) {
      setTotPartners((p) => p.map((x) => x.id === editingPartnerId ? { ...x, ...record } : x));
    } else {
      setTotPartners((p) => [...p, { id: uid(), ...record }]);
    }
    setShowPartnerModal(false);
    setEditingPartnerId(null);
  };

  const openAddFirm = () => {
    setEditingFirmId(null);
    setFirmData({ agency: "", totFirmNo: "", noOfItemProcured: "", productionValue: "", orderNo: "", date: "" });
    setShowFirmModal(true);
  };
  const openEditFirm = (p) => {
    setEditingFirmId(p.id);
    setFirmData({
      agency: p.agency, totFirmNo: p.totFirmNo || "", noOfItemProcured: p.noOfItemProcured ?? "",
      productionValue: p.productionValue || "", orderNo: p.orderNo, date: p.date,
    });
    setShowFirmModal(true);
  };
  const saveFirm = () => {
    if (!firmData.agency.trim()) return;
    if (editingFirmId) {
      setProcurements((p) => p.map((x) => x.id === editingFirmId ? { ...x, ...firmData } : x));
    } else {
      setProcurements((p) => [...p, { id: uid(), ...firmData }]);
    }
    setFirmData({ agency: "", totFirmNo: "", noOfItemProcured: "", productionValue: "", orderNo: "", date: "" });
    setEditingFirmId(null);
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

  const handleSave = async () => {
    if (!name.trim()) { setStep(1); return; }

    const payload = {
      name: name.trim(),
      category: category || null,
      description: description || "",
      inventor: inventor || null,
      productDevCompletionDate: productDevCompletionDate || null,
      developmentStatus: developmentStatus || null,
      remarks: remarks || null,
      weight: weight || null,
      size: size || null,
      material: material || null,
      color: color || null,
      unitCost: unitCost === "" ? null : Number(unitCost),
      vendor: vendor || null,
      warranty: warranty || null,

      totStatus: totStatus || null,
      totDocumentNo: totDocumentNo || null,
      filledDate: filledDate || null,
      totDocumentsFiled: totStatus === TOT_STATUS.FILED
        ? Object.keys(totCerts).filter((k) => totCerts[k])
        : [],
      totPartners: totPartners.map((p) => ({
        totFirm: p.totFirm,
        latotSigningDate: p.latotSigningDate || null,
        sampleSubmissionForTechAbsorptionDate: p.sampleSubmissionForTechAbsorptionDate || null,
        totCertificateDate: p.totCertificateDate || null,
        totValidityDate: p.totValidityDate || null,
      })),

      iprDetail: {
        patentFiled: iprData.patent.filed, patentGranted: iprData.patent.granted,
        patentInventor: iprData.patent.inventor, patentFilingNo: iprData.patent.filingNo,
        patentFilingDate: iprData.patent.filingDate || null, patentGrantNo: iprData.patent.grantNo,
        patentGrantDate: iprData.patent.grantDate || null,
        trademarkFiled: iprData.trademark.filed, trademarkGranted: iprData.trademark.granted,
        trademarkInventor: iprData.trademark.inventor, trademarkFilingNo: iprData.trademark.filingNo,
        trademarkFilingDate: iprData.trademark.filingDate || null, trademarkGrantNo: iprData.trademark.grantNo,
        trademarkGrantDate: iprData.trademark.grantDate || null,
        designFiled: iprData.design.filed, designGranted: iprData.design.granted,
        designInventor: iprData.design.inventor, designFilingNo: iprData.design.filingNo,
        designFilingDate: iprData.design.filingDate || null, designGrantNo: iprData.design.grantNo,
        designGrantDate: iprData.design.grantDate || null,
        copyrightFiled: iprData.copyright.filed, copyrightGranted: iprData.copyright.granted,
        copyrightInventor: iprData.copyright.inventor, copyrightFilingNo: iprData.copyright.filingNo,
        copyrightFilingDate: iprData.copyright.filingDate || null, copyrightGrantNo: iprData.copyright.grantNo,
        copyrightGrantDate: iprData.copyright.grantDate || null,
      },

      sampleRequestDate: sampleRequestDate || null,
      sampleSubmissionDate: sampleSubmissionDate || null,
      trialStakeholders: stakeholdersToApi(stakeholders),

      documentation: [...checkedDocs],

      crbfCount: crbfCount === "" ? null : Number(crbfCount),
      ssbCount: ssbCount === "" ? null : Number(ssbCount),
      procurementDetails: procurements.map((p) => ({
        procurementAgency: p.agency, totFirmNo: p.totFirmNo || "",
        noOfItemProcured: p.noOfItemProcured === "" ? null : Number(p.noOfItemProcured) || 0,
        productionValue: p.productionValue || "", orderNumber: p.orderNo, orderDate: p.date || null,
      })),
    };

    try {
      await dispatch(updateVariantAsync({ id: itemId, variantId, ...payload })).unwrap();
      if (imageFile) {
        // Image is a single item-level asset — uploading it from a variant's
        // edit form updates the item's own image so it's shared across the
        // item and every variant, not just this one.
        await dispatch(uploadImageAsync({ id: itemId, file: imageFile }));
      }
      navigate(`/items/${itemId}?variant=${variantId}`);
    } catch (_) { /* toast already shown by thunk */ }
  };

  if (loading) return <Loader variant="page" text="Loading variant..." />;

  const cur = STEPS[step - 1];

  return (
    <div className="evf animate-fade-in-up">
      <nav className="evf__breadcrumb">
        <span className="evf__crumb-link" onClick={() => navigate(`/items/${itemId}`)}>Items</span>
        {Icons.chevron}
        <span className="evf__crumb-link" onClick={() => navigate(`/items/${itemId}?variant=${variantId}`)}>{name || "Variant"}</span>
        {Icons.chevron}
        <span className="evf__crumb-cur">Edit</span>
      </nav>

      {/* ── Step tab bar ── */}
      <div className="aif__tabs">
        {STEPS.map((s) => {
          const isDone = done.has(s.id) && s.id !== step;
          const isActive = s.id === step;
          return (
            <div key={s.id}
              className={`aif__tab aif__tab--clickable${isActive ? " aif__tab--active" : ""}${isDone ? " aif__tab--done" : ""}`}
              title={s.label}
              onClick={() => setStep(s.id)}>
              {isDone
                ? <span className="aif__tab-dot aif__tab-dot--done">{Icons.check}</span>
                : <span className={`aif__tab-dot${isActive ? " aif__tab-dot--active" : ""}`}>{s.id}</span>
              }
              <span className="aif__tab-lbl">{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="aif__card">
        <div className="aif__card-head">
          <span className={`aif__card-icon aif__card-icon--${STEP_COLORS[cur.icon]}`}>{Icons[cur.icon]}</span>
          <span className="aif__card-title">{cur.label}</span>
        </div>

        {/* ── STEP 1: Basic Information ── */}
        {step === 1 && (
          <div className="aif__step-body">
            <div className="aif__s1-layout">
              <div className="aif__img-col">
                <div className={`aif__img-box${imagePreview ? " aif__img-box--filled" : ""}`}
                  onClick={() => fileInputRef.current?.click()}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className="aif__img-preview" />
                    : <>
                        <span className="aif__img-icon">{Icons.upload}</span>
                        <span className="aif__img-label">Upload Image</span>
                        <span className="aif__img-hint">Click to browse<br />JPG, PNG up to 5MB</span>
                      </>
                  }
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                  }} />
                {imagePreview && (
                  <button type="button" className="aif__img-remove"
                    onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                    Remove
                  </button>
                )}
              </div>

              <div className="aif__s1-fields">
            <div className="form-group">
              <label className="form-label">Variant Name <span className="required">*</span></label>
              <input className="form-control" placeholder="e.g. 5 Layer" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="aif__row2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Development Status</label>
                <select className="form-control" value={developmentStatus} onChange={(e) => setDevelopmentStatus(e.target.value)}>
                  <option value="">Select status</option>
                  {Object.values(DEVELOPMENT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="aif__row2">
              <div className="form-group">
                <label className="form-label">Inventor</label>
                <input className="form-control" value={inventor} onChange={(e) => setInventor(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Product Development Completion Date</label>
                <input type="date" className="form-control" value={productDevCompletionDate} onChange={(e) => setProductDevCompletionDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: ToT Details ── */}
        {step === 2 && (
          <div className="aif__step-body">
            <div className="form-group">
              <label className="form-label">ToT Status</label>
              <div className="aif__radio-row">
                {Object.values(TOT_STATUS).map((opt) => (
                  <label key={opt} className="aif__radio-item" onClick={() => setTotStatus(opt)}>
                    <span className={`aif__radio${totStatus === opt ? " aif__radio--on" : ""}`}>
                      {totStatus === opt && <span className="aif__radio-dot" />}
                    </span>
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {totStatus === TOT_STATUS.FILED && (
              <div className="form-group">
                <label className="form-label">ToT Document Filed</label>
                <div className="aif__cert-row">
                  {Object.keys(TOT_DOCUMENTS).map((cert) => (
                    <label key={cert} className="aif__cert-item" onClick={() => setTotCerts((p) => ({ ...p, [cert]: !p[cert] }))}>
                      <Checkbox checked={totCerts[cert]} onChange={() => {}} />
                      {TOT_DOCUMENTS[cert]}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="aif__tbl-head-row">
                <span className="aif__section-label">ToT Partners</span>
                <button type="button" className="aif__add-link" onClick={openAddPartner}>{Icons.plus} Add Partner</button>
              </div>
              <div className="aif__tbl-wrap">
                <table className="aif__tbl">
                  <thead><tr>
                    <th>ToT Firm</th><th>LAToT Signing Date</th>
                    <th>Sample Submission for Technology Absorption Date</th>
                    <th>ToT Certificate Date</th><th>ToT Validity Date</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {totPartners.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign:"center", padding:"20px 0", color:"var(--color-text-muted)", fontSize:12.5 }}>No partners added yet</td></tr>
                    ) : totPartners.map((p) => (
                      <tr key={p.id}>
                        <td>{p.totFirm}</td>
                        <td>{p.latotSigningDate || "—"}</td>
                        <td>{p.sampleSubmissionForTechAbsorptionDate || "—"}</td>
                        <td>{p.totCertificateDate || "—"}</td>
                        <td>{p.totValidityDate || "—"}</td>
                        <td style={{ display: "flex", gap: 6 }}>
                          <button type="button" className="aif__action-btn aif__action-btn--edit" onClick={() => openEditPartner(p)}>{Icons.edit}</button>
                          <button type="button" className="aif__del-btn" onClick={() => setTotPartners((x) => x.filter((t) => t.id !== p.id))}>{Icons.trash}</button>
                        </td>
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
          <div className="aif__step-body">
            <div className="aif__ipr-wrap">
              {[
                { key: "patent",    title: "Patent",    fLbl: "Patent Filing No",    gLbl: "Patent Grant No / Granting No" },
                { key: "trademark", title: "Trademark", fLbl: "Trademark Filing No", gLbl: "Trademark Grant No" },
                { key: "design",    title: "Design",    fLbl: "Design Filing No",    gLbl: "Design Grant No" },
                { key: "copyright", title: "Copyright", fLbl: "Copyright Filing No", gLbl: "Copyright Grant No" },
              ].map(({ key, title, fLbl, gLbl }) => (
                <div key={key} className="aif__ipr-block">
                  <div className="aif__ipr-title"><span className="aif__ipr-title-icon">{Icons.ipr}</span>{title}</div>
                  <div className="form-group aif__ipr-inventor">
                    <label className="form-label">Inventor</label>
                    <input className="form-control" placeholder={`${title} inventor name`} value={iprData[key].inventor}
                      onChange={(e) => setIprData((p) => ({ ...p, [key]: { ...p[key], inventor: e.target.value } }))} />
                  </div>
                  <div className="aif__ipr-grid">
                    <div className="aif__ipr-check-row">
                      <Checkbox checked={iprData[key].filed} onChange={() => toggleIpr(key, "filed")} />
                      <span className="aif__ipr-lbl">Filed</span>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">{fLbl}{iprData[key].filed && <span className="required"> *</span>}</label>
                      <input className="form-control" value={iprData[key].filingNo} required={iprData[key].filed}
                        style={iprData[key].filed && !iprData[key].filingNo ? { borderColor: "var(--color-danger)" } : {}}
                        onChange={(e) => setIprData((p) => ({ ...p, [key]: { ...p[key], filingNo: e.target.value } }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Filing Date</label>
                      <input type="date" className="form-control" disabled={!iprData[key].filed} value={iprData[key].filingDate}
                        onChange={(e) => setIprData((p) => ({ ...p, [key]: { ...p[key], filingDate: e.target.value } }))} />
                    </div>
                    <div className="aif__ipr-check-row">
                      <Checkbox checked={iprData[key].granted} disabled={!iprData[key].filed}
                        onChange={() => iprData[key].filed && toggleIpr(key, "granted")} />
                      <span className={`aif__ipr-lbl${!iprData[key].filed ? " aif__ipr-lbl--disabled" : ""}`}>
                        Granted {!iprData[key].filed && <span className="aif__ipr-hint">(File first)</span>}
                      </span>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">{gLbl}{iprData[key].granted && <span className="required"> *</span>}</label>
                      <input className="form-control" value={iprData[key].grantNo} disabled={!iprData[key].granted}
                        style={iprData[key].granted && !iprData[key].grantNo ? { borderColor: "var(--color-danger)" } : !iprData[key].filed ? { background: "var(--color-surface-alt)", color: "var(--color-text-muted)" } : {}}
                        onChange={(e) => setIprData((p) => ({ ...p, [key]: { ...p[key], grantNo: e.target.value } }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Grant Date</label>
                      <input type="date" className="form-control" disabled={!iprData[key].granted} value={iprData[key].grantDate}
                        onChange={(e) => setIprData((p) => ({ ...p, [key]: { ...p[key], grantDate: e.target.value } }))} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 4: Trial Stakeholders ── */}
        {step === 4 && (
          <div className="aif__step-body">
            <TrialStakeholders value={stakeholders} onChange={setStakeholders} />
          </div>
        )}


        {/* ── STEP 5: Documentation Status ── */}
        {step === 5 && (
          <div className="aif__step-body">
            <div className="aif__tbl-head-row">
              <span className="aif__section-label">Documentation Status</span>
              <button type="button" className="aif__add-link" onClick={() => setShowDocumentModal(true)}>{Icons.plus} Add Document</button>
            </div>
            <div className="aif__doc-list">
              {[...DOCUMENTATION_ITEMS, ...customDocuments].map((d) => (
                <div key={d} className="aif__doc-row" onClick={() => toggleDoc(d)}>
                  <div className="aif__doc-left">
                    <Checkbox checked={checkedDocs.has(d)} onChange={() => {}} />
                    <span className="aif__doc-name">{d}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 6: Procurement Status ── */}
        {step === 6 && (
          <div className="aif__step-body">
            <div className="aif__tbl-head-row">
              <span className="aif__section-label">{procurements.length} firm{procurements.length !== 1 ? "s" : ""} listed</span>
              <button type="button" className="aif__add-link" onClick={openAddFirm}>{Icons.plus} Add Firm / Organisation</button>
            </div>
            <div className="aif__tbl-wrap">
              <table className="aif__tbl">
                <thead><tr>
                  <th>Procurement Agency</th><th>ToT Firm</th><th>No of Item Procured</th>
                  <th>Production Value</th><th>Order Number</th><th>Order Date</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {procurements.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign:"center", padding:"20px 0", color:"var(--color-text-muted)", fontSize:12.5 }}>No procurement entries yet</td></tr>
                  ) : procurements.map((p) => (
                    <tr key={p.id}>
                      <td>{p.agency}</td><td>{p.totFirmNo || "—"}</td><td>{p.noOfItemProcured ?? "—"}</td>
                      <td>{p.productionValue || "—"}</td><td>{p.orderNo || "—"}</td><td>{p.date || "—"}</td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button type="button" className="aif__action-btn aif__action-btn--edit" onClick={() => openEditFirm(p)}>{Icons.edit}</button>
                        <button type="button" className="aif__del-btn" onClick={() => setProcurements((x) => x.filter((t) => t.id !== p.id))}>{Icons.trash}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="aif__footer">
          <div>
            {step > 1 && (
              <button type="button" className="aif__nav-btn aif__nav-btn--prev" onClick={goPrev}>{Icons.arrowLeft} Previous</button>
            )}
          </div>
          <div className="aif__footer-right">
            <button type="button" className="aif__nav-btn aif__nav-btn--cancel" onClick={() => navigate(`/items/${itemId}?variant=${variantId}`)}>
              {Icons.close} Cancel
            </button>
            {step < STEPS.length
              ? <button type="button" className="aif__nav-btn aif__nav-btn--next" onClick={goNext}>Next {Icons.arrowRight}</button>
              : <button type="button" className="aif__nav-btn aif__nav-btn--save" disabled={submitting} onClick={handleSave}>
                  {submitting ? <span className="aif__spin" /> : Icons.check}
                  {submitting ? "Saving…" : "Save Variant"}
                </button>
            }
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AddRecordModal open={showPartnerModal} title={editingPartnerId ? "Edit ToT Partner" : "Add ToT Partner"}
        fields={[
          { name: "totFirm", label: "ToT Firm" },
          { name: "latotSigningDate", label: "LAToT Signing Date", type: "date" },
          { name: "sampleSubmissionForTechAbsorptionDate", label: "Sample Submission for Technology Absorption Date", type: "date" },
          { name: "totCertificateDate", label: "ToT Certificate Date", type: "date" },
          { name: "totValidityDate", label: "ToT Validity Date", type: "date" },
        ]}
        values={partnerData}
        onChange={(n, v) => setPartnerData((p) => ({ ...p, [n]: v }))}
        onClose={() => { setShowPartnerModal(false); setEditingPartnerId(null); }} onSave={savePartner} />

      <AddRecordModal open={showFirmModal} title={editingFirmId ? "Edit Procurement Entry" : "Add Procurement Entry"}
        fields={[
          { name: "agency", label: "Procurement Agency" },
          { name: "totFirmNo", label: "ToT Firm" },
          { name: "noOfItemProcured", label: "No of Item Procured", type: "number" },
          { name: "productionValue", label: "Production Value" },
          { name: "orderNo", label: "Order Number" },
          { name: "date", label: "Order Date", type: "date" },
        ]}
        values={firmData}
        onChange={(n, v) => setFirmData((p) => ({ ...p, [n]: v }))}
        onClose={() => { setShowFirmModal(false); setEditingFirmId(null); }} onSave={saveFirm} />

      <AddRecordModal open={showDocumentModal} title="Add Document"
        fields={[{ name: "newDocumentName", label: "Document Name" }]}
        values={{ newDocumentName }}
        onChange={(_, v) => setNewDocumentName(v)}
        onClose={() => setShowDocumentModal(false)} onSave={saveDocument} />
    </div>
  );
}