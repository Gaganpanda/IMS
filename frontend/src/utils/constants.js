/* ── Development Status ── */
export const DEVELOPMENT_STATUS = {
  DEVELOPED:   "Developed",
  IN_PROGRESS: "In Progress",
};

/* ── ToT Status ── */
export const TOT_STATUS = {
  FILED_TNF:      "Filled (TnF)",
  FILED_TAC:      "Filled (TAC)",
  TO_BE_FILLED:   "To Be Filled",
  NOT_APPLICABLE: "Not Applicable",
};

/* ── IPR Status ── */
export const IPR_STATUS = {
  PATENT_FILED: "Patent Filed",
  GRANTED:      "Granted",
  TRADEMARK:    "Trademark",
  UNDER_REVIEW: "Under Review",
  NOT_FILED:    "Not Filed",
};

/* ── Trials Status ── */
export const TRIAL_STATUS = {
  PENDING:     "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED:   "Completed",
  ON_HOLD:     "On Hold",
};

/* ── Priority ── */
export const PRIORITY = {
  HIGH:   "High",
  MEDIUM: "Medium",
  LOW:    "Low",
};

/* ── Trial Stakeholders ── */
export const TRIAL_STAKEHOLDERS = [
  "CRBF", "CISF", "BSF", "SSB", "ITBP", "CRPF", "Army", "Navy", "Air Force",
];

/* ── Categories ── */
export const CATEGORIES = [
  "Protective Gear",
  "Apparel",
  "Gear",
  "Electronics",
  "Medical",
  "Weapons",
  "Communication",
  "Vehicles",
  "Other",
];

/* ── Documentation items ── */
export const DOCUMENTATION_ITEMS = [
  "Technical Specification / QR",
  "ATP / QTP / QAP",
  "Trial Directive",
  "Technology Transfer Document",
  "Design Document",
  "Feedback Report Format",
  "User Instruction Manual",
];

/* ── Items page tabs ── */
export const ITEM_TABS = [
  { key: "all",        label: "All Items",   filterKey: null },
  { key: "developed",  label: "Developed",   filterKey: "developmentStatus", filterVal: "Developed"    },
  { key: "inProgress", label: "In Progress", filterKey: "developmentStatus", filterVal: "In Progress"  },
  { key: "trials",     label: "Trials",      filterKey: "trialsStatus",      filterVal: "In Progress"  },
  { key: "iprFiled",   label: "IPR Filed",   filterKey: "iprStatus",         filterVal: "Patent Filed" },
];

/* ── Item detail tabs ── */
/* Matches the TAB_CONTENT map in ItemDetails.jsx exactly */
export const ITEM_DETAIL_TABS = [
  "Overview",
  "Development",
  "Trials",
  "IPR",
  "Procurement",
  "Documents",
  "History",
];

/* ── Page size options ── */
export const PAGE_SIZE_OPTIONS = [6, 10, 20, 50];

/* ── Sort options ── */
export const SORT_OPTIONS = [
  { label: "Recently Updated", value: "updatedAt,desc" },
  { label: "Recently Added",   value: "createdAt,desc" },
  { label: "Name A–Z",         value: "name,asc"       },
  { label: "Name Z–A",         value: "name,desc"      },
];

/* ── Badge color map — used in StatusBadge ── */
export const STATUS_BADGE_MAP = {
  // Development
  "Developed":         { bg: "#dcfce7", color: "#15803d" },
  "In Progress":       { bg: "#fff7ed", color: "#c2410c" },
  "Under Development": { bg: "#fff7ed", color: "#c2410c" },
  "Not Started":       { bg: "#f1f5f9", color: "#475569" },
  // ToT
  "Filled (TnF)":      { bg: "#dbeafe", color: "#1d4ed8" },
  "Filled (TAC)":      { bg: "#dbeafe", color: "#1d4ed8" },
  "To Be Filled":      { bg: "#fee2e2", color: "#dc2626" },
  "Not Applicable":    { bg: "#f1f5f9", color: "#475569" },
  // IPR
  "Patent Filed":      { bg: "#ede9fe", color: "#6d28d9" },
  "Granted":           { bg: "#dcfce7", color: "#15803d" },
  "Trademark":         { bg: "#ede9fe", color: "#6d28d9" },
  "Under Review":      { bg: "#fff7ed", color: "#c2410c" },
  "Not Filed":         { bg: "#f1f5f9", color: "#475569" },
  // Trials
  "Pending":           { bg: "#f1f5f9", color: "#475569" },
  "Completed":         { bg: "#dcfce7", color: "#15803d" },
  "On Hold":           { bg: "#f1f5f9", color: "#475569" },
};