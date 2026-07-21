{

const { useEffect, useMemo, useRef, useState } = React;
const { Icon, OrgSwitcher: BaseOrgSwitcher, SelectMenu, Pager, HacModal, HacFileUpload, StatusBadge, MobileListCard, ReminderSummary } = window.SharedShell;
const { useTweaks, TweaksPanel, TweakSection, TweakSelect, TweakToggle } = window;
const D = window.ORG_VEHICLE_LIST;

function CloseControl() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const onKey = (e) => { if (e.key === "Escape") setOpen(false); }; document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, []);
  return <><style>{`.ovl-closebtn{width:36px;height:36px;border:0;border-radius:8px;background:var(--bg-muted);color:var(--fg-secondary);display:flex;align-items:center;justify-content:center;cursor:pointer}.ovl-closebtn:hover{background:var(--bg-hover);color:var(--fg-primary)}.ovl-leave-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}.ovl-leave-modal{background:#fff;border-radius:var(--radius-lg);width:100%;max-width:380px;padding:22px 24px 24px;box-shadow:0 8px 40px rgba(0,0,0,.18);text-align:center}.ovl-leave-title{font-size:17px;font-weight:600;color:var(--fg-primary);margin-bottom:8px}.ovl-leave-msg{font-size:13px;line-height:1.5;color:var(--fg-secondary);margin-bottom:22px}.ovl-leave-actions{display:flex;gap:10px;justify-content:center}.ovl-leave-actions button{height:38px;padding:0 16px;border-radius:8px;font:600 13px var(--font-sans);cursor:pointer;border:0}.ovl-leave-stay{background:var(--bg-muted);color:var(--fg-primary)}.ovl-leave-exit{background:var(--green-600);color:#fff}`}</style><button className="ovl-closebtn" type="button" aria-label="Close" onClick={() => setOpen(true)}><Icon name="close" size={18} /></button>{open && ReactDOM.createPortal(<div className="ovl-leave-backdrop" role="dialog" aria-modal="true" aria-label="Leave page confirmation" onMouseDown={(e) => e.currentTarget === e.target && setOpen(false)}><div className="ovl-leave-modal"><div className="ovl-leave-title">Leave this page?</div><div className="ovl-leave-msg">Are you sure you want to leave this page? Your progress may not be saved.</div><div className="ovl-leave-actions"><button className="ovl-leave-stay" type="button" onClick={() => setOpen(false)}>Stay</button><button className="ovl-leave-exit" type="button" onClick={() => { window.location.href = "../org-dashboard/index.html"; }}>Exit to Dashboard</button></div></div></div>, document.body)}</>;
}
function OrgSwitcher(props) { return <BaseOrgSwitcher {...props} />; }

const MYADMIN_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", href: "../org-myadmin-dashboard/index.html" },
  { key: "user", label: "User", icon: "group" },
  { key: "driver", label: "Driver", icon: "badge", href: "../org-driver-list/index.html" },
  { key: "vehicle", label: "Vehicle", icon: "local_shipping", href: "#" },
  { key: "vendor", label: "Vendor", icon: "storefront" },
  { key: "checklist", label: "Checklist", icon: "fact_check" },
  { key: "history", label: "Check In History", icon: "history" },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scenario": "lite-active",
  "veh001ActiveCheckIn": true
}/*EDITMODE-END*/;

const SCENARIO_LABEL = {
  "lite-active": "1 — Lite (8 / 10)",
  "lite-at-limit": "2 — Lite (at limit)",
  "premium": "3 — Premium",
  "free": "4 — Free (0 MV)",
  "enterprise": "5 — Enterprise",
};
const REMINDER_LIMITS = { free: 1, lite: 3, premium: Infinity };

const DOC_FIELDS = [
  { key: "roadTax", type: "Road Tax", label: "Road Tax", startRequired: true, expiryRequired: true, defaultReminder: 30 },
  { key: "insurance", type: "Insurance", label: "Insurance", startRequired: true, expiryRequired: true, defaultReminder: 30 },
  { key: "puspakom", type: "Puspakom Service", label: "Puspakom Service", startRequired: true, expiryRequired: true, defaultReminder: 60 },
  { key: "permit", type: "Truck Permit", label: "Truck Permit", startRequired: true, expiryRequired: true, defaultReminder: 30 },
  { key: "others", type: "Others", label: "Others", startRequired: true, expiryRequired: true, defaultReminder: 30, other: true },
];
const VEHICLE_LIST_TABS = [
  { key: "list", label: "Vehicle List" },
  { key: "due", label: "Vehicle Due Dates" },
];
const DUE_RANGE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "expired", label: "Expired" },
  { value: "0-7", label: "0-7 days" },
  { value: "8-30", label: "8-30 days" },
  { value: "31-60", label: "31-60 days" },
  { value: "61-90", label: "61-90 days" },
];

const VEHICLE_CATEGORIES = ["Lorry", "Van", "Bus", "Truck", "MPV", "Sedan"];
const VENDORS = ["Swift Leasing", "Padu Fleet", "North Cold Chain", "Bintang Mobility", "Metro Vendor", "Bina Gemilang", "East Route Transport"];
const VEHICLE_FEATURES = ["Normal", "Refrigerated", "Tailgate"];
const VEHICLE_FINISHES = ["Open Gate", "Box", "Curtain Slider"];
const VEHICLE_SUB_CATEGORIES_BY_CATEGORY = {
  Lorry: ["Lori Rigid - Kargo Am", "Lori Rigid - Minuman Botol", "Lori Jentera Bergerak"],
};
const VEHICLE_EDIT_TABS = [
  { key: "details", label: "Vehicle Details" },
  { key: "forms", label: "Forms" },
  { key: "reminders", label: "Documents" },
  { key: "drivers", label: "Drivers" },
];
const DRIVER_POOL = [
  { name: "Azhar Rahman", driverId: "DRV-014" },
  { name: "Hafiz Sulaiman", driverId: "DRV-022" },
  { name: "Roslan Ibrahim", driverId: "DRV-005" },
  { name: "Zulkifli Hamid", driverId: "DRV-011" },
  { name: "Karim Abdullah", driverId: "DRV-020" },
  { name: "Farid Manaf", driverId: "DRV-041" },
  { name: "Khalid Nordin", driverId: "DRV-028" },
  { name: "Nazri Ishak", driverId: "DRV-038" },
  { name: "Saiful Nizam", driverId: "DRV-031" },
  { name: "Afiq Daniel", driverId: "DRV-044" },
  { name: "Amirul Hakim", driverId: "DRV-052" },
  { name: "Firdaus Kamal", driverId: "DRV-061" },
  { name: "Iskandar Rosli", driverId: "DRV-063" },
  { name: "Wan Aidil", driverId: "DRV-067" },
];

function initials(name = "") {
  const parts = String(name).split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
}

function VehicleThumb({ inUse = false }) {
  const label = inUse ? "In-use" : "Not in-use";
  return (
    <div className="ovl-thumb" title={label} aria-label={label}>
      <svg className="ovl-thumb-icon" viewBox="0 0 24 24" focusable="false">
        <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h9A1.5 1.5 0 0 1 15 6.5V8h2.4c.5 0 .98.22 1.3.6l2.1 2.52c.26.3.4.7.4 1.1V16a1 1 0 0 1-1 1h-1.05a2.5 2.5 0 0 1-4.9 0h-5.1a2.5 2.5 0 0 1-4.9 0H4a1 1 0 0 1-1-1V6.5Zm12 3.25V12h4.05l-1.48-1.78a1.25 1.25 0 0 0-.96-.47H15ZM6.7 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
      <span className={`ovl-use-dot${inUse ? " in-use" : ""}`} aria-hidden="true" />
    </div>
  );
}

function fmtNumber(n) {
  return Number(n || 0).toLocaleString("en-US");
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(iso + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

function dueRangeKey(days) {
  if (days == null) return "none";
  if (days < 0) return "expired";
  if (days <= 7) return "0-7";
  if (days <= 30) return "8-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "future";
}

function documentExpiryStatus(iso) {
  const days = daysUntil(iso);
  if (days == null) return "doc_active";
  if (days < 0) return "doc_expired";
  if (days <= 7) return "doc_0_7";
  if (days <= 30) return "doc_8_30";
  if (days <= 60) return "doc_31_60";
  if (days <= 90) return "doc_61_90";
  return "doc_future";
}
function expiryRangeLabel(iso) {
  const days = daysUntil(iso);
  if (days == null) return "—";
  if (days < 0) return "Expired";
  if (days <= 7) return "0-7 days";
  if (days <= 30) return "8-30 days";
  if (days <= 60) return "31-60 days";
  if (days <= 90) return "61-90 days";
  return "> 90 days";
}
function expiryTone(iso) {
  const days = daysUntil(iso);
  if (days == null) return "empty";
  if (days <= 30) return "danger";
  if (days <= 90) return "warn";
  return "good";
}

function expiryMeta(iso) {
  const days = daysUntil(iso);
  if (days == null) return "—";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function bestUrgency(vehicle) {
  const docs = DOC_FIELDS
    .map((field) => ({ key: field.key, label: field.label, iso: vehicle[field.key], days: daysUntil(vehicle[field.key]) }))
    .filter((item) => item.days != null)
    .sort((a, b) => a.days - b.days);
  return docs[0] || null;
}

function vehicleDocumentTitle(doc) {
  return doc.type === "Others" && doc.title ? doc.title : doc.type;
}

function flattenVehicleDueDates(vehicles) {
  return vehicles.flatMap((vehicle) => (vehicle.documents || makeVehicleDocuments(vehicle)).filter((doc) => doc.expireDate).map((doc) => ({ vehicle, doc }))).sort((a, b) => new Date(`${a.doc.expireDate}T00:00:00`) - new Date(`${b.doc.expireDate}T00:00:00`));
}

function documentStatus(iso) {
  if (!iso) return "Not set";
  return daysUntil(iso) < 0 ? "Expired" : "Active";
}

function documentTone(iso) {
  const days = daysUntil(iso);
  if (days == null) return "empty";
  if (days < 7) return "danger";
  if (days <= 30) return "warn";
  return "good";
}

function formatReminderList(reminders = []) {
  const values = reminders.map(Number).filter((value) => Number.isFinite(value) && value > 0);
  return values.length ? values.map((value) => `${value} days before expiry date`).join(", ") : "—";
}

function reminderLimitForTier(tier) { return REMINDER_LIMITS[tier] || Infinity; }
function remindersForTier(reminders = [], tier) {
  const limit = reminderLimitForTier(tier);
  return Number.isFinite(limit) ? reminders.slice(0, limit) : reminders;
}

function issuedDateForVehicleDocument(expireDate, field) {
  if (!expireDate) return "";
  const issued = new Date(`${expireDate}T00:00:00`);
  const months = field.key === "puspakom" ? 6 : 12;
  issued.setMonth(issued.getMonth() - months);
  issued.setDate(issued.getDate() + 1);
  return issued.toISOString().slice(0, 10);
}

function makeVehicleDocuments(vehicle) {
  if (Array.isArray(vehicle.documents)) return vehicle.documents;
  return DOC_FIELDS.filter((field) => !field.other).map((field) => ({
    id: `${vehicle.id}-${field.key}`,
    type: field.type,
    startDate: issuedDateForVehicleDocument(vehicle[field.key], field),
    expireDate: vehicle[field.key] || "",
    reminders: [field.defaultReminder, "", ""],
    files: [],
    history: [],
  }));
}

const VEHICLE_FORMS = [
  { key: "daily-vehicle-checklist", label: "Daily Vehicle Checklist", enabled: true, allDefault: false },
  { key: "daily-vehicle-maintenance", label: "Daily Vehicle Maintenance", enabled: false, allDefault: false },
  { key: "daily-driver-checklist", label: "Daily Driver Checklist", enabled: true, allDefault: false },
];
function makeVehicleForms(vehicle) { return (vehicle?.forms || VEHICLE_FORMS).map((form) => ({ ...form })); }

function makeEmptyForm() {
  return {
    plate: "",
    category: "",
    subCategory: "",
    feature: "",
    finishing: "",
    vendor: VENDORS[0],
    btm: "",
    bdm: "",
    capacity: "",
    photo: null,
    managed: false,
    documents: [],
  };
}

function makeFormFromVehicle(vehicle) {
  return {
    plate: vehicle.plate || "",
    category: vehicle.category || "",
    subCategory: vehicle.subCategory || "",
    feature: vehicle.feature || "",
    finishing: vehicle.finishing || "",
    vendor: vehicle.vendor || VENDORS[0],
    btm: vehicle.btm ?? "",
    bdm: vehicle.bdm ?? "",
    capacity: vehicle.capacity ?? "",
    photo: vehicle.photo || null,
    managed: !!vehicle.managed,
    documents: makeVehicleDocuments(vehicle),
  };
}

function normalizeVehicle(vehicle) {
  return {
    ...vehicle,
    managed: !!vehicle.managed,
    drivers: Array.isArray(vehicle.drivers) ? vehicle.drivers : [],
    activeCheckIn: !!vehicle.activeCheckIn,
    accessibleToAll: !!vehicle.accessibleToAll,
    documents: makeVehicleDocuments(vehicle),
  };
}

function deriveVehicles(scenarioKey, tweaks = {}) {
  const scenario = D.scenarios[scenarioKey];
  const managedSet = new Set(scenario.managedIds);
  return D.vehicles.map((vehicle) => {
    const v = normalizeVehicle({ ...vehicle, managed: managedSet.has(vehicle.id) });
    if (tweaks.veh001ActiveCheckIn !== undefined && v.id === "veh-001") {
      v.activeCheckIn = tweaks.veh001ActiveCheckIn;
    }
    return v;
  });
}

function scenarioSummary(scenarioKey, usedCount) {
  const scenario = D.scenarios[scenarioKey];
  const planName = scenario.planName;
  const limit = scenario.limit;
  if (!Number.isFinite(limit)) {
    return {
      state: "healthy",
      label: `${usedCount} Vehicles Managed`,
      helper: "Managed vehicles unlock driver check-in/out, safety checklist, and reminders.",
      note: `${planName} includes unlimited managed vehicle slots.`,
    };
  }
  if (limit === 0) {
    return {
      state: "free",
      label: `${usedCount} / ${limit} Vehicles Managed`,
      helper: "Managed vehicles unlock driver check-in/out, safety checklist, and reminders.",
      note: "Free plan includes no managed vehicles. Manage this vehicle to enable driver features once the plan is upgraded.",
    };
  }
  if (usedCount >= limit) {
    return {
      state: "limit",
      label: `${usedCount} / ${limit} Vehicles Managed`,
      helper: "Managed vehicles unlock driver check-in/out, safety checklist, and reminders.",
      note: `Plan limit reached. ${planName} allows up to ${limit} managed vehicles.`,
    };
  }
  return {
    state: "healthy",
    label: `${usedCount} / ${limit} Vehicles Managed`,
    helper: "Managed vehicles unlock driver check-in/out, safety checklist, and reminders.",
    note: `${limit - usedCount} managed slots available on ${planName}.`,
  };
}

function applyFilters(rows, filters) {
  return rows.filter((row) => {
    if (filters.managedOnly && !row.managed) return false;
    if (filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      if (filters.scope === "vehicle") {
        const vehicleText = `${row.plate} ${row.category}`.toLowerCase();
        if (!vehicleText.includes(q)) return false;
      } else if (filters.scope === "vendor") {
        if (!row.vendor.toLowerCase().includes(q)) return false;
      } else {
        const driverText = row.drivers.map((driver) => `${driver.name} ${driver.driverId} ${driver.phone}`.toLowerCase()).join(" ");
        if (!driverText.includes(q)) return false;
      }
    }

    const relevantFields = filters.dueDateType === "all" ? DOC_FIELDS.map((field) => field.key) : [filters.dueDateType];
    const start = filters.startDate ? new Date(filters.startDate + "T00:00:00") : null;
    const end = filters.endDate ? new Date(filters.endDate + "T23:59:59") : null;

    if (start || end) {
      const matches = relevantFields.some((fieldKey) => {
        const iso = row[fieldKey];
        if (!iso) return false;
        const value = new Date(iso + "T00:00:00");
        if (start && value < start) return false;
        if (end && value > end) return false;
        return true;
      });
      if (!matches) return false;
    }
    return true;
  });
}

function ManagedIcon({ managed, label }) {
  if (!managed) {
    if (!label) return <span className="ovl-managed blank" aria-hidden="true" />;
    return <span className="ovl-managed-label unmanaged"><Icon name="radio_button_unchecked" size={16} color="var(--fg-tertiary)" />Unmanaged</span>;
  }
  if (!label) return (
    <span className="ovl-managed" title="Managed vehicle">
      <Icon name="check_circle" size={18} fill={1} color="var(--green-600)" />
    </span>
  );
  return <span className="ovl-managed-label"><Icon name="check_circle" size={16} fill={1} color="var(--green-600)" />Managed</span>;
}

function ExpiryCell({ iso }) {
  const tone = documentTone(iso);
  return (
    <div className={`ovl-expiry ${tone}`}>
      <span className="ovl-expiry-date">{fmtDate(iso)}</span>
      <span className="ovl-expiry-meta">{expiryMeta(iso)}</span>
    </div>
  );
}

function VehicleDueDates({
  vehicles,
  query,
  scope,
  setQuery,
  setScope,
  dueDateType,
  setDueDateType,
  dueRange,
  setDueRange,
  filterOpen,
  toggleFilterPanel,
  pendingDueDateType,
  setPendingDueDateType,
  pendingDueRange,
  setPendingDueRange,
  applyPendingFilters,
  resetFilters,
  dateFilterCount,
  hasClearableFilters,
  onView,
  onDelete,
  onDocumentsChange,
  onToast,
  tier,
}) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [dueMenuId, setDueMenuId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const rows = useMemo(() => flattenVehicleDueDates(vehicles).filter(({ vehicle, doc }) => {
    const q = query.trim().toLowerCase();
    if (q) {
      const vehicleText = `${vehicle.plate} ${vehicle.category}`.toLowerCase();
      const vendorText = String(vehicle.vendor || "").toLowerCase();
      const driverText = (vehicle.drivers || []).map((driver) => `${driver.name} ${driver.driverId} ${driver.phone}`).join(" ").toLowerCase();
      const docText = `${vehicleDocumentTitle(doc)} ${doc.type} ${doc.description || ""}`.toLowerCase();
      if (scope === "vehicle" && !`${vehicleText} ${docText}`.includes(q)) return false;
      if (scope === "vendor" && !vendorText.includes(q)) return false;
      if (scope === "driver" && !driverText.includes(q)) return false;
    }
    const field = DOC_FIELDS.find((item) => item.type === doc.type);
    if (dueDateType !== "all" && field?.key !== dueDateType) return false;
    if (dueRange !== "all" && dueRangeKey(daysUntil(doc.expireDate)) !== dueRange) return false;
    return true;
  }), [vehicles, query, scope, dueDateType, dueRange]);
  const pageData = useMemo(() => rows.slice((page - 1) * perPage, page * perPage), [rows, page, perPage]);
  useEffect(() => { const totalPages = Math.max(1, Math.ceil(rows.length / perPage)); if (page > totalPages) setPage(totalPages); }, [rows.length, page, perPage]);
  function renderDueMenu(vehicle, doc, rowId) {
    return (
      <VehicleRowMenu
        open={dueMenuId === rowId}
        onToggle={(next) => setDueMenuId(next ? rowId : null)}
        onView={() => { setDueMenuId(null); onView(vehicle, doc); }}
        onEdit={() => { setDueMenuId(null); setEditTarget({ vehicle, doc }); }}
        onDelete={() => { setDueMenuId(null); onDelete(vehicle, doc); }}
        showDelete={false}
      />
    );
  }
  function saveDueDocument(doc) {
    if (!editTarget) return;
    const documents = (editTarget.vehicle.documents || makeVehicleDocuments(editTarget.vehicle)).map((item) => item.id === doc.id ? doc : item);
    onDocumentsChange(editTarget.vehicle.id, documents);
    setEditTarget(null);
    onToast("Document changes saved.");
  }

  return (
    <>
      <section className="ovl-toolbar">
        <div className="hac-toolbar">
          <div className="hac-toolbar-left ovl-toolbar-left">
            <div className="hac-search-group scoped ovl-search-group">
              <SelectMenu className="hac-search-scope" value={scope} options={D.searchScopes} onChange={(next) => { setScope(next); setPage(1); }} ariaLabel="Search by" style={{ width: scope === "vehicle" ? "116px" : scope === "driver" ? "108px" : "110px" }} />
              <div className="hac-search-bar">
                <Icon name="search" size={17} color="var(--fg-tertiary)" />
                <input className="hac-search-input" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder={`Search by ${scope}`} />
                {query && <button className="hac-search-clear" type="button" onClick={() => setQuery("")}><Icon name="close" size={16} /></button>}
              </div>
            </div>
            <button className={`hac-filter-btn${dateFilterCount ? " active" : ""}`} type="button" onClick={toggleFilterPanel}><Icon name="tune" size={18} /> Filter{dateFilterCount > 0 && <span className="hac-filter-badge">{dateFilterCount}</span>}</button>
            {hasClearableFilters && <button className="ovl-clear" type="button" onClick={resetFilters}><Icon name="ink_eraser" size={15} /> Clear filters</button>}
          </div>
        </div>
        {filterOpen && <div className="hac-filter-panel ovl-filter-panel"><div className="hac-filter-grid ovl-filter-grid"><div className="hac-filter-field"><label>Due Date Type</label><div className="hac-select-wrap"><SelectMenu className="hac-select" value={pendingDueDateType} options={D.dueDateTypes} onChange={setPendingDueDateType} ariaLabel="Due date type" /></div></div><div className="hac-filter-field"><label>Expired by</label><div className="hac-select-wrap"><SelectMenu className="hac-select" value={pendingDueRange} options={DUE_RANGE_OPTIONS} onChange={setPendingDueRange} ariaLabel="Expired by" /></div></div></div><div className="hac-filter-actions"><button className="hac-filter-apply" type="button" onClick={() => { applyPendingFilters(); setPage(1); }}>Apply Filters</button><button className="hac-filter-reset" type="button" onClick={() => { resetFilters(); setPage(1); }}>Reset All</button></div></div>}
      </section>
      <div className="hac-count">{rows.length} due date{rows.length === 1 ? "" : "s"}</div>
      <section className="ovl-table-section">
        <div className="ml-table-wrap ovl-table-wrap">
          <table className="ml-table ovl-table ovl-due-table">
            <thead><tr><th>No.</th><th>Vehicle</th><th>Vendor</th><th>Type</th><th>Issued Date</th><th>Expiry Date</th><th>Reminders</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {!rows.length && <tr><td colSpan="8"><div className="ovl-empty-table">No vehicle due dates match the current filters.</div></td></tr>}
              {pageData.map(({ vehicle, doc }, index) => {
                const rowId = `${vehicle.id}-${doc.id}`;
                return (
                  <tr key={rowId}>
                    <td className="ovl-index">{(page - 1) * perPage + index + 1}</td>
                    <td><div className="ovl-vehicle-cell"><VehicleThumb inUse={vehicle.activeCheckIn} /><div className="ovl-vehicle-main"><div className="ml-cell-main ovl-vehicle-plate">{vehicle.plate}</div></div></div></td>
                    <td>{vehicle.vendor}</td>
                    <td><div className="ovl-due-type-cell"><span>{doc.type}</span>{doc.type === "Others" && doc.title && <span>{doc.title}</span>}</div></td>
                    <td>{fmtDate(doc.startDate)}</td>
                    <td><ExpiryCell iso={doc.expireDate} /></td>
                    <td><ReminderSummary reminders={doc.reminders} /></td>
                    <td>{renderDueMenu(vehicle, doc, rowId)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="ovl-mobile-list">
          {pageData.map(({ vehicle, doc }) => {
            const rowId = `mobile-${vehicle.id}-${doc.id}`;
            const tone = documentTone(doc.expireDate);
            return (
              <MobileListCard key={`${vehicle.id}-${doc.id}`}
                leading={<VehicleThumb inUse={vehicle.activeCheckIn} />}
                title={vehicle.plate}
                subtitle={<span className="ml-plain-subtitle">{vehicleDocumentTitle(doc)}</span>}
                status={vehicleDocumentStatus(doc)}
                menu={renderDueMenu(vehicle, doc, rowId)}
              >
                <div className="ml-due-fields">
                  <div className="ml-due-grid">
                    <div className="ml-due-item"><span>Issued date</span><strong>{fmtDate(doc.startDate)}</strong></div>
                    <div className="ml-due-item align-right"><span>Expiry date</span><strong>{fmtDate(doc.expireDate)}</strong></div>
                  </div>
                  <div className="ml-due-grid">
                    <div className="ml-due-item"><span>Time left</span><strong className={`ml-due-value ${tone}`}>{expiryMeta(doc.expireDate)}</strong></div>
                    <div className="ml-due-item align-right"><span>Reminders</span><strong><ReminderSummary reminders={doc.reminders} /></strong></div>
                  </div>
                </div>
              </MobileListCard>
            );
          })}
          {!rows.length && <div className="ovl-mobile-card"><div className="ovl-empty-table">No vehicle due dates match the current filters.</div></div>}
        </div>
      </section>
      <Pager page={page} perPage={perPage} total={rows.length} onPage={setPage} onPerPage={setPerPage} />
      {editTarget && <VehicleDocumentModal initial={editTarget.doc} tier={tier} onClose={() => setEditTarget(null)} onSave={saveDueDocument} onUpgrade={() => onToast("Upgrade options would open here.")} />}
    </>
  );
}

function VehicleRowMenu({ open, onToggle, onView, onEdit, onDelete, showDelete = true }) {
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const dropWidth = 198;

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (btnRef.current?.contains(event.target)) return;
      if (dropRef.current?.contains(event.target)) return;
      onToggle(false);
    };
    const dismiss = () => onToggle(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open, onToggle]);

  function handleToggle(event) {
    event.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.right - dropWidth });
    }
    onToggle(!open);
  }

  return (
    <div className="hac-ellipsis">
      <button className="ml-icon-btn ovl-menu-btn" type="button" ref={btnRef} onClick={handleToggle}>
        <Icon name="more_horiz" size={18} />
      </button>
      {open && ReactDOM.createPortal(
        <div className="hac-drop-fixed ovl-drop" ref={dropRef} style={{ top: pos.top, left: pos.left }} onClick={(event) => event.stopPropagation()}>
          <button className="hac-drop-item" type="button" onClick={onView}>
            <Icon name="visibility" size={15} /> View
          </button>
          <button className="hac-drop-item" type="button" onClick={onEdit}>
            <Icon name="edit" size={15} /> Edit
          </button>
          {showDelete && <button className="hac-drop-item danger" type="button" onClick={onDelete}>
            <Icon name="delete" size={15} /> Delete
          </button>}
        </div>,
        document.body
      )}
    </div>
  );
}

function ExpandableVehicleDriversRow({ vehicle }) {
  const driverCount = vehicle.drivers.length;
  const driverLabel = driverCount === 1 ? "1 driver assigned" : `${driverCount} drivers assigned`;
  return (
    <div className="ovl-expanded-wrap">
      <div className="ovl-expanded-head">
        <div className="ovl-expanded-title">{driverCount ? driverLabel : "No drivers assigned"}</div>
      </div>
      {driverCount ? (
        <div className="ovl-driver-grid">
          {vehicle.drivers.map((driver) => (
            <div className="ovl-driver-card" key={driver.driverId}>
              <div className="ovl-driver-avatar">{initials(driver.name)}</div>
              <div className="ovl-driver-main">
                <div className="ovl-driver-name">{driver.name}</div>
                <div className="ovl-driver-meta">{driver.driverId}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ovl-empty-drivers">
          Assign a driver to this vehicle from the vehicle detail page.
        </div>
      )}
    </div>
  );
}

function AssignedDriversModal({ vehicle, onClose }) {
  const [query, setQuery] = useState("");
  const drivers = vehicle.drivers.filter((driver) => `${driver.name} ${driver.driverId}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <HacModal title="Assigned drivers" onClose={onClose} footer={<button className="hac-modal-cancel" type="button" onClick={onClose}>Close</button>}>
    <div className="ovl-driver-modal-search">
      <Icon name="search" size={17} color="var(--fg-tertiary)" />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search drivers" aria-label="Search assigned drivers" />
    </div>
    <div className="ovl-driver-modal-list">
      {!drivers.length ? <div className="ovl-driver-modal-empty">{vehicle.drivers.length ? "No drivers match your search." : "No drivers assigned."}</div> : drivers.map((driver) => <div className="ovl-driver-modal-row" key={driver.driverId}>
        <div className="ovl-driver-avatar">{initials(driver.name)}</div>
        <div className="ovl-driver-main"><div className="ovl-driver-name">{driver.name}</div><div className="ovl-driver-meta">{driver.driverId}</div></div>
      </div>)}
    </div>
  </HacModal>;
}

function VehicleFormsTab({ forms, onChange, onToast }) {
  function toggleEnabled(key) {
    onChange(forms.map((form) => form.key === key ? { ...form, enabled: !form.enabled } : form));
    const form = forms.find((item) => item.key === key);
    onToast(`${form.label} ${form.enabled ? "disabled" : "enabled"}.`);
  }
  function toggleDefault(key) {
    onChange(forms.map((form) => form.key === key ? { ...form, allDefault: !form.allDefault } : form));
  }
  return (
    <section className="ml-card ovl-form-card ovl-forms-card">
      <div className="hac-sec-header"><div>Forms</div></div>
      <div className="ovl-form-body ovl-forms-grid">
        {forms.map((form) => (
          <div className="ovl-form-toggle-card" key={form.key}>
            <div className="ovl-form-toggle-head">
              <span className="ovl-form-toggle-name">{form.label}</span>
              <div className="ovl-switch-inline">
                <button type="button" className={`ovl-switch-btn${form.enabled ? " on" : ""}`} aria-pressed={form.enabled} aria-label={`${form.enabled ? "Disable" : "Enable"} ${form.label}`} onClick={() => toggleEnabled(form.key)} />
                <span className="ovl-form-toggle-state">{form.enabled ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
            <label className={`ovl-form-default${form.enabled ? "" : " disabled"}`}>
              <input type="checkbox" checked={form.allDefault} disabled={!form.enabled} onChange={() => toggleDefault(form.key)} />
              Set All as Default
              <span className="ml-tooltip-wrap"><Icon name="info" size={15} color="var(--fg-tertiary)" /><span className="ml-tooltip">Auto-selects a default answer for every question in this form.</span></span>
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

function DriverListPanel({ vehicle, onToggleAccessibleToAll, onOpenPicker, onRemoveDriver }) {
  const count = vehicle.drivers.length;
  const empty = vehicle.accessibleToAll || count === 0;
  return (
    <div className="ml-card ovl-form-card ovl-driver-panel">
      <div className="ovl-driver-panel-head">
        <div className="ovl-driver-panel-title">
          Driver List
          {!vehicle.accessibleToAll && (
            <span className="ovl-driver-panel-count">{count} record{count === 1 ? "" : "s"}</span>
          )}
        </div>
        <label className="ovl-driver-access-check">
          <input type="checkbox" checked={vehicle.accessibleToAll} onChange={onToggleAccessibleToAll} />
          <span>Accessible to all drivers</span>
          <span className="ml-tooltip-wrap ovl-driver-info-wrap" tabIndex={0}>
            <Icon name="info" size={18} color="var(--fg-tertiary)" />
            <span className="ml-tooltip ovl-driver-info-tooltip">When enabled, all drivers can check into this vehicle without direct assignment</span>
          </span>
        </label>
        <button
          className="hac-save-btn ovl-driver-add-btn"
          type="button"
          onClick={onOpenPicker}
          disabled={vehicle.accessibleToAll}
        >
          <Icon name="add" size={16} color="#fff" /> Add Driver
        </button>
      </div>
      {empty ? (
        vehicle.accessibleToAll ? (
          <div className="ovl-driver-empty">
            <Icon name="how_to_reg" size={34} />
            <div className="ovl-driver-empty-title">All drivers can access this vehicle</div>
            <div className="ovl-driver-empty-sub">Please uncheck the 'Accessible to all drivers' box to reassign drivers</div>
          </div>
        ) : (
          <div className="ovl-driver-empty">
            <Icon name="person_off" size={34} />
            <div className="ovl-driver-empty-title">No drivers have access</div>
            <div className="ovl-driver-empty-sub">Please search driver to assign or tick the 'Accessible to all drivers' box</div>
          </div>
        )
      ) : (
        <table className="ml-table ovl-driver-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>No.</th>
              <th>Driver Name</th>
              <th>Driver ID</th>
              <th style={{ width: 44 }}></th>
            </tr>
          </thead>
          <tbody>
            {vehicle.drivers.map((driver, index) => (
              <tr key={driver.driverId}>
                <td>{index + 1}</td>
                <td>{driver.name}</td>
                <td>{driver.driverId}</td>
                <td>
                  <button className="ovl-driver-remove-btn" type="button" onClick={() => onRemoveDriver(driver.driverId)} aria-label={`Remove ${driver.name}`}>
                    <Icon name="delete" size={16} color="#D55F5A" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function DriverPickerModal({ vehicle, onClose, onAdd }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const assignedIds = new Set(vehicle.drivers.map((driver) => driver.driverId));
  const q = query.trim().toLowerCase();
  const available = DRIVER_POOL.filter((driver) => {
    if (assignedIds.has(driver.driverId)) return false;
    if (!q) return true;
    return driver.name.toLowerCase().includes(q) || driver.driverId.toLowerCase().includes(q);
  });

  function toggle(driverId) {
    setSelected((current) => current.includes(driverId) ? current.filter((id) => id !== driverId) : [...current, driverId]);
  }

  function handleAdd() {
    onAdd(DRIVER_POOL.filter((driver) => selected.includes(driver.driverId)));
  }

  return ReactDOM.createPortal(
    <div className="hac-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="hac-modal">
        <div className="hac-modal-drag" />
        <div className="hac-modal-head">
          <span className="hac-modal-title">Add driver</span>
          <button className="hac-modal-close" onClick={onClose}><Icon name="close" size={20} /></button>
        </div>
        <div className="hac-modal-divider" />
        <div className="hac-modal-body">
          <div className="hac-search-bar ovl-picker-search">
            <Icon name="search" size={17} color="var(--fg-tertiary)" />
            <input
              className="hac-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search driver name or ID"
              autoFocus
            />
          </div>
          <div className="ovl-picker-list">
            {!available.length && <div className="ovl-empty-drivers">No matching drivers available.</div>}
            {available.map((driver) => (
              <label key={driver.driverId} className="ovl-picker-row">
                <input type="checkbox" checked={selected.includes(driver.driverId)} onChange={() => toggle(driver.driverId)} />
                <div className="ovl-driver-avatar">{initials(driver.name)}</div>
                <div className="ovl-picker-row-text">
                  <div className="ovl-driver-name">{driver.name}</div>
                  <div className="ovl-driver-meta">{driver.driverId}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="hac-modal-foot">
          <button className="hac-modal-cancel" type="button" onClick={onClose}>Cancel</button>
          <button className="hac-modal-save" type="button" disabled={!selected.length} onClick={handleAdd}>
            Add{selected.length ? ` (${selected.length})` : ""}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Rail() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`ovl-rail-wrap${expanded ? " expanded" : ""}`}>
      <nav className={`ovl-rail${expanded ? " expanded" : ""}`} aria-label="MyAdmin navigation">
        <div className="ovl-rail-profile">
          <div className="ovl-rail-avatar-wrap">
            <div className="ovl-rail-avatar"><Icon name="person" size={18} fill={1} color="#94A8B2" /></div>
            {!expanded && <span className="ovl-rail-badge">ORG</span>}
          </div>
          {expanded && (
            <div className="ovl-rail-profile-text">
              <span className="ovl-rail-profile-role">MyAdmin</span>
              <span className="ovl-rail-profile-name">Module</span>
            </div>
          )}
        </div>

        {MYADMIN_ITEMS.map((item) => {
          const body = (
            <>
              <Icon name={item.icon} size={20} fill={item.key === "vehicle" ? 1 : 0} />
              <span>{item.label}</span>
            </>
          );
          return item.href ? (
            <a key={item.key} href={item.href} className={`ovl-rail-item${item.key === "vehicle" ? " active" : ""}`}>
              {body}
            </a>
          ) : (
            <button key={item.key} type="button" className="ovl-rail-item">
              {body}
            </button>
          );
        })}

        <div className="ovl-rail-divider" />
        <div className="ovl-rail-footer">
          <a href="../org-dashboard/index.html" className="ovl-rail-item ovl-rail-signout">
            <Icon name="logout" size={20} />
            {expanded && <span>Back to Home</span>}
          </a>
        </div>
      </nav>
      <button type="button" className="ovl-rail-toggle" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}>
        <Icon name="chevron_left" size={16} />
      </button>
    </div>
  );
}

function VehiclePageHead({ mode, vehicle, onBack }) {
  const isCreate = mode === "create";
  const title = isCreate ? "Create vehicle" : (vehicle?.plate || "Vehicle");
  const crumbLabel = isCreate ? "Create" : "View";
  return (
    <div className="ml-page-head ovl-pagehead">
      <div>
        <div className="hac-breadcrumb">
          <button className="hac-bc-link" type="button" onClick={onBack}>Vehicles</button>
          <Icon name="chevron_right" size={16} color="var(--fg-tertiary)" />
          <span>{crumbLabel}</span>
        </div>
        <h1 className="ml-h1 ovl-title" style={{ margin: "10px 0 18px" }}>{title}</h1>
      </div>
    </div>
  );
}

function VehicleFormEditBar({ mode, onCancel }) {
  return (
    <div className="hac-edit-bar ovl-edit-bar">
      <button className="hac-cancel-btn" type="button" onClick={onCancel}>Cancel</button>
      <button className="hac-save-btn" type="submit" form="ovl-vehicle-form">
        {mode === "create" ? "Save" : "Save changes"}
      </button>
    </div>
  );
}

function VehiclePhotoField({ photo, onChange }) {
  function handleFiles(files) {
    const file = files && files[0];
    if (!file) return;
    onChange({ name: file.name, url: URL.createObjectURL(file) });
  }
  return <HacFileUpload accept="image/jpeg,image/png,image/webp" onFiles={handleFiles} description={<><span>Click to upload</span> or drag and drop</>} hint="jpg, jpeg, png, webp (max. 12MB)" preview={photo && <img src={photo.url} alt="" className="hac-file-upload-preview" />} />;
}

function ViewField({ label, value }) {
  return (
    <div className="hac-fg">
      <label className="hac-label">{label}</label>
      <div className="hac-view-val">{value || "—"}</div>
    </div>
  );
}

function VehicleViewSections({ form, nextManagedCount, scope, onEdit }) {
  const remainingSlots = Number.isFinite(scope.limit) ? Math.max(scope.limit - nextManagedCount, 0) : Infinity;
  const slotsLabel = !Number.isFinite(scope.limit)
    ? "Unlimited managed vehicle slots"
    : scope.limit === 0
    ? "No managed vehicle slots on this plan"
    : `${remainingSlots} of ${scope.limit} slot${scope.limit === 1 ? "" : "s"} remaining`;

  return (
    <div className="ovl-form">
      <div className="ml-card ovl-form-card">
        <div className="hac-sec-header ovl-tab-head">
          <div>Vehicle details</div>
          {onEdit && <button className="ml-btn-outline ovl-tab-edit" type="button" onClick={onEdit}><Icon name="edit" size={16} /> Edit</button>}
        </div>
        <div className="hac-form-grid3 ovl-details-grid ovl-form-body">
          <div className="ovl-details-photo-cell ovl-view-photo">
            {form.photo ? <img src={form.photo.url} alt="" className="ovl-dropzone-preview" /> : <span>No photo uploaded</span>}
          </div>
          <ViewField label="Vehicle no." value={form.plate} />
          <ViewField label="Vehicle category" value={form.category} />
          <ViewField label="Sub category" value={form.subCategory} />
          <ViewField label="Vendor name" value={form.vendor} />
        </div>
        {scope.limit > 0 && (
          <div className="ovl-managed-row">
            <ManagedIcon managed={form.managed} />
            <div className="ovl-managed-card-text">
              <div className="ovl-switch-title-row">
                <span className="ovl-switch-title">{form.managed ? "Managed" : "Not managed"}</span>
                <span className={`ovl-managed-count${form.managed ? " active" : ""}`}>{slotsLabel}</span>
              </div>
              <div className="ovl-switch-sub">Enables driver check-in/out, safety checklist, and reminders.</div>
            </div>
          </div>
        )}
      </div>

      <div className="ml-card ovl-form-card">
        <div className="hac-sec-header">
          <div>Vehicle specifications</div>
        </div>
        <div className="hac-form-grid3 ovl-form-body">
          <ViewField label="Feature" value={form.feature} />
          <ViewField label="Finishing" value={form.finishing} />
          <ViewField label="Vehicle weight (BTM)" value={form.btm ? `${fmtNumber(form.btm)} kg` : ""} />
          <ViewField label="Total weight (BDM)" value={form.bdm ? `${fmtNumber(form.bdm)} kg` : ""} />
          <ViewField label="Load capacity" value={form.capacity ? `${fmtNumber(form.capacity)} kg` : ""} />
        </div>
      </div>
    </div>
  );
}

function VehicleFormSections({ form, update, overCap, nextManagedCount, scope, onSubmit, onToggleManaged }) {
  const subCategoryOptions = VEHICLE_SUB_CATEGORIES_BY_CATEGORY[form.category] || [];
  const remainingSlots = Number.isFinite(scope.limit) ? Math.max(scope.limit - nextManagedCount, 0) : Infinity;
  const slotsLabel = !Number.isFinite(scope.limit)
    ? "Unlimited managed vehicle slots"
    : scope.limit === 0
    ? "No managed vehicle slots on this plan"
    : `${remainingSlots} of ${scope.limit} slot${scope.limit === 1 ? "" : "s"} remaining`;

  return (
    <form id="ovl-vehicle-form" className="ovl-form" onSubmit={onSubmit}>
      <div className="ml-card ovl-form-card">
        <div className="hac-sec-header">
          <div>Vehicle details</div>
        </div>
        <div className="hac-form-grid3 ovl-details-grid ovl-form-body">
          <div className="ovl-details-photo-cell">
            <VehiclePhotoField photo={form.photo} onChange={(photo) => update("photo", photo)} />
          </div>
          <div className="hac-fg">
            <label className="hac-label">Vehicle no. <span className="ovl-req">*</span></label>
            <input className="hac-input" value={form.plate} onChange={(e) => update("plate", e.target.value)} placeholder="Enter vehicle no" required />
          </div>
          <div className="hac-fg">
            <label className="hac-label">Vehicle category <span className="ovl-req">*</span></label>
            <div className="hac-select-wrap">
              <select
                className="hac-select"
                value={form.category}
                onChange={(e) => { update("category", e.target.value); update("subCategory", ""); }}
                required
              >
                <option value="" disabled>Select vehicle category</option>
                {VEHICLE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
          </div>
          <div className="hac-fg">
            <label className="hac-label">Sub category</label>
            <div className="hac-select-wrap">
              <select
                className="hac-select"
                value={form.subCategory}
                onChange={(e) => update("subCategory", e.target.value)}
                disabled={!subCategoryOptions.length}
              >
                <option value="">{subCategoryOptions.length ? "Select vehicle sub category" : "No sub categories for this category yet"}</option>
                {subCategoryOptions.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
          </div>
          <div className="hac-fg">
            <label className="hac-label">Vendor name</label>
            <div className="hac-select-wrap">
              <select className="hac-select" value={form.vendor} onChange={(e) => update("vendor", e.target.value)}>
                {VENDORS.map((vendor) => <option key={vendor} value={vendor}>{vendor}</option>)}
              </select>
            </div>
          </div>
        </div>
        {scope.limit > 0 && (
          <>
            <div className="ovl-managed-row">
              <button
                type="button"
                className={`ovl-switch-btn${form.managed ? " on" : ""}`}
                onClick={onToggleManaged}
                aria-pressed={form.managed}
              />
              <div className="ovl-managed-card-text">
                <div className="ovl-switch-title-row">
                  <span className="ovl-switch-title">Managed vehicle</span>
                  <span className={`ovl-managed-count${form.managed ? " active" : ""}`}>{slotsLabel}</span>
                </div>
                <div className="ovl-switch-sub">Enables driver check-in/out, safety checklist, and reminders.</div>
              </div>
            </div>
            {overCap && (
              <div className="ovl-switch-sub ovl-managed-warn">
                You've reached your plan limit of managed vehicles. Upgrade your plan to manage more.
              </div>
            )}
          </>
        )}
      </div>

      <div className="ml-card ovl-form-card">
        <div className="hac-sec-header">
          <div>Vehicle specifications</div>
        </div>
        <div className="hac-form-grid3 ovl-form-body">
          <div className="hac-fg">
            <label className="hac-label">Feature</label>
            <div className="hac-select-wrap">
              <select className="hac-select" value={form.feature} onChange={(e) => update("feature", e.target.value)}>
                <option value="">Select feature</option>
                {VEHICLE_FEATURES.map((feature) => <option key={feature} value={feature}>{feature}</option>)}
              </select>
            </div>
          </div>
          <div className="hac-fg">
            <label className="hac-label">Finishing</label>
            <div className="hac-select-wrap">
              <select className="hac-select" value={form.finishing} onChange={(e) => update("finishing", e.target.value)}>
                <option value="">Select finishing</option>
                {VEHICLE_FINISHES.map((finish) => <option key={finish} value={finish}>{finish}</option>)}
              </select>
            </div>
          </div>
          <div className="hac-fg">
            <label className="hac-label">Vehicle weight (BTM)</label>
            <input className="hac-input" value={form.btm} onChange={(e) => update("btm", e.target.value)} placeholder="Enter weight in kg" />
          </div>
          <div className="hac-fg">
            <label className="hac-label">Total weight (BDM)</label>
            <input className="hac-input" value={form.bdm} onChange={(e) => update("bdm", e.target.value)} placeholder="Enter weight in kg" />
          </div>
          <div className="hac-fg">
            <label className="hac-label">Load capacity</label>
            <input className="hac-input" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} placeholder="Enter maximum load capacity" />
          </div>
        </div>
      </div>
    </form>
  );
}

function vehicleDocumentStatus(doc) {
  return <StatusBadge status={documentExpiryStatus(doc.expireDate)} />;
}

function VehicleDocumentUpload({ files, onFiles }) {
  const currentFiles = files || [];
  function addFiles(fileList) {
    const next = Array.from(fileList || []).slice(0, 5 - currentFiles.length).map((file) => ({
      id: `file-${Date.now()}-${file.name}`,
      name: file.name,
      kind: file.type?.startsWith("image/") ? "image" : "pdf",
      url: file.type?.startsWith("image/") ? URL.createObjectURL(file) : "",
      uploadedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    }));
    if (next.length) onFiles([...currentFiles, ...next]);
  }
  function removeFile(id) {
    onFiles(currentFiles.filter((file) => file.id !== id));
  }
  return <><HacFileUpload multiple accept="image/jpeg,image/png,image/webp,application/pdf" onFiles={addFiles} description={<><span>Click to upload</span> or drag and drop</>} hint="Images or PDF, up to 5 files" />{currentFiles.length > 0 && <div className="ovl-upload-files">{currentFiles.map((file) => <div className="ovl-upload-file" key={file.id}>{file.kind === "image" ? <img src={file.url} alt="" /> : <span className="ovl-upload-pdf"><Icon name="picture_as_pdf" size={22} color="#bd4f48" /></span>}<button type="button" className="ovl-upload-remove" aria-label="Remove attachment" onClick={() => removeFile(file.id)}><Icon name="close" size={16} /></button></div>)}</div>}<span className="ovl-file-limit">{currentFiles.length} of 5 files</span></>;
}

function VehicleFilePreview({ file, onClose }) {
  return <HacModal title="File preview" onClose={onClose} className="ovl-preview-hac-modal" footer={<><button className="ml-btn-soft" type="button"><Icon name="download" size={15} color="var(--green-600)" />Download</button><button className="hac-modal-cancel" type="button" onClick={onClose}>Close</button></>}>
    <div className="ovl-preview-body">{file.kind === "image" ? <div className="ovl-preview-image"><img src={file.url} alt="" /></div> : <div className="ovl-preview-placeholder"><Icon name="picture_as_pdf" size={48} color="#bd4f48" /><span>PDF preview is not available in this prototype.</span></div>}<div className="ovl-preview-name">{file.name}</div><div className="ovl-preview-date">Updated {file.uploadedDate || "—"}</div></div>
  </HacModal>;
}

function fileCountLabel(files = []) {
  return files.length === 1 ? "1 file" : files.length ? `${files.length} files` : "No files";
}

function VehicleFileLink({ file, onPreview }) {
  return <button className="ovl-file-link ovl-file-thumb" type="button" aria-label="Open attachment" onClick={() => onPreview(file)}>{file.kind === "image" ? <img src={file.url} alt="" /> : <span className="ovl-file-thumb-pdf"><Icon name="picture_as_pdf" size={20} color="#bd4f48" /></span>}</button>;
}

function VehicleDocumentFiles({ files = [], onPreview }) {
  const visibleFiles = files.slice(0, 2);
  if (!files.length) {
    return <div className="ovl-doc-file-row"><div className="ovl-doc-file-list"><span className="ovl-doc-file-empty">No files uploaded</span></div><span className="ovl-doc-file-count"><Icon name="attach_file" size={14} />{fileCountLabel(files)}</span></div>;
  }
  return <div className="ovl-doc-file-row"><div className="ovl-doc-file-list">{visibleFiles.map((file) => <VehicleFileLink key={file.id} file={file} onPreview={onPreview} />)}</div><button className="ovl-doc-file-count" type="button" onClick={() => onPreview(files[0])} aria-label={`Open ${fileCountLabel(files)}`}><Icon name="attach_file" size={14} />{fileCountLabel(files)}</button></div>;
}

function VehicleDocumentMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return <div className="ovl-doc-menu"><button type="button" aria-label="Document actions" aria-expanded={open} onClick={() => setOpen((value) => !value)}><Icon name="more_horiz" size={19} /></button>{open && <div className="ovl-doc-menu-pop"><button type="button" onClick={() => { setOpen(false); onEdit(); }}><Icon name="edit" size={15} />Edit</button><button className="danger" type="button" onClick={() => { setOpen(false); onDelete(); }}><Icon name="delete" size={15} />Delete</button></div>}</div>;
}

function VehicleDocumentDescription({ description }) {
  const [expanded, setExpanded] = useState(false);
  const text = description || "No description";
  const canExpand = text.length > 90;
  return <div className="ovl-doc-description-block"><span className="ovl-doc-description-label">Description</span><p className={`ovl-doc-description-text${canExpand && !expanded ? " clamped" : ""}`}>{text}</p>{canExpand && <button className="ovl-doc-description-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? "Show less" : "Show more"}<Icon name={expanded ? "expand_less" : "expand_more"} size={14} /></button>}</div>;
}

function VehicleHistoryRow({ record }) {
  const isOther = record.type === "Others" || record.title || record.description;
  return <div className="ovl-history-row"><div className="ovl-history-top"><div className="ovl-history-sub">Updated {record.uploadedDate || record.createdDate || "—"}{record.uploadedBy ? ` by ${record.uploadedBy}` : ""}</div></div><div className="ovl-history-bottom"><div className="ovl-history-meta-group">{isOther && <div className="ovl-history-meta"><span className="ovl-history-label">Title</span><span className="ovl-history-value">{record.title || "Others"}</span></div>}<div className="ovl-history-meta"><span className="ovl-history-label">Issued date</span><span className="ovl-history-value">{fmtDate(record.startDate)}</span></div><div className="ovl-history-meta"><span className="ovl-history-label">Expiry date</span><span className="ovl-history-value">{fmtDate(record.expireDate)}</span></div><div className="ovl-history-meta"><span className="ovl-history-label">Expiry Status</span>{!(isOther && !record.expireDate) ? <StatusBadge status={documentExpiryStatus(record.expireDate)} /> : <span className="ovl-history-value">—</span>}</div><div className="ovl-history-meta"><span className="ovl-history-label">Reminders</span><span className="ovl-history-reminder">{record.expireDate ? formatReminderList(record.reminders) : "—"}</span></div></div><div className="ovl-history-actions"><button className="ml-btn-soft" type="button"><Icon name="download" size={15} color="var(--green-600)" />Download</button></div></div></div>;
}

function VehicleDocumentModal({ initial, tier, onClose, onSave, onUpgrade }) {
  const [form, setForm] = useState(() => {
    const initialReminders = remindersForTier(initial.reminders || [], tier).filter((value) => value !== "");
    const firstReminder = initialReminders.find((value) => Number(value) > 0) || 30;
    return { ...initial, reminders: initialReminders.length ? initialReminders : [firstReminder] };
  });
  const [errors, setErrors] = useState({});
  const rule = DOC_FIELDS.find((field) => field.type === form.type) || DOC_FIELDS[0];
  const reminderLimit = reminderLimitForTier(tier);
  const reachedReminderLimit = Number.isFinite(reminderLimit) && form.reminders.length >= reminderLimit;
  const isOther = form.type === "Others";
  const showReminders = true;
  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  function updateReminder(index, value) {
    setForm((current) => ({ ...current, reminders: current.reminders.map((item, i) => i === index ? (value === "" ? "" : Number(value)) : item) }));
  }
  function addReminder() {
    if (reachedReminderLimit) {
      onUpgrade();
      return;
    }
    setForm((current) => ({ ...current, reminders: [...current.reminders, ""] }));
  }
  function removeReminder(index) {
    setForm((current) => ({ ...current, reminders: current.reminders.filter((_, i) => i !== index) }));
  }
  function submit(event) {
    event.preventDefault();
    const next = {};
    if (isOther && !form.title?.trim()) next.title = "Title is required.";
    if (rule.startRequired && !form.startDate) next.startDate = "Issued date is required for this document type.";
    if (rule.expiryRequired && !form.expireDate) next.expireDate = "Expiry date is required.";
    if (showReminders && !form.reminders[0]) next.reminder = "Reminder 1 is required.";
    setErrors(next);
    if (!Object.keys(next).length) onSave({ ...form, reminders: form.reminders.map(Number).filter((value) => Number.isFinite(value) && value > 0), files: (form.files || []).slice(0, 5) });
  }
  const title = initial.id ? `Edit ${form.type}` : `Add ${form.type}`;
  return <HacModal title={title} onClose={onClose} className="ovl-doc-modal" footer={<><button className="hac-modal-cancel" type="button" onClick={onClose}>Cancel</button><button className="hac-modal-save" type="submit" form="vehicle-document-form">{initial.id ? "Save changes" : "Add document"}</button></>}>
    <form id="vehicle-document-form" onSubmit={submit}>
      <div className="ovl-doc-fields">
        <div className="ovl-doc-field"><label>Document type *</label><SelectMenu className="ovl-doc-select" value={form.type} options={DOC_FIELDS.map((field) => ({ value: field.type, label: field.type }))} onChange={(value) => { const next = DOC_FIELDS.find((field) => field.type === value) || DOC_FIELDS[0]; setForm((current) => ({ ...current, type: value, reminders: [next.defaultReminder] })); }} ariaLabel="Document type" /></div>
        {isOther && <div className="ovl-doc-field"><label>Title *</label><input value={form.title || ""} onChange={(e) => update("title", e.target.value)} placeholder="Reminder title" />{errors.title && <span className="ovl-doc-error">{errors.title}</span>}</div>}
        <div className="ovl-doc-field"><label>Issued date{rule.startRequired ? " *" : ""}</label><input type="date" value={form.startDate || ""} onChange={(e) => update("startDate", e.target.value)} />{errors.startDate && <span className="ovl-doc-error">{errors.startDate}</span>}</div>
        <div className="ovl-doc-field"><label>Expiry date{rule.expiryRequired ? " *" : ""}</label><input type="date" value={form.expireDate || ""} onChange={(e) => update("expireDate", e.target.value)} />{errors.expireDate && <span className="ovl-doc-error">{errors.expireDate}</span>}</div>
        {isOther && <div className="ovl-doc-field full"><label>Description</label><textarea className="ovl-doc-textarea" value={form.description || ""} onChange={(e) => update("description", e.target.value)} placeholder="Add reminder context" /></div>}
        <div className="ovl-doc-field full"><div className="ovl-doc-field-label-row"><label>File upload</label><span className="ovl-file-limit">{(form.files || []).length} of 5 files</span></div><VehicleDocumentUpload files={form.files || []} onFiles={(files) => update("files", files)} /></div>
      </div>
      {showReminders && <div className="ovl-doc-reminders"><div className="ovl-reminder-head"><h3>Reminder schedule</h3><button className="ml-btn-soft ovl-reminder-add" type="button" onClick={addReminder}><Icon name="add" size={15} color="var(--green-600)" />Add reminder</button></div><div className="ovl-reminder-list">{form.reminders.map((value, index) => <div className="ovl-reminder-row" key={index}><div className="ovl-doc-field ovl-reminder-input"><label>Reminder {index + 1}{index === 0 ? " *" : ""}</label><input type="number" min="1" value={value || ""} placeholder={index === 0 ? String(rule.defaultReminder) : "Optional"} onChange={(e) => updateReminder(index, e.target.value)} /><span className="ovl-reminder-unit">days</span>{index === 0 && errors.reminder && <span className="ovl-doc-error">{errors.reminder}</span>}</div>{index > 0 && <button className="ovl-reminder-remove" type="button" aria-label={`Remove reminder ${index + 1}`} onClick={() => removeReminder(index)}><Icon name="delete" size={16} /></button>}</div>)}</div>{reachedReminderLimit && <div className="ovl-upgrade-alert"><span>{tier === "free" ? "Free includes 1 reminder slot." : "Lite and Premium include up to 3 reminder slots."} Enterprise allows unlimited reminders.</span><button type="button" onClick={onUpgrade}>Upgrade plan</button></div>}</div>}
    </form>
  </HacModal>;
}

function VehicleDocumentCard({ doc, editable, tier, onEdit, onDelete, onPreview }) {
  const [historyModal, setHistoryModal] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(5);
  const history = doc.history || [];
  const visibleReminders = remindersForTier(doc.reminders || [], tier);
  const isOther = doc.type === "Others";
  function openHistory() {
    setHistoryLimit(5);
    setHistoryModal(true);
  }
  return <article className="ovl-doc-row"><div className="ovl-doc-top"><div className="ovl-doc-type-wrap"><div className="ovl-doc-type">{isOther ? (doc.title || "Others") : doc.type}</div></div><div className="ovl-doc-top-spacer" />{doc.files?.[0]?.uploadedDate && <div className="ovl-doc-upload-info">Updated {doc.files[0].uploadedDate}</div>}{editable && <VehicleDocumentMenu onEdit={onEdit} onDelete={onDelete} />}</div><div className="ovl-doc-meta-row"><div className="ovl-doc-meta"><span>Issued date</span><span>{fmtDate(doc.startDate)}</span></div><div className="ovl-doc-meta"><span>Expiry date</span><span>{fmtDate(doc.expireDate)}</span></div><div className="ovl-doc-meta"><span>Time left</span><span className={`ovl-time-left ${expiryTone(doc.expireDate)}`}>{expiryMeta(doc.expireDate)}</span></div><div className="ovl-doc-meta"><span>Reminders</span><span>{doc.expireDate ? <ReminderSummary reminders={visibleReminders} /> : "—"}</span></div></div>{isOther && <VehicleDocumentDescription description={doc.description} />}<VehicleDocumentFiles files={doc.files || []} onPreview={onPreview} />{history.length ? <><button className="ovl-doc-history" type="button" onClick={openHistory}>View history<Icon name="chevron_right" size={17} /></button>{historyModal && <HacModal title={`Document History — ${isOther ? (doc.title || "Others") : doc.type}`} onClose={() => setHistoryModal(false)} className="ovl-history-modal"><div className="ovl-history-modal-body">{history.slice(0, historyLimit).map((record) => <VehicleHistoryRow key={record.id} record={{ ...record, type: doc.type }} />)}{historyLimit < history.length && <button className="ml-btn-soft ovl-history-load" type="button" onClick={() => setHistoryLimit((value) => value + 5)}>Load more</button>}</div></HacModal>}</> : <div className="ovl-doc-no-history">No historical data</div>}</article>;
}

function VehicleRemindersTab({ vehicle, documents, editable, tier, onChange, onToast }) {
  const [modal, setModal] = useState(null);
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const typedDocuments = documents.filter((doc) => doc.type !== "Others");
  const otherDocuments = documents.filter((doc) => doc.type === "Others");
  function saveDocument(doc) { const exists = documents.some((item) => item.id === doc.id); const now = new Date(); const finalDoc = exists ? doc : { ...doc, uploadedDate: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), uploadedBy: vehicle.plate }; onChange(exists ? documents.map((item) => item.id === doc.id ? finalDoc : item) : [finalDoc, ...documents]); setModal(null); onToast(exists ? `${doc.type} changes saved.` : `${doc.type} added.`); }
  function removeDocument() { if (!deleteTarget) return; onChange(documents.filter((item) => item.id !== deleteTarget.id)); onToast(`${deleteTarget.type} deleted.`); setDeleteTarget(null); }
  function newDocument() { const field = DOC_FIELDS[0]; return { id: null, type: field.type, startDate: "", expireDate: "", reminders: [field.defaultReminder, "", ""], files: [], history: [] }; }
  function renderGroup(title, items) { if (!items.length) return null; return <section className="ovl-doc-section" key={title}><div className="ovl-doc-section-head"><span className="ovl-doc-section-title">{title}</span><span className="ovl-doc-section-count">{items.length}</span></div><div className="ovl-doc-list">{items.map((doc) => <VehicleDocumentCard key={doc.id} doc={doc} editable={editable} tier={tier} onEdit={() => setModal(doc)} onDelete={() => setDeleteTarget(doc)} onPreview={setPreview} />)}</div></section>; }
  const addBtn = editable && <button className="ml-btn-soft ovl-doc-add" type="button" onClick={() => setModal(newDocument())}><Icon name="add" size={16} color="var(--green-600)" />Add<span className="ovl-doc-add-full"> document</span></button>;
  return <section className="ml-card ovl-documents-panel">{documents.length ? <><div className="ovl-doc-toolbar"><h2 className="ovl-doc-heading">Uploaded Documents</h2>{addBtn}</div><div className="ovl-doc-groups">{renderGroup("Document Types", typedDocuments)}{renderGroup("Other Documents", otherDocuments)}</div></> : <div className="ovl-doc-empty"><Icon name="folder_open" size={30} color="var(--fg-tertiary)" /><h3>No documents added yet.</h3><p>Add this vehicle's documents to track due dates and reminders.</p>{addBtn}</div>}{modal && <VehicleDocumentModal initial={modal} tier={tier} onClose={() => setModal(null)} onSave={saveDocument} onUpgrade={() => onToast("Upgrade options would open here.")} />}{preview && <VehicleFilePreview file={preview} onClose={() => setPreview(null)} />}{deleteTarget && <HacModal title="Delete document?" onClose={() => setDeleteTarget(null)} footer={<><button className="hac-modal-cancel" type="button" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="hac-modal-save ovl-delete-action" type="button" onClick={removeDocument}>Delete document</button></>}><p className="ovl-delete-copy">{deleteTarget.type} and its current files will be removed from this vehicle. Historical records are retained in the prototype history model.</p></HacModal>}</section>;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const scenarioKey = t.scenario || "lite-active";
  const scenario = D.scenarios[scenarioKey];
  const reminderTier = scenarioKey === "free" ? "free" : scenarioKey === "premium" ? "premium" : scenarioKey === "enterprise" ? "enterprise" : "lite";
  const tweakVeh001CheckIn = t.veh001ActiveCheckIn ?? true;
  const [vehicles, setVehicles] = useState(() => deriveVehicles(scenarioKey, { veh001ActiveCheckIn: tweakVeh001CheckIn }));
  const [listTab, setListTab] = useState("list");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("vehicle");
  const [dueDateType, setDueDateType] = useState("all");
  const [dueRange, setDueRange] = useState("all");
  const [managedOnly, setManagedOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingDueDateType, setPendingDueDateType] = useState("all");
  const [pendingDueRange, setPendingDueRange] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [mobileDriversVehicle, setMobileDriversVehicle] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [mobileMenuId, setMobileMenuId] = useState(null);
  const [mode, setMode] = useState("list");
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editTab, setEditTab] = useState("details");
  const [detailsEditing, setDetailsEditing] = useState(false);
  const [form, setForm] = useState(() => makeEmptyForm());
  const [driverPickerOpen, setDriverPickerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    setVehicles(deriveVehicles(scenarioKey, { veh001ActiveCheckIn: tweakVeh001CheckIn }));
    setExpandedId(null);
    setMenuId(null);
    setMobileMenuId(null);
    setPage(1);
  }, [scenarioKey, tweakVeh001CheckIn]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreate() {
    setEditingVehicle(null);
    setForm(makeEmptyForm());
    setMode("create");
  }

  function openEdit(vehicle, options = {}) {
    openView(vehicle, options);
    if (options.tab !== "documents") setDetailsEditing(true);
  }

  function openView(vehicle, options = {}) {
    setEditingVehicle(vehicle);
    setForm(makeFormFromVehicle(vehicle));
    setEditTab(options.tab === "documents" ? "reminders" : "details");
    setDetailsEditing(false);
    setMode("view");
  }

  function openDueDateView(vehicle, doc) {
    openView(vehicle, { tab: "documents", documentId: doc.id });
  }

  function closeForm() {
    setMode("list");
    setEditingVehicle(null);
    setDetailsEditing(false);
  }
  function cancelDetailsEdit() {
    const base = currentEditingVehicle || editingVehicle;
    if (base) setForm(makeFormFromVehicle(base));
    setDetailsEditing(false);
  }

  function pushToast(tone, message) {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3400);
  }

  const managedCount = useMemo(() => vehicles.filter((vehicle) => vehicle.managed).length, [vehicles]);
  const summary = scenarioSummary(scenarioKey, managedCount);

  const filters = { query, scope, dueDateType: "all", startDate: "", endDate: "", managedOnly };
  const filtered = useMemo(() => applyFilters(vehicles, filters), [vehicles, query, scope, managedOnly]);
  const pageData = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page, perPage]);
  const hasClearableFilters = !!query || dueDateType !== "all" || dueRange !== "all";
  const dateFilterCount = (dueDateType !== "all" ? 1 : 0) + (dueRange !== "all" ? 1 : 0);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (page > totalPages) setPage(totalPages);
  }, [filtered.length, page, perPage]);

  function resetFilters() {
    setQuery("");
    setScope("vehicle");
    setDueDateType("all");
    setDueRange("all");
    setPendingDueDateType("all");
    setPendingDueRange("all");
    setPage(1);
  }

  function toggleFilterPanel() {
    if (!filterOpen) {
      setPendingDueDateType(dueDateType);
      setPendingDueRange(dueRange);
    }
    setFilterOpen((current) => !current);
  }

  function applyPendingFilters() {
    setDueDateType(pendingDueDateType);
    setDueRange(pendingDueRange);
    setPage(1);
    setFilterOpen(false);
  }

  function setManagedState(vehicleId, nextManaged, source) {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) return;
    if (vehicle.managed === nextManaged) return;

    if (!nextManaged) {
      if (vehicle.activeCheckIn) {
        pushToast("warn", "This vehicle is currently in use. The driver must check out before you can deactivate Managed status.");
        return;
      }
      setVehicles((current) => current.map((item) => item.id === vehicleId ? { ...item, managed: false } : item));
      setMenuId(null);
      pushToast("warn", source === "edit"
        ? "Managed status removed. Driver tab locked."
        : "Managed status removed. Driver tab locked and new driver check-ins will stay blocked.");
      return;
    }

    const count = vehicles.filter((item) => item.managed).length;
    if (scenario.limit === 0 || count >= scenario.limit) {
      pushToast("warn", "You've reached your plan limit of managed vehicles. Upgrade your plan to manage more.");
      return;
    }
    setVehicles((current) => current.map((item) => item.id === vehicleId ? { ...item, managed: true } : item));
    setMenuId(null);
    pushToast("ok", "Managed vehicle activated. Driver tab unlocked. Billing will reflect this change.");
  }

  const currentEditingVehicle = editingVehicle
    ? (vehicles.find((item) => item.id === editingVehicle.id) || editingVehicle)
    : null;

  const nextManagedCount = managedCount
    + (form.managed && !currentEditingVehicle?.managed ? 1 : 0)
    - (!form.managed && currentEditingVehicle?.managed ? 1 : 0);
  const overCap = form.managed && (scenario.limit === 0 || nextManagedCount > scenario.limit);

  function handleToggleManaged() {
    if (form.managed) {
      if (currentEditingVehicle?.activeCheckIn) {
        pushToast("warn", "This vehicle is currently in use. The driver must check out before you can deactivate Managed status.");
        return;
      }
      if (editingVehicle) {
        setVehicles((current) => current.map((item) =>
          item.id === editingVehicle.id ? { ...item, managed: false, accessibleToAll: false } : item
        ));
      }
      update("managed", false);
      return;
    }
    if (scenario.limit === 0 || managedCount >= scenario.limit) {
      pushToast("warn", "You've reached your plan limit of managed vehicles. Upgrade your plan to manage more.");
      return;
    }
    if (editingVehicle) {
      setVehicles((current) => current.map((item) =>
        item.id === editingVehicle.id ? { ...item, managed: true } : item
      ));
    }
    update("managed", true);
  }

  function toggleAccessibleToAll(vehicleId) {
    setVehicles((current) => current.map((item) => item.id === vehicleId ? { ...item, accessibleToAll: !item.accessibleToAll } : item));
  }

  function addDriversToVehicle(vehicleId, driversToAdd) {
    if (!driversToAdd.length) return;
    setVehicles((current) => current.map((item) => item.id === vehicleId ? { ...item, drivers: [...item.drivers, ...driversToAdd] } : item));
    setDriverPickerOpen(false);
    pushToast("ok", `${driversToAdd.length} driver${driversToAdd.length === 1 ? "" : "s"} added.`);
  }

  function removeDriverFromVehicle(vehicleId, driverId) {
    setVehicles((current) => current.map((item) => item.id === vehicleId ? { ...item, drivers: item.drivers.filter((driver) => driver.driverId !== driverId) } : item));
  }

  function updateVehicleForms(vehicleId, forms) {
    setVehicles((current) => current.map((item) => item.id === vehicleId ? { ...item, forms } : item));
  }

  function updateVehicleDocuments(vehicleId, documents) {
    setVehicles((current) => current.map((item) => {
      if (item.id !== vehicleId) return item;
      const next = { ...item, documents };
      DOC_FIELDS.forEach((field) => {
        const record = documents.find((doc) => doc.type === field.type);
        next[field.key] = record?.expireDate || null;
      });
      return next;
    }));
    setForm((current) => ({ ...current, documents }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (detailsEditing) {
      const current = vehicles.find((item) => item.id === editingVehicle.id);
      if (!current) return;
      if (!form.managed && current.managed && current.activeCheckIn) {
        pushToast("warn", "This vehicle is currently in use. The driver must check out before you can deactivate Managed status.");
        return;
      }
      if (form.managed && !current.managed && (scenario.limit === 0 || managedCount >= scenario.limit)) {
        pushToast("warn", "You've reached your plan limit of managed vehicles. Upgrade your plan to manage more.");
        return;
      }
      setVehicles((list) => list.map((item) => {
        if (item.id !== editingVehicle.id) return item;
        return {
          ...item,
          plate: form.plate,
          category: form.category,
          subCategory: form.subCategory,
          feature: form.feature,
          finishing: form.finishing,
          vendor: form.vendor,
          btm: Number(form.btm || 0),
          bdm: Number(form.bdm || 0),
          capacity: Number(form.capacity || 0),
          photo: form.photo,
          managed: form.managed,
          documents: form.documents || makeVehicleDocuments(current),
        };
      }));
      setDetailsEditing(false);
      pushToast("ok", form.managed
        ? "Vehicle updated. Managed status remains active and Driver tab is available."
        : "Vehicle updated. Driver tab remains locked until the vehicle is managed.");
      return;
    }

    if (form.managed && (scenario.limit === 0 || managedCount >= scenario.limit)) {
      pushToast("warn", "You've reached your plan limit of managed vehicles. Upgrade your plan to manage more.");
      return;
    }
    const created = {
      id: `veh-${Date.now()}`,
      plate: form.plate.toUpperCase(),
      category: form.category,
      subCategory: form.subCategory,
      feature: form.feature,
      finishing: form.finishing,
      vendor: form.vendor,
      btm: Number(form.btm || 0),
      bdm: Number(form.bdm || 0),
      capacity: Number(form.capacity || 0),
      photo: form.photo,
      managed: form.managed,
      roadTax: null,
      insurance: null,
      puspakom: null,
      permit: null,
      documents: makeVehicleDocuments({ id: `veh-${Date.now()}`, roadTax: null, insurance: null, puspakom: null, permit: null }),
      thumb: null,
      activeCheckIn: false,
      drivers: [],
    };
    setVehicles((current) => [created, ...current]);
    closeForm();
    pushToast("ok", form.managed
      ? "Vehicle created as Managed. Driver tab unlocked and billing will update."
      : "Vehicle created. Manage this vehicle later to unlock driver features.");
  }

  return (
    <div className="ovl-shell">
      <Rail />

      <main className="ovl-main">
        <div className="ovl-topbar">
          <OrgSwitcher orgs={D.orgs} initialId={D.org.id} />
          <div className="ovl-topbar-spacer" />
          <CloseControl />
        </div>

        <div className="ovl-content">
          {mode !== "list" ? (
            <>
              <VehiclePageHead mode={mode} vehicle={editingVehicle} onBack={closeForm} />
              {mode === "view" && (
                <div className="ml-tabs ovl-tabs-row">
                  {VEHICLE_EDIT_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={"ml-tab" + (editTab === tab.key ? " active" : "")}
                      onClick={() => { setEditTab(tab.key); setDetailsEditing(false); }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
              {mode === "create" || (editTab === "details" && detailsEditing) ? (
                <>
                  <VehicleFormSections
                    form={form}
                    update={update}
                    overCap={overCap}
                    nextManagedCount={nextManagedCount}
                    scope={scenario}
                    onSubmit={handleSubmit}
                    onToggleManaged={handleToggleManaged}
                  />
                  <VehicleFormEditBar
                    mode={mode === "create" ? "create" : "edit"}
                    onCancel={mode === "create" ? closeForm : cancelDetailsEdit}
                  />
                </>
              ) : editTab === "details" ? (
                <VehicleViewSections form={form} nextManagedCount={nextManagedCount} scope={scenario} onEdit={() => setDetailsEditing(true)} />
              ) : editTab === "reminders" && currentEditingVehicle ? (
                <VehicleRemindersTab
                  vehicle={currentEditingVehicle}
                  documents={form.documents || currentEditingVehicle.documents || []}
                  editable={mode !== "create"}
                  tier={reminderTier}
                  onChange={(documents) => updateVehicleDocuments(currentEditingVehicle.id, documents)}
                  onToast={(message) => pushToast("ok", message)}
                />
              ) : editTab === "forms" && !form.managed ? (
                <div className="ovl-driver-empty">
                  <Icon name="lock" size={34} />
                  <div className="ovl-driver-empty-title">Manage this vehicle</div>
                  <div className="ovl-driver-empty-sub">Enable managed vehicle to unlock check-in forms and safety checklists.</div>
                </div>
              ) : editTab === "forms" && currentEditingVehicle ? (
                <VehicleFormsTab
                  forms={makeVehicleForms(currentEditingVehicle)}
                  onChange={(forms) => updateVehicleForms(currentEditingVehicle.id, forms)}
                  onToast={(message) => pushToast("ok", message)}
                />
              ) : editTab === "drivers" && !form.managed ? (
                <div className="ovl-driver-empty">
                  <Icon name="lock" size={34} />
                  <div className="ovl-driver-empty-title">Manage this vehicle</div>
                  <div className="ovl-driver-empty-sub">Enable managed vehicle to unlock driver check-in, ICOP safety, and driver assignment.</div>
                </div>
              ) : editTab === "drivers" && currentEditingVehicle ? (
                <DriverListPanel
                  vehicle={currentEditingVehicle}
                  onToggleAccessibleToAll={() => toggleAccessibleToAll(currentEditingVehicle.id)}
                  onOpenPicker={() => setDriverPickerOpen(true)}
                  onRemoveDriver={(driverId) => removeDriverFromVehicle(currentEditingVehicle.id, driverId)}
                />
              ) : (
                <div className="hac-empty-state">
                  {VEHICLE_EDIT_TABS.find((tab) => tab.key === editTab)?.label} isn't built yet in this prototype.
                </div>
              )}
            </>
          ) : (
          <>
          <div className="ml-page-head ovl-pagehead">
            <div>
              <div className="ml-h1 ovl-title">Vehicles</div>
              <div className="ovl-subtitle">Manage vehicle records, compliance dates, and driver access.</div>
            </div>
            {listTab === "list" && <button className="hac-create-btn ovl-create-btn" type="button" onClick={openCreate}>
              <Icon name="add" size={16} color="#fff" /> Create Vehicle
            </button>}
          </div>

          <div className="ml-tabs ovl-tabs-row ovl-list-tabs" role="tablist">
            {VEHICLE_LIST_TABS.map((tab) => (
              <button key={tab.key} type="button" className={"ml-tab" + (listTab === tab.key ? " active" : "")} role="tab" aria-selected={listTab === tab.key} onClick={() => setListTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          {listTab === "due" ? (
            <VehicleDueDates
              vehicles={vehicles}
              query={query}
              scope={scope}
              setQuery={setQuery}
              setScope={setScope}
              dueDateType={dueDateType}
              setDueDateType={setDueDateType}
              dueRange={dueRange}
              setDueRange={setDueRange}
              filterOpen={filterOpen}
              toggleFilterPanel={toggleFilterPanel}
              pendingDueDateType={pendingDueDateType}
              setPendingDueDateType={setPendingDueDateType}
              pendingDueRange={pendingDueRange}
              setPendingDueRange={setPendingDueRange}
              applyPendingFilters={applyPendingFilters}
              resetFilters={resetFilters}
              dateFilterCount={dateFilterCount}
              hasClearableFilters={hasClearableFilters}
              onView={openDueDateView}
              onDelete={() => pushToast("warn", "Delete is shown for parity only. Open the vehicle Documents tab to delete this document with confirmation.")}
              onDocumentsChange={updateVehicleDocuments}
              onToast={(message) => pushToast("ok", message)}
              tier={reminderTier}
            />
          ) : (
          <>
          <section className="ovl-toolbar">
            <div className="hac-toolbar">
              <div className="hac-toolbar-left ovl-toolbar-left">
                <div className="hac-search-group scoped ovl-search-group">
                  <SelectMenu
                    className="hac-search-scope"
                    value={scope}
                    options={D.searchScopes}
                    onChange={(next) => { setScope(next); setPage(1); }}
                    ariaLabel="Search by"
                    style={{ width: scope === "vehicle" ? "116px" : scope === "driver" ? "108px" : "110px" }}
                  />
                  <div className="hac-search-bar">
                    <Icon name="search" size={17} color="var(--fg-tertiary)" />
                    <input
                      className="hac-search-input"
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                      placeholder={`Search by ${scope}`}
                    />
                    {query && (
                      <button className="hac-search-clear" type="button" onClick={() => setQuery("")}>
                        <Icon name="close" size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="ovl-toolbar-right">
                <label className={`ovl-managed-filter${managedOnly ? " active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={managedOnly}
                    onChange={() => { setManagedOnly((current) => !current); setPage(1); }}
                  />
                  <span className="ovl-managed-filter-text">Managed Vehicles only</span>
                  <span className="ovl-managed-count">{Number.isFinite(scenario.limit) ? `${managedCount} of ${scenario.limit} slot${scenario.limit === 1 ? "" : "s"} used` : `${managedCount} managed`}</span>
                </label>
              </div>

              {query && (
                <button className="ovl-clear" type="button" onClick={resetFilters}>
                  <Icon name="ink_eraser" size={15} /> Clear filters
                </button>
              )}
            </div>
          </section>

          <div className="hac-count">{filtered.length} Vehicle{filtered.length !== 1 ? "s" : ""}</div>

          <section className="ovl-table-section">
            <div className="ml-table-wrap ovl-table-wrap">
              <table className="ml-table ovl-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>No.</th>
                    <th>Vehicle</th>
                    <th>Managed</th>
                    <th>Vehicle Category</th>
                    <th>Vendor</th>
                    <th>Weight (BTM) kg</th>
                    <th>Total Weight (BDM) kg</th>
                    <th>Load Capacity (kg)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!filtered.length && (
                    <tr>
                      <td colSpan="10">
                        <div className="ovl-empty-table">No vehicles match the current filters.</div>
                      </td>
                    </tr>
                  )}
                  {pageData.map((vehicle, index) => {
                    const expanded = expandedId === vehicle.id;
                    return (
                      <React.Fragment key={vehicle.id}>
                        <tr className={`ovl-row${expanded ? " ml-row-open" : ""}`} onClick={() => setExpandedId(expanded ? null : vehicle.id)} aria-expanded={expanded}>
                          <td><Icon name={expanded ? "expand_more" : "chevron_right"} size={18} color="#999AA5" /></td>
                          <td className="ovl-index">{(page - 1) * perPage + index + 1}</td>
                          <td>
                            <div className="ovl-vehicle-cell">
                              <VehicleThumb inUse={vehicle.activeCheckIn} />
                              <div className="ovl-vehicle-main">
                                <div className="ml-cell-main ovl-vehicle-plate">{vehicle.plate}</div>
                              </div>
                            </div>
                          </td>
                          <td><ManagedIcon managed={vehicle.managed} /></td>
                          <td>{vehicle.category}</td>
                          <td>{vehicle.vendor}</td>
                          <td className="ovl-weight">{fmtNumber(vehicle.btm)}</td>
                          <td className="ovl-weight">{fmtNumber(vehicle.bdm)}</td>
                          <td className="ovl-weight">{fmtNumber(vehicle.capacity)}</td>
                          <td onClick={(event) => event.stopPropagation()}>
                            <VehicleRowMenu
                              open={menuId === vehicle.id}
                              onToggle={(next) => setMenuId(next ? vehicle.id : null)}
                              onView={() => { openView(vehicle); setMenuId(null); }}
                              onEdit={() => { openEdit(vehicle); setMenuId(null); }}
                              onDelete={() => { setMenuId(null); pushToast("warn", "Delete is shown for parity only. No prototype deletion was performed."); }}
                              showDelete={false}
                            />
                          </td>
                        </tr>
                        {expanded && (
                          <tr>
                            <td className="ovl-expanded-cell" colSpan="10">
                              <ExpandableVehicleDriversRow vehicle={vehicle} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="ovl-mobile-list">
              {pageData.map((vehicle) => {
                return (
                  <MobileListCard key={vehicle.id} className="ovl-vehicle-mobile-card"
                    leading={<VehicleThumb inUse={vehicle.activeCheckIn} />}
                    title={vehicle.plate}
                    subtitle={vehicle.category}
                    status={<ManagedIcon managed={vehicle.managed} label />}
                    menu={<VehicleRowMenu open={mobileMenuId === vehicle.id} onToggle={(next) => setMobileMenuId(next ? vehicle.id : null)} onView={() => { openView(vehicle); setMobileMenuId(null); }} onEdit={() => { openEdit(vehicle); setMobileMenuId(null); }} onDelete={() => { setMobileMenuId(null); pushToast("warn", "Delete is shown for parity only. No prototype deletion was performed."); }} showDelete={false} />}
                    meta={<span className={vehicle.vendor ? "" : "ovl-vendor-empty"}>{vehicle.vendor || "No vendor"}</span>}
                    footer={<button className="ovl-mobile-expand" type="button" onClick={() => setMobileDriversVehicle(vehicle)}><span>View {vehicle.drivers.length} assigned driver{vehicle.drivers.length === 1 ? "" : "s"}</span><Icon name="chevron_right" size={16} /></button>}
                  >
                    <div className="ovl-vehicle-weights">
                      <div><span>BTM</span><strong>{vehicle.btm.toLocaleString()} kg</strong></div>
                      <div><span>BDM</span><strong>{vehicle.bdm.toLocaleString()} kg</strong></div>
                      <div><span>Capacity</span><strong>{vehicle.capacity.toLocaleString()} kg</strong></div>
                    </div>
                  </MobileListCard>
                );
              })}
              {!filtered.length && <div className="ovl-mobile-card"><div className="ovl-empty-table">No vehicles match the current filters.</div></div>}
            </div>
          </section>

          <Pager page={page} perPage={perPage} total={filtered.length} onPage={setPage} onPerPage={setPerPage} />
          </>
          )}
          </>
          )}
        </div>
      </main>

      {mobileDriversVehicle && <AssignedDriversModal vehicle={mobileDriversVehicle} onClose={() => setMobileDriversVehicle(null)} />}

      <TweaksPanel>
        <TweakSection title="Vehicle states">
          <TweakSelect
            label="Scenario"
            value={scenarioKey}
            options={Object.keys(SCENARIO_LABEL).map((key) => ({ value: key, label: SCENARIO_LABEL[key] }))}
            onChange={(value) => setTweak("scenario", value)}
          />
          <TweakToggle
            label="Veh-001 has active check-in"
            value={t.veh001ActiveCheckIn ?? true}
            onChange={(v) => setTweak("veh001ActiveCheckIn", v)}
          />
        </TweakSection>
      </TweaksPanel>

      {driverPickerOpen && currentEditingVehicle && (
        <DriverPickerModal
          vehicle={currentEditingVehicle}
          onClose={() => setDriverPickerOpen(false)}
          onAdd={(driversToAdd) => addDriversToVehicle(currentEditingVehicle.id, driversToAdd)}
        />
      )}

      <div className="ovl-toast-stack">
        <div className="ovl-toast-col">
          {toasts.map((toast) => (
            <div key={toast.id} className={`ovl-toast${toast.tone === "warn" ? " warn" : toast.tone === "err" ? " err" : ""}`}>
              <Icon name={toast.tone === "err" ? "error" : toast.tone === "warn" ? "warning" : "task_alt"} size={18} color={toast.tone === "warn" ? "#8A5A00" : "#fff"} />
              <div className="ovl-toast-msg">{toast.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

}
