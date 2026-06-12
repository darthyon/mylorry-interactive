// host-agent-config.jsx — Host portal: Agent Module (tabs + commission config)

const { useState, useMemo, useRef, useEffect } = React;
const MyFuelCommissionTabView   = window.MyFuelCommissionTab;
const SubscriptionCommissionTabView = window.SubscriptionCommissionTab;

/* ─── Commission Status Badge ────────────────────────────────── */
const CS_META = {
  activated:          { label:"Activated",          cls:"comm-activated"  },
  pending_onboarding: { label:"Pending Onboarding", cls:"comm-pending-ob" },
  on_hold:            { label:"On Hold",             cls:"comm-on-hold"    },
  deactivated:        { label:"Deactivated",         cls:"comm-deactivated"},
};
function CommissionStatusBadge({ status }) {
  const m = CS_META[status] || CS_META.activated;
  return <span className={"ml-badge " + m.cls}>{m.label}</span>;
}

/* ─── KPI progress bar — shared (window.HKPIProgress) ───────── */
const KPIProgress = window.HKPIProgress;
const KPIProgressMeta = window.KPIProgressMeta;
const AccountStatusBadge = window.HAccountStatusBadge;

/* ─── KPI multiplier zones — derived from configurable thresholds ─────── */
// Each threshold stores only a lower bound (minPct); the upper bound of a tier
// is the next-higher tier's lower bound, so ranges stay contiguous (no gaps /
// overlaps) by construction. The final tier (isFinal) is open-ended upward, but
// the visual axis is capped at 100% because target achievement is the ceiling
// of the progress track.
// Returns { zones (ascending, with from/to/mult/tier/isFinal/col/fill), axisMax }.
function kpiZones(thresholds) {
  const asc = [...(thresholds || [])].sort((a, b) => a.minPct - b.minPct);
  if (asc.length === 0) return { zones: [], axisMax: 100 };
  const axisMax  = 100;
  const zones = asc.map((t, i) => ({
    from: t.minPct,
    to:   asc[i + 1] ? asc[i + 1].minPct : axisMax,
    mult: t.mult, tier: t.tier, isFinal: t.isFinal,
  }));
  return { zones, axisMax };
}
const kpiZoneOf = (pct, zones) =>
  zones.find(z => pct >= z.from && pct < z.to) || zones[zones.length - 1];
// Range text for a zone — final tier is open-ended (≥ lower%).
const zoneRange = z => z.isFinal
  ? `≥ ${z.from}%`
  : `${z.from}%–${(z.to - 0.01).toFixed(2)}%`;
const monthKeyOfDate = value => (value ? value.slice(0, 7) : "");
const currentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
const nextMonthKey = value => {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  const dt = new Date(year, month, 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};
const monthLabel = value => {
  if (!value) return "—";
  const [year, month] = value.split("-");
  const dt = new Date(Number(year), Number(month) - 1, 1);
  return dt.toLocaleDateString("en-MY", { month:"long", year:"numeric" });
};
function buildAgentConfig(agent) {
  const base = window.HC.AGENT_CONFIG;
  const row  = agent || base;
  return {
    ...base,
    id: row.id,
    name: row.name,
    referrer: row.referrer,
    joined: row.joined,
    status: row.status || base.status,
    accountStatus: row.accountStatus || base.accountStatus,
    kpi: {
      ...base.kpi,
      actual: row.volume ?? base.kpi.actual,
      locked: row.kpiPhase === "complete",
      phase: row.kpiPhase || "active",
      current: { ...base.kpi.current, target: row.kpiTarget ?? base.kpi.current.target },
    },
    termination: row.id === base.id
      ? {
          ...base.termination,
          scheduledTransfer: base.termination?.scheduledTransfer
            ? { ...base.termination.scheduledTransfer }
            : null,
        }
      : { date:"", commissionEndDate:"", scheduledTransfer:null },
  };
}

/* ─── KPI Progress block (segmented axis) — inline inside KPI Config ─── */
function KPIProgressBlock({ kpi, target, thresholds }) {
  const actual = kpi?.actual ?? 0;
  const period = kpi?.progressPeriod || "Dec 1–31";
  const phase  = kpi?.phase || (kpi?.locked ? "complete" : "active");
  const isFuture = phase === "future";
  const pct  = target ? Math.round((actual / target) * 1000) / 10 : 0;
  const progressMeta = KPIProgressMeta(pct);
  const { zones, axisMax } = kpiZones(thresholds);
  const zone = kpiZoneOf(pct, zones);
  const markerCol = isFuture ? "var(--fg-tertiary)" : progressMeta.solid;
  const pos = p => (Math.min(p, axisMax) / axisMax) * 100;
  // Tick marks at every interior boundary (each zone's lower bound > 0).
  const ticks = zones.filter(z => z.from > 0).map(z => z.from);
  const finalZone = zones[zones.length - 1];
  // Discrete cells (SegmentedProgressView-style). Each cell is tinted by the
  // shared progress bands: light tint when not yet reached, saturated colour
  // once achieved. Threshold ticks remain as quiet guides only.
  const CELLS = 10;
  const STEP = axisMax / CELLS;
  const cells = Array.from({ length: CELLS }, (_, i) => {
    const from = i * STEP;
    const sampled = kpiZoneOf(from + STEP / 2, zones) || {};
    const z = i === CELLS - 1 && finalZone?.from >= axisMax ? finalZone : sampled;
    const meta = KPIProgressMeta(from + STEP / 2);
    const reached = !isFuture && pct > from;
    return {
      bg: reached ? meta.solid : meta.fill,
      tier: z.tier, range: z.from != null ? zoneRange(z) : "", mult: z.mult,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Metric row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="hac-kpiaxis-pct" style={{ color: markerCol, lineHeight: .9, display:"inline-flex", alignItems:"center", gap:5 }}>
          <span>{isFuture ? "–" : pct + "%"}</span>
          {!isFuture && progressMeta.isAchieved && <span style={{ fontSize:11, lineHeight:1 }}>✓</span>}
        </div>
        <div className="hac-kpiaxis-readout" style={{ gap: 2 }}>
          <span>Achieved <b>{isFuture ? "–" : actual.toLocaleString("en-US") + " L"}</b></span>
          {!isFuture && zone && (
            <span style={{ color: "var(--fg-secondary)" }}>
              Current multiplier {zone.mult}%
            </span>
          )}
        </div>
      </div>
      {/* Segmented axis directly underneath */}
      <div className={"hac-kpiaxis" + (isFuture ? " future" : "")} style={{ marginTop: 0 }}>
        <div className="hac-kpiseg">
          {cells.map((c, i) => (
            <div key={i} className="hac-kpiseg-cell ml-tooltip-wrap" style={{ background: c.bg }}>
              {c.tier && (
                <span className="ml-tooltip">
                  <b>{c.tier}</b><br />{c.range} · {c.mult}% multiplier
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="hac-kpiaxis-ticks">
          {ticks.map(t => (
            <span key={t} className="hac-kpiaxis-tick" style={{ left: pos(t) + "%" }}>{t}%</span>
          ))}
        </div>
      </div>
      {isFuture && (
        <div className="hac-kpiaxis-note">
          <HIcon name="info" size={14} color="var(--fg-tertiary)" />
          Evaluation period has not started. Progress tracked from {period}.
        </div>
      )}
    </div>
  );
}

/* ─── Bank badge ─────────────────────────────────────────────── */
const BANK_META = {
  "Maybank":{"bg":"#FFF3D4","fg":"#7A4F00","abbr":"MB"}, "CIMB":{"bg":"#FFE4E4","fg":"#B71C1C","abbr":"CIMB"},
  "Public Bank":{"bg":"#E3F0FF","fg":"#1A5CA8","abbr":"PB"}, "RHB Bank":{"bg":"#FFE8D6","fg":"#B94000","abbr":"RHB"},
  "Hong Leong Bank":{"bg":"#E8F5E9","fg":"#2E7D32","abbr":"HLB"}, "AmBank":{"bg":"#F3E5FF","fg":"#6A1B9A","abbr":"AMB"},
  "Bank Islam":{"bg":"#E0F4FF","fg":"#006E9F","abbr":"BI"}, "Bank Rakyat":{"bg":"#E8F5E9","fg":"#1B5E20","abbr":"BR"},
  "BSN":{"bg":"#FFF3E0","fg":"#E65100","abbr":"BSN"}, "OCBC":{"bg":"#FFF9E6","fg":"#7B5800","abbr":"OCBC"},
  "UOB":{"bg":"#E8EEFF","fg":"#1A237E","abbr":"UOB"}, "Standard Chartered":{"bg":"#E8F5E9","fg":"#1B5E20","abbr":"SC"},
};
function BankBadge({ name }) {
  if (!name || name === "-") return <span style={{ color:"var(--fg-disabled)" }}>—</span>;
  const m = BANK_META[name] || { bg:"#F5F5F5", fg:"#757575", abbr:name.substring(0,2).toUpperCase() };
  return (
    <div className="hac-bank-badge">
      <div className="hac-bank-icon" style={{ background:m.bg, color:m.fg }}>{m.abbr}</div>
      <span style={{ fontSize:13 }}>{name}</span>
    </div>
  );
}

/* ─── Ellipsis menu ──────────────────────────────────────────── */
function EllipsisMenu({ agent, onView, onEdit, onTerminate }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const DROP_W = 150;

  useEffect(() => {
    if (!open) return;
    const close = e => {
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

  const toggle = e => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.right - DROP_W });
    }
    setOpen(v => !v);
  };

  return (
    <div className="hac-ellipsis">
      <button className="ml-icon-btn" ref={btnRef} onClick={toggle}>
        <HIcon name="more_horiz" size={18} />
      </button>
      {open && ReactDOM.createPortal(
        <div className="hac-drop-fixed" ref={dropRef}
          style={{ top: pos.top, left: pos.left }}
          onClick={e => e.stopPropagation()}>
          <button className="hac-drop-item" onClick={() => { setOpen(false); onView(); }}><HIcon name="visibility" size={15} /> View</button>
          <button className="hac-drop-item" onClick={() => { setOpen(false); onEdit(); }}><HIcon name="edit" size={15} /> Edit</button>
          {agent.status !== "terminating" &&
            <button className="hac-drop-item danger" onClick={() => { setOpen(false); onTerminate(); }}><HIcon name="event_busy" size={15} /> Terminate</button>}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── Agents list (Tab 1) ────────────────────────────────────── */
function AgentsListView({ onView, onEdit, onCreate, onTerminate }) {
  const { AGENTS } = window.HC;
  const [q, setQ]               = useState("");
  const [filter, setFilter]       = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]           = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  // staged values inside panel
  const [pendingType,   setPendingType]   = useState("all");
  const [pendingStatus, setPendingStatus] = useState("all");
  const [perPage, setPerPage] = useState(10);

  const hasActiveFilters = filter !== "all" || statusFilter !== "all";
  const activeCount = (filter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  const toggleFilter = () => {
    if (!filterOpen) { setPendingType(filter); setPendingStatus(statusFilter); }
    setFilterOpen(v => !v);
  };
  const applyFilters = () => {
    setFilter(pendingType); setStatusFilter(pendingStatus);
    setPage(1); setFilterOpen(false);
  };
  const resetFilters = () => {
    setPendingType("all"); setPendingStatus("all");
    setFilter("all"); setStatusFilter("all"); setPage(1);
  };

  const filtered = useMemo(() => {
    let list = AGENTS;
    if (q) list = list.filter(a =>
      a.name.toLowerCase().includes(q.toLowerCase()) ||
      a.id.toLowerCase().includes(q.toLowerCase()) ||
      a.email.toLowerCase().includes(q.toLowerCase())
    );
    if (filter === "referrer") list = list.filter(a => a.referrer);
    if (filter === "agent")    list = list.filter(a => !a.referrer);
    if (statusFilter !== "all") list = list.filter(a => a.accountStatus === statusFilter);
    return list;
  }, [AGENTS, q, filter, statusFilter]);

  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="hac-toolbar">
        <div className="hac-toolbar-left">
          {/* Search — DS pattern: scope pill + input */}
          <div className="hac-search-group">
            <button className="hac-scope-pill">
                Agent <HIcon name="arrow_drop_down" size={18} color="var(--green-600)" />
              </button>
            <div className="hac-search-bar">
              <HIcon name="search" size={18} color="var(--fg-tertiary)" />
              <input
                className="hac-search-input"
                placeholder="Search by name, ID or email"
                value={q}
                onChange={e => { setQ(e.target.value); setPage(1); }}
              />
              {q && (
                <button className="hac-search-clear" onClick={() => { setQ(""); setPage(1); }}>
                  <HIcon name="close" size={16} color="var(--fg-tertiary)" />
                </button>
              )}
            </div>
          </div>
          {/* Filter button */}
          <button
            className={"hac-filter-btn" + (hasActiveFilters ? " active" : "")}
            onClick={toggleFilter}
          >
            <HIcon name="tune" size={18} />
            Filter
            {activeCount > 0 && <span className="hac-filter-badge">{activeCount}</span>}
          </button>
        </div>
        <button className="hac-create-btn" onClick={onCreate}>
          <HIcon name="add" size={16} color="#fff" /> Create Agent Account
        </button>
      </div>

      {/* ── Filter panel ── */}
      {filterOpen && (
        <div className="hac-filter-panel">
          <div className="hac-filter-grid">
            <div className="hac-filter-field">
              <label>Role</label>
              <select value={pendingType} onChange={e => setPendingType(e.target.value)}>
                <option value="all">All roles</option>
                <option value="agent">Agent</option>
                <option value="referrer">Referrer</option>
              </select>
            </div>
            <div className="hac-filter-field">
              <label>Account Status</label>
              <select value={pendingStatus} onChange={e => setPendingStatus(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
          <div className="hac-filter-actions">
            <button className="hac-filter-apply" onClick={applyFilters}>Apply Filters</button>
            <button className="hac-filter-reset" onClick={resetFilters}>Reset All</button>
          </div>
        </div>
      )}

      <div className="hac-count">{filtered.length} Agent account{filtered.length !== 1 ? "s" : ""}</div>

      <div className="ml-table-wrap">
        <table className="ml-table hac-agent-table">
          <thead>
            <tr>
              <th>No.</th><th>Agent</th><th>Role</th>
              <th>KPI Progress</th><th>Status</th>
              <th>Mobile Number</th><th>Email</th><th>IC Number</th>
              <th>Bank Name</th><th>Account Number</th><th>Account Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((a, i) => (
              <tr key={a.id} onClick={() => onView(a)}>
                <td className="ml-mono">{(page - 1) * perPage + i + 1}</td>
                <td>
                  <div className="ml-cell-main">{a.name}</div>
                  <div className="ml-cell-sub"><code className="hac-code">{a.id}</code></div>
                </td>
                <td>{a.referrer ? "Referrer" : "Agent"}</td>
                <td><KPIProgress pct={a.kpiPct} actual={a.volume} target={a.kpiTarget} period="Dec 1–31" phase={a.kpiPhase} /></td>
                <td><AccountStatusBadge status={a.accountStatus} /></td>
                <td className="ml-mono">{a.mobile}</td>
                <td style={{ color:"var(--fg-secondary)", fontSize:12 }}>{a.email}</td>
                <td className="ml-mono" style={{ fontSize:12 }}>{a.ic}</td>
                <td><BankBadge name={a.bankName} /></td>
                <td className="ml-mono" style={{ fontSize:12 }}>{a.accNo === "-" ? <span style={{ color:"var(--fg-disabled)" }}>—</span> : a.accNo}</td>
                <td style={{ fontSize:13 }}>{a.accName === "-" ? <span style={{ color:"var(--fg-disabled)" }}>—</span> : a.accName}</td>
                <td onClick={e => e.stopPropagation()}>
                  <EllipsisMenu agent={a} onView={() => onView(a)} onEdit={() => onEdit(a)} onTerminate={() => onTerminate(a)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <HPager page={page} perPage={perPage} total={filtered.length} onPage={setPage} onPerPage={setPerPage} />
    </div>
  );
}

/* ─── Modal shell ────────────────────────────────────────────── */
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="hac-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="hac-modal">
        <div className="hac-modal-drag" />
        <div className="hac-modal-head">
          <span className="hac-modal-title">{title}</span>
          <button className="hac-modal-close" onClick={onClose}><HIcon name="cancel" size={22} fill={1} color="var(--fg-disabled)" /></button>
        </div>
        <div className="hac-modal-divider" />
        <div className="hac-modal-body">{children}</div>
        {footer && <div className="hac-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ─── Threshold Modal (add / edit) ───────────────────────────── */
// Single lower-bound model: user sets the lower bound (minPct) and multiplier.
// The upper bound is derived (next-higher tier's lower bound) and shown read-only,
// so ranges stay contiguous. Final tier hides the upper bound and is open-ended.
function ThresholdModal({ editThreshold, siblings, onClose, onSave }) {
  const isEdit = !!editThreshold;
  const others = (siblings || []).filter(t => !isEdit || t.id !== editThreshold.id);
  const [tierName, setTierName] = useState(editThreshold ? editThreshold.tier : "");
  const [minPct, setMinPct]     = useState(editThreshold ? String(editThreshold.minPct ?? "") : "");
  const [mult, setMult]         = useState(editThreshold ? String(editThreshold.mult ?? "") : "");
  const [isFinal, setIsFinal]   = useState(editThreshold ? !!editThreshold.isFinal : false);

  const lower = minPct === "" ? null : +minPct;
  // Derived upper bound = lowest sibling lower-bound still above this tier's lower.
  const higher = others.map(t => t.minPct).filter(m => lower != null && m > lower);
  const derivedUpper = higher.length ? Math.min(...higher) : 100;

  const lowerValid = lower != null && lower >= 0 && lower <= 100;
  const overlaps   = others.some(t => t.minPct === lower); // duplicate lower bound
  const canSave =
    mult !== "" && !isNaN(+mult) &&
    (isFinal || (lowerValid && !overlaps && lower < derivedUpper));

  const handleSave = () => {
    if (!canSave) return;
    const fallbackName = `Tier ${(siblings ? siblings.length : 0) + (isEdit ? 0 : 1)}`;
    onSave({
      tier: tierName.trim() || fallbackName,
      minPct: lower,
      mult: +mult,
      isFinal,
    }, isEdit ? editThreshold.id : null);
    onClose();
  };

  // Derived range preview — single progress-start field, upper inferred from next tier.
  const rangePreview = lower == null
    ? "Enter a progress start to preview the range."
    : isFinal
      ? `Covers ≥ ${lower}% — open-ended, including KPI progress above 100%.`
      : `Covers ${lower}%–${(derivedUpper - 0.01).toFixed(2)}% (up to the next tier).`;

  return (
    <Modal title={isEdit ? "Edit Threshold" : "Add Threshold"} onClose={onClose} footer={
      <>
        <button className="hac-modal-cancel" onClick={onClose}>Cancel</button>
        <button className="hac-modal-save" disabled={!canSave} onClick={handleSave}>Save</button>
      </>
    }>
      <div className="hac-fg" style={{ marginBottom:14 }}>
        <label className="hac-label">Tier name</label>
        <input className="hac-input" placeholder="Auto (e.g. Tier 1)" value={tierName}
          onChange={e => setTierName(e.target.value)} />
      </div>
      <div className="hac-fg" style={{ marginBottom:6 }}>
        <label className="hac-label req">Progress start %*</label>
        <input className="hac-input" type="number" min="0" max="100" placeholder="e.g. 75"
          value={minPct} onChange={e => setMinPct(e.target.value)} />
      </div>
      <div className="hac-field-hint" style={{ marginBottom:14 }}>{rangePreview}</div>
      <label className="hac-check-row" style={{ marginBottom:14 }}>
        <input type="checkbox" checked={isFinal} onChange={e => setIsFinal(e.target.checked)} />
        <span>Set as final tier (open-ended, ≥ progress start)</span>
      </label>
      <div className="hac-fg">
        <label className="hac-label req">Multiplier %*</label>
        <input className="hac-input" type="number" placeholder="e.g. 50" value={mult}
          onChange={e => setMult(e.target.value)} />
        <div className="hac-field-hint">Applied to the commission earned by the agent</div>
      </div>
    </Modal>
  );
}

/* ─── Add SP Account modal ───────────────────────────────────── */
const SP_ORG_LIST = [
  { sp:"ARC-PTN-063", org:"Arcadian Haulage"          }, { sp:"BLU-PTN-088", org:"Bluechip Freight Sdn Bhd" },
  { sp:"GLD-PTN-071", org:"Golden Transport Corp"     }, { sp:"EAG-PTN-012", org:"Eagle Logistics Sdn Bhd"  },
  { sp:"SWF-PTN-034", org:"SwiftHaul Transport"       }, { sp:"IRT-PTN-056", org:"IronTrail Trucking"        },
  { sp:"CGP-PTN-078", org:"CargoPulse Express"        }, { sp:"GSR-PTN-091", org:"GoSwift Rides"             },
  { sp:"TRW-PTN-102", org:"TransWorld Cargo"          }, { sp:"CLN-PTN-115", org:"CleanShift Transit"        },
];
function AddSPModal({ onClose, onAdd, existing }) {
  const [q, setQ]           = useState("");
  const [selected, setSelected] = useState(new Set());
  const available = SP_ORG_LIST.filter(o => !existing.includes(o.sp));
  const filtered  = available.filter(o => o.org.toLowerCase().includes(q.toLowerCase()));
  const toggle    = sp => setSelected(s => { const n = new Set(s); n.has(sp) ? n.delete(sp) : n.add(sp); return n; });
  return (
    <Modal title="Add SP Account" onClose={onClose} footer={
      <>
        <button className="hac-modal-cancel" onClick={onClose}>Cancel</button>
        <button className="hac-modal-save" disabled={selected.size === 0}
          onClick={() => { onAdd([...selected]); onClose(); }}>Add {selected.size > 0 ? `(${selected.size})` : ""}</button>
      </>
    }>
      <div className="hac-sp-search-wrap">
        <HIcon name="search" size={15} color="var(--fg-tertiary)" />
        <input className="hac-search" style={{ flex:1, minWidth:0 }} placeholder="Search organisation"
          value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {selected.size > 0 && (
        <div style={{ textAlign:"right", margin:"6px 0 2px" }}>
          <button className="hac-clear-sel" onClick={() => setSelected(new Set())}>Clear selection</button>
        </div>
      )}
      <div className="hac-sp-list">
        {filtered.map(o => {
          const checked = selected.has(o.sp);
          return (
            <label key={o.sp} className={"hac-sp-item" + (checked ? " checked" : "")} onClick={() => toggle(o.sp)}>
              <div className={"hac-sp-checkbox" + (checked ? " checked" : "")}>
                {checked && <HIcon name="check" size={13} color="#fff" />}
              </div>
              <span>{o.org}</span>
              <code className="hac-code" style={{ marginLeft:"auto", fontSize:11 }}>{o.sp}</code>
            </label>
          );
        })}
      </div>
    </Modal>
  );
}

/* ─── Inline info tooltip ────────────────────────────────────── */
function InfoTip({ text }) {
  return (
    <span className="ml-tooltip-wrap">
      <button className="ml-info-btn" type="button" aria-label={text}>
        <HIcon name="info" size={14} />
      </button>
      <span className="ml-tooltip">{text}</span>
    </span>
  );
}

/* ─── Three-dot card menu (Edit / Delete) ────────────────────── */
function CardMenu({ onEdit, onDelete, deleteDisabled }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const DROP_W = 150;

  useEffect(() => {
    if (!open) return;
    const close = e => {
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

  const toggle = e => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.right - DROP_W });
    }
    setOpen(v => !v);
  };

  return (
    <div className="hac-ellipsis">
      <button className="ml-icon-btn" ref={btnRef} onClick={toggle} title="Threshold actions">
        <HIcon name="more_horiz" size={18} />
      </button>
      {open && ReactDOM.createPortal(
        <div className="hac-drop-fixed" ref={dropRef}
          style={{ top: pos.top, left: pos.left }}
          onClick={e => e.stopPropagation()}>
          <button className="hac-drop-item" onClick={() => { setOpen(false); onEdit(); }}>
            <HIcon name="edit" size={15} /> Edit
          </button>
          {!deleteDisabled && (
            <button className="hac-drop-item danger" onClick={() => { setOpen(false); onDelete(); }}>
              <HIcon name="delete" size={15} /> Delete
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── Evaluation period options ──────────────────────────────── */
const EVAL_PERIOD_GROUPS = [
  {
    label: "Custom period",
    options: [
      { label: "Custom range", description: "Choose a start and end date manually. Default shortcut: Jan 1 - Dec 31." },
    ],
  },
  {
    label: "Recent periods",
    options: [
      { label: "Last completed month", description: "Uses the most recent completed reporting month." },
      { label: "Last 3 completed months", description: "Uses the most recent 3 completed reporting months." },
      { label: "Last 6 completed months", description: "Uses the most recent 6 completed reporting months." },
      { label: "Last 12 completed months", description: "Uses the most recent 12 completed reporting months." },
    ],
  },
  {
    label: "Calendar periods",
    options: [
      { label: "Last completed quarter", description: "Uses the previous completed calendar quarter." },
      { label: "Last completed half year", description: "Uses the previous completed half-year period, H1 or H2." },
      { label: "Last completed year", description: "Uses the previous completed calendar year, Jan 1 - Dec 31." },
    ],
  },
];

function normalizeEvalPeriod(value) {
  const map = {
    Monthly: "Last completed month",
    Quarterly: "Last completed quarter",
    "Half-yearly": "Last completed half year",
    Yearly: "Last completed year",
    "Last month": "Last completed month",
    "Last 3 months": "Last 3 completed months",
    "Last 6 months": "Last 6 completed months",
    "Last 12 months": "Last 12 completed months",
    "Every Last Quarter": "Last completed quarter",
    "Every Last Half Year": "Last completed half year",
    "Every Last Year": "Last completed year",
    "Last year": "Last completed year",
    "[Default - Dec] Start Month + End Month": "Custom range",
  };
  return map[value] || value || "Last completed year";
}

function formatShortDate(value) {
  if (!value) return "—";
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString("en-MY", { month:"short", day:"numeric" });
}

function formatRangeDisplay(startDate, endDate) {
  if (!startDate || !endDate) return "Select date range";
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${startDate} - ${endDate}`;
  return `${start.toLocaleDateString("en-MY", { day:"numeric", month:"short", year:"numeric" })} - ${end.toLocaleDateString("en-MY", { day:"numeric", month:"short", year:"numeric" })}`;
}

function evalPeriodSummary(period) {
  const map = {
    "Custom range": "",
    "Last completed month": "Most recent completed reporting month",
    "Last 3 completed months": "Most recent 3 completed reporting months",
    "Last 6 completed months": "Most recent 6 completed reporting months",
    "Last 12 completed months": "Most recent 12 completed reporting months",
    "Last completed quarter": "Previous completed calendar quarter",
    "Last completed half year": "Previous completed half-year period, H1 or H2",
    "Last completed year": "Previous completed calendar year, Jan 1 - Dec 31",
  };
  return map[period] || "Previous completed calendar year, Jan 1 - Dec 31";
}

/* ─── KPI config section ─────────────────────────────────────── */
function CommissionSection({ kpi, editing, showHistory, setShowHistory }) {
  const [kpiTarget, setKpiTarget]     = useState(kpi?.current?.target ?? 150000);
  const [showEvalHelp, setShowEvalHelp] = useState(false);
  const [kpiThresholds, setKpiThresholds] = useState(() => {
    const t = kpi?.current?.thresholds || [
      { id:1, tier:"Tier 1", minPct:100, mult:100, isFinal:true },
      { id:2, tier:"Tier 2", minPct:75,  mult:50  },
      { id:3, tier:"Tier 3", minPct:0,   mult:0   },
    ];
    return t.map((x, i) => ({ ...x, id: x.id || i + 1 }));
  });
  const [evalPeriod, setEvalPeriod] = useState(normalizeEvalPeriod(kpi?.evalPeriodOpt));
  const defaultCustomStart = "2026-01-01";
  const defaultCustomEnd = "2026-12-31";
  const [customStartDate, setCustomStartDate] = useState(kpi?.customStartDate || defaultCustomStart);
  const [customEndDate, setCustomEndDate] = useState(kpi?.customEndDate || defaultCustomEnd);
  const [useDefaultRange, setUseDefaultRange] = useState(
    (kpi?.customStartDate || defaultCustomStart) === defaultCustomStart &&
    (kpi?.customEndDate || defaultCustomEnd) === defaultCustomEnd
  );
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [editingThreshold, setEditingThreshold]   = useState(null);

  // Final tier enforced single — clear the flag on every other tier when set.
  const handleSaveThreshold = (data, editId) => {
    setKpiThresholds(prev => {
      const savedId = editId != null ? editId : (Math.max(0, ...prev.map(t => t.id || 0)) + 1);
      const merged = editId != null
        ? prev.map(t => t.id === editId ? { ...t, ...data, id: savedId } : t)
        : [...prev, { ...data, id: savedId }];
      const deduped = data.isFinal
        ? merged.map(t => t.id === savedId ? t : { ...t, isFinal: false })
        : merged;
      return deduped.sort((a, b) => b.minPct - a.minPct);
    });
  };

  const deleteThreshold = id => {
    setKpiThresholds(prev => prev.filter(t => t.id !== id));
  };

  // Range text for a card — final tier is open-ended (≥ start%); others end just
  // below the next-higher tier's progress-start (order-independent).
  const getThresholdRange = t => {
    if (t.isFinal) return `≥ ${t.minPct}%`;
    const higher = kpiThresholds.map(x => x.minPct).filter(m => m > t.minPct);
    const upper = higher.length ? Math.min(...higher) - 0.01 : 100;
    return `${t.minPct}%–${upper.toFixed(2)}%`;
  };

  // Validation — exactly one final tier, ranges must start at 0%.
  const finalCount = kpiThresholds.filter(t => t.isFinal).length;
  const lowest = Math.min(...kpiThresholds.map(t => t.minPct));
  const issues = [];
  if (finalCount === 0) issues.push("Set one tier as the final tier.");
  if (finalCount > 1)   issues.push("Only one tier can be the final tier.");
  if (lowest !== 0)     issues.push("Thresholds must start at 0% — the lowest tier's lower bound should be 0.");

  return (
    <>
      {kpi && (
        <div className="hac-cc-section">
          {/* KPI Summary — 2-column split */}
          <div className={"hac-kpi-summary" + (editing ? " editing" : "")}>
            {/* Left: KPI Progress (view-only) */}
            {!editing && kpiTarget > 0 && (
              <div className="hac-kpi-summary-left">
                <div className="hac-kpi-summary-label">
                  KPI Progress
                  <InfoTip text="KPI progress sets the multiplier applied to the agent's commission." />
                </div>
                <KPIProgressBlock kpi={kpi} target={kpiTarget} thresholds={kpiThresholds} />
              </div>
            )}

            {/* Right: Evaluation Period + Target Volume */}
            <div className="hac-kpi-summary-right">
              {editing ? (
                <div className={"hac-kpi-edit-grid" + (evalPeriod === "Custom range" ? " custom-range" : "")}>
                  <div className="hac-kpi-summary-group">
                    <div className="hac-kpi-summary-label">
                      Evaluation Period
                      <button className="ml-info-btn" type="button" aria-label="How evaluation periods work" onClick={() => setShowEvalHelp(true)}>
                        <HIcon name="info" size={14} />
                      </button>
                    </div>
                    <select className="hac-select hac-kpi-field" value={evalPeriod} onChange={e => setEvalPeriod(e.target.value)}>
                      {EVAL_PERIOD_GROUPS.map(group => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map(option => <option key={option.label} value={option.label}>{option.label}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {evalPeriod === "Custom range" && (
                    <div className="hac-kpi-summary-group">
                      <div className="hac-kpi-summary-label">Date range</div>
                      <div className="hac-date-range-field">
                        <input
                          className="hac-date-range-input"
                          type="date"
                          value={customStartDate}
                          onChange={e => {
                            const next = e.target.value;
                            setCustomStartDate(next);
                            if (useDefaultRange && (next !== defaultCustomStart || customEndDate !== defaultCustomEnd)) {
                              setUseDefaultRange(false);
                            }
                          }}
                        />
                        <span className="hac-date-range-sep">-</span>
                        <input
                          className="hac-date-range-input"
                          type="date"
                          value={customEndDate}
                          onChange={e => {
                            const next = e.target.value;
                            setCustomEndDate(next);
                            if (useDefaultRange && (customStartDate !== defaultCustomStart || next !== defaultCustomEnd)) {
                              setUseDefaultRange(false);
                            }
                          }}
                        />
                      </div>
                      <div className="hac-kpi-shortcut">
                        <label className="hac-check-row hac-kpi-default-check">
                          <input
                            type="checkbox"
                            checked={useDefaultRange}
                            onChange={e => {
                              if (e.target.checked) {
                                setUseDefaultRange(true);
                                setCustomStartDate(defaultCustomStart);
                                setCustomEndDate(defaultCustomEnd);
                              } else {
                                setUseDefaultRange(false);
                              }
                            }}
                          />
                          <span>Use Jan-Dec default</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="hac-kpi-summary-group">
                    <div className="hac-kpi-summary-label">
                      KPI Target Volume
                      <InfoTip text="Total fuel volume the agent must reach within the evaluation period." />
                    </div>
                    <div className="hac-kpi-input-unit">
                      <input className="hac-input hac-kpi-field" type="number" value={kpiTarget}
                        onChange={e => setKpiTarget(+e.target.value)} />
                      <span className="hac-kpi-unit">L</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="hac-kpi-summary-group">
                    <div className="hac-kpi-summary-label">
                      Evaluation Period
                      <button className="ml-info-btn" type="button" aria-label="How evaluation periods work" onClick={() => setShowEvalHelp(true)}>
                        <HIcon name="info" size={14} />
                      </button>
                    </div>
                    <div className="hac-kpi-readout">
                      <span className="hac-kpi-readout-main">{evalPeriod}</span>
                      <span className="hac-kpi-readout-sub">
                        {evalPeriod === "Custom range" ? formatRangeDisplay(customStartDate, customEndDate) : evalPeriodSummary(evalPeriod)}
                      </span>
                    </div>
                  </div>

                  <div className="hac-kpi-summary-group">
                    <div className="hac-kpi-summary-label">
                      KPI Target Volume
                      <InfoTip text="Total fuel volume the agent must reach within the evaluation period." />
                    </div>
                    <span className="hac-big-num" style={{ marginTop:2 }}>{HC.fmtL(kpiTarget)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Multiplier thresholds — card UI */}
          <div style={{ marginTop:16 }}>
            <div className="hac-cc-sec-head" style={{ marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--fg-secondary)" }}>Multiplier Thresholds</span>
              {editing && (
                <button className="hac-add-tier-btn" onClick={() => { setEditingThreshold(null); setShowThresholdModal(true); }}>
                  <HIcon name="add" size={15} /> Add Threshold
                </button>
              )}
            </div>

            {editing && issues.length > 0 && (
              <div className="hac-tier-empty" style={{ marginBottom:10 }}>
                <span><HIcon name="warning" size={15} color="var(--red-400)" /> Threshold setup incomplete</span>
                {issues.map((m, i) => (
                  <div key={i} style={{ fontSize:13, color:"var(--red-400)", marginTop:4 }}>{m}</div>
                ))}
              </div>
            )}

            <div className="hac-tiers-grid hac-thr-grid">
              {[...kpiThresholds].sort((a, b) => b.minPct - a.minPct).map(t => {
                return (
                  <div key={t.id} className="hac-tier-item">
                    <div className="hac-tier-item-head">
                      <div className="hac-tier-item-label">
                        <HIcon name="stacked_bar_chart" size={16} color="var(--navy-800)" />
                        {t.tier}
                        {t.isFinal && <span className="hac-final-badge">Final Tier</span>}
                      </div>
                      {editing && (
                        <CardMenu
                          deleteDisabled={kpiThresholds.length <= 1}
                          onEdit={() => { setEditingThreshold(t); setShowThresholdModal(true); }}
                          onDelete={() => deleteThreshold(t.id)} />
                      )}
                    </div>
                    <div className="hac-tier-item-body">
                      <div>
                        <span className="ml-k">Progress range</span>
                        <b>{getThresholdRange(t)}</b>
                      </div>
                      <div>
                        <span className="ml-k">Multiplier</span>
                        <b>{t.mult}%</b>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {showThresholdModal && (
        <ThresholdModal editThreshold={editingThreshold} siblings={kpiThresholds}
          onClose={() => { setShowThresholdModal(false); setEditingThreshold(null); }}
          onSave={handleSaveThreshold} />
      )}

      {showHistory && (
        <Modal title="Version history" onClose={() => setShowHistory(false)}>
          <div className="hac-vh-list">
            {(kpi.history && kpi.history.length > 0) ? kpi.history.map(h => (
              <div key={h.version} className="hac-vh-row">
                <span className="hac-vh-ver">v{h.version}</span>
                <div className="hac-vh-detail">
                  <b>{HC.fmtL(h.target)}</b>
                  <span>Effective {h.effective}</span>
                </div>
                <span className={"hac-vh-status " + h.status}>{h.status === "active" ? "Active" : "Superseded"}</span>
              </div>
            )) : <div style={{ fontSize:13, color:"var(--fg-tertiary)", padding:"8px 0" }}>No previous versions.</div>}
          </div>
        </Modal>
      )}

      {showEvalHelp && (
        <Modal
          title="How evaluation periods work"
          onClose={() => setShowEvalHelp(false)}
          footer={<button className="hac-modal-save" onClick={() => setShowEvalHelp(false)}>Got it</button>}
        >
          <div className="hac-help-subtitle">Choose how KPI performance is measured over time.</div>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              { label: "Custom period", description: "Set a specific start and end date." },
              { label: "Recent periods", description: "Use the most recent completed month(s), such as last month or last 3 months." },
              { label: "Calendar periods", description: "Use the previous completed quarter, half year, or year." },
            ].map(group => (
              <div key={group.label}>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--fg-primary)", marginBottom:8 }}>{group.label}</div>
                <div style={{ fontSize:12, color:"var(--fg-secondary)", lineHeight:1.5, paddingBottom:8, borderBottom:"1px solid var(--border-light)" }}>
                  {group.description}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

/* ─── KPI config card ────────────────────────────────────────── */
function CommissionConfigCard({ kpi, editing }) {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <div className="ml-card hac-detail-card">
      <div className="hac-sec-header">
        <div className="hac-sec-header-row">
          <span>KPI Configuration</span>
          {kpi?.current && (
            <button className="hac-version-tag clickable" type="button" onClick={() => setShowHistory(true)}>
              v{kpi.current.version} · Effective {kpi.current.effective}
            </button>
          )}
        </div>
      </div>
      <CommissionSection kpi={kpi} editing={editing} showHistory={showHistory} setShowHistory={setShowHistory} />
    </div>
  );
}

/* ─── SP Accounts card ───────────────────────────────────────── */
function SPAccountsCard({ spAccounts: initSP }) {
  const [spAccounts, setSPAccounts] = useState(initSP);
  const [showModal, setShowModal]   = useState(false);
  const existing = spAccounts.map(s => s.sp);
  const hasAccounts = spAccounts.length > 0;

  const handleAdd = selectedSPs => {
    const added = SP_ORG_LIST
      .filter(o => selectedSPs.includes(o.sp))
      .map(o => ({ sp:o.sp, org:o.org, volume:0, eff:"—", end:"Dec 2028", exception:null, commissionStatus:"pending_onboarding" }));
    setSPAccounts(prev => [...prev, ...added]);
  };

  return (
    <div className="ml-card hac-detail-card">
      <div className="hac-sec-header">SP Accounts</div>
      <div className="hac-dcard-head" style={{ marginBottom:hasAccounts ? 12 : 0 }}>
        <div className="hac-dcard-sub">{spAccounts.length} assigned account{spAccounts.length !== 1 ? "s" : ""}</div>
        <button className="ml-btn-outline" style={{ fontSize:13 }} onClick={() => setShowModal(true)}>
          <HIcon name="add" size={15} /> Add Account
        </button>
      </div>
      {hasAccounts ? (
        <div className="ml-table-wrap">
          <table className="ml-table" style={{ minWidth:680 }}>
            <thead>
              <tr><th>SP Code</th><th>Organisation</th><th>Volume (L)</th><th>Commission Status</th><th>Commission Validity</th><th>Exception</th><th></th></tr>
            </thead>
            <tbody>
              {spAccounts.map((sp, i) => (
                <tr key={i}>
                  <td><code className="hac-code">{sp.sp}</code></td>
                  <td className="ml-cell-main">{sp.org}</td>
                  <td className="ml-mono">{sp.volume ? sp.volume.toLocaleString() : "—"}</td>
                  <td><CommissionStatusBadge status={sp.commissionStatus || "activated"} /></td>
                  <td className="ml-mono" style={{ fontSize:12 }}>{sp.eff} – {sp.end}</td>
                  <td>
                    {sp.exception
                      ? <span className={"hac-exc-tag " + sp.exception.mode}>{sp.exception.mode === "auto" ? "Auto" : "Custom"} · {sp.exception.rate}%</span>
                      : <span style={{ color:"var(--fg-disabled)", fontSize:12 }}>—</span>}
                  </td>
                  <td><button className="ml-icon-btn"><HIcon name="more_horiz" size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="hac-empty-state">
          No SP accounts assigned yet.
        </div>
      )}
      {showModal && <AddSPModal onClose={() => setShowModal(false)} onAdd={handleAdd} existing={existing} />}
    </div>
  );
}

/* ─── Termination card ───────────────────────────────────────── */
const longDateLabel = value => {
  if (!value) return "—";
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString("en-MY", { day:"numeric", month:"long", year:"numeric" });
};

function TerminationCard({ cfg, editing = false }) {
  const agentLookup = useMemo(
    () => Object.fromEntries((cfg.otherAgents || []).map(agent => [agent.id, agent])),
    [cfg.otherAgents]
  );
  const scheduledSeed = cfg.termination?.scheduledTransfer || null;
  const [date, setDate] = useState(cfg.termination.date || "");
  const [commissionEndDate, setCommissionEndDate] = useState(cfg.termination.commissionEndDate || "");
  const [transferQuery, setTransferQuery] = useState(
    scheduledSeed?.toAgentId || ""
  );
  const [effectiveMonth, setEffectiveMonth] = useState(scheduledSeed?.effectiveCommissionMonth || "");
  const [scheduledTransfer, setScheduledTransfer] = useState(scheduledSeed);
  const exceptionCount = (cfg.spAccounts || []).filter(sp => sp.exception).length;
  const cancelTermination = () => {
    setDate("");
    setCommissionEndDate("");
    setScheduledTransfer(null);
    setTransferQuery("");
    setEffectiveMonth("");
  };
  return (
    <div className="ml-card hac-detail-card">
      <div className="hac-sec-header" style={{ color:"var(--red-400)" }}>Termination</div>
      {cfg.status === "terminating" && (
        <div className="hac-warn-banner" style={{ marginBottom:14 }}>
          <HIcon name="warning" size={15} color="#B26A00" />
          <span>This agent is in a <b>terminating</b> state. Finalise below.</span>
        </div>
      )}
      <div className="hac-term-stack">
        {editing ? (
          <div className="hac-term-grid">
            <div className="hac-form-group">
              <label className="hac-label">Termination date <InfoTip text="The agent becomes terminated on this date." /></label>
              <input className="hac-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="hac-form-group">
              <label className="hac-label">Commission end date <InfoTip text="The agent receives commission only until this date." /></label>
              <input className="hac-input" type="date" value={commissionEndDate} onChange={e => setCommissionEndDate(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="hac-term-grid">
            <div className="hac-fg">
              <label className="hac-label">Termination date <InfoTip text="The agent becomes terminated on this date." /></label>
              <span className="hac-view-val">{longDateLabel(date)}</span>
            </div>
            <div className="hac-fg">
              <label className="hac-label">Commission end date <InfoTip text="The agent receives commission only until this date." /></label>
              <span className="hac-view-val">{longDateLabel(commissionEndDate)}</span>
            </div>
          </div>
        )}
        {editing ? (
          <div className="hac-term-grid">
            <div className="hac-form-group">
              <div className="hac-label-row">
                <label className="hac-label">Transferred to</label>
                <span className="hac-inline-badge">
                  Total: {cfg.spAccounts?.length || 0} accounts{exceptionCount ? ` \u00b7 ${exceptionCount} with exceptions` : ""}
                </span>
              </div>
              <select
                className="hac-input hac-select-input"
                value={transferQuery}
                onChange={e => setTransferQuery(e.target.value)}
              >
                <option value="">Select agent</option>
                {(cfg.otherAgents || []).map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.name} ({agent.id})</option>
                ))}
              </select>
            </div>
            <div className="hac-form-group">
              <div className="hac-label-row">
                <label className="hac-label">Effective commission month <InfoTip text="The new agent starts receiving commission from this month." /></label>
              </div>
              <input className="hac-input" type="month" value={effectiveMonth} onChange={e => setEffectiveMonth(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="hac-term-grid">
            <div className="hac-fg">
              <label className="hac-label">Transferred to</label>
              <span className="hac-view-val">
                {scheduledTransfer ? (agentLookup[scheduledTransfer.toAgentId]?.name || scheduledTransfer.toAgentId) : "—"}
              </span>
            </div>
            <div className="hac-fg">
              <label className="hac-label">Effective commission month <InfoTip text="The new agent starts receiving commission from this month." /></label>
              <span className="hac-view-val">
                {scheduledTransfer ? monthLabel(scheduledTransfer.effectiveCommissionMonth) : "—"}
              </span>
            </div>
          </div>
        )}
        {editing && (
          <div className="hac-term-actions">
            <button className="hac-secondary-btn" type="button" onClick={cancelTermination}>
              Cancel termination
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Personal details section ───────────────────────────────── */
function PersonalDetailsSection({ cfg, editing }) {
  const { BANKS } = window.HC;
  const [form, setForm] = useState({ ...cfg });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const fields = [
    { key:"name",     label:"Name",              req:true  },
    { key:"email",    label:"Email",             req:true  },
    { key:"mobile",   label:"Mobile No.",        req:true  },
    { key:"ic",       label:"IC No.",            req:true  },
    { key:"bankName", label:"Bank Name",         req:false },
    { key:"accName",  label:"Bank Account Name", req:false },
    { key:"accNo",    label:"Bank Account No.",  req:false },
    { key:"role",     label:"Role",              req:false },
  ];
  return (
    <div className="ml-card hac-detail-card">
      <div className="hac-sec-header">Personal Details</div>
      <div className={"hac-form-grid3" + (!editing ? " hac-view-grid" : "")}>
        {fields.map(f => (
          <div key={f.key} className="hac-fg">
            <label className={"hac-label" + (editing && f.req ? " req" : "")}>{f.label}{editing && f.req ? "*" : ""}</label>
            {editing
              ? (f.key === "bankName"
                  ? <select className="hac-input hac-select-input" value={form.bankName} onChange={e => set("bankName", e.target.value)}>
                      <option value="">Select bank</option>
                      {BANKS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  : f.key === "role"
                  ? <select className="hac-input hac-select-input"
                      value={form.referrer ? "referrer" : "agent"}
                      onChange={e => set("referrer", e.target.value === "referrer")}>
                      <option value="agent">Agent</option>
                      <option value="referrer">Referrer</option>
                    </select>
                  : <input className="hac-input" value={form[f.key] || ""} onChange={e => set(f.key, e.target.value)} />)
              : <span className="hac-view-val">{f.key === "role"
                  ? (cfg.referrer ? "Referrer" : "Agent")
                  : (cfg[f.key] || <span style={{ color:"var(--fg-disabled)" }}>—</span>)}</span>}
          </div>
        ))}
        <div className="hac-fg">
          <label className="hac-label">Account Status</label>
          <span className="hac-view-val">
            <AccountStatusBadge status={cfg.accountStatus || "active"} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Agent form (create / edit) ─────────────────────────────── */
function AgentFormView({ agent, onBack, onSave }) {
  const { BANKS } = window.HC;
  const isEdit = !!agent;
  const editCfg = isEdit ? buildAgentConfig(agent) : null;
  const [form, setForm] = useState({
    name: agent?.name || "", email: agent?.email || "", mobile: agent?.mobile || "",
    ic: agent?.ic || "", bankName:(agent?.bankName !== "-" ? agent?.bankName : "") || "",
    accName:(agent?.accName !== "-" ? agent?.accName : "") || "",
    accNo:(agent?.accNo !== "-" ? agent?.accNo : "") || "", referrer: agent?.referrer || false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ paddingBottom: 80 }}>
      <div className="hac-breadcrumb">
        <button className="hac-bc-link" onClick={onBack}>Agent List</button>
        <HIcon name="chevron_right" size={15} color="var(--fg-tertiary)" />
        <span>{isEdit ? "Edit" : "Create"}</span>
      </div>
      <h1 className="ml-h1" style={{ margin:"10px 0 18px" }}>{isEdit ? "Edit agent account" : "Create agent account"}</h1>
      <div className="hac-detail-sections">
        <div className="ml-card hac-detail-card">
          <div className="hac-sec-header">Personal Details</div>
          <div className="hac-form-grid3">
            {[["name","Name",true],["email","Email",true],["mobile","Mobile",true],["ic","IC No.",true]].map(([k,l,r]) => (
              <div key={k} className="hac-fg">
                <label className="hac-label req">{l}*</label>
                <input className="hac-input" value={form[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
            <div className="hac-fg">
              <label className="hac-label req">Role*</label>
              <select className="hac-input hac-select-input"
                value={form.referrer ? "referrer" : "agent"}
                onChange={e => set("referrer", e.target.value === "referrer")}>
                <option value="agent">Agent</option>
                <option value="referrer">Referrer</option>
              </select>
            </div>
            <div className="hac-fg">
              <label className="hac-label">Bank name</label>
              <select className="hac-input hac-select-input" value={form.bankName} onChange={e => set("bankName", e.target.value)}>
                <option value="">Select bank</option>
                {BANKS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            {[["accName","Bank account name"],["accNo","Bank account number"]].map(([k,l]) => (
              <div key={k} className="hac-fg">
                <label className="hac-label">{l}</label>
                <input className="hac-input" value={form[k]} onChange={e => set(k, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
        <div className="ml-card hac-detail-card">
          <div className="hac-sec-header">KPI Configuration</div>
          <CommissionSection
            kpi={{ evalPeriodOpt:"Last year", current:{ version:1, effective:"", target:0, thresholds:[
              { tier:"Tier 1", minPct:100, mult:100, isFinal:true },
              { tier:"Tier 2", minPct:75,  mult:50  },
              { tier:"Tier 3", minPct:0,   mult:0   },
            ]}}}
            editing={true} />
        </div>
        <SPAccountsCard spAccounts={[]} />
        {isEdit && <TerminationCard cfg={editCfg} editing={true} />}
      </div>
      <div className="hac-edit-bar">
        <button className="hac-cancel-btn" onClick={onBack}>Cancel</button>
        <button className="hac-save-btn" onClick={() => onSave(form)}>{isEdit ? "Save Changes" : "Create"}</button>
      </div>
    </div>
  );
}

/* ─── Agent detail view ──────────────────────────────────────── */
function AgentDetailView({ agent, onBack }) {
  const cfg = buildAgentConfig(agent);
  const [editing, setEditing] = useState(false);

  return (
    <div style={{ paddingBottom: editing ? 80 : 0 }}>
      <div className="hac-breadcrumb">
        <button className="hac-bc-link" onClick={onBack}>Agent List</button>
        <HIcon name="chevron_right" size={15} color="var(--fg-tertiary)" />
        <span>{cfg.name}</span>
      </div>
      <div className="ml-page-head" style={{ margin:"10px 0 20px" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <h1 className="ml-h1">{cfg.name}</h1>
            <AccountStatusBadge status={cfg.accountStatus || "active"} />
          </div>
          <div style={{ fontSize:12, color:"var(--fg-secondary)", marginTop:3 }}>
            {cfg.id} · Joined {cfg.joined}
          </div>
        </div>
        <div className="ml-page-head-right">
          {!editing && (
            <button className="ml-btn-outline" onClick={() => setEditing(true)}>
              <HIcon name="edit" size={15} /> Edit
            </button>
          )}
        </div>
      </div>
      <div className="hac-detail-sections">
        <PersonalDetailsSection cfg={cfg} editing={editing} />
        <CommissionConfigCard kpi={cfg.kpi} editing={editing} />
        <SPAccountsCard spAccounts={cfg.spAccounts} />
        <TerminationCard cfg={cfg} editing={editing} />
      </div>
      {editing && (
        <div className="hac-edit-bar">
          <button className="hac-cancel-btn"
            onClick={() => setEditing(false)}>Cancel</button>
          <button className="hac-save-btn"
            onClick={() => setEditing(false)}>
            <HIcon name="check" size={15} /> Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Root: Agent module with tabs ───────────────────────────── */
function HostAgentConfig() {
  const [activeTab,   setActiveTab]   = useState("list");
  const [agentView,   setAgentView]   = useState("list"); // list | detail | create
  const [activeAgent, setActiveAgent] = useState(null);

  const inSubPage = agentView !== "list";


  const goView   = a => { setActiveAgent(a); setAgentView("detail"); };
  const goEdit   = a => { setActiveAgent(a); setAgentView("edit"); };
  const goCreate = ()  => { setActiveAgent(null); setAgentView("create"); };
  const goBack   = ()  => setAgentView("list");
  const goSave   = ()  => setAgentView("list");

  return (
    <div className="ml-app">
      <HostTopBar />
      <HostSidebar active="agent" />
      <main className="ml-main">

        {/* Page header + tabs — only at list level */}
        {!inSubPage && (
          <div style={{ marginBottom:20 }}>
            <h1 className="ml-h1" style={{ marginBottom:14 }}>Agent</h1>
            <div className="ml-tabs">
              {[
                { key:"list",         label:"Agent List",              icon:"group"            },
                { key:"myfuel",       label:"MyFuel Commission",       icon:"local_gas_station" },
                { key:"subscription", label:"Subscription Commission", icon:"workspace_premium" },
              ].map(t => (
                <button key={t.key} className={"ml-tab" + (activeTab === t.key ? " active" : "")}
                  onClick={() => setActiveTab(t.key)}>
                  <HIcon name={t.icon} size={16} />{t.label}
                  {t.key === "subscription" && (
                    <span style={{ fontSize:10, fontWeight:700, background:"var(--amber-50)", color:"var(--amber-600)", padding:"1px 6px", borderRadius:4, marginLeft:4 }}>
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab content */}
        {activeTab === "list" && (
          <>
            {agentView === "list"   && <AgentsListView onView={goView} onEdit={goEdit} onCreate={goCreate} onTerminate={goView} />}
            {agentView === "create" && <AgentFormView  agent={null} onBack={goBack} onSave={goSave} />}
            {agentView === "edit"   && <AgentFormView  agent={activeAgent} onBack={goBack} onSave={goSave} />}
            {agentView === "detail" && <AgentDetailView agent={activeAgent} onBack={goBack} />}
          </>
        )}
        {activeTab === "myfuel"       && <MyFuelCommissionTabView />}
        {activeTab === "subscription" && <SubscriptionCommissionTabView />}

      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<HostAgentConfig />);
