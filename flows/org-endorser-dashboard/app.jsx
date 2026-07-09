// app.jsx — Endorser Dashboard.
// Endorser role landing page: restricted nav (Dashboard + Account only),
// KPI row, MTD summary, 6-month trend, and a checklist queue that reuses
// window.SharedShell.ChecklistCard — the same component org-dashboard's
// Safety Checklist tab uses (and MyAdmin's future dashboard will reuse, per
// PRD 6.3.3).

const { useState } = React;
const { Icon, CountCard, CardHead, ChecklistCard, OrgSwitcher } = window.SharedShell;
const D = window.ED_DASH;

/* ── Helpers ───────────────────────────────────────────────────── */
const N = (n) => Number(n).toLocaleString("en-US");

/* ── Sidebar: Endorser gets exactly 2 items, no collapse control ── */
const ED_NAV = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "account",   label: "Account",   icon: "account_circle" },
];
function EdSidebar({ active }) {
  return (
    <nav className="ed-rail" aria-label="Endorser navigation">
      <div className="ed-rail-logo"><Icon name="local_shipping" size={20} color="#fff" /></div>
      {ED_NAV.map((item) => (
        <button key={item.key} type="button" className={"ed-rail-item" + (item.key === active ? " active" : "")}>
          <Icon name={item.icon} size={20} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ── Subscription status banner ───────────────────────────────── */
function BannerMeter({ label, used, total, tooltip }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const atCap = used >= total;
  return (
    <div className="ed-banner-meter">
      <span className="ml-tooltip-wrap ed-banner-meter-label">
        {label}
        <span className="ml-tooltip">{tooltip}</span>
      </span>
      <div className="ed-banner-meter-row">
        <span className="ed-banner-meter-val">{used}/{total}</span>
        <div className="ed-banner-meter-track">
          <div className={"ed-banner-meter-fill" + (atCap ? " full" : "")} style={{ width: pct + "%" }} />
        </div>
      </div>
    </div>
  );
}

function SubscriptionBanner() {
  const s = D.subscription;
  const planLabel = s.plan === "lite" ? "Lite" : s.plan === "premium" ? "Premium" : "Free";
  return (
    <div className="ed-banner">
      <span className="ed-banner-planchip">{planLabel} Plan</span>
      <div className="ed-banner-div" />
      <BannerMeter label="Managed Vehicles" used={s.managedVehicles.used} total={s.managedVehicles.total}
        tooltip="Vehicles currently under active management on your plan." />
      <div className="ed-banner-div" />
      <BannerMeter label="Managed Drivers" used={s.managedDrivers.used} total={s.managedDrivers.total}
        tooltip="Drivers currently under active management on your plan." />
      <button type="button" className="ml-btn-primary">Upgrade</button>
    </div>
  );
}

/* ── KPI row — plain SharedShell.CountCard, no stats band, no fill.
   Tapping a card jumps the Checklist Queue below to the matching tab. ── */
function KpiRowInteractive({ onJump }) {
  const k = D.kpis;
  const tiles = [
    { icon: "pending_actions", count: `${k.pendingToday.count}/${k.pendingToday.total}`, label: "Pending Endorsement Today", sub: k.pendingToday.sub, actionLabel: "View pending", tab: "pending" },
    { icon: "check_circle",    count: `${k.endorsedToday.count}/${k.endorsedToday.total}`, label: "Endorsed Today",          sub: k.endorsedToday.sub, actionLabel: "View endorsed", tab: "endorsed" },
    { icon: "cancel",          count: `${k.rejectedToday.count}/${k.rejectedToday.total}`, label: "Rejected Today",          sub: k.rejectedToday.sub, actionLabel: "View rejected", tab: "rejected" },
    { icon: "error",           count: k.overdue.count,                                     label: "Overdue",                sub: k.overdue.sub,       actionLabel: "View overdue", tab: "overdue" },
    { icon: "schedule",        count: k.avgApprovalTime.value,                             label: "Average Approval Time",  sub: k.avgApprovalTime.sub },
  ];
  return (
    <div className="ed-kpi-row">
      {tiles.map((t, i) => (
        <div key={i} className="ed-kpi-tile" onClick={t.tab ? () => onJump(t.tab) : undefined}>
          <CountCard icon={t.icon} tone={t.tone} count={t.count} label={t.label} sub={t.sub} actionLabel={t.actionLabel} />
        </div>
      ))}
    </div>
  );
}

/* ── Six-month trend: stacked bar (Endorsed/Rejected/Overdue) ──
   Total isn't drawn separately — the stack height already is the total. ── */
function EndorsementTrend() {
  const [hover, setHover] = useState(null);
  const months = D.trend;
  const maxVal = Math.ceil(Math.max(...months.map((m) => m.total)) / 20) * 20;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));

  return (
    <div className="ed-chart">
      <div className="ed-chart-plotwrap">
        <div className="ed-chart-yaxis">
          {ticks.slice().reverse().map((t, i) => <span key={i}>{t}</span>)}
        </div>
        <div className="ed-chart-plot">
          <div className="ed-bars">
            {months.map((m, i) => (
              <div key={i} className="ed-bar-col" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {hover === i && (
                  <div className="ed-bar-tip">
                    <div className="ed-bar-tip-val">{N(m.total)} total · {m.label}</div>
                    <div className="ed-bar-tip-row"><i className="ed-dot endorsed" />Endorsed {N(m.endorsed)}</div>
                    <div className="ed-bar-tip-row"><i className="ed-dot rejected" />Rejected {N(m.rejected)}</div>
                    <div className="ed-bar-tip-row"><i className="ed-dot overdue" />Overdue {N(m.overdue)}</div>
                  </div>
                )}
                <div className="ed-bar-track">
                  <div className="ed-bar-seg overdue"  style={{ height: `${(m.overdue  / maxVal) * 100}%` }} />
                  <div className="ed-bar-seg rejected" style={{ height: `${(m.rejected / maxVal) * 100}%` }} />
                  <div className="ed-bar-seg endorsed" style={{ height: `${(m.endorsed / maxVal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ed-chart-xaxis">
        {months.map((m, i) => <span key={i}>{m.label.split(" ")[0]}</span>)}
      </div>
      <div className="ed-chart-legend">
        <span><i className="ed-dot endorsed" />Endorsed</span>
        <span><i className="ed-dot rejected" />Rejected</span>
        <span><i className="ed-dot overdue" />Overdue</span>
      </div>
    </div>
  );
}

/* ── MTD summary card ──────────────────────────────────────────── */
function MtdDataCard() {
  const m = D.mtd;
  const rows = [
    { label: "Total Endorsement", value: N(m.totalEndorsement) },
    { label: "Not Yet Endorsed",  value: N(m.pending + m.overdue) },
    { label: "Approval Rate",     value: `${m.approvalRate}%` },
    { label: "Rejected Rate",     value: `${m.rejectedRate}%` },
  ];
  return (
    <div className="ed-mtd">
      {rows.map((r, i) => (
        <div className="ed-mtd-row" key={i}>
          <span className="ed-mtd-label">{r.label}</span>
          <span className="ed-mtd-value">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Checklist Queue: 4 tabs, shared ChecklistCard grid ───────────── */
const QUEUE_TABS = [
  { key: "pending",  label: "Pending Endorsement Today" },
  { key: "endorsed", label: "Endorsed Today" },
  { key: "rejected", label: "Rejected Today" },
  { key: "overdue",  label: "Overdue" },
];
function ChecklistQueue({ tab, setTab }) {
  const rows = D.checklists[tab] || [];
  return (
    <div className="ed-queue">
      <div className="ed-queue-head">
        <h2 className="ed-sec-title">Checklist Queue</h2>
      </div>
      <div className="ml-tabs">
        {QUEUE_TABS.map((t) => (
          <button key={t.key} className={"ml-tab" + (t.key === tab ? " active" : "")} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="ed-emptyrow">Nothing here.</div>
      ) : (
        <div className="ed-queue-grid">
          {rows.map((r) => <ChecklistCard key={r.plate} row={r} />)}
        </div>
      )}
      <div className="ed-queue-footer">
        <a className="ml-btn-text-blue" href={D.seeAllHref}>See all safety checklists<Icon name="chevron_right" size={16} /></a>
      </div>
    </div>
  );
}

/* ── Page head ─────────────────────────────────────────────────── */
function PageHead() {
  return (
    <div className="ed-pagehead">
      <h1 className="ed-pagetitle">Endorser Dashboard</h1>
      <SubscriptionBanner />
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [tab, setTab] = useState("pending");
  return (
    <div className="ed-shell">
      <EdSidebar active="dashboard" />
      <div className="ed-main">
        <header className="ed-topbar">
          <OrgSwitcher orgs={[{ id: D.org.id, name: D.org.name, role: D.org.orgLabel }]} initialId={D.org.id} />
          <div className="ed-topbar-spacer" />
        </header>
        <div className="ed-content">
          <PageHead />
          <KpiRowInteractive onJump={setTab} />
          <div className="ed-midgrid">
            <div className="ed-card ed-chartcard">
              <CardHead icon="bar_chart" title="Endorsement Trend" sub="Last 6 months" />
              <EndorsementTrend />
            </div>
            <div className="ed-card ed-mtdcard">
              <CardHead icon="fact_check" title="Monthly Endorsement Data (MTD)" />
              <MtdDataCard />
            </div>
          </div>
          <ChecklistQueue tab={tab} setTab={setTab} />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
