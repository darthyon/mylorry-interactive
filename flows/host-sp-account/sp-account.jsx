// sp-account.jsx — Host portal: SP (Service Provider) Account module.
// list → view → create / edit (no router; state machine in the root component).

const { useState, useMemo, useRef, useEffect } = React;

const { SP_ACCOUNTS, ORGS, PROVIDERS, FREEZING_TYPES, AGENT_POOL, REFERRER_POOL,
  distributeSplit, fmtRM, fmtDate, addMonths } = window.SPA;
const { PetronLogo } = window.SharedShell;

const PAYOUT_TYPES = ["Credit Note", "Bank-in Personal", "Bank-in Company"];
const OWNER_TYPES = ["Organization", "Individual"];
const BENEFICIARIES = ["Individual", "Group", "Has Parent"];
const DEFAULT_COMMISSION_VALIDITY_MONTHS = 36;

/* ─── Agent cell — first name + "+N more" link with popover ──────── */
function AgentCell({ names }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const linkRef = useRef(null);
  const popRef  = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (linkRef.current && linkRef.current.contains(e.target)) return;
      if (popRef.current && popRef.current.contains(e.target)) return;
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

  if (!names || names.length === 0) return <span style={{ color: "var(--fg-disabled)" }}>—</span>;

  const first = names[0];
  const rest = names.slice(1);

  const toggle = e => {
    e.stopPropagation();
    if (!open && linkRef.current) {
      const r = linkRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen(v => !v);
  };

  return (
    <div className="spa-agent-cell">
      <span className="spa-agent-name">{first}</span>
      {rest.length > 0 && (
        <button className="spa-more-link" ref={linkRef} onClick={toggle}>
          +{rest.length} more
        </button>
      )}
      {open && ReactDOM.createPortal(
        <div className="spa-more-pop" ref={popRef} style={{ top: pos.top, left: pos.left }}
          onClick={e => e.stopPropagation()}>
          <div className="spa-more-pop-head">{names.length} salesperson{names.length !== 1 ? "s" : ""}</div>
          {names.map((n, i) => (
            <div key={i} className="spa-more-pop-item">
              <HIcon name="person" size={14} color="var(--fg-tertiary)" />{n}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─── Ellipsis row menu (view / edit) ───────────────────────────── */
function EllipsisMenu({ onView, onEdit }) {
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
        <div className="hac-drop-fixed" ref={dropRef} style={{ top: pos.top, left: pos.left }}
          onClick={e => e.stopPropagation()}>
          <button className="hac-drop-item" onClick={() => { setOpen(false); onView(); }}><HIcon name="visibility" size={15} /> View</button>
          <button className="hac-drop-item" onClick={() => { setOpen(false); onEdit(); }}><HIcon name="edit" size={15} /> Edit</button>
        </div>,
        document.body
      )}
    </div>
  );
}

const agentNames = (acc, role) => acc.agents.filter(a => a.role === role).map(a => a.name);

/* ─── List view ─────────────────────────────────────────────────── */
function SPListView({ onView, onEdit, onCreate }) {
  const [q, setQ]                 = useState("");
  const [scope, setScope]         = useState("sp"); // "sp" → org name · "provider" → provider acc no
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingStatus, setPendingStatus] = useState("all");
  const [page, setPage]           = useState(1);
  const [perPage, setPerPage]     = useState(10);

  const hasActiveFilters = statusFilter !== "all";
  const activeCount = statusFilter !== "all" ? 1 : 0;

  const toggleFilter = () => {
    if (!filterOpen) setPendingStatus(statusFilter);
    setFilterOpen(v => !v);
  };
  const applyFilters = () => { setStatusFilter(pendingStatus); setPage(1); setFilterOpen(false); };
  const resetFilters = () => { setPendingStatus("all"); setStatusFilter("all"); setPage(1); };

  const filtered = useMemo(() => {
    let list = SP_ACCOUNTS;
    if (q) {
      const ql = q.toLowerCase();
      list = list.filter(a => scope === "provider"
        ? a.providerAccNo.includes(q.trim())
        : a.orgName.toLowerCase().includes(ql));
    }
    if (statusFilter !== "all") list = list.filter(a => a.status === statusFilter);
    return list;
  }, [q, scope, statusFilter]);

  const SCOPE_META = {
    sp:       { label: "Org",              placeholder: "Search by Organization Name" },
    provider: { label: "Provider Acc. No.", placeholder: "Search by Provider Acc. No." },
  };

  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="hac-toolbar">
        <div className="hac-toolbar-left">
          {/* Search — leading scope dropdown (what to search by) + input */}
          <div className="hac-search-group scoped">
            <select className="hac-search-scope" value={scope}
              onChange={e => { setScope(e.target.value); setPage(1); }} aria-label="Search by">
              <option value="sp">Org</option>
              <option value="provider">Provider Acc. No.</option>
            </select>
            <div className="hac-search-bar">
              <HIcon name="search" size={18} color="var(--fg-tertiary)" />
              <input className="hac-search-input" placeholder={SCOPE_META[scope].placeholder}
                value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
              {q && (
                <button className="hac-search-clear" onClick={() => { setQ(""); setPage(1); }}>
                  <HIcon name="close" size={16} color="var(--fg-tertiary)" />
                </button>
              )}
            </div>
          </div>
          {/* Filter */}
          <button className={"hac-filter-btn" + (hasActiveFilters ? " active" : "")} onClick={toggleFilter}>
            <HIcon name="tune" size={18} /> Filter
            {activeCount > 0 && <span className="hac-filter-badge">{activeCount}</span>}
          </button>
        </div>
        <button className="hac-create-btn" onClick={onCreate}>
          <HIcon name="add" size={16} color="#fff" /> Add New SP Account
        </button>
      </div>

      {filterOpen && (
        <div className="hac-filter-panel">
          <div className="hac-filter-grid">
            <div className="hac-filter-field">
              <label>Status</label>
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

      <div className="hac-count">{filtered.length} Service Provider{filtered.length !== 1 ? "s" : ""}</div>

      <div className="ml-table-wrap">
        <table className="ml-table spa-table">
          <thead>
            <tr>
              <th>No.</th><th>Owner</th><th>Provider Acc. No.</th><th>Balance (RM)</th>
              <th>Agent</th><th>Referrer</th><th>Start Date</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((a, i) => (
              <tr key={a.id} onClick={() => onView(a)}>
                <td className="ml-mono">{(page - 1) * perPage + i + 1}</td>
                <td><span className="ml-cell-main">{a.orgName}</span></td>
                <td>
                  <div className="spa-provider-cell">
                    <PetronLogo size={18} />
                    <span className="ml-mono">{a.providerAccNo}</span>
                  </div>
                </td>
                <td className="ml-mono">{Number(a.balance).toLocaleString("en-MY")}</td>
                <td><AgentCell names={agentNames(a, "agent")} /></td>
                <td><AgentCell names={agentNames(a, "referrer")} /></td>
                <td className="ml-mono">{fmtDate(a.startDate)}</td>
                <td><HAccountStatusBadge status={a.status} /></td>
                <td onClick={e => e.stopPropagation()}>
                  <EllipsisMenu onView={() => onView(a)} onEdit={() => onEdit(a)} />
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

/* ─── Shared bits ───────────────────────────────────────────────── */
function Section({ title, right, children }) {
  return (
    <div className="ml-card hac-detail-card">
      <div className="hac-sec-header">
        <div className="hac-sec-header-row">
          <span>{title}</span>
          {right}
        </div>
      </div>
      {children}
    </div>
  );
}

function DField({ label, info, children }) {
  return (
    <div className="hac-fg spa-dfield">
      {info ? (
        <label className="hac-label spa-label-with-info">
          <span>{label}</span>
          <span className="ml-tooltip-wrap spa-info-wrap" tabIndex={0}>
            <span className="spa-info-trigger" aria-label={`${label} help`}>
              <HIcon name="info" size={14} color="var(--fg-tertiary)" />
            </span>
            <span className="ml-tooltip spa-info-tooltip">{info}</span>
          </span>
        </label>
      ) : (
        <label className="hac-label">{label}</label>
      )}
      <span className="hac-view-val spa-dval">{children}</span>
    </div>
  );
}

function FieldLabelWithInfo({ label, info }) {
  return (
    <label className="hac-label req spa-label-with-info">
      <span>{label}</span>
      <span className="ml-tooltip-wrap spa-info-wrap" tabIndex={0}>
        <span className="spa-info-trigger" aria-label={`${label} help`}>
          <HIcon name="info" size={14} color="var(--fg-tertiary)" />
        </span>
        <span className="ml-tooltip spa-info-tooltip">{info}</span>
      </span>
    </label>
  );
}

function TierGrid({ tiers, amountLabel = "Commission Amount" }) {
  return (
    <div className="spa-tier-grid">
      {tiers.map((t, i) => (
        <div className="spa-tier-card" key={i}>
          <div className="spa-tier-head">
            <div className="spa-tier-title-wrap">
              <span className="spa-tier-label"><HIcon name="stacked_bar_chart" size={13} /> Tier {i + 1}</span>
              {t.final && <span className="spa-final-badge">Final tier</span>}
            </div>
            <span className="spa-tier-more" aria-hidden="true">
              <HIcon name="more_horiz" size={16} color="var(--fg-disabled)" />
            </span>
          </div>
          <div className="spa-tier-body">
            <div><span className="ml-k">Usage</span><b>{t.final ? "> " : "≤ "}{Number(t.usageMax).toLocaleString("en-MY")} ltr</b></div>
            <div><span className="ml-k">{amountLabel}</span><b>{t.commissionAmount}</b></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Account-level fields above the salesperson cards: base usage volume, activation date,
// commission validity — plain fields like the other detail sections. Pre-activation accounts
// keep the disclaimer callout (activation is set automatically on the first fuel transaction).
function SalespersonTopFields({ mode, periodVolume, activationDate, validityMonths, onValidityChange }) {
  const months = Number(validityMonths) || DEFAULT_COMMISSION_VALIDITY_MONTHS;
  const rangeText = activationDate ? `${fmtDate(activationDate)} - ${fmtDate(addMonths(activationDate, months))}` : "";
  const volumeText = periodVolume ? fmtLitres(periodVolume) : "—";
  const activationText = activationDate ? fmtDate(activationDate) : "Pending first transaction";
  const activationInfo = `Activation date is set automatically on the first fuel transaction. Commission validity runs ${months} months from that date.`;

  if (mode === "view") {
    return (
      <div className="hac-detail-grid">
        <DField label="Base Usage Volume">{volumeText}</DField>
        <DField label="Activation Date" info={activationInfo}>{activationText}</DField>
        <DField label="Commission Validity">
          <div>
            <span className="hac-view-val spa-dval" style={{ padding: 0, minHeight: "auto" }}>{months} months</span>
            {rangeText && <span className="hac-field-hint">{rangeText}</span>}
          </div>
        </DField>
      </div>
    );
  }

  return (
    <div className="hac-form-grid3">
      <div className="hac-fg">
        <label className="hac-label">Base Usage Volume</label>
        <span className="hac-view-val spa-dval">{volumeText}</span>
      </div>
      <div className="hac-fg">
        <FieldLabelWithInfo label="Activation Date" info={activationInfo} />
        <span className="hac-view-val spa-dval">{activationText}</span>
      </div>
      <div className="hac-fg">
        <FieldLabelWithInfo
          label="Commission Validity"
          info="Defaults to 36 months from the activation date. Stays with the SP account if it is transferred between agents."
        />
        <div className="spa-validity-input">
          <input className="hac-input" type="number" min="1" placeholder="36"
            value={validityMonths} onChange={e => onValidityChange(e.target.value)} />
          <span className="spa-validity-suffix">months</span>
        </div>
        {rangeText && <span className="hac-field-hint">{rangeText}</span>}
      </div>
    </div>
  );
}

// One salesperson = one umbrella card: identity + commission tiering + KPI attribution footer.
// View renders read-only TierGrid; edit renders EditableTiers + the card menu.
function SalespersonUmbrellaCard({ person, periodVolume, mode, onTiersChange, onEditDetails, onAddTier, onDelete, tierAddTick }) {
  const pct = Number(person.kpiSplitPct) || 0;
  const volume = periodVolume ? attributedVolume(pct, periodVolume) : null;
  return (
    <div className="spa-sp-umbrella-card">
      <div className="spa-sp-edit-head">
        <div className="spa-sp-name">
          <HIcon name={person.role === "referrer" ? "group" : "support_agent"} size={15} color="var(--navy-800)" /> {person.name}
          <span className="spa-role-chip">{roleLabelOf(person.role)}</span>
        </div>
        {mode === "edit" && (
          <SalespersonCardMenu onEdit={onEditDetails} onAddTier={onAddTier} onDelete={onDelete} />
        )}
      </div>
      <div className="spa-umbrella-tiers">
        {mode === "view" && <div className="spa-umbrella-tiers-label">Commission tiering</div>}
        {mode === "edit"
          ? <EditableTiers kind="commission" tiers={person.tiers} onChange={onTiersChange} externalAddTick={tierAddTick} />
          : <TierGrid tiers={person.tiers} />}
      </div>
      <div className="spa-sp-kpi-foot">
        <div className="spa-attr-inline-metric">
          <span className="ml-k">KPI Attribution</span>
          <strong className="spa-attr-list-strong">{pct}%</strong>
        </div>
        <div className="spa-attr-inline-metric">
          <span className="ml-k">KPI Volume Counted</span>
          <strong className="spa-attr-list-strong">{volume != null ? fmtLitres(volume) : "—"}</strong>
        </div>
      </div>
    </div>
  );
}

// Salesperson = the umbrella. One merged section: account-level dates, then per-role groups
// (Agent / Referrer), each with its own constrained distribution bar + umbrella cards.
// Shared by the detail (mode="view") and form (mode="edit") views so editing logic isn't forked.
function SalespersonSetting({ mode, roster, onChange, periodVolume, activationDate, validityMonths, onValidityChange }) {
  const [spModalState, setSpModalState] = useState(null);
  const [kpiModalOpen, setKpiModalOpen] = useState(false);
  const [tierAddTick, setTierAddTick] = useState({});
  const isEdit = mode === "edit";

  const setAgent = (i, patch) => onChange(roster.map((a, j) => j === i ? { ...a, ...patch } : a));
  const addAgent = person => onChange([...roster, person]);
  const removeAgent = i => onChange(roster.filter((_, j) => j !== i));
  const saveAgentDetails = (i, person) => onChange(roster.map((a, j) => j === i ? { ...a, name: person.name, role: person.role } : a));
  const requestTierAdd = i => setTierAddTick(t => ({ ...t, [i]: (t[i] || 0) + 1 }));

  const roleGroup = (role) => {
    // Keep each person's original roster index for correct mutation; sort display by split desc
    // (matches the bar order).
    const rows = roster
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => a.role === role)
      .sort((x, y) => (Number(y.a.kpiSplitPct) || 0) - (Number(x.a.kpiSplitPct) || 0) || x.a.name.localeCompare(y.a.name));
    if (!isEdit && rows.length === 0) return null;
    const people = rows.map(r => r.a);
    const count = people.length;
    const total = splitTotal(people);
    const noun = roleLabelOf(role);
    const countLabel = `${count} ${count === 1 ? noun.toLowerCase() : noun.toLowerCase() + "s"}`;
    return (
      <div className="spa-role-group" key={role}>
        <div className="spa-role-group-head">
          <div className="spa-role-group-title">
            <span className="hac-form-section-title" style={{ margin: 0, color: "var(--navy-800)" }}>{noun} KPI Attribution</span>
            <span className="spa-role-group-meta">{countLabel}</span>
          </div>
          {isEdit && (
            <div className="spa-role-group-actions">
              {count > 0 && <button className="hac-add-tier-btn" onClick={() => setKpiModalOpen(true)}><HIcon name="tune" size={15} /> Edit attribution</button>}
              <button className="hac-add-tier-btn" onClick={() => setSpModalState({ mode: "create", role })}><HIcon name="add" size={15} /> Add {noun}</button>
            </div>
          )}
        </div>
        {count === 0 ? (
          <div className="hac-empty-state">No {noun.toLowerCase()} added yet.</div>
        ) : (
          <>
            <div className="spa-attr-overview-row">
              <AttributionTotalReadout total={total} label="Total attribution" />
              <KpiRoleBar roster={people} periodVolume={periodVolume} />
            </div>
            <div className="spa-sp-umbrella-grid">
              {rows.map(({ a, i }) => (
                <SalespersonUmbrellaCard
                  key={i}
                  person={a}
                  periodVolume={periodVolume}
                  mode={mode}
                  onTiersChange={t => setAgent(i, { tiers: t })}
                  onEditDetails={() => setSpModalState({ mode: "edit", index: i })}
                  onAddTier={() => requestTierAdd(i)}
                  onDelete={() => removeAgent(i)}
                  tierAddTick={tierAddTick[i] || 0}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Section title="Salesperson Setting">
      <SalespersonTopFields mode={mode} periodVolume={periodVolume} activationDate={activationDate} validityMonths={validityMonths} onValidityChange={onValidityChange} />
      {roster.length === 0 && !isEdit && (
        <div className="hac-empty-state">No salesperson added yet.</div>
      )}
      {roleGroup("agent")}
      {roleGroup("referrer")}
      {spModalState && ReactDOM.createPortal(
        <AddSalespersonModal
          initialValue={spModalState.mode === "edit" ? roster[spModalState.index] : null}
          defaultRole={spModalState.role || "agent"}
          onClose={() => setSpModalState(null)}
          onSave={person => {
            if (spModalState.mode === "edit") saveAgentDetails(spModalState.index, person);
            else addAgent(person);
          }}
        />,
        document.body
      )}
      {kpiModalOpen && ReactDOM.createPortal(
        <KpiAttributionModal
          roster={roster}
          onClose={() => setKpiModalOpen(false)}
          onSave={(next) => { onChange(next); setKpiModalOpen(false); }}
        />,
        document.body
      )}
    </Section>
  );
}

/* ─── KPI Volume Distribution ───────────────────────────────────── */
// Model C: KPI attribution is split independently within Agents and Referrers.
// Each role-specific pool must sum to 100% of the same base usage volume.
const splitTotal = (roster) => roster.reduce((s, a) => s + (Number(a.kpiSplitPct) || 0), 0);
const attributedVolume = (pct, periodVolume) =>
  Math.round((Number(periodVolume) || 0) * (Number(pct) || 0) / 100);
const fmtLitres = (n) => Number(n || 0).toLocaleString("en-MY") + " ltr";
const roleLabelOf = (role) => (role === "referrer" ? "Referrer" : "Agent");
const roleTitleOf = (role) => (role === "referrer" ? "Referrer distribution" : "Agent distribution");
const filterRosterByRole = (roster, role) => roster.filter((person) => person.role === role);
const sortRosterBySplit = (roster) => [...roster].sort((a, b) => {
  const diff = (Number(b.kpiSplitPct) || 0) - (Number(a.kpiSplitPct) || 0);
  if (diff !== 0) return diff;
  return a.name.localeCompare(b.name);
});
const clampPct = (v) => {
  const n = Math.round(Number(v));
  if (isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
};
const KPI_AGENT_BAR_COLORS = ["#009A49", "#12A95A", "#29B66B", "#46C27D", "#67CD93", "#8DD9AC"];
const KPI_REFERRER_BAR_COLORS = ["#0C79B8", "#1F89C7", "#3A99D3", "#57AADF", "#79BDE8", "#9BD0F0"];
const kpiBarColor = (role, index) => {
  const palette = role === "referrer" ? KPI_REFERRER_BAR_COLORS : KPI_AGENT_BAR_COLORS;
  return palette[Math.min(index, palette.length - 1)];
};

function commissionSummary(person) {
  const tiers = person.tiers || [];
  if (!tiers.length) return "No commission tiers";
  const final = tiers.find(t => t.final) || tiers[tiers.length - 1];
  return `${tiers.length} tier${tiers.length !== 1 ? "s" : ""} · final ${final.commissionAmount}`;
}

function KpiRoleRows(roster, periodVolume) {
  return sortRosterBySplit(roster).map((a, i) => ({
    key: `${a.name}-${a.role}-${i}`,
    rank: i + 1,
    name: a.name,
    role: a.role,
    pct: Number(a.kpiSplitPct) || 0,
    volume: periodVolume ? attributedVolume(a.kpiSplitPct, periodVolume) : null,
  }));
}

function KpiRoleBar({ roster, periodVolume }) {
  const rows = KpiRoleRows(roster, periodVolume);
  return (
    <div className="spa-attr-stack" role="img" aria-label="KPI volume distribution split">
      {rows.map((row, index) => (
        <div
          key={row.key}
          className={"spa-attr-stack-seg" + (row.role === "referrer" ? " others" : "")}
          style={{ flexGrow: row.pct, background: kpiBarColor(row.role, index) }}
          tabIndex={0}
        >
          <span className="ml-tooltip-wrap spa-attr-stack-tip-wrap">
            <span className="ml-tooltip spa-attr-stack-tooltip">
              {row.name} · Split {row.pct}% · Attributed volume {row.volume != null ? fmtLitres(row.volume) : "—"}
            </span>
          </span>
          {(row.pct >= 12 || (index === rows.length - 1 && row.pct >= 8)) && (
            <span className="spa-attr-stack-label">{row.pct}%</span>
          )}
        </div>
      ))}
    </div>
  );
}

function AttributionTotalReadout({ total, label }) {
  const valid = total === 100;
  return (
    <span className={"spa-attr-total" + (valid ? "" : " warn")}>
      <HIcon name={valid ? "check_circle" : "error"} size={15} color="currentColor" />
      {valid ? `${label} ${total}%` : `${label} ${total}% · must equal 100%`}
    </span>
  );
}

function KpiRoleEditor({ role, draft, onSetPct, onAutoDistribute }) {
  const people = sortRosterBySplit(filterRosterByRole(draft, role));
  const total = splitTotal(people);
  if (!people.length) return null;
  return (
    <div className="spa-attr-edit-group">
      <div className="spa-attr-edit-group-head">
        <h4 className="spa-attr-role-title">{roleTitleOf(role)}</h4>
        <button className="hac-add-tier-btn" onClick={() => onAutoDistribute(role)}>
          <HIcon name="balance" size={15} /> Auto-distribute
        </button>
      </div>
      <div className="spa-attr-edit-list">
        {people.map((a, i) => (
          <div className="spa-attr-edit-row" key={a._idx}>
            <div className="spa-attr-edit-person">
              <div className="spa-sp-name">
                <span className="spa-attr-rank">{i + 1}</span>
                <HIcon name={a.role === "referrer" ? "group" : "support_agent"} size={15} color="var(--navy-800)" /> {a.name}
                <span className="spa-role-chip">{roleLabelOf(a.role)}</span>
              </div>
              <div className="ml-cell-sub">{commissionSummary(a)}</div>
            </div>
            <div className="spa-attr-edit-input">
              <input className="hac-input" type="number" min="0" max="100"
                value={a.kpiSplitPct} onChange={e => onSetPct(a._idx, e.target.value)} />
              <span className="spa-attr-pct">%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="spa-attr-modal-foot-row">
        <AttributionTotalReadout total={total} label={`${roleLabelOf(role)} total`} />
      </div>
    </div>
  );
}

function KpiAttributionModal({ roster, onClose, onSave }) {
  const [draft, setDraft] = useState(() => roster.map((a, idx) => ({ ...a, _idx: idx, kpiSplitPct: Number(a.kpiSplitPct) || 0 })));
  const agents = filterRosterByRole(draft, "agent");
  const referrers = filterRosterByRole(draft, "referrer");
  const validAgents = agents.length === 0 || splitTotal(agents) === 100;
  const validReferrers = referrers.length === 0 || splitTotal(referrers) === 100;
  const valid = validAgents && validReferrers;
  const setPct = (idx, v) => setDraft(d => d.map((a) => a._idx === idx ? { ...a, kpiSplitPct: clampPct(v) } : a));
  const autoDistribute = (role) => {
    const people = draft.filter((a) => a.role === role);
    if (!people.length) return;
    const dist = distributeSplit(people.map(() => 1));
    let pointer = 0;
    setDraft((current) => current.map((a) => {
      if (a.role !== role) return a;
      const nextPct = dist[pointer];
      pointer += 1;
      return { ...a, kpiSplitPct: nextPct };
    }));
  };

  return (
    <Modal title="Edit KPI Volume Distribution" onClose={onClose} footer={
      <>
        <button className="hac-modal-cancel" onClick={onClose}>Cancel</button>
        <button className="hac-modal-save" disabled={!valid} onClick={() => onSave(draft.map(({ _idx, ...a }) => a))}>Save Changes</button>
      </>
    }>
      <div className="hac-field-hint" style={{ marginBottom: 16 }}>
        Agent and referrer attribution are configured separately. Each group must total 100% of the same base usage volume.
        Does not affect commission payments.
      </div>
      <KpiRoleEditor role="agent" draft={draft} onSetPct={setPct} onAutoDistribute={autoDistribute} />
      <KpiRoleEditor role="referrer" draft={draft} onSetPct={setPct} onAutoDistribute={autoDistribute} />
    </Modal>
  );
}

/* ─── Detail (view) ─────────────────────────────────────────────── */
function SPDetailView({ account, onBack, onEdit }) {
  const a = account;
  const [roster, setRoster] = useState(() => account.agents.map(x => ({ ...x })));

  return (
    <div>
      <div className="hac-breadcrumb">
        <button className="hac-bc-link" onClick={onBack}>SP Account</button>
        <HIcon name="chevron_right" size={15} color="var(--fg-tertiary)" />
        <span>{a.orgName}</span>
      </div>
      <div className="ml-page-head" style={{ margin: "10px 0 20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 className="ml-h1">{a.orgName}</h1>
            <HAccountStatusBadge status={a.status} />
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-secondary)", marginTop: 3 }}>
            {a.provider} · {a.providerAccNo} · {a.ownerType}
          </div>
        </div>
        <div className="ml-page-head-right">
          <button className="ml-btn-outline" onClick={onEdit}><HIcon name="edit" size={15} /> Edit</button>
        </div>
      </div>

      <div className="hac-detail-sections">
        <Section title="General Setting">
          <div className="hac-detail-grid">
            <DField label="Owner Type">{a.ownerType}</DField>
            <DField label="Org Name">{a.orgName}</DField>
            <DField label="Provider">{a.provider}</DField>
            <DField label="Provider Acc. No.">{a.providerAccNo}</DField>
            <DField label="Balance">{fmtRM(a.balance)}</DField>
            <DField label="Subsidy No.">{a.subsidyNos.join(", ")}</DField>
          </div>
        </Section>

        <Section title="Cards Settings">
          <div className="hac-detail-grid">
            <DField label="Freezing Threshold Type">{a.freezingThresholdType}</DField>
            <DField label="Freezing Threshold Amount">{fmtRM(a.freezingThresholdAmount)}</DField>
            <DField label="Balance Reminder">{fmtRM(a.balanceReminder)}</DField>
          </div>
        </Section>

        <Section title="Rebate Setting">
          <div className="hac-detail-grid">
            <DField label="Rebate Beneficiary">{a.rebateBeneficiary}</DField>
            <DField label="Is Master">{a.isMaster ? "Yes" : "No"}</DField>
          </div>
          <TierGrid tiers={a.rebateTiers} amountLabel="Rebate Amount" />
        </Section>

        <SalespersonSetting
          mode="view"
          roster={roster}
          onChange={setRoster}
          periodVolume={a.periodVolume}
          activationDate={a.activationDate}
          validityMonths={a.commissionValidityMonths}
        />

        <Section title="Payout Setting">
          <div className="hac-detail-grid">
            <DField label="Payout Type">{a.payoutType}</DField>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ─── Form (create / edit) ──────────────────────────────────────── */
function RadioRow({ name, options, value, onChange }) {
  return (
    <div className="spa-radio-group">
      {options.map(opt => (
        <label key={opt} className="spa-radio-row">
          <input type="radio" name={name} checked={value === opt} onChange={() => onChange(opt)} />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

/* ─── Modal shell ───────────────────────────────────────────────── */
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
        <div className="hac-modal-body" style={{ paddingBottom: 20 }}>{children}</div>
        {footer && <div className="hac-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function TierCardMenu({ onEdit, onAddTier, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const DROP_W = 160;

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
      <button className="ml-icon-btn" ref={btnRef} onClick={toggle} title="More actions">
        <HIcon name="more_horiz" size={18} />
      </button>
      {open && ReactDOM.createPortal(
        <div className="hac-drop-fixed" ref={dropRef} style={{ top: pos.top, left: pos.left }}
          onClick={e => e.stopPropagation()}>
          <button className="hac-drop-item" onClick={() => { setOpen(false); onEdit(); }}><HIcon name="edit" size={15} /> Edit</button>
          <button className="hac-drop-item" onClick={() => { setOpen(false); onAddTier(); }}><HIcon name="add" size={15} /> Add Tier</button>
          <button className="hac-drop-item danger" onClick={() => { setOpen(false); onDelete(); }}><HIcon name="delete" size={15} color="currentColor" /> Delete</button>
        </div>,
        document.body
      )}
    </div>
  );
}

function SalespersonCardMenu({ onEdit, onAddTier, onDelete }) {
  return (
    <TierCardMenu onEdit={onEdit} onAddTier={onAddTier} onDelete={onDelete} />
  );
}

/* ─── Add / edit tier modal ─────────────────────────────────────── */
// kind: "rebate" | "commission" — drives the wording. A "final" tier is
// open-ended (Usage >), its threshold locked to the previous tier's usage.
function TierModal({ kind, tier, prevUsage, onClose, onSave }) {
  const noun = kind === "rebate" ? "Rebate" : "Commission";
  const isEdit = !!tier;
  const [usageMax, setUsageMax] = useState(tier ? String(tier.usageMax ?? "") : "");
  const [amount, setAmount]     = useState(tier ? String(tier.commissionAmount ?? "") : "");
  const [isFinal, setIsFinal]   = useState(!!(tier && tier.final));

  const usageLabel = isFinal ? "Usage >" : "Usage <=";
  const usageHint  = isFinal
    ? `${noun} applies to previous tier's usage amount and above`
    : `${noun} applies up to this usage amount`;
  const displayUsage = isFinal
    ? (prevUsage != null ? Number(prevUsage).toLocaleString("en-MY") : "")
    : usageMax;

  const canSave = amount.trim() !== "" && (isFinal || usageMax.trim() !== "");
  const save = () => {
    if (!canSave) return;
    onSave({
      usageMax: isFinal ? Number(prevUsage || 0) : Number(usageMax),
      commissionAmount: Number(amount),
      final: isFinal,
    });
    onClose();
  };

  return (
    <Modal title={`${isEdit ? "Edit" : "Add"} ${noun} Tier`} onClose={onClose} footer={
      <>
        <button className="hac-modal-cancel" onClick={onClose}>Cancel</button>
        <button className="hac-modal-save" disabled={!canSave} onClick={save}>Save</button>
      </>
    }>
      <div className="spa-tier-modal-row">
        <label className="hac-label req" style={{ fontSize: 14 }}>{usageLabel}*</label>
        <label className="hac-check-row">
          <input type="checkbox" checked={isFinal} onChange={e => setIsFinal(e.target.checked)} />
          <span>Set as final tier</span>
        </label>
      </div>
      <input className="hac-input" type={isFinal ? "text" : "number"} disabled={isFinal}
        placeholder="Enter usage amount, e.g. 10,000 litres"
        value={displayUsage} onChange={e => setUsageMax(e.target.value)} />
      <div className="hac-field-hint" style={{ marginBottom: 18 }}>{usageHint}</div>

      <div className="hac-fg">
        <label className="hac-label req" style={{ fontSize: 14 }}>{noun} Amount*</label>
        <input className="hac-input" type="number" step="0.01"
          placeholder={`Enter ${kind} for organization.`}
          value={amount} onChange={e => setAmount(e.target.value)} />
      </div>
    </Modal>
  );
}

/* ─── Editable tier list (cards + Add/Edit modal) ───────────────── */
function EditableTiers({ kind, tiers, onChange, externalAddTick = 0 }) {
  const [modal, setModal] = useState(null); // { editIndex } | null
  const noun = kind === "rebate" ? "Rebate" : "Commission";
  const prevAddTick = useRef(externalAddTick);
  // Previous tier's usage (highest non-final usageMax) — basis for a final tier.
  const prevUsage = tiers.filter(t => !t.final).reduce((m, t) => Math.max(m, Number(t.usageMax) || 0), 0);

  const close = () => setModal(null);
  const saveTier = t => {
    if (modal.editIndex == null) onChange([...tiers, t]);
    else onChange(tiers.map((x, i) => i === modal.editIndex ? t : x));
  };
  const remove = i => onChange(tiers.filter((_, j) => j !== i));

  useEffect(() => {
    if (externalAddTick !== prevAddTick.current) {
      prevAddTick.current = externalAddTick;
      setModal({ editIndex: null });
    }
  }, [externalAddTick]);

  return (
    <div>
      <div className="hac-sec-header-row" style={{ marginBottom: 10 }}>
        <span className="hac-form-section-title" style={{ margin: 0, color: "var(--navy-800)" }}>Tier Setting</span>
      </div>
      {tiers.length === 0 ? (
        <div className="hac-tier-empty"><span><HIcon name="error" size={15} /> Tier 1</span>At least one tier is required</div>
      ) : (
        <div className="spa-tier-grid">
          {tiers.map((t, i) => (
            <div className="spa-tier-card" key={i}>
              <div className="spa-tier-head">
                <div className="spa-tier-title-wrap">
                  <span className="spa-tier-label"><HIcon name="stacked_bar_chart" size={13} /> Tier {i + 1}</span>
                  {t.final && <span className="spa-final-badge">Final tier</span>}
                </div>
                <TierCardMenu
                  onEdit={() => setModal({ editIndex: i })}
                  onAddTier={() => setModal({ editIndex: null })}
                  onDelete={() => remove(i)}
                />
              </div>
              <div className="spa-tier-body">
                <div><span className="ml-k">Usage</span><b>{t.final ? "> " : "≤ "}{Number(t.usageMax).toLocaleString("en-MY")} ltr</b></div>
                <div><span className="ml-k">{noun} Amount</span><b>{t.commissionAmount}</b></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && ReactDOM.createPortal(
        <TierModal kind={kind}
          tier={modal.editIndex == null ? null : tiers[modal.editIndex]}
          prevUsage={prevUsage} onClose={close} onSave={saveTier} />,
        document.body
      )}
    </div>
  );
}

/* ─── Add salesperson modal ─────────────────────────────────────── */
function AddSalespersonModal({ initialValue = null, defaultRole = "agent", onClose, onSave }) {
  const isEdit = !!initialValue;
  const [role, setRole]         = useState(initialValue?.role || defaultRole);
  const [name, setName]         = useState(initialValue?.name || "");
  const noun = role === "agent" ? "Agent" : "Referrer";
  const pool = role === "agent" ? AGENT_POOL : REFERRER_POOL;
  const canSave = !!name;
  const save = () => { if (!canSave) return; onSave({ name, role, tiers: [] }); onClose(); };

  return (
    <Modal title={isEdit ? "Edit Salesperson" : "Add Salesperson"} onClose={onClose} footer={
      <>
        <button className="hac-modal-cancel" onClick={onClose}>Cancel</button>
        <button className="hac-modal-save" disabled={!canSave} onClick={save}>{isEdit ? "Save Changes" : "Save"}</button>
      </>
    }>
      <div className="spa-radio-group" style={{ marginBottom: 18 }}>
        <label className="spa-radio-row">
          <input type="radio" name="sp-role" checked={role === "agent"} onChange={() => { setRole("agent"); setName(""); }} />
          <span>Agent</span>
        </label>
        <label className="spa-radio-row">
          <input type="radio" name="sp-role" checked={role === "referrer"} onChange={() => { setRole("referrer"); setName(""); }} />
          <span>Referrer</span>
        </label>
      </div>
      <div className="hac-fg" style={{ marginBottom: 16 }}>
        <label className="hac-label req">{noun}*</label>
        <select className="hac-input hac-select-input" value={name} onChange={e => setName(e.target.value)}>
          <option value="">Select the {noun.toLowerCase()} from the list</option>
          {pool.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
    </Modal>
  );
}

function SPFormView({ account, onBack, onSave }) {
  const isEdit = !!account;
  const [form, setForm] = useState(() => account ? JSON.parse(JSON.stringify(account)) : {
    ownerType: "Organization", orgName: "", provider: "", providerAccNo: "",
    subsidyNos: [""],
    freezingThresholdType: "", freezingThresholdAmount: "", balanceReminder: "",
    rebateBeneficiary: "Individual", isMaster: false,
    rebateTiers: [{ usageMax: 1000, commissionAmount: 0.01, final: true }],
    activationDate: "", commissionValidityMonths: DEFAULT_COMMISSION_VALIDITY_MONTHS,
    agents: [],
    payoutType: "Credit Note",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Subsidy numbers
  const setSubsidy = (i, v) => setForm(f => { const s = [...f.subsidyNos]; s[i] = v; return { ...f, subsidyNos: s }; });
  const addSubsidy = () => setForm(f => ({ ...f, subsidyNos: [...f.subsidyNos, ""] }));
  const removeSubsidy = i => setForm(f => ({ ...f, subsidyNos: f.subsidyNos.filter((_, j) => j !== i) }));

  // Rebate tiers
  const setRebateTiers = t => set("rebateTiers", t);
  // Salesperson commission + KPI editing is handled inline by <SalespersonSetting>.

  // Validity defaults to 36 months on create but is editable (not fixed).
  const validityMonths = Number(form.commissionValidityMonths) || DEFAULT_COMMISSION_VALIDITY_MONTHS;

  return (
    <div style={{ paddingBottom: 90 }}>
      <div className="hac-breadcrumb">
        <button className="hac-bc-link" onClick={onBack}>SP Account</button>
        <HIcon name="chevron_right" size={15} color="var(--fg-tertiary)" />
        <span>{isEdit ? "Edit" : "Create"}</span>
      </div>
      <h1 className="ml-h1" style={{ margin: "10px 0 18px" }}>{isEdit ? "Edit SP Account" : "Create New SP Account"}</h1>

      <div className="hac-detail-sections">
        {/* General Setting */}
        <Section title="General Setting">
          <div className="hac-form-grid3">
            <div className="hac-fg">
              <label className="hac-label req">Owner Type*</label>
              <select className="hac-input hac-select-input" value={form.ownerType} onChange={e => set("ownerType", e.target.value)}>
                {OWNER_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="hac-fg">
              <label className="hac-label req">Org Name*</label>
              <select className="hac-input hac-select-input" value={form.orgName} onChange={e => set("orgName", e.target.value)}>
                <option value="">Select organization</option>
                {ORGS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="hac-fg">
              <label className="hac-label req">Provider*</label>
              <select className="hac-input hac-select-input" value={form.provider} onChange={e => set("provider", e.target.value)}>
                <option value="">Select service provider from the list</option>
                {PROVIDERS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="hac-fg">
              <label className="hac-label req">Provider Acc. No.*</label>
              <input className="hac-input" placeholder="Enter service provider's account number"
                value={form.providerAccNo} onChange={e => set("providerAccNo", e.target.value)} />
            </div>
          </div>

          <div className="hac-form-section-title" style={{ margin: "22px 0 14px", color: "var(--navy-800)" }}>Subsidy Account Setting</div>
          <div className="spa-subsidy-rows">
            {form.subsidyNos.map((s, i) => (
              <div className="spa-subsidy-row" key={i}>
                <input className="hac-input" placeholder="Enter subsidy no." value={s}
                  onChange={e => setSubsidy(i, e.target.value)} />
                <div className="spa-subsidy-action">
                  {i === 0 ? (
                    <button className="hac-add-tier-btn" onClick={addSubsidy}>
                      <HIcon name="add" size={15} /> Add Subsidy No.
                    </button>
                  ) : (
                    <button className="ml-icon-btn" onClick={() => removeSubsidy(i)} title="Remove"><HIcon name="close" size={16} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Cards Settings */}
        <Section title="Cards Settings">
          <div className="hac-form-grid3">
            <div className="hac-fg">
              <label className="hac-label req">Freezing Threshold Type*</label>
              <select className="hac-input hac-select-input" value={form.freezingThresholdType} onChange={e => set("freezingThresholdType", e.target.value)}>
                <option value="">Select threshold type</option>
                {FREEZING_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="hac-fg">
              <label className="hac-label req">Freezing Threshold Amount*</label>
              <input className="hac-input" type="number" placeholder="Enter minimum card balance before top-up."
                value={form.freezingThresholdAmount} onChange={e => set("freezingThresholdAmount", e.target.value)} />
            </div>
            <div className="hac-fg">
              <label className="hac-label req">Balance Reminder*</label>
              <input className="hac-input" type="number" placeholder="Enter minimum account balance before top-up."
                value={form.balanceReminder} onChange={e => set("balanceReminder", e.target.value)} />
            </div>
          </div>
        </Section>

        {/* Rebate Setting */}
        <Section title="Rebate Setting">
          <div className="hac-fg" style={{ marginBottom: 14 }}>
            <label className="hac-label">Rebate Beneficiary</label>
            <RadioRow name="beneficiary" options={BENEFICIARIES} value={form.rebateBeneficiary} onChange={v => set("rebateBeneficiary", v)} />
          </div>
          <label className="hac-check-row" style={{ marginBottom: 16 }}>
            <input type="checkbox" checked={form.isMaster} onChange={e => set("isMaster", e.target.checked)} />
            <span>Is Master</span>
          </label>
          <EditableTiers kind="rebate" tiers={form.rebateTiers} onChange={setRebateTiers} />
        </Section>

        {/* Salesperson Setting — umbrella: account-level dates + per-role groups (commission + KPI) */}
        <SalespersonSetting
          mode="edit"
          roster={form.agents}
          onChange={next => setForm(f => ({ ...f, agents: next }))}
          periodVolume={form.periodVolume}
          activationDate={form.activationDate}
          validityMonths={form.commissionValidityMonths}
          onValidityChange={v => set("commissionValidityMonths", v)}
        />

        {/* Payout Setting */}
        <Section title="Payout Setting">
          <div className="hac-fg">
            <label className="hac-label">Payout Type</label>
            <RadioRow name="payout" options={PAYOUT_TYPES} value={form.payoutType} onChange={v => set("payoutType", v)} />
          </div>
        </Section>
      </div>

      <div className="hac-edit-bar">
        <button className="hac-cancel-btn" onClick={onBack}>Cancel</button>
        <button className="hac-save-btn" onClick={() => onSave({ ...form, commissionValidityMonths: validityMonths })}>
          <HIcon name="check" size={15} /> {isEdit ? "Save Changes" : "Save"}
        </button>
      </div>
    </div>
  );
}

/* ─── Root: state machine ───────────────────────────────────────── */
function SPAccountApp() {
  const [view, setView]       = useState("list"); // list | detail | create | edit
  const [active, setActive]   = useState(null);

  const goView   = a => { setActive(a); setView("detail"); };
  const goEdit   = a => { setActive(a); setView("edit"); };
  const goCreate = () => { setActive(null); setView("create"); };
  const goBack   = () => setView("list");
  const goSave   = () => setView("list");

  const inSubPage = view !== "list";

  return (
    <div className="ml-app">
      <HostTopBar />
      <HostSidebar active="sp_account" />
      <main className="ml-main">
        {!inSubPage && (
          <div style={{ marginBottom: 18 }}>
            <h1 className="ml-h1">Service Provider Account</h1>
          </div>
        )}
        {view === "list"   && <SPListView onView={goView} onEdit={goEdit} onCreate={goCreate} />}
        {view === "detail" && <SPDetailView account={active} onBack={goBack} onEdit={() => goEdit(active)} />}
        {view === "create" && <SPFormView account={null} onBack={goBack} onSave={goSave} />}
        {view === "edit"   && <SPFormView account={active} onBack={goBack} onSave={goSave} />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SPAccountApp />);
