// vehicle-detail.jsx — Vehicle domain layer shared by the Org and Host portals.
//
// Everything about a vehicle that both portals render identically lives here:
// the list/due-date cells, the expandable driver row, the whole detail page
// (view, edit, create, Forms, Documents, Drivers), and the document/reminder
// modals. Flows keep only their own shell, data source, and page wiring.
//
// Exposed as window.VehicleDetail — see the export block at the bottom.
// Anything flow-specific is a prop, never a lookup: the due-dates table takes
// its `searchScopes`/`dueDateTypes`, and the QR modal takes its image `src`.
{

const { useEffect, useMemo, useRef, useState } = React;
const { Icon, SelectMenu, Pager, HacModal, HacFileUpload, StatusBadge, HoverTip,
  MobileListCard, ReminderSummary, EmptyState } = window.SharedShell;

const REMINDER_LIMITS = { free: 1, lite: 3, premium: Infinity };

const DOC_FIELDS = [
  { key: "roadTax", type: "Road Tax", label: "Road Tax", startRequired: true, expiryRequired: true, defaultReminder: 30 },
  { key: "insurance", type: "Insurance", label: "Insurance", startRequired: true, expiryRequired: true, defaultReminder: 30 },
  // Puspakom is the one type that needs an inspection slot booked before renewal,
  // so it carries an extra optional appointment date (flat key on the vehicle).
  { key: "puspakom", type: "Puspakom Service", label: "Puspakom Service", startRequired: true, expiryRequired: true, defaultReminder: 60, appointment: true, appointmentKey: "puspakomAppointment" },
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
// "documents" is the legacy alias the due-dates table passes for the Documents tab.
function resolveEditTab(tab) {
  if (tab === "documents") return "reminders";
  return VEHICLE_EDIT_TABS.some((item) => item.key === tab) ? tab : "details";
}

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

function VehicleThumb({ inUse = false, category = "" }) {
  const label = inUse ? "In-use" : "Not in-use";
  const cat = String(category).toLowerCase();
  
  let iconName = "local_shipping"; // Default for Lorry/Truck/Prime Mover
  if (cat.includes("van") || cat.includes("mpv")) iconName = "airport_shuttle";
  else if (cat.includes("bus")) iconName = "directions_bus";
  else if (cat.includes("sedan") || cat.includes("car")) iconName = "directions_car";

  return (
    <div className="ovl-thumb" title={label} aria-label={label}>
      <div className="ovl-thumb-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "var(--fg-secondary)" }}>
        <Icon name={iconName} size={22} fill={1} />
      </div>
      <span className={`ovl-use-dot${inUse ? " in-use" : ""}`} aria-hidden="true" />
    </div>
  );
}

function VehicleStatusBadge({ vehicle }) {
  if (vehicle.status === "Inactive") {
    return <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: "4px", background: "#f4f5f5", color: "var(--fg-secondary)", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap", border: 0 }}>Inactive</span>;
  }
  if (vehicle.activeCheckIn) {
    return <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: "4px", background: "#effaf4", color: "#397051", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap", border: 0 }}>In use</span>;
  }
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: "4px", background: "#f4f5f5", color: "var(--fg-secondary)", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap", border: 0 }}>Unused</span>;
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

function vehicleDocumentTitle(doc) {
  return doc.type === "Others" && doc.title ? doc.title : doc.type;
}

function flattenVehicleDueDates(vehicles) {
  return vehicles.flatMap((vehicle) => (vehicle.documents || makeVehicleDocuments(vehicle)).filter((doc) => doc.expireDate).map((doc) => ({ vehicle, doc }))).sort((a, b) => new Date(`${a.doc.expireDate}T00:00:00`) - new Date(`${b.doc.expireDate}T00:00:00`));
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
    ...(field.appointment ? { appointmentDate: vehicle[field.appointmentKey] || "" } : {}),
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
    orgId: "",
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
    orgId: vehicle.org?.id || "",
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

function slotsMeta(scope, nextManagedCount, managed) {
  if (!Number.isFinite(scope.limit)) return { label: "Unlimited managed vehicle slots", tone: "" };
  if (scope.limit === 0) return { label: "No managed vehicle slots on this plan", tone: "danger" };
  const remaining = Math.max(scope.limit - nextManagedCount, 0);
  return {
    label: `${remaining} of ${scope.limit} slot${scope.limit === 1 ? "" : "s"} remaining`,
    tone: remaining === 0 ? "danger" : managed ? "active" : "",
  };
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
  // Flow-supplied: the org portal scopes by vehicle/driver/vendor, the host
  // adds organisation. Extra columns/filters ride along the same way.
  searchScopes,
  dueDateTypes,
  extraFilterFields = null,
  extraHeadCells = null,
  renderExtraCells = null,
  rowFilter = null,
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
      if (scope === "org" && !String(vehicle.org?.name || "").toLowerCase().includes(q)) return false;
    }
    const field = DOC_FIELDS.find((item) => item.type === doc.type);
    if (dueDateType !== "all" && field?.key !== dueDateType) return false;
    if (dueRange !== "all" && dueRangeKey(daysUntil(doc.expireDate)) !== dueRange) return false;
    if (rowFilter && !rowFilter(vehicle, doc)) return false;
    return true;
  }), [vehicles, query, scope, dueDateType, dueRange, rowFilter]);
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
    const toast = appointmentToast(editTarget.doc, doc);
    setEditTarget(null);
    onToast(toast || "Document changes saved.");
  }

  return (
    <>
      <section className="ovl-toolbar">
        <div className="hac-toolbar">
          <div className="hac-toolbar-left ovl-toolbar-left">
            <div className="hac-search-group scoped ovl-search-group">
              <SelectMenu className="hac-search-scope" value={scope} options={searchScopes} onChange={(next) => { setScope(next); setPage(1); }} ariaLabel="Search by" style={{ width: scope === "vehicle" ? "116px" : scope === "driver" ? "108px" : scope === "org" ? "128px" : "110px" }} />
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
        {filterOpen && <div className="hac-filter-panel ovl-filter-panel inline"><div className="hac-filter-grid ovl-filter-grid">{extraFilterFields}<div className="hac-filter-field"><label>Due Date Type</label><div className="hac-select-wrap"><SelectMenu className="hac-select" value={pendingDueDateType} options={dueDateTypes} onChange={setPendingDueDateType} ariaLabel="Due date type" /></div></div><div className="hac-filter-field"><label>Expired by</label><div className="hac-select-wrap"><SelectMenu className="hac-select" value={pendingDueRange} options={DUE_RANGE_OPTIONS} onChange={setPendingDueRange} ariaLabel="Expired by" /></div></div></div><div className="hac-filter-actions"><button className="hac-filter-apply" type="button" onClick={() => { applyPendingFilters(); setPage(1); }}>Apply Filters</button><button className="hac-filter-reset" type="button" onClick={() => { resetFilters(); setPage(1); }}>Reset All</button></div></div>}
      </section>
      <div className="hac-count">{rows.length} due date{rows.length === 1 ? "" : "s"}</div>
      <section className="ovl-table-section">
        <div className="ml-table-wrap ovl-table-wrap">
          <table className="ml-table ovl-table ovl-due-table">
            <thead><tr><th>No.</th><th>Vehicle</th>{extraHeadCells}<th>Vehicle Category</th><th>Vendor</th><th>Type</th><th>Issued Date</th><th>Expiry Date</th><th>Reminders</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {!rows.length && <tr><td colSpan={extraHeadCells ? 10 : 9}><div className="ovl-empty-table">No vehicle due dates match the current filters.</div></td></tr>}
              {pageData.map(({ vehicle, doc }, index) => {
                const rowId = `${vehicle.id}-${doc.id}`;
                return (
                  <tr key={rowId}>
                    <td className="ovl-index">{(page - 1) * perPage + index + 1}</td>
                    <td><div className="ovl-vehicle-cell"><VehicleThumb inUse={vehicle.activeCheckIn} category={vehicle.category} /><div className="ovl-vehicle-main"><div className="ml-cell-main ovl-vehicle-plate">{vehicle.plate}</div></div></div></td>
                    {renderExtraCells && renderExtraCells(vehicle)}
                    <td>{vehicle.category}</td>
                    <td>{vehicle.vendor}</td>
                    <td><div className="ovl-due-type-cell"><span>{doc.type}</span>{doc.type === "Others" && doc.title && <span>{doc.title}</span>}{docAppointmentField(doc) && <AppointmentBadge doc={doc} tip />}</div></td>
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
                leading={<VehicleThumb inUse={vehicle.activeCheckIn} category={vehicle.category} />}
                title={vehicle.plate}
                subtitle={<span className="ml-plain-subtitle">{vehicle.category} · {vehicleDocumentTitle(doc)}</span>}
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

function VehicleRowMenu({ open, onToggle, onView, onEdit, onDelete, showDelete = true, isInactive = false, onReactivate }) {
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
          {showDelete && !isInactive && <button className="hac-drop-item danger" type="button" onClick={onDelete}>
            <Icon name="delete" size={15} /> Delete
          </button>}
          {showDelete && isInactive && onReactivate && <button className="hac-drop-item" type="button" onClick={onReactivate}>
            <Icon name="history" size={15} /> Reactivate
          </button>}
        </div>,
        document.body
      )}
    </div>
  );
}

function EditDriverButton({ vehicle, onEditDrivers, editDriverHref }) {
  const label = <><Icon name="edit" size={15} /> Edit driver</>;
  // Org renders this in-page; host passes an href into the org flow.
  if (onEditDrivers) {
    return <button className="ml-btn-outline ovl-expanded-edit" type="button"
      onClick={(event) => { event.stopPropagation(); onEditDrivers(vehicle); }}>{label}</button>;
  }
  if (!editDriverHref) return null;
  return <a className="ml-btn-outline ovl-expanded-edit" href={editDriverHref(vehicle)}
    onClick={(event) => event.stopPropagation()}>{label}</a>;
}

function ExpandableVehicleDriversRow({ vehicle, onEditDrivers, editDriverHref }) {
  const driverCount = vehicle.drivers.length;
  const driverLabel = driverCount === 1 ? "1 driver assigned" : `${driverCount} drivers assigned`;
  return (
    <div className="ovl-expanded-wrap">
      <div className="ovl-expanded-head">
        <div className="ovl-expanded-title">
          {vehicle.accessibleToAll ? "All drivers" : driverCount ? driverLabel : "No drivers assigned"}
        </div>
        <EditDriverButton vehicle={vehicle} onEditDrivers={onEditDrivers} editDriverHref={editDriverHref} />
      </div>
      {vehicle.accessibleToAll ? (
        <EmptyState
          className="ml-icon-gradient"
          icon="how_to_reg"
          title="All drivers can access this vehicle"
          sub="Uncheck 'Accessible to all drivers' on the vehicle detail page to reassign drivers"
        />
      ) : driverCount ? (
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
        <EmptyState
          icon="person_off"
          title="No drivers have access"
          sub="Assign a driver to this vehicle from the vehicle detail page."
        />
      )}
    </div>
  );
}

function AssignedDriversModal({ vehicle, onClose, onEditDrivers, editDriverHref }) {
  const [query, setQuery] = useState("");
  const drivers = vehicle.drivers.filter((driver) => `${driver.name} ${driver.driverId}`.toLowerCase().includes(query.trim().toLowerCase()));
  const footer = <>
    <button className="hac-modal-cancel" type="button" onClick={onClose}>Close</button>
    <EditDriverButton vehicle={vehicle} onEditDrivers={onEditDrivers} editDriverHref={editDriverHref} />
  </>;
  return <HacModal title="Assigned drivers" onClose={onClose} footer={footer}>
    {vehicle.accessibleToAll ? (
      <EmptyState
        className="ml-icon-gradient"
        icon="how_to_reg"
        title="All drivers can access this vehicle"
        sub="Uncheck 'Accessible to all drivers' on the vehicle detail page to reassign drivers"
      />
    ) : <>
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
    </>}
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
          <EmptyState
            className="ml-icon-gradient"
            icon="how_to_reg"
            title="All drivers can access this vehicle"
            sub="Please uncheck the 'Accessible to all drivers' box to reassign drivers"
          />
        ) : (
          <EmptyState
            icon="person_off"
            title="No drivers have access"
            sub="Please search driver to assign or tick the 'Accessible to all drivers' box"
          />
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

function VehiclePageHead({ mode, vehicle, onBack, editing, onShowQr }) {
  const isCreate = mode === "create";
  const title = isCreate ? "Create vehicle" : (vehicle?.plate || "Vehicle");
  const crumbLabel = isCreate ? "Create" : editing ? "Edit details" : "View details";
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
      {onShowQr && (
        <button className="ml-btn-outline ovl-qr-btn" type="button" onClick={onShowQr}>
          <Icon name="qr_code_2" size={16} /> QR Code
        </button>
      )}
    </div>
  );
}

// `src` is one sample code reused for every vehicle — it encodes a page URL, not
// the vehicle. Real per-vehicle codes need a generator this prototype doesn't
// carry. Each flow passes the path to its own copy of the asset.
function VehicleQrModal({ vehicle, onClose, src = "vehicle-qr-sample.svg" }) {
  const plate = vehicle?.plate || "vehicle";
  return (
    <HacModal
      title="QR Code"
      onClose={onClose}
      className="ovl-qr-modal"
      footer={<a className="hac-save-btn ovl-qr-download" href={src} download={`${plate}-qr.svg`}>Download</a>}
    >
      <div className="ovl-qr-frame">
        <img className="ovl-qr-img" src={src} alt={`QR code for ${plate}`} />
        <span className="ovl-qr-mark"><img src="../fleet-card/img_logo_white.svg" alt="" /></span>
      </div>
    </HacModal>
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

// `orgOptions` is host-only. The org portal works inside a single organisation,
// so it passes nothing and the field never renders.
function VehicleViewSections({ form, nextManagedCount, scope, onEdit, orgOptions = null }) {
  const orgName = orgOptions?.find((option) => String(option.value) === String(form.orgId))?.label;
  const slots = slotsMeta(scope, nextManagedCount, form.managed);

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
          {orgOptions && <ViewField label="Organization" value={orgName} />}
          <ViewField label="Vehicle no." value={form.plate} />
          <ViewField label="Vehicle category" value={form.category} />
          <ViewField label="Sub category" value={form.subCategory} />
          <ViewField label="Vendor name" value={form.vendor} />
          {scope.limit > 0 && (
            <div className="ovl-managed-row" style={{ margin: 0, padding: "10px 14px" }}>
              <ManagedIcon managed={form.managed} />
              <div className="ovl-managed-card-text">
                <div className="ovl-switch-title-row">
                  <span className="ovl-switch-title">{form.managed ? "Managed" : "Not managed"}</span>
                  <span className={`ovl-managed-count${slots.tone ? ` ${slots.tone}` : ""}`}>{slots.label}</span>
                </div>
                <div className="ovl-switch-sub">Enables driver check-in/out, safety checklist, and reminders.</div>
              </div>
            </div>
          )}
        </div>
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

function VehicleFormSections({ form, update, overCap, atLimit, nextManagedCount, scope, onSubmit, onToggleManaged, orgOptions = null }) {
  const subCategoryOptions = VEHICLE_SUB_CATEGORIES_BY_CATEGORY[form.category] || [];
  const slots = slotsMeta(scope, nextManagedCount, form.managed);
  // Blocked = turning it on would exceed the plan. Still clickable: the toast is
  // the only explanation the user gets, so a hard `disabled` would say nothing.
  const blocked = !form.managed && atLimit;

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
          {orgOptions && (
            <div className="hac-fg">
              <label className="hac-label">Organization <span className="ovl-req">*</span></label>
              <div className="hac-search-group scoped" style={{ width: "100%" }}>
                <div className="hac-search-scope" style={{ cursor: "default", padding: "0 14px", display: "flex", alignItems: "center" }}>Org</div>
                <SelectMenu
                  className="hac-search-bar"
                  value={form.orgId}
                  options={orgOptions}
                  onChange={(value) => update("orgId", value)}
                  ariaLabel="Organization"
                  searchable
                  searchPlaceholder="Search organisation"
                  prefix={<Icon name="search" size={18} color="var(--fg-tertiary)" />}
                />
              </div>
            </div>
          )}
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
          {scope.limit > 0 && (
            <div className="hac-fg">
              <div className="ovl-managed-row" style={{ margin: 0, padding: "10px 14px" }}>
                <button
                  type="button"
                  className={`ovl-switch-btn${form.managed ? " on" : ""}${blocked ? " blocked" : ""}`}
                  onClick={onToggleManaged}
                  aria-pressed={form.managed}
                  aria-disabled={blocked || undefined}
                />
                <div className="ovl-managed-card-text">
                  <div className="ovl-switch-title-row">
                    <span className="ovl-switch-title">Managed vehicle</span>
                    <span className={`ovl-managed-count${slots.tone ? ` ${slots.tone}` : ""}`}>{slots.label}</span>
                  </div>
                  <div className="ovl-switch-sub">Enables driver check-in/out, safety checklist, and reminders.</div>
                </div>
              </div>
              {(overCap || blocked) && (
                <div className="ovl-switch-sub ovl-managed-warn">
                  You've reached your plan limit of managed vehicles. Upgrade your plan to manage more.
                </div>
              )}
            </div>
          )}
        </div>
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

// Returns the DOC_FIELDS entry when this document type tracks an appointment.
function docAppointmentField(doc) {
  const field = DOC_FIELDS.find((item) => item.type === doc.type);
  return field?.appointment ? field : null;
}

// Overrides the generic save toast, but only when this save is what booked the
// slot — re-saving an unchanged appointment keeps the normal message.
function appointmentToast(previous, next) {
  if (!docAppointmentField(next) || !next.appointmentDate) return null;
  return previous?.appointmentDate === next.appointmentDate ? null : "Appointment date is set.";
}

function AppointmentBadge({ doc, tip = false }) {
  const badge = <StatusBadge status={doc.appointmentDate ? "appt_set" : "appt_unset"} />;
  if (!tip) return badge;
  return <HoverTip label={doc.appointmentDate ? `Appointment on ${fmtDate(doc.appointmentDate)}` : "No appointment date set"}>{badge}</HoverTip>;
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
        <div className="ovl-doc-field"><label>Document type *</label><SelectMenu className="ovl-doc-select" value={form.type} options={DOC_FIELDS.map((field) => ({ value: field.type, label: field.type }))} onChange={(value) => { const next = DOC_FIELDS.find((field) => field.type === value) || DOC_FIELDS[0]; setForm((current) => ({ ...current, type: value, reminders: [next.defaultReminder], appointmentDate: next.appointment ? (current.appointmentDate || "") : "" })); }} ariaLabel="Document type" /></div>
        {isOther && <div className="ovl-doc-field"><label>Title *</label><input value={form.title || ""} onChange={(e) => update("title", e.target.value)} placeholder="Reminder title" />{errors.title && <span className="ovl-doc-error">{errors.title}</span>}</div>}
        <div className="ovl-doc-field"><label>Issued date{rule.startRequired ? " *" : ""}</label><input type="date" value={form.startDate || ""} onChange={(e) => update("startDate", e.target.value)} />{errors.startDate && <span className="ovl-doc-error">{errors.startDate}</span>}</div>
        <div className="ovl-doc-field"><label>Expiry date{rule.expiryRequired ? " *" : ""}</label><input type="date" value={form.expireDate || ""} onChange={(e) => update("expireDate", e.target.value)} />{errors.expireDate && <span className="ovl-doc-error">{errors.expireDate}</span>}</div>
        {rule.appointment && <div className="ovl-doc-field"><label>Appointment date</label><input type="date" value={form.appointmentDate || ""} onChange={(e) => update("appointmentDate", e.target.value)} /></div>}
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
  const hasAppointment = Boolean(docAppointmentField(doc));
  return <article className="ovl-doc-row"><div className="ovl-doc-top"><div className="ovl-doc-type-wrap"><div className="ovl-doc-type">{isOther ? (doc.title || "Others") : doc.type}</div></div>{hasAppointment && <AppointmentBadge doc={doc} />}<div className="ovl-doc-top-spacer" />{doc.files?.[0]?.uploadedDate && <div className="ovl-doc-upload-info">Updated {doc.files[0].uploadedDate}</div>}{editable && <VehicleDocumentMenu onEdit={onEdit} onDelete={onDelete} />}</div><div className={`ovl-doc-meta-row${hasAppointment ? " has-appointment" : ""}`}><div className="ovl-doc-meta"><span>Issued date</span><span>{fmtDate(doc.startDate)}</span></div><div className="ovl-doc-meta"><span>Expiry date</span><span>{fmtDate(doc.expireDate)}</span></div>{hasAppointment && <div className="ovl-doc-meta"><span>Appointment date</span><span>{doc.appointmentDate ? fmtDate(doc.appointmentDate) : "Not set"}</span></div>}<div className="ovl-doc-meta"><span>Time left</span><span className={`ovl-time-left ${expiryTone(doc.expireDate)}`}>{expiryMeta(doc.expireDate)}</span></div><div className="ovl-doc-meta"><span>Reminders</span><span>{doc.expireDate ? <ReminderSummary reminders={visibleReminders} /> : "—"}</span></div></div>{isOther && <VehicleDocumentDescription description={doc.description} />}<VehicleDocumentFiles files={doc.files || []} onPreview={onPreview} />{history.length ? <><button className="ovl-doc-history" type="button" onClick={openHistory}>View history<Icon name="chevron_right" size={17} /></button>{historyModal && <HacModal title={`Document History — ${isOther ? (doc.title || "Others") : doc.type}`} onClose={() => setHistoryModal(false)} className="ovl-history-modal"><div className="ovl-history-modal-body">{history.slice(0, historyLimit).map((record) => <VehicleHistoryRow key={record.id} record={{ ...record, type: doc.type }} />)}{historyLimit < history.length && <button className="ml-btn-soft ovl-history-load" type="button" onClick={() => setHistoryLimit((value) => value + 5)}>Load more</button>}</div></HacModal>}</> : <div className="ovl-doc-no-history">No historical data</div>}</article>;
}

function VehicleRemindersTab({ vehicle, documents, editable, tier, onChange, onToast }) {
  const [modal, setModal] = useState(null);
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const typedDocuments = documents.filter((doc) => doc.type !== "Others");
  const otherDocuments = documents.filter((doc) => doc.type === "Others");
  function saveDocument(doc) { const previous = documents.find((item) => item.id === doc.id); const exists = Boolean(previous); const now = new Date(); const finalDoc = exists ? doc : { ...doc, uploadedDate: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), uploadedBy: vehicle.plate }; onChange(exists ? documents.map((item) => item.id === doc.id ? finalDoc : item) : [finalDoc, ...documents]); setModal(null); onToast(appointmentToast(previous, doc) || (exists ? `${doc.type} changes saved.` : `${doc.type} added.`)); }
  function removeDocument() { if (!deleteTarget) return; onChange(documents.filter((item) => item.id !== deleteTarget.id)); onToast(`${deleteTarget.type} deleted.`); setDeleteTarget(null); }
  function newDocument() { const field = DOC_FIELDS[0]; return { id: null, type: field.type, startDate: "", expireDate: "", reminders: [field.defaultReminder, "", ""], files: [], history: [] }; }
  function renderGroup(title, items) { if (!items.length) return null; return <section className="ovl-doc-section" key={title}><div className="ovl-doc-section-head"><span className="ovl-doc-section-title">{title}</span></div><div className="ovl-doc-list">{items.map((doc) => <VehicleDocumentCard key={doc.id} doc={doc} editable={editable} tier={tier} onEdit={() => setModal(doc)} onDelete={() => setDeleteTarget(doc)} onPreview={setPreview} />)}</div></section>; }
  const addBtn = editable && <button className="ml-btn-soft ovl-doc-add" type="button" onClick={() => setModal(newDocument())}><Icon name="add" size={16} color="var(--green-600)" />Add<span className="ovl-doc-add-full"> document</span></button>;
  return <section className="ml-card ovl-documents-panel">{documents.length ? <><div className="ovl-doc-toolbar"><h2 className="ovl-doc-heading">Uploaded Documents</h2>{addBtn}</div><div className="ovl-doc-groups">{renderGroup("Document Types", typedDocuments)}{renderGroup("Other Documents", otherDocuments)}</div></> : <div className="ovl-doc-empty"><Icon name="folder_open" size={30} color="var(--fg-tertiary)" /><h3>No documents added yet.</h3><p>Add this vehicle's documents to track due dates and reminders.</p>{addBtn}</div>}{modal && <VehicleDocumentModal initial={modal} tier={tier} onClose={() => setModal(null)} onSave={saveDocument} onUpgrade={() => onToast("Upgrade options would open here.")} />}{preview && <VehicleFilePreview file={preview} onClose={() => setPreview(null)} />}{deleteTarget && <HacModal title="Delete document?" onClose={() => setDeleteTarget(null)} footer={<><button className="hac-modal-cancel" type="button" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="hac-modal-save ovl-delete-action" type="button" onClick={removeDocument}>Delete document</button></>}><p className="ovl-delete-copy">{deleteTarget.type} and its current files will be removed from this vehicle. Historical records are retained in the prototype history model.</p></HacModal>}</section>;
}
/* ─── Export to window ─────────────────────────────────────── */
window.VehicleDetail = {
  // constants
  DOC_FIELDS, VEHICLE_LIST_TABS, DUE_RANGE_OPTIONS, VEHICLE_CATEGORIES, VENDORS,
  VEHICLE_FEATURES, VEHICLE_FINISHES, VEHICLE_SUB_CATEGORIES_BY_CATEGORY,
  VEHICLE_EDIT_TABS, DRIVER_POOL, VEHICLE_FORMS, REMINDER_LIMITS,
  // helpers
  initials, fmtNumber, fmtDate, daysUntil, dueRangeKey, documentExpiryStatus,
  expiryTone, expiryMeta, documentTone, formatReminderList, reminderLimitForTier,
  remindersForTier, issuedDateForVehicleDocument, makeVehicleDocuments,
  makeVehicleForms, makeEmptyForm, makeFormFromVehicle, normalizeVehicle,
  vehicleDocumentTitle, flattenVehicleDueDates, vehicleDocumentStatus,
  docAppointmentField, AppointmentBadge,
  slotsMeta, resolveEditTab, fileCountLabel,
  // list-level components
  VehicleThumb, ManagedIcon, ExpiryCell, VehicleRowMenu, EditDriverButton,
  ExpandableVehicleDriversRow, AssignedDriversModal, VehicleDueDates, VehicleStatusBadge,
  // detail-page components
  VehiclePageHead, VehicleQrModal, VehicleFormEditBar, VehiclePhotoField,
  ViewField, VehicleViewSections, VehicleFormSections, VehicleFormsTab,
  DriverListPanel, DriverPickerModal, VehicleRemindersTab,
  // document internals (exported for completeness; flows rarely need these)
  VehicleDocumentModal, VehicleDocumentCard, VehicleFilePreview,
};

}
