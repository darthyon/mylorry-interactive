{

const { useEffect, useMemo, useRef, useState } = React;
const { Icon, OrgSwitcher: BaseOrgSwitcher, SelectMenu, Pager, HacModal, HacFileUpload } = window.SharedShell;
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
};

const DOC_FIELDS = [
  { key: "roadTax", type: "Road Tax", label: "Road Tax Expiry", startRequired: false, defaultReminder: 30 },
  { key: "insurance", type: "Insurance", label: "Insurance Expiry", startRequired: true, defaultReminder: 30 },
  { key: "puspakom", type: "Puspakom Service", label: "Puspakom Service", startRequired: true, defaultReminder: 60 },
  { key: "permit", type: "Truck Permit", label: "Truck Permit Expiry", startRequired: false, defaultReminder: 30 },
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

function VehicleThumb() {
  return (
    <div className="ovl-thumb" aria-hidden="true">
      <svg className="ovl-thumb-icon" viewBox="0 0 24 24" focusable="false">
        <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h9A1.5 1.5 0 0 1 15 6.5V8h2.4c.5 0 .98.22 1.3.6l2.1 2.52c.26.3.4.7.4 1.1V16a1 1 0 0 1-1 1h-1.05a2.5 2.5 0 0 1-4.9 0h-5.1a2.5 2.5 0 0 1-4.9 0H4a1 1 0 0 1-1-1V6.5Zm12 3.25V12h4.05l-1.48-1.78a1.25 1.25 0 0 0-.96-.47H15ZM6.7 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
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
  const now = new Date("2026-07-09T00:00:00");
  return Math.round((target - now) / 86400000);
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
  if (days == null) return "Missing";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Expires today";
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
  return values.length ? values.map((value) => `${value} days before expiry`).join(", ") : "—";
}

function remindersForTier(reminders = [], tier) {
  return tier === "free" ? [reminders[0]] : reminders;
}

function makeVehicleDocuments(vehicle) {
  if (Array.isArray(vehicle.documents)) return vehicle.documents;
  return DOC_FIELDS.map((field) => ({
    id: `${vehicle.id}-${field.key}`,
    type: field.type,
    startDate: "",
    expireDate: vehicle[field.key] || "",
    reminders: [field.defaultReminder, "", ""],
    files: [],
    history: [],
  }));
}

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

function ManagedIcon({ managed }) {
  if (!managed) return <span className="ovl-managed blank" aria-hidden="true" />;
  return (
    <span className="ovl-managed" title="Managed vehicle">
      <Icon name="check_circle" size={18} fill={1} color="var(--green-600)" />
    </span>
  );
}

function ExpiryCell({ iso }) {
  const tone = documentTone(iso);
  const status = documentStatus(iso);
  return (
    <div className={`ovl-expiry ${tone}`}>
      <span className="ovl-expiry-date">{fmtDate(iso)}</span>
      <span className={`ovl-expiry-status ${tone}`}>{status}</span>
      <span className="ovl-expiry-meta">{expiryMeta(iso)}</span>
    </div>
  );
}

function VehicleRowMenu({ open, onToggle, onView, onEdit, onDelete }) {
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
          <button className="hac-drop-item danger" type="button" onClick={onDelete}>
            <Icon name="delete" size={15} /> Delete
          </button>
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

function VehiclePageHead({ mode, vehicle, onBack, onEdit }) {
  const isCreate = mode === "create";
  const isView = mode === "view";
  const title = isCreate ? "Create vehicle" : isView ? (vehicle?.plate || "Vehicle") : `Edit ${vehicle?.plate || "vehicle"}`;
  const crumbLabel = isCreate ? "Create" : isView ? "View" : "Edit";
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
      {isView && (
        <button className="ml-btn-outline" type="button" onClick={onEdit}>
          <Icon name="edit" size={16} /> Edit vehicle
        </button>
      )}
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

function VehicleViewSections({ form, nextManagedCount, scope }) {
  const remainingSlots = Math.max(scope.limit - nextManagedCount, 0);
  const slotsLabel = scope.limit === 0
    ? "No managed vehicle slots on this plan"
    : `${remainingSlots} of ${scope.limit} slot${scope.limit === 1 ? "" : "s"} remaining`;

  return (
    <div className="ovl-form">
      <div className="ml-card ovl-form-card">
        <div className="hac-sec-header">
          <div>Vehicle details</div>
          <div className="ovl-sec-sub">Photo, core identity, and classification for this vehicle.</div>
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
          <div className="ovl-sec-sub">Build attributes, weight, and capacity information used for operations and compliance.</div>
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
  const remainingSlots = Math.max(scope.limit - nextManagedCount, 0);
  const slotsLabel = scope.limit === 0
    ? "No managed vehicle slots on this plan"
    : `${remainingSlots} of ${scope.limit} slot${scope.limit === 1 ? "" : "s"} remaining`;

  return (
    <form id="ovl-vehicle-form" className="ovl-form" onSubmit={onSubmit}>
      <div className="ml-card ovl-form-card">
        <div className="hac-sec-header">
          <div>Vehicle details</div>
          <div className="ovl-sec-sub">Photo, core identity, and classification for this vehicle.</div>
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
          <div className="ovl-sec-sub">Build attributes, weight, and capacity information used for operations and compliance.</div>
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
  const status = documentStatus(doc.expireDate);
  return <span className={`ovl-doc-status ${status === "Expired" ? "expired" : status === "Active" ? "active" : "empty"}`}>{status}</span>;
}

function VehicleDocumentUpload({ files, onFiles }) {
  const currentFiles = files || [];
  function addFiles(fileList) {
    const next = Array.from(fileList || []).slice(0, 3 - currentFiles.length).map((file) => ({
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
  return <><HacFileUpload multiple accept="image/jpeg,image/png,image/webp,application/pdf" onFiles={addFiles} description={<><span>Click to upload</span> or drag and drop</>} hint="Images or PDF, up to 3 files" />{currentFiles.length > 0 && <div className="ovl-upload-files">{currentFiles.map((file) => <div className="ovl-upload-file" key={file.id}>{file.kind === "image" ? <img src={file.url} alt="" /> : <span className="ovl-upload-pdf"><Icon name="picture_as_pdf" size={22} color="#bd4f48" /></span>}<span className="ovl-upload-file-name">{file.name}</span><button type="button" className="ovl-upload-remove" aria-label={`Remove ${file.name}`} onClick={() => removeFile(file.id)}><Icon name="close" size={16} /></button></div>)}</div>}</>;
}

function VehicleFilePreview({ file, onClose }) {
  return <HacModal title="File preview" onClose={onClose} className="ovl-preview-hac-modal" footer={<><button className="ml-btn-soft" type="button"><Icon name="download" size={15} color="var(--green-600)" />Download</button><button className="hac-modal-cancel" type="button" onClick={onClose}>Close</button></>}>
    <div className="ovl-preview-body">{file.kind === "image" ? <div className="ovl-preview-image"><img src={file.url} alt={file.name} /></div> : <div className="ovl-preview-placeholder"><Icon name="picture_as_pdf" size={48} color="#bd4f48" /><span>PDF preview is not available in this prototype.</span></div>}<div className="ovl-preview-name">{file.name}</div><div className="ovl-preview-date">Uploaded {file.uploadedDate || "—"}</div></div>
  </HacModal>;
}

function fileCountLabel(files = []) {
  return files.length === 1 ? "1 file" : files.length ? `${files.length} files` : "No files";
}

function VehicleFileLink({ file, onPreview }) {
  return <button className="ovl-file-link" type="button" onClick={() => onPreview(file)}>{file.kind === "image" ? <img src={file.url} alt="" /> : <Icon name="picture_as_pdf" size={27} color="#bd4f48" />}<span>{file.name}</span></button>;
}

function VehicleDocumentMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return <div className="ovl-doc-menu"><button type="button" aria-label="Document actions" aria-expanded={open} onClick={() => setOpen((value) => !value)}><Icon name="more_horiz" size={19} /></button>{open && <div className="ovl-doc-menu-pop"><button type="button" onClick={() => { setOpen(false); onEdit(); }}><Icon name="edit" size={15} />Edit</button><button className="danger" type="button" onClick={() => { setOpen(false); onDelete(); }}><Icon name="delete" size={15} />Delete</button></div>}</div>;
}

function VehicleReminderSummary({ reminders = [] }) {
  const values = reminders.map(Number).filter((value) => Number.isFinite(value) && value > 0);
  const [open, setOpen] = useState(false);
  if (!values.length) return "—";
  const nearest = Math.min(...values);
  if (values.length === 1) return `${nearest} days before`;
  return <>{nearest} days before <span className="ovl-reminder-summary"><button className="ovl-reminder-trigger" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>+{values.length - 1} more<Icon name="expand_more" size={14} /></button>{open && <span className="ovl-reminder-pop" role="dialog" aria-label="Reminder schedule"><span className="ovl-reminder-pop-title">Reminder schedule</span>{values.map((value, index) => <span className="ovl-reminder-pop-row" key={`${value}-${index}`}><span>Reminder {index + 1}</span><span>{value} days before expiry</span></span>)}</span>}</span></>;
}

function VehicleHistoryRow({ record }) {
  return <div className="ovl-history-row"><div className="ovl-history-top"><div className="ovl-history-sub">Uploaded {record.uploadedDate || record.createdDate || "—"}{record.uploadedBy ? ` by ${record.uploadedBy}` : ""}</div></div><div className="ovl-history-bottom"><div className="ovl-history-meta-group"><div className="ovl-history-meta"><span className="ovl-history-label">Start date</span><span className="ovl-history-value">{fmtDate(record.startDate)}</span></div><div className="ovl-history-meta"><span className="ovl-history-label">Due date</span><span className="ovl-history-value">{fmtDate(record.expireDate)}</span></div><div className="ovl-history-meta"><span className="ovl-history-label">Status</span><span className="ovl-doc-status expired">Expired</span></div><div className="ovl-history-meta"><span className="ovl-history-label">Expiry reminders</span><span className="ovl-history-reminder">{formatReminderList(record.reminders)}</span></div></div><div className="ovl-history-actions"><button className="ml-btn-soft" type="button"><Icon name="download" size={15} color="var(--green-600)" />Download</button></div></div></div>;
}

function VehicleDocumentModal({ initial, tier, onClose, onSave, onUpgrade }) {
  const [form, setForm] = useState({ ...initial, reminders: [...(initial.reminders || [30, "", ""])] });
  const [errors, setErrors] = useState({});
  const rule = DOC_FIELDS.find((field) => field.type === form.type) || DOC_FIELDS[0];
  const paid = tier !== "free";
  const reminderIndexes = paid ? [0, 1, 2] : [0];
  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  function updateReminder(index, value) {
    setForm((current) => ({ ...current, reminders: current.reminders.map((item, i) => i === index ? (value === "" ? "" : Number(value)) : item) }));
  }
  function submit(event) {
    event.preventDefault();
    const next = {};
    if (rule.startRequired && !form.startDate) next.startDate = "Start Date is required for this document type.";
    if (!form.expireDate) next.expireDate = "Due Date is required.";
    if (!form.reminders[0]) next.reminder = "Reminder 1 is required.";
    setErrors(next);
    if (!Object.keys(next).length) onSave({ ...form, reminders: paid ? form.reminders : [form.reminders[0], "", ""], files: (form.files || []).slice(0, 3) });
  }
  const title = initial.id ? `Edit ${form.type}` : `Add ${form.type}`;
  return <HacModal title={title} onClose={onClose} className="ovl-doc-modal" footer={<><button className="hac-modal-cancel" type="button" onClick={onClose}>Cancel</button><button className="hac-modal-save" type="submit" form="vehicle-document-form">{initial.id ? "Save changes" : "Add document"}</button></>}>
    <form id="vehicle-document-form" onSubmit={submit}>
      <div className="ovl-doc-fields">
        <div className="ovl-doc-field"><label>Document type *</label><SelectMenu className="ovl-doc-select" value={form.type} options={DOC_FIELDS.map((field) => ({ value: field.type, label: field.type }))} onChange={(value) => { const next = DOC_FIELDS.find((field) => field.type === value) || DOC_FIELDS[0]; setForm((current) => ({ ...current, type: value, reminders: [next.defaultReminder, current.reminders[1] || "", current.reminders[2] || ""] })); }} ariaLabel="Document type" /></div>
        <div className="ovl-doc-field"><label>Issued / Start date{rule.startRequired ? " *" : ""}</label><input type="date" value={form.startDate || ""} onChange={(e) => update("startDate", e.target.value)} />{errors.startDate && <span className="ovl-doc-error">{errors.startDate}</span>}</div>
        <div className="ovl-doc-field"><label>Expire date *</label><input type="date" value={form.expireDate || ""} onChange={(e) => update("expireDate", e.target.value)} />{errors.expireDate && <span className="ovl-doc-error">{errors.expireDate}</span>}</div>
        <div className="ovl-doc-field full"><label>File upload</label><VehicleDocumentUpload files={form.files || []} onFiles={(files) => update("files", files)} /></div>
      </div>
      <div className="ovl-doc-reminders"><h3>Reminder schedule</h3><div className="ovl-reminder-grid">{reminderIndexes.map((index) => <div className="ovl-doc-field ovl-reminder-input" key={index}><label>Reminder {index + 1}{index === 0 ? " *" : ""}</label><input type="number" min="1" value={form.reminders[index] || ""} placeholder={index === 0 ? String(rule.defaultReminder) : "Optional"} onChange={(e) => updateReminder(index, e.target.value)} /><span className="ovl-reminder-unit">days</span>{index === 0 && errors.reminder && <span className="ovl-doc-error">{errors.reminder}</span>}</div>)}</div>{!paid && <div className="ovl-upgrade-alert"><span>Free includes 1 reminder slot. Upgrade to add more reminder intervals.</span><button type="button" onClick={onUpgrade}>Upgrade plan</button></div>}</div>
    </form>
  </HacModal>;
}

function VehicleDocumentCard({ doc, editable, tier, onEdit, onDelete, onPreview }) {
  const [historyModal, setHistoryModal] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(5);
  const history = doc.history || [];
  const visibleReminders = remindersForTier(doc.reminders || [], tier);
  function openHistory() {
    setHistoryLimit(5);
    setHistoryModal(true);
  }
  return <article className="ovl-doc-row"><div className="ovl-doc-top"><div className="ovl-doc-type">{doc.type}</div>{vehicleDocumentStatus(doc)}<div className="ovl-doc-top-spacer" />{doc.files?.[0]?.uploadedDate && <div className="ovl-doc-upload-info">Uploaded {doc.files[0].uploadedDate}</div>}{editable && <VehicleDocumentMenu onEdit={onEdit} onDelete={onDelete} />}</div><div className="ovl-doc-meta-row"><div className="ovl-doc-meta"><span>Issued / Start date</span><span>{fmtDate(doc.startDate)}</span></div><div className="ovl-doc-meta"><span>Expire date</span><span>{fmtDate(doc.expireDate)}</span></div><div className="ovl-doc-meta"><span>Expiry reminders</span><span>{doc.expireDate ? <VehicleReminderSummary reminders={visibleReminders} /> : "—"}</span></div></div><div className="ovl-doc-file-row"><div className="ovl-doc-file-list">{doc.files?.length ? doc.files.map((file) => <VehicleFileLink key={file.id} file={file} onPreview={onPreview} />) : <span className="ovl-doc-file-empty">No files uploaded</span>}</div><div className="ovl-doc-file-count"><Icon name="attach_file" size={14} />{fileCountLabel(doc.files)}</div></div>{history.length ? <><button className="ovl-doc-history" type="button" onClick={openHistory}>View history ({history.length})<Icon name="chevron_right" size={17} /></button>{historyModal && <HacModal title={`Document History — ${doc.type}`} onClose={() => setHistoryModal(false)} className="ovl-history-modal"><div className="ovl-history-modal-body">{history.slice(0, historyLimit).map((record) => <VehicleHistoryRow key={record.id} record={record} />)}{historyLimit < history.length && <button className="ml-btn-soft ovl-history-load" type="button" onClick={() => setHistoryLimit((value) => value + 5)}>Load more</button>}</div></HacModal>}</> : <div className="ovl-doc-no-history">No historical data</div>}</article>;
}

function VehicleRemindersTab({ vehicle, documents, editable, tier, onChange, onToast }) {
  const [modal, setModal] = useState(null);
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  function saveDocument(doc) { const exists = documents.some((item) => item.id === doc.id); onChange(exists ? documents.map((item) => item.id === doc.id ? doc : item) : [doc, ...documents]); setModal(null); onToast(exists ? `${doc.type} changes saved.` : `${doc.type} added.`); }
  function removeDocument() { if (!deleteTarget) return; onChange(documents.filter((item) => item.id !== deleteTarget.id)); onToast(`${deleteTarget.type} deleted.`); setDeleteTarget(null); }
  function newDocument() { const field = DOC_FIELDS[0]; return { id: null, type: field.type, startDate: "", expireDate: "", reminders: [field.defaultReminder, "", ""], files: [], history: [] }; }
  return <section className="ml-card ovl-documents-panel"><div className="ovl-doc-title-row"><div><h2>Uploaded Documents</h2></div>{editable && <button className="ml-btn-soft ovl-doc-add" type="button" onClick={() => setModal(newDocument())}><Icon name="add" size={16} color="var(--green-600)" />Add document</button>}</div><div className="ovl-doc-list">{documents.map((doc) => <VehicleDocumentCard key={doc.id} doc={doc} editable={editable} tier={tier} onEdit={() => setModal(doc)} onDelete={() => setDeleteTarget(doc)} onPreview={setPreview} />)}</div>{modal && <VehicleDocumentModal initial={modal} tier={tier} onClose={() => setModal(null)} onSave={saveDocument} onUpgrade={() => onToast("Upgrade options would open here.")} />}{preview && <VehicleFilePreview file={preview} onClose={() => setPreview(null)} />}{deleteTarget && <HacModal title="Delete document?" onClose={() => setDeleteTarget(null)} footer={<><button className="hac-modal-cancel" type="button" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="hac-modal-save ovl-delete-action" type="button" onClick={removeDocument}>Delete document</button></>}><p className="ovl-delete-copy">{deleteTarget.type} and its current files will be removed from this vehicle. Historical records are retained in the prototype history model.</p></HacModal>}</section>;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const scenarioKey = t.scenario || "lite-active";
  const scenario = D.scenarios[scenarioKey];
  const reminderTier = scenarioKey === "free" ? "free" : scenarioKey === "premium" ? "premium" : "lite";
  const tweakVeh001CheckIn = t.veh001ActiveCheckIn ?? true;
  const [vehicles, setVehicles] = useState(() => deriveVehicles(scenarioKey, { veh001ActiveCheckIn: tweakVeh001CheckIn }));
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("vehicle");
  const [dueDateType, setDueDateType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [managedOnly, setManagedOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingDueDateType, setPendingDueDateType] = useState("all");
  const [pendingStartDate, setPendingStartDate] = useState("");
  const [pendingEndDate, setPendingEndDate] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [mobileMenuId, setMobileMenuId] = useState(null);
  const [mode, setMode] = useState("list");
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editTab, setEditTab] = useState("details");
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

  function openEdit(vehicle) {
    setEditingVehicle(vehicle);
    setForm(makeFormFromVehicle(vehicle));
    setEditTab("details");
    setMode("edit");
  }

  function openView(vehicle) {
    setEditingVehicle(vehicle);
    setForm(makeFormFromVehicle(vehicle));
    setEditTab("details");
    setMode("view");
  }

  function closeForm() {
    setMode("list");
    setEditingVehicle(null);
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

  const filters = { query, scope, dueDateType, startDate, endDate, managedOnly };
  const filtered = useMemo(() => applyFilters(vehicles, filters), [vehicles, query, scope, dueDateType, startDate, endDate, managedOnly]);
  const pageData = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page, perPage]);
  const hasClearableFilters = !!query || dueDateType !== "all" || !!startDate || !!endDate;
  const dateFilterCount = (dueDateType !== "all" ? 1 : 0) + (!!startDate ? 1 : 0) + (!!endDate ? 1 : 0);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (page > totalPages) setPage(totalPages);
  }, [filtered.length, page, perPage]);

  function resetFilters() {
    setQuery("");
    setScope("vehicle");
    setDueDateType("all");
    setStartDate("");
    setEndDate("");
    setPendingDueDateType("all");
    setPendingStartDate("");
    setPendingEndDate("");
    setPage(1);
  }

  function toggleFilterPanel() {
    if (!filterOpen) {
      setPendingDueDateType(dueDateType);
      setPendingStartDate(startDate);
      setPendingEndDate(endDate);
    }
    setFilterOpen((current) => !current);
  }

  function applyPendingFilters() {
    setDueDateType(pendingDueDateType);
    setStartDate(pendingStartDate);
    setEndDate(pendingEndDate);
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

    if (mode === "edit") {
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
      closeForm();
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
              <VehiclePageHead mode={mode} vehicle={editingVehicle} onBack={closeForm} onEdit={() => setMode("edit")} />
              {(mode === "edit" || mode === "view") && (
                <div className="ml-tabs ovl-tabs-row">
                  {VEHICLE_EDIT_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={"ml-tab" + (editTab === tab.key ? " active" : "")}
                      onClick={() => setEditTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
              {mode === "create" || (mode === "edit" && editTab === "details") ? (
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
                    mode={mode}
                    onCancel={mode === "edit" && currentEditingVehicle ? () => openView(currentEditingVehicle) : closeForm}
                  />
                </>
              ) : mode === "view" && editTab === "details" ? (
                <VehicleViewSections form={form} nextManagedCount={nextManagedCount} scope={scenario} />
              ) : editTab === "reminders" && currentEditingVehicle ? (
                <VehicleRemindersTab
                  vehicle={currentEditingVehicle}
                  documents={form.documents || currentEditingVehicle.documents || []}
                  editable={mode !== "create"}
                  tier={reminderTier}
                  onChange={(documents) => updateVehicleDocuments(currentEditingVehicle.id, documents)}
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
            <button className="hac-create-btn ovl-create-btn" type="button" onClick={openCreate}>
              <Icon name="add" size={16} color="#fff" /> Create Vehicle
            </button>
          </div>

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
                <button className={`hac-filter-btn${dateFilterCount ? " active" : ""}`} type="button" onClick={toggleFilterPanel}>
                  <Icon name="tune" size={18} /> Filter
                  {dateFilterCount > 0 && <span className="hac-filter-badge">{dateFilterCount}</span>}
                </button>
              </div>

              <div className="ovl-toolbar-right">
                <label className={`ovl-managed-filter${managedOnly ? " active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={managedOnly}
                    onChange={() => { setManagedOnly((current) => !current); setPage(1); }}
                  />
                  <span className="ovl-managed-filter-text">Managed Vehicles only</span>
                  <span className="ovl-managed-count">{managedCount} of {scenario.limit} slot{scenario.limit === 1 ? "" : "s"} used</span>
                </label>
              </div>

              {hasClearableFilters && (
                <button className="ovl-clear" type="button" onClick={resetFilters}>
                  <Icon name="ink_eraser" size={15} /> Clear filters
                </button>
              )}
            </div>

            {filterOpen && (
              <div className="hac-filter-panel ovl-filter-panel">
                <div className="hac-filter-grid ovl-filter-grid">
                  <div className="hac-filter-field">
                    <label>Due Date Type</label>
                    <div className="hac-select-wrap">
                      <SelectMenu
                        className="hac-select"
                        value={pendingDueDateType}
                        options={D.dueDateTypes}
                        onChange={setPendingDueDateType}
                        ariaLabel="Due date type"
                      />
                    </div>
                  </div>
                  <div className="hac-filter-field">
                    <label>Start Date</label>
                    <div className="hac-date-range-field">
                      <Icon name="event" size={16} color="var(--fg-tertiary)" />
                      <input className="hac-date-range-input" type="date" value={pendingStartDate} onChange={(e) => setPendingStartDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="hac-filter-field">
                    <label>End Date</label>
                    <div className="hac-date-range-field">
                      <Icon name="event" size={16} color="var(--fg-tertiary)" />
                      <input className="hac-date-range-input" type="date" value={pendingEndDate} onChange={(e) => setPendingEndDate(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="hac-filter-actions">
                  <button className="hac-filter-apply" type="button" onClick={applyPendingFilters}>Apply Filters</button>
                  <button className="hac-filter-reset" type="button" onClick={resetFilters}>Reset All</button>
                </div>
              </div>
            )}
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
                    <th>Road Tax Expiry</th>
                    <th>Insurance Expiry</th>
                    <th>Puspakom Service</th>
                    <th>Truck Permit Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!filtered.length && (
                    <tr>
                      <td colSpan="14">
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
                              <VehicleThumb />
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
                          <td><ExpiryCell iso={vehicle.roadTax} /></td>
                          <td><ExpiryCell iso={vehicle.insurance} /></td>
                          <td><ExpiryCell iso={vehicle.puspakom} /></td>
                          <td><ExpiryCell iso={vehicle.permit} /></td>
                          <td onClick={(event) => event.stopPropagation()}>
                            <VehicleRowMenu
                              open={menuId === vehicle.id}
                              onToggle={(next) => setMenuId(next ? vehicle.id : null)}
                              onView={() => { openView(vehicle); setMenuId(null); }}
                              onEdit={() => { openEdit(vehicle); setMenuId(null); }}
                              onDelete={() => { setMenuId(null); pushToast("warn", "Delete is shown for parity only. No prototype deletion was performed."); }}
                            />
                          </td>
                        </tr>
                        {expanded && (
                          <tr>
                            <td className="ovl-expanded-cell" colSpan="14">
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
                const urgent = bestUrgency(vehicle);
                const expanded = expandedId === vehicle.id;
                return (
                  <div key={vehicle.id} className="ovl-mobile-card">
                    <div className="ovl-mobile-head">
                      <div className="ovl-vehicle-cell">
                        <VehicleThumb />
                        <div className="ovl-vehicle-main">
                          <div className="ovl-vehicle-plate">{vehicle.plate}</div>
                        </div>
                      </div>
                      <ManagedIcon managed={vehicle.managed} />
                    </div>
                    <div className="ovl-mobile-meta">
                      <span className="ovl-mobile-chip">{vehicle.category}</span>
                      <span className="ovl-mobile-chip">{vehicle.vendor}</span>
                    </div>
                    <div className="ovl-mobile-urgent">
                      {urgent ? (
                        <div>
                          <div style={{ fontSize: 11, color: "var(--fg-tertiary)", marginBottom: 5 }}>Most urgent expiry</div>
                          <ExpiryCell iso={urgent.iso} />
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "var(--fg-secondary)" }}>No upcoming compliance date</div>
                      )}
                    </div>
                    <div className="ovl-mobile-actions">
                      <button className="ovl-mobile-expand" type="button" onClick={() => setExpandedId(expanded ? null : vehicle.id)}>
                        <Icon name={expanded ? "expand_less" : "expand_more"} size={15} />
                        {expanded ? "Hide drivers" : "Show drivers"}
                      </button>
                      <VehicleRowMenu
                        open={mobileMenuId === vehicle.id}
                        onToggle={(next) => setMobileMenuId(next ? vehicle.id : null)}
                        onView={() => { openView(vehicle); setMobileMenuId(null); }}
                        onEdit={() => { openEdit(vehicle); setMobileMenuId(null); }}
                        onDelete={() => { setMobileMenuId(null); pushToast("warn", "Delete is shown for parity only. No prototype deletion was performed."); }}
                      />
                    </div>
                    {expanded && <ExpandableVehicleDriversRow vehicle={vehicle} />}
                  </div>
                );
              })}
              {!filtered.length && <div className="ovl-mobile-card"><div className="ovl-empty-table">No vehicles match the current filters.</div></div>}
            </div>
          </section>

          <Pager page={page} perPage={perPage} total={filtered.length} onPage={setPage} onPerPage={setPerPage} />
          </>
          )}
        </div>
      </main>

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
