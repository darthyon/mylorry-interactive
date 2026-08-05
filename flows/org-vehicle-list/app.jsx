{

const { useEffect, useMemo, useRef, useState } = React;
const { Icon, OrgSwitcher: BaseOrgSwitcher, SelectMenu, Pager, HacModal, HacFileUpload, StatusBadge, MobileListCard, ReminderSummary, EmptyState } = window.SharedShell;
const { useTweaks, TweaksPanel, TweakSection, TweakSelect, TweakToggle } = window;
// Vehicle domain layer — shared with the Host Portal. See shared/vehicle-detail.jsx.
const {
  DOC_FIELDS, VEHICLE_LIST_TABS, DUE_RANGE_OPTIONS, VEHICLE_EDIT_TABS, DRIVER_POOL,
  initials, fmtNumber, fmtDate, daysUntil, documentTone, expiryMeta,
  makeVehicleDocuments, makeVehicleForms, makeEmptyForm, makeFormFromVehicle,
  normalizeVehicle, vehicleDocumentTitle, vehicleDocumentStatus, slotsMeta, resolveEditTab,
  VehicleThumb, ManagedIcon, VehicleRowMenu, ExpandableVehicleDriversRow,
  AssignedDriversModal, VehicleDueDates, VehiclePageHead, VehicleQrModal,
  VehicleFormEditBar, VehicleViewSections, VehicleFormSections, VehicleFormsTab,
  DriverListPanel, DriverPickerModal, VehicleRemindersTab, VehicleStatusBadge,
} = window.VehicleDetail;
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
  "lite-at-limit": "2 — Lite (10 / 10)",
  "premium": "3 — Premium",
  "free": "4 — Free (0 MV)",
  "enterprise": "5 — Enterprise",
};

function deriveVehicles(scenarioKey, tweaks = {}) {
  const scenario = D.scenarios[scenarioKey];
  const managedSet = new Set(scenario.managedIds);
  return D.vehicles.map((vehicle) => {
    const v = normalizeVehicle({ ...vehicle, managed: managedSet.has(vehicle.id) });
    if (tweaks.veh001ActiveCheckIn !== undefined && v.id === "veh-001") {
      v.activeCheckIn = tweaks.veh001ActiveCheckIn;
    }
    // Check-in is a managed-vehicle feature, so an unmanaged vehicle can never
    // be in use — matters in lite-at-limit, where veh-001 is unmanaged.
    if (!v.managed) v.activeCheckIn = false;
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

// Slots chip on the vehicle detail page. Tone follows headroom, not managed
// status — "0 of 9 slots remaining" must never read as a healthy green.

function applyFilters(rows, filters) {
  return rows.filter((row) => {
    if (filters.managedOnly && !row.managed) return false;
    if (filters.statusFilter === "All statuses") {
      if (row.status === "Inactive") return false;
    } else if (filters.statusFilter === "Inactive") {
      if (row.status !== "Inactive") return false;
    } else if (filters.statusFilter === "In use") {
      if (row.status === "Inactive" || !row.activeCheckIn) return false;
    } else if (filters.statusFilter === "Unused") {
      if (row.status === "Inactive" || row.activeCheckIn) return false;
    }
    if (filters.query && filters.query.trim()) {
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
              <span className="ovl-rail-profile-role">{D.user.role}</span>
              <span className="ovl-rail-profile-name">{D.user.name}</span>
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
            {expanded && <span>Sign Out</span>}
          </a>
          <button type="button" className="ovl-rail-item">
            <Icon name="language" size={20} />
            {expanded && <span>English</span>}
          </button>
        </div>
      </nav>
      <button type="button" className="ovl-rail-toggle" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}>
        <Icon name="chevron_left" size={16} />
      </button>
    </div>
  );
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
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingDueDateType, setPendingDueDateType] = useState("all");
  const [pendingDueRange, setPendingDueRange] = useState("all");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [deletingVehicle, setDeletingVehicle] = useState(null);
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
  const [qrOpen, setQrOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    setVehicles(deriveVehicles(scenarioKey, { veh001ActiveCheckIn: tweakVeh001CheckIn }));
    setExpandedIds(new Set());
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
    setEditTab(resolveEditTab(options.tab));
    setDetailsEditing(false);
    setMode("view");
  }

  function openDrivers(vehicle) {
    openView(vehicle, { tab: "drivers" });
  }

  function openDueDateView(vehicle, doc) {
    openView(vehicle, { tab: "documents", documentId: doc.id });
  }

  // Deep link from the host vehicle list: ?vehicle=<id|plate>&tab=<edit tab>.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get("vehicle");
    if (!wanted) return;
    const key = wanted.trim().toLowerCase();
    const match = vehicles.find((item) => item.id.toLowerCase() === key)
      || vehicles.find((item) => item.plate.toLowerCase() === key);
    if (!match) return;
    openView(match, { tab: params.get("tab") });
  }, []);

  function closeForm() {
    setQrOpen(false);
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
  const filtered = useMemo(
    () => applyFilters(vehicles, { scope, query, dueDateType: "all", managedOnly, statusFilter }),
    [vehicles, scope, query, managedOnly, statusFilter]
  );
  const pageData = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page, perPage]);
  const hasClearableFilters = query.trim() || scope !== "vehicle" || dueDateType !== "all" || dueRange !== "all" || managedOnly || statusFilter !== "All statuses";
  const dateFilterCount = (dueDateType !== "all" ? 1 : 0) + (dueRange !== "all" ? 1 : 0);

  useEffect(() => {
    const isSearching = Boolean(query.trim() || managedOnly || dateFilterCount > 0);
    if (isSearching) {
      setExpandedIds(new Set(filtered.map((v) => v.id)));
    } else {
      setExpandedIds(new Set());
    }
  }, [query, scope, managedOnly, dateFilterCount]);

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
    setManagedOnly(false);
    setStatusFilter("All statuses");
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
  const atLimit = scenario.limit === 0 || managedCount >= scenario.limit;

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
              <VehiclePageHead mode={mode} vehicle={editingVehicle} onBack={closeForm} editing={detailsEditing} onShowQr={editingVehicle ? () => setQrOpen(true) : null} />
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
                    atLimit={atLimit}
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
                <EmptyState icon="lock" title="Manage this vehicle" sub="Enable managed vehicle to unlock check-in forms and safety checklists." />
              ) : editTab === "forms" && currentEditingVehicle ? (
                <VehicleFormsTab
                  forms={makeVehicleForms(currentEditingVehicle)}
                  onChange={(forms) => updateVehicleForms(currentEditingVehicle.id, forms)}
                  onToast={(message) => pushToast("ok", message)}
                />
              ) : editTab === "drivers" && !form.managed ? (
                <EmptyState icon="lock" title="Manage this vehicle" sub="Enable managed vehicle to unlock driver check-in, ICOP safety, and driver assignment." />
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
              searchScopes={D.searchScopes}
              dueDateTypes={D.dueDateTypes}
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
                <SelectMenu
                  className="hac-select"
                  value={statusFilter}
                  options={["All statuses", "In use", "Unused", "Inactive"]}
                  onChange={(next) => { setStatusFilter(next); setPage(1); }}
                  ariaLabel="Filter by status"
                />
              </div>

              <div className="ovl-toolbar-right">
                <label className={`ovl-managed-filter${managedOnly ? " active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={managedOnly}
                    onChange={() => { setManagedOnly((current) => !current); setPage(1); }}
                  />
                  <span className="ovl-managed-filter-text">Managed Vehicles only</span>
                  <span className={`ovl-managed-count${Number.isFinite(scenario.limit) && atLimit ? " danger" : ""}`}>{Number.isFinite(scenario.limit) ? `${managedCount} of ${scenario.limit} slot${scenario.limit === 1 ? "" : "s"} used` : `${managedCount} managed`}</span>
                </label>
              </div>

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
                    <th className="ovl-col-right">Weight (BTM) <small>kg</small></th>
                    <th>Total Weight (BDM) kg</th>
                    <th>Load Capacity (kg)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!filtered.length && (
                    <tr>
                      <td colSpan="11">
                        <div className="ovl-empty-table">No vehicles match the current filters.</div>
                      </td>
                    </tr>
                  )}
                  {pageData.map((vehicle, index) => {
                    const expanded = expandedIds.has(vehicle.id);
                    return (
                      <React.Fragment key={vehicle.id}>
                        <tr className={`ovl-row${expanded ? " ml-row-open" : ""}`} onClick={() => setExpandedIds(prev => { const next = new Set(prev); if (next.has(vehicle.id)) next.delete(vehicle.id); else next.add(vehicle.id); return next; })} aria-expanded={expanded}>
                          <td><Icon name={expanded ? "expand_more" : "chevron_right"} size={18} color="#999AA5" /></td>
                          <td className="ovl-index">{(page - 1) * perPage + index + 1}</td>
                          <td>
                            <div className="ovl-vehicle-cell">
                              <VehicleThumb inUse={vehicle.activeCheckIn} category={vehicle.category} />
                              <div className="ovl-vehicle-main">
                                <div className="ml-cell-main ovl-vehicle-plate">{vehicle.plate}</div>
                              </div>
                            </div>
                          </td>
                          <td><ManagedIcon managed={vehicle.managed} /></td>
                          <td>{vehicle.category}</td>
                          <td>{vehicle.vendor}</td>
                          <td className="ovl-col-right">{fmtNumber(vehicle.btm)}</td>
                          <td className="ovl-weight">{fmtNumber(vehicle.bdm)}</td>
                          <td className="ovl-weight">{fmtNumber(vehicle.capacity)}</td>
                          <td><VehicleStatusBadge vehicle={vehicle} /></td>
                          <td onClick={(event) => event.stopPropagation()}>
                            <VehicleRowMenu
                              open={menuId === vehicle.id}
                              onToggle={(next) => setMenuId(next ? vehicle.id : null)}
                              onView={() => { openView(vehicle); setMenuId(null); }}
                              onEdit={() => { openEdit(vehicle); setMenuId(null); }}
                              onDelete={() => { setMenuId(null); setDeletingVehicle(vehicle); }}
                              isInactive={vehicle.status === "Inactive"}
                              onReactivate={() => {
                                setMenuId(null);
                                setVehicles(current => current.map(v => v.id === vehicle.id ? { ...v, status: "Unused" } : v));
                                pushToast("ok", `Vehicle ${vehicle.plate} was reactivated.`);
                              }}
                            />
                          </td>
                        </tr>
                        {expanded && (
                          <tr>
                            <td className="ovl-expanded-cell" colSpan="11">
                              <ExpandableVehicleDriversRow vehicle={vehicle} onEditDrivers={openDrivers} />
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
                    leading={<VehicleThumb inUse={vehicle.activeCheckIn} category={vehicle.category} />}
                    title={vehicle.plate}
                    subtitle={vehicle.category}
                    status={<ManagedIcon managed={vehicle.managed} label />}
                    menu={
                      <div className="ovl-card-actions">
                        <VehicleRowMenu
                          open={mobileMenuId === vehicle.id}
                          onToggle={(next) => setMobileMenuId(next ? vehicle.id : null)}
                          onView={() => { openView(vehicle); setMobileMenuId(null); }}
                          onEdit={() => { openEdit(vehicle); setMobileMenuId(null); }}
                          onDelete={() => { setMobileMenuId(null); setDeletingVehicle(vehicle); }}
                          isInactive={vehicle.status === "Inactive"}
                          onReactivate={() => {
                            setMobileMenuId(null);
                            setVehicles(current => current.map(v => v.id === vehicle.id ? { ...v, status: "Unused" } : v));
                            pushToast("ok", `Vehicle ${vehicle.plate} was reactivated.`);
                          }}
                        />
                      </div>
                    }
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

      {qrOpen && editingVehicle && <VehicleQrModal vehicle={editingVehicle} onClose={() => setQrOpen(false)} />}
      {mobileDriversVehicle && <AssignedDriversModal vehicle={mobileDriversVehicle} onClose={() => setMobileDriversVehicle(null)} onEditDrivers={(vehicle) => { setMobileDriversVehicle(null); openDrivers(vehicle); }} />}

      {deletingVehicle && (
        <HacModal
          title="Delete vehicle?"
          onClose={() => setDeletingVehicle(null)}
          footer={
            <>
              <button className="hac-modal-cancel" type="button" onClick={() => setDeletingVehicle(null)}>Keep Vehicle</button>
              <button className="hac-modal-save ovl-delete-action" style={{ background: "#c44741", color: "#fff", border: "none" }} type="button" onClick={() => {
                setVehicles((current) => current.map((v) => v.id === deletingVehicle.id ? { ...v, status: "Inactive" } : v));
                pushToast("ok", `Vehicle ${deletingVehicle.plate} was deleted.`);
                setDeletingVehicle(null);
              }}>Delete Vehicle</button>
            </>
          }
        >
          <p className="ovl-delete-copy" style={{ color: "var(--fg-secondary)", marginTop: "8px" }}>Vehicle {deletingVehicle.plate} will be marked as inactive in this prototype.</p>
        </HacModal>
      )}

      <TweaksPanel title="Prototype State">
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
