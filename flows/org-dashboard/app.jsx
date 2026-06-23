// app.jsx — Main Org Dashboard (revamp prototype).
// Spec: specs/org-dashboard-revamp.md. Two tweak axes drive every state:
//   subscription: free | lite | premium    (gating, PRD §7)
//   emptyData:    populated | empty         (OQ-06 new-org state)
// Lock wins over empty: a gated section shows the blurred upsell preview even
// when emptyData is on. Reuses window.SharedShell.LockSection for all gates.

const { useState } = React;
const { Icon, LockSection, CountCard } = window.SharedShell;
const D = window.ORG_DASH;

/* ── Helpers ───────────────────────────────────────────────────── */
const TIER_RANK = { free: 0, lite: 1, premium: 2, enterprise: 3 };
const rank = (t) => TIER_RANK[t] ?? 0;
// Currency rendered as "$" (legal: avoid "RM" branding in prototype).
const RM = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const RM0 = (n) => "$" + Number(n).toLocaleString("en-US");
// Balance health tone from remaining runway → drives gradient.
const balanceTone = (days) => (days >= 14 ? "" : days >= 5 ? " amber" : " red");

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "subscription": "premium",
  "emptyData": false
}/*EDITMODE-END*/;

/* ── Rail (Org Portal nav: Home / Organization / Account) ──────── */
// Desktop: left rail. Mobile: floating bottom nav (CSS handles the swap).
const RAIL = [
  { icon: "home", label: "Home", active: true },
  { icon: "domain", label: "Organization" },
  { icon: "person", label: "Account" },
];
function Rail() {
  return (
    <nav className="od-rail">
      <div className="od-rail-logo"><Icon name="local_shipping" size={22} color="#fff" /></div>
      {RAIL.map((r) => (
        <div key={r.label} className={"od-rail-item" + (r.active ? " active" : "")} title={r.label}>
          <Icon name={r.icon} size={22} fill={r.active ? 1 : 0} />
          <span>{r.label}</span>
        </div>
      ))}
    </nav>
  );
}

/* ── Section 1: Top Pulse ──────────────────────────────────────── */
function TopPulse({ empty }) {
  const b = D.balance, o = D.operatingCost, v = D.vehicles, dr = D.drivers;
  return (
    <div className="od-pulse">
      {/* Balance — wide card; gradient tone reflects runway health */}
      <div className={"od-kpi od-kpi-balance" + (empty ? "" : balanceTone(b.daysRemaining))}>
        <div className="od-bal-top">
          <span className="od-bal-label">Balance</span>
          <span className="od-bal-updated">Last updated<br />{D.org.lastUpdated}</span>
        </div>
        <div className="od-bal-value">{empty ? "RM 0.00" : RM(b.amount)}</div>
        <span className="od-bal-pill">
          <Icon name="schedule" size={13} color="#fff" />
          {empty ? "No usage yet" : `Est. remaining ${b.daysRemaining} days`}
        </span>
        <div className="od-bal-band">
          <div className="od-bal-cell">
            <div className="od-bal-cell-l">Balance lasts <Icon name="info" size={12} color="rgba(255,255,255,.7)" /></div>
            <div className="od-bal-cell-v">{empty ? "—" : `${b.daysRemaining} days`}</div>
          </div>
          <div className="od-bal-cell">
            <div className="od-bal-cell-l">Current usage</div>
            <div className="od-bal-cell-v">{empty ? "RM 0.00" : RM(b.currentUsage)}</div>
          </div>
          <div className="od-bal-cell">
            <div className="od-bal-cell-l">Last month usage</div>
            <div className="od-bal-cell-v">{empty ? "RM 0.00" : RM(b.lastMonthUsage)}</div>
          </div>
        </div>
        <div className="od-bal-foot"><Icon name="arrow_forward" size={15} color="#fff" /> MyFuel</div>
      </div>

      {/* Operating Cost — today snapshot */}
      <div className="od-kpi">
        <div className="od-kpi-head">
          <div className="od-kpi-id">
            <div className="od-kpi-ico ring"><Icon name="attach_money" size={20} /></div>
            <div>
              <div className="od-kpi-label">Operating Cost</div>
              <div className="od-kpi-sub">Today</div>
            </div>
          </div>
        </div>
        <div className="od-kpi-value">{empty ? "RM 0" : RM0(o.today)}</div>
        {!empty && (
          <div className={"od-trend " + o.trendDir}>
            <Icon name={o.trendDir === "up" ? "trending_up" : "trending_down"} size={14} />
            {o.trendPct}% vs yesterday
          </div>
        )}
        <div className="od-kpi-line">
          <span className="od-kpi-line-l">Fuel</span>
          <span className="od-kpi-line-v">{empty ? "RM 0" : RM0(o.fuel)}</span>
        </div>
        <div className="od-kpi-foot"><Icon name="arrow_forward" size={14} /> Cost detail</div>
      </div>

      {/* Vehicles + Drivers — shared CountCard (Figma 8369-14054) */}
      <CountCard fill icon="local_shipping" count={empty ? 0 : v.total} label="Vehicles" sub="Total in fleet"
        stats={[
          { n: empty ? 0 : v.inUse, label: "In use", tone: "green" },
          { n: empty ? 0 : v.unused, label: "Unused", tone: "gray" },
          { n: empty ? 0 : v.inactive, label: "Inactive", tone: "red" },
        ]} />

      <CountCard fill icon="groups" count={empty ? 0 : dr.total} label="Drivers" sub="Total registered"
        stats={[
          { n: empty ? 0 : dr.onDuty, label: "On duty", tone: "green" },
          { n: empty ? 0 : dr.offDuty, label: "Off duty", tone: "gray" },
        ]} />
    </div>
  );
}

/* ── Section 2: Modules ────────────────────────────────────────── */
function Modules({ tier }) {
  return (
    <div className="od-card">
      <div className="od-sec-title">Your Modules</div>
      <div className="od-modules">
        {D.modules.map((m) => {
          const state = m.soon ? "soon" : rank(tier) >= rank(m.minTier) ? "active" : "locked";
          const tag = state === "active" ? "Active" : state === "locked" ? "Locked" : "Coming soon";
          return (
            <div key={m.key} className={"od-mod " + state}>
              <div className="od-mod-ico"><Icon name={m.icon} size={18} fill={state === "active" ? 1 : 0} /></div>
              <div className="od-mod-name">{m.name}</div>
              <span className={"od-modtag " + state}>
                {state === "locked" && <Icon name="lock" size={11} />}
                {tag}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Section 3: Operating Cost Trend ───────────────────────────── */
const COST_TIMES = [
  { value: "today", label: "Today" },
  { value: "mtd", label: "MTD" },
  { value: "6m", label: "Last 6 Months" },
];
function Segmented({ value, onChange, options }) {
  return (
    <div className="ml-seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value}
          className={"ml-seg-btn" + (value === o.value ? " active" : "")}
          onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}
function CostTrend({ tier, empty }) {
  const [time, setTime] = useState("6m");
  const [view, setView] = useState("overall");
  const perVehLocked = rank(tier) < rank("lite");

  const overallBars = () => {
    if (empty) return <EmptyBlock icon="bar_chart" t="No cost data yet" s="Fuel spend will appear here once transactions come in." />;
    const top = 16000; // fixed y-scale so gridlines read cleanly (16K → 0)
    const ticks = [16, 12, 8, 4, 0];
    return (
      <div>
        <div className="od-chart-axislbl">Amount ($)</div>
        <div className="od-plotwrap">
          <div className="od-yaxis">{ticks.map((t) => <span key={t}>{t}K</span>)}</div>
          <div className="od-plot">
            <div className="od-bars">
              {D.costTrend.months.map((m) => (
                <div key={m.label} className="od-bar-col">
                  <div className="od-bar-val">{m.fuel.toLocaleString("en-US")}</div>
                  <div className={"od-bar" + (m.current ? " current" : "")} style={{ height: (m.fuel / top * 100) + "%" }} />
                </div>
              ))}
            </div>
            <div className="od-xaxis">
              {D.costTrend.months.map((m) => <span key={m.label} className="od-xlbl">{m.label}</span>)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const perVehicleBars = () => {
    if (empty) return <EmptyBlock icon="bar_chart" t="No cost data yet" s="Per-vehicle fuel spend will appear here." />;
    const max = Math.max(...D.costTrend.perVehicle.map((r) => r.fuel));
    return (
      <div className="od-hbars">
        {D.costTrend.perVehicle.map((r) => (
          <div key={r.label} className="od-hbar-row">
            <div className="od-hbar-lbl">{r.label}</div>
            <div className="od-hbar-track"><div className="od-hbar-fill" style={{ width: (r.fuel / max * 100) + "%" }} /></div>
            <div className="od-hbar-val">{RM0(r.fuel)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="od-card">
      <div className="od-trend-controls">
        <div>
          <div className="od-sec-title">Operating Cost Trend</div>
          <div className="od-sec-sub">Fuel only · other categories coming soon</div>
        </div>
        <Segmented value={time} onChange={setTime} options={COST_TIMES} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Segmented value={view} onChange={setView}
          options={[{ value: "overall", label: "Overall" }, { value: "vehicle", label: "Per Vehicle" }]} />
      </div>

      <div className="od-chart">
        {view === "overall"
          ? overallBars()
          : <LockSection locked={perVehLocked} tier="lite" cta="Upgrade plan"
              note="See fuel spend broken down per vehicle on Lite and above.">
              {perVehicleBars()}
            </LockSection>}
      </div>

      <div className="od-legend">
        <span className="od-leg"><span className="od-leg-dot" style={{ background: "var(--green-500)" }} /> Fuel (current)</span>
        <span className="od-leg soon"><span className="od-leg-dot" style={{ background: "#D6DAD8" }} /> Other categories (coming soon)</span>
      </div>
      <div className="od-chart-foot">
        <span className="od-chart-hint"><Icon name="ads_click" size={14} /> Click a segment → filtered detail</span>
        <button className="od-link"><Icon name="download" size={15} /> Export</button>
      </div>
    </div>
  );
}

/* ── Section 4: Trips Today ─────────────────────────────────────── */
function TripsTodayInner({ empty }) {
  const t = D.trips;
  if (empty) return (
    <div style={{ marginTop: 8 }}>
      <EmptyBlock icon="local_shipping" t="No trips today" s="Assigned trips will show here once your team schedules them." />
    </div>
  );
  const pct = Math.round(t.completed / t.total * 100);
  return (
    <div className="od-trips">
      <div className="od-donut-wrap">
        <div className="od-donut" style={{ background: `conic-gradient(var(--green-500) ${pct}%, var(--bg-muted) 0)` }}>
          <div className="od-donut-inner">
            <div className="od-donut-n">{t.completed}/{t.total}</div>
            <div className="od-donut-l">completed</div>
          </div>
        </div>
        <div className="od-trips-legend">
          <div className="od-trip-stat"><span className="od-trip-k"><span className="od-leg-dot" style={{ background: "var(--green-500)" }} /> Ongoing</span><span className="od-trip-v">{t.ongoing}</span></div>
          <div className="od-trip-stat"><span className="od-trip-k"><span className="od-leg-dot" style={{ background: "var(--amber-500)" }} /> Pending</span><span className="od-trip-v">{t.pending}</span></div>
          <div className="od-trip-stat"><span className="od-trip-k"><span className="od-leg-dot" style={{ background: "var(--fg-disabled)" }} /> Paused</span><span className="od-trip-v">{t.paused}</span></div>
        </div>
      </div>
      <div className="od-trips-actions">
        <button className="od-btn od-btn-primary"><Icon name="visibility" size={16} /> View trips</button>
      </div>
    </div>
  );
}
function TripsToday({ tier, empty }) {
  const locked = rank(tier) < rank("premium");
  return (
    <div className="od-card">
      <div className="od-sec-title">Trips Today</div>
      <LockSection locked={locked} tier="premium" cta="Unlock MyTrip"
        note="Track trip progress and driver locations in real time.">
        <TripsTodayInner empty={empty && !locked} />
      </LockSection>
    </div>
  );
}

/* ── Section 5: Action Needed ──────────────────────────────────── */
function ActionNeeded({ empty }) {
  return (
    <div className="od-actneed">
      {D.actionNeeded.map((a) => (
        <div key={a.key} className="od-an">
          <div className={"od-an-ico " + a.tone}><Icon name={a.icon} size={20} /></div>
          <div>
            <div className="od-an-n">{empty ? 0 : a.count}</div>
            <div className="od-an-l">{a.label}</div>
          </div>
          <Icon name="chevron_right" size={20} style={{ marginLeft: "auto" }} />
        </div>
      ))}
    </div>
  );
}

/* ── Section 6: Action Preview ─────────────────────────────────── */
function ActionPreview({ tier, empty }) {
  const tripsActive = rank(tier) >= rank("premium");
  const TABS = [
    { value: "fuel", label: "Fuel TXNs", rows: D.preview.fuel },
    { value: "due", label: "Due Statuses", rows: D.preview.due },
    { value: "checklists", label: "Checklists", rows: D.preview.checklists },
    ...(tripsActive ? [{ value: "trips", label: "Trips", rows: D.preview.trips }] : []),
  ];
  const [tab, setTab] = useState("fuel");
  const active = TABS.find((t) => t.value === tab) || TABS[0];
  const rows = empty ? [] : active.rows;

  return (
    <div className="od-card od-preview">
      <div className="od-trend-controls" style={{ marginTop: 0 }}>
        <div className="od-sec-title">Action Preview</div>
        <button className="od-link">View all <Icon name="open_in_new" size={14} /></button>
      </div>
      <div className="od-tabs">
        {TABS.map((t) => (
          <button key={t.value} className={"od-tab" + (t.value === tab ? " active" : "")} onClick={() => setTab(t.value)}>{t.label}</button>
        ))}
      </div>
      <table className="od-ptable">
        <thead>
          <tr><th>Date / Time</th><th>Item / Vehicle</th><th>Category</th><th>Details</th><th>Amount</th><th>Action</th></tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={6} className="od-emptyrow">{empty ? "No records yet — data will appear as your fleet operates." : "Nothing here."}</td></tr>
          ) : rows.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td>{r.item}</td>
              <td><span className={"od-cat " + r.catTone}>{r.cat}</span></td>
              <td style={{ color: "var(--fg-secondary)" }}>{r.detail}</td>
              <td className="od-amt">{r.amount}</td>
              <td><span className="od-rowact">View details <Icon name="chevron_right" size={15} /></span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Shared empty block ────────────────────────────────────────── */
function EmptyBlock({ icon, t, s }) {
  return (
    <div className="od-empty">
      <Icon name={icon} size={34} />
      <div className="od-empty-t">{t}</div>
      <div className="od-empty-s">{s}</div>
    </div>
  );
}

/* ── Tweaks ────────────────────────────────────────────────────── */
const { useTweaks, TweaksPanel, TweakSection, TweakSelect, TweakToggle } = window;

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const tier = t.subscription;
  const empty = !!t.emptyData;

  return (
    <div className="od-shell">
      <Rail />
      <div className="od-main">
        <header className="od-topbar">
          <button className="od-org">{D.org.name} <Icon name="expand_more" size={16} /></button>
          <div className="od-topbar-spacer" />
          <span className="od-updated">Last updated: {D.org.lastUpdated}</span>
          <button className="od-datepick"><Icon name="calendar_today" size={15} /> {D.org.date} <Icon name="expand_more" size={15} /></button>
          <button className="od-iconbtn"><Icon name="notifications" size={18} /></button>
        </header>

        <div className="od-content">
          <div className="od-pagehead">
            <span className="od-pagetitle">Dashboard</span>
            <span className="od-planchip"><Icon name="workspace_premium" size={14} /> {D.org.plan}</span>
          </div>
          <div className="od-welcome">Welcome back. Here's what's happening with your fleet today.</div>

          {/* 1 — Top Pulse */}
          <TopPulse empty={empty} />

          {/* 2 — Modules */}
          <Modules tier={tier} />

          {/* 3 + 4 — Trend / Trips */}
          <div className="od-row">
            <CostTrend tier={tier} empty={empty} />
            <TripsToday tier={tier} empty={empty} />
          </div>

          {/* 5 — Action Needed */}
          <ActionNeeded empty={empty} />

          {/* 6 — Action Preview */}
          <ActionPreview tier={tier} empty={empty} />
        </div>
      </div>

      <TweaksPanel title="Prototype State">
        <TweakSection label="Subscription tier" />
        <TweakSelect label="Plan" value={t.subscription}
          options={[
            { value: "free", label: "Free" },
            { value: "lite", label: "Lite (+ MyAdmin)" },
            { value: "premium", label: "Premium (+ MyTrip)" },
          ]}
          onChange={(v) => setTweak("subscription", v)} />
        <TweakSection label="Data" />
        <TweakToggle label="Empty (new org)" value={t.emptyData} onChange={(v) => setTweak("emptyData", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
