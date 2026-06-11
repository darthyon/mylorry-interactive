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
const AccountStatusBadge = window.HAccountStatusBadge;

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
    if (filter === "sales")    list = list.filter(a => !a.referrer);
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
              <label>Agent Type</label>
              <select value={pendingType} onChange={e => setPendingType(e.target.value)}>
                <option value="all">All types</option>
                <option value="referrer">Referrer</option>
                <option value="sales">Sales</option>
              </select>
            </div>
            <div className="hac-filter-field">
              <label>Account Status</label>
              <select value={pendingStatus} onChange={e => setPendingStatus(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
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
              <th>No.</th><th>ID</th><th>Referrer</th><th>Name</th>
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
                <td><code className="hac-code">{a.id}</code></td>
                <td><HBadge kind={a.referrer ? "active" : "inactive"}>{a.referrer ? "Yes" : "No"}</HBadge></td>
                <td className="ml-cell-main">{a.name}</td>
                <td><KPIProgress pct={a.kpiPct} actual={a.volume} target={a.kpiTarget} period="Dec 1–31" /></td>
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

/* ─── Tier Modal (add / edit) ────────────────────────────────── */
function TierModal({ editTier, onClose, onSave }) {
  const isEdit  = !!editTier;
  const [usage, setUsage]     = useState(editTier ? (editTier.final ? "" : String(editTier.to ?? "")) : "");
  const [amount, setAmount]   = useState(editTier ? String(editTier.rate ?? "") : "");
  const [isFinal, setIsFinal] = useState(editTier ? editTier.final : false);
  const canSave = amount !== "" && (isFinal || usage !== "");

  const handleSave = () => {
    if (!canSave) return;
    onSave({ usage: isFinal ? null : +usage, rate: +amount, final: isFinal }, isEdit ? editTier.id : null);
    onClose();
  };

  return (
    <Modal title={isEdit ? "Edit Tier" : "Add Tier"} onClose={onClose} footer={
      <>
        <button className="hac-modal-cancel" onClick={onClose}>Cancel</button>
        <button className="hac-modal-save" disabled={!canSave} onClick={handleSave}>Save</button>
      </>
    }>
      <div className="hac-modal-row-split">
        <div className="hac-fg" style={{ flex:1 }}>
          <label className="hac-label req">Volume up to (litres)*</label>
          <input className="hac-input" placeholder="e.g. 25000" value={usage} disabled={isFinal}
            onChange={e => setUsage(e.target.value)} />
          <div className="hac-field-hint">Upper bound of this volume band</div>
        </div>
        <label className="hac-check-row" style={{ marginTop:24, flexShrink:0 }}>
          <input type="checkbox" checked={isFinal} onChange={e => setIsFinal(e.target.checked)} />
          <span>Final tier (no upper cap)</span>
        </label>
      </div>
      <div className="hac-fg" style={{ marginTop:16 }}>
        <label className="hac-label req">Base Rate (RM / litre)*</label>
        <input className="hac-input" placeholder="e.g. 0.015" value={amount}
          onChange={e => setAmount(e.target.value)} />
        <div className="hac-field-hint">Applied to every confirmed litre in this band</div>
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

/* ─── Commission config section ──────────────────────────────── */
function CommissionSection({ kpi, tiers: initTiers, editing }) {
  const [tiers, setTiers]             = useState(initTiers || []);
  const [kpiTarget, setKpiTarget]     = useState(kpi?.current?.target ?? 150000);
  const [showHistory, setShowHistory] = useState(false);
  const [kpiThresholds, setKpiThresholds] = useState(kpi?.current?.thresholds || [
    { tier:"Tier 1", label:"Full commission", minPct:100, mult:100 },
    { tier:"Tier 2", label:"Half commission", minPct:75,  mult:50  },
    { tier:"Tier 3", label:"No commission",   minPct:0,   mult:0   },
  ]);
  const [useCustomPeriod, setUseCustomPeriod] = useState(kpi?.useCustomPeriod || false);
  const [evalStart, setEvalStart] = useState(kpi?.customStart || "Dec");
  const [evalEnd,   setEvalEnd]   = useState(kpi?.customEnd   || "Dec");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [thresholdErrors, setThresholdErrors] = useState([]);
  const [showTierModal, setShowTierModal] = useState(false);
  const [editingTier,   setEditingTier]   = useState(null);

  const hasFinalTier = tiers.some(t => t.final);

  const handleSaveTier = (data, editId) => {
    setTiers(prev => {
      if (editId != null) {
        return prev.map(t => t.id === editId
          ? { ...t, to: data.final ? null : data.usage, rate: data.rate, final: data.final }
          : { ...t, final: data.final ? false : t.final }
        );
      }
      const base = prev.map(t => ({ ...t, final: data.final ? false : t.final }));
      const last = base[base.length - 1];
      return [...base, { id: base.length + 1, from: last ? (last.to || 0) + 1 : 0, to: data.final ? null : data.usage, rate: data.rate, final: data.final }];
    });
  };

  const deleteTier = id => {
    setTiers(prev => prev.filter(t => t.id !== id).map((t, i) => ({ ...t, id: i + 1 })));
  };

  const updateThreshold = (i, key, val) => {
    setKpiThresholds(prev => {
      const updated = prev.map((t, idx) => idx === i ? { ...t, [key]: +val } : t);
      setThresholdErrors(updated.map((t, idx) =>
        idx < updated.length - 2 ? t.minPct <= updated[idx + 1].minPct : false
      ));
      return updated;
    });
  };

  const tierCls = ["t1","t2","t3"];
  const thrCol  = ["var(--green-600)", "#B26A00", "var(--red-400)"];

  return (
    <>
      {kpi && (
        <div className="hac-cc-section">
          <div className="hac-cc-sec-head">
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span className="hac-cc-sec-label">KPI Configuration</span>
              <InfoTip text="Sets the multiplier applied to volume tier commission, based on KPI progress." />
            </div>
            {kpi.current && (
              <button className="hac-version-tag clickable" onClick={() => setShowHistory(true)}>
                v{kpi.current.version} · Effective {kpi.current.effective}
                <HIcon name="expand_more" size={15} />
              </button>
            )}
          </div>

          {/* New version — effective from (hoisted above eval period) */}
          {editing && (
            <div className="hac-effective-band">
              <div className="hac-effective-label">
                <HIcon name="new_releases" size={14} color="var(--teal-600)" />
                New version · effective from
              </div>
              <input className="hac-input" type="month" style={{ maxWidth:200 }}
                value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} />
            </div>
          )}

          {/* Missing target warning */}
          {!kpiTarget && (
            <div className="hac-kpi-warn">
              <HIcon name="warning" size={14} color="var(--amber-600)" />
              No KPI target set. Commission defaults to 100% until a target is configured.
            </div>
          )}

          {/* Eval period + target — one row */}
          <div className="hac-cc-row2">
            {/* Eval period */}
            <div className="hac-cc-col">
              <div className="hac-field-label">Evaluation Period</div>
              {editing ? (
                <div className="hac-radio-group">
                  <label className="hac-radio-row">
                    <input type="radio" name="evalPeriod" checked={!useCustomPeriod}
                      onChange={() => setUseCustomPeriod(false)} />
                    <span>Default annual period</span>
                    <span className="hac-radio-note">Dec 1 – Dec 31</span>
                  </label>
                  <label className="hac-radio-row">
                    <input type="radio" name="evalPeriod" checked={useCustomPeriod}
                      onChange={() => setUseCustomPeriod(true)} />
                    <span>Custom period</span>
                  </label>
                  {useCustomPeriod && (
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:6, marginLeft:22 }}>
                      <select className="hac-select" style={{ maxWidth:120 }} value={evalStart} onChange={e => setEvalStart(e.target.value)}>
                        {HC.MONTHS.map(m => <option key={m}>{m}</option>)}
                      </select>
                      <span style={{ color:"var(--fg-tertiary)", fontSize:13 }}>to</span>
                      <select className="hac-select" style={{ maxWidth:120 }} value={evalEnd} onChange={e => setEvalEnd(e.target.value)}>
                        {HC.MONTHS.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                  <span className="hac-period-pill">
                    {useCustomPeriod ? `${evalStart} 1 – ${evalEnd} 31` : (kpi.evalPeriod || "Dec 1 – Dec 31")}
                  </span>
                  {!useCustomPeriod && <span style={{ fontSize:12, color:"var(--fg-tertiary)" }}>Default annual period</span>}
                </div>
              )}
            </div>

            {/* Volume target */}
            <div className="hac-cc-col">
              <div className="hac-field-label">
                KPI Target Volume
                <InfoTip text="Total fuel volume the agent must reach within the evaluation period." />
              </div>
              {editing
                ? <input className="hac-input" type="number" value={kpiTarget} style={{ maxWidth:200 }}
                    onChange={e => setKpiTarget(+e.target.value)} />
                : <span className="hac-big-num">{HC.fmtL(kpiTarget)}</span>}
            </div>
          </div>

          {/* KPI thresholds — multiplier zones, not a table */}
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--fg-secondary)", marginBottom:8 }}>Multiplier Thresholds</div>
            {editing ? (
              <div className="hac-thr-edit">
                {kpiThresholds.map((t, i) => (
                  <div key={i} className="hac-thr-edit-row">
                    <span className="hac-thr-dot" style={{ background: thrCol[i] }} />
                    <div className="hac-thr-edit-range">
                      {i < kpiThresholds.length - 1 ? (
                        <>
                          <span className="hac-thr-mut">≥</span>
                          <input className="hac-input" type="number" min={0} max={200}
                            style={{ width:60, padding:"4px 8px", fontSize:13, borderColor: thresholdErrors[i] ? "var(--red-400)" : undefined }}
                            value={t.minPct} onChange={e => updateThreshold(i, "minPct", e.target.value)} />
                          <span className="hac-thr-mut">%</span>
                        </>
                      ) : (
                        <span className="hac-thr-mut" style={{ fontStyle:"italic" }}>below threshold</span>
                      )}
                    </div>
                    <span className="hac-thr-arrow">→</span>
                    <div className="hac-thr-edit-range">
                      <input className="hac-input" type="number" min={0} max={200}
                        style={{ width:60, padding:"4px 8px", fontSize:13 }}
                        value={t.mult} onChange={e => updateThreshold(i, "mult", e.target.value)} />
                      <span className="hac-thr-mut">% multiplier</span>
                    </div>
                    <span className="hac-thr-meaning">{t.label}</span>
                    {thresholdErrors[i] && (
                      <span className="hac-thr-err">Must exceed Tier {i + 2} (≥{kpiThresholds[i + 1]?.minPct}%)</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="hac-tiers-grid hac-thr-grid">
                {kpiThresholds.map((t, i) => (
                  <div key={i} className="hac-tier-item">
                    <div className="hac-tier-item-head">
                      <div className="hac-tier-item-label">
                        <span className="hac-thr-dot" style={{ background: thrCol[i] }} />
                        {t.tier}
                      </div>
                      <span className="hac-mult-badge" style={{ color: thrCol[i] }}>{t.mult}% mult.</span>
                    </div>
                    <div className="hac-tier-item-body">
                      <div>
                        <span className="ml-k">Progress range</span>
                        <b>{i === kpiThresholds.length - 1 ? `< ${kpiThresholds[i-1]?.minPct || 75}%` : `≥ ${t.minPct}%`}</b>
                      </div>
                      <div>
                        <span className="ml-k">Meaning</span>
                        <b>{t.label}</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {kpi && <div className="hac-cc-divider" />}

      {/* Tier table */}
      <div className="hac-cc-section">
        <div className="hac-cc-sec-head">
          <span className="hac-cc-sec-label">Commission Tiers (Volume-based)</span>
          {editing && (
            <button className="hac-add-tier-btn" onClick={() => { setEditingTier(null); setShowTierModal(true); }}>
              <HIcon name="add" size={15} /> Add Tier
            </button>
          )}
        </div>

        {tiers.length === 0 && (
          <div className="hac-tier-empty">
            <span><HIcon name="warning" size={15} color="var(--red-400)" /> No tiers configured</span>
            <div style={{ fontSize:13, color:"var(--red-400)", marginTop:4 }}>At least one tier is required.</div>
          </div>
        )}

        {editing && tiers.length > 0 && !hasFinalTier && (
          <div className="hac-tier-empty" style={{ marginBottom:10 }}>
            <span><HIcon name="warning" size={15} color="var(--red-400)" /> No final tier set</span>
            <div style={{ fontSize:13, color:"var(--red-400)", marginTop:4 }}>Please set a final tier before saving. (FR-HC-05)</div>
          </div>
        )}

        <div className="hac-tiers-grid">
          {tiers.map(t => (
            <div key={t.id} className={"hac-tier-item" + (t.final ? " editing" : "")}>
              <div className="hac-tier-item-head">
                <div className="hac-tier-item-label">
                  <HIcon name="stacked_bar_chart" size={16} color="var(--navy-800)" />
                  Tier {t.id}
                  {t.final && <span className="hac-final-badge">Final Tier</span>}
                </div>
                {editing ? (
                  <div style={{ display:"flex", gap:4 }}>
                    <button className="ml-icon-btn" title="Edit tier"
                      onClick={() => { setEditingTier(t); setShowTierModal(true); }}>
                      <HIcon name="edit" size={15} color="var(--fg-secondary)" />
                    </button>
                    <button className="ml-icon-btn" title="Delete tier"
                      onClick={() => deleteTier(t.id)}
                      style={{ color: tiers.length <= 1 ? "var(--fg-disabled)" : "var(--red-400)" }}
                      disabled={tiers.length <= 1}>
                      <HIcon name="delete" size={15} />
                    </button>
                  </div>
                ) : (
                  <button className="ml-icon-btn"><HIcon name="more_horiz" size={16} /></button>
                )}
              </div>
              <div className="hac-tier-item-body">
                <div>
                  <span className="ml-k">Volume range</span>
                  <b>{t.from?.toLocaleString()} – {t.final ? "∞" : t.to?.toLocaleString()} L</b>
                </div>
                <div>
                  <span className="ml-k">Base rate</span>
                  <b style={{ color:"var(--navy-800)" }}>RM {t.rate?.toFixed(3)}/L</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showTierModal && (
        <TierModal editTier={editingTier} onClose={() => { setShowTierModal(false); setEditingTier(null); }} onSave={handleSaveTier} />
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
    </>
  );
}

/* ─── Commission config card ─────────────────────────────────── */
function CommissionConfigCard({ kpi, tiers, editing }) {
  return (
    <div className="ml-card hac-detail-card">
      <div className="hac-sec-header">Commission Configuration</div>
      <CommissionSection kpi={kpi} tiers={tiers} editing={editing} />
    </div>
  );
}

/* ─── KPI Progress card (agent detail) ───────────────────────────
   Shows current progress against target. When the period is locked /
   evaluated, the card flips to "KPI Result". (Requirement 7 & 8) */
/* Zone tokens shared by the KPI axis and the threshold legend.
   The axis runs 0 → AXIS_MAX%; zones are the multiplier thresholds. */
const KPI_AXIS_MAX = 125;
const KPI_ZONES = [
  { from: 0,   to: 75,  mult: 0,   label: "No commission",   col: "var(--red-400)",   fill: "#FCEBEC" },
  { from: 75,  to: 100, mult: 50,  label: "Half commission", col: "#B26A00",          fill: "#FBF1DD" },
  { from: 100, to: KPI_AXIS_MAX, mult: 100, label: "Full commission", col: "var(--green-600)", fill: "#E4F6EC" },
];
const kpiZoneOf = pct => KPI_ZONES.find(z => pct >= z.from && pct < z.to) || KPI_ZONES[KPI_ZONES.length - 1];

function KPIProgressCard({ kpi }) {
  const target = kpi?.current?.target || 200000;
  const actual = kpi?.actual ?? 0;
  const period = kpi?.progressPeriod || "Dec 1–31";
  const phase  = kpi?.phase || (kpi?.locked ? "complete" : "active"); // future | active | complete
  const isFuture = phase === "future";
  const isComplete = phase === "complete";

  const pct  = Math.round((actual / target) * 1000) / 10;
  const zone = kpiZoneOf(pct);
  const markerCol = isFuture ? "var(--fg-tertiary)" : zone.col;

  const badge = isFuture
    ? <span className="ml-badge" style={{ background:"#EDEEF7", color:"var(--navy-800)" }}><HIcon name="event" size={12} /> Upcoming</span>
    : isComplete
      ? <span className="ml-badge" style={{ background:"#EDEEF7", color:"var(--navy-800)" }}><HIcon name="lock" size={12} /> Period ended</span>
      : zone.mult >= 75
        ? <span className="ml-badge" style={{ background:"var(--green-50)", color:"var(--green-600)" }}><HIcon name="trending_up" size={12} /> On track</span>
        : <span className="ml-badge" style={{ background:"#FBF1DD", color:"#B26A00" }}><HIcon name="warning" size={12} /> At risk</span>;

  const pos = p => (Math.min(p, KPI_AXIS_MAX) / KPI_AXIS_MAX) * 100; // % → axis position

  return (
    <div className="ml-card hac-detail-card">
      <div className="hac-dcard-head" style={{ marginBottom:20 }}>
        <div>
          <div className="hac-dcard-title">
            <HIcon name="track_changes" size={17} color={markerCol} />
            {isComplete ? "KPI Result" : "KPI Progress"}
          </div>
          <div className="hac-dcard-sub">
            <span className="hac-period-pill">{period}</span>
            Target: {target.toLocaleString("en-US")} L
          </div>
        </div>
        {badge}
      </div>

      <div className="hac-kpiaxis-top">
        <div className="hac-kpiaxis-pct" style={{ color: markerCol }}>
          {isFuture ? "–" : pct + "%"}
        </div>
        <div className="hac-kpiaxis-readout">
          <span>Achieved <b>{isFuture ? "–" : actual.toLocaleString("en-US") + " L"}</b></span>
          {!isFuture && (
            <span style={{ color: zone.col }}>
              {zone.label} · {zone.mult}% multiplier
            </span>
          )}
        </div>
      </div>

      {/* Zoned axis — thresholds are the zones; marker is live progress */}
      <div className={"hac-kpiaxis" + (isFuture ? " future" : "")}>
        <div className="hac-kpiaxis-track">
          {KPI_ZONES.map((z, i) => (
            <div key={i} className="hac-kpiaxis-zone"
              style={{ width: ((Math.min(z.to, KPI_AXIS_MAX) - z.from) / KPI_AXIS_MAX) * 100 + "%",
                       background: z.fill }} />
          ))}
          {!isFuture && (
            <div className="hac-kpiaxis-marker" style={{ left: pos(pct) + "%", background: markerCol }}>
              <span className="hac-kpiaxis-dot" style={{ background: markerCol }} />
            </div>
          )}
        </div>
        <div className="hac-kpiaxis-ticks">
          {[75, 100].map(t => (
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

/* ─── SP Accounts card ───────────────────────────────────────── */
function SPAccountsCard({ spAccounts: initSP }) {
  const [spAccounts, setSPAccounts] = useState(initSP);
  const [showModal, setShowModal]   = useState(false);
  const existing = spAccounts.map(s => s.sp);

  const handleAdd = selectedSPs => {
    const added = SP_ORG_LIST
      .filter(o => selectedSPs.includes(o.sp))
      .map(o => ({ sp:o.sp, org:o.org, volume:0, eff:"—", end:"Dec 2028", exception:null, commissionStatus:"pending_onboarding" }));
    setSPAccounts(prev => [...prev, ...added]);
  };

  return (
    <div className="ml-card hac-detail-card">
      <div className="hac-sec-header">SP Accounts</div>
      <div className="hac-dcard-head" style={{ marginBottom:12 }}>
        <div className="hac-dcard-sub">{spAccounts.length} assigned account{spAccounts.length !== 1 ? "s" : ""}</div>
        <button className="ml-btn-outline" style={{ fontSize:13 }} onClick={() => setShowModal(true)}>
          <HIcon name="add" size={15} /> Add Account
        </button>
      </div>
      <div className="ml-table-wrap">
        <table className="ml-table" style={{ minWidth:680 }}>
          <thead>
            <tr><th>SP Code</th><th>Organisation</th><th>Commission Status</th><th>Volume (L)</th><th>Effective</th><th>End</th><th>Exception</th><th></th></tr>
          </thead>
          <tbody>
            {spAccounts.map((sp, i) => (
              <tr key={i}>
                <td><code className="hac-code">{sp.sp}</code></td>
                <td className="ml-cell-main">{sp.org}</td>
                <td><CommissionStatusBadge status={sp.commissionStatus || "activated"} /></td>
                <td className="ml-mono">{sp.volume ? sp.volume.toLocaleString() : "—"}</td>
                <td className="ml-mono" style={{ fontSize:12 }}>{sp.eff}</td>
                <td className="ml-mono" style={{ fontSize:12 }}>{sp.end}</td>
                <td>
                  {sp.exception
                    ? <span className={"hac-exc-tag " + sp.exception.mode}>{sp.exception.mode === "auto" ? "Auto" : "Custom"} · {sp.exception.rate}%</span>
                    : <span style={{ color:"var(--fg-disabled)", fontSize:12 }}>—</span>}
                </td>
                <td><button className="ml-icon-btn"><HIcon name="more_horiz" size={17} /></button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total: {spAccounts.length} accounts</td>
              <td colSpan={5} style={{ textAlign:"right" }}><span className="ml-foot-note">{spAccounts.filter(s => s.exception).length} with exceptions</span></td>
            </tr>
          </tfoot>
        </table>
      </div>
      {showModal && <AddSPModal onClose={() => setShowModal(false)} onAdd={handleAdd} existing={existing} />}
    </div>
  );
}

/* ─── Termination card ───────────────────────────────────────── */
function TerminationCard({ cfg }) {
  const [date, setDate]           = useState(cfg.termination.date || "");
  const [hold, setHold]           = useState(cfg.termination.holdState);
  const [transferTo, setTransferTo] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const canTerminate = confirmed && !!date;
  return (
    <div className="ml-card hac-detail-card">
      <div className="hac-sec-header" style={{ color:"var(--red-400)" }}>Termination</div>
      {cfg.status === "terminating" && (
        <div className="hac-warn-banner" style={{ marginBottom:14 }}>
          <HIcon name="warning" size={15} color="#B26A00" />
          <span>This agent is in a <b>terminating</b> state. Finalise below.</span>
        </div>
      )}
      <div className="hac-term-grid">
        <div className="hac-form-group">
          <label className="hac-label">Effective termination date</label>
          <input className="hac-input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ maxWidth:220 }} />
        </div>
        <div className="hac-form-group">
          <label className="hac-label">Transfer SP accounts to</label>
          <select className="hac-select" value={transferTo} onChange={e => setTransferTo(e.target.value)}>
            <option value="">— Select agent —</option>
            {cfg.otherAgents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
          </select>
        </div>
      </div>
      <div className="hac-toggle-row" style={{ marginTop:16 }}>
        <div>
          <div className="hac-toggle-label-text">Hold commission payouts</div>
          <div className="hac-toggle-label-sub">Suspend until final reconciliation is complete</div>
        </div>
        <div className={"hac-toggle" + (hold ? " on" : "")} onClick={() => setHold(v => !v)}>
          <div className="hac-toggle-knob"></div>
        </div>
      </div>
      {/* Pro-rated commission estimate */}
      {date && (
        <div style={{ marginTop:16, padding:"12px 14px", background:"var(--bg-muted)", borderRadius:6, fontSize:13 }}>
          <div style={{ fontWeight:600, color:"var(--fg-primary)", marginBottom:4 }}>Pro-rated commission estimate</div>
          <div style={{ color:"var(--fg-secondary)", marginBottom:6 }}>
            Calculated up to {new Date(date).toLocaleDateString("en-MY", { day:"numeric", month:"short", year:"numeric" })}
            <span style={{ marginLeft:6, color:"var(--fg-tertiary)" }}>· Cutoff: 4th of month</span>
          </div>
          <div style={{ fontSize:15, fontWeight:700, color:"var(--navy-800)" }}>
            RM {Math.round((cfg.commission || 0) * (new Date(date).getDate() / 30)).toLocaleString("en-MY", { minimumFractionDigits:2 })}
          </div>
        </div>
      )}
      <div className="hac-term-confirm">
        <label className="hac-check-label">
          <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
          <span>I confirm all SP accounts have been reviewed and this agent's commission config will be locked upon termination.</span>
        </label>
        <button className={"hac-danger-btn" + (!canTerminate ? " disabled" : "")} disabled={!canTerminate}>
          <HIcon name="event_busy" size={15} /> Terminate Agent
        </button>
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
      <div className="hac-form-grid3">
        {fields.map(f => (
          <div key={f.key} className="hac-fg">
            <label className={"hac-label" + (editing && f.req ? " req" : "")}>{f.label}{editing && f.req ? "*" : ""}</label>
            {editing
              ? (f.key === "bankName"
                  ? <select className="hac-input hac-select-input" value={form.bankName} onChange={e => set("bankName", e.target.value)}>
                      <option value="">Select bank</option>
                      {BANKS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  : <input className="hac-input" value={form[f.key] || ""} onChange={e => set(f.key, e.target.value)} />)
              : <span className="hac-view-val">{cfg[f.key] || <span style={{ color:"var(--fg-disabled)" }}>—</span>}</span>}
          </div>
        ))}
        <div className="hac-fg">
          <label className="hac-label">Account Status</label>
          <span className="hac-view-val" style={{ paddingTop:6 }}>
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
      <div className="ml-card hac-detail-card" style={{ marginTop:16 }}>
        <div className="hac-sec-header">Commission Configuration</div>
        <CommissionSection
          kpi={{ evalPeriod:"", useCustomPeriod:false, customStart:"Dec", customEnd:"Dec", current:{ version:1, effective:"", target:0, thresholds:[
            { tier:"Tier 1", label:"Full commission", minPct:100, mult:100 },
            { tier:"Tier 2", label:"Half commission", minPct:75,  mult:50  },
            { tier:"Tier 3", label:"No commission",   minPct:0,   mult:0   },
          ]}}}
          tiers={[]} editing={true} />
      </div>
      <SPAccountsCard spAccounts={[]} />
      <div className="hac-edit-bar">
        <button className="hac-cancel-btn" onClick={onBack}>Cancel</button>
        <button className="hac-save-btn" onClick={() => onSave(form)}>{isEdit ? "Save Changes" : "Create"}</button>
      </div>
    </div>
  );
}

/* ─── Agent detail view ──────────────────────────────────────── */
function AgentDetailView({ agent, onBack }) {
  const base = window.HC.AGENT_CONFIG;
  const row  = agent || base;
  // Build the per-agent config off the shared template, overriding identity + KPI
  // from the clicked row so every agent renders its real KPI state.
  const cfg = {
    ...base,
    id: row.id, name: row.name, role: row.role, joined: row.joined,
    accountStatus: row.accountStatus || base.accountStatus,
    kpi: {
      ...base.kpi,
      actual:  row.volume ?? base.kpi.actual,
      locked:  row.kpiPhase === "complete",
      phase:   row.kpiPhase || "active",
      current: { ...base.kpi.current, target: row.kpiTarget ?? base.kpi.current.target },
    },
  };
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
          <h1 className="ml-h1">{cfg.name}</h1>
          <div style={{ fontSize:12, color:"var(--fg-secondary)", marginTop:3 }}>
            {cfg.role} · {cfg.id} · Joined {cfg.joined}
          </div>
        </div>
        <div className="ml-page-head-right">
          <AccountStatusBadge status={cfg.accountStatus || "active"} prefix="Account: " />
          {!editing && (
            <button className="ml-btn-outline" onClick={() => setEditing(true)}>
              <HIcon name="edit" size={15} /> Edit
            </button>
          )}
        </div>
      </div>
      <div className="hac-detail-sections">
        <PersonalDetailsSection cfg={cfg} editing={editing} />
        <KPIProgressCard kpi={cfg.kpi} />
        <CommissionConfigCard kpi={cfg.kpi} tiers={cfg.tiers} editing={editing} />
        <SPAccountsCard spAccounts={cfg.spAccounts} />
        <TerminationCard cfg={cfg} />
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
