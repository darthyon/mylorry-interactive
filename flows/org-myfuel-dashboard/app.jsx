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
  "quotaState": "at-risk",
  "showTopStations": false
}/*EDITMODE-END*/;

const TIER_RANK = { free: 0, lite: 1, premium: 2 };
const rank = (t) => TIER_RANK[t] ?? 0;

const RM = (n) => "RM " + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const RM0 = (n) => "RM " + Number(n).toLocaleString("en-US");
const L = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " L";
const L0 = (n) => Number(n).toLocaleString("en-US") + " L";
const fuelAccountCode = (i) => `STG-PTN-${String(i + 1).padStart(3, "0")}`;

function LeaveConfirmModal({ onStay, onLeave }) {
  const wrapRef = useRef(null);
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onStay(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onStay]);
  function onBackdrop(e) { if (e.target === wrapRef.current) onStay(); }
  return ReactDOM.createPortal(
    <div className="mfd-leave-backdrop" ref={wrapRef} onMouseDown={onBackdrop} role="dialog" aria-modal="true" aria-label="Leave page confirmation">
      <div className="mfd-leave-modal">
        <div className="mfd-leave-title">Leave this page?</div>
        <div className="mfd-leave-msg">Are you sure you want to leave this page? Your progress may not be saved.</div>
        <div className="mfd-leave-actions">
          <button type="button" className="mfd-leave-stay" onClick={onStay}>Stay</button>
          <button type="button" className="mfd-leave-exit" onClick={onLeave}>Exit to Dashboard</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

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



const RAIL_ITEMS = [
  { icon: "space_dashboard", label: "Dashboard", active: true },
  { icon: "group", label: "User" },
  { icon: "credit_card", label: "Fleet Card" },
  { icon: "receipt_long", label: "Balance History" },
  { icon: "payments", label: "Top-Up" },
  { icon: "sync", label: "Subsidy" },
  { icon: "currency_exchange", label: "Transaction" },
  { icon: "history", label: "Payments History" },
  { icon: "description", label: "Report" },
];

function RailMenu({ className = "", itemClass = "", onItemClick }) {
  return (
    <>
      {RAIL_ITEMS.map((r) => (
        <a key={r.label} href={r.active ? "../org-dashboard/index.html" : undefined}
           className={itemClass + (r.active ? " active" : "")} title={r.label} onClick={onItemClick}>
          <Icon name={r.icon} size={20} />
          <span>{r.label}</span>
        </a>
      ))}
    </>
  );
}

/* ── Left rail (desktop) + mobile drawer ───────────────────────── */
function Rail({ mobileOpen, onClose }) {
  const drawerRef = useRef(null);
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape" && mobileOpen) onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onClose]);

  return (
    <>
      <nav className="mfd-rail" aria-label="Main navigation">
        <div className="mfd-rail-profile">
          <span className="mfd-rail-profile-avatar">{initials(D.org.name)}</span>
          <Icon name="expand_more" size={14} color="var(--fg-secondary)" />
        </div>
        <RailMenu itemClass="mfd-rail-item" />
      </nav>

      {mobileOpen && (
        <div className="mfd-drawer-backdrop" onClick={onClose} role="presentation">
          <div className="mfd-drawer" ref={drawerRef} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className="mfd-drawer-header">
              <div className="mfd-drawer-profile">
                <span className="mfd-rail-profile-avatar">{initials(D.org.name)}</span>
                <span className="mfd-drawer-org">{D.org.name}</span>
              </div>
              <button type="button" className="mfd-iconbtn mfd-drawer-close" onClick={onClose} aria-label="Close menu">
                <Icon name="close" size={18} />
              </button>
            </div>
            <nav className="mfd-drawer-menu" aria-label="Mobile navigation">
              <RailMenu itemClass="mfd-drawer-item" onItemClick={onClose} />
            </nav>
          </div>
        </div>
      )}
    </>
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
  const cardRef = useRef(null);
  const touchX = useRef(null);
  const b = wallets[idx] || wallets[0];
  const tone = empty ? "" : balanceTone(b.daysRemaining); // "" | " amber" | " red"
  const forced = tone === " red" ? "critical" : tone === " amber" ? "low" : null;

  function go(dir) {
    setIdx(i => {
      const next = (i + dir + wallets.length) % wallets.length;
      try { localStorage.setItem("mfd_wallet_" + D.org.id, next); } catch {}
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

  return (
    <div className={"mfd-kpi mfd-balance" + tone} ref={cardRef}>
      {multi && (
        <button className="mfd-bal-warrow mfd-bal-wl" onClick={() => go(-1)} aria-label="Previous wallet">
          <Icon name="chevron_left" size={16} color="#1a3a25" />
        </button>
      )}
      {multi && (
        <button className="mfd-bal-warrow mfd-bal-wr" onClick={() => go(1)} aria-label="Next wallet">
          <Icon name="chevron_right" size={16} color="#1a3a25" />
        </button>
      )}
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

function aggregateQuotaByVehicle() {
  const map = new Map();
  (D.subsidyAccounts || []).forEach((s) => {
    (s.quotaByVehicle || []).forEach((r) => {
      const existing = map.get(r.plate) || { plate: r.plate, quota: 0, used: 0 };
      existing.quota += r.quota || 0;
      existing.used += r.used || 0;
      map.set(r.plate, existing);
    });
  });
  return Array.from(map.values()).sort((a, b) => b.used - a.used);
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

function QuotaGauge({ pct, quota, warning, danger, tone }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const node = hostRef.current;
    const echarts = window.echarts;
    if (!node || !echarts) return undefined;

    const chart = echarts.getInstanceByDom(node) || echarts.init(node, null, { renderer: "canvas" });
    const clampedPct = Math.max(0, Math.min(100, Number(pct) || 0));
    const toneColor = tone === "red"
      ? "#FF7476"
      : tone === "amber"
        ? "#F5A623"
        : "#00AA4F";
    const subtleTick = "#D7DDE3";
    const quietText = "#757575";
    const strongText = "#141D2C";

    function pointFor(percent, radiusX, radiusY, width, height, centerX, centerY) {
      const angle = Math.PI - (Math.PI * percent / 100);
      return {
        x: centerX + Math.cos(angle) * radiusX,
        y: centerY - Math.sin(angle) * radiusY,
      };
    }

    function render() {
      const width = node.clientWidth || 560;
      const height = node.clientHeight || 320;
      const centerX = width * 0.5;
      const centerY = height * 0.64;
      const radiusX = Math.min(width * 0.41, 235);
      const radiusY = Math.min(height * 0.57, 180);

      chart.setOption({
        animationDuration: 450,
        animationDurationUpdate: 450,
        series: [
          {
            type: "gauge",
            min: 0,
            max: 100,
            startAngle: 180,
            endAngle: 0,
            center: ["50%", "64%"],
            radius: "88%",
            splitNumber: 10,
            progress: {
              show: true,
              width: 18,
              roundCap: true,
              itemStyle: { color: toneColor },
            },
            pointer: { show: false },
            anchor: { show: false },
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 18,
                color: [[1, "#E8EAEE"]],
              },
            },
            axisTick: {
              show: true,
              splitNumber: 4,
              distance: -26,
              lineStyle: {
                color: subtleTick,
                width: 2,
              },
              length: 6,
            },
            splitLine: {
              show: true,
              distance: -28,
              length: 12,
              lineStyle: {
                color: subtleTick,
                width: 2,
              },
            },
            axisLabel: { show: false },
            title: {
              show: true,
              offsetCenter: [0, "14%"],
              color: quietText,
              fontSize: 12,
              fontWeight: 500,
            },
            detail: {
              valueAnimation: true,
              offsetCenter: [0, "-13%"],
              formatter: (value) => `${value.toFixed(1)}%`,
              color: strongText,
              fontSize: 44,
              fontWeight: 700,
            },
            data: [{ value: clampedPct, name: "used this month" }],
          },
        ],
        graphic: [
          {
            type: "text",
            left: Math.max(0, centerX - radiusX),
            top: centerY + 18,
            style: {
              text: "0 L",
              fill: quietText,
              fontSize: 11,
              fontWeight: 500,
              textAlign: "left",
            },
          },
          {
            type: "text",
            left: centerX + radiusX - 54,
            top: centerY + 18,
            style: {
              text: L0(quota),
              fill: quietText,
              fontSize: 11,
              fontWeight: 500,
              textAlign: "right",
            },
          },
        ],
      }, true);
    }

    render();
    const resize = () => render();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, [danger, pct, quota, tone, warning]);

  return <div ref={hostRef} className="mfd-quota-gauge" aria-label={`Subsidy quota usage ${pct.toFixed(1)} percent`} />;
}

function SubsidyQuotaCombinedCard({ empty, quotaState, subsidy, subsidies, subsidyIdx, onSelectSubsidy }) {
  const { q, scenario, used, quota, remaining, pct } = deriveQuota(subsidy, quotaState, empty);
  const isCritical = pct >= q.thresholds.danger;
  const isWarning = pct >= q.thresholds.warning;
  const fillTone = isCritical ? "red" : isWarning ? "amber" : "green";
  const [pickerOpen, setPickerOpen] = useState(false);
  const availableMax = q.thresholds.warning - 1;
  const riskMin = q.thresholds.warning;
  const riskMax = q.thresholds.danger - 1;
  const noData = scenario === "none" || empty;
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    try {
      return window.innerWidth <= 680;
    } catch {
      return false;
    }
  });
  const [vehicleOpen, setVehicleOpen] = useState(() => {
    try {
      return window.innerWidth > 680;
    } catch {
      return true;
    }
  });
  const [expandedVehicle, setExpandedVehicle] = useState(null);
  const pageSize = 5;
  const vehRows = aggregateQuotaByVehicle()
    .filter((r) => !query || r.plate.toLowerCase().includes(query.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(vehRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageRows = vehRows.slice(start, start + pageSize);

  useEffect(() => {
    function onResize() {
      const mobile = window.innerWidth <= 680;
      setIsMobileViewport(mobile);
      if (!mobile) {
        setVehicleOpen(true);
        setExpandedVehicle(null);
      }
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const disclaimer = "Quota is renewed every 1st week of the month";

  return (
    <div className="mfd-kpi mfd-quota-card mfd-quota-card-combined">
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
                label={isCritical ? "Critical" : "At risk"}
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
              label="Available"
              prefix={<Icon name="check_circle" size={11} color="var(--green-600)" />} />
          ) : null}
        </div>
      </div>

      {noData ? (
        <div className="mfd-quota-empty">
          <Icon name="block" size={32} />
          <div>No subsidy quota data yet</div>
          <div className="mfd-quota-empty-s">Data will appear once fuel usage starts or a subsidy quota file is uploaded.</div>
        </div>
      ) : (
        <>
          <div className="mfd-quota-body-top mfd-quota-body-top-combined">
            <div className="mfd-quota-layout mfd-quota-layout-combined">
              <div className="mfd-quota-copy mfd-quota-copy-centered">
                <div className="mfd-quota-summary mfd-quota-summary-centered">
                  <div className="mfd-quota-summary-main mfd-quota-summary-main-centered">
                    <span className="mfd-quota-summary-strong">{L0(used)}</span>
                    <span className="mfd-quota-summary-mid">/</span>
                    <span className="mfd-quota-summary-strong">{L0(quota)}</span>
                  </div>
                  <div className="mfd-quota-summary-unit mfd-quota-summary-unit-block">monthly quota</div>
                </div>

                <div className="mfd-quota-gauge-side">
                  <div className="mfd-quota-gauge-wrap">
                    <QuotaGauge
                      pct={pct}
                      quota={quota}
                      warning={q.thresholds.warning}
                      danger={q.thresholds.danger}
                      tone={fillTone}
                    />
                  </div>
                  <div className="mfd-legend mfd-quota-legend">
                    <span className="mfd-leg"><span className="mfd-leg-dot" style={{ background: "var(--red-400)" }} /> Critical: {q.thresholds.danger}%</span>
                    <span className="mfd-leg"><span className="mfd-leg-dot" style={{ background: "var(--amber-500)" }} /> At risk: {riskMin}-{riskMax}%</span>
                    <span className="mfd-leg"><span className="mfd-leg-dot" style={{ background: "var(--green-500)" }} /> Available: 0-{availableMax}%</span>
                  </div>
                </div>

                <div className="mfd-quota-disclaimer mfd-quota-disclaimer-left">
                  <Icon name="info" size={12} /> {disclaimer}
                </div>
              </div>

              <div className="mfd-quota-vehicle-side">
                <div className="mfd-quota-vehicle-head">
                  {isMobileViewport ? (
                    <button
                      type="button"
                      className="mfd-quota-vehicle-toggle"
                      onClick={() => setVehicleOpen((v) => !v)}
                      aria-expanded={vehicleOpen}
                    >
                      <div className="mfd-quota-vehicle-head-copy">
                        <div className="mfd-quota-title mfd-quota-vehicle-title">Subsidy usage by vehicle</div>
                        <div className="mfd-quota-sub">
                          June 2026 · {vehRows.length} vehicles
                        </div>
                      </div>
                      <Icon name={vehicleOpen ? "expand_less" : "expand_more"} size={18} color="var(--fg-secondary)" />
                    </button>
                  ) : (
                    <>
                      <div className="mfd-quota-vehicle-head-copy">
                        <div className="mfd-quota-title mfd-quota-vehicle-title">Subsidy usage by vehicle</div>
                        <div className="mfd-quota-sub">
                          June 2026 · {vehRows.length} vehicles
                        </div>
                      </div>
                      <label className="mfd-vehicle-search">
                        <Icon name="search" size={15} />
                        <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search vehicle" aria-label="Search vehicle" />
                        {query && <button type="button" onClick={() => { setQuery(""); setPage(1); }} aria-label="Clear"><Icon name="close" size={14} /></button>}
                      </label>
                    </>
                  )}
                </div>

                <div className={"mfd-quota-veh-body mfd-quota-veh-body-combined" + (isMobileViewport && !vehicleOpen ? " is-collapsed" : "")}>
                  <div className="mfd-veh-quota-scroll">
                    {isMobileViewport && (
                      <label className="mfd-vehicle-search mfd-vehicle-search-mobile">
                        <Icon name="search" size={15} />
                        <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search vehicle" aria-label="Search vehicle" />
                        {query && <button type="button" onClick={() => { setQuery(""); setPage(1); }} aria-label="Clear"><Icon name="close" size={14} /></button>}
                      </label>
                    )}
                    <div className="mfd-veh-quota-list">
                      {pageRows.map((r) => {
                        const vs = vehicleStatus(r.used, r.quota);
                        const vpct = r.quota ? (r.used / r.quota) * 100 : 0;
                        const displayUsed = r.quota > 0 ? Math.min(r.used, r.quota) : r.used;
                        const remaining = Math.max(0, (r.quota || 0) - displayUsed);
                        const isExpanded = expandedVehicle === r.plate;
                        return (
                          <div key={r.plate} className={"mfd-veh-quota-item" + (isExpanded ? " is-expanded" : "")}>
                            <button
                              type="button"
                              className={"mfd-veh-quota-row" + (isMobileViewport ? " is-mobile" : "")}
                              onClick={isMobileViewport ? () => setExpandedVehicle((v) => v === r.plate ? null : r.plate) : undefined}
                              aria-expanded={isMobileViewport ? isExpanded : undefined}
                            >
                              <div className="mfd-veh-quota-lbl">{r.plate}</div>
                              <div className="mfd-veh-quota-bar">
                                <div className="mfd-veh-quota-track">
                                  {r.quota > 0 && <div className={"mfd-veh-quota-fill " + vs} style={{ width: Math.min(vpct, 100) + "%" }} />}
                                </div>
                              </div>
                              {isMobileViewport ? (
                                <div className="mfd-veh-quota-more">
                                  <Icon name={isExpanded ? "expand_less" : "expand_more"} size={16} color="var(--fg-tertiary)" />
                                </div>
                              ) : (
                                <div className="mfd-veh-quota-val">
                                  {vs === "none" ? "No quota" : (
                                    <>
                                      <span>{L0(displayUsed)}</span>
                                      <span className="mfd-veh-quota-of"> / {L0(r.quota)}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </button>
                            {isMobileViewport && isExpanded && (
                              <div className="mfd-veh-quota-popover">
                                <div className="mfd-veh-quota-detail-row">
                                  <span>Used</span>
                                  <strong>{L0(displayUsed)}</strong>
                                </div>
                                <div className="mfd-veh-quota-detail-row">
                                  <span>Quota</span>
                                  <strong>{L0(r.quota)}</strong>
                                </div>
                                <div className="mfd-veh-quota-detail-row">
                                  <span>Remaining</span>
                                  <strong>{L0(remaining)}</strong>
                                </div>
                                <div className="mfd-veh-quota-detail-row">
                                  <span>Status</span>
                                  <strong>{vs === "critical" ? "Critical" : vs === "at-risk" ? "At risk" : vs === "none" ? "No quota" : "Available"}</strong>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                </div>
              </div>
            </div>
          </div>
        </>
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

      <CountCard fill icon="humidity_percentage" count={empty ? "RM 0.00" : RM(s.rebate.amount)} label="Rebate Earned" sub="Last month" actionLabel="Open rebate history"
        stats={[
          { n: empty ? "RM 0" : `+RM ${s.rebate.vsLastMonth}`, label: "vs last 2 months", tone: "green" },
        ]} />

      <CountCard fill icon="credit_card" count={empty ? 0 : s.fleetCards.total} label="Fleet Cards" sub="Total issued" actionLabel="Open fleet cards"
        stats={[
          { n: empty ? 0 : s.fleetCards.active, label: "Active", tone: "green" },
          { n: empty ? 0 : s.fleetCards.frozen, label: "Suspended", tone: "red" },
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

const RANGE_LABEL = { threeMonth: "Last 3 months", sixMonth: "Last 6 months", twelveMonth: "Last 12 months" };

function FuelUsageTrend({ empty, range }) {
  const [metric, setMetric] = useState("litres");
  const [hover, setHover] = useState(null);
  const rangeLabel = RANGE_LABEL[range] || "Last 6 months";

  if (empty) {
    return (
      <div className="mfd-card mfd-trend-card">
        <div className="mfd-cardhead">
          <div>
            <div className="mfd-cardhead-title">Fuel Usage Trend</div>
            <div className="mfd-cardhead-sub">{rangeLabel}</div>
          </div>

        </div>
        <EmptyBlock icon="bar_chart" title="No usage data yet" subtitle="Fuel usage will appear once transactions come in." />
      </div>
    );
  }

  const data = D.usageTrend[range][metric];
  const labels = D.usageTrend[range].labels;
  const series = [
    { key: "non", label: "Non-subsidised", color: "var(--green-500)", values: data.nonSubsidised },
    { key: "sub", label: "Subsidised", color: "var(--navy-800)", values: data.subsidised },
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
          <div className="mfd-cardhead-sub">{rangeLabel}</div>
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
                      <div className="mfd-bar-seg" style={{ height: totals[i] ? (series[0].values[i] / totals[i] * 100) + "%" : "0%", background: series[0].color }} />
                      <div className="mfd-bar-seg" style={{ height: totals[i] ? (series[1].values[i] / totals[i] * 100) + "%" : "0%", background: series[1].color }} />
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

const MEDAL_PATHS = {
  1: "M12.5 18V12.948C12.5 12.374 12.5 12.086 12.27 12.015C11.763 11.858 11 12.999 11 12.999M14 17.999L12.5 18L11 17.999M13.56 2L11 7.898M18 2L15.179 8.5M10.44 2L12 5.594M6 2L8.821 8.5",
  2: "M10.5 13.118C10.58 12.333 11.108 12 11.658 12H12.324C12.874 12 13.401 12.333 13.481 13.118C13.5054 13.3721 13.5054 13.6279 13.481 13.882C13.432 14.36 12.854 14.909 12.854 14.909L12 15.5C12 15.5 10.5 16.5 10.5 17.5C10.5 18.04 10.937 18 11.477 18H13.481M13.56 2L11 7.898M18 2L15.179 8.5M10.44 2L12 5.594M6 2L8.821 8.5",
  3: "M10.5 13.118C10.58 12.333 11.107 12 11.658 12H12.324C12.874 12 13.401 12.333 13.481 13.118C13.5054 13.3721 13.5054 13.6279 13.481 13.882C13.415 14.53 12.971 15 12.491 15M12.491 15C12.971 15 13.415 15.47 13.481 16.118C13.5054 16.3721 13.5054 16.6279 13.481 16.882C13.401 17.667 12.874 18 12.324 18H11.658C11.107 18 10.58 17.667 10.5 16.882M12.491 15H12.431M13.56 2L11 7.898M18 2L15.179 8.5M10.44 2L12 5.594M6 2L8.821 8.5",
};

function MedalIcon({ rank, color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 15C5 11.134 8.022 8 11.75 8H12.25C15.978 8 19 11.134 19 15C19 18.866 15.978 22 12.25 22H11.75C8.022 22 5 18.866 5 15Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={MEDAL_PATHS[rank]} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TopPetrolStations({ empty, range }) {
  const stations = D.topPetrolStations?.[range] || [];
  const rangeLabel = RANGE_LABEL[range] || "All time";
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const layout = card && card.closest(".mfd-bottom-layout");
    const leftCol = layout && layout.querySelector(".mfd-bottom-left");
    if (!card || !leftCol) return;

    const mq = window.matchMedia("(min-width: 681px)");
    function sync() {
      card.style.height = mq.matches ? leftCol.offsetHeight + "px" : "";
    }
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(leftCol);
    mq.addEventListener("change", sync);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, [empty, range]);

  return (
    <div className="mfd-card mfd-stations-card" ref={cardRef}>
      <CardHead icon="emoji_events" title="Top 10 Petrol Stations" sub={rangeLabel} />
      {empty || !stations.length ? (
        <div className="mfd-stations-empty">No data available</div>
      ) : (
        <div className="mfd-stations-list">
          {stations.map((s) => (
            <HistoryCard
              key={s.rank}
              prefix={s.rank <= 3 ? (
                <span className="mfd-stations-medal">
                  <MedalIcon rank={s.rank} color={s.rank === 1 ? "#C19A00" : s.rank === 2 ? "#7D8794" : "#B87333"} />
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
      )}
    </div>
  );
}

/* ── Quota skeleton (shown under the lock scrim on Free plan) ──── */
function SkeletonLine({ width, height = 12, className = "" }) {
  return (
    <div className={"mfd-skel-line " + className} style={{ width, height }} />
  );
}

function QuotaSkeleton() {
  return (
    <div className="mfd-quota-row">
      {/* Overview skeleton */}
      <div className="mfd-kpi mfd-quota-card">
        <div className="mfd-quota-head">
          <div className="mfd-quota-head-main">
            <div className="mfd-skel-ico" />
            <div>
              <SkeletonLine width={120} />
              <SkeletonLine width={90} height={10} className="mfd-skel-short" />
            </div>
          </div>
          <SkeletonLine width={72} height={22} />
        </div>
        <div className="mfd-quota-body-top">
          <div className="mfd-quota-summary">
            <div className="mfd-quota-summary-main">
              <SkeletonLine width={140} height={28} />
            </div>
            <SkeletonLine width={100} height={10} />
          </div>
          <div className="mfd-quota-bar-wrap">
            <div className="mfd-skel-track" />
          </div>
          <div className="mfd-quota-stats">
            <div className="mfd-quota-stat">
              <SkeletonLine width={70} height={18} />
              <SkeletonLine width={80} height={10} />
            </div>
            <div className="mfd-quota-stat mfd-quota-stat-divided">
              <SkeletonLine width={70} height={18} />
              <SkeletonLine width={80} height={10} />
            </div>
          </div>
        </div>
      </div>

      {/* By-vehicle skeleton */}
      <div className="mfd-kpi mfd-quota-card mfd-quota-veh-card">
        <div className="mfd-quota-head">
          <div className="mfd-quota-head-main">
            <div className="mfd-skel-ico" />
            <div>
              <SkeletonLine width={160} />
              <SkeletonLine width={110} height={10} className="mfd-skel-short" />
            </div>
          </div>
          <SkeletonLine width={140} height={30} />
        </div>
        <div className="mfd-quota-veh-body">
          <div className="mfd-veh-quota-list">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mfd-veh-quota-row">
                <SkeletonLine width={56} height={10} />
                <div className="mfd-veh-quota-bar">
                  <div className="mfd-skel-track" />
                </div>
                <SkeletonLine width={70} height={10} />
              </div>
            ))}
          </div>
          <div className="mfd-legend mfd-vehicle-legend">
            <SkeletonLine width={64} height={10} />
            <SkeletonLine width={64} height={10} />
            <SkeletonLine width={64} height={10} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const tier = t.subscription;
  const range = { free: "threeMonth", lite: "sixMonth", premium: "twelveMonth" }[tier] || "sixMonth";
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
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="mfd-shell">
      <Rail mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="mfd-main">
        <header className="mfd-topbar">
          <button type="button" className="mfd-hamburger" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={20} />
          </button>
          <OrgSwitcher />
          <div className="mfd-topbar-spacer" />
          <button className="mfd-iconbtn mfd-notifications-btn" aria-label="Notifications"><Icon name="notifications" size={18} /></button>
          <button className="mfd-iconbtn mfd-close-btn" onClick={() => setShowLeaveModal(true)} aria-label="Close"><Icon name="close" size={18} /></button>
        </header>
        {showLeaveModal && (
          <LeaveConfirmModal onStay={() => setShowLeaveModal(false)} onLeave={() => { setShowLeaveModal(false); window.location.href = "../org-dashboard/index.html"; }} />
        )}

        <div className="mfd-content">
          <PageHeader />

          <FuelPulse empty={empty} />

          {t.quotaState !== "none" && (
            <div className="mfd-quota-section">
              <LockSection locked={rank(tier) < rank("lite")} tier="lite"
                note="Subsidy quota tracking is available on Lite and Premium plans.">
                {rank(tier) < rank("lite") ? (
                  <QuotaSkeleton />
                ) : (
                  <SubsidyQuotaCombinedCard
                    empty={empty}
                    quotaState={t.quotaState}
                    subsidy={subsidy}
                    subsidies={subsidies}
                    subsidyIdx={subsidyIdx}
                    onSelectSubsidy={(i) => { setSubsidyIdx(i); try { localStorage.setItem("mfd_subsidy_" + D.org.id, i); } catch {} }}
                  />
                )}
              </LockSection>
            </div>
          )}

          <div className={"mfd-bottom-layout" + (t.showTopStations ? "" : " mfd-bottom-layout--single")}>
            <div className="mfd-bottom-left">
              <div className="mfd-trend-row">
                <FuelUsageTrend empty={empty} range={range} />
              </div>
              <AccountActivity empty={empty} tier={tier} />
            </div>
            {t.showTopStations && (
              <div className="mfd-bottom-right">
                <TopPetrolStations empty={empty} range={range} />
              </div>
            )}
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
        <TweakSection label="Layout" />
        <TweakToggle label="Show Top 10 Petrol Stations" value={t.showTopStations} onChange={(v) => setTweak("showTopStations", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}
