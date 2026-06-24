// shared-shell.jsx — Shared shell components for both Agent and Host portals.
// Exposes: Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu, Pill,
//   CurrencyPill, SummaryCard, KpiTierChip, StatusBadge, AccountStatusBadge,
//   KPIProgress, KPIProgressMeta, PetronLogo.
// StatusBadge is the single metadata-driven badge for every status vocabulary.
// Portal-specific shell files (agent-shell.jsx, host-shell.jsx) import from here
// and re-export with their own names and nav configs.

const { useState } = React;

/* ─── Icon ─────────────────────────────────────────────────── */
function Icon({ name, size = 20, fill = 0, color, style }) {
  return (
    <span className="msr" style={{
      fontSize: size,
      fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      color, ...style,
    }}>{name}</span>
  );
}

/* ─── TopBar ─────────────────────────────────────────────────── */
function TopBar() {
  return (
    <header className="ml-topbar">
      <button className="ml-burger" aria-label="Menu"><Icon name="menu" size={22} color="#fff" /></button>
      <div className="ml-topbar-brand">
        <a className="ml-logo" href="../../index.html" aria-label="Back to Prototype Library">
          <img className="ml-logo-img" src="/flows/fleet-card/img_logo_white.svg" alt="MyLorry" />
        </a>
      </div>
      <div className="ml-topbar-spacer" />
      <a className="ml-library-link" href="../../index.html">
        <Icon name="arrow_back" size={16} color="#fff" />
        <span>Back to Library</span>
      </a>
    </header>
  );
}

/* ─── Sidebar (generic) ─────────────────────────────────────── */
function Sidebar({ active, onNav, navItems, badgeLabel }) {
  return (
    <aside className="ml-sidebar">
      <div className="ml-sidebar-card">
        <div className="ml-side-top">
          <div className="ml-avatar-wrap">
            <div className="ml-avatar">
              <Icon name="person" size={18} fill={1} color="#94A8B2" />
            </div>
            <span className="ml-avatar-badge">{badgeLabel}</span>
          </div>
          <div className="ml-side-divider" />
          <nav className="ml-nav">
            {navItems.map((n, i) =>
              n.key === "__div__"
                ? <div key={i} className="ml-side-divider" style={{margin:"4px 0"}} />
                : n.key === "__label__"
                  ? (
                    <div key={n.label + i} style={{
                      padding: "10px 10px 6px",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      color: "var(--fg-tertiary)",
                    }}>
                      {n.label}
                    </div>
                  )
                : (
                  <button key={n.key}
                    className={"ml-nav-item" + (n.key === active ? " active" : "")}
                    onClick={() => onNav && onNav(n.key)}
                    title={n.label}>
                    <Icon name={n.icon} size={23} fill={n.key === active ? 1 : 0} />
                    <span>{n.label}</span>
                  </button>
                )
            )}
          </nav>
        </div>
        <div className="ml-side-bottom">
          <div className="ml-side-divider" />
          <button className="ml-nav-item" title="Settings">
            <Icon name="settings" size={23} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ─── Badge ─────────────────────────────────────────────────── */
function Badge({ kind = "active", children }) {
  return <span className={"ml-badge " + kind}>{children}</span>;
}

/* ─── Pager ─────────────────────────────────────────────────── */
function Pager({ page, perPage, total, onPage, onPerPage, perPageOptions = [10, 50, 100] }) {
  const totalPages = Math.ceil(total / perPage);
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return (
    <div className="ml-pager">
      <div className="ml-pager-rpp">
        <span>Rows per page:</span>
        <select className="ml-pager-sel" value={perPage}
          onChange={e => { onPerPage(Number(e.target.value)); onPage(1); }}>
          {perPageOptions.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="ml-pager-center">
        <span className="ml-pager-range">{start}–{end} of {total}</span>
        <div className="ml-pager-nav">
          <button className="ml-pager-btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <Icon name="chevron_left" size={18} />
          </button>
          <button className="ml-pager-btn" disabled={page >= totalPages || total === 0}
            onClick={() => onPage(page + 1)}>
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CardHead ──────────────────────────────────────────────── */
function CardHead({ icon, title, sub, right }) {
  return (
    <div className="ml-cardhead">
      <div className="ml-cardhead-left">
        <div className="ml-stat-icon"><Icon name={icon} size={18} color="#00AA4F" /></div>
        <div>
          <div className="ml-cardhead-title">{title}</div>
          {sub && <div className="ml-cardhead-sub">{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ─── ExportMenu ────────────────────────────────────────────── */
function ExportMenu({ comingSoon = false }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const pick = (label) => { setOpen(false); setToast(label); setTimeout(() => setToast(null), 2200); };

  if (comingSoon) {
    return (
      <div className="ml-export" style={{ position:"relative" }} title="Coming soon">
        <button className="ml-btn-soft" disabled style={{ opacity:0.5, cursor:"not-allowed" }}>
          <Icon name="download" size={18} /> Export <Icon name="expand_more" size={16} />
        </button>
        <span style={{ position:"absolute", top:"calc(100% + 4px)", right:0, fontSize:11, color:"var(--fg-tertiary)", whiteSpace:"nowrap", background:"var(--bg-hover)", padding:"2px 8px", borderRadius:4 }}>
          Coming soon
        </span>
      </div>
    );
  }

  return (
    <div className="ml-export">
      <button className="ml-btn-soft" onClick={() => setOpen((v) => !v)}>
        <Icon name="download" size={18} /> Export <Icon name="expand_more" size={16} />
      </button>
      {open && (
        <div className="ml-menu">
          <div className="ml-menu-item" onClick={() => pick("Downloading PDF…")}><Icon name="picture_as_pdf" size={18} /> Download PDF</div>
          <div className="ml-menu-item" onClick={() => pick("Exporting Excel…")}><Icon name="table_chart" size={18} /> Export Excel</div>
        </div>
      )}
      {toast && <div className="ml-toast"><Icon name="check_circle" size={16} color="#00AA4F" /> {toast}</div>}
    </div>
  );
}

/* ─── Segmented (pill toggle, dark highlight) ───────────────── */
// Canonical view-of-same-data switch. CSS: .ml-seg / .ml-seg-btn in
// styles/components.css (active = dark #3A3D46 pill). Replaces the hand-rolled
// agent ml-seg buttons and the host hm-seg copy.
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

/* ─── Pill ──────────────────────────────────────────────────── */
function Pill({ tone = "navy", children }) {
  return <span className={"ml-pill ml-pill-" + tone}>{children}</span>;
}

/* ─── CurrencyPill ──────────────────────────────────────────── */
function CurrencyPill({ children }) {
  return <span className="ml-currency-pill">{children}</span>;
}

/* ─── SummaryCard ───────────────────────────────────────────── */
function SummaryCard({ icon, title, sub, value, trend, accent }) {
  return (
    <div className="ml-stat-a">
      <div className="ml-stat-a-head">
        <div className="ml-stat-a-left">
          <div className="ml-stat-icon"><Icon name={icon} size={18} color={accent || "#00AA4F"} /></div>
          <div>
            <div className="ml-stat-a-title">{title}</div>
            <div className="ml-stat-a-sub">{sub}</div>
          </div>
        </div>
      </div>
      <div className="ml-stat-a-row">
        <span className="ml-stat-a-value">{value}</span>
        {trend && <span className={"ml-trend " + (trend.dir === "up" ? "up" : "down")}>
          <Icon name={trend.dir === "up" ? "trending_up" : "trending_down"} size={14} /> {trend.val}
        </span>}
      </div>
    </div>
  );
}

/* ─── CountCard (icon + big count + split-stat band) ────────── */
// Canonical fleet/count card: icon + big number, label, sub, then a gray
// footer band of split stats. Used for Vehicles, Drivers, Fleet Cards, etc.
// (host dashboard + org dashboard). One component — don't re-roll the band.
// stats: [{ n, label, tone }]  tone: "green" | "gray" | "red" | "amber".
function CountCard({ icon, count, label, sub, stats = [], fill = false, actionLabel }) {
  return (
    <div className={"ml-statcard" + (fill ? " fill" : "")}>
      <div className="ml-statcard-head">
        <div className="ml-statcard-main">
          <div className="ml-statcard-ico"><Icon name={icon} size={20} fill={1} /></div>
          <div className="ml-statcard-count">{count}</div>
        </div>
        {actionLabel && (
          <button className="ml-statcard-action" aria-label={actionLabel}>
            <Icon name="arrow_forward" size={15} />
          </button>
        )}
      </div>
      <div className="ml-statcard-labelrow">
        <span className="ml-statcard-label">{label}</span>
        {sub && <span className="ml-statcard-sub">{sub}</span>}
      </div>
      <div className="ml-statcard-band">
        {stats.map((s, i) => (
          <div key={i} className="ml-statcard-cell">
            <div className={"ml-statcard-n " + (s.tone || "gray")}>{s.n}</div>
            <div className="ml-statcard-l">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── KPI Tier Chip ─────────────────────────────────────────── */
function KpiTierChip({ mult }) {
  const tone = mult >= 100 ? "good" : mult >= 50 ? "mid" : "bad";
  const label = mult >= 100 ? "Tier 3 · 100%" : mult >= 50 ? "Tier 2 · 50%" : "Tier 1 · 0%";
  return <span className={"ml-tierchip " + tone}>{label}</span>;
}

/* ─── Status Badge (single source of truth) ─────────────────── */
// One metadata-driven badge for every status vocabulary. Replaces the
// previously duplicated CommissionStatusBadge / MFCommStatusBadge /
// AccountStatusBadge. CSS for each `cls` lives with the design tokens
// (ml-badge.* — see flow HTML / design-system showcase).
const STATUS_BADGE_META = {
  // Commission account status
  activated:          { label:"Activated",          cls:"comm-activated"   },
  pending_onboarding: { label:"Pending Onboarding", cls:"comm-pending-ob"  },
  on_hold:            { label:"On Hold",            cls:"comm-on-hold"     },
  deactivated:        { label:"Deactivated",        cls:"comm-deactivated" },
  expired:            { label:"Expired",            cls:"comm-expired"     },
  // Generic account status
  active:     { label:"Active",     cls:"acct-active"     },
  inactive:   { label:"Inactive",   cls:"acct-inactive"   },
  suspended:  { label:"Suspended",  cls:"acct-suspended"  },
  terminated: { label:"Terminated", cls:"acct-terminated" },
};
function StatusBadge({ status, prefix, fallback = "activated" }) {
  const m = STATUS_BADGE_META[status] || STATUS_BADGE_META[fallback] || { label: status, cls: "" };
  return <span className={"ml-badge " + m.cls}>{prefix || ""}{m.label}</span>;
}
// Back-compat alias — account-status callers default to the "active" vocabulary.
function AccountStatusBadge({ status = "active", prefix }) {
  return <StatusBadge status={status} prefix={prefix} fallback="active" />;
}

/* ─── KPI Progress semantics ────────────────────────────────── */
const KPI_PROGRESS_TONES = {
  green: { col: "var(--green-500)", solid: "var(--green-600)", fill: "#E4F6EC" },
  amber: { col: "var(--amber-500)", solid: "var(--amber-500)", fill: "var(--amber-50)" },
  red:   { col: "var(--red-400)",   solid: "var(--red-400)",   fill: "#FCEBEC" },
};
function KPIProgressMeta(pct = 0) {
  const value = Number(pct) || 0;
  const tone = value >= 100 ? "green" : value >= 75 ? "amber" : "red";
  return { pct: value, tone, isAchieved: value >= 100, ...KPI_PROGRESS_TONES[tone] };
}

/* ─── KPI Progress: bar + percentage + hover tooltip ────────── */
function KPIProgress({ pct, actual, target, period, commissionLabel, phase }) {
  const [hover, setHover] = useState(false);
  const [pos, setPos]     = useState({ top:0, left:0 });
  const ref = React.useRef(null);
  const isFuture = phase === "future";
  const meta = KPIProgressMeta(pct);
  const col = isFuture ? "var(--fg-disabled)" : meta.solid;
  const show = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.top - 8, left: r.left + r.width / 2 });
    }
    setHover(true);
  };
  let tip = isFuture
    ? `KPI progress not started yet${period ? ` · ${period}` : ""}`
    : `${(actual ?? 0).toLocaleString("en-US")} L / ${(target ?? 0).toLocaleString("en-US")} L target · ${period || ""}`;
  if (commissionLabel) tip += ` · ${commissionLabel}`;
  return (
    <div ref={ref} className="ml-kpi-prog" onMouseEnter={show} onMouseLeave={() => setHover(false)}>
      <div className="ml-kpi-track">
        <div className="ml-kpi-fill" style={{ width: isFuture ? "0%" : Math.min(pct, 100) + "%", background: col }} />
      </div>
      <span className="ml-kpi-pct" style={{ color: col }}>{isFuture ? "—" : `${pct}%`}</span>
      {hover && ReactDOM.createPortal(
        <div className="ml-kpi-tip" style={{ top: pos.top, left: pos.left }}>{tip}</div>,
        document.body
      )}
    </div>
  );
}

/* ─── LockSection (subscription gate) ───────────────────────── */
// Section-level upsell gate. Renders real content underneath, then overlays a
// compact scrim + lock badge + generic upgrade CTA when `locked`.
const TIER_LABEL = { lite: "Lite", premium: "Premium", enterprise: "Enterprise" };
function LockSection({ locked = false, tier = "premium", cta = "Upgrade plan", note, children }) {
  if (!locked) return children;
  const tierName = TIER_LABEL[tier] || "Premium";
  return (
    <div className="ml-lock">
      <div className="ml-lock-content" aria-hidden="true">{children}</div>
      <div className="ml-lock-scrim">
        <div className="ml-lock-card">
          <div className="ml-lock-icon"><Icon name="lock" size={16} color="#fff" /></div>
          <div className="ml-lock-badge">{tierName} plan required</div>
          {note && <div className="ml-lock-note">{note}</div>}
          <button className="ml-lock-cta">
            {cta} <Icon name="arrow_outward" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Petron provider logo mark ─────────────────────────────── */
const PETRON_LOGO_SRC = "/flows/fleet-card/petron.png";

function PetronLogo({ size = 16 }) {
  return (
    <img
      className="ml-petron-logo"
      src={PETRON_LOGO_SRC}
      width={size}
      height={size}
      alt="Petron"
      loading="lazy"
      style={{ flexShrink: 0, objectFit: "contain" }}
    />
  );
}

/* ─── Export to window ─────────────────────────────────────── */
window.SharedShell = {
  Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu, Segmented,
  Pill, CurrencyPill, SummaryCard, CountCard, KpiTierChip,
  StatusBadge, AccountStatusBadge, KPIProgress, KPIProgressMeta,
  LockSection, PetronLogo,
};
window.KPIProgressMeta = KPIProgressMeta;
