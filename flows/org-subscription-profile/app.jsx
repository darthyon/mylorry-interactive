// app.jsx — Organisation Profile (Subscription Summary revamp).
// Reached via the Org Portal rail's "Organization" item. Tweaks panel
// (⌘⇧E) switches between the 5 required prototype data states — see
// data.js `scenarios`.

const { Icon, StatusBadge, FeatureTabShell, OrgSwitcher, CalcPopover } = window.SharedShell;
const { useTweaks, TweaksPanel, TweakSection, TweakSelect } = window;
const { SUBSCRIPTION_PLANS, calculateCommittedBilling, getBoundValue } = window.SUB;
const D = window.ORG_PROFILE;
const PLANS_BY_ID = Object.fromEntries(SUBSCRIPTION_PLANS.map((p) => [p.id, p]));
// Same org as org-dashboard (window.ORG_DASH.org), not a disconnected mock name.
const ORG = { ...window.ORG_DASH.org, ...D.orgDetails };

const RM = (n) => "RM " + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── Derive this page's view model from window.SUB (host-subscription's
   canonical plan data) + the org-specific scenario extras in data.js. No
   plan pricing/limits/features are re-typed here — read once, from one
   source, so this page can't drift from what host-subscription configured. */
const MODULE_ICONS = {
  general: "tune", myfuel: "local_gas_station", myadmin: "admin_panel_settings",
  mydriver: "badge", mytrip: "route", myinsurance: "shield",
};

function vehicleLimitOf(plan) {
  return plan.limits.managedVehicleLimit == null ? "unlimited" : plan.limits.managedVehicleLimit;
}

function vehicleCeilingCopy(plan) {
  const limit = vehicleLimitOf(plan);
  return limit === "unlimited" ? "Allows unlimited managed vehicles" : `Allows up to ${limit} managed vehicles`;
}

function resolveRow(plan, row) {
  const value = row.bindPath ? getBoundValue(plan, row.bindPath) : row.value;
  if (row.toggleable && !row.enabled) return { state: "locked" };
  if (row.controlType === "toggle") return value ? { state: "included" } : { state: "locked" };
  if (row.controlType === "select") return value === "Unlimited" ? { state: "included" } : { state: "limited", cap: value };
  // number
  if (row.hasUnlimited && value == null) return { state: "included", cap: "Unlimited" };
  return { state: "limited", cap: String(value) };
}

function buildModules(plan) {
  return plan.featureModules.map((mod) => {
    const rows = mod.rows.map((row) => ({ label: row.label, ...resolveRow(plan, row) }));
    // "locked" only when every row is locked — a module with a capped
    // (limited) row still has real access, it's not the same as zero access.
    const access = rows.every((r) => r.state === "included") ? "included"
      : rows.every((r) => r.state === "locked") ? "locked"
      : "limited";
    return {
      key: mod.key,
      label: mod.label,
      icon: MODULE_ICONS[mod.key] || "extension",
      summary: mod.summary,
      access,
      rows,
      note: mod.key === "myadmin"
        ? `Managed vehicle number is set in Organization Management. This plan ${vehicleCeilingCopy(plan).toLowerCase()}.`
        : null,
    };
  });
}

function asOngoingBilling(billing) {
  if (!billing) return null;
  return {
    ...billing,
    setupFee: 0,
    setupFeeStatus: "N/A",
    totalLumpSum: Number(billing.monthlySubtotal || 0) * Number(billing.commitmentMonths || 0),
  };
}

function buildUpcoming(upcoming, currentAgreementVehicleCount) {
  if (!upcoming) return null;
  const plan = upcoming.planId ? PLANS_BY_ID[upcoming.planId] : null;
  const vehicleLimit = plan ? vehicleLimitOf(plan) : null;
  const billing = plan
    ? asOngoingBilling({
        ...calculateCommittedBilling(plan, currentAgreementVehicleCount, upcoming.commitmentMonths, upcoming.setupFeeStatus),
        setupFeeStatus: upcoming.setupFeeStatus,
      })
    : null;
  return {
    planName: plan ? plan.name : null,
    effectiveDate: upcoming.effectiveDate,
    note: upcoming.note,
    vehicleLimit,
    billing,
    modules: plan ? buildModules(plan) : null,
  };
}

function buildScenarioView(sc) {
  const plan = PLANS_BY_ID[sc.planId];
  const isPaid = sc.status !== "free";
  const agreementVehicleCount = sc.agreementVehicleCount != null
    ? Number(sc.agreementVehicleCount)
    : (plan.limits.managedVehicleLimit != null ? plan.limits.managedVehicleLimit : sc.vehiclesUsed);
  // Free still gets a billing card — RM0 / commitment N/A / setup fee N/A —
  // not hidden entirely. Only paid plans have a real committed-billing calc.
  // Trial is a special case: no bill yet, 1-month trial duration, no setup fee.
  let billing = isPaid
    ? asOngoingBilling({ ...calculateCommittedBilling(plan, agreementVehicleCount, sc.commitmentMonths, sc.setupFeeStatus), setupFeeStatus: sc.setupFeeStatus })
    : { baseMonthlyFee: 0, perManagedVehicleFee: 0, commitmentMonths: null, setupFee: 0, totalLumpSum: 0, setupFeeStatus: "N/A" };
  if (sc.status === "trial") {
    billing = {
      ...billing,
      commitmentMonths: 1,
      setupFee: 0,
      setupFeeStatus: "N/A",
      totalLumpSum: 0,
    };
  }
  return {
    planName: plan.name,
    planTier: plan.id.replace("plan-", ""),
    status: sc.status,
    trialDaysRemaining: sc.trialDaysRemaining,
    trialExpiry: sc.trialExpiry,
    nextBillingDate: sc.nextBillingDate,
    vehiclesUsed: sc.vehiclesUsed,
    agreementVehicleCount,
    vehicleLimit: vehicleLimitOf(plan),
    billing,
    upcoming: buildUpcoming(sc.upcoming, agreementVehicleCount),
    modules: buildModules(plan),
  };
}

/* ── Rail (mirrors org-dashboard's; Organization active here) ──── */
const RAIL = [
  { iconKey: "home", label: "Home", href: "../org-dashboard/index.html" },
  { iconKey: "org",  label: "Organization", active: true },
  { iconKey: "user", label: "Account" },
];
function Rail() {
  return (
    <nav className="od-rail">
      <div className="od-rail-logo"><Icon name="local_shipping" size={22} color="#fff" /></div>
      {RAIL.map((r) => {
        const cls = "od-rail-item" + (r.active ? " active" : "");
        const content = (
          <>
            <img src={`../../public/ic-${r.iconKey}-${r.active ? "active" : "inactive"}.svg`} width={22} height={22} alt={r.label} />
            <span>{r.label}</span>
          </>
        );
        return r.href
          ? <a key={r.label} className={cls} href={r.href} title={r.label}>{content}</a>
          : <div key={r.label} className={cls} title={r.label}>{content}</div>;
      })}
    </nav>
  );
}

/* ── Vehicle usage bar (plain used/limit meter — not KPIProgress, which
   carries KPI %/tooltip semantics this doesn't need) ───────────────── */
function UsageBar({ used, limit }) {
  if (limit === "unlimited") {
    return <div className="osp-usage-text">{used} / Unlimited</div>;
  }
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const atLimit = used >= limit;
  return (
    <>
      <div className="osp-usage-text">{used} / {limit}</div>
      <div className="osp-usage-track">
        <div className={"osp-usage-fill" + (atLimit ? " full" : "")} style={{ width: pct + "%" }} />
      </div>
    </>
  );
}

/* ── Organisation details (2 cards) — leads the page, it's the namesake ── */
function OrgDetails({ org, pic }) {
  return (
    <div className="osp-details-row">
      <div className="ml-card hac-detail-card">
        <div className="hac-dcard-title">{org.name}</div>
        <div className="hac-detail-grid hac-view-grid osp-org-grid">
          <div className="hac-fg"><span className="hac-label">Account Reg. No</span><span className="hac-view-val">{org.regNo}</span></div>
          <div className="hac-fg"><span className="hac-label">TIN</span><span className="hac-view-val">{org.tin}</span></div>
          <div className="hac-fg" style={{ gridColumn: "1 / -1" }}>
            <span className="hac-label">Address</span><span className="hac-view-val" style={{ height: "auto" }}>{org.address}</span>
          </div>
        </div>
      </div>
      <div className="ml-card hac-detail-card">
        <div className="hac-dcard-title">PIC Info</div>
        <div className="osp-pic-row">
          <div className="osp-pic-avatar"><Icon name="person" size={22} fill={1} color="#94A8B2" /></div>
          <div>
            <div className="osp-pic-name">{pic.name}</div>
            <div className="osp-pic-meta"><Icon name="mail" size={14} /> {pic.email}</div>
            <div className="osp-pic-meta"><Icon name="call" size={14} /> {pic.phone}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Subscription Summary (Current / Upcoming) ─────────────────────
   Three parallel stat-cards (Plan | Billing | Vehicles) per the Figma spec
   (node 8756:37), not a header row + divider + 2-col grid. ─────────── */
function PlanStatCard({ s }) {
  const showUpgrade = s.planTier !== "enterprise";
  return (
    <div className="osp-stat-card">
      <div className="osp-plan-row">
        <span className="osp-plan-name">{s.planName}</span>
        {s.status === "trial" ? (
          <StatusBadge status="sub_trial" label={`Trial · ${s.trialDaysRemaining} days remaining`} />
        ) : (
          <StatusBadge status="active" />
        )}
      </div>
      {s.status === "trial" && (
        <div className="osp-plan-date"><Icon name="calendar_today" size={14} color="var(--fg-tertiary)" /> Trial ends {fmtDate(s.trialExpiry)}</div>
      )}
      {s.status === "active" && (
        <div className="osp-plan-date"><Icon name="calendar_today" size={14} color="var(--fg-tertiary)" /> Next billing date {fmtDate(s.nextBillingDate)}</div>
      )}
      {showUpgrade && <button className="ml-btn-primary osp-upgrade-btn">Upgrade plan</button>}
    </div>
  );
}

function BillingStatCard({ s, billing }) {
  const isFree = billing.commitmentMonths == null;
  const isTrial = s.status === "trial";
  const rows = [
    { label: "Base monthly fee", value: `${RM(billing.baseMonthlyFee)} × ${billing.commitmentMonths} months` },
  ];
  if (billing.perManagedVehicleFee > 0) {
    rows.push({
      label: "Managed vehicles",
      value: `${s.agreementVehicleCount} × ${RM(billing.perManagedVehicleFee)} × ${billing.commitmentMonths} months`,
    });
  }
  rows.push({ label: "Total", value: RM(billing.totalLumpSum), tone: "green", total: true });

  return (
    <div className="osp-stat-card osp-stat-card-relative">
      {!isFree && !isTrial && (
        <div className="osp-calc-corner">
          <CalcPopover title="Calculation summary" rows={rows} align="right" />
        </div>
      )}
      <div className="osp-block-title">Current billed amount</div>
      <div className="osp-billing-amount">{RM(billing.totalLumpSum)}</div>
      <div className="osp-billing-row">
        <span>Commitment duration</span><strong>{isFree ? "N/A" : `${billing.commitmentMonths} months`}</strong>
      </div>
    </div>
  );
}

function VehiclesStatCard({ s }) {
  const slotsAvailable = s.vehicleLimit === "unlimited" ? null : Math.max(s.vehicleLimit - s.vehiclesUsed, 0);
  return (
    <div className="osp-stat-card">
      <div className="osp-block-title">Managed vehicles</div>
      {s.planTier === "free" ? (
        <div className="osp-stat-empty">
          <Icon name="directions_car" size={26} color="var(--fg-disabled)" />
          <div className="osp-stat-empty-t">Not available on Free</div>
        </div>
      ) : (
        <>
          <UsageBar used={s.vehiclesUsed} limit={s.vehicleLimit} />
          {slotsAvailable != null && <div className="osp-slots-available">{slotsAvailable} slots available</div>}
        </>
      )}
    </div>
  );
}

function CurrentPlanView({ s }) {
  return (
    <div className="osp-stats-panel">
      <PlanStatCard s={s} />
      <BillingStatCard s={s} billing={s.billing} />
      <VehiclesStatCard s={s} />
    </div>
  );
}

function UpcomingPlanView({ upcoming }) {
  if (!upcoming) {
    return (
      <div className="osp-empty">
        <Icon name="event_upcoming" size={34} />
        <div className="osp-empty-t">No upcoming plan change</div>
        <div className="osp-empty-s">This organisation isn't scheduled for a plan change.</div>
        <button className="ml-btn-primary">Upgrade plan</button>
      </div>
    );
  }
  const b = upcoming.billing;
  return (
    <div className="osp-stats-panel">
      <div className="osp-stat-card">
        <div className="osp-plan-name">{upcoming.planName || "Upcoming change"}</div>
        {upcoming.effectiveDate && (
          <div className="osp-plan-date">
            <Icon name="calendar_today" size={14} color="var(--fg-tertiary)" /> Effective {fmtDate(upcoming.effectiveDate)}
          </div>
        )}
        {upcoming.note && <div className="osp-plan-date">{upcoming.note}</div>}
      </div>
      {b && (
        <div className="osp-stat-card">
          <div className="osp-block-title">New billed amount</div>
          <div className="osp-billing-amount">{RM(b.totalLumpSum)}</div>
          <div className="osp-billing-row">
            <span>Commitment duration</span><strong>{b.commitmentMonths} months</strong>
          </div>
        </div>
      )}
      {upcoming.vehicleLimit != null && (
        <div className="osp-stat-card">
          <div className="osp-block-title">Managed vehicles (new limit)</div>
          <div className="osp-usage-text">
            {upcoming.vehicleLimit === "unlimited" ? "Unlimited" : upcoming.vehicleLimit}
          </div>
        </div>
      )}
    </div>
  );
}

/* Underline tabs (not the dark Segmented pill) — matches Figma's tabs-row:
   individual per-tab indicator bar, active label stays fg-primary (only the
   bar goes green), no full-width row border. */
function SummaryTabs({ tab, onChange }) {
  return (
    <div className="ml-tabs">
      {[{ value: "current", label: "Current" }, { value: "upcoming", label: "Upcoming" }].map((t) => (
        <button key={t.value} className={"ml-tab" + (tab === t.value ? " active" : "")} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SubscriptionSummary({ s }) {
  const [tab, setTab] = React.useState("current");
  const servicesTitle = tab === "upcoming" ? "Upcoming Services" : "Services";
  const serviceModules = tab === "upcoming" && s.upcoming?.modules ? s.upcoming.modules : s.modules;
  return (
    <div className="ml-card osp-summary">
      <div className="osp-summary-title">Subscription Summary</div>
      <SummaryTabs tab={tab} onChange={setTab} />
      {tab === "current" ? <CurrentPlanView s={s} /> : <UpcomingPlanView upcoming={s.upcoming} />}

      <div className="osp-services-sub">
        <div className="osp-services-title">{servicesTitle}</div>
        <ServicesTabs modules={serviceModules} />
      </div>
    </div>
  );
}

/* ── Services (vertical tabs desktop / horizontal tabs mobile — same
   pattern as host-subscription's Feature Access section, trimmed to
   read-only rows). Active tab uses bg-tint + bold text only, no
   border-left accent (side-stripe accents are banned in DESIGN.md). ── */
function FeatureRow({ row }) {
  return (
    <div className="osp-feature-row">
      <span className="osp-feature-label">{row.label}</span>
      {row.state === "included" && <Icon name="check_circle" size={17} fill={1} color="var(--green-600)" />}
      {row.state === "limited" && <span className="osp-feature-cap">{row.cap}</span>}
      {row.state === "locked" && (
        <span className="osp-feature-state locked">
          <Icon name="lock" size={15} color="var(--fg-tertiary)" />
          <a className="osp-feature-upgrade" href="#">Upgrade to unlock</a>
        </span>
      )}
    </div>
  );
}

function ServicesTabs({ modules }) {
  const [activeKey, setActiveKey] = React.useState(modules[0].key);
  React.useEffect(() => {
    if (!modules.some((module) => module.key === activeKey)) {
      setActiveKey(modules[0].key);
    }
  }, [modules, activeKey]);
  const active = modules.find((m) => m.key === activeKey) || modules[0];
  const tabs = modules.map((m) => ({ key: m.key, label: m.label }));

  return (
    <FeatureTabShell tabs={tabs} activeKey={activeKey} onSelect={setActiveKey}>
      <div className="osp-svc-panel-head">
        <div className="osp-module-name">{active.label}</div>
        <div className="osp-module-summary">{active.summary}</div>
      </div>
      {active.access === "locked" ? (
        <div className="osp-empty">
          <Icon name="lock" size={30} />
          <div className="osp-empty-t">{active.label} isn't available on this plan</div>
          <div className="osp-empty-s">Upgrade to unlock this module.</div>
          <button className="ml-btn-primary">Upgrade plan</button>
        </div>
      ) : (
        <div className="osp-module-body">
          {active.rows.map((row, i) => <FeatureRow key={i} row={row} />)}
          {active.note && <div className="osp-module-note">{active.note}</div>}
        </div>
      )}
    </FeatureTabShell>
  );
}

/* ── Tweaks ────────────────────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scenario": "lite-active"
}/*EDITMODE-END*/;

const SCENARIO_LABEL = {
  "free": "1 — Free plan",
  "lite-active": "2 — Lite (active)",
  "premium-trial": "3 — Premium (trial)",
  "premium-active": "4 — Premium (active)",
  "enterprise-unlimited": "5 — Enterprise (unlimited vehicles)",
  "lite-at-limit": "6 — Lite (at vehicle limit)",
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const sc = D.scenarios[t.scenario] || D.scenarios["lite-active"];
  const s = buildScenarioView(sc);

  return (
    <div className="od-shell">
      <Rail />
      <div className="od-main">
        <header className="od-topbar">
          <OrgSwitcher orgs={[ORG]} initialId={ORG.id} />
          <div className="od-topbar-spacer" />
          <button className="od-iconbtn"><Icon name="notifications" size={18} /></button>
        </header>

        <div className="od-content osp-content">
          <div className="od-pagehead">
            <span className="od-pagetitle">Organisation Profile</span>
          </div>

          <OrgDetails org={ORG} pic={D.pic} />
          <SubscriptionSummary s={s} />
        </div>
      </div>

      <TweaksPanel title="Prototype State">
        <TweakSection label="Scenario" />
        <TweakSelect label="Data state" value={t.scenario}
          options={Object.keys(SCENARIO_LABEL).map((v) => ({ value: v, label: SCENARIO_LABEL[v] }))}
          onChange={(v) => setTweak("scenario", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
