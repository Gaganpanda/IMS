/* ── Development Status ── */
export const DEVELOPMENT_STATUS = {
  DEVELOPED:   "Developed",
  IN_PROGRESS: "In Progress",
};

/* ── ToT Status ── */
export const TOT_STATUS = {
  FILED: "Filed",
  TO_BE_FILED: "To Be Filed",
};

/* ── ToT documents — shown as checkboxes when ToT Status = "Filed" ── */
export const TOT_DOCUMENTS = {
  TTD: "TTD",
  TNF: "TNF",
  TAC: "TAC",
  CEC: "CEC",
};

/* ── IPR Status ── */
export const IPR_STATUS = {
  PATENT_FILED:       "Patent Filed",
  PATENT_GRANTED:     "Patent Granted",
  TRADEMARK_FILED:    "Trademark Filed",
  TRADEMARK_GRANTED:  "Trademark Granted",
  DESIGN_FILED:       "Design Filed",
  DESIGN_GRANTED:     "Design Granted",
  COPYRIGHT_FILED:    "Copyright Filed",
  COPYRIGHT_GRANTED:  "Copyright Granted",
};

/* ── Trials Status ── */
export const TRIAL_STATUS = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  TESTING:     "Testing",
  COMPLETED:   "Completed",
  PENDING:     "Pending",
};

// /* ── Trial Stakeholders ── */
// export const TRIAL_STAKEHOLDERS = [
//   "CRBF", "CISF", "BSF", "SSB", "ITBP", "CRPF", "Army", "Navy", "Air Force",
// ];

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
export const PAGE_SIZE_OPTIONS = [10, 15, 20, 40];

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
  "Developed":         "success",
  "In Progress":       "warning",
  "Under Development": "warning",
  "Not Started":       "neutral",
  // ToT
  "Filed":             "info",
  "To Be Filed":       "danger",
  // IPR
  "Patent Filed":      "purple",
  "Granted":           "success",
  "Trademark":         "purple",
  "Under Review":      "warning",
  "Not Filed":         "neutral",
  // Trials
  "Testing":           "info",
  "Pending":           "neutral",
  "Completed":         "success",
  "On Hold":           "warning",
};