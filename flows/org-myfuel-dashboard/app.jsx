// app.jsx — MyFuel Dashboard (Org Portal)
// Reuses the Org Dashboard shell and visual language. Default state is the
// Premium/Lite full view; Tweaks (⌘⇧E) switch subscription tier, empty state,
// and org-level quota health.

{

const { useState, useEffect, useRef } = React;
const { Icon, LockSection, Segmented, StatusBadge, CountCard, PetronLogo, HistoryCard, CardHead } = window.SharedShell;
const D = window.MYFUEL_DASH;
const { useTweaks, TweaksPanel, TweakSection, TweakSelect, TweakToggle } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "subscription": "premium",
  "emptyData": false,
  "quotaState": "at-risk"
}/*EDITMODE-END*/;

const TIER_RANK = { free: 0, lite: 1, premium: 2 };
const rank = (t) => TIER_RANK[t] ?? 0;

const RM = (n) => "RM " + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const RM0 = (n) => "RM " + Number(n).toLocaleString("en-US");
const L = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " L";
const L0 = (n) => Number(n).toLocaleString("en-US") + " L";
const fuelAccountCode = (i) => `STG-PTN-${String(i + 1).padStart(3, "0")}`;

const balanceTone = (days) => (days >= 14 ? "" : days >= 5 ? " amber" : " red");

function initials(name = "") {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";
}

/* ── Org switcher (identical to Org Dashboard) ─────────────────── */
function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(D.org.id);
  const wrapRef = useRef(null);
  const selected = D.orgs.find((o) => o.id === selectedId) || D.orgs[0];

  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="mfd-org-switcher" ref={wrapRef}>
      <button type="button" className="mfd-org-trigger" onClick={() => setOpen((v) => !v)} aria-haspopup="true" aria-expanded={open}>
        <span className="mfd-org-avatar">{initials(selected.name)}</span>
        <span className="mfd-org-name">{selected.name}</span>
        <Icon name={open ? "expand_less" : "expand_more"} size={16} />
      </button>
      {open && (
        <div className="mfd-org-menu" role="menu">
          <div className="mfd-org-menu-h">Switch organization</div>
          {D.orgs.map((o) => (
            <button key={o.id} type="button" className={"mfd-org-item" + (o.id === selectedId ? " active" : "")} role="menuitem"
              onClick={() => { setSelectedId(o.id); setOpen(false); }}>
              <span className="mfd-org-item-avatar">{initials(o.name)}</span>
              <span className="mfd-org-item-name">{o.name}</span>
              <span className="mfd-org-item-role">{o.role}</span>
              {o.id === selectedId && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Left rail (Home / Organization / Account) ─────────────────── */
function Rail() {
  const RAIL = [
    { iconKey: "home", label: "Home", active: true },
    { iconKey: "org",  label: "Organization" },
    { iconKey: "user", label: "Account" },
  ];
  return (
    <nav className="mfd-rail">
      <div className="mfd-rail-logo"><Icon name="local_shipping" size={22} color="#fff" /></div>
      {RAIL.map((r) => (
        <a key={r.label} href={r.active ? "../org-dashboard/index.html" : undefined}
           className={"mfd-rail-item" + (r.active ? " active" : "")} title={r.label}>
          <img src={`../../public/ic-${r.iconKey}-${r.active ? "active" : "inactive"}.svg`} width={22} height={22} alt={r.label} />
          <span>{r.label}</span>
        </a>
      ))}
    </nav>
  );
}

/* ── Page header with global time filter ───────────────────────── */
function PageHeader() {
  return (
    <div className="mfd-pagehead">
      <div>
        <h1 className="mfd-title">MyFuel Dashboard</h1>
        <div className="mfd-breadcrumb">Home / MyFuel / Dashboard</div>
      </div>
    </div>
  );
}

/* ── Empty block (generic) ─────────────────────────────────────── */
function EmptyBlock({ icon, title, subtitle }) {
  return (
    <div className="mfd-empty">
      <Icon name={icon} size={34} />
      <div className="mfd-empty-t">{title}</div>
      <div className="mfd-empty-s">{subtitle}</div>
    </div>
  );
}

/* ── Section 1: Fuel Pulse ─────────────────────────────────────── */
function WalletLogo({ wallet, size = 16 }) {
  if (wallet.logo === "petron") return <PetronLogo size={size} />;
  const abbr = wallet.logo === "petronas" ? "PN" : wallet.logo === "shell" ? "SH" : wallet.name[0].toUpperCase();
  return <span className="mfd-wallet-abbr">{abbr}</span>;
}

function WalletPicker({ wallets, selectedId, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  return (
    <div className="mfd-wallet-picker" ref={ref} role="menu">
      <div className="mfd-wallet-picker-h">Switch wallet</div>
      {wallets.map((w, i) => (
        <button key={w.id} className={"mfd-wallet-item" + (w.id === selectedId ? " active" : "")}
          onClick={() => onSelect(i)} role="menuitem">
          <span className="mfd-wallet-item-check">{w.id === selectedId && <Icon name="check" size={14} />}</span>
          <span className="mfd-wallet-item-logo"><WalletLogo wallet={w} size={14} /></span>
          <span className="mfd-wallet-item-name">{w.name}</span>
          <span className="mfd-wallet-item-bal">{RM(w.amount)}</span>
        </button>
      ))}
    </div>
  );
}

function SubsidyPicker({ subsidies, selectedId, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  return (
    <div className="mfd-subsidy-picker" ref={ref} role="menu">
      <div className="mfd-subsidy-picker-h">Switch subsidy number</div>
      {subsidies.map((s, i) => (
        <button key={s.id} className={"mfd-subsidy-item" + (s.id === selectedId ? " active" : "")}
          onClick={() => onSelect(i)} role="menuitem">
          <span className="mfd-subsidy-item-check">{s.id === selectedId && <Icon name="check" size={14} />}</span>
          <span className="mfd-subsidy-item-main">
            <span className="mfd-subsidy-item-name">{s.subsidyNo}</span>
          </span>
          <span className="mfd-subsidy-item-val">{L0(s.used)} / {L0(s.quota)}</span>
        </button>
      ))}
    </div>
  );
}

function BalanceSummary({ empty }) {
  const wallets = D.wallets?.length ? D.wallets : [{
    id: "default",
    name: "Balance",
    logo: "petron",
    amount: D.balance.amount,
    daysRemaining: D.balance.daysRemaining,
    currentUsage: D.balance.currentUsage,
    currentUsageLitres: D.balance.currentUsageLitres,
    lastMonthUsage: D.balance.lastMonthUsage,
    lastMonthUsageLitres: D.balance.lastMonthUsageLitres,
    status: "healthy",
  }];
  const multi = wallets.length > 1;
  const [idx, setIdx] = useState(() => {
    try {
      const n = parseInt(localStorage.getItem("mfd_wallet_" + D.org.id), 10);
      return !isNaN(n) && n < wallets.length ? n : 0;
    } catch {
      return 0;
    }
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const b = wallets[idx] || wallets[0];
  const tone = empty ? "" : balanceTone(b.daysRemaining); // "" | " amber" | " red"
  const forced = tone === " red" ? "critical" : tone === " amber" ? "low" : null;

  return (
    <div className={"mfd-kpi mfd-balance" + tone}>
      <div className="mfd-balance-top">
        <div className="mfd-balance-wname-wrap">
          <button className="mfd-balance-wname" onClick={() => multi && setPickerOpen((v) => !v)}
            aria-haspopup={multi ? "true" : undefined} style={!multi ? { cursor: "default" } : {}}>
            <WalletLogo wallet={b} size={14} />
            <span className="mfd-balance-wname-label">{b.name}</span>
            {multi && <Icon name="expand_more" size={13} color="rgba(255,255,255,.65)"
              style={{ flexShrink: 0, transition: "transform .15s", transform: pickerOpen ? "rotate(180deg)" : "rotate(0deg)" }} />}
          </button>
          {pickerOpen && (
            <WalletPicker wallets={wallets} selectedId={b.id}
              onSelect={(i) => { setIdx(i); try { localStorage.setItem("mfd_wallet_" + D.org.id, i); } catch {} setPickerOpen(false); }}
              onClose={() => setPickerOpen(false)} />
          )}
        </div>
        <span className="mfd-balance-updated">Last updated<br />{D.org.lastUpdated}</span>
      </div>
      <div className="mfd-balance-sublabel-row">
        <span className="mfd-balance-sublabel">Balance</span>
        {forced && (
          <span className="mfd-tooltip-wrap" tabIndex={forced === "critical" ? 0 : undefined}>
            <StatusBadge status={forced === "critical" ? "critical_balance" : "low_balance"}
              prefix={<Icon name="warning" size={11} color="#BE2F2C" />} />
            {forced === "critical" && (
              <span className="mfd-tooltip">Balance critically low — top up now to avoid service disruption.</span>
            )}
          </span>
        )}
      </div>
      <div className="mfd-balance-row">
        <div className="mfd-balance-value">{empty ? "RM 0.00" : RM(b.amount)}</div>
        <button className="mfd-balance-addcredit">Add credit</button>
      </div>
      <div className="mfd-balance-band">
        <div className="mfd-balance-cell">
          <div className="mfd-balance-cell-l">Current month usage</div>
          <div className="mfd-balance-cell-v">{empty ? "RM 0.00" : RM(b.currentUsage)}</div>
          <div className="mfd-balance-cell-s">{empty ? "0.00 L" : L(b.currentUsageLitres)}</div>
        </div>
        <div className="mfd-balance-cell">
          <div className="mfd-balance-cell-l">Previous month usage</div>
          <div className="mfd-balance-cell-v">{empty ? "RM 0.00" : RM(b.lastMonthUsage)}</div>
          <div className="mfd-balance-cell-s">{empty ? "0.00 L" : L(b.lastMonthUsageLitres)}</div>
        </div>
        <div className="mfd-balance-cell mfd-balance-cell-est">
          <div className="mfd-balance-cell-l">Est. remaining</div>
          <div className="mfd-balance-cell-v">{empty ? "—" : `${b.daysRemaining} days`}</div>
        </div>
      </div>
      {multi && (
        <div className="mfd-balance-dots" role="tablist" aria-label="Wallet position">
          {wallets.map((wallet, i) => (
            <button key={wallet.id} role="tab" aria-selected={i === idx} aria-label={wallet.name}
              className={"mfd-balance-dot" + (i === idx ? " active" : "")}
              onClick={() => { setIdx(i); try { localStorage.setItem("mfd_wallet_" + D.org.id, i); } catch {} }} />
          ))}
        </div>
      )}
    </div>
  );
}

function vehicleStatus(used, quota) {
  if (quota === 0) return "none";
  const pct = (used / quota) * 100;
  if (pct >= 100) return "critical";
  if (pct >= 90) return "at-risk";
  return "within";
}

function deriveQuota(subsidy, quotaState, empty) {
  const q = subsidy;
  const scenario = empty ? "none" : quotaState;
  const warningPct = q.thresholds.warning / 100;
  const dangerPct = q.thresholds.danger / 100;
  const used = scenario === "over"
    ? q.quota
    : scenario === "healthy"
      ? Math.round(q.quota * 0.45)
      : scenario === "at-risk"
        ? Math.round(q.quota * ((warningPct + dangerPct) / 2))
        : scenario === "none"
          ? 0
          : q.used;
  const quota = scenario === "none" ? 0 : q.quota;
  const remaining = Math.max(0, quota - used);
  const pct = quota ? Math.min(100, (used / quota) * 100) : 0;
  return { q, scenario, used, quota, remaining, pct };
}

function SubsidyQuotaOverview({ empty, quotaState, subsidy, subsidies, subsidyIdx, onSelectSubsidy }) {
  const { q, scenario, used, quota, remaining, pct } = deriveQuota(subsidy, quotaState, empty);
  const isCritical = pct >= q.thresholds.danger;
  const isWarning = pct >= q.thresholds.warning;
  const fillTone = isCritical ? "red" : isWarning ? "amber" : "green";
  const alertTone = isCritical ? "red" : isWarning ? "amber" : "";
  const pctLabel = `${pct.toFixed(1)}%`;
  const [pickerOpen, setPickerOpen] = useState(false);

  const disclaimer = "Quota is renewed every 1st week of the month";

  return (
    <div className="mfd-kpi mfd-quota-card">
      <div className="mfd-quota-head">
        <div className="mfd-quota-head-main">
          <div className="mfd-quota-ico"><Icon name="local_gas_station" size={18} /></div>
          <div className="mfd-quota-head-copy">
            <div className="mfd-quota-title">Subsidy Quota</div>
            <div className="mfd-quota-subrow">
              <div className="mfd-quota-switch-wrap">
                <button className="mfd-quota-switch" onClick={() => subsidies.length > 1 && setPickerOpen((v) => !v)}
                  aria-haspopup={subsidies.length > 1 ? "true" : undefined} style={subsidies.length < 2 ? { cursor: "default" } : {}}>
                  <span className="mfd-quota-switch-label">{q.subsidyNo}</span>
                  {subsidies.length > 1 && <Icon name="expand_more" size={13} color="var(--fg-tertiary)"
                    style={{ flexShrink: 0, transition: "transform .15s", transform: pickerOpen ? "rotate(180deg)" : "rotate(0deg)" }} />}
                </button>
                {pickerOpen && (
                  <SubsidyPicker subsidies={subsidies} selectedId={q.id}
                    onSelect={(i) => { onSelectSubsidy(i); setPickerOpen(false); }}
                    onClose={() => setPickerOpen(false)} />
                )}
              </div>
              <span className="mfd-quota-subsep">·</span>
              <span className="mfd-quota-sub">{q.monthLabel}</span>
            </div>
          </div>
        </div>
        <div className="mfd-quota-head-right">
          {isWarning ? (
            <span className="mfd-tooltip-wrap" tabIndex={0}>
              <StatusBadge
                status={isCritical ? "critical_quota" : "at_risk_quota"}
                label={(isCritical ? "Critical" : "At risk") + ` (${pct.toFixed(0)}%)`}
                prefix={<Icon name="warning" size={11} color={isCritical ? "var(--red-400)" : "var(--amber-500)"} />} />
              <span className="mfd-tooltip">
                {isCritical
                    ? `${pct.toFixed(0)}% of quota used — monthly limit reached or nearly reached.`
                  : `${pct.toFixed(0)}% of quota used — may run out before month-end.`}
              </span>
            </span>
          ) : scenario !== "none" && !empty ? (
            <StatusBadge
              status="quota_safe"
              label={`Available (${pct.toFixed(0)}%)`}
              prefix={<Icon name="check_circle" size={11} color="var(--green-600)" />} />
          ) : null}
        </div>
      </div>

      {scenario === "none" || empty ? (
        <div className="mfd-quota-empty">
          <Icon name="block" size={32} />
          <div>No subsidy quota data yet</div>
          <div className="mfd-quota-empty-s">Data will appear once fuel usage starts or a subsidy quota file is uploaded.</div>
        </div>
      ) : (
        <div className="mfd-quota-body-top">
          <div className="mfd-quota-summary">
            <div className="mfd-quota-summary-main">
              <span className="mfd-quota-summary-strong">{L0(used)}</span>
              <span className="mfd-quota-summary-mid">/</span>
              <span className="mfd-quota-summary-strong">{L0(quota)}</span>
              <span className="mfd-quota-summary-unit">monthly quota</span>
            </div>
            <div className="mfd-quota-summary-sub">{pctLabel} used this month</div>
          </div>

          <div className="mfd-quota-bar-wrap">
            <div className="mfd-quota-tick-lbls">
              <span style={{ left: q.thresholds.warning + "%" }}>{q.thresholds.warning}%</span>
              <span className="danger" style={{ left: q.thresholds.danger + "%" }}>{q.thresholds.danger}%</span>
            </div>
            <div className="mfd-quota-track">
              <div className={"mfd-quota-fill " + fillTone} style={{ width: Math.min(pct, 100) + "%" }} />
              <div className="mfd-quota-marker" style={{ left: q.thresholds.warning + "%" }} />
              <div className="mfd-quota-marker danger" style={{ left: q.thresholds.danger + "%" }} />
            </div>
            <div className="mfd-quota-bar-lbls">
              <span>0 L</span>
              <span>{L0(quota)}</span>
            </div>
          </div>

          <div className="mfd-quota-stats">
            <div className="mfd-quota-stat">
              <div className="mfd-quota-stat-v">{L0(remaining)}</div>
              <div className="mfd-quota-stat-l">Remaining quota</div>
            </div>
            <div className="mfd-quota-stat mfd-quota-stat-divided">
              <div className={"mfd-quota-stat-v " + alertTone}>~{q.estimatedRunoutDays} days</div>
              <div className="mfd-quota-stat-l">Est. runout</div>
            </div>
          </div>
        </div>
      )}

      {scenario !== "none" && !empty && (
        <>
          <div className="mfd-quota-disclaimer">
            <Icon name="info" size={12} /> {disclaimer}
          </div>
        </>
      )}
    </div>
  );
}

function SubsidyQuotaByVehicle({ empty, quotaState, subsidy }) {
  const { q, scenario } = deriveQuota(subsidy, quotaState, empty);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const sourceRows = q.quotaByVehicle || D.quotaByVehicle;
  const vehRows = sourceRows
    .filter((r) => !query || r.plate.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.used - a.used);
  const pageCount = Math.max(1, Math.ceil(vehRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageRows = vehRows.slice(start, start + pageSize);

  return (
    <div className="mfd-kpi mfd-quota-card mfd-quota-veh-card">
      <div className="mfd-quota-head">
        <div className="mfd-quota-head-main">
          <div className="mfd-quota-ico"><Icon name="local_shipping" size={18} /></div>
          <div>
            <div className="mfd-quota-title">Subsidy Quota by Vehicle</div>
            <div className="mfd-quota-sub">
              {q.subsidyNo} · {q.monthLabel}{!(scenario === "none" || empty) && <> · {vehRows.length} vehicles</>}
            </div>
          </div>
        </div>
        {!(scenario === "none" || empty) && (
          <div className="mfd-quota-head-right">
            <label className="mfd-vehicle-search">
              <Icon name="search" size={15} />
              <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search vehicle" aria-label="Search vehicle" />
              {query && <button type="button" onClick={() => { setQuery(""); setPage(1); }} aria-label="Clear"><Icon name="close" size={14} /></button>}
            </label>
          </div>
        )}
      </div>

      {scenario === "none" || empty ? (
        <div className="mfd-quota-empty">
          <Icon name="block" size={32} />
          <div>No subsidy quota data yet</div>
          <div className="mfd-quota-empty-s">Data will appear once fuel usage starts or a subsidy quota file is uploaded.</div>
        </div>
      ) : (
        <div className="mfd-quota-veh-body">
          <div className="mfd-veh-quota-scroll">
            <div className="mfd-veh-quota-list">
              {pageRows.map((r) => {
                const vs = vehicleStatus(r.used, r.quota);
                const vpct = r.quota ? (r.used / r.quota) * 100 : 0;
                const displayUsed = r.quota > 0 ? Math.min(r.used, r.quota) : r.used;
                return (
                  <div key={r.plate} className="mfd-veh-quota-row">
                    <div className="mfd-veh-quota-lbl">{r.plate}</div>
                    <div className="mfd-veh-quota-bar">
                      <div className="mfd-veh-quota-track">
                        {r.quota > 0 && <div className={"mfd-veh-quota-fill " + vs} style={{ width: Math.min(vpct, 100) + "%" }} />}
                      </div>
                    </div>
                    <div className="mfd-veh-quota-val">
                      {vs === "none" ? "No quota" : (
                        <>
                          <span>{L0(displayUsed)}</span>
                          <span className="mfd-veh-quota-of"> / {L0(r.quota)}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mfd-legend mfd-vehicle-legend">
              <span className="mfd-leg"><span className="mfd-leg-dot" style={{ background: "var(--red-400)" }} /> Critical</span>
              <span className="mfd-leg"><span className="mfd-leg-dot" style={{ background: "var(--amber-500)" }} /> At risk</span>
              <span className="mfd-leg"><span className="mfd-leg-dot" style={{ background: "var(--green-500)" }} /> Available</span>
            </div>
          </div>

          <div className="mfd-vehicle-footer">
            <div className="mfd-vehicle-footer-bottom">
              <span className="mfd-vehicle-pager-range">{vehRows.length ? `${start + 1}–${Math.min(start + pageRows.length, vehRows.length)} of ${vehRows.length}` : "0 of 0"}</span>
              <div className="mfd-vehicle-pagebtns">
                <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><Icon name="chevron_left" size={16} /></button>
                <button type="button" disabled={safePage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}><Icon name="chevron_right" size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStats({ empty }) {
  const s = D.miniStats;
  return (
    <div className="mfd-statscroll">
      <CountCard fill icon="water_drop" count={empty ? "0 L" : L0(s.mtdFuel.litres)} label="MTD Fuel Used" sub="This month" actionLabel="Open fuel usage"
        stats={[
          { n: empty ? 0 : L0(s.mtdFuel.subsidisedLitres), label: "Subsidised", tone: "green" },
          { n: empty ? 0 : L0(s.mtdFuel.nonSubsidisedLitres), label: "Non-subsidy", tone: "gray" },
        ]} />

      <CountCard fill icon="humidity_percentage" count={empty ? "RM 0.00" : RM(s.rebate.amount)} label="Rebate Earned" sub="This month" actionLabel="Open rebate history"
        stats={[
          { n: empty ? "RM 0" : `+RM ${s.rebate.vsLastMonth}`, label: "vs last month", tone: "green" },
          { n: empty ? "RM 0.00/L" : `RM ${(s.rebate.amount / s.mtdFuel.litres).toFixed(2)}/L`, label: "Rebate rate", tone: "gray" },
        ]} />

      <CountCard fill icon="credit_card" count={empty ? 0 : s.fleetCards.total} label="Fleet Cards" sub="Total issued" actionLabel="Open fleet cards"
        stats={[
          { n: empty ? 0 : s.fleetCards.active, label: "Active", tone: "green" },
          { n: empty ? 0 : s.fleetCards.frozen, label: "Frozen", tone: "red" },
        ]} />
    </div>
  );
}

function FuelPulse({ empty }) {
  return (
    <section className="mfd-pulse">
      <BalanceSummary empty={empty} />
      <MiniStats empty={empty} />
    </section>
  );
}

/* ── Section 2: Fuel Usage Trend ───────────────────────────────── */
const METRIC_OPTIONS = [
  { value: "litres", label: "Volume" },
  { value: "amount", label: "Amount (RM)" },
];

function FuelUsageTrend({ empty, range }) {
  const [metric, setMetric] = useState("litres");
  const [hover, setHover] = useState(null);

  if (empty) {
    return (
      <div className="mfd-card mfd-trend-card">
        <div className="mfd-cardhead">
          <div>
            <div className="mfd-cardhead-title">Fuel Usage Trend</div>
            <div className="mfd-cardhead-sub">Last 6 months</div>
          </div>

        </div>
        <EmptyBlock icon="bar_chart" title="No usage data yet" subtitle="Fuel usage will appear once transactions come in." />
      </div>
    );
  }

  const data = D.usageTrend[range][metric];
  const labels = D.usageTrend[range].labels;
  const series = [
    { key: "sub", label: "Subsidised", color: "var(--navy-800)", values: data.subsidised },
    { key: "non", label: "Non-subsidised", color: "var(--green-500)", values: data.nonSubsidised },
  ];
  const totals = labels.map((_, i) => data.subsidised[i] + data.nonSubsidised[i]);
  const max = Math.max(...totals, 1);
  const ticks = 5;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => Math.round(max - (max / ticks) * i));

  return (
    <div className="mfd-card mfd-trend-card">
      <div className="mfd-cardhead">
        <div>
          <div className="mfd-cardhead-title">Fuel Usage Trend</div>
          <div className="mfd-cardhead-sub">Last 6 months</div>
        </div>
        <div className="mfd-cardhead-actions">
          <Segmented value={metric} onChange={setMetric} options={METRIC_OPTIONS} />
        </div>
      </div>

      <div className="mfd-chart-axislbl">{metric === "amount" ? "Amount (RM)" : "Fuel (litres)"}</div>
      <div className="mfd-plotwrap">
        <div className="mfd-yaxis">{tickVals.map((v) => <span key={v}>{v >= 1000 ? (v / 1000).toFixed(1) + "K" : v}</span>)}</div>
        <div className="mfd-plot">
          <div className="mfd-bars">
            {labels.map((label, i) => (
              <div key={label} className="mfd-bar-col"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}>
                <div className="mfd-bar-group">
                  {hover === i && (
                    <div className="mfd-bar-tip">
                      <div className="mfd-bar-tip-period">{label}</div>
                      {series.map((s) => (
                        <div key={s.key} className="mfd-bar-tip-row">
                          <span className="mfd-bar-tip-dot" style={{ background: s.color }} />
                          <span>{s.label}: <strong>{metric === "amount" ? RM0(s.values[i]) : L0(s.values[i])}</strong></span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={"mfd-bar-track" + (hover === i ? " active" : "")}>
                    <div className="mfd-bar-stack" style={{ height: (totals[i] / max * 100) + "%" }}>
                      <div className="mfd-bar-seg" style={{ height: totals[i] ? (data.subsidised[i] / totals[i] * 100) + "%" : "0%", background: series[0].color }} />
                      <div className="mfd-bar-seg" style={{ height: totals[i] ? (data.nonSubsidised[i] / totals[i] * 100) + "%" : "0%", background: series[1].color }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mfd-xaxis">
            {labels.map((l) => <span key={l} className="mfd-xlbl">{l}</span>)}
          </div>
        </div>
      </div>

      <div className="mfd-legend">
        {series.map((s) => (
          <span key={s.key} className="mfd-leg"><span className="mfd-leg-dot" style={{ background: s.color }} /> {s.label}</span>
        ))}
      </div>
    </div>
  );
}



/* ── Section 4: Account Activity ───────────────────────────────── */
const ACTIVITY_TABS = [
  { value: "fuel", label: "Fuel TXNs" },
  { value: "topup", label: "Top-Up History" },
  { value: "rebate", label: "Rebate History" },
];

function StatusPill({ status }) {
  const cls = "mfd-status " + status.toLowerCase().replace(/\s+/g, "-");
  const isCompleted = status.toLowerCase() === "completed";
  const isPending = status.toLowerCase() === "pending";
  return (
    <span className={cls}>
      {isCompleted && <Icon name="check" size={11} style={{ marginRight: 4 }} />}
      {isPending && <Icon name="pause" size={11} fill={1} style={{ marginRight: 4 }} />}
      {status}
    </span>
  );
}

function TxnModal({ txn, onClose }) {
  const wrapRef = useRef(null);
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  function onBackdrop(e) { if (e.target === wrapRef.current) onClose(); }

  return ReactDOM.createPortal(
    <div className="mfd-modal-backdrop" ref={wrapRef} onMouseDown={onBackdrop} role="dialog" aria-modal="true" aria-label="Transaction Detail">
      <div className="mfd-modal">
        <div className="mfd-modal-header">
          <span className="mfd-modal-title">Transaction Detail</span>
          <button className="mfd-modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>

        <div className="mfd-modal-hero">
          <div className="mfd-modal-txnid">TXN ID: {txn.txnId}</div>
          <div className="mfd-modal-amount">{RM(txn.amount)}</div>
          <div className="mfd-modal-meta">{L(txn.volume)} · {txn.date}</div>
        </div>

        <div className="mfd-modal-body">
          <div className="mfd-modal-section">
            <div className="mfd-modal-row">
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Vehicle no</div><div className="mfd-modal-val">{txn.vehicle}</div></div>
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Card no</div><div className="mfd-modal-val mfd-cell-mono">{txn.card}</div></div>
            </div>
            <div className="mfd-modal-row">
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Station</div><div className="mfd-modal-val">{txn.station}</div></div>
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Receipt no</div><div className="mfd-modal-val mfd-cell-mono">{txn.txnId}</div></div>
            </div>
          </div>

          <div className="mfd-modal-section">
            <div className="mfd-modal-row">
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Product name</div><div className="mfd-modal-val">{txn.product}</div></div>
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Volume (Litre)</div><div className="mfd-modal-val">{L(txn.volume)}</div></div>
            </div>
            <div className="mfd-modal-row">
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Unit price</div><div className="mfd-modal-val">{RM(txn.unitPrice)}</div></div>
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Amount</div><div className="mfd-modal-val mfd-amount">{RM(txn.amount)}</div></div>
            </div>
            <div className="mfd-modal-row">
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Subsidy</div><div className="mfd-modal-val">{txn.subsidyAmount > 0 ? RM(txn.subsidyAmount) : "RM 0.00"}</div></div>
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Card tag</div><div className="mfd-modal-val">{txn.cardTag}</div></div>
            </div>
            <div className="mfd-modal-row">
              <div className="mfd-modal-field"><div className="mfd-modal-lbl">Odometer</div><div className="mfd-modal-val">{Number(txn.odometer).toLocaleString("en-US")} km</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function FuelActivityCards({ rows, empty }) {
  const [selected, setSelected] = useState(null);
  if (empty || !rows.length) return <div className="mfd-table-empty">No fuel transactions yet.</div>;
  return (
    <>
      {selected && <TxnModal txn={selected} onClose={() => setSelected(null)} />}
      <div className="mfd-fuel-preview-list">
        {rows.map((r, i) => (
          <article key={i} className="mfd-fuel-preview-card" onClick={() => setSelected(r)}>
            <div className="mfd-fuel-preview-meta">
              <div className="mfd-fuel-preview-provider">
                <PetronLogo size={18} />
                <div className="mfd-fuel-preview-provider-stack">
                  <span>{fuelAccountCode(i)}</span>
                  <span className="mfd-fuel-preview-mono">{r.card}</span>
                </div>
              </div>
              <span>{r.date}</span>
            </div>

            <div className="mfd-fuel-preview-primary">
              <div className="mfd-fuel-preview-vehicle">{r.vehicle}</div>
              <div className="mfd-fuel-preview-amount">
                <span className="mfd-fuel-preview-sign">-</span>{RM(Math.abs(r.amount)).replace(/^RM\s/, "RM ")}
              </div>
            </div>

            <div className="mfd-fuel-preview-secondary">
              <div className="mfd-fuel-preview-location">{r.station}</div>
              <div className="mfd-fuel-preview-volume">{L(r.volume)}</div>
            </div>

            {r.subsidyAmount > 0 && (
              <div className="mfd-fuel-preview-subsidy">
                <span className="mfd-fuel-preview-subsidy-label">Subsidy used</span>
                <span className="mfd-fuel-preview-subsidy-value">{RM(r.subsidyAmount)}</span>
              </div>
            )}

            <div className="mfd-fuel-preview-footer">
              <span className="mfd-fuel-preview-mono">Txn ID {r.txnId}</span>
              <span className="mfd-fuel-preview-chevron"><Icon name="chevron_right" size={16} /></span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function TopUpTable({ rows, empty }) {
  if (empty || !rows.length) return <div className="mfd-table-empty">No top-up history yet.</div>;
  return (
    <div className="mfd-history-list">
      {rows.map((r, i) => (
        <HistoryCard
          key={i}
          icon="calendar_clock"
          title={`Paid at: ${r.paidAt}`}
          subtitle={r.reference}
          action={
            <button type="button" className="mfd-history-action" aria-label="Download receipt">
              <Icon name="download" size={18} />
            </button>
          }
        >
          <div className="ml-history-card-row">
            <div className="ml-history-card-cell"><span className="mfd-history-account"><PetronLogo size={18} /> {r.accountCode}</span></div>
            <div className="ml-history-card-cell" style={{ textAlign: "right" }}><span className="mfd-history-amountpill">{RM(r.amount)}<span className="mfd-history-plus">+</span></span></div>
          </div>
          <div className="ml-history-card-row">
            <div className="ml-history-card-cell">{r.method}</div>
            <div className="ml-history-card-cell" style={{ textAlign: "right" }}>{r.description}</div>
          </div>
          <div className="ml-history-card-row full">
            <div className="ml-history-card-cell">Created at <strong>{r.createdAt}</strong></div>
          </div>
        </HistoryCard>
      ))}
    </div>
  );
}

const REBATE_LIMITS = { free: 3, lite: 6, premium: 12 };

function RebateCards({ rows, empty, tier }) {
  const [page, setPage] = useState(1);
  if (empty || !rows.length) return <div className="mfd-table-empty">No rebate history yet.</div>;
  const limit = REBATE_LIMITS[tier] ?? REBATE_LIMITS.free;
  const eligible = rows.slice(0, limit);
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(eligible.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const visible = eligible.slice(start, start + pageSize);
  return (
    <>
      <div className="mfd-history-list">
        {visible.map((r, i) => (
          <HistoryCard
            key={i}
            icon="calendar_clock"
            title={r.paidOn}
            subtitle={r.period}
          >
            <div className="ml-history-card-row">
              <div className="ml-history-card-cell"><span className="mfd-history-account"><PetronLogo size={18} /> {r.accountNo}</span></div>
              <div className="ml-history-card-cell" style={{ textAlign: "right" }}><span className="mfd-history-amount">{RM(r.amount)}</span></div>
            </div>
            <div className="ml-history-card-row">
              <div className="ml-history-card-cell">{r.orgName}</div>
              <div className="ml-history-card-cell" style={{ textAlign: "right" }}>{r.type}</div>
            </div>
            <div className="ml-history-card-row">
              <div className="ml-history-card-cell">Usage: {L0(r.usage)}</div>
              <div className="ml-history-card-cell" style={{ textAlign: "right" }}>Group Usage: {L0(r.groupUsage)}</div>
            </div>
            <div className="ml-history-card-row">
              <div className="ml-history-card-cell">{r.provider}</div>
              <div className="ml-history-card-cell" style={{ textAlign: "right" }}><StatusPill status={r.status} /></div>
            </div>
          </HistoryCard>
        ))}
      </div>
      {eligible.length > pageSize && (
        <div className="mfd-rebate-footer">
          <span className="mfd-rebate-pager-range">{eligible.length ? `${start + 1}–${Math.min(start + visible.length, eligible.length)} of ${eligible.length}` : "0 of 0"}</span>
          <div className="mfd-rebate-pagebtns">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><Icon name="chevron_left" size={16} /></button>
            <button type="button" disabled={safePage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}><Icon name="chevron_right" size={16} /></button>
          </div>
        </div>
      )}
    </>
  );
}

function AccountActivity({ empty, tier }) {
  const [tab, setTab] = useState("fuel");
  const tabs = ACTIVITY_TABS;
  const activeTab = tabs.find((t) => t.value === tab) || tabs[0];
  const hasRows = activeTab.value === "fuel"
    ? !empty && D.transactions.length > 0
    : activeTab.value === "topup"
      ? !empty && D.topUps.length > 0
      : !empty && D.rebates.length > 0;

  return (
    <section className="mfd-activity">
      <div className="mfd-cardhead">
        <div>
          <div className="mfd-cardhead-title">Account Activity</div>
        </div>
      </div>
      <div className="mfd-activity-nav">
        {tabs.map((t) => (
          <button key={t.value} className={"ml-tab mfd-tab" + (activeTab.value === t.value ? " active" : "")} onClick={() => setTab(t.value)}>{t.label}</button>
        ))}
      </div>
      <div className="mfd-activity-body">
        {activeTab.value === "fuel" && <FuelActivityCards rows={D.transactions} empty={empty} />}
        {activeTab.value === "topup" && <TopUpTable rows={D.topUps} empty={empty} />}
        {activeTab.value === "rebate" && <RebateCards rows={D.rebates} empty={empty} tier={tier} />}
        {hasRows && activeTab.value !== "rebate" && (
          <div className="mfd-activity-viewall">
            <button className="ml-btn-text-blue">
              {activeTab.value === "fuel"
                ? "See all fuel transactions"
                : activeTab.value === "topup"
                  ? "See all top-up history"
                  : "See all"}
              <Icon name="chevron_right" size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function TopPetrolStations({ empty }) {
  const [page, setPage] = useState(1);
  const stations = D.topPetrolStations || [];
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(stations.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const visible = stations.slice(start, start + pageSize);
  return (
    <div className="mfd-card mfd-stations-card">
      <CardHead icon="emoji_events" title="Top 10 Petrol Stations" sub="All time" />
      {empty || !stations.length ? (
        <div className="mfd-stations-empty">No data available</div>
      ) : (
        <>
          <div className="mfd-stations-list">
            {visible.map((s) => (
              <HistoryCard
                key={s.rank}
                prefix={s.rank <= 3 ? (
                  <span className="mfd-stations-medal">
                    <Icon name="military_tech" size={22} fill={1} color={s.rank === 1 ? "#C19A00" : s.rank === 2 ? "#7D8794" : "#B87333"} />
                    <span className="mfd-stations-medal-rank">{s.rank}</span>
                  </span>
                ) : null}
                title={s.name}
              >
                <div className="ml-history-card-row">
                  <div className="ml-history-card-cell"><strong>{L0(s.totalLitres)}</strong></div>
                  <div className="ml-history-card-cell" style={{ textAlign: "right" }}><strong>{RM(s.totalAmount)}</strong></div>
                </div>
                <div className="ml-history-card-row full">
                  <div className="ml-history-card-cell">{s.pumps} pumps</div>
                </div>
              </HistoryCard>
            ))}
          </div>
          {stations.length > pageSize && (
            <div className="mfd-stations-footer">
              <span className="mfd-stations-pager-range">{stations.length ? `${start + 1}–${Math.min(start + visible.length, stations.length)} of ${stations.length}` : "0 of 0"}</span>
              <div className="mfd-stations-pagebtns">
                <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><Icon name="chevron_left" size={16} /></button>
                <button type="button" disabled={safePage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}><Icon name="chevron_right" size={16} /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const range = "sixMonth";
  const tier = t.subscription;
  const empty = !!t.emptyData;
  const subsidies = D.subsidyAccounts?.length ? D.subsidyAccounts : [{
    ...D.subsidyQuota,
    id: "subsidy-default",
    subsidyNo: "BUDI-458200",
    quotaByVehicle: D.quotaByVehicle,
  }];
  const [subsidyIdx, setSubsidyIdx] = useState(() => {
    try {
      const n = parseInt(localStorage.getItem("mfd_subsidy_" + D.org.id), 10);
      return !isNaN(n) && n < subsidies.length ? n : 0;
    } catch {
      return 0;
    }
  });
  const subsidy = subsidies[subsidyIdx] || subsidies[0];

  return (
    <div className="mfd-shell">
      <Rail />
      <div className="mfd-main">
        <header className="mfd-topbar">
          <OrgSwitcher />
          <div className="mfd-topbar-spacer" />
          <button className="mfd-iconbtn"><Icon name="notifications" size={18} /></button>
        </header>

        <div className="mfd-content">
          <PageHeader />

          <FuelPulse empty={empty} />

          {t.quotaState !== "none" && (
            <div className="mfd-quota-section">
              <LockSection locked={rank(tier) < rank("lite")} tier="lite"
                note="Subsidy quota tracking is available on Lite and Premium plans.">
                <div className="mfd-quota-row">
                  <SubsidyQuotaOverview
                    empty={empty}
                    quotaState={t.quotaState}
                    subsidy={subsidy}
                    subsidies={subsidies}
                    subsidyIdx={subsidyIdx}
                    onSelectSubsidy={(i) => { setSubsidyIdx(i); try { localStorage.setItem("mfd_subsidy_" + D.org.id, i); } catch {} }}
                  />
                  <SubsidyQuotaByVehicle empty={empty} quotaState={t.quotaState} subsidy={subsidy} />
                </div>
              </LockSection>
            </div>
          )}

          <div className="mfd-bottom-layout">
            <div className="mfd-bottom-left">
              <div className="mfd-trend-row">
                <FuelUsageTrend empty={empty} range={range} />
              </div>
              <AccountActivity empty={empty} tier={tier} />
            </div>
            <div className="mfd-bottom-right">
              <TopPetrolStations empty={empty} />
            </div>
          </div>
        </div>
      </div>

      <TweaksPanel title="Prototype State">
        <TweakSection label="Subscription tier" />
        <TweakSelect label="Plan" value={t.subscription}
          options={[
            { value: "free", label: "Free" },
            { value: "lite", label: "Lite" },
            { value: "premium", label: "Premium" },
          ]}
          onChange={(v) => setTweak("subscription", v)} />
        <TweakSection label="Data" />
        <TweakToggle label="Empty (new org)" value={t.emptyData} onChange={(v) => setTweak("emptyData", v)} />
        <TweakSection label="Quota" />
        <TweakSelect label="Quota state" value={t.quotaState}
          options={[
            { value: "healthy", label: "Healthy" },
            { value: "at-risk", label: "At risk" },
            { value: "over", label: "Critical" },
            { value: "none", label: "No quota" },
          ]}
          onChange={(v) => setTweak("quotaState", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}
