{

const { useEffect, useMemo, useRef, useState } = React;
const { Icon, OrgSwitcher, SelectMenu, Pager } = window.SharedShell;
const { useTweaks, TweaksPanel, TweakSection, TweakSelect } = window;
const D = window.ORG_VEHICLE_LIST;

const MYADMIN_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", href: "../org-myadmin-dashboard/index.html" },
  { key: "user", label: "User", icon: "group" },
  { key: "driver", label: "Driver", icon: "badge" },
  { key: "vehicle", label: "Vehicle", icon: "local_shipping", href: "#" },
  { key: "vendor", label: "Vendor", icon: "storefront" },
  { key: "checklist", label: "Checklist", icon: "fact_check" },
  { key: "history", label: "Check In History", icon: "history" },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scenario": "lite-active"
}/*EDITMODE-END*/;

const SCENARIO_LABEL = {
  "lite-active": "1 — Lite (8 / 10)",
  "lite-at-limit": "2 — Lite (at limit)",
  "premium": "3 — Premium",
  "free": "4 — Free (0 MV)",
};

const DOC_FIELDS = [
  { key: "roadTax", label: "Road Tax Expiry" },
  { key: "insurance", label: "Insurance Expiry" },
  { key: "puspakom", label: "Puspakom Service" },
  { key: "permit", label: "Truck Permit Expiry" },
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
  { key: "reminders", label: "Reminders" },
  { key: "forms", label: "Forms" },
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
  };
}

function normalizeVehicle(vehicle) {
  return {
    ...vehicle,
    managed: !!vehicle.managed,
    drivers: Array.isArray(vehicle.drivers) ? vehicle.drivers : [],
    activeCheckIn: !!vehicle.activeCheckIn,
    accessibleToAll: !!vehicle.accessibleToAll,
  };
}

function deriveVehicles(scenarioKey) {
  const scenario = D.scenarios[scenarioKey];
  const managedSet = new Set(scenario.managedIds);
  return D.vehicles.map((vehicle) => normalizeVehicle({ ...vehicle, managed: managedSet.has(vehicle.id) }));
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
  const tone = expiryTone(iso);
  return (
    <div className={`ovl-expiry ${tone}`}>
      <span className="ovl-expiry-date">{fmtDate(iso)}</span>
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
            <Icon name="info" size={16} color="#fff" />
            <span className="ml-tooltip ovl-driver-info-tooltip">Every driver in your org can check in without individual assignment.</span>
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
          {vehicle.accessibleToAll ? (
            <tr>
              <td colSpan={4}>
                <div className="ovl-driver-empty">
                  <Icon name="how_to_reg" size={40} color="var(--green-500)" />
                  <div className="ovl-driver-empty-title">All drivers can access this vehicle</div>
                  <div className="ovl-driver-empty-sub">Please uncheck the 'Accessible to all drivers' box to reassign drivers</div>
                </div>
              </td>
            </tr>
          ) : count ? (
            vehicle.drivers.map((driver, index) => (
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
            ))
          ) : (
            <tr>
              <td colSpan={4}>
                <div className="ovl-driver-empty">
                  <Icon name="person_off" size={40} color="#F5A623" />
                  <div className="ovl-driver-empty-title">No drivers have access to the vehicle</div>
                  <div className="ovl-driver-empty-sub">Please search driver to assign or tick the 'Accessible to all drivers' box</div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
  const subtitle = isCreate
    ? "Add a new vehicle profile and configure its managed access settings."
    : isView
      ? "View vehicle profile and managed access settings."
      : "Update vehicle profile and managed access settings.";
  const crumbLabel = isCreate ? "Create vehicle" : isView ? "View vehicle" : "Edit vehicle";
  return (
    <div className="ml-page-head ovl-pagehead">
      <div>
        <div className="hac-breadcrumb">
          <button className="hac-bc-link" type="button" onClick={onBack}>Vehicles</button>
          <Icon name="chevron_right" size={16} color="var(--fg-tertiary)" />
          <span>{crumbLabel}</span>
        </div>
        <div className="ml-h1 ovl-title">{title}</div>
        <div className="ovl-subtitle">{subtitle}</div>
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
  const inputRef = useRef(null);

  function handleFiles(files) {
    const file = files && files[0];
    if (!file) return;
    onChange({ name: file.name, url: URL.createObjectURL(file) });
  }

  return (
    <div
      className="ovl-dropzone"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {photo ? (
        <img src={photo.url} alt="" className="ovl-dropzone-preview" />
      ) : (
        <>
          <Icon name="upload_file" size={26} color="var(--green-600)" />
          <div className="ovl-dropzone-text"><span>Click to upload</span> or drag and drop</div>
          <div className="ovl-dropzone-hint">jpg, jpeg, png, webp (max. 12MB)</div>
        </>
      )}
      <button type="button" className="ovl-btn-secondary ovl-dropzone-btn" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
        Choose file
      </button>
    </div>
  );
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
    <>
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
    </>
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

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const scenarioKey = t.scenario || "lite-active";
  const scenario = D.scenarios[scenarioKey];
  const [vehicles, setVehicles] = useState(() => deriveVehicles(scenarioKey));
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
    setVehicles(deriveVehicles(scenarioKey));
    setExpandedId(null);
    setMenuId(null);
    setMobileMenuId(null);
    setPage(1);
  }, [scenarioKey]);

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
    + (form.managed && !editingVehicle?.managed ? 1 : 0)
    - (!form.managed && editingVehicle?.managed ? 1 : 0);
  const overCap = form.managed && (scenario.limit === 0 || nextManagedCount > scenario.limit);

  function handleToggleManaged() {
    if (form.managed) {
      if (editingVehicle?.activeCheckIn) {
        pushToast("warn", "This vehicle is currently in use. The driver must check out before you can deactivate Managed status.");
        return;
      }
      update("managed", false);
      return;
    }
    if (scenario.limit === 0 || managedCount >= scenario.limit) {
      pushToast("warn", "You've reached your plan limit of managed vehicles. Upgrade your plan to manage more.");
      return;
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
                  <VehicleFormEditBar mode={mode} onCancel={closeForm} />
                </>
              ) : mode === "view" && editTab === "details" ? (
                <VehicleViewSections form={form} nextManagedCount={nextManagedCount} scope={scenario} />
              ) : editTab === "drivers" && !form.managed ? (
                <div className="hac-empty-state ovl-driver-lock">
                  <Icon name="lock" size={20} color="var(--fg-tertiary)" />
                  <div>Manage this vehicle to enable driver check-in, ICOP compliance, and more.</div>
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
                  <span className="ovl-managed-count">{managedCount} / {scenario.limit}</span>
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
