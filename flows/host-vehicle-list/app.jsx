// app.jsx — Host Portal vehicle module.
//
// Same capabilities as the Org Portal (list, due dates, view/edit/create,
// Forms, Documents, Drivers), scoped across every organisation instead of one.
// The vehicle domain layer is shared: see shared/vehicle-detail.jsx.
//
// Host-only differences:
//   • Organisation column, filter, and search scope on both tables.
//   • Organization selector on the vehicle form; changing it moves the vehicle.
//   • No host-wide managed-slot counter in the toolbar — slots are a per-org
//     plan limit, so the detail page scopes to the owning org's plan instead.
{

const { useEffect, useMemo, useState } = React;
const { Icon, SelectMenu, Pager, StatusBadge, MobileListCard, EmptyState, HacModal } = window.SharedShell;
const {
  DOC_FIELDS, VEHICLE_LIST_TABS, VEHICLE_EDIT_TABS,
  fmtNumber, makeVehicleDocuments, makeVehicleForms, makeEmptyForm, makeFormFromVehicle,
  normalizeVehicle, resolveEditTab,
  VehicleThumb, ManagedIcon, VehicleRowMenu, ExpandableVehicleDriversRow,
  AssignedDriversModal, VehicleDueDates, VehiclePageHead, VehicleQrModal,
  VehicleFormEditBar, VehicleViewSections, VehicleFormSections, VehicleFormsTab,
  DriverListPanel, DriverPickerModal, VehicleRemindersTab, VehicleStatusBadge,
} = window.VehicleDetail;
const D = window.HOST_VEHICLE_LIST;

const ORG_FILTER_OPTIONS = [{ value: "all", label: "All organisations" }, ...D.orgs.map((org) => ({ value: org.id, label: org.name }))];
const ORG_FORM_OPTIONS = D.orgs.map((org) => ({ value: org.id, label: org.name }));

function orgById(id) {
  return D.orgs.find((org) => org.id === id) || null;
}

// Slot/reminder limits follow the owning org's plan. An unassigned vehicle
// (create, before an org is picked) gets an unlimited scope so the form is
// usable; the real limit applies as soon as an organisation is chosen.
const UNSCOPED_PLAN = { name: "—", tier: "enterprise", limit: Infinity };
function planForOrg(orgId) {
  return orgById(orgId)?.plan || UNSCOPED_PLAN;
}

function OrgCell({ org }) {
  return <span className="hvl-org">{org?.name || "—"}</span>;
}

function matchesSearch(vehicle, query, scope) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (scope === "vehicle") return `${vehicle.plate} ${vehicle.category}`.toLowerCase().includes(q);
  if (scope === "org") return String(vehicle.org?.name || "").toLowerCase().includes(q);
  if (scope === "vendor") return String(vehicle.vendor || "").toLowerCase().includes(q);
  return vehicle.drivers.map((driver) => `${driver.name} ${driver.driverId} ${driver.phone}`.toLowerCase()).join(" ").includes(q);
}

function App() {
  const [vehicles, setVehicles] = useState(() => D.vehicles.map(normalizeVehicle));

  const [listTab, setListTab] = useState("list");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("vehicle");
  const [orgId, setOrgId] = useState("all");
  const [dueDateType, setDueDateType] = useState("all");
  const [dueRange, setDueRange] = useState("all");
  const [managedOnly, setManagedOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingOrgId, setPendingOrgId] = useState("all");
  const [pendingDueDateType, setPendingDueDateType] = useState("all");
  const [pendingDueRange, setPendingDueRange] = useState("all");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [mobileDriversVehicle, setMobileDriversVehicle] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [mobileMenuId, setMobileMenuId] = useState(null);
  const [mode, setMode] = useState("list");
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [editTab, setEditTab] = useState("details");
  const [detailsEditing, setDetailsEditing] = useState(false);
  const [form, setForm] = useState(() => makeEmptyForm());
  const [driverPickerOpen, setDriverPickerOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function pushToast(tone, message) {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone, message }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3400);
  }

  /* ── Navigation ─────────────────────────────────────────── */

  function openCreate() {
    setEditingVehicle(null);
    setForm({ ...makeEmptyForm(), orgId: orgId !== "all" ? orgId : "" });
    setMode("create");
  }

  function openView(vehicle, options = {}) {
    setEditingVehicle(vehicle);
    setForm(makeFormFromVehicle(vehicle));
    setEditTab(resolveEditTab(options.tab));
    setDetailsEditing(false);
    setMode("view");
  }

  function openEdit(vehicle, options = {}) {
    openView(vehicle, options);
    if (options.tab !== "documents") setDetailsEditing(true);
  }

  function openDrivers(vehicle) {
    openView(vehicle, { tab: "drivers" });
  }

  function openDueDateView(vehicle, doc) {
    openView(vehicle, { tab: "documents", documentId: doc.id });
  }

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

  /* ── Filtering ──────────────────────────────────────────── */

  const filtered = useMemo(() => vehicles.filter((vehicle) => {
    if (managedOnly && !vehicle.managed) return false;
    if (orgId !== "all" && vehicle.org?.id !== orgId) return false;
    if (statusFilter === "All statuses") {
      if (vehicle.status === "Inactive") return false;
    } else if (statusFilter === "Inactive") {
      if (vehicle.status !== "Inactive") return false;
    } else if (statusFilter === "In use") {
      if (vehicle.status === "Inactive" || !vehicle.activeCheckIn) return false;
    } else if (statusFilter === "Unused") {
      if (vehicle.status === "Inactive" || vehicle.activeCheckIn) return false;
    }
    if (query) return matchesSearch(vehicle, query, scope);
    return true;
  }), [vehicles, managedOnly, orgId, query, scope, statusFilter]);

  const pageData = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page, perPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (page > totalPages) setPage(totalPages);
  }, [filtered.length, page, perPage]);

  const filterCount = (orgId !== "all" ? 1 : 0) + (dueDateType !== "all" ? 1 : 0) + (dueRange !== "all" ? 1 : 0);
  const hasClearableFilters = !!query || filterCount > 0 || managedOnly || statusFilter !== "All statuses";

  useEffect(() => {
    const isSearching = Boolean(query.trim() || filterCount > 0 || managedOnly);
    if (isSearching) {
      setExpandedIds(new Set(filtered.map((v) => v.id)));
    } else {
      setExpandedIds(new Set());
    }
  }, [query, scope, managedOnly, filterCount]);

  function resetFilters() {
    setQuery("");
    setScope("vehicle");
    setOrgId("all");
    setDueDateType("all");
    setDueRange("all");
    setPendingOrgId("all");
    setPendingDueDateType("all");
    setPendingDueRange("all");
    setManagedOnly(false);
    setStatusFilter("All statuses");
    setPage(1);
    setFilterOpen(false);
  }

  function toggleFilterPanel() {
    if (!filterOpen) {
      setPendingOrgId(orgId);
      setPendingDueDateType(dueDateType);
      setPendingDueRange(dueRange);
    }
    setFilterOpen((current) => !current);
  }

  function applyPendingFilters() {
    setOrgId(pendingOrgId);
    setDueDateType(pendingDueDateType);
    setDueRange(pendingDueRange);
    setPage(1);
    setFilterOpen(false);
  }

  const orgFilterField = (
    <div className="hac-filter-field">
      <label>Organisation</label>
      <div className="hac-select-wrap">
        <SelectMenu className="hac-select" value={pendingOrgId} options={ORG_FILTER_OPTIONS} onChange={setPendingOrgId} ariaLabel="Organisation" searchable searchPlaceholder="Search organisation" />
      </div>
    </div>
  );

  /* ── Managed state, scoped to the owning org's plan ─────── */

  const currentEditingVehicle = editingVehicle
    ? (vehicles.find((item) => item.id === editingVehicle.id) || editingVehicle)
    : null;

  // The form's org, not the vehicle's — picking a different org in edit mode
  // must re-scope the slot counter immediately.
  const formPlan = planForOrg(form.orgId);
  const formOrgManagedCount = useMemo(
    () => vehicles.filter((vehicle) => vehicle.org?.id === form.orgId && vehicle.managed).length,
    [vehicles, form.orgId],
  );

  const movingOrg = !!currentEditingVehicle && currentEditingVehicle.org?.id !== form.orgId;
  const countsTowardTarget = currentEditingVehicle && !movingOrg && currentEditingVehicle.managed;
  const nextManagedCount = formOrgManagedCount
    + (form.managed && !countsTowardTarget ? 1 : 0)
    - (!form.managed && countsTowardTarget ? 1 : 0);
  const overCap = form.managed && (formPlan.limit === 0 || nextManagedCount > formPlan.limit);
  const atLimit = formPlan.limit === 0 || formOrgManagedCount >= formPlan.limit;

  function handleToggleManaged() {
    if (form.managed) {
      if (currentEditingVehicle?.activeCheckIn) {
        pushToast("warn", "This vehicle is currently in use. The driver must check out before you can deactivate Managed status.");
        return;
      }
      if (editingVehicle) {
        setVehicles((current) => current.map((item) => item.id === editingVehicle.id ? { ...item, managed: false, accessibleToAll: false } : item));
      }
      update("managed", false);
      return;
    }
    if (!form.orgId) {
      pushToast("warn", "Choose an organisation before making this a managed vehicle.");
      return;
    }
    if (atLimit) {
      pushToast("warn", `${orgById(form.orgId)?.name} has reached its plan limit of managed vehicles.`);
      return;
    }
    if (editingVehicle) {
      setVehicles((current) => current.map((item) => item.id === editingVehicle.id ? { ...item, managed: true } : item));
    }
    update("managed", true);
  }

  function setManagedState(vehicleId, nextManaged) {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle || vehicle.managed === nextManaged) return;
    if (!nextManaged) {
      if (vehicle.activeCheckIn) {
        pushToast("warn", "This vehicle is currently in use. The driver must check out before you can deactivate Managed status.");
        return;
      }
      setVehicles((current) => current.map((item) => item.id === vehicleId ? { ...item, managed: false } : item));
      setMenuId(null);
      pushToast("warn", "Managed status removed. Driver tab locked.");
      return;
    }
    const plan = planForOrg(vehicle.org?.id);
    const used = vehicles.filter((item) => item.org?.id === vehicle.org?.id && item.managed).length;
    if (plan.limit === 0 || used >= plan.limit) {
      pushToast("warn", `${vehicle.org?.name} has reached its plan limit of managed vehicles.`);
      return;
    }
    setVehicles((current) => current.map((item) => item.id === vehicleId ? { ...item, managed: true } : item));
    setMenuId(null);
    pushToast("ok", "Managed vehicle activated. Driver tab unlocked.");
  }

  /* ── Mutations ──────────────────────────────────────────── */

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

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.orgId) {
      pushToast("warn", "Organization is required.");
      return;
    }
    const targetOrg = orgById(form.orgId);

    if (detailsEditing) {
      const current = vehicles.find((item) => item.id === editingVehicle.id);
      if (!current) return;
      if (!form.managed && current.managed && current.activeCheckIn) {
        pushToast("warn", "This vehicle is currently in use. The driver must check out before you can deactivate Managed status.");
        return;
      }
      if (form.managed && overCap) {
        pushToast("warn", `${targetOrg?.name} has reached its plan limit of managed vehicles.`);
        return;
      }
      const moved = current.org?.id !== form.orgId;
      setVehicles((list) => list.map((item) => {
        if (item.id !== editingVehicle.id) return item;
        return {
          ...item,
          org: { id: targetOrg.id, name: targetOrg.name },
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
      pushToast("ok", moved ? `Vehicle moved to ${targetOrg.name}.` : "Vehicle updated.");
      return;
    }

    if (form.managed && overCap) {
      pushToast("warn", `${targetOrg?.name} has reached its plan limit of managed vehicles.`);
      return;
    }
    const id = `veh-${Date.now()}`;
    const created = {
      id,
      org: { id: targetOrg.id, name: targetOrg.name },
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
      documents: makeVehicleDocuments({ id, roadTax: null, insurance: null, puspakom: null, permit: null }),
      activeCheckIn: false,
      drivers: [],
      status: "Active",
    };
    setVehicles((current) => [created, ...current]);
    closeForm();
    pushToast("ok", `Vehicle created under ${targetOrg.name}.`);
  }

  const managedCount = filtered.filter((vehicle) => vehicle.managed).length;
  const reminderTier = formPlan.tier;

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <div className="ml-app">
      <HostTopBar />
      <HostSidebar active="myadmin" />
      <main className="ml-main hvl-main">
        {mode !== "list" ? (
          <>
            <VehiclePageHead mode={mode} vehicle={editingVehicle} onBack={closeForm} editing={detailsEditing} onShowQr={editingVehicle ? () => setQrOpen(true) : null} />
            {mode === "view" && (
              <div className="ml-tabs ovl-tabs-row">
                {VEHICLE_EDIT_TABS.map((tab) => (
                  <button key={tab.key} type="button" className={"ml-tab" + (editTab === tab.key ? " active" : "")} onClick={() => { setEditTab(tab.key); setDetailsEditing(false); }}>
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
                  scope={formPlan}
                  onSubmit={handleSubmit}
                  onToggleManaged={handleToggleManaged}
                  orgOptions={ORG_FORM_OPTIONS}
                />
                <VehicleFormEditBar mode={mode === "create" ? "create" : "edit"} onCancel={mode === "create" ? closeForm : cancelDetailsEdit} />
              </>
            ) : editTab === "details" ? (
              <VehicleViewSections form={form} nextManagedCount={nextManagedCount} scope={formPlan} onEdit={() => setDetailsEditing(true)} orgOptions={ORG_FORM_OPTIONS} />
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
            <div className="ml-page-head">
              <div>
                <h1 className="ml-h1">Vehicles</h1>

              </div>
              <button className="ml-btn-primary" type="button" onClick={openCreate}>
                <Icon name="add" size={16} color="#fff" /> Create vehicle
              </button>
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
                dateFilterCount={filterCount}
                hasClearableFilters={hasClearableFilters}
                onView={openDueDateView}
                onDelete={() => pushToast("warn", "Delete is shown for parity only. Open the vehicle Documents tab to delete this document with confirmation.")}
                onDocumentsChange={updateVehicleDocuments}
                onToast={(message) => pushToast("ok", message)}
                tier="enterprise"
                searchScopes={D.searchScopes}
                dueDateTypes={D.dueDateTypes}
                extraFilterFields={orgFilterField}
                extraHeadCells={<th>Organisation</th>}
                renderExtraCells={(vehicle) => <td><OrgCell org={vehicle.org} /></td>}
                rowFilter={(vehicle) => orgId === "all" || vehicle.org?.id === orgId}
              />
            ) : (
              <>
                <section className="ovl-toolbar">
                  <div className="hac-toolbar">
                    <div className="hac-toolbar-left ovl-toolbar-left">
                      <div className="hac-search-group scoped ovl-search-group">
                        <SelectMenu className="hac-search-scope" value={scope} options={D.searchScopes} onChange={(next) => { setScope(next); setPage(1); }} ariaLabel="Search by" style={{ width: "128px" }} />
                        <div className="hac-search-bar">
                          <Icon name="search" size={17} color="var(--fg-tertiary)" />
                          <input className="hac-search-input" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder={`Search by ${scope}`} />
                          {query && <button className="hac-search-clear" type="button" onClick={() => setQuery("")}><Icon name="close" size={16} /></button>}
                        </div>
                      </div>
                      <SelectMenu
                        className="hac-select"
                        value={statusFilter}
                        options={["All statuses", "In use", "Unused", "Inactive"]}
                        onChange={(next) => { setStatusFilter(next); setPage(1); }}
                        ariaLabel="Filter by status"
                      />
                      <button className={`hac-filter-btn${orgId !== "all" ? " active" : ""}`} type="button" onClick={toggleFilterPanel}>
                        <Icon name="tune" size={18} /> Filter{orgId !== "all" && <span className="hac-filter-badge">1</span>}
                      </button>
                    </div>

                    <div className="ovl-toolbar-right">
                      <label className={`ovl-managed-filter${managedOnly ? " active" : ""}`}>
                        <input type="checkbox" checked={managedOnly} onChange={() => { setManagedOnly((current) => !current); setPage(1); }} />
                        <span className="ovl-managed-filter-text">Managed Vehicles only</span>
                      </label>
                    </div>
                  </div>

                  {filterOpen && (
                    <div className="hac-filter-panel ovl-filter-panel">
                      <div className="hac-filter-grid ovl-filter-grid">{orgFilterField}</div>
                      <div className="hac-filter-actions">
                        <button className="hac-filter-apply" type="button" onClick={applyPendingFilters}>Apply Filters</button>
                        <button className="hac-filter-reset" type="button" onClick={resetFilters}>Reset All</button>
                      </div>
                    </div>
                  )}
                </section>

                <div className="hac-count">{filtered.length} Vehicle{filtered.length !== 1 ? "s" : ""} · {managedCount} managed</div>

                <section className="ovl-table-section">
                  <div className="ml-table-wrap ovl-table-wrap">
                    <table className="ml-table ovl-table hvl-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>No.</th>
                          <th>Vehicle</th>
                          <th>Organisation</th>
                          <th>Managed</th>
                          <th>Vehicle Category</th>
                          <th>Vendor</th>
                          <th className="ovl-col-right">Weight (BTM) <small>kg</small></th>
                          <th className="ovl-col-right">Total Weight (BDM) <small>kg</small></th>
                          <th className="ovl-col-right">Load Capacity <small>(kg)</small></th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!filtered.length && (
                          <tr><td colSpan="12"><div className="ovl-empty-table">No vehicles match the current filters.</div></td></tr>
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
                                <td><OrgCell org={vehicle.org} /></td>
                                <td><ManagedIcon managed={vehicle.managed} /></td>
                                <td>{vehicle.category}</td>
                                <td>{vehicle.vendor}</td>
                                <td className="ovl-col-right">{fmtNumber(vehicle.btm)}</td>
                                <td className="ovl-col-right">{fmtNumber(vehicle.bdm)}</td>
                                <td className="ovl-col-right">{fmtNumber(vehicle.capacity)}</td>
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
                                  <td className="ovl-expanded-cell" colSpan="12">
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
                    {pageData.map((vehicle) => (
                      <MobileListCard key={vehicle.id} className="ovl-vehicle-mobile-card"
                        leading={<VehicleThumb inUse={vehicle.activeCheckIn} category={vehicle.category} />}
                        title={vehicle.plate}
                        subtitle={vehicle.category}
                        status={<ManagedIcon managed={vehicle.managed} label />}
                        menu={<VehicleRowMenu
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
                        />}
                        meta={<span>{vehicle.org?.name} · {vehicle.vendor || "No vendor"}</span>}
                      >
                        <div className="ovl-vehicle-weights">
                          <div><span>BTM</span><strong>{vehicle.btm.toLocaleString()} kg</strong></div>
                          <div><span>BDM</span><strong>{vehicle.bdm.toLocaleString()} kg</strong></div>
                          <div><span>Capacity</span><strong>{vehicle.capacity.toLocaleString()} kg</strong></div>
                        </div>
                        <button className="ovl-mobile-expand" type="button" onClick={() => setMobileDriversVehicle(vehicle)}>
                          <span>{vehicle.accessibleToAll ? "All drivers can access" : `View ${vehicle.drivers.length} assigned driver${vehicle.drivers.length === 1 ? "" : "s"}`}</span>
                          <Icon name="chevron_right" size={16} />
                        </button>
                      </MobileListCard>
                    ))}
                    {!filtered.length && <div className="ovl-mobile-card"><div className="ovl-empty-table">No vehicles match the current filters.</div></div>}
                  </div>
                </section>

                <Pager page={page} perPage={perPage} total={filtered.length} onPage={setPage} onPerPage={setPerPage} />
              </>
            )}
          </>
        )}
      </main>

      {qrOpen && editingVehicle && <VehicleQrModal vehicle={editingVehicle} onClose={() => setQrOpen(false)} />}
      {driverPickerOpen && currentEditingVehicle && (
        <DriverPickerModal
          vehicle={currentEditingVehicle}
          onClose={() => setDriverPickerOpen(false)}
          onAdd={(drivers) => addDriversToVehicle(currentEditingVehicle.id, drivers)}
        />
      )}
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
      <div className="ovl-toast-stack">
        <div className="ovl-toast-col">
          {toasts.map((toast) => (
            <div className={`ovl-toast ${toast.tone}`} key={toast.id}>
              <Icon name={toast.tone === "warn" ? "warning" : "check_circle"} size={18} color={toast.tone === "warn" ? "#8A5A00" : "#fff"} />
              <div className="ovl-toast-msg">{toast.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

}
