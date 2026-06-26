// app.jsx — MyFuel Dashboard (Org Portal)
// Reuses the Org Dashboard shell and visual language. Default state is the
// Premium/Lite full view; Tweaks (⌘⇧E) switch subscription tier, empty state,
// and org-level quota health.

const { useState, useEffect, useRef } = React;
const { Icon, LockSection, Segmented } = window.SharedShell;
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
    { icon: "home", label: "Home", active: true },
    { icon: "domain", label: "Organization" },
    { icon: "person", label: "Account" },
  ];
  return (
    <nav className="mfd-rail">
      <div className="mfd-rail-logo"><Icon name="local_shipping" size={22} color="#fff" /></div>
      {RAIL.map((r) => (
        <a key={r.label} href={r.active ? "../org-dashboard/index.html" : undefined}
           className={"mfd-rail-item" + (r.active ? " active" : "")} title={r.label}>
          <Icon name={r.icon} size={22} fill={r.active ? 1 : 0} />
          <span>{r.label}</span>
        </a>
      ))}
    </nav>
  );
}

/* ── Page header with global time filter ───────────────────────── */
function PageHeader({ range, setRange }) {
  const options = [
    { value: "today", label: "Today" },
    { value: "mtd", label: "Month to date" },
    { value: "sixMonth", label: "Last 6 months" },
  ];
  return (
    <div className="mfd-pagehead">
      <div>
        <h1 className="mfd-title">MyFuel Dashboard</h1>
        <div className="mfd-breadcrumb">Home / MyFuel / Dashboard</div>
      </div>
      <div className="mfd-timefilter">
        {options.map((o) => (
          <button key={o.value} type="button"
            className={"mfd-timebtn" + (range === o.value ? " active" : "")}
            onClick={() => setRange(o.value)}>{o.label}</button>
        ))}
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
function BalanceSummary({ empty }) {
  const b = D.balance;
  return (
    <div className={"mfd-kpi mfd-balance" + (empty ? "" : balanceTone(b.daysRemaining))}>
      <div className="mfd-balance-top">
        <span className="mfd-balance-label">Balance</span>
        <span className="mfd-balance-meta">
          <span className="mfd-balance-updated">Last updated<br />{D.org.lastUpdated}</span>
          <button className="mfd-card-arrow invert" aria-label="Open balance"><Icon name="arrow_forward" size={15} /></button>
        </span>
      </div>
      <div className="mfd-balance-value">{empty ? "RM 0.00" : RM(b.amount)}</div>
      <div className="mfd-balance-pill">
        <Icon name="schedule" size={13} color="#fff" />
        {empty ? "No usage yet" : `Est. remaining ${b.daysRemaining} days`}
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
      </div>
    </div>
  );
}

function QuotaStatusPill({ status }) {
  const meta = {
    healthy: { label: "Healthy", cls: "healthy", icon: "check_circle" },
    "at-risk": { label: "At risk", cls: "at-risk", icon: "warning" },
    over: { label: "Over quota", cls: "over", icon: "error" },
    none: { label: "No quota", cls: "none", icon: "block" },
  };
  const m = meta[status] || meta["at-risk"];
  return <span className={"mfd-quota-pill " + m.cls}><Icon name={m.icon} size={13} /> {m.label}</span>;
}

function SubsidyQuota({ empty, quotaState }) {
  const q = D.subsidyQuota;
  const status = empty ? "none" : quotaState;
  const used = status === "over" ? q.quota + 400 : status === "healthy" ? Math.round(q.quota * 0.45) : status === "none" ? 0 : q.used;
  const quota = status === "none" ? 0 : q.quota;
  const remaining = Math.max(0, quota - used);
  const pct = quota ? Math.min(100, (used / quota) * 100) : 0;
  const overBy = used > quota ? used - quota : 0;

  return (
    <div className="mfd-kpi mfd-quota-card">
      <div className="mfd-quota-head">
        <div>
          <div className="mfd-quota-title">Subsidy Quota</div>
          <div className="mfd-quota-sub">{q.monthLabel} · {q.fuelType}</div>
        </div>
        <div className="mfd-quota-head-right">
          <div className="mfd-tooltip-wrap">
            <QuotaStatusPill status={status} />
            <div className="mfd-tooltip">{q.insight}</div>
          </div>
          <button className="mfd-card-arrow" aria-label="View vehicles at risk"><Icon name="arrow_forward" size={15} /></button>
        </div>
      </div>

      {status === "none" || empty ? (
        <div className="mfd-quota-empty">
          <Icon name="block" size={32} />
          <div>No subsidy quota assigned</div>
          <div className="mfd-quota-empty-s">Quota will appear once your organisation is enrolled in a subsidy programme.</div>
        </div>
      ) : (
        <>
          <div className="mfd-quota-hero">
            <div>
              <div className="mfd-quota-used">{L0(used)} <span>used</span></div>
              <div className="mfd-quota-pct">{pct.toFixed(1)}% used</div>
            </div>
          </div>

          <div className="mfd-quota-bar-wrap">
            <div className="mfd-quota-track">
              <div className="mfd-quota-fill" style={{ width: Math.min(pct, 100) + "%", background: status === "over" ? "var(--red-400)" : status === "at-risk" ? "var(--amber-500)" : "var(--green-500)" }} />
              {overBy > 0 && (
                <div className="mfd-quota-over" style={{ width: ((overBy / quota) * 100) + "%" }} />
              )}
              <div className="mfd-quota-marker" style={{ left: q.thresholds.warning + "%" }} data-label="70%" />
              <div className="mfd-quota-marker danger" style={{ left: q.thresholds.danger + "%" }} data-label="90%" />
            </div>
            <div className="mfd-quota-bar-lbls">
              <span>0 L</span>
              <span>{L0(quota)}</span>
            </div>
          </div>

          <div className="mfd-quota-meta">
            <div>
              <div className="mfd-quota-meta-v">{L0(remaining)}</div>
              <div className="mfd-quota-meta-l">Remaining quota</div>
            </div>
            <div>
              <div className="mfd-quota-meta-v">{L0(quota)}</div>
              <div className="mfd-quota-meta-l">Monthly quota</div>
            </div>
            <div>
              <div className="mfd-quota-meta-v">~{q.estimatedRunoutDays} days</div>
              <div className="mfd-quota-meta-l">Estimated runout</div>
            </div>
          </div>

        </>
      )}
    </div>
  );
}

function MiniStats({ empty }) {
  const s = D.miniStats;
  const cards = [
    { icon: "water_drop", title: "MTD Fuel Used", primary: empty ? "0 L" : L0(s.mtdFuel.litres), secondary: empty ? "RM 0.00" : RM(s.mtdFuel.amount) },
    { icon: "savings", title: "Rebate Earned", primary: empty ? "RM 0.00" : RM(s.rebate.amount), secondary: empty ? "No change" : `+RM ${s.rebate.vsLastMonth} vs last month` },
    { icon: "credit_card", title: "Fleet Cards", primary: empty ? "0 / 0" : `${s.fleetCards.active} / ${s.fleetCards.total}`, secondary: empty ? "0 frozen" : <span className="mfd-frozen">{s.fleetCards.frozen} frozen</span> },
  ];
  return (
    <div className="mfd-ministats">
      {cards.map((c) => (
        <div key={c.title} className="mfd-minicard">
          <div className="mfd-minicard-head">
            <div className="mfd-minicard-ico"><Icon name={c.icon} size={20} /></div>
            <button className="mfd-card-arrow" aria-label="Open"><Icon name="arrow_forward" size={15} /></button>
          </div>
          <div className="mfd-minicard-title">{c.title}</div>
          <div className="mfd-minicard-primary">{c.primary}</div>
          <div className="mfd-minicard-secondary">{c.secondary}</div>
        </div>
      ))}
    </div>
  );
}

function FuelPulse({ empty, quotaState }) {
  return (
    <section className="mfd-pulse">
      <BalanceSummary empty={empty} />
      <SubsidyQuota empty={empty} quotaState={quotaState} />
      <MiniStats empty={empty} />
    </section>
  );
}

/* ── Section 2: Fuel Usage Trend ───────────────────────────────── */
const METRIC_OPTIONS = [
  { value: "litres", label: "Litres" },
  { value: "amount", label: "Amount (RM)" },
  { value: "subsidyOnly", label: "Subsidy only" },
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
            <div className="mfd-cardhead-sub">Subsidy vs non-subsidy consumption</div>
          </div>
          <button className="ml-btn-soft" disabled><Icon name="download" size={15} /> Export</button>
        </div>
        <EmptyBlock icon="bar_chart" title="No usage data yet" subtitle="Fuel usage will appear once transactions come in." />
      </div>
    );
  }

  const data = D.usageTrend[range][metric];
  const labels = D.usageTrend[range].labels;
  const isSubsidyOnly = metric === "subsidyOnly";
  const series = isSubsidyOnly
    ? [{ key: "sub", label: "Subsidised", color: "var(--green-500)", values: data.subsidised }]
    : [
        { key: "sub", label: "Subsidised", color: "var(--green-500)", values: data.subsidised },
        { key: "non", label: "Non-subsidised", color: "#D6DAD8", values: data.nonSubsidised },
      ];

  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(...allValues, 1);
  const ticks = 5;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => Math.round(max - (max / ticks) * i));

  return (
    <div className="mfd-card mfd-trend-card">
      <div className="mfd-cardhead">
        <div>
          <div className="mfd-cardhead-title">Fuel Usage Trend</div>
          <div className="mfd-cardhead-sub">Subsidy vs non-subsidy consumption</div>
        </div>
        <div className="mfd-cardhead-actions">
          <Segmented value={metric} onChange={setMetric} options={METRIC_OPTIONS} />
          <button className="ml-btn-soft"><Icon name="download" size={15} /> Export</button>
        </div>
      </div>

      <div className="mfd-chart-axislbl">{metric === "amount" ? "Amount (RM)" : "Fuel (litres)"}</div>
      <div className="mfd-plotwrap">
        <div className="mfd-yaxis">{tickVals.map((v) => <span key={v}>{v >= 1000 ? (v / 1000).toFixed(1) + "K" : v}</span>)}</div>
        <div className="mfd-plot">
          <div className="mfd-bars" style={{ "--mfd-bar-series": series.length }}>
            {labels.map((label, i) => (
              <div key={label} className="mfd-bar-col"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}>
                <div className="mfd-bar-val">
                  {isSubsidyOnly
                    ? L0(data.subsidised[i])
                    : L0(data.subsidised[i] + data.nonSubsidised[i])}
                </div>
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
                  {series.map((s) => (
                    <div key={s.key} className={"mfd-bar-track" + (hover === i ? " active" : "")}>
                      <div className="mfd-bar" style={{ height: (s.values[i] / max * 100) + "%", background: s.color }} />
                    </div>
                  ))}
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

/* ── Section 3: Subsidy Quota by Vehicle ───────────────────────── */
function vehicleStatus(used, quota) {
  if (quota === 0) return "none";
  const pct = (used / quota) * 100;
  if (used > quota) return "over";
  if (pct >= 80) return "at-risk";
  return "within";
}

function SubsidyQuotaByVehicle({ empty }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  if (empty) {
    return (
      <div className="mfd-card mfd-quota-veh-card">
        <div className="mfd-cardhead">
          <div>
            <div className="mfd-cardhead-title">Subsidy Quota by Vehicle</div>
            <div className="mfd-cardhead-sub">Current month · Jun 2026</div>
          </div>
        </div>
        <EmptyBlock icon="local_shipping" title="No vehicle data yet" subtitle="Quota usage per vehicle will appear once your fleet transacts." />
      </div>
    );
  }

  const rows = D.quotaByVehicle.filter((r) => !query || r.plate.toLowerCase().includes(query.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return (
    <div className="mfd-card mfd-quota-veh-card">
      <div className="mfd-cardhead">
        <div>
          <div className="mfd-cardhead-title">Subsidy Quota by Vehicle</div>
          <div className="mfd-cardhead-sub">Current month · Jun 2026 · variable quota per vehicle</div>
        </div>
        <button className="mfd-link">All vehicles <Icon name="arrow_forward" size={14} /></button>
      </div>

      <div className="mfd-vehicle-tools">
        <label className="mfd-vehicle-search">
          <Icon name="search" size={15} />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search vehicle" aria-label="Search vehicle" />
          {query && <button type="button" onClick={() => { setQuery(""); setPage(1); }} aria-label="Clear"><Icon name="close" size={14} /></button>}
        </label>
        <span className="mfd-vehicle-count">{rows.length} vehicles</span>
      </div>

      <div className="mfd-veh-quota-list">
        {pageRows.map((r) => {
          const status = vehicleStatus(r.used, r.quota);
          const pct = r.quota ? (r.used / r.quota) * 100 : 0;
          return (
            <div key={r.plate} className="mfd-veh-quota-row">
              <div className="mfd-veh-quota-lbl">{r.plate}</div>
              <div className="mfd-veh-quota-bar">
                <div className="mfd-veh-quota-track">
                  {r.quota > 0 && <div className={"mfd-veh-quota-fill " + status} style={{ width: Math.min(pct, 100) + "%" }} />}
                </div>
              </div>
              <div className="mfd-veh-quota-val">
                {status === "none" ? "No quota" : (
                  <>
                    <span>{L0(r.used)}</span>
                    <span className="mfd-veh-quota-of"> / {L0(r.quota)}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mfd-vehicle-pager">
        <span>{rows.length ? `${start + 1}-${Math.min(start + pageRows.length, rows.length)} of ${rows.length}` : "0 of 0"}</span>
        <div className="mfd-vehicle-pagebtns">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><Icon name="chevron_left" size={16} /></button>
          <button type="button" disabled={safePage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}><Icon name="chevron_right" size={16} /></button>
        </div>
      </div>

      <div className="mfd-legend">
        <span className="mfd-leg"><span className="mfd-leg-dot" style={{ background: "var(--red-400)" }} /> Over quota</span>
        <span className="mfd-leg"><span className="mfd-leg-dot" style={{ background: "var(--amber-500)" }} /> At risk (&gt;80%)</span>
        <span className="mfd-leg"><span className="mfd-leg-dot" style={{ background: "var(--green-500)" }} /> Within quota</span>
        <span className="mfd-leg"><span className="mfd-leg-dot" style={{ background: "#E9E9E9" }} /> Remaining</span>
      </div>
    </div>
  );
}

/* ── Section 4: Account Activity ───────────────────────────────── */
const ACTIVITY_TABS = [
  { value: "fuel", label: "Fuel Transactions" },
  { value: "topup", label: "Top-Up History" },
  { value: "rebate", label: "Rebate History" },
];

function StatusPill({ status }) {
  const cls = "mfd-status " + status.toLowerCase().replace(/\s+/g, "-");
  return <span className={cls}>{status}</span>;
}

function FuelTable({ rows, empty }) {
  if (empty || !rows.length) return <div className="mfd-table-empty">No fuel transactions yet.</div>;
  return (
    <div className="mfd-table-wrap">
      <table className="ml-table mfd-table">
        <thead>
          <tr>
            <th>Card</th><th>Vehicle</th><th>Station</th><th>Volume</th><th>Subsidy</th><th>Amount</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="mfd-cell-mono">{r.card}</td>
              <td><strong>{r.vehicle}</strong></td>
              <td>{r.station}</td>
              <td>{L(r.volume)}</td>
              <td><span className="mfd-subsidy">{r.subsidyType} · {RM(r.subsidyAmount)}</span></td>
              <td className="mfd-amount">{RM(r.amount)}</td>
              <td>{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopUpTable({ rows, empty }) {
  if (empty || !rows.length) return <div className="mfd-table-empty">No top-up history yet.</div>;
  return (
    <div className="mfd-table-wrap">
      <table className="ml-table mfd-table">
        <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td className="mfd-amount">{RM(r.amount)}</td>
              <td>{r.method}</td>
              <td><StatusPill status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RebateTable({ rows, empty }) {
  if (empty || !rows.length) return <div className="mfd-table-empty">No rebate history yet.</div>;
  return (
    <div className="mfd-table-wrap">
      <table className="ml-table mfd-table">
        <thead><tr><th>Month</th><th>Total fuel</th><th>Total subsidy</th><th>Total rebate</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.month}</td>
              <td>{L0(r.totalFuel)}</td>
              <td>{RM(r.totalSubsidy)}</td>
              <td className="mfd-amount">{RM(r.totalRebate)}</td>
              <td><StatusPill status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountActivity({ empty, tier }) {
  const [tab, setTab] = useState("fuel");
  const showRebate = rank(tier) >= rank("lite");
  const tabs = showRebate ? ACTIVITY_TABS : ACTIVITY_TABS.filter((t) => t.value !== "rebate");
  const activeTab = tabs.find((t) => t.value === tab) || tabs[0];

  return (
    <section className="mfd-card mfd-activity">
      <div className="mfd-cardhead">
        <div>
          <div className="mfd-cardhead-title">Account Activity</div>
        </div>
        <button className="mfd-link">View all transactions <Icon name="arrow_forward" size={14} /></button>
      </div>
      <div className="mfd-tabs">
        {tabs.map((t) => (
          <button key={t.value} className={"ml-tab mfd-tab" + (activeTab.value === t.value ? " active" : "")} onClick={() => setTab(t.value)}>{t.label}</button>
        ))}
      </div>
      {activeTab.value === "fuel" && <FuelTable rows={D.transactions} empty={empty} />}
      {activeTab.value === "topup" && <TopUpTable rows={D.topUps} empty={empty} />}
      {activeTab.value === "rebate" && <RebateTable rows={D.rebates} empty={empty} />}
    </section>
  );
}

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [range, setRange] = useState("mtd");
  const tier = t.subscription;
  const empty = !!t.emptyData;

  return (
    <div className="mfd-shell">
      <Rail />
      <div className="mfd-main">
        <header className="mfd-topbar">
          <OrgSwitcher />
          <div className="mfd-topbar-spacer" />
          <span className="mfd-updated">Last updated: {D.org.lastUpdated}</span>
          <button className="mfd-iconbtn"><Icon name="notifications" size={18} /></button>
        </header>

        <div className="mfd-content">
          <PageHeader range={range} setRange={setRange} />

          <FuelPulse empty={empty} quotaState={t.quotaState} />

          <div className="mfd-row">
            <FuelUsageTrend empty={empty} range={range} />
            <LockSection locked={rank(tier) < rank("lite")} tier="lite" note="Track quota usage per vehicle.">
              <SubsidyQuotaByVehicle empty={empty} />
            </LockSection>
          </div>

          <AccountActivity empty={empty} tier={tier} />
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
            { value: "over", label: "Over quota" },
            { value: "none", label: "No quota" },
          ]}
          onChange={(v) => setTweak("quotaState", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
