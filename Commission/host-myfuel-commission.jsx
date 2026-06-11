// host-myfuel-commission.jsx — MyFuel Commission tab + Subscription Commission tab
// Exports: MyFuelCommissionTab, SubscriptionCommissionTab → window

const { useState: useMFC, useMemo: useMFM } = React;
const KPIProgress = window.HKPIProgress;

/* ─── Commission Status Badge ────────────────────────────────── */
const COMM_STATUS_META = {
  activated:           { label:"Activated",          cls:"comm-activated"  },
  pending_onboarding:  { label:"Pending Onboarding", cls:"comm-pending-ob" },
  on_hold:             { label:"On Hold",             cls:"comm-on-hold"    },
  deactivated:         { label:"Deactivated",         cls:"comm-deactivated"},
};
function MFCommStatusBadge({ status }) {
  const m = COMM_STATUS_META[status] || COMM_STATUS_META.activated;
  return <span className={"ml-badge " + m.cls}>{m.label}</span>;
}

/* ─── Payout Status Badge ────────────────────────────────────── */
const PAYOUT_META = {
  Pending:  { cls:"payout-pending"  },
  Approved: { cls:"payout-approved" },
  Paid:     { cls:"payout-paid"     },
  Rejected: { cls:"payout-rejected" },
};
function PayoutBadge({ status }) {
  const m = PAYOUT_META[status] || PAYOUT_META.Pending;
  return <span className={"ml-badge " + m.cls}>{status}</span>;
}

/* ─── KPI attainment bar ─────────────────────────────────────── */
function KPIBar({ pct }) {
  const col = pct >= 75 ? "var(--green-500)" : "var(--red-400)";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:56, height:6, background:"var(--bg-muted)", borderRadius:3, overflow:"hidden", flexShrink:0 }}>
        <div style={{ height:"100%", width:Math.min(pct, 100)+"%", background:col, borderRadius:3 }} />
      </div>
      <span style={{ fontSize:13, fontWeight:600, color:col, whiteSpace:"nowrap" }}>{pct}%</span>
    </div>
  );
}

/* ─── History bar chart ──────────────────────────────────────── */
function HistoryBarChart({ history }) {
  const max = Math.max(...history.map(h => h.commission), 1);
  return (
    <div className="hm-hist-wrap">
      <div className="hm-hist-bars">
        {history.map((h, i) => (
          <div key={i} className="hm-hist-col" title={HC.fmtRM(h.commission)}>
            <div style={{ height:80, display:"flex", alignItems:"flex-end", width:"100%" }}>
              <div className="hm-hist-bar"
                style={{ height:Math.max(h.commission / max * 80, 4)+"px" }} />
            </div>
            <div className="hm-hist-label">{h.period}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
        <span style={{ fontSize:11, color:"var(--fg-tertiary)" }}>
          Min: {HC.fmtRM(Math.min(...history.map(h => h.commission)))}
        </span>
        <span style={{ fontSize:11, color:"var(--fg-tertiary)" }}>
          Max: {HC.fmtRM(Math.max(...history.map(h => h.commission)))}
        </span>
      </div>
    </div>
  );
}

/* ─── MyFuel KPI header strip ────────────────────────────────── */
function MyFuelKPIHeader() {
  const s = HC.MYFUEL_SUMMARY;
  const kpis = [
    { title:"Total Commission Payable", value:HC.fmtRM(s.totalPayable), sub:s.period,           icon:"payments"        },
    { title:"Total Active Agents",      value:s.activeAgents,           sub:"Currently active",  icon:"group"           },
    { title:"Pending Payout Requests",  value:s.pendingPayout,          sub:"Awaiting approval", icon:"pending_actions" },
  ];
  return (
    <div className="hm-kpi-strip">
      {kpis.map((k, i) => (
        <div key={i} className="hm-stat-card-a">
          <div className="hm-stat-header">
            <div className="hm-stat-header-left">
              <div className="hm-stat-icon">
                <HIcon name={k.icon} size={18} color="#00AA4F" />
              </div>
              <div>
                <div className="hm-stat-title">{k.title}</div>
                <div className="hm-stat-subtitle">{k.sub}</div>
              </div>
            </div>
          </div>
          <div className="hm-stat-value-row">
            <span className="hm-stat-value">{k.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Agent Commission Drill-down ────────────────────────────── */
function AgentCommissionDrilldown({ record, onBack }) {
  const breakdown = HC.SP_COMMISSION_BREAKDOWN[record.agentId] || [];
  const history   = HC.COMMISSION_HISTORY[record.agentId] || HC.COMMISSION_HISTORY._default;
  const totalVol  = breakdown.reduce((a, b) => a + b.volume, 0);
  const totalComm = breakdown.reduce((a, b) => a + b.commission, 0);

  const tierCls = { "Tier 1":"t1", "Tier 2":"t2", "Tier 3":"t3" };

  return (
    <div>
      <div className="hac-breadcrumb">
        <button className="hac-bc-link" onClick={onBack}>MyFuel Commission</button>
        <HIcon name="chevron_right" size={15} color="var(--fg-tertiary)" />
        <span>{record.agentName}</span>
      </div>

      <div className="ml-page-head" style={{ margin:"10px 0 20px" }}>
        <div>
          <h1 className="ml-h1">{record.agentName}</h1>
          <div style={{ fontSize:12, color:"var(--fg-secondary)", marginTop:3 }}>
            {record.agentId} · {record.period}
          </div>
        </div>
        <div className="ml-page-head-right">
          <PayoutBadge status={record.payout} />
          <HExportMenu />
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="hm-kpi-strip" style={{ marginBottom:20 }}>
        <div className="hm-stat-card-a">
          <div className="hm-stat-header">
            <div className="hm-stat-header-left">
              <div className="hm-stat-icon"><HIcon name="local_gas_station" size={18} color="#00AA4F" /></div>
              <div>
                <div className="hm-stat-title">Total Volume</div>
                <div className="hm-stat-subtitle">{record.spCount} SP accounts</div>
              </div>
            </div>
          </div>
          <div className="hm-stat-value-row">
            <span className="hm-stat-value">{HC.fmtL(record.totalLiters)}</span>
          </div>
        </div>
        <div className="hm-stat-card-a">
          <div className="hm-stat-header">
            <div className="hm-stat-header-left">
              <div className="hm-stat-icon"><HIcon name="track_changes" size={18} color="#00AA4F" /></div>
              <div>
                <div className="hm-stat-title">KPI Progress</div>
                <div className="hm-stat-subtitle">Target: {(record.kpiTarget || 200000).toLocaleString("en-US")} L · Dec 1–31</div>
              </div>
            </div>
          </div>
          <div className="hm-stat-value-row">
            <span className="hm-stat-value">{record.kpiPct}%</span>
            <span style={{ fontSize:12, fontWeight:600,
              color: record.kpiPct >= 75 ? "var(--green-500)" : "var(--red-400)" }}>
              {record.kpiPct >= 100 ? "✓ Full commission" : record.kpiPct >= 75 ? "✓ 50% multiplier" : "No commission"}
            </span>
          </div>
        </div>
        <div className="hm-stat-card-a">
          <div className="hm-stat-header">
            <div className="hm-stat-header-left">
              <div className="hm-stat-icon"><HIcon name="payments" size={18} color="#00AA4F" /></div>
              <div>
                <div className="hm-stat-title">Commission Amount</div>
                <div className="hm-stat-subtitle">Confirmed transactions only</div>
              </div>
            </div>
          </div>
          <div className="hm-stat-value-row">
            <span className="hm-stat-value">{HC.fmtRM(record.commission)}</span>
          </div>
        </div>
      </div>

      {/* Per-SP breakdown */}
      <div className="ml-card hac-detail-card" style={{ marginBottom:16 }}>
        <div className="hac-sec-header">SP Account Breakdown — {record.period}</div>
        {breakdown.length === 0 ? (
          <div style={{ padding:"32px 0", textAlign:"center", color:"var(--fg-tertiary)", fontSize:14 }}>
            <HIcon name="table_chart" size={32} color="var(--fg-disabled)" /><br/>
            <span style={{ marginTop:8, display:"block" }}>No SP account breakdown available for this agent.</span>
          </div>
        ) : (
          <div className="ml-table-wrap">
            <table className="ml-table" style={{ minWidth:700 }}>
              <thead>
                <tr>
                  <th>SP Code</th>
                  <th>Organisation</th>
                  <th>Volume (L)</th>
                  <th>Tier Applied</th>
                  <th>Base Rate</th>
                  <th>Commission</th>
                  <th>Commission Status</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((b, i) => (
                  <tr key={i}>
                    <td><code className="hac-code">{b.sp}</code></td>
                    <td className="ml-cell-main">{b.org}</td>
                    <td className="ml-mono">{b.volume.toLocaleString()}</td>
                    <td><span className={"ml-tier-tag " + (tierCls[b.tier] || "t1")}>{b.tier}</span></td>
                    <td className="ml-mono">{HC.fmtRate(b.rate)}</td>
                    <td className="ml-mono" style={{ fontWeight:600, color:"var(--navy-800)" }}>{HC.fmtRM(b.commission)}</td>
                    <td><MFCommStatusBadge status={b.commissionStatus} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Total — {breakdown.length} accounts</td>
                  <td className="ml-mono">{totalVol.toLocaleString()}</td>
                  <td colSpan={2}></td>
                  <td className="ml-mono" style={{ fontWeight:700 }}>{HC.fmtRM(totalComm)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Commission history */}
      <div className="ml-card hac-detail-card">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div className="hm-stat-icon"><HIcon name="history" size={18} color="#00AA4F" /></div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--fg-primary)" }}>Commission History</div>
              <div style={{ fontSize:12, color:"var(--fg-secondary)" }}>Last 12 months</div>
            </div>
          </div>
        </div>
        <div className="hm-hist-wrap">
          <div className="hm-hist-bars">
            {history.map((h, i) => {
              const max = Math.max(...history.map(x => x.commission), 1);
              return (
                <div key={i} className="hm-hist-col" title={HC.fmtRM(h.commission)}>
                  <div style={{ height:80, display:"flex", alignItems:"flex-end", width:"100%" }}>
                    <div className="hm-hist-bar" style={{ height:Math.max(h.commission / max * 80, 4)+"px" }} />
                  </div>
                  <div className="hm-hist-label">{h.period}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop:16 }}>
          <div className="commission-grid-ds">
            {[...history].slice(-6).map((h, i) => (
              <div key={i} className="commission-cell-ds">
                <div style={{ fontSize:13, fontWeight:600, color:"var(--fg-primary)", background:"#F4F4F6", padding:"8px 12px", borderBottom:"1px solid #E5E5E8" }}>{h.period}</div>
                <div style={{ padding:"8px 12px" }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"var(--fg-primary)" }}>{HC.fmtRM(h.commission)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MyFuel Commission Tab (root) ───────────────────────────── */
function MyFuelCommissionTab() {
  const [drillRecord, setDrillRecord] = useMFC(null);
  const [filters, setFilters] = useMFC({
    period:"Jun 2026", agentQ:"", spAccount:"", payoutStatus:"all",
  });
  const setF = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
  const [filterOpen, setFilterOpen] = useMFC(false);
  const [pending, setPending] = useMFC({ period:"Jun 2026", spAccount:"", payoutStatus:"all" });
  const [page, setPage] = useMFC(1);
  const [perPage, setPerPage] = useMFC(10);

  const activeCount =
    (filters.period !== "Jun 2026" ? 1 : 0) +
    (filters.spAccount !== "" ? 1 : 0) +
    (filters.payoutStatus !== "all" ? 1 : 0);
  const hasActiveFilters = activeCount > 0;

  const toggleFilter = () => {
    if (!filterOpen) setPending({ period:filters.period, spAccount:filters.spAccount, payoutStatus:filters.payoutStatus });
    setFilterOpen(v => !v);
  };
  const applyFilters = () => { setFilters(f => ({ ...f, ...pending })); setFilterOpen(false); setPage(1); };
  const resetFilters = () => {
    const cleared = { period:"Jun 2026", spAccount:"", payoutStatus:"all" };
    setPending(cleared); setFilters(f => ({ ...f, ...cleared })); setPage(1);
  };

  const records = useMFM(() => {
    let data = HC.MYFUEL_RECORDS;
    if (filters.agentQ) {
      const q = filters.agentQ.toLowerCase();
      data = data.filter(r => r.agentName.toLowerCase().includes(q) || r.agentId.toLowerCase().includes(q));
    }
    if (filters.payoutStatus !== "all") data = data.filter(r => r.payout === filters.payoutStatus);
    return data;
  }, [filters]);

  const totalPayable = records.reduce((a, r) => a + r.commission, 0);
  const pageData = records.slice((page - 1) * perPage, page * perPage);

  if (drillRecord) {
    return <AgentCommissionDrilldown record={drillRecord} onBack={() => setDrillRecord(null)} />;
  }

  return (
    <div>
      <MyFuelKPIHeader />

      {/* Toolbar — DS pattern */}
      <div className="hac-toolbar">
        <div className="hac-toolbar-left">
          <div className="hac-search-group">
            <button className="hac-scope-pill">
              Agent <HIcon name="arrow_drop_down" size={18} color="var(--green-600)" />
            </button>
            <div className="hac-search-bar">
              <HIcon name="search" size={18} color="var(--fg-tertiary)" />
              <input className="hac-search-input" placeholder="Search by name or ID"
                value={filters.agentQ} onChange={e => setF("agentQ", e.target.value)} />
              {filters.agentQ && (
                <button className="hac-search-clear" onClick={() => setF("agentQ", "")}>
                  <HIcon name="close" size={16} color="var(--fg-tertiary)" />
                </button>
              )}
            </div>
          </div>
          <button className={"hac-filter-btn" + (hasActiveFilters ? " active" : "")} onClick={toggleFilter}>
            <HIcon name="tune" size={18} />
            Filter
            {activeCount > 0 && <span className="hac-filter-badge">{activeCount}</span>}
          </button>
        </div>
        <HExportMenu />
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="hac-filter-panel">
          <div className="hac-filter-grid">
            <div className="hac-filter-field">
              <label>Period</label>
              <select value={pending.period} onChange={e => setPending(p => ({ ...p, period:e.target.value }))}>
                {["Jun 2026","May 2026","Apr 2026","Mar 2026","Feb 2026","Jan 2026","Dec 2025","Nov 2025","Oct 2025"].map(p =>
                  <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="hac-filter-field">
              <label>SP Account</label>
              <select value={pending.spAccount} onChange={e => setPending(p => ({ ...p, spAccount:e.target.value }))}>
                <option value="">All accounts</option>
                <option>CK-PTN-001</option><option>SUM-PTN-012</option>
                <option>MEGA-PTN-007</option><option>PIN-PTN-033</option>
              </select>
            </div>
            <div className="hac-filter-field">
              <label>Payout Status</label>
              <select value={pending.payoutStatus} onChange={e => setPending(p => ({ ...p, payoutStatus:e.target.value }))}>
                <option value="all">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="hac-filter-actions">
            <button className="hac-filter-apply" onClick={applyFilters}>Apply Filters</button>
            <button className="hac-filter-reset" onClick={resetFilters}>Reset All</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="hac-count" style={{ marginBottom:8 }}>
        {records.length} agent{records.length !== 1 ? "s" : ""}
      </div>
      <div className="ml-table-wrap">
        <table className="ml-table" style={{ minWidth:780 }}>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Agent ID</th>
              <th>SP Accounts</th>
              <th>Total Volume (L)</th>
              <th>KPI Progress</th>
              <th>Commission</th>
              <th>Payout Status</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r, i) => (
              <tr key={i} onClick={() => setDrillRecord(r)} style={{ cursor:"pointer" }}>
                <td className="ml-cell-main">{r.agentName}</td>
                <td><code className="hac-code">{r.agentId}</code></td>
                <td className="ml-mono">{r.spCount}</td>
                <td className="ml-mono">{r.totalLiters.toLocaleString()}</td>
                <td><KPIProgress pct={r.kpiPct} actual={r.totalLiters} target={r.kpiTarget} period="Dec 1–31" /></td>
                <td className="ml-mono" style={{ fontWeight:600, color:"var(--navy-800)" }}>{HC.fmtRM(r.commission)}</td>
                <td><PayoutBadge status={r.payout} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <HPager page={page} perPage={perPage} total={records.length} onPage={setPage} onPerPage={setPerPage} />
    </div>
  );
}

/* ─── Subscription Commission Tab (coming soon) ──────────────── */
function SubscriptionCommissionTab() {
  return (
    <div className="hm-coming-soon">
      <div className="hm-cs-icon">
        <HIcon name="workspace_premium" size={34} color="var(--fg-tertiary)" />
      </div>
      <div className="hm-cs-title">Subscription Commission</div>
      <div className="hm-cs-sub">
        Subscription-based commission tracking is currently in development and will be available in an upcoming release.
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center", padding:"10px 18px", background:"var(--bg-muted)", borderRadius:8, marginTop:4 }}>
        <HIcon name="info" size={15} color="var(--fg-tertiary)" />
        <span style={{ fontSize:13, color:"var(--fg-secondary)" }}>Expected: Q3 2026</span>
      </div>
    </div>
  );
}

Object.assign(window, { MyFuelCommissionTab, SubscriptionCommissionTab });
