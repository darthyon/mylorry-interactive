// app.jsx — Main Org Dashboard (revamp prototype).
// Spec: specs/org-dashboard-revamp.md. Two tweak axes drive every state:
//   subscription: free | lite | premium    (gating, PRD §7)
//   emptyData:    populated | empty         (OQ-06 new-org state)
// Lock wins over empty: a gated section shows the blurred upsell preview even
// when emptyData is on. Reuses window.SharedShell.LockSection for all gates.

const { useState, useEffect, useRef } = React;
const { Icon, LockSection, CountCard, PetronLogo } = window.SharedShell;
const D = window.ORG_DASH;

/* ── Helpers ───────────────────────────────────────────────────── */
const TIER_RANK = { free: 0, lite: 1, premium: 2, enterprise: 3 };
const rank = (t) => TIER_RANK[t] ?? 0;
const Wallet = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const RM = (n) => "RM " + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const RM0 = (n) => "RM " + Number(n).toLocaleString("en-US");
const L = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " L";
// Balance health tone from remaining runway → drives gradient.
const balanceTone = (days) => (days >= 14 ? "" : days >= 5 ? " amber" : " red");

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "subscription": "premium",
  "emptyData": false
}/*EDITMODE-END*/;

const PLAN_LABEL = { free: "Free Plan", lite: "Lite Plan", premium: "Premium Plan" };

function initials(name = "") {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";
}

/* ── Org switcher (GitHub-style subtle dropdown) ─────────────── */
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
    <div className="od-org-switcher" ref={wrapRef}>
      <button
        type="button"
        className="od-org-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="od-org-avatar">{initials(selected.name)}</span>
        <span className="od-org-name">{selected.name}</span>
        <Icon name={open ? "expand_less" : "expand_more"} size={16} />
      </button>
      {open && (
        <div className="od-org-menu" role="menu">
          <div className="od-org-menu-h">Switch organization</div>
          {D.orgs.map((o) => (
            <button
              key={o.id}
              type="button"
              className={"od-org-item" + (o.id === selectedId ? " active" : "")}
              role="menuitem"
              onClick={() => { setSelectedId(o.id); setOpen(false); }}
            >
              <span className="od-org-item-avatar">{initials(o.name)}</span>
              <span className="od-org-item-name">{o.name}</span>
              <span className="od-org-item-role">{o.role}</span>
              {o.id === selectedId && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

/* ── Wallet Logo ───────────────────────────────────────────────── */
function WalletLogo({ wallet, size = 16 }) {
  if (wallet.logo === "petron") return <PetronLogo size={size} />;
  const abbr = wallet.logo === "petronas" ? "PN" : wallet.logo === "shell" ? "SH" : wallet.name[0].toUpperCase();
  return <span className="od-wallet-abbr">{abbr}</span>;
}

/* ── Wallet Picker (dropdown / mobile bottom-sheet) ─────────────── */
function WalletPicker({ wallets, selectedId, onSelect, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  return (
    <div className="od-wallet-picker" ref={ref} role="menu">
      <div className="od-wallet-picker-h">Switch wallet</div>
      {wallets.map((w, i) => (
        <button key={w.id} className={"od-wallet-item" + (w.id === selectedId ? " active" : "")}
          onClick={() => onSelect(i)} role="menuitem">
          <span className="od-wallet-item-check">{w.id === selectedId && <Icon name="check" size={14} />}</span>
          <span className="od-wallet-item-logo"><WalletLogo wallet={w} size={14} /></span>
          <span className="od-wallet-item-name">{w.name}</span>
          <span className="od-wallet-item-bal">{Wallet(w.amount)}</span>
          {w.status === "low" && <span className="od-wallet-item-tag low">Low</span>}
          {w.status === "critical" && <span className="od-wallet-item-tag critical">Critical</span>}
        </button>
      ))}
    </div>
  );
}

/* ── Balance Card (wallet-aware) ───────────────────────────────── */
function BalanceCard({ empty }) {
  const wallets = D.wallets || [];
  const multi = wallets.length > 1;

  const [idx, setIdx] = useState(() => {
    try {
      const n = parseInt(localStorage.getItem("od_wallet_" + D.org.id), 10);
      return (!isNaN(n) && n < wallets.length) ? n : 0;
    } catch { return 0; }
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const cardRef = useRef(null);
  const touchX = useRef(null);

  const w = wallets[idx] || null;

  function go(dir) {
    setIdx(i => {
      const next = (i + dir + wallets.length) % wallets.length;
      try { localStorage.setItem("od_wallet_" + D.org.id, next); } catch {}
      return next;
    });
  }

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !multi) return;
    const onStart = (e) => { touchX.current = e.touches[0].clientX; };
    const onEnd = (e) => {
      if (touchX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => { el.removeEventListener("touchstart", onStart); el.removeEventListener("touchend", onEnd); };
  }, [multi, wallets.length]);

  if (!w) {
    return (
      <div className="od-kpi od-kpi-balance">
        <div className="od-bal-top"><span className="od-bal-label">Balance</span></div>
        <div className="od-bal-value od-bal-unavail">No wallet available</div>
      </div>
    );
  }

  const tone = empty ? "" : balanceTone(w.daysRemaining);

  // Shared band renderer
  function UsageBand({ wallet }) {
    return (
      <div className="od-bal-band">
        <div className="od-bal-cell">
          <div className="od-bal-cell-l">May usage</div>
          <div className="od-bal-cell-v">{empty ? "RM 0.00" : RM(wallet.currentUsage)}</div>
          <div className="od-bal-cell-s">{empty ? "0.00 L" : L(wallet.currentUsageLitres)}</div>
        </div>
        <div className="od-bal-cell">
          <div className="od-bal-cell-l">Last month usage</div>
          <div className="od-bal-cell-v">{empty ? "RM 0.00" : RM(wallet.lastMonthUsage)}</div>
          <div className="od-bal-cell-s">{empty ? "0.00 L" : L(wallet.lastMonthUsageLitres)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={"od-kpi od-kpi-balance" + tone} ref={cardRef}>

      {/* ── Desktop: single card, hover arrows ── */}
      <div className="od-bal-desktop">
        {multi && (
          <button className="od-bal-warrow od-bal-wl" onClick={() => go(-1)} aria-label="Previous wallet">
            <Icon name="chevron_left" size={16} color="#1a3a25" />
          </button>
        )}
        {multi && (
          <button className="od-bal-warrow od-bal-wr" onClick={() => go(1)} aria-label="Next wallet">
            <Icon name="chevron_right" size={16} color="#1a3a25" />
          </button>
        )}
        <div className="od-bal-top">
          <div className="od-bal-wname-wrap">
            <button className="od-bal-wname" onClick={() => multi && setPickerOpen(v => !v)}
              aria-haspopup={multi ? "true" : undefined} style={!multi ? { cursor: "default" } : {}}>
              <WalletLogo wallet={w} size={14} />
              <span className="od-bal-wname-label">{w.name}</span>
              {multi && <Icon name="expand_more" size={13} color="rgba(255,255,255,.65)"
                style={{ flexShrink: 0, transition: "transform .15s", transform: pickerOpen ? "rotate(180deg)" : "rotate(0deg)" }} />}
            </button>
            {pickerOpen && (
              <WalletPicker wallets={wallets} selectedId={w.id}
                onSelect={(i) => { setIdx(i); try { localStorage.setItem("od_wallet_" + D.org.id, i); } catch {} setPickerOpen(false); }}
                onClose={() => setPickerOpen(false)} />
            )}
          </div>
          <span className="od-bal-updated">Last updated<br />{D.org.lastUpdated}</span>
        </div>
        <div className="od-bal-sublabel">Balance</div>
        <div className="od-bal-value">{empty ? "$0.00" : Wallet(w.amount)}</div>
        <span className="od-bal-pill">
          <Icon name="schedule" size={13} color="#fff" />
          {empty ? "No usage yet" : `Est. remaining ${w.daysRemaining} days`}
        </span>
        <UsageBand wallet={w} />
        {multi && (
          <div className="od-bal-dots" role="tablist" aria-label="Wallet position">
            {wallets.map((wl, i) => (
              <button key={wl.id} role="tab" aria-selected={i === idx} aria-label={wl.name}
                className={"od-bal-dot" + (i === idx ? " active" : "")}
                onClick={() => { setIdx(i); try { localStorage.setItem("od_wallet_" + D.org.id, i); } catch {} }} />
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile: horizontal snap scroll, each wallet its own card ── */}
      <div className="od-bal-mobile">
        <div className="od-bal-mscroll">
          {wallets.map((wl) => (
            <div key={wl.id} className={"od-bal-mcard" + (empty ? "" : balanceTone(wl.daysRemaining))}>
              <div className="od-bal-top">
                <span className="od-bal-mcard-name">
                  <WalletLogo wallet={wl} size={13} />
                  <span>{wl.name}</span>
                </span>
                <span className="od-bal-updated">Last updated<br />{D.org.lastUpdated}</span>
              </div>
              <div className="od-bal-sublabel">Balance</div>
              <div className="od-bal-value">{empty ? "$0.00" : Wallet(wl.amount)}</div>
              <span className="od-bal-pill">
                <Icon name="schedule" size={13} color="#fff" />
                {empty ? "No usage yet" : `Est. remaining ${wl.daysRemaining} days`}
              </span>
              <UsageBand wallet={wl} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ── Section 1: Top Pulse ──────────────────────────────────────── */
function TopPulse({ empty }) {
  const o = D.operatingCost, v = D.vehicles, dr = D.drivers;
  return (
    <div className="od-pulse">
      <BalanceCard empty={empty} />

      {/* Operating Cost — today snapshot */}
      <div className="od-kpi od-kpi-cost">
        <div className="od-kpi-head">
          <div className="od-kpi-id">
            <div className="od-kpi-ico"><Icon name="attach_money" size={20} /></div>
            <div>
              <div className="od-kpi-label">Operating Cost</div>
              <div className="od-kpi-sub">Today</div>
            </div>
          </div>
          <button className="od-card-arrow" aria-label="Open cost detail">
            <Icon name="arrow_forward" size={15} />
          </button>
        </div>
        <div className="od-kpi-cost-main">
          <div className="od-kpi-value">{empty ? "RM 0" : RM0(o.today)}</div>
          {!empty && (
            <div className={"od-trend " + o.trendDir}>
              <Icon name={o.trendDir === "up" ? "trending_up" : "trending_down"} size={14} />
              {o.trendPct}% vs yesterday
            </div>
          )}
        </div>
        <div className="od-kpi-line">
          <span className="od-kpi-line-l">Fuel</span>
          <span className="od-kpi-line-v">{empty ? "RM 0" : RM0(o.fuel)}</span>
        </div>
      </div>

      {/* Vehicles + Drivers — shared CountCard (Figma 8369-14054) */}
      <CountCard fill icon="local_shipping" count={empty ? 0 : v.total} label="Vehicles" sub="Total in fleet" actionLabel="Open vehicles"
        stats={[
          { n: empty ? 0 : v.inUse, label: "In use", tone: "green" },
          { n: empty ? 0 : v.unused, label: "Unused", tone: "gray" },
          { n: empty ? 0 : v.inactive, label: "Inactive", tone: "red" },
        ]} />

      <CountCard fill icon="groups" count={empty ? 0 : dr.total} label="Drivers" sub="Total registered" actionLabel="Open drivers"
        stats={[
          { n: empty ? 0 : dr.onDuty, label: "On duty", tone: "green" },
          { n: empty ? 0 : dr.offDuty, label: "Off duty", tone: "gray" },
        ]} />
    </div>
  );
}

/* ── Section 2: Modules ────────────────────────────────────────── */
function Modules({ tier }) {
  const modules = D.modules.map((m) => {
    const state = m.soon ? "soon" : rank(tier) >= rank(m.minTier) ? "active" : "locked";
    return { ...m, state, tag: state === "active" ? "Active" : state === "locked" ? "Locked" : "Coming soon" };
  });
  const activeCount = modules.filter((m) => m.state === "active").length;
  return (
    <section className="od-modrail-card">
      <div className="od-modrail-head">
        <div className="od-sec-title">Modules</div>
        <span>{activeCount} active</span>
      </div>
      <div className="od-modules">
        {modules.map((m) => {
          const isMyFuelLink = m.key === "myfuel" && m.state === "active";
          const body = (
            <>
              <div className="od-mod-ico"><img src={m.iconSrc} alt="" aria-hidden="true" /></div>
              <div className="od-mod-copy">
                <div className="od-mod-name">{m.name}</div>
                <span className={"od-modtag " + m.state}>
                  {m.state === "locked" && <Icon name="lock" size={11} />}
                  {m.tag}
                </span>
              </div>
              {m.state === "active" && <Icon name="arrow_forward" size={15} style={{ marginLeft: "auto" }} />}
            </>
          );
          if (isMyFuelLink) {
            return (
              <a key={m.key} href="../org-myfuel-dashboard/index.html" className="od-mod active" style={{ textDecoration: "none" }}>
                {body}
              </a>
            );
          }
          return (
            <button key={m.key} type="button" className={"od-mod " + m.state} disabled={m.state === "soon"}>
              {body}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ── Section 3: Operating Cost Trend ───────────────────────────── */
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
  const [view, setView] = useState("overall");
  const [barHover, setBarHover] = useState(null);
  const [hbarHover, setHbarHover] = useState(null);
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [vehiclePage, setVehiclePage] = useState(1);
  const perVehLocked = rank(tier) < rank("lite");
  const vehiclePageSize = 5;

  const overallBars = () => {
    if (empty) return <EmptyBlock icon="bar_chart" t="No cost data yet" s="Fuel spend will appear here once transactions come in." />;
    const top = 16000; // fixed y-scale so gridlines read cleanly (16K → 0)
    const ticks = [16, 12, 8, 4, 0];
    return (
      <div>
        <div className="od-chart-axislbl">Amount (RM)</div>
        <div className="od-plotwrap">
          <div className="od-yaxis">{ticks.map((t) => <span key={t}>{t}K</span>)}</div>
          <div className="od-plot">
            <div className="od-bars">
              {D.costTrend.months.map((m, index) => (
                <div
                  key={m.label}
                  className="od-bar-col"
                  onMouseEnter={() => setBarHover(index)}
                  onMouseLeave={() => setBarHover(null)}
                  onClick={() => setBarHover((current) => current === index ? null : index)}
                >
                  <div className="od-bar-val">{m.fuel.toLocaleString("en-US")}</div>
                  <div className={"od-bar-track" + (barHover === index ? " active" : "")}>
                    <div className={"od-bar" + (m.current ? " current" : "") + (barHover === index ? " active" : "")} style={{ height: (m.fuel / top * 100) + "%" }} />
                    {barHover === index && (
                      <div className="od-bar-tip">
                        <div className="od-bar-tip-val">{RM0(m.fuel)}</div>
                        <div className="od-bar-tip-period">{m.label}</div>
                      </div>
                    )}
                  </div>
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
    const query = vehicleQuery.trim().toLowerCase();
    const filtered = D.costTrend.perVehicle.filter((r) => !query || r.label.toLowerCase().includes(query));
    const pageCount = Math.max(1, Math.ceil(filtered.length / vehiclePageSize));
    const safePage = Math.min(vehiclePage, pageCount);
    const start = (safePage - 1) * vehiclePageSize;
    const rows = filtered.slice(start, start + vehiclePageSize);
    const max = Math.max(...D.costTrend.perVehicle.map((r) => r.fuel));
    return (
      <div className="od-hbars-panel">
        <div className="od-vehicle-tools">
          <label className="od-vehicle-search">
            <Icon name="search" size={15} />
            <input
              value={vehicleQuery}
              onChange={(e) => { setVehicleQuery(e.target.value); setVehiclePage(1); }}
              placeholder="Search vehicle"
              aria-label="Search vehicle"
            />
            {vehicleQuery && (
              <button type="button" onClick={() => { setVehicleQuery(""); setVehiclePage(1); }} aria-label="Clear vehicle search">
                <Icon name="close" size={14} />
              </button>
            )}
          </label>
          <span className="od-vehicle-count">{filtered.length} vehicles</span>
        </div>
        {rows.length ? (
          <div className="od-hbars">
            {rows.map((r) => {
              const sourceIndex = D.costTrend.perVehicle.findIndex((item) => item.label === r.label);
              return (
                <div
                  key={r.label}
                  className={"od-hbar-row" + (hbarHover === sourceIndex ? " active" : "")}
                  onMouseEnter={() => setHbarHover(sourceIndex)}
                  onMouseLeave={() => setHbarHover(null)}
                  onClick={() => setHbarHover((current) => current === sourceIndex ? null : sourceIndex)}
                >
                  <div className="od-hbar-lbl">{r.label}</div>
                  <div className={"od-hbar-track" + (hbarHover === sourceIndex ? " active" : "")}>
                    <div className={"od-hbar-fill" + (hbarHover === sourceIndex ? " active" : "")} style={{ width: (r.fuel / max * 100) + "%" }} />
                    {hbarHover === sourceIndex && (
                      <div className="od-hbar-tip">
                        <div className="od-bar-tip-val">{RM0(r.fuel)}</div>
                        <div className="od-bar-tip-period">{r.label}</div>
                      </div>
                    )}
                  </div>
                  <div className="od-hbar-val">{RM0(r.fuel)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="od-hbar-empty">No vehicles match "{vehicleQuery}".</div>
        )}
        <div className="od-vehicle-pager">
          <span>{filtered.length ? `${start + 1}-${Math.min(start + rows.length, filtered.length)} of ${filtered.length}` : "0 of 0"}</span>
          <div className="od-vehicle-pagebtns">
            <button type="button" disabled={safePage <= 1} onClick={() => setVehiclePage((p) => Math.max(1, p - 1))} aria-label="Previous page">
              <Icon name="chevron_left" size={16} />
            </button>
            <button type="button" disabled={safePage >= pageCount} onClick={() => setVehiclePage((p) => Math.min(pageCount, p + 1))} aria-label="Next page">
              <Icon name="chevron_right" size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="od-card">
      <div className="od-trend-controls">
        <div>
          <div className="od-sec-title">Operating Cost Trend</div>
          <div className="od-sec-sub">Last 6 months</div>
        </div>
        <div className="od-trend-actions">
          <Segmented value={view} onChange={setView}
            options={[{ value: "overall", label: "Overall" }, { value: "vehicle", label: "Per Vehicle" }]} />
          <button className="ml-btn-soft" aria-label="Export"><Icon name="download" size={15} /><span className="od-hide-sm"> Export</span></button>
        </div>
      </div>

      <div className="od-chart">
        {view === "overall"
          ? overallBars()
          : <LockSection locked={perVehLocked} tier="lite"
              note="View fuel spend by vehicle.">
              {perVehicleBars()}
            </LockSection>}
      </div>

      <div className="od-legend">
        <span className="od-leg"><span className="od-leg-dot" style={{ background: "var(--green-500)" }} /> Fuel (current)</span>
        <span className="od-leg soon"><span className="od-leg-dot" style={{ background: "#D6DAD8" }} /> Other categories (coming soon)</span>
      </div>
    </div>
  );
}

/* ── Section 4: MyTrip ──────────────────────────────────────────── */
function TripsTodayInner({ empty }) {
  const t = D.trips;
  if (empty) return (
    <div style={{ marginTop: 8 }}>
      <EmptyBlock icon="local_shipping" t="No trips today" s="Assigned trips will show here once your team schedules them." />
    </div>
  );
  const assigned = t.total;
  const completed = t.completed;
  const pct = assigned ? Math.round(completed / assigned * 100) : 0;
  const statuses = [
    { key: "completed", label: "Completed", value: completed, tone: "green" },
    { key: "ongoing", label: "Ongoing", value: t.ongoing, tone: "teal" },
    { key: "pending", label: "Pending", value: t.pending, tone: "amber" },
    { key: "paused", label: "Paused", value: t.paused, tone: "gray" },
  ];

  return (
    <div className="od-trips">
      <div className="od-trips-body">
        <div className="od-trip-hero">
          <div className="od-trip-metric">
            <div className="od-trip-metric-ico"><Icon name="route" size={18} /></div>
            <div className="od-trip-metric-n">{assigned}</div>
            <div className="od-trip-metric-l">assigned trips</div>
          </div>
          <div className="od-trip-metric">
            <div className="od-trip-metric-ico"><Icon name="check_circle" size={18} /></div>
            <div className="od-trip-metric-n">{pct}%</div>
            <div className="od-trip-metric-l">completion rate</div>
          </div>
        </div>
        <div className="od-trip-rows" role="list" aria-label="Trip status breakdown">
          {statuses.map((s) => {
            const rowPct = assigned ? Math.round(s.value / assigned * 100) : 0;
            return (
              <div key={s.key} className={"od-trip-row " + s.tone} role="listitem">
                <div className="od-trip-row-meta">
                  <span className="od-trip-dot" />
                  <span className="od-trip-row-l">{s.label}</span>
                </div>
                <div className="od-trip-row-bar" aria-hidden="true">
                  <div className="od-trip-row-fill" style={{ width: rowPct + "%" }} />
                </div>
                <div className="od-trip-row-val">{s.value} ({rowPct}%)</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function TripsToday({ tier, empty }) {
  const locked = rank(tier) < rank("premium");
  return (
    <div className="od-card od-mytrip-card">
      <button type="button" className="od-mytrip-head" aria-label="Open MyTrip">
        <div className="od-sec-title">MyTrip</div>
        <span className="od-card-arrow"><Icon name="arrow_forward" size={15} /></span>
      </button>
      <LockSection locked={locked} tier="premium"
        note="Track live trip progress and driver locations.">
        <TripsTodayInner empty={empty && !locked} />
      </LockSection>
    </div>
  );
}

/* ── Section 5: Action Needed ──────────────────────────────────── */
function ActionNeeded({ empty, onTabSelect }) {
  return (
    <div className="od-overview">
      <div className="od-sec-title">Overview</div>
      <div className="od-actneed">
        {D.actionNeeded.map((a) => (
          <button key={a.key} className="od-an" onClick={() => onTabSelect(a.tab)}>
            <div className={"od-an-ico " + a.tone}><Icon name={a.icon} size={18} /></div>
            <div className="od-an-label">{a.label}</div>
            <div className="od-an-count">
              <span className="od-an-n">{empty ? 0 : a.count}</span>
              <span className="od-an-sup">{a.supporting}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Section 6: Action Preview ─────────────────────────────────── */
function splitItem(item = "") {
  const [primary, secondary] = item.split(" · ");
  return { primary: primary || item, secondary: secondary || "" };
}

function FuelPreviewCard({ row }) {
  const item = splitItem(row.item);
  const subsidyPct = row.subsidyLimit ? Math.min(100, Math.round(row.subsidyUsed / row.subsidyLimit * 100)) : 0;
  return (
    <article className="od-preview-card od-fuel-card">
      <div className="od-fuel-meta">
        <div className="od-provider-id">
          <PetronLogo size={18} />
          <span>{row.spAccount || "STG-PTN-034"}</span>
        </div>
        <span>{row.date}</span>
      </div>
      <div className="od-fuel-main">
        <div className="od-fuel-copy">
          <div className="od-fuel-vehicle">{item.primary}</div>
          <div className="od-fuel-location">{row.station || item.secondary}{row.direction ? ` · ${row.direction}` : ""}</div>
          {row.subsidy && (
            <div className="od-fuel-subsidy">
              <div className="od-fuel-subsidy-row">
                <span>Subsidy</span>
                <span>{row.subsidy}<em> / {Number(row.subsidyLimit).toLocaleString("en-US")}</em></span>
              </div>
              <div className="od-fuel-subsidy-track" data-tip={`Subsidy used: ${row.subsidy} of ${RM(row.subsidyLimit)}`} tabIndex={0}>
                <div className="od-fuel-subsidy-fill" style={{ width: subsidyPct + "%" }} />
              </div>
            </div>
          )}
        </div>
        <div className="od-fuel-amounts">
          <div className="od-fuel-amount">{row.amount}</div>
          <div className="od-fuel-volume">{row.volume || row.detail}</div>
          {row.txnNo && <div className="od-fuel-ref">{row.txnNo}</div>}
        </div>
      </div>
      <button className="od-card-hit" aria-label={"View details for " + item.primary}>
        <Icon name="chevron_right" size={18} />
      </button>
    </article>
  );
}

function ActionPreviewCard({ row, tab }) {
  const item = splitItem(row.item);
  const icon = tab === "due" ? "event_busy" : tab === "documents" ? "badge" : tab === "checklists" ? "fact_check" : "local_shipping";
  return (
    <article className="od-preview-card od-action-card">
      <div className={"od-action-icon " + row.catTone}><Icon name={icon} size={18} /></div>
      <div className="od-action-copy">
        <div className="od-action-meta">{row.date}</div>
        <div className="od-action-title">{item.primary}</div>
        {item.secondary && <div className="od-action-sub">{item.secondary}</div>}
        <div className="od-action-detail">{row.detail}</div>
      </div>
      <div className="od-action-side">
        <span className={"od-cat " + row.catTone}>{row.cat}</span>
        <Icon name="chevron_right" size={19} />
      </div>
    </article>
  );
}

function ActionPreview({ tier, empty, tab, setTab }) {
  const tripsActive = rank(tier) >= rank("premium");
  const TABS = [
    { value: "fuel",       label: "Fuel TXNs", rows: D.preview.fuel },
    { value: "due",        label: "Due Dates",  rows: D.preview.due },
    { value: "documents",  label: "Documents",  rows: D.preview.documents },
    { value: "checklists", label: "Checklist",  rows: D.preview.checklists },
    ...(tripsActive ? [{ value: "trips", label: "Trips", rows: D.preview.trips }] : []),
  ];
  const active = TABS.find((t) => t.value === tab) || TABS[0];
  const rows = empty ? [] : active.rows;

  return (
    <div className="od-preview">
      <div className="od-preview-nav">
        <div className="od-tabs">
          {TABS.map((t) => (
            <button key={t.value} className={"od-tab" + (t.value === tab ? " active" : "")} onClick={() => setTab(t.value)}>{t.label}</button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="od-emptyrow">{empty ? "No records yet. Data will appear as your fleet operates." : "Nothing here."}</div>
      ) : (
        <div className={"od-preview-list " + (active.value === "fuel" ? "fuel" : "")}>
          {rows.map((r, i) => active.value === "fuel"
            ? <FuelPreviewCard key={i} row={r} />
            : <ActionPreviewCard key={i} row={r} tab={active.value} />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Activity Section (lifts tab state so Overview cards can drive tabs) ── */
function ActivitySection({ tier, empty }) {
  const [tab, setTab] = useState("fuel");
  return (
    <>
      <ActionNeeded empty={empty} onTabSelect={setTab} />
      <ActionPreview tier={tier} empty={empty} tab={tab} setTab={setTab} />
    </>
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
          <OrgSwitcher />
          <div className="od-topbar-spacer" />
          <span className="od-updated">Last updated: {D.org.lastUpdated}</span>
          <button className="od-iconbtn"><Icon name="notifications" size={18} /></button>
        </header>

        <div className="od-content">
          <div className="od-pagehead">
            <span className="od-pagetitle">Dashboard</span>
            <span className="od-planchip"><Icon name="workspace_premium" size={14} /> {PLAN_LABEL[tier]}</span>
          </div>

          {/* 1 — Top Pulse */}
          <TopPulse empty={empty} />

          {/* 2 — Modules */}
          <Modules tier={tier} />

          {/* 3 + 4 — Trend / MyTrip */}
          <div className="od-row">
            <CostTrend tier={tier} empty={empty} />
            <TripsToday tier={tier} empty={empty} />
          </div>

          {/* 5 + 6 — Overview + Activity Preview */}
          <ActivitySection tier={tier} empty={empty} />
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
