const { useEffect, useMemo, useState, useRef } = React;
const { FeatureTabShell, SelectMenu } = window.SharedShell;

const {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_HISTORY,
  fmtRM,
  fmtDate,
  addDays,
  deepClone,
  cloneFeatureModules,
  serviceSummary,
  calculateMonthlyBilling,
} = window.SUB;

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const TIER_DURATION_OPTIONS = [1, 3, 6, 12, 24];

function buildUsageSummary(plan) {
  const organizations = plan.organizations || [];
  const services = serviceSummary(plan.featureModules || []);
  const vehicleCount = organizations.reduce((sum, org) => sum + Number(org.vehiclesUsed || 0), 0);
  const adminCount = organizations.reduce((sum, org) => sum + Number(org.adminsUsed || 0), 0);
  const driverCount = organizations.reduce((sum, org) => sum + Number(org.driverCount || 0), 0);
  const monthlyBilling = organizations.reduce((sum, org) => sum + calculateMonthlyBilling(plan, org.vehiclesUsed), 0);
  return {
    orgCount: organizations.length,
    vehicleCount,
    adminCount,
    driverCount,
    monthlyBilling,
    sampleVehicles: vehicleCount || (plan.limits.managedVehicleLimit == null ? 25 : Math.min(Number(plan.limits.managedVehicleLimit || 0), 12) || 8),
    services,
  };
}

function normalizeCommitmentOptions(options = []) {
  return options
    .map((option, index) => ({
      ...option,
      id: option.id || `tier-${index + 1}`,
      durationMonths: Number(option.durationMonths || 1),
      amount: Number(option.amount ?? option.discountedMonthlyPrice ?? 0),
      isTrial: !!option.isTrial,
    }))
    .sort((a, b) => a.durationMonths - b.durationMonths);
}

function syncPlanTrialFromTiers(plan) {
  const commitmentOptions = normalizeCommitmentOptions(plan.pricing?.commitmentOptions || []);
  const trialTier = commitmentOptions.find((option) => option.isTrial) || null;
  return {
    ...plan,
    pricing: {
      ...plan.pricing,
      commitmentOptions,
    },
    trial: {
      ...plan.trial,
      isTrial: !!trialTier,
      durationDays: trialTier ? trialTier.durationMonths * 30 : plan.trial.durationDays,
    },
  };
}

function decoratePlan(plan) {
  const syncedPlan = syncPlanTrialFromTiers(plan);
  const organizations = (syncedPlan.organizations || []).map((org) => ({
    ...org,
    monthlyBilling: calculateMonthlyBilling(syncedPlan, org.vehiclesUsed),
  }));
  const nextPlan = { ...syncedPlan, organizations };
  return { ...nextPlan, usageSummary: buildUsageSummary(nextPlan) };
}

function decoratePlans(plans) {
  return plans.map((plan) => decoratePlan(plan));
}

function makeEmptyPlan(plans) {
  return decoratePlan({
    id: `plan-normal-${Date.now()}`,
    name: "",
    description: "",
    status: "inactive",
    type: "normal",
    protectedPlan: false,
    version: 1,
    recommended: false,
    displayOrder: plans.length + 1,
    pricing: {
      setupFee: 0,
      waiveSetupFee: false,
      baseMonthlyFee: 0,
      perManagedVehicleFee: 0,
      commitmentOptions: [],
    },
    limits: {
      managedVehicleLimit: 10,
      adminUserLimit: 3,
      historyDepth: "6 months",
      reportDepth: "6 months",
    },
    trial: {
      isTrial: false,
      durationDays: 14,
      hideOnWebsite: false,
    },
    visibility: {
      showOnWebsite: true,
    },
    featureModules: cloneFeatureModules(),
    createdAt: "2026-07-07",
    organizations: [],
  });
}

function MetaBadge({ tone = "neutral", children }) {
  return <span className={`hsub-badge ${tone}`}>{children}</span>;
}

function StatusPill({ status }) {
  const label = STATUS_OPTIONS.find((item) => item.value === status)?.label || status;
  const tone = status === "active" ? "success" : "danger";
  return <MetaBadge tone={tone}>{label}</MetaBadge>;
}

function TypePill({ type }) {
  if (type === "default") {
    return (
      <MetaBadge tone="info">
        <HIcon name="lock" size={12} />
        Default
      </MetaBadge>
    );
  }
  return <MetaBadge tone="neutral">Normal</MetaBadge>;
}

function getPlanTypeDisplay(plan) {
  return plan.type === "default" ? "default" : "normal";
}

function formatTierDuration(months) {
  const value = Number(months || 0);
  return `${value} month${value === 1 ? "" : "s"}`;
}

function managedVehicleCeilingLabel(plan) {
  const limit = plan.limits.managedVehicleLimit;
  if (plan.visibility?.managedVehiclesIncluded === false) return "Managed vehicles not included";
  if (limit == null) return "Allows unlimited managed vehicles";
  if (Number(limit) <= 0) return "Managed vehicles not included";
  return `Allows up to ${Number(limit).toLocaleString("en-US")} managed vehicles`;
}

function hasManagedVehicleAccess(plan) {
  if (plan.visibility?.managedVehiclesIncluded === false) return false;
  return plan.limits.managedVehicleLimit == null || Number(plan.limits.managedVehicleLimit || 0) > 0;
}

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const datePart = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} ${timePart}`;
}

function buildTierPatch(plan, tiers) {
  const normalized = normalizeCommitmentOptions(tiers).map((tier, index) => ({
    ...tier,
    id: tier.id || `tier-${index + 1}`,
  }));
  const trialTier = normalized.find((tier) => tier.isTrial) || null;
  return {
    pricing: {
      ...plan.pricing,
      commitmentOptions: normalized,
    },
    trial: {
      ...plan.trial,
      isTrial: !!trialTier,
      durationDays: trialTier ? trialTier.durationMonths * 30 : plan.trial.durationDays,
    },
  };
}

function getBoundValue(plan, path) {
  if (!path) return undefined;
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), plan);
}

function buildBoundPatch(plan, path, value) {
  const parts = path.split(".");
  if (parts.length === 1) return { [path]: value };
  const [head, ...rest] = parts;
  const current = plan[head] || {};
  const nextNested = { ...current };
  let cursor = nextNested;
  let sourceCursor = current;
  for (let i = 0; i < rest.length - 1; i += 1) {
    const key = rest[i];
    cursor[key] = { ...(sourceCursor?.[key] || {}) };
    cursor = cursor[key];
    sourceCursor = sourceCursor?.[key];
  }
  cursor[rest[rest.length - 1]] = value;
  return { [head]: nextNested };
}

function FeatureSummary({ plan }) {
  const services = plan.usageSummary.services;
  if (!services.moduleCount) return <span className="hsub-muted">No feature access configured</span>;
  const chips = services.modules.slice(0, 3);
  const rest = services.modules.slice(3);
  const remainder = rest.length;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const linkRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (linkRef.current && linkRef.current.contains(e.target)) return;
      if (popRef.current && popRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const dismiss = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open && linkRef.current) {
      const r = linkRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen((value) => !value);
  };

  return (
    <div className="hsub-service-summary">
      {chips.map((chip) => <span key={chip} className="hsub-service-chip">{chip}</span>)}
      {remainder > 0 && (
        <>
          <button className="hsub-more-link" ref={linkRef} onClick={toggle}>
            +{remainder} more
          </button>
          {open && ReactDOM.createPortal(
            <div className="hsub-more-pop" ref={popRef} style={{ top: pos.top, left: pos.left }} onClick={(e) => e.stopPropagation()}>
              <div className="hsub-more-pop-head">{services.moduleCount} service{services.moduleCount !== 1 ? "s" : ""}</div>
              {rest.map((service) => (
                <div key={service} className="hsub-more-pop-item">
                  <HIcon name="widgets" size={14} color="var(--fg-tertiary)" />
                  {service}
                </div>
              ))}
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}

function ActionBanner({ flash, onDismiss }) {
  if (!flash) return null;
  return (
    <div className={`hsub-alert ${flash.tone || "info"}`}>
      <div>{flash.message}</div>
      <button className="ml-icon-btn" onClick={onDismiss} aria-label="Dismiss message">
        <HIcon name="close" size={18} />
      </button>
    </div>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="hac-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="hac-modal">
        <div className="hac-modal-drag" />
        <div className="hac-modal-head">
          <span className="hac-modal-title">{title}</span>
          <button className="hac-modal-close" onClick={onClose}><HIcon name="cancel" size={22} fill={1} color="var(--fg-disabled)" /></button>
        </div>
        <div className="hac-modal-divider" />
        <div className="hac-modal-body" style={{ paddingBottom: 20 }}>{children}</div>
        {footer && <div className="hac-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function SwitchField({ checked, onChange, label, ariaLabel }) {
  return (
    <button
      type="button"
      className={"hsub-switch" + (checked ? " active" : "")}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || label}
      onClick={() => onChange(!checked)}
    >
      <span className="hsub-switch-track">
        <span className="hsub-switch-thumb" />
      </span>
      {label && <span className="hsub-switch-label">{label}</span>}
    </button>
  );
}

function EllipsisMenu({ onView, onEdit, onDelete, onActivate, onDeactivate, canDelete, deleteReason, canActivate, canDeactivate }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const DROP_W = 170;

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (dropRef.current && dropRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const dismiss = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.right - DROP_W });
    }
    setOpen((v) => !v);
  };

  return (
    <div className="hac-ellipsis">
      <button className="ml-icon-btn" ref={btnRef} onClick={toggle} aria-label="More actions">
        <HIcon name="more_horiz" size={18} />
      </button>
      {open && ReactDOM.createPortal(
        <div className="hac-drop-fixed" ref={dropRef} style={{ top: pos.top, left: pos.left }} onClick={(e) => e.stopPropagation()}>
          <button className="hac-drop-item" onClick={() => { setOpen(false); onView(); }}><HIcon name="visibility" size={15} /> View</button>
          <button className="hac-drop-item" onClick={() => { setOpen(false); onEdit(); }}><HIcon name="edit" size={15} /> Edit</button>
          {canActivate && (
            <button className="hac-drop-item" onClick={() => { setOpen(false); onActivate(); }}><HIcon name="check_circle" size={15} /> Activate</button>
          )}
          {canDeactivate && (
            <button className="hac-drop-item" onClick={() => { setOpen(false); onDeactivate(); }}><HIcon name="block" size={15} /> Deactivate</button>
          )}
          {canDelete ? (
            <button className="hac-drop-item danger" onClick={() => { setOpen(false); onDelete(); }}><HIcon name="delete" size={15} /> Delete</button>
          ) : (
            <button className="hac-drop-item disabled" disabled title={deleteReason}><HIcon name="delete" size={15} /> Delete</button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

function TierItemMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const DROP_W = 160;

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (dropRef.current && dropRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const dismiss = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  const toggle = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.right - DROP_W });
    }
    setOpen((v) => !v);
  };

  return (
    <div className="hac-ellipsis">
      <button className="ml-icon-btn" ref={btnRef} onClick={toggle} aria-label="Tier actions">
        <HIcon name="more_horiz" size={18} />
      </button>
      {open && ReactDOM.createPortal(
        <div className="hac-drop-fixed" ref={dropRef} style={{ top: pos.top, left: pos.left }} onClick={(e) => e.stopPropagation()}>
          <button className="hac-drop-item" onClick={() => { setOpen(false); onEdit(); }}><HIcon name="edit" size={15} /> Edit</button>
          <button className="hac-drop-item danger" onClick={() => { setOpen(false); onDelete(); }}><HIcon name="delete" size={15} color="currentColor" /> Delete</button>
        </div>,
        document.body
      )}
    </div>
  );
}

function Section({ title, right, children }) {
  return (
    <div className="ml-card hsub-card">
      <div className="hac-sec-header">
        <div className="hac-sec-header-row">
          <div>
            <div>{title}</div>
          </div>
          {right}
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="hac-fg">
      <label className="hac-label">{label}</label>
      {children}
      {hint && <span className="hac-field-hint">{hint}</span>}
    </div>
  );
}

function ViewField({ label, value, hint, info }) {
  return (
    <div className="hac-fg hsub-view-field">
      {info ? (
        <label className="hac-label hsub-label-with-info">
          <span>{label}</span>
          <span className="ml-tooltip-wrap hsub-info-wrap" tabIndex={0}>
            <span className="hsub-info-trigger" aria-label={`${label} help`}>
              <HIcon name="info" size={14} color="var(--fg-tertiary)" />
            </span>
            <span className="ml-tooltip hsub-info-tooltip">{info}</span>
          </span>
        </label>
      ) : (
        <label className="hac-label">{label}</label>
      )}
      <div className="hac-view-val">{value}</div>
      {hint && <span className="hac-field-hint">{hint}</span>}
    </div>
  );
}

function PlanListView({ plans, onCreate, onView, onEdit, onDelete, onActivate, onDeactivate }) {
  const [q, setQ] = useState("");
  const [scope, setScope] = useState("name");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingStatus, setPendingStatus] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pendingType, setPendingType] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    let list = plans;
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      list = list.filter((plan) => {
        if (scope === "service") return plan.usageSummary.services.modules.join(" ").toLowerCase().includes(query);
        return plan.name.toLowerCase().includes(query);
      });
    }
    if (statusFilter !== "all") list = list.filter((plan) => plan.status === statusFilter);
    if (typeFilter !== "all") list = list.filter((plan) => getPlanTypeDisplay(plan) === typeFilter);
    return list;
  }, [plans, q, scope, statusFilter, typeFilter]);

  const pageData = filtered.slice((page - 1) * perPage, page * perPage);
  const activeCount = Number(statusFilter !== "all") + Number(typeFilter !== "all");
  const hasFilters = activeCount > 0;

  const applyFilters = () => {
    setStatusFilter(pendingStatus);
    setTypeFilter(pendingType);
    setPage(1);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setPendingStatus("all");
    setPendingType("all");
    setStatusFilter("all");
    setTypeFilter("all");
    setPage(1);
  };

  return (
    <div>
      <div className="ml-page-head">
        <div>
          <div className="ml-h1">Subscriptions</div>
          <div className="hsub-page-sub">Configure plans, pricing, and plan access for organizations.</div>
        </div>
      </div>

      <div className="hac-toolbar">
        <div className="hac-toolbar-left">
          <div className="hac-search-group scoped">
            <SelectMenu
              className="hac-search-scope"
              value={scope}
              options={[
                { value: "name", label: "Plan" },
                { value: "service", label: "Services" },
              ]}
              onChange={(next) => { setScope(next); setPage(1); }}
              ariaLabel="Search by"
              style={{ width: scope === "name" ? "108px" : "128px" }}
            />
            <div className="hac-search-bar">
              <HIcon name="search" size={18} color="var(--fg-tertiary)" />
              <input
                className="hac-search-input"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder={scope === "name" ? "Search by plan name" : "Search by module or feature"}
              />
              {q && (
                <button className="hac-search-clear" onClick={() => { setQ(""); setPage(1); }}>
                  <HIcon name="close" size={16} color="var(--fg-tertiary)" />
                </button>
              )}
            </div>
          </div>
          <button className={"hac-filter-btn" + (hasFilters ? " active" : "")} onClick={() => setFilterOpen((v) => !v)}>
            <HIcon name="tune" size={18} /> Filter
            {activeCount > 0 && <span className="hac-filter-badge">{activeCount}</span>}
          </button>
        </div>
        <button className="hac-create-btn" onClick={onCreate}>
          <HIcon name="add" size={16} color="#fff" /> Create Subscription
        </button>
      </div>

      {filterOpen && (
        <div className="hac-filter-panel">
          <div className="hac-filter-grid">
            <div className="hac-filter-field">
              <label>Status</label>
              <div className="hac-select-wrap">
                <SelectMenu
                  className="hac-select"
                  value={pendingStatus}
                  options={[
                    { value: "all", label: "All statuses" },
                    ...STATUS_OPTIONS,
                  ]}
                  onChange={setPendingStatus}
                  ariaLabel="Filter by status"
                />
              </div>
            </div>
            <div className="hac-filter-field">
              <label>Type</label>
              <div className="hac-select-wrap">
                <SelectMenu
                  className="hac-select"
                  value={pendingType}
                  options={[
                    { value: "all", label: "All types" },
                    { value: "default", label: "Default" },
                    { value: "normal", label: "Normal" },
                  ]}
                  onChange={setPendingType}
                  ariaLabel="Filter by type"
                />
              </div>
            </div>
            <div className="hac-filter-actions hsub-filter-actions-inline">
              <button className="hac-filter-apply" onClick={applyFilters}>Apply Filters</button>
              <button className="hac-filter-reset" onClick={resetFilters}>Reset All</button>
            </div>
          </div>
        </div>
      )}

      <div className="hac-count">{filtered.length} Subscription Plan{filtered.length !== 1 ? "s" : ""}</div>

      <div className="ml-table-wrap">
        <table className="ml-table hsub-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Plan name</th>
              <th>Services</th>
              <th>Type</th>
              <th>Version</th>
              <th>Status</th>
              <th>Creation date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((plan, index) => {
              const isDefaultPlan = plan.type === "default";
              const canActivate = !isDefaultPlan && plan.status === "inactive";
              const canDeactivate = !isDefaultPlan && plan.status === "active";
              const canDelete = !isDefaultPlan && plan.status === "inactive";
              const deleteReason = isDefaultPlan
                ? "Default plans cannot be deleted."
                : "Deactivate this plan before deleting it.";
              const typeDisplay = getPlanTypeDisplay(plan);
              return (
                <tr key={plan.id} onClick={() => onView(plan.id)}>
                  <td className="ml-mono">{(page - 1) * perPage + index + 1}</td>
                  <td>
                    <div className="hsub-name-cell">
                      <span className="ml-cell-main">{plan.name}</span>
                    </div>
                  </td>
                  <td><FeatureSummary plan={plan} /></td>
                  <td><TypePill type={typeDisplay} /></td>
                  <td className="ml-mono">v{plan.version}</td>
                  <td><StatusPill status={plan.status} /></td>
                  <td className="ml-mono">{fmtDate(plan.createdAt)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <EllipsisMenu
                      canDelete={canDelete}
                      deleteReason={deleteReason}
                      canActivate={canActivate}
                      canDeactivate={canDeactivate}
                      onView={() => onView(plan.id)}
                      onEdit={() => onEdit(plan.id)}
                      onDelete={() => onDelete(plan.id)}
                      onActivate={() => onActivate(plan.id)}
                      onDeactivate={() => onDeactivate(plan.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <HPager page={page} perPage={perPage} total={filtered.length} onPage={setPage} onPerPage={setPerPage} />
    </div>
  );
}

function BasicDetailsSection({ plan, editable, onChange }) {
  return (
    <Section title="Basic details">
      {editable ? (
        <>
          <div className="hac-form-grid">
            <Field label="Subscription title">
              <input className="hac-input" value={plan.name} onChange={(e) => onChange({ name: e.target.value })} />
            </Field>
            <Field label="Display order">
              <input
                className="hac-input"
                type="number"
                min="1"
                value={plan.displayOrder}
                onChange={(e) => onChange({ displayOrder: Number(e.target.value || 0) })}
              />
            </Field>
          </div>
          <div className="hsub-stack-spacer" />
          <Field label="Description" hint={`${plan.description.length}/500`}>
            <textarea
              className="hac-input hsub-textarea"
              maxLength="500"
              value={plan.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Explain who this plan is for and what makes it different."
            />
          </Field>
        </>
      ) : (
        <div className="hac-detail-grid hac-view-grid">
          <ViewField label="Subscription title" value={plan.name} />
          <ViewField label="Display order" value={plan.displayOrder} />
          <ViewField label="Description" value={plan.description || "—"} />
        </div>
      )}
    </Section>
  );
}

function PricingSection({ plan, editable, onChange }) {
  const setupFee = Number(plan.pricing.setupFee || 0);
  const baseMonthlyFee = Number(plan.pricing.baseMonthlyFee || 0);
  const perManagedVehicleFee = Number(plan.pricing.perManagedVehicleFee || 0);
  const sampleVehicles = Number(plan.usageSummary.sampleVehicles || 0);
  const preview = baseMonthlyFee + sampleVehicles * perManagedVehicleFee;
  const previewBreakdown = `${fmtRM(baseMonthlyFee)} base monthly fee + ${sampleVehicles} managed vehicles × ${fmtRM(perManagedVehicleFee)} per managed vehicle`;
  return (
    <Section title="Pricing">
      {editable ? (
        <>
          <div className="hsub-price-grid">
            <div className="hsub-price-card">
              <Field label="Setup fee" hint="Charged once when the org starts on this plan.">
                <input
                  className="hac-input"
                  type="number"
                  min="0"
                  value={plan.pricing.setupFee}
                  onChange={(e) => onChange({ pricing: { ...plan.pricing, setupFee: Number(e.target.value || 0) } })}
                />
              </Field>

            </div>
            <div className="hsub-price-card">
              <Field label="Base monthly fee" hint="Charged once per organization, per month.">
                <input
                  className="hac-input"
                  type="number"
                  min="0"
                  value={plan.pricing.baseMonthlyFee}
                  onChange={(e) => onChange({ pricing: { ...plan.pricing, baseMonthlyFee: Number(e.target.value || 0) } })}
                />
              </Field>
            </div>
            <div className="hsub-price-card">
              <Field label="Per managed vehicle fee" hint="Charged for each active managed vehicle.">
                <input
                  className="hac-input"
                  type="number"
                  min="0"
                  value={plan.pricing.perManagedVehicleFee}
                  onChange={(e) => onChange({ pricing: { ...plan.pricing, perManagedVehicleFee: Number(e.target.value || 0) } })}
                />
              </Field>
            </div>
          </div>
          <div className="hsub-billing-preview">
            <strong>Estimated monthly billing</strong>
            <span>{fmtRM(baseMonthlyFee)} + {sampleVehicles} managed vehicles × {fmtRM(perManagedVehicleFee)} = <b>{fmtRM(preview)}</b></span>
          </div>
          <EditableSubscriptionTiers plan={plan} onChange={onChange} title="Pricing tiers" />
        </>
      ) : (
        <>
          <div className="hac-detail-grid hac-view-grid">
            <ViewField label="Setup fee" value={fmtRM(setupFee)} />
            <ViewField label="Base monthly fee" value={fmtRM(baseMonthlyFee)} />
            <ViewField label="Per managed vehicle fee" value={fmtRM(perManagedVehicleFee)} />
            <ViewField
              label="Estimated monthly billing"
              value={fmtRM(preview)}
              info={previewBreakdown}
            />
          </div>
          <ReadOnlySubscriptionTiers plan={plan} title="Pricing tiers" />
        </>
      )}
    </Section>
  );
}

function SubscriptionTierModal({ tier, onClose, onSave }) {
  const isEdit = !!tier;
  const [durationMonths, setDurationMonths] = useState(String(tier?.durationMonths || TIER_DURATION_OPTIONS[0]));
  const [amount, setAmount] = useState(String(tier?.amount ?? ""));
  const [isTrial, setIsTrial] = useState(!!tier?.isTrial);
  const canSave = durationMonths.trim() !== "" && amount.trim() !== "";

  const save = () => {
    if (!canSave) return;
    onSave({
      id: tier?.id || `tier-${Date.now()}`,
      durationMonths: Number(durationMonths),
      amount: Number(amount),
      isTrial,
    });
    onClose();
  };

  return (
    <Modal
      title={`${isEdit ? "Edit" : "Add"} Tier`}
      onClose={onClose}
      footer={
        <>
          <button className="hac-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="hac-modal-save" disabled={!canSave} onClick={save}>Save</button>
        </>
      }
    >
      <div className="hsub-tier-modal-row">
        <label className="hac-label req" style={{ fontSize: 14 }}>Duration*</label>
        <label className="hac-check-row">
          <input type="checkbox" checked={isTrial} onChange={(e) => setIsTrial(e.target.checked)} />
          <span>Set as trial</span>
        </label>
      </div>
      <div className="hac-select-wrap">
        <SelectMenu
          className="hac-select"
          value={durationMonths}
          options={TIER_DURATION_OPTIONS.map((option) => ({ value: String(option), label: formatTierDuration(option) }))}
          onChange={setDurationMonths}
          ariaLabel="Tier duration"
        />
      </div>
      <div className="hac-field-hint" style={{ marginBottom: 18 }}>Choose how long this pricing tier applies.</div>

      <div className="hac-fg">
        <label className="hac-label req" style={{ fontSize: 14 }}>Amount*</label>
        <input
          className="hac-input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter tier amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
    </Modal>
  );
}

function EditableSubscriptionTiers({ plan, onChange, title = null }) {
  const tiers = normalizeCommitmentOptions(plan.pricing.commitmentOptions || []);
  const [modal, setModal] = useState(null);

  const close = () => setModal(null);
  const saveTier = (tier) => {
    const nextTiers = modal?.editIndex == null
      ? [...tiers, tier]
      : tiers.map((item, index) => index === modal.editIndex ? tier : item);
    const normalized = normalizeCommitmentOptions(nextTiers).map((item) => ({
      ...item,
      isTrial: tier.isTrial ? item.id === tier.id : item.isTrial,
    }));
    onChange(buildTierPatch(plan, normalized));
  };
  const removeTier = (index) => {
    onChange(buildTierPatch(plan, tiers.filter((_, tierIndex) => tierIndex !== index)));
  };

  return (
    <div>
      <div className="hsub-tier-toolbar">
        {title && <div className="hsub-inline-section-head hsub-inline-section-head-tight">{title}</div>}
        <button className="hac-add-tier-btn" onClick={() => setModal({ editIndex: null })}>
          <HIcon name="add" size={15} /> Add Tier
        </button>
      </div>

      {tiers.length === 0 ? (
        <div className="hac-tier-empty">
          <span><HIcon name="error" size={15} /> Tier 1</span>
          Add at least one tier for this subscription plan.
        </div>
      ) : (
        <div className="hsub-tier-stack is-edit">
          {tiers.map((tier, index) => (
            <div className="hsub-tier-stack-card" key={tier.id || index}>
              <div className="hsub-tier-stack-id">
                <div className="hsub-tier-item-label">
                  <HIcon name="stacked_bar_chart" size={16} color="var(--navy-800)" />
                  Tier {index + 1}
                  {tier.isTrial && <span className="hsub-badge warning">Trial</span>}
                </div>
              </div>
              <div className="hsub-tier-stack-field">
                <span className="ml-k">Duration</span>
                <b>{formatTierDuration(tier.durationMonths)}</b>
              </div>
              <div className="hsub-tier-stack-field">
                <span className="ml-k">Amount</span>
                <b>{fmtRM(tier.amount)}</b>
              </div>
              <TierItemMenu
                onEdit={() => setModal({ editIndex: index })}
                onDelete={() => removeTier(index)}
              />
            </div>
          ))}
        </div>
      )}

      {tiers.some((tier) => tier.isTrial) && (
        <div className="hsub-tier-foot">
          <SwitchField
            checked={plan.trial.hideOnWebsite}
            onChange={(value) => onChange({ trial: { ...plan.trial, hideOnWebsite: value } })}
            label="Hide trial tier on website"
          />
        </div>
      )}

      {modal && ReactDOM.createPortal(
        <SubscriptionTierModal
          tier={modal.editIndex == null ? null : tiers[modal.editIndex]}
          onClose={close}
          onSave={saveTier}
        />,
        document.body
      )}
    </div>
  );
}

function ReadOnlySubscriptionTiers({ plan, title = null }) {
  const tiers = normalizeCommitmentOptions(plan.pricing.commitmentOptions || []);
  if (tiers.length === 0) {
    return <div className="hsub-muted">No tiers configured for this plan.</div>;
  }
  return (
    <>
      {title && <div className="hsub-inline-section-head">{title}</div>}
      <div className="hsub-tier-stack">
        {tiers.map((tier, index) => (
          <div className="hsub-tier-stack-card" key={tier.id || index}>
            <div className="hsub-tier-stack-id">
              <div className="hsub-tier-item-label">
                <HIcon name="stacked_bar_chart" size={16} color="var(--navy-800)" />
                Tier {index + 1}
                {tier.isTrial && <span className="hsub-badge warning">Trial</span>}
              </div>
            </div>
            <div className="hsub-tier-stack-field">
              <span className="ml-k">Duration</span>
              <b>{formatTierDuration(tier.durationMonths)}</b>
            </div>
            <div className="hsub-tier-stack-field">
              <span className="ml-k">Amount</span>
              <b>{fmtRM(tier.amount)}</b>
            </div>
          </div>
        ))}
      </div>
      {tiers.some((tier) => tier.isTrial) && (
        <div className="hsub-tier-foot hsub-tier-foot-read">
          <span className="ml-k">Hide trial tier on website</span>
          <b>{plan.trial.hideOnWebsite ? "Yes" : "No"}</b>
        </div>
      )}
    </>
  );
}

function FeatureAccessSection({ plan, editable, onChange }) {
  const [activeModuleKey, setActiveModuleKey] = useState(plan.featureModules[0]?.key || "myfuel");

  useEffect(() => {
    if (!plan.featureModules.some((module) => module.key === activeModuleKey)) {
      setActiveModuleKey(plan.featureModules[0]?.key || "myfuel");
    }
  }, [plan.featureModules, activeModuleKey]);

  const getRowValue = (row) => row.bindPath ? getBoundValue(plan, row.bindPath) : row.value;
  const isRowEnabled = (row) => row.controlType === "toggle" ? !!getRowValue(row) : (row.toggleable ? !!row.enabled : true);

  const updateRow = (moduleKey, rowKey, nextValue) => {
    const nextModules = plan.featureModules.map((module) => {
      if (module.key !== moduleKey) return module;
      return {
        ...module,
        rows: module.rows.map((row) => row.key === rowKey ? { ...row, value: nextValue } : row),
      };
    });
    const row = plan.featureModules
      .find((module) => module.key === moduleKey)
      ?.rows.find((item) => item.key === rowKey);
    const nextPatch = row?.bindPath ? buildBoundPatch(plan, row.bindPath, nextValue) : {};
    onChange({ ...nextPatch, featureModules: nextModules });
  };

  const updateRowEnabled = (moduleKey, rowKey, enabled) => {
    const nextModules = plan.featureModules.map((module) => {
      if (module.key !== moduleKey) return module;
      return {
        ...module,
        rows: module.rows.map((row) => row.key === rowKey ? { ...row, enabled } : row),
      };
    });
    onChange({ featureModules: nextModules });
  };

  const activeModule = plan.featureModules.find((module) => module.key === activeModuleKey) || plan.featureModules[0];
  const tabs = plan.featureModules.map((module) => ({ key: module.key, label: module.label }));

  return (
    <Section title="Feature access">
      <FeatureTabShell tabs={tabs} activeKey={activeModuleKey} onSelect={setActiveModuleKey}>
        {activeModule && (
          <div key={activeModule.key}>
            <div className="hsub-module-head">
              <div className="hsub-module-title">{activeModule.label}</div>
              <div className="hsub-module-copy">{activeModule.summary}</div>
            </div>
            <div className="hsub-module-rows">
              {activeModule.rows.map((row) => (
                <div className={"hsub-module-row" + (row.toggleable ? " has-inline-config" : "")} key={row.key}>
                  <div className="hsub-module-row-copy">
                    <div className="hsub-module-row-title">{row.label}</div>
                    {row.helper && <div className="hsub-module-row-sub">{row.helper}</div>}
                  </div>
                  <div className="hsub-module-row-control">
                    {editable ? (
                      row.controlType === "toggle" ? (
                        <SwitchField
                          checked={!!getRowValue(row)}
                          onChange={(value) => updateRow(activeModule.key, row.key, value)}
                          ariaLabel={row.label}
                        />
                      ) : row.toggleable ? (
                        <div className="hsub-module-control-stack">
                          <SwitchField
                            checked={isRowEnabled(row)}
                            onChange={(value) => updateRowEnabled(activeModule.key, row.key, value)}
                            ariaLabel={row.label}
                          />
                          {isRowEnabled(row) ? (
                            row.controlType === "select" ? (
                              <div className="hac-select-wrap hsub-inline-select-wrap">
                                <SelectMenu
                                  className="hac-select hsub-inline-select"
                                  value={getRowValue(row)}
                                  options={row.options.map((option) => ({ value: option, label: option }))}
                                  onChange={(next) => updateRow(activeModule.key, row.key, next)}
                                  ariaLabel={row.label}
                                />
                              </div>
                            ) : (
                              <input className="hac-input hsub-mini-input" type="number" min={row.min ?? 0} value={getRowValue(row)} onChange={(e) => updateRow(activeModule.key, row.key, Number(e.target.value || 0))} />
                            )
                          ) : null}
                        </div>
                      ) : row.controlType === "select" ? (
                        <div className="hac-select-wrap">
                          <SelectMenu
                            className="hac-select"
                            value={getRowValue(row)}
                            options={row.options.map((option) => ({ value: option, label: option }))}
                            onChange={(next) => updateRow(activeModule.key, row.key, next)}
                            ariaLabel={row.label}
                          />
                        </div>
                      ) : row.hasUnlimited ? (
                        <div className="hsub-module-control-stack">
                          <SwitchField
                            checked={getRowValue(row) == null}
                            onChange={(value) => updateRow(activeModule.key, row.key, value ? null : (row.value ?? 1))}
                            label="Unlimited"
                            ariaLabel={row.label}
                          />
                          <input
                            className="hac-input hsub-mini-input"
                            type="number"
                            min={row.min ?? 0}
                            value={getRowValue(row) == null ? "" : getRowValue(row)}
                            disabled={getRowValue(row) == null}
                            onChange={(e) => updateRow(activeModule.key, row.key, Number(e.target.value || 0))}
                          />
                        </div>
                      ) : (
                        <input className="hac-input hsub-mini-input" type="number" min={row.min ?? 0} value={getRowValue(row)} onChange={(e) => updateRow(activeModule.key, row.key, Number(e.target.value || 0))} />
                      )
                    ) : (
                        <div className="hsub-module-readout">
                          {row.controlType === "toggle"
                            ? (getRowValue(row) ? "Enabled" : "Disabled")
                            : (isRowEnabled(row)
                              ? (row.hasUnlimited && getRowValue(row) == null ? "Unlimited" : getRowValue(row))
                              : "Disabled")}
                        </div>
                    )}
                  </div>
                </div>
              ))}
              {activeModule.key === "myadmin" && (
                <div className="hsub-module-note">
                  Managed vehicle number is set in Organization Management. This plan {managedVehicleCeilingLabel(plan).toLowerCase()}.
                </div>
              )}
            </div>
          </div>
        )}
      </FeatureTabShell>
    </Section>
  );
}

function ConfigurationView({ plan, editable, onChange }) {
  return (
    <div className="hac-detail-sections">
      <BasicDetailsSection plan={plan} editable={editable} onChange={onChange} />
      <PricingSection plan={plan} editable={editable} onChange={onChange} />
      <FeatureAccessSection plan={plan} editable={editable} onChange={onChange} />
    </div>
  );
}

function SubscriptionHistoryTable({ plan }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const entries = useMemo(
    () => (SUBSCRIPTION_HISTORY || []).filter((item) => item.planId === plan.id).sort((a, b) => new Date(b.changeTime) - new Date(a.changeTime)),
    [plan.id]
  );
  const pageData = entries.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      {entries.length === 0 ? (
        <div className="hac-empty-state">No subscription history available for this plan.</div>
      ) : (
        <>
          <div className="hac-count">{entries.length} history record{entries.length !== 1 ? "s" : ""}</div>
          <div className="ml-table-wrap">
            <table className="ml-table hsub-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Change type</th>
                  <th>Changed by</th>
                  <th>Change time</th>
                  <th>Changelog</th>
                  <th>Version</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="ml-mono">{(page - 1) * perPage + index + 1}</td>
                    <td>
                      <MetaBadge tone={item.changeType === "create" ? "info" : "neutral"}>
                        {item.changeType === "create" ? "Create" : "Update"}
                      </MetaBadge>
                    </td>
                    <td>{item.changedBy}</td>
                    <td className="ml-mono">{fmtDateTime(item.changeTime)}</td>
                    <td>
                      <a
                        className="ml-btn-text-blue"
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        style={{ fontSize: 13 }}
                      >
                        JSON file
                      </a>
                    </td>
                    <td className="ml-mono">v{item.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <HPager page={page} perPage={perPage} total={entries.length} onPage={setPage} onPerPage={setPerPage} />
        </>
      )}
    </div>
  );
}

function PlanPageHead({ mode, plan, onBack, onEdit, onDelete, canDelete }) {
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const title = isCreate ? "Create subscription plan" : isEdit ? `Edit ${plan.name}` : plan.name;
  const subtitle = isCreate
    ? "Configure pricing, tiers, and feature access for this plan."
    : isEdit
      ? "Adjust plan rules, pricing, tiers, and feature access."
      : null;

  return (
    <div className="ml-page-head">
      <div>
        <div className="hac-breadcrumb">
          <button className="hac-bc-link" onClick={onBack}>Subscriptions</button>
          <HIcon name="chevron_right" size={16} color="var(--fg-tertiary)" />
          <span>{isCreate ? "Create plan" : isEdit ? "Edit plan" : "Plan detail"}</span>
        </div>
        <div className="ml-h1">{title}</div>
        {subtitle && <div className="hsub-page-sub">{subtitle}</div>}
      </div>
      {!isCreate && !isEdit && (
        <div className="hsub-head-actions">
          <button className="ml-btn-outline" onClick={onEdit}><HIcon name="edit" size={16} /> Edit plan</button>
          {canDelete ? (
            <button className="ml-btn-outline hsub-danger-btn" onClick={onDelete}><HIcon name="delete" size={16} /> Delete</button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function SubscriptionApp() {
  const [plans, setPlans] = useState(() => decoratePlans(deepClone(SUBSCRIPTION_PLANS)));
  const [mode, setMode] = useState("list");
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [draftPlan, setDraftPlan] = useState(null);
  const [flash, setFlash] = useState(null);
  const [deletePlanId, setDeletePlanId] = useState(null);
  const [viewTab, setViewTab] = useState("details");

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 5000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId) || null, [plans, selectedPlanId]);
  const workingPlan = mode === "create" || mode === "edit" ? draftPlan : selectedPlan;

  const setPlanPatch = (patch) => {
    setDraftPlan((current) => decoratePlan({ ...current, ...patch }));
  };

  const openList = () => {
    setMode("list");
    setSelectedPlanId(null);
    setDraftPlan(null);
  };

  const openView = (planId) => {
    setSelectedPlanId(planId);
    setMode("view");
    setDraftPlan(null);
    setViewTab("details");
  };

  const openCreate = () => {
    setMode("create");
    setSelectedPlanId(null);
    setDraftPlan(makeEmptyPlan(plans));
  };

  const openEdit = (planId) => {
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;
    setSelectedPlanId(planId);
    setMode("edit");
    setDraftPlan(decoratePlan(deepClone(plan)));
  };

  const canDeletePlan = (plan) => plan.type !== "default" && plan.status === "inactive";

  const saveDraft = () => {
    if (!draftPlan?.name?.trim()) {
      setFlash({ tone: "danger", message: "Subscription title is required before saving." });
      return;
    }
    if (mode === "create") {
      const next = decoratePlan({ ...draftPlan, createdAt: draftPlan.createdAt || "2026-07-07" });
      setPlans((current) => decoratePlans([...current, next]));
      setFlash({ tone: "success", message: `${draftPlan.name} created successfully.` });
      setSelectedPlanId(next.id);
      setMode("view");
      setDraftPlan(null);
      return;
    }
    setPlans((current) => decoratePlans(current.map((plan) => plan.id === draftPlan.id ? draftPlan : plan)));
    setFlash({ tone: "success", message: `${draftPlan.name} saved successfully.` });
    setMode("view");
    setDraftPlan(null);
  };

  const removePlan = (planId) => {
    const plan = plans.find((item) => item.id === planId);
    if (!plan) return;
    if (!canDeletePlan(plan)) {
      setFlash({ tone: "warning", message: "Delete is only available for inactive non-default plans. Deactivate the plan first." });
      return;
    }
    setDeletePlanId(planId);
  };

  const confirmDeletePlan = () => {
    const plan = plans.find((item) => item.id === deletePlanId);
    if (!plan) {
      setDeletePlanId(null);
      return;
    }
    setPlans((current) => current.filter((item) => item.id !== deletePlanId));
    setFlash({ tone: "success", message: `${plan.name} deleted.` });
    setDeletePlanId(null);
    openList();
  };

  const deactivatePlan = (planId) => {
    setPlans((current) => decoratePlans(current.map((plan) => plan.id === planId ? { ...plan, status: "inactive" } : plan)));
    const plan = plans.find((item) => item.id === planId);
    setFlash({ tone: "warning", message: `${plan?.name || "Plan"} set to inactive.` });
  };

  const activatePlan = (planId) => {
    setPlans((current) => decoratePlans(current.map((plan) => plan.id === planId ? { ...plan, status: "active" } : plan)));
    const plan = plans.find((item) => item.id === planId);
    setFlash({ tone: "success", message: `${plan?.name || "Plan"} set to active.` });
  };

  return (
    <div className="ml-app">
      <HostTopBar />
      <HostSidebar active="subscription" />
      <main className="ml-main hsub-main">
        <ActionBanner flash={flash} onDismiss={() => setFlash(null)} />

        {mode === "list" && (
          <PlanListView
            plans={plans}
            onCreate={openCreate}
            onView={openView}
            onEdit={openEdit}
            onDelete={removePlan}
            onActivate={activatePlan}
            onDeactivate={deactivatePlan}
          />
        )}

        {mode !== "list" && workingPlan && (
          <>
            <PlanPageHead
              mode={mode}
              plan={workingPlan}
              onBack={openList}
              onEdit={() => openEdit(workingPlan.id)}
              onDelete={() => removePlan(workingPlan.id)}
              canDelete={canDeletePlan(workingPlan)}
            />

            {mode === "view" && (
              <div className="ml-tabs" style={{ marginTop: -4 }}>
                {[
                  { key: "details", label: "Subscription Details" },
                  { key: "history", label: "Subscription History" },
                ].map((t) => (
                  <button
                    key={t.key}
                    className={"ml-tab" + (viewTab === t.key ? " active" : "")}
                    onClick={() => setViewTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {mode !== "view" && (
              <ConfigurationView plan={workingPlan} editable={true} onChange={setPlanPatch} />
            )}
            {mode === "view" && viewTab === "details" && (
              <ConfigurationView plan={workingPlan} editable={false} onChange={setPlanPatch} />
            )}
            {mode === "view" && viewTab === "history" && (
              <SubscriptionHistoryTable plan={workingPlan} />
            )}

            {(mode === "create" || mode === "edit") && (
              <div className="hac-edit-bar hsub-edit-bar">
                <button className="hac-cancel-btn" onClick={mode === "create" ? openList : () => openView(draftPlan.id)}>Cancel</button>
                <button className="hac-save-btn" onClick={saveDraft}>{mode === "create" ? "Create plan" : "Save"}</button>
              </div>
            )}
          </>
        )}

        {deletePlanId && (() => {
          const plan = plans.find((item) => item.id === deletePlanId);
          if (!plan) return null;
          return ReactDOM.createPortal(
            <Modal
              title="Confirm Deletion"
              onClose={() => setDeletePlanId(null)}
              footer={
                <>
                  <button className="hac-modal-cancel" onClick={() => setDeletePlanId(null)}>Cancel</button>
                  <button className="hac-modal-save" onClick={confirmDeletePlan}>Confirm</button>
                </>
              }
            >
              <div className="hsub-delete-modal">
                <div className="hsub-delete-icon">
                  <HIcon name="priority_high" size={34} fill={1} color="#fff" />
                </div>
                <div className="hsub-delete-heading">Are you sure?</div>
                <div className="hsub-delete-copy">
                  You are removing <b>{plan.name}</b> subscription plan. This action cannot be undone.
                </div>
              </div>
            </Modal>,
            document.body
          );
        })()}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SubscriptionApp />);
