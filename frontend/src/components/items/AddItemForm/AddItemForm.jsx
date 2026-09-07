import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  createItemAsync,
  uploadImageAsync,
  uploadDocumentAsync,
} from "../../../redux/slices/itemSlice";
import AddRecordModal from "../../common/AddRecordModal/AddRecordModal";
import TrialStakeholders, {
  stakeholdersToApi,
} from "../TrialStakeholders/TrialStakeholders";
import {
  CATEGORIES,
  DEVELOPMENT_STATUS,
  TOT_STATUS,
  TOT_DOCUMENTS,
  DOCUMENTATION_ITEMS,
} from "../../../utils/constants";
import "./AddItemForm.css";

const STEPS = [
  { id: 1, label: "Basic Information", short: "Basic Info", icon: "basic" },
  { id: 2, label: "ToT Details", short: "ToT", icon: "tot" },
  { id: 3, label: "IPR Details", short: "IPR", icon: "ipr" },
  { id: 4, label: "Trial Stakeholders", short: "Trial", icon: "trials" },
  { id: 5, label: "Documentation Status", short: "Documentation", icon: "docs" },
  { id: 6, label: "Procurement Status", short: "Procurement", icon: "procurement" },
];

const STEP_SUBTITLES = {
  1: "Core product and development details",
  2: "Technology transfer status and partner records",
  3: "Patent, trademark, design and copyright filings",
  4: "Organisations and stakeholders involved in trials",
  5: "Track required documents and their upload status",
  6: "Firms and organisations procuring this item",
};

const STEP_COLORS = {
  basic: "blue",
  tot: "orange",
  ipr: "purple",
  trials: "teal",
  docs: "teal",
  procurement: "green",
};

const Icons = {
  basic: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  ),
  tot: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  ipr: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  trials: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 3v5l-4 7a4 4 0 0 0 3.5 6h5a4 4 0 0 0 3.5-6l-4-7V3" />
    </svg>
  ),
  docs: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
    </svg>
  ),
  procurement: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  plus: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  trash: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  edit: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  file: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  arrowLeft: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  arrowRight: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  close: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  upload: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  uploadArrow: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 3v12" />
      <polyline points="7 8 12 3 17 8" />
      <path d="M5 21h14" />
    </svg>
  ),
  chevronDown: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

function getInitials(name) {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Checkbox({ checked, onChange }) {
  return (
    <div
      className={`aif__check${checked ? " aif__check--on" : ""}`}
      onClick={onChange}>
      {checked && (
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <polyline points="1.5 6 4.5 9 10.5 3" />
        </svg>
      )}
    </div>
  );
}

let nid = 0;
const uid = () => ++nid;

const YES_NO_OPTIONS = [
  { value: "false", label: "No" },
  { value: "true", label: "Yes" },
];

const emptyIprType = () => ({
  filed: false,
  granted: false,
  inventor: "",
  filingNo: "",
  filingDate: "",
  grantNo: "",
  grantDate: "",
});

export default function AddItemForm({ onCancel, onSuccess }) {
  const dispatch = useDispatch();
  const { submitting } = useSelector((s) => s.items);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(new Set());
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Step 2 – ToT
  const [totStatus, setTotStatus] = useState("");
  const [totCerts, setTotCerts] = useState(
    Object.keys(TOT_DOCUMENTS).reduce((acc, k) => ({ ...acc, [k]: false }), {}),
  );
  const [totPartners, setTotPartners] = useState([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerData, setPartnerData] = useState({
    totFirm: "",
    latotSigningDate: "",
    sampleSubmissionForTechAbsorptionDate: "",
    totCertificateDate: "",
    totValidityDate: "",
  });
  const [editingPartnerId, setEditingPartnerId] = useState(null);

  // Step 3 – IPR
  const [iprData, setIprData] = useState({
    patent: emptyIprType(),
    trademark: emptyIprType(),
    design: emptyIprType(),
    copyright: emptyIprType(),
  });

  // Step 4 – Stakeholders
  const [stakeholders, setStakeholders] = useState([]);

  // Step 5 – Docs
  const [checkedDocs, setCheckedDocs] = useState(new Set());
  const [customDocuments, setCustomDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]); // [{ id, name, file }]
  const [pendingFileName, setPendingFileName] = useState("");
  const docFileInputRef = useRef(null);

  // Step 6 – Procurement
  const [procurements, setProcurements] = useState([]);
  const [showFirmModal, setShowFirmModal] = useState(false);
  const [editingFirmId, setEditingFirmId] = useState(null);
  const [firmData, setFirmData] = useState({
    agency: "",
    totFirmNo: "",
    noOfItemProcured: "",
    productionValue: "",
    orderNo: "",
    date: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const iprHasErrors = () =>
    ["patent", "trademark", "design", "copyright"].some(
      (key) =>
        (iprData[key].filed && !iprData[key].filingNo) ||
        (iprData[key].granted && !iprData[key].grantNo),
    );
  const goNext = () => {
    if (step === 3 && iprHasErrors()) return;
    setDone((p) => new Set([...p, step]));
    setStep((s) => Math.min(s + 1, STEPS.length));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      category: data.category,
      description: data.description,
      inventor: data.inventor || null,
      productDevCompletionDate: data.productDevCompletionDate || null,
      developmentStatus: data.developmentStatus,
      totStatus,
      totDocumentNo: data.totDocumentNo || null,
      filledDate: data.filledDate || null,
      totDocumentsFiled:
        totStatus === TOT_STATUS.FILED
          ? Object.keys(totCerts).filter((k) => totCerts[k])
          : [],
      totPartners: totPartners.map((p) => ({
        totFirm: p.totFirm,
        latotSigningDate: p.latotSigningDate || null,
        sampleSubmissionForTechAbsorptionDate:
          p.sampleSubmissionForTechAbsorptionDate || null,
        totCertificateDate: p.totCertificateDate || null,
        totValidityDate: p.totValidityDate || null,
      })),
      iprDetail: {
        patentFiled: iprData.patent.filed,
        patentGranted: iprData.patent.granted,
        patentInventor: iprData.patent.inventor,
        patentFilingNo: iprData.patent.filingNo,
        patentFilingDate: iprData.patent.filingDate || null,
        patentGrantNo: iprData.patent.grantNo,
        patentGrantDate: iprData.patent.grantDate || null,
        trademarkFiled: iprData.trademark.filed,
        trademarkGranted: iprData.trademark.granted,
        trademarkInventor: iprData.trademark.inventor,
        trademarkFilingNo: iprData.trademark.filingNo,
        trademarkFilingDate: iprData.trademark.filingDate || null,
        trademarkGrantNo: iprData.trademark.grantNo,
        trademarkGrantDate: iprData.trademark.grantDate || null,
        designFiled: iprData.design.filed,
        designGranted: iprData.design.granted,
        designInventor: iprData.design.inventor,
        designFilingNo: iprData.design.filingNo,
        designFilingDate: iprData.design.filingDate || null,
        designGrantNo: iprData.design.grantNo,
        designGrantDate: iprData.design.grantDate || null,
        copyrightFiled: iprData.copyright.filed,
        copyrightGranted: iprData.copyright.granted,
        copyrightInventor: iprData.copyright.inventor,
        copyrightFilingNo: iprData.copyright.filingNo,
        copyrightFilingDate: iprData.copyright.filingDate || null,
        copyrightGrantNo: iprData.copyright.grantNo,
        copyrightGrantDate: iprData.copyright.grantDate || null,
      },
      trialStakeholders: stakeholdersToApi(stakeholders),
      documentation: [...checkedDocs],
      procurementDetails: procurements.map((p) => ({
        procurementAgency: p.agency,
        totFirmNo: p.totFirmNo || "",
        noOfItemProcured:
          p.noOfItemProcured === "" ? null : Number(p.noOfItemProcured) || 0,
        productionValue: p.productionValue || "",
        orderNumber: p.orderNo,
        orderDate: p.date || null,
      })),
    };

    try {
      const created = await dispatch(createItemAsync(payload)).unwrap();
      if (imageFile && created?.id) {
        await dispatch(uploadImageAsync({ id: created.id, file: imageFile }));
      }
      if (created?.id && pendingFiles.length) {
        for (const f of pendingFiles) {
          await dispatch(
            uploadDocumentAsync({ id: created.id, name: f.name, file: f.file }),
          );
        }
      }
      onSuccess?.();
    } catch (_) {
      // Errors are already surfaced via toast inside createItemAsync/uploadImageAsync;
      // swallow here so we don't also throw an unhandled promise rejection.
    }
  };

  // All react-hook-form `required` fields live on Step 1 (Basic Information).
  // Because the wizard lets people skip ahead without validating each step,
  // clicking "Create Item" from step 4/5/6 while step 1 is incomplete used to
  // fail validation silently — the button just did nothing. Jump the user
  // back to the step with the problem and tell them why.
  const onInvalid = () => {
    setStep(1);
    toast.error("Please fill in the required fields in Basic Information.");
  };

  const toggleDoc = (d) =>
    setCheckedDocs((p) => {
      const n = new Set(p);
      n.has(d) ? n.delete(d) : n.add(d);
      return n;
    });
  const toggleIpr = (sec, f) =>
    setIprData((p) => {
      const updated = { ...p[sec], [f]: !p[sec][f] };
      if (f === "filed" && p[sec].filed) {
        updated.granted = false;
        updated.grantNo = "";
        updated.grantDate = "";
      }
      return { ...p, [sec]: updated };
    });

  const openAddPartner = () => {
    setEditingPartnerId(null);
    setPartnerData({
      totFirm: "",
      latotSigningDate: "",
      sampleSubmissionForTechAbsorptionDate: "",
      totCertificateDate: "",
      totValidityDate: "",
    });
    setShowPartnerModal(true);
  };
  const openEditPartner = (p) => {
    setEditingPartnerId(p.id);
    setPartnerData({
      totFirm: p.totFirm,
      latotSigningDate: p.latotSigningDate,
      sampleSubmissionForTechAbsorptionDate:
        p.sampleSubmissionForTechAbsorptionDate,
      totCertificateDate: p.totCertificateDate || "",
      totValidityDate: p.totValidityDate,
    });
    setShowPartnerModal(true);
  };
  const savePartner = () => {
    if (!partnerData.totFirm.trim()) return;
    const record = {
      totFirm: partnerData.totFirm.trim(),
      latotSigningDate: partnerData.latotSigningDate,
      sampleSubmissionForTechAbsorptionDate:
        partnerData.sampleSubmissionForTechAbsorptionDate,
      totCertificateDate: partnerData.totCertificateDate || null,
      totValidityDate: partnerData.totValidityDate,
    };
    if (editingPartnerId) {
      setTotPartners((p) =>
        p.map((x) => (x.id === editingPartnerId ? { ...x, ...record } : x)),
      );
    } else {
      setTotPartners((p) => [...p, { id: uid(), ...record }]);
    }
    setShowPartnerModal(false);
    setEditingPartnerId(null);
  };

  const openAddFirm = () => {
    setEditingFirmId(null);
    setFirmData({
      agency: "",
      totFirmNo: "",
      noOfItemProcured: "",
      productionValue: "",
      orderNo: "",
      date: "",
    });
    setShowFirmModal(true);
  };
  const openEditFirm = (p) => {
    setEditingFirmId(p.id);
    setFirmData({
      agency: p.agency,
      totFirmNo: p.totFirmNo || "",
      noOfItemProcured: p.noOfItemProcured ?? "",
      productionValue: p.productionValue || "",
      orderNo: p.orderNo,
      date: p.date,
    });
    setShowFirmModal(true);
  };
  const saveFirm = () => {
    if (!firmData.agency.trim()) return;
    if (editingFirmId) {
      setProcurements((p) =>
        p.map((x) => (x.id === editingFirmId ? { ...x, ...firmData } : x)),
      );
    } else {
      setProcurements((p) => [...p, { id: uid(), ...firmData }]);
    }
    setFirmData({
      agency: "",
      totFirmNo: "",
      noOfItemProcured: "",
      productionValue: "",
      orderNo: "",
      date: "",
    });
    setEditingFirmId(null);
    setShowFirmModal(false);
  };
  const saveDocument = () => {
    if (!newDocumentName.trim()) return;
    const d = newDocumentName.trim();
    setCustomDocuments((p) => [...p, d]);
    setCheckedDocs((p) => {
      const n = new Set(p);
      n.add(d);
      return n;
    });
    setNewDocumentName("");
    setShowDocumentModal(false);
  };

  const cur = STEPS[step - 1];

  const progressPct = Math.round(((done.size) / STEPS.length) * 100);

  return (
    <>
      {/* ── Compact workflow navigation ── */}
      <div className="aif__stepper-wrap">
        <div className="aif__stepper-meta">
          <div className="aif__stepper-meta-left">
            <span className="aif__eyebrow">
              Step {step} of {STEPS.length}
              <span className="aif__eyebrow-current">
                {" "}&middot; {cur.label}
              </span>
            </span>
            <span className="aif__progress-pct">{progressPct}% complete</span>
          </div>
          {/* Always-visible save action — previously the only way to save
             was clicking "Next" through every step to reach the last one.
             Mirrors the footer's save button 1:1 (same handler, same
             disabled/loading state) so saving works from any step. */}
          <button
            type="button"
            className="aif__header-save"
            disabled={submitting}
            onClick={handleSubmit(onSubmit, onInvalid)}>
            {submitting ? <span className="aif__spin" /> : Icons.check}
            {submitting ? "Saving…" : "Create Item"}
          </button>
        </div>

        <div className="aif__progress-track">
          <div className="aif__progress-fill" style={{ width: `${progressPct}%` }}>
            <span className="aif__progress-sheen" />
          </div>
        </div>

        {/* Desktop: segmented step rail */}
        <div className="aif__tabs">
          {STEPS.map((s) => {
            const isDone = done.has(s.id) && s.id !== step;
            const isActive = s.id === step;
            const isReached = s.id <= step;
            // Every required react-hook-form field lives on step 1 — flag the
            // tab so a validation failure (see onInvalid) is visible even
            // before the user is sent back to it.
            const hasError = s.id === 1 && Object.keys(errors).length > 0 && s.id !== step;
            return (
              <div
                key={s.id}
                className={`aif__tab aif__tab--clickable${isActive ? " aif__tab--active" : ""}${isDone ? " aif__tab--done" : ""}${isReached ? " aif__tab--reached" : ""}${hasError ? " aif__tab--error" : ""}`}
                title={hasError ? `${s.label} — required fields missing` : s.label}
                onClick={() => setStep(s.id)}>
                {hasError ? (
                  <span className="aif__tab-dot aif__tab-dot--error">!</span>
                ) : isDone ? (
                  <span className="aif__tab-dot aif__tab-dot--done">
                    {Icons.check}
                  </span>
                ) : (
                  <span
                    className={`aif__tab-dot${isActive ? " aif__tab-dot--active" : ""}`}>
                    {s.id}
                  </span>
                )}
                <span className="aif__tab-lbl">{s.short}</span>
              </div>
            );
          })}
        </div>

        {/* Mobile: compact progress-only indicator */}
        <div className="aif__mobile-progress">
          <div className="aif__mobile-progress-track">
            <div
              className="aif__mobile-progress-fill"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <div className="aif__mobile-progress-dots">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={`aif__mobile-dot${s.id === step ? " aif__mobile-dot--active" : ""}${done.has(s.id) && s.id !== step ? " aif__mobile-dot--done" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="aif__card" data-accent={STEP_COLORS[cur.icon]}>
        {/* Card header */}
        <div className="aif__card-head">
          <span
            className={`aif__card-icon aif__card-icon--${STEP_COLORS[cur.icon]}`}>
            {Icons[cur.icon]}
          </span>
          <span className="aif__card-head-text">
            <span className="aif__card-title">{cur.label}</span>
            <span className="aif__card-subtitle">{STEP_SUBTITLES[cur.id]}</span>
          </span>
        </div>

        {/* ── STEP 1: Basic Information ── */}
        {step === 1 && (
          <>
            <div className="aif__s1-layout">
              <div className="aif__img-col">
                <div
                  className={`aif__img-box${imagePreview ? " aif__img-box--filled" : ""}`}
                  onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="aif__img-preview"
                    />
                  ) : (
                    <>
                      <span className="aif__img-icon">{Icons.upload}</span>
                      <span className="aif__img-label">Upload Image</span>
                      <span className="aif__img-hint">
                        Click to browse
                        <br />
                        JPG, PNG up to 5MB
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setImageFile(f);
                      setImagePreview(URL.createObjectURL(f));
                    }
                  }}
                />
                {imagePreview && (
                  <button
                    type="button"
                    className="aif__img-remove"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}>
                    Remove
                  </button>
                )}
              </div>

              <div className="aif__s1-fields">
                <div className="aif__row2">
                  <div className="form-group">
                    <label className="form-label">
                      Item Name <span className="required">*</span>
                    </label>
                    <input
                      className={`form-control${errors.name ? " form-control--error" : ""}`}
                      placeholder="e.g. Knee Brace (must be unique)"
                      {...register("name", { required: "Required" })}
                    />
                    {errors.name && (
                      <span className="form-error">{errors.name.message}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Category <span className="required">*</span>
                    </label>
                    <select
                      className={`form-control${errors.category ? " form-control--error" : ""}`}
                      {...register("category", { required: "Required" })}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <span className="form-error">
                        {errors.category.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="aif__row2">
                  <div className="form-group">
                    <label className="form-label">
                      Development Status <span className="required">*</span>
                    </label>
                    <select
                      className={`form-control${errors.developmentStatus ? " form-control--error" : ""}`}
                      {...register("developmentStatus", {
                        required: "Required",
                      })}>
                      <option value="">Select status</option>
                      {Object.values(DEVELOPMENT_STATUS).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.developmentStatus && (
                      <span className="form-error">
                        {errors.developmentStatus.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Inventor</label>
                    <input
                      className="form-control"
                      placeholder="Name of the inventor"
                      {...register("inventor")}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    className={`form-control${errors.description ? " form-control--error" : ""}`}
                    placeholder="Brief item description..."
                    rows={3}
                    maxLength={1000}
                    {...register("description", { required: "Required" })}
                  />
                  {errors.description && (
                    <span className="form-error">
                      {errors.description.message}
                    </span>
                  )}
                </div>

                <div className="aif__row2">
                  <div className="form-group">
                    <label className="form-label">
                      Product Development Completion Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      {...register("productDevCompletionDate")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Variants note ── */}
            <div className="aif__variant-note">
              <span className="aif__variant-note-icon">{Icons.file}</span>
              <div>
                <strong>Variants are managed separately.</strong>
                <p>
                  Save this item first, then open it and use{" "}
                  <em>“Manage Variants”</em> to add variants — each one gets its
                  own independent Basic Info, ToT, IPR, Trial Stakeholders,
                  Documentation and Procurement details.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: ToT Details ── */}
        {step === 2 && (
          <div className="aif__step-body">
            <div className="form-group">
              <label className="form-label">ToT Status</label>
              <div className="aif__radio-row">
                {Object.values(TOT_STATUS).map((opt) => (
                  <label
                    key={opt}
                    className="aif__radio-item"
                    onClick={() => setTotStatus(opt)}>
                    <span
                      className={`aif__radio${totStatus === opt ? " aif__radio--on" : ""}`}>
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
                    <label
                      key={cert}
                      className="aif__cert-item"
                      onClick={() =>
                        setTotCerts((p) => ({ ...p, [cert]: !p[cert] }))
                      }>
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
                <button
                  type="button"
                  className="aif__add-link"
                  onClick={openAddPartner}>
                  {Icons.plus} Add Partner
                </button>
              </div>
              {totPartners.length === 0 ? (
                <div className="aif__empty-panel">
                  <span className="aif__empty-panel-icon">{Icons.tot}</span>
                  <strong>No ToT partners yet</strong>
                  <p>Add your first technology transfer partner to continue.</p>
                  <button
                    type="button"
                    className="aif__add-link aif__add-link--empty"
                    onClick={openAddPartner}>
                    {Icons.plus} Add Partner
                  </button>
                </div>
              ) : (
              <div className="aif__tbl-wrap">
                <table className="aif__tbl">
                  <thead>
                    <tr>
                      <th>ToT Firm</th>
                      <th>LAToT Signing Date</th>
                      <th>Sample Submission for Technology Absorption Date</th>
                      <th>ToT Certificate Date</th>
                      <th>ToT Validity Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      totPartners.map((p) => (
                        <tr key={p.id}>
                          <td>{p.totFirm}</td>
                          <td>{p.latotSigningDate || "—"}</td>
                          <td>
                            {p.sampleSubmissionForTechAbsorptionDate || "—"}
                          </td>
                          <td>{p.totCertificateDate || "—"}</td>
                          <td>{p.totValidityDate || "—"}</td>
                          <td style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              className="aif__action-btn aif__action-btn--edit"
                              onClick={() => openEditPartner(p)}>
                              {Icons.edit}
                            </button>
                            <button
                              type="button"
                              className="aif__del-btn"
                              onClick={() =>
                                setTotPartners((x) =>
                                  x.filter((t) => t.id !== p.id),
                                )
                              }>
                              {Icons.trash}
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: IPR Details ── */}
        {step === 3 && (
          <div className="aif__step-body">
            <div className="aif__ipr-wrap">
              {[
                {
                  key: "patent",
                  title: "Patent",
                  fLbl: "Patent Filing No",
                  gLbl: "Patent Grant No",
                },
                {
                  key: "trademark",
                  title: "Trademark",
                  fLbl: "Trademark Filing No",
                  gLbl: "Trademark Grant No",
                },
                {
                  key: "design",
                  title: "Design",
                  fLbl: "Design Filing No",
                  gLbl: "Design Grant No",
                },
                {
                  key: "copyright",
                  title: "Copyright",
                  fLbl: "Copyright Filing No",
                  gLbl: "Copyright Grant No",
                },
              ].map(({ key, title, fLbl, gLbl }) => (
                <div key={key} className="aif__ipr-block">
                  <div className="aif__ipr-title">
                    <span className="aif__ipr-title-icon">{Icons.ipr}</span>
                    {title}
                  </div>

                  <div className="form-group aif__ipr-inventor">
                    <label className="form-label">Inventor</label>
                    <input
                      className="form-control"
                      placeholder={`${title} inventor name`}
                      value={iprData[key].inventor}
                      onChange={(e) =>
                        setIprData((p) => ({
                          ...p,
                          [key]: { ...p[key], inventor: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="aif__ipr-grid">
                    <div className="aif__ipr-check-row">
                      <Checkbox
                        checked={iprData[key].filed}
                        onChange={() => toggleIpr(key, "filed")}
                      />
                      <span className="aif__ipr-lbl">Filed</span>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">
                        {fLbl}
                        {iprData[key].filed && (
                          <span className="required"> *</span>
                        )}
                      </label>
                      <input
                        className="form-control"
                        value={iprData[key].filingNo}
                        required={iprData[key].filed}
                        placeholder={
                          iprData[key].filed
                            ? "Required when Filed is checked"
                            : ""
                        }
                        style={
                          iprData[key].filed && !iprData[key].filingNo
                            ? { borderColor: "var(--color-danger)" }
                            : {}
                        }
                        onChange={(e) =>
                          setIprData((p) => ({
                            ...p,
                            [key]: { ...p[key], filingNo: e.target.value },
                          }))
                        }
                      />
                      {iprData[key].filed && !iprData[key].filingNo && (
                        <span className="aif__ipr-err">
                          Required when Filed is checked
                        </span>
                      )}
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Filing Date</label>
                      <input
                        type="date"
                        className="form-control"
                        disabled={!iprData[key].filed}
                        value={iprData[key].filingDate}
                        onChange={(e) =>
                          setIprData((p) => ({
                            ...p,
                            [key]: { ...p[key], filingDate: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="aif__ipr-check-row">
                      <Checkbox
                        checked={iprData[key].granted}
                        disabled={!iprData[key].filed}
                        onChange={() =>
                          iprData[key].filed && toggleIpr(key, "granted")
                        }
                      />
                      <span
                        className={`aif__ipr-lbl${!iprData[key].filed ? " aif__ipr-lbl--disabled" : ""}`}>
                        Granted{" "}
                        {!iprData[key].filed && (
                          <span className="aif__ipr-hint">(File first)</span>
                        )}
                      </span>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">
                        {gLbl}
                        {iprData[key].granted && (
                          <span className="required"> *</span>
                        )}
                      </label>
                      <input
                        className="form-control"
                        value={iprData[key].grantNo}
                        disabled={!iprData[key].granted}
                        required={iprData[key].granted}
                        placeholder={
                          !iprData[key].filed
                            ? "File first to enable"
                            : iprData[key].granted
                              ? "Required"
                              : ""
                        }
                        style={
                          iprData[key].granted && !iprData[key].grantNo
                            ? { borderColor: "var(--color-danger)" }
                            : !iprData[key].filed
                              ? {
                                  background: "var(--color-surface-alt)",
                                  color: "var(--color-text-muted)",
                                }
                              : {}
                        }
                        onChange={(e) =>
                          setIprData((p) => ({
                            ...p,
                            [key]: { ...p[key], grantNo: e.target.value },
                          }))
                        }
                      />
                      {iprData[key].granted && !iprData[key].grantNo && (
                        <span className="aif__ipr-err">
                          Required when Granted is checked
                        </span>
                      )}
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Grant Date</label>
                      <input
                        type="date"
                        className="form-control"
                        disabled={!iprData[key].granted}
                        value={iprData[key].grantDate}
                        onChange={(e) =>
                          setIprData((p) => ({
                            ...p,
                            [key]: { ...p[key], grantDate: e.target.value },
                          }))
                        }
                      />
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
            <TrialStakeholders
              value={stakeholders}
              onChange={setStakeholders}
            />
          </div>
        )}

        {/* ── STEP 5: Documentation Status ── */}
        {step === 5 && (
          <div className="aif__step-body">
            <div className="aif__tbl-head-row">
              <span className="aif__section-label">
                Documentation Status
                <span className="aif__count-pill">
                  {checkedDocs.size}/{DOCUMENTATION_ITEMS.length + customDocuments.length}
                </span>
              </span>
              <button
                type="button"
                className="aif__add-link"
                onClick={() => setShowDocumentModal(true)}>
                {Icons.plus} Add Document
              </button>
            </div>
            <div className="aif__doc-list">
              {[...DOCUMENTATION_ITEMS, ...customDocuments].map((d) => {
                const attached = pendingFiles.find((f) => f.name === d);
                return (
                  <div
                    key={d}
                    className="aif__doc-row"
                    onClick={() => toggleDoc(d)}>
                    <div className="aif__doc-left">
                      <Checkbox
                        checked={checkedDocs.has(d)}
                        onChange={() => {}}
                      />
                      <span className="aif__doc-name">{d}</span>
                    </div>
                    {attached ? (
                      <span
                        className="aif__doc-attached"
                        onClick={(e) => e.stopPropagation()}>
                        <span className="aif__doc-attached-name">
                          {attached.file.name}
                        </span>
                        <button
                          type="button"
                          className="aif__doc-attached-remove"
                          onClick={() =>
                            setPendingFiles((p) =>
                              p.filter((f) => f.id !== attached.id),
                            )
                          }>
                          {Icons.close}
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="aif__doc-upload-btn"
                        disabled={!checkedDocs.has(d)}
                        title={
                          checkedDocs.has(d)
                            ? `Upload file for ${d}`
                            : "Check this document first to enable upload"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!checkedDocs.has(d)) return;
                          setPendingFileName(d);
                          docFileInputRef.current?.click();
                        }}>
                        {Icons.uploadArrow}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <input
              ref={docFileInputRef}
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPendingFiles((p) => [
                  ...p,
                  {
                    id: uid(),
                    name: pendingFileName.trim() || file.name,
                    file,
                  },
                ]);
                setPendingFileName("");
                e.target.value = "";
              }}
            />
          </div>
        )}

        {/* ── STEP 6: Procurement Status ── */}
        {step === 6 && (
          <div className="aif__step-body">
            <div className="aif__tbl-head-row">
              <span className="aif__section-label">
                {procurements.length} firm{procurements.length !== 1 ? "s" : ""}{" "}
                listed
              </span>
              <button
                type="button"
                className="aif__add-link"
                onClick={openAddFirm}>
                {Icons.plus} Add Firm / Organisation
              </button>
            </div>
            {procurements.length === 0 ? (
              <div className="aif__empty-panel">
                <span className="aif__empty-panel-icon">{Icons.procurement}</span>
                <strong>No procurement records</strong>
                <p>
                  Add a procurement organization to track procurement
                  activity for this item.
                </p>
                <button
                  type="button"
                  className="aif__add-link aif__add-link--empty"
                  onClick={openAddFirm}>
                  {Icons.plus} Add Firm / Organisation
                </button>
              </div>
            ) : (
            <div className="aif__tbl-wrap">
              <table className="aif__tbl">
                <thead>
                  <tr>
                    <th>Procurement Agency</th>
                    <th>ToT Firm</th>
                    <th>No of Item Procured</th>
                    <th>Production Value</th>
                    <th>Order Number</th>
                    <th>Order Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    procurements.map((p) => (
                      <tr key={p.id}>
                        <td>{p.agency}</td>
                        <td>{p.totFirmNo || "—"}</td>
                        <td>{p.noOfItemProcured ?? "—"}</td>
                        <td>{p.productionValue || "—"}</td>
                        <td>{p.orderNo || "—"}</td>
                        <td>{p.date || "—"}</td>
                        <td style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            className="aif__action-btn aif__action-btn--edit"
                            onClick={() => openEditFirm(p)}>
                            {Icons.edit}
                          </button>
                          <button
                            type="button"
                            className="aif__del-btn"
                            onClick={() =>
                              setProcurements((x) =>
                                x.filter((t) => t.id !== p.id),
                              )
                            }>
                            {Icons.trash}
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="aif__footer">
          <div>
            {step > 1 && (
              <button
                type="button"
                className="aif__nav-btn aif__nav-btn--prev"
                onClick={goPrev}>
                {Icons.arrowLeft} Previous
              </button>
            )}
          </div>
          <div className="aif__footer-right">
            <button
              type="button"
              className="aif__nav-btn aif__nav-btn--cancel"
              onClick={onCancel}>
              {Icons.close} Cancel
            </button>
            {step < STEPS.length ? (
              <button
                type="button"
                className="aif__nav-btn aif__nav-btn--next"
                onClick={goNext}>
                Next {Icons.arrowRight}
              </button>
            ) : (
              <button
                type="button"
                className="aif__nav-btn aif__nav-btn--save"
                disabled={submitting}
                onClick={handleSubmit(onSubmit, onInvalid)}>
                {submitting ? <span className="aif__spin" /> : Icons.check}
                {submitting ? "Saving…" : "Create Item"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AddRecordModal
        open={showPartnerModal}
        title={editingPartnerId ? "Edit ToT Partner" : "Add ToT Partner"}
        fields={[
          { name: "totFirm", label: "ToT Firm" },
          {
            name: "latotSigningDate",
            label: "LAToT Signing Date",
            type: "date",
          },
          {
            name: "sampleSubmissionForTechAbsorptionDate",
            label: "Sample Submission for Technology Absorption Date",
            type: "date",
          },
          {
            name: "totCertificateDate",
            label: "ToT Certificate Date",
            type: "date",
          },
          { name: "totValidityDate", label: "ToT Validity Date", type: "date" },
        ]}
        values={partnerData}
        onChange={(n, v) => setPartnerData((p) => ({ ...p, [n]: v }))}
        onClose={() => {
          setShowPartnerModal(false);
          setEditingPartnerId(null);
        }}
        onSave={savePartner}
      />

      <AddRecordModal
        open={showFirmModal}
        title={
          editingFirmId ? "Edit Procurement Entry" : "Add Procurement Entry"
        }
        fields={[
          { name: "agency", label: "Procurement Agency" },
          { name: "totFirmNo", label: "ToT Firm" },
          {
            name: "noOfItemProcured",
            label: "No of Item Procured",
            type: "number",
          },
          { name: "productionValue", label: "Production Value" },
          { name: "orderNo", label: "Order Number" },
          { name: "date", label: "Order Date", type: "date" },
        ]}
        values={firmData}
        onChange={(n, v) => setFirmData((p) => ({ ...p, [n]: v }))}
        onClose={() => {
          setShowFirmModal(false);
          setEditingFirmId(null);
        }}
        onSave={saveFirm}
      />

      {showDocumentModal && (
        <div className="arm__overlay">
          <div className="arm__modal">
            <div className="arm__header">
              <h3>Add Document</h3>
              <button
                className="arm__close"
                onClick={() => setShowDocumentModal(false)}>
                ✕
              </button>
            </div>
            <div className="arm__body">
              <div className="arm__group">
                <label>Document Name</label>
                <input
                  type="text"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                  placeholder="e.g. Trial Report"
                />
              </div>
            </div>
            <div className="arm__footer">
              <button
                className="arm__cancel"
                onClick={() => setShowDocumentModal(false)}>
                Cancel
              </button>
              <button className="arm__save" onClick={saveDocument}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
