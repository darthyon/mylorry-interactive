// shared-shell.jsx — Shared shell components for both Agent and Host portals.
// Exposes: Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu, Pill,
//   CurrencyPill, SummaryCard, KpiTierChip, StatusBadge, AccountStatusBadge,
//   KPIProgress, KPIProgressMeta, PetronLogo.
// StatusBadge is the single metadata-driven badge for every status vocabulary.
// Portal-specific shell files (agent-shell.jsx, host-shell.jsx) import from here
// and re-export with their own names and nav configs.

{

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

/* ─── Org Switcher (GitHub-style subtle dropdown trigger) ───── */
// Shared between org-dashboard and the Org Portal's Organisation Profile.
// Uncontrolled: manages its own selected-org state internally (callers never
// consumed the selection outside the component, so no onChange prop).
// `orgs` with a single entry renders the trigger without a chevron/dropdown
// — nothing to switch to, so no switching affordance.
function orgInitials(name = "") {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";
}
function OrgSwitcher({ orgs, initialId }) {
  const [open, setOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState(initialId ?? orgs[0]?.id);
  const wrapRef = React.useRef(null);
  const selected = orgs.find((o) => o.id === selectedId) || orgs[0];
  const canSwitch = orgs.length > 1;

  React.useEffect(() => {
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
        onClick={() => canSwitch && setOpen((v) => !v)}
        aria-haspopup={canSwitch}
        aria-expanded={open}
      >
        <span className="od-org-avatar">{orgInitials(selected.name)}</span>
        <span className="od-org-name">{selected.name}</span>
        {canSwitch && <Icon name={open ? "expand_less" : "expand_more"} size={16} />}
      </button>
      {open && canSwitch && (
        <div className="od-org-menu" role="menu">
          <div className="od-org-menu-h">Switch organization</div>
          {orgs.map((o) => (
            <button
              key={o.id}
              type="button"
              className={"od-org-item" + (o.id === selectedId ? " active" : "")}
              role="menuitem"
              onClick={() => { setSelectedId(o.id); setOpen(false); }}
            >
              <span className="od-org-item-avatar">{orgInitials(o.name)}</span>
              <span className="od-org-item-name">{o.name}</span>
              {o.role && <span className="od-org-item-role">{o.role}</span>}
              {o.id === selectedId && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Badge ─────────────────────────────────────────────────── */
function Badge({ kind = "active", children }) {
  return <span className={"ml-badge " + kind}>{children}</span>;
}

function normalizeSelectOptions(options = []) {
  return options.map((option) => (
    typeof option === "object"
      ? { value: option.value, label: option.label ?? String(option.value), disabled: !!option.disabled }
      : { value: option, label: String(option), disabled: false }
  ));
}

function SelectMenu({
  value,
  options,
  onChange,
  className = "",
  wrapperClassName = "",
  menuClassName = "",
  disabled = false,
  ariaLabel,
  style,
}) {
  const normalized = normalizeSelectOptions(options);
  const selected = normalized.find((option) => String(option.value) === String(value)) || normalized[0] || null;
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0, minWidth: 0 });
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
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

  const toggle = () => {
    if (disabled || !triggerRef.current) return;
    if (!open) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, minWidth: r.width });
    }
    setOpen((v) => !v);
  };

  return (
    <div className={wrapperClassName}>
      <button
        ref={triggerRef}
        type="button"
        className={"ml-select-trigger " + className}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || selected?.label || "Select"}
        disabled={disabled}
        style={style}
        onClick={toggle}
      >
        <span className="ml-select-trigger-label">{selected?.label || "Select"}</span>
      </button>
      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          className={"ml-select-menu" + (menuClassName ? " " + menuClassName : "")}
          role="listbox"
          style={{ top: pos.top, left: pos.left, minWidth: pos.minWidth }}
        >
          {normalized.map((option) => {
            const active = String(option.value) === String(value);
            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={active}
                disabled={option.disabled}
                className={"ml-select-menu-item" + (active ? " active" : "")}
                onClick={() => {
                  if (option.disabled) return;
                  setOpen(false);
                  onChange(option.value);
                }}
              >
                <span>{option.label}</span>
                {active && <Icon name="check" size={16} color="currentColor" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
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
        <SelectMenu
          wrapperClassName="hac-select-wrap compact"
          className="ml-pager-sel"
          value={perPage}
          options={perPageOptions.map((n) => ({ value: n, label: String(n) }))}
          ariaLabel="Rows per page"
          onChange={(next) => { onPerPage(Number(next)); onPage(1); }}
        />
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
// tone — optional icon-chip variant ("amber" = attention cards: amber tint
// bg + amber solid icon). Default stays the muted chip + green outline icon.
const CARDHEAD_TONES = { amber: { color: "var(--amber-600)", fill: 1 } };
function CardHead({ icon, title, sub, right, tone }) {
  const t = CARDHEAD_TONES[tone];
  return (
    <div className="ml-cardhead">
      <div className="ml-cardhead-left">
        <div className={"ml-stat-icon" + (tone ? " " + tone : "")}>
          <Icon name={icon} size={18} color={t ? t.color : "#00AA4F"} fill={t ? t.fill : 0} />
        </div>
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
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const pick = (label) => { setOpen(false); setToast(label); setTimeout(() => setToast(null), 2200); };

  if (comingSoon) {
    return (
      <div className="ml-export" style={{ position:"relative" }} title="Coming soon">
        <button className="ml-btn-soft" disabled style={{ opacity:0.5, cursor:"not-allowed" }}>
          <Icon name="download" size={18} /> Export <Icon name="expand_more" size={16} />
        </button>
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
// stats: [{ n, label, tone }]  tone: "green" | "gray" | "red" | "amber" | "soon".
// trend: { dir: "up" | "down", pct, label } — optional, renders between the
// label row and the stat band (e.g. Operating Cost's "vs yesterday").
// children — optional, replaces the equal-width stat cells inside the same
// footer band (bg-subtle strip) when a card's footer needs bespoke content
// instead of a grid of comparable stats.
// extra — optional, plain body content rendered after trend/before the band,
// no bg-subtle wrapper (e.g. Operating Cost's category-breakdown metadata,
// which doesn't fit the equal-cell band once every category has data).
// onClick — optional; makes the whole card an interactive drill-down target
// (adds .clickable affordance + keyboard activation).
// attention — optional; amber border + amber count color for "needs
// attention" states (e.g. a paused/overdue count > 0). Independent of
// `tone`, which only colors the icon chip.
function CountCard({ icon, count, label, sub, stats = [], fill = false, actionLabel, trend, children, extra, tone = "green", onClick, attention = false }) {
  const interactive = onClick ? {
    onClick,
    role: "button",
    tabIndex: 0,
    onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } },
  } : {};
  return (
    <div className={"ml-statcard" + (fill ? " fill" : "") + (onClick ? " clickable" : "") + (attention ? " attention" : "")} {...interactive}>
      <div className="ml-statcard-head">
        <div className="ml-statcard-main">
          <div className={"ml-statcard-ico " + tone}><Icon name={icon} size={20} fill={1} /></div>
          <div className="ml-statcard-count">{count}</div>
        </div>
        {actionLabel && (
          <button className="ml-statcard-action" aria-label={actionLabel} tabIndex={onClick ? -1 : 0}>
            <Icon name="arrow_forward" size={15} />
          </button>
        )}
      </div>
      <div className="ml-statcard-labelrow">
        <span className="ml-statcard-label">{label}</span>
        {sub && <span className="ml-statcard-sub">{sub}</span>}
      </div>
      {trend && (
        <div className={"ml-statcard-trend " + trend.dir}>
          <Icon name={trend.dir === "up" ? "trending_up" : "trending_down"} size={14} />
          {trend.pct}% {trend.label}
        </div>
      )}
      {extra}
      {(stats.length > 0 || children) && (
        <div className="ml-statcard-band">
          {children ? children : stats.map((s, i) => (
            <div key={i} className={"ml-statcard-cell" + (s.tone === "soon" ? " soon" : "")}>
              <div className={"ml-statcard-n " + (s.tone || "gray")}>{s.n}</div>
              <div className={"ml-statcard-l" + (s.tone === "soon" ? " soon" : "")}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
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
  active:               { label:"Active",              cls:"acct-active"     },
  inactive:             { label:"Inactive",            cls:"acct-inactive"   },
  suspended:            { label:"Suspended",           cls:"acct-suspended"  },
  pending_termination:  { label:"Pending Termination", cls:"acct-pending-term" },
  terminated:           { label:"Terminated",          cls:"acct-terminated" },
  // Wallet balance health (inverted chip: white bg, danger-colored icon/text)
  low_balance:      { label:"Low",           cls:"bal-low"      },
  critical_balance: { label:"Critical",      cls:"bal-critical" },
  cards_frozen:     { label:"Cards frozen",  cls:"bal-frozen"   },
  // Subsidy quota health
  at_risk_quota:  { label:"At risk",  cls:"quota-at-risk"  },
  critical_quota: { label:"Critical", cls:"quota-critical" },
  over_quota:     { label:"Critical", cls:"quota-critical" },
  quota_safe:     { label:"Available", cls:"quota-safe"     },
  // Subscription status (Org Portal — FR-21)
  sub_trial: { label:"Trial",     cls:"sub-trial" },
  sub_free:  { label:"Free plan", cls:"sub-free"  },
  // Module / feature access state (FR-25)
  mod_included: { label:"Included", cls:"mod-included" },
  mod_limited:  { label:"Limited",  cls:"mod-limited"  },
  mod_locked:   { label:"Locked",   cls:"mod-locked"   },
  // Document expiry status (driver / vehicle document cards & tables)
  doc_active:   { label:"Active",     cls:"doc-active"   },
  doc_expired:  { label:"Expired",    cls:"doc-expired"  },
  // Range-specific due-soon buckets (direct label instead of generic "Due soon")
  doc_0_7:      { label:"0-7 days",   cls:"doc-due-soon" },
  doc_8_30:     { label:"8-30 days",  cls:"doc-due-soon" },
  doc_31_60:    { label:"31-60 days", cls:"doc-due-soon" },
  doc_61_90:    { label:"61-90 days", cls:"doc-due-soon" },
  doc_future:   { label:"> 90 days",  cls:"doc-active"   },
  // Backward-compat generic due soon (still used by some callers)
  doc_due_soon: { label:"Due soon",   cls:"doc-due-soon" },
  // MyAdmin dashboard legacy aliases (kept for backward compat)
  due_soon:             { label:"Due soon",              cls:"doc-due-soon"     },
  // Checklist endorsement status (MyAdmin dashboard)
  pending_endorsement:  { label:"Pending endorsement",   cls:"quota-at-risk"    },
  endorsed:             { label:"Endorsed",              cls:"acct-active"      },
  // Check-in / check-out status (MyAdmin dashboard)
  checkin_active:        { label:"Active",               cls:"acct-active"      },
  checkin_completed:     { label:"Completed",            cls:"mod-included"     },
  // Trip status (MyTrip dashboard) — trip-level lifecycle
  trip_completed:  { label:"Completed",  cls:"trip-completed"  },
  trip_ongoing:    { label:"Ongoing",    cls:"trip-ongoing"    },
  trip_pending:    { label:"Pending",    cls:"trip-pending"    },
  trip_paused:     { label:"Paused",     cls:"trip-paused"     },
  trip_terminated: { label:"Terminated", cls:"trip-terminated" },
  // Vehicle status (MyTrip fleet-status lens) — vehicle-level, deliberately
  // separate vocabulary from trip status so the two never blur.
  veh_in_progress: { label:"In Progress",            cls:"trip-ongoing" },
  veh_idle:        { label:"Idle",                   cls:"veh-idle"     },
  veh_assigned:    { label:"Assigned – Not Started", cls:"trip-pending" },
  // Emergency contact designation (driver detail)
  primary:         { label:"Primary",                cls:"acct-active"  },
};
function StatusBadge({ status, prefix, label, fallback = "activated" }) {
  const m = STATUS_BADGE_META[status] || STATUS_BADGE_META[fallback] || { label: status, cls: "" };
  return <span className={"ml-badge " + m.cls}>{prefix || ""}{label || m.label}</span>;
}
// Back-compat alias — account-status callers default to the "active" vocabulary.
function AccountStatusBadge({ status = "active", prefix }) {
  return <StatusBadge status={status} prefix={prefix} fallback="active" />;
}

/* ─── Calc Popover (click-to-open calculation breakdown) ─────── */
// Same visual pattern as the Commission Agent Portal's "View Calculation"
// button (originally flows/commission-agent/agent-parts.jsx, CSS in
// components.css .ml-calc-*). Click toggles the popover; a mousedown
// listener outside the popover node closes it. No portal — caller must
// give the wrapping element `position: relative` context if needed.
// rows: [{ label, value, tone, total }] — `tone: "green"` colors the value,
// `total: true` adds the bordered "final total" row styling.
// trigger: optional custom trigger content — defaults to a small icon-only
// button (xs) so it can sit inline on the same row as a label.
// trigger — optional custom clickable node replacing the default "View
// calculation" button (e.g. make an existing number the click target
// instead of adding a separate visible affordance). Omit for the default.
function CalcPopover({ title = "Calculation summary", rows, triggerLabel = "View calculation", align = "left", icon = "calculate", trigger }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 320 });
  const triggerRef = React.useRef(null);
  const popRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!triggerRef.current?.contains(e.target) && !popRef.current?.contains(e.target)) setOpen(false);
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

  // Portal + fixed positioning, clamped to the viewport (same technique as
  // ReminderSummary's .ml-reminder-pop) — a plain absolute popover can
  // overflow the screen edge on narrow layouts (e.g. a mobile card).
  function toggle() {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const width = Math.min(320, window.innerWidth - 24);
      const anchorLeft = align === "right" ? r.right - width : r.left;
      const left = Math.max(12, Math.min(anchorLeft, window.innerWidth - width - 12));
      setPos({ top: r.top, left, width });
    }
    setOpen((v) => !v);
  }

  return (
    <span className="ml-calc-wrap">
      {trigger
        ? <span className="ml-calc-trigger-custom" ref={triggerRef} onClick={toggle}>{trigger}</span>
        : (
          <button type="button" className="ml-calc-trigger-btn" ref={triggerRef} onClick={toggle}>
            <Icon name={icon} size={13} /> {triggerLabel}
          </button>
        )}
      {open && ReactDOM.createPortal(
        <div className="ml-calc-pop" ref={popRef} style={{ top: pos.top, left: pos.left, width: pos.width }}>
          <div className="ml-calc-pop-title">{title}</div>
          {rows.map((r, i) => (
            <div key={i} className={"ml-calc-row" + (r.total ? " ml-calc-row-total" : "")}>
              <span>{r.label}</span>
              <b style={r.tone === "green" ? { color: "var(--green-600)" } : r.tone === "amber" ? { color: "var(--amber-600)" } : undefined}>{r.value}</b>
            </div>
          ))}
        </div>,
        document.body
      )}
    </span>
  );
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
  const [hover, setHover] = React.useState(false);
  const [pos, setPos]     = React.useState({ top:0, left:0 });
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

/* ─── Feature Tab Shell (module/feature tab nav) ─────────────── */
// Canonical vertical-tabs-desktop / horizontal-tabs-mobile shell for
// per-module feature panels. Used by host-subscription's Feature Access
// editor and the Org Portal's Organisation Profile Services section — same
// nav shape, different panel content (editable vs read-only), so only the
// shell + tab list is shared here; each caller renders its own panel via
// `children`. CSS: .ml-modtabs-* in components.css.
// tabs: [{ key, label, icon, right }] — `right` renders trailing content in
// the tab button (e.g. a StatusBadge).
function FeatureTabShell({ tabs, activeKey, onSelect, children }) {
  return (
    <div className="ml-modtabs-shell">
      <div className="ml-modtabs-tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.key} role="tab" aria-selected={t.key === activeKey}
            className={"ml-modtabs-tab" + (t.key === activeKey ? " active" : "")}
            onClick={() => onSelect(t.key)}>
            {t.icon && <Icon name={t.icon} size={16} />}
            <span className="ml-modtabs-tab-label">{t.label}</span>
            {t.right}
          </button>
        ))}
      </div>
      <div className="ml-modtabs-panel">{children}</div>
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
          <div className="ml-lock-badge">Plan upgrade required</div>
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
// Inlined as data URI so it renders regardless of serving root
// (file://, GitHub Pages subpath, etc.). Source: flows/fleet-card/petron.png
const PETRON_LOGO_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAATCAYAAACZZ43PAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAA0FJREFUeAF9lFtom2UYx3/v9705tGm+tsnsbGxmWrvMriqbmyDCUHSCQ9gYSEWoIKgDFQ+ggie82Y3g4ULBG1FB7WZBcOqFFo/TiXctqGNra5vGLWu3bmvSHJsvyeuTNDrqDs/Ne+D9/5//838eXvWub/Obo+HBOw539Fb2nZ6wnsxM0VHJklFBbGPI2R7zaXCD+TjUzxmfg17JUUGBUh6Kfx9SR1T0i22mtDttaXbG9nC07Wr6s6cYTf1IvLzMeVpwcOmgwBF/N3dfew9uzaWqhCQ394FlsGrnaaVkfPwxe4Cd546R0D62xYd4KbyFqyiSQ3NSaGIreYqT7xERgro6MDWLZmi5OKFCjKW+Rts+rFKad7q386u/Cwuz+kiWpArze+Jzql6ncfUfQeMgJCWRfHtmjpqyUOUsHzoxAlL1v1HP7IiCLklQh68hWGWssKj9ks1gRMmdhTNShP7fG0O+/obaWgKtDLOeABNOD7aYFHWLPJybXnW9GX5V45uWKHnbs7YEn6qypC0G48OoaoUBN0/yrxHmVPtq+ULoqDLzWrOr7160m7tA4BXWkx4/mzcNN2SNnPiJiblDYlh7o2ZblEXNEvs7B7kp/gCelQwVZTXNF0BO9jdfP8z6wiKJmYNkxbZ5aZtXwBEyfNK6kUejQ5RNFWslLVNxoSTda5a5Mb6PeDbFZGJUJIekGxAlzYFAP4/17JUENsotSKo6UK0xVI+0XkdOHF0S8Kz0uNvkmPEEWRd7UDzxCbCIqbriu+JSoV+J3MLh6c9ICLjPpNkTuYsvO+PYItXUwVw5dFutbG4rLTQOA31DTIsaJSZVL5PxIoLnzs0EZHFfX3erZ7ItiqkUL6rzklHvgscJ43MGNuprdr9BqN+5IiAW8zd3zdkZ9DZ42PRsitS3W9mw9zSV5QTF+eO0dCXQnY+Tn3qLluhTKBnl5ZnnCfY+g7v4M97IDha/e4iOrS9blBaSxO5bID3+iHwS62WQjjL19hOyL5E8+ALGOkYx+QOBnhc5/loMHdpFITlOeMcYpdRvFjpQ4M9X/Zz66n3c/Pd4Q/fT2ddOJTMOPZrC7EfYgSBnx7Zzw35DdupplO3n7C9bJIn7D+TTPwwAYZetAAAAAElFTkSuQmCC";

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

/* ─── Modal (generic backdrop + esc/backdrop-close shell) ───────
   Portal-rendered dialog shell: escape key and backdrop-click both call
   `onClose`. Caller owns all inner content/styling via `children` and can
   override the backdrop/panel classNames — this only wires the boilerplate
   (portal, esc listener, backdrop mousedown) so flow-specific modals don't
   each reimplement it. `ConfirmBulkModal` predates this and is left as-is
   (different call sites, no need to churn working code); new modals should
   build on this instead. */
function Modal({ onClose, ariaLabel, backdropClassName = "ml-modal-backdrop", className = "ml-modal", children }) {
  const wrapRef = React.useRef(null);
  React.useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  function onBackdrop(e) { if (e.target === wrapRef.current) onClose(); }
  return ReactDOM.createPortal(
    <div className={backdropClassName} ref={wrapRef} onMouseDown={onBackdrop} role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className={className}>{children}</div>
    </div>,
    document.body
  );
}

/* ─── HAC Modal ─────────────────────────────────────────────────
   Canonical form-dialog composition: drag handle, title row, divider,
   scrollable body and paired footer actions. Use this for CRUD modals. */
function HacModal({ title, onClose, children, footer, ariaLabel = title, className = "" }) {
  return <Modal onClose={onClose} ariaLabel={ariaLabel} backdropClassName="hac-modal-overlay" className={`hac-modal ${className}`}>
    <div className="hac-modal-drag" />
    <div className="hac-modal-head">
      <span className="hac-modal-title">{title}</span>
      <button className="hac-modal-close" type="button" aria-label="Close" onClick={onClose}><Icon name="cancel" size={22} fill={1} color="var(--fg-disabled)" /></button>
    </div>
    <div className="hac-modal-divider" />
    <div className="hac-modal-body" style={{ paddingBottom: 20 }}>{children}</div>
    {footer && <div className="hac-modal-foot">{footer}</div>}
  </Modal>;
}

/* ─── File Upload ───────────────────────────────────────────────
   Shared drop-zone interaction for single-image and multi-document uploads. */
function HacFileUpload({ accept, multiple = false, onFiles, description = "Click to upload or drag and drop", hint, chooseLabel = "Choose file", preview, variant = "default", className = "" }) {
  const inputRef = React.useRef(null);
  function handleFiles(files) { if (files?.length) onFiles?.(files); }
  const classes = ["hac-file-upload", variant === "mini" ? "mini" : "", className].filter(Boolean).join(" ");
  return <div className={classes} onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
    <input ref={inputRef} type="file" accept={accept} multiple={multiple} style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
    {preview || (variant === "mini"
      ? <div className="hac-file-upload-main"><Icon name="upload_file" size={20} color="var(--green-600)" /><div className="hac-file-upload-copy"><div className="hac-file-upload-text">{description}</div>{hint && <div className="hac-file-upload-hint">{hint}</div>}</div></div>
      : <><Icon name="upload_file" size={26} color="var(--green-600)" /><div className="hac-file-upload-text">{description}</div>{hint && <div className="hac-file-upload-hint">{hint}</div>}</>)}
    <button type="button" className="ml-btn-outline hac-file-upload-btn" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>{chooseLabel}</button>
  </div>;
}

/* ─── History Card ────────────────────────────────────────────── */
// onClick — optional; whole card becomes a button (same interactive-affordance
// pattern as CountCard: role/tabIndex/Enter-Space handled by the native
// <button>, .clickable class for hover/cursor styling).
// meta — optional trailing content in the header-right slot, alongside (or
// instead of) `status`/`action` — e.g. a duration or timestamp.
function HistoryCard({ icon, prefix, title, subtitle, status, action, meta, onClick, children }) {
  const Tag = onClick ? "button" : "article";
  const interactive = onClick ? { type: "button", onClick } : {};
  return (
    <Tag className={"ml-history-card" + (onClick ? " clickable" : "") + (!children ? " no-body" : "")} {...interactive}>
      <div className="ml-history-card-head">
        <div className="ml-history-card-head-main">
          {prefix ? (
            <div className="ml-history-card-prefix">{prefix}</div>
          ) : icon && (
            <div className="ml-history-card-icon">
              <Icon name={icon} size={20} />
            </div>
          )}
          <div className="ml-history-card-head-copy">
            <div className="ml-history-card-title">{title}</div>
            {subtitle && <div className="ml-history-card-subtitle">{subtitle}</div>}
          </div>
        </div>
        <div className="ml-history-card-head-right">
          {status && <StatusBadge status={status} />}
          {meta && <span className="ml-history-card-meta">{meta}</span>}
          {action}
        </div>
      </div>
      {children && <div className="ml-history-card-body">{children}</div>}
    </Tag>
  );
}

// Expiry date helpers: shared by any flow that renders a document/reminder
// due-date field (issued/expiry date formatting, relative "N days left" text,
// and the danger/warn/good tone used to color it).
function fmtExpiryDate(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function daysUntilExpiry(iso) {
  if (!iso) return null;
  const target = new Date(`${iso}T00:00:00`);
  if (isNaN(target)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}
function expiryTone(iso) {
  const days = daysUntilExpiry(iso);
  if (days == null) return "empty";
  if (days < 7) return "danger";
  if (days <= 30) return "warn";
  return "good";
}
function expiryRelativeText(iso) {
  const days = daysUntilExpiry(iso);
  if (days == null) return "—";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}
// Maps to STATUS_BADGE_META's doc_* keys (Active/Expired/0-7 days/8-30 days/...).
function documentExpiryStatus(iso) {
  const days = daysUntilExpiry(iso);
  if (days == null) return "doc_active";
  if (days < 0) return "doc_expired";
  if (days <= 7) return "doc_0_7";
  if (days <= 30) return "doc_8_30";
  if (days <= 60) return "doc_31_60";
  if (days <= 90) return "doc_61_90";
  return "doc_future";
}

// Reminder field value: nearest reminder as plain text, with a "+N more"
// trigger that opens a fixed-position (viewport-clamped) schedule popover.
// Same shape as the Documents tab's reminder field, reused everywhere a
// reminders column/field shows up instead of forking chips or plain text.
function ReminderSummary({ reminders = [] }) {
  const values = reminders.map(Number).filter((value) => Number.isFinite(value) && value > 0);
  const triggerRef = React.useRef(null);
  const popRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!triggerRef.current?.contains(e.target) && !popRef.current?.contains(e.target)) setOpen(false); };
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

  if (!values.length) return "—";
  const nearest = Math.min(...values);
  if (values.length === 1) return <span>{nearest} days before</span>;

  function toggle() {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const popWidth = 210;
      const left = Math.max(12, Math.min(r.left, window.innerWidth - popWidth - 12));
      setPos({ top: r.bottom + 6, left });
    }
    setOpen((v) => !v);
  }

  return (
    <span className="ml-reminder-summary">
      {nearest} days before{" "}
      <button ref={triggerRef} className="ml-reminder-trigger" type="button" aria-expanded={open} onClick={toggle}>
        +{values.length - 1} more<Icon name="expand_more" size={14} />
      </button>
      {open && ReactDOM.createPortal(
        <span ref={popRef} className="ml-reminder-pop" role="dialog" aria-label="Reminder schedule" style={{ top: pos.top, left: pos.left }}>
          <span className="ml-reminder-pop-title">Reminder schedule</span>
          {values.map((value, index) => <span className="ml-reminder-pop-row" key={`${value}-${index}`}><span>Reminder {index + 1}</span><span>{value} days before expiry date</span></span>)}
        </span>,
        document.body
      )}
    </span>
  );
}

// Shared shell for table-to-card mobile conversions. The body and optional
// footer remain freeform so each variant can keep task-specific content.
function MobileListCard({ leading, title, subtitle, status, menu, meta, footer, children, className = "" }) {
  return <article className={`ml-mobile-list-card${children ? " has-body" : ""}${footer ? " has-footer" : ""}${className ? ` ${className}` : ""}`}>
    <header className="ml-mobile-list-card-head">
      <div className="ml-mobile-list-card-identity">
        {leading && <div className="ml-mobile-list-card-leading">{leading}</div>}
        <div className="ml-mobile-list-card-copy">
          <div className="ml-mobile-list-card-title">{title}</div>
          {subtitle && <div className="ml-mobile-list-card-subtitle">{subtitle}</div>}
        </div>
      </div>
      {(status || menu) && <div className="ml-mobile-list-card-actions">{status}{menu}</div>}
    </header>
    {meta && <div className="ml-mobile-list-card-meta">{meta}</div>}
    {children && <div className="ml-mobile-list-card-body">{children}</div>}
    {footer && <footer className="ml-mobile-list-card-footer">{footer}</footer>}
  </article>;
}

/* ─── Checklist Card + bulk confirm modal ───────────────────────
   Safety Checklist submission card: driver/vehicle header, check-in/
   check-out + mileage, expandable checklist items, inline Reject All /
   Endorse All (via ConfirmBulkModal). Shared because both the Org
   Dashboard preview and the Endorser Dashboard queue (and MyAdmin's
   future dashboard) consume the exact same component. */
function ConfirmBulkModal({ driver, action, count, onCancel, onConfirm }) {
  const wrapRef = React.useRef(null);
  React.useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onCancel(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);
  function onBackdrop(e) { if (e.target === wrapRef.current) onCancel(); }
  const verb = action === "endorse" ? "Endorse" : "Reject";
  return ReactDOM.createPortal(
    <div className="od-modal-backdrop" ref={wrapRef} onMouseDown={onBackdrop} role="dialog" aria-modal="true" aria-label={`${verb} all checklists`}>
      <div className="od-modal od-modal-sm">
        <div className="od-modal-header">
          <span className="od-modal-title">{verb} all checklists?</span>
          <button className="od-modal-close" onClick={onCancel} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>
        <div className="od-modal-body">
          <p className="od-cl-confirm-copy">
            {verb} all {count} checklist items for <strong>{driver}</strong> without reviewing them individually?
          </p>
        </div>
        <div className="od-cl-confirm-actions">
          <button type="button" className="ml-btn-outline" onClick={onCancel}>Cancel</button>
          <button type="button" className="ml-btn-primary" onClick={onConfirm}>{verb} All</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ChecklistCard({ row, showCheckInOut = true }) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(null); // null | "endorse" | "reject"
  const [decision, setDecision] = React.useState(row.decision || null); // null | "endorsed" | "rejected"
  const warnCount = row.items.filter((i) => i.status === "warning").length;
  const allGood = warnCount === 0;
  const VISIBLE_COUNT = 3;
  const hasMore = row.items.length > VISIBLE_COUNT;
  const visibleItems = open ? row.items : row.items.slice(0, VISIBLE_COUNT);
  return (
    <article className="od-preview-card od-checklist-card">
      {pending && (
        <ConfirmBulkModal
          driver={row.driver}
          action={pending}
          count={row.items.length}
          onCancel={() => setPending(null)}
          onConfirm={() => { setDecision(pending === "endorse" ? "endorsed" : "rejected"); setPending(null); }}
        />
      )}
      <div className="od-cl-header">
        <img className="od-cl-avatar" src={`https://i.pravatar.cc/64?u=${encodeURIComponent(row.plate)}`} alt={row.driver} />
        <div className="od-cl-meta">
          <div className="od-cl-name">{row.driver}</div>
          <div className="od-cl-plate">{row.plate}</div>
        </div>
      </div>
      <div className="od-cl-divider" />
      {showCheckInOut && (
        <>
          <div className="od-cl-checkinout">
            <div className="od-cl-col">
              <div className="od-cl-col-label"><Icon name="login" size={14} color="var(--green-600)" />Check-in</div>
              <div className="od-cl-col-val">{row.checkIn}</div>
              <div className="od-cl-col-sub">Start: {Number(row.startMileage).toLocaleString("en-US")} km</div>
            </div>
            <div className="od-cl-col">
              <div className="od-cl-col-label"><Icon name="logout" size={14} color="var(--red-400)" />Check-out</div>
              <div className="od-cl-col-val">{row.checkOut}</div>
              <div className="od-cl-col-sub">End: {Number(row.endMileage).toLocaleString("en-US")} km</div>
            </div>
          </div>
          <div className="od-cl-divider" />
        </>
      )}
      <div className="od-cl-clhead">
        <span className="od-cl-clhead-title">Checklists</span>
        <span className="od-cl-clhead-right">
          {!decision && (
            <span className={"ml-badge " + (allGood ? "acct-active" : "acct-terminated")}>
              {allGood ? "All good" : `${warnCount} warning${warnCount > 1 ? "s" : ""}`}
            </span>
          )}
          {row.overdue && <span className="ml-badge acct-suspended">Overdue</span>}
        </span>
      </div>
      <div className="od-cl-items">
        {visibleItems.map((it, i) => {
          const status = decision === "endorsed" ? "passed" : decision === "rejected" ? "rejected" : it.status;
          return (
            <div className="od-cl-item" key={i}>
              <div className="od-cl-item-left">
                <Icon name="fact_check" size={20} color="var(--fg-tertiary)" />
                <span>{it.label}</span>
              </div>
              <div className="od-cl-item-right">
                <Icon
                  name={status === "passed" ? "check_circle" : status === "rejected" ? "cancel" : "error"}
                  size={19}
                  color={status === "passed" ? "var(--green-600)" : "var(--red-400)"}
                />
                <Icon name="chevron_right" size={16} color="var(--fg-tertiary)" />
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button type="button" className="od-cl-more" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? "Show less" : `View ${row.items.length - VISIBLE_COUNT} more`}
          <Icon name={open ? "expand_less" : "expand_more"} size={17} />
        </button>
      )}
      {decision ? (
        <div className={"od-cl-decision " + (decision === "endorsed" ? "od-cl-decision-good" : "od-cl-decision-bad")}>
          <Icon name={decision === "endorsed" ? "check_circle" : "cancel"} size={16} />
          {decision === "endorsed" ? "Endorsed all checklists" : "Rejected all checklists"}
        </div>
      ) : (
        <div className="od-cl-actions">
          <button type="button" className="ml-btn-outline" onClick={() => setPending("reject")}>Reject All</button>
          <button type="button" className="ml-btn-primary" onClick={() => setPending("endorse")}>Endorse All</button>
        </div>
      )}
    </article>
  );
}

/* ─── Native Select Enhancer ─────────────────────────────────── */
function installNativeSelectEnhancer() {
  return;
}

installNativeSelectEnhancer();

/* ─── Export to window ─────────────────────────────────────── */
window.SharedShell = {
  Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu, Segmented,
  Pill, CurrencyPill, SummaryCard, CountCard, KpiTierChip,
  StatusBadge, AccountStatusBadge, KPIProgress, KPIProgressMeta,
  LockSection, PetronLogo, HistoryCard, MobileListCard, ReminderSummary,
  fmtExpiryDate, daysUntilExpiry, expiryTone, expiryRelativeText, documentExpiryStatus,
  FeatureTabShell, OrgSwitcher, SelectMenu,
  CalcPopover, ChecklistCard, ConfirmBulkModal, Modal, HacModal, HacFileUpload,
};
window.KPIProgressMeta = KPIProgressMeta;
}
