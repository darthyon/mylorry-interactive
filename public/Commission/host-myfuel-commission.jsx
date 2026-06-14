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

/* ─── KPI attainment bar ─────────────────────────────────────── */
function KPIBar({ pct }) {
  const col = pct >= 100 ? "var(--green-600)" : pct >= 75 ? "var(--amber-500)" : "var(--red-400)";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:56, height:6, background:"var(--bg-muted)", borderRadius:3, overflow:"hidden", flexShrink:0 }}>
        <div style={{ height:"100%", width:Math.min(pct, 100)+"%", background:col, borderRadius:3 }} />
      </div>
      <span style={{ fontSize:13, fontWeight:600, color:col, whiteSpace:"nowrap" }}>{pct}%</span>
    </div>
  );
}

/* ─── Chart axis helpers ─────────────────────────────────────── */
function chartCompact(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(v % 1e6 === 0 ? 0 : 1) + "M";
  if (v >= 1e3) return Math.round(v / 1e3) + "K";
  return String(Math.round(v));
}
function chartNiceMax(max) {
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 1.5 ? 1.5 : n <= 2 ? 2 : n <= 2.5 ? 2.5
            : n <= 3 ? 3 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 7.5 ? 7.5 : 10;
  return step * pow;
}

/* ─── Trend bar chart — Volume / Amount toggle + tooltip ──────── */
function TrendBarChart({ data, title, subtitle, defaultMetric = "volume", icon = "history" }) {
  const [metric, setMetric] = useMFC(defaultMetric);
  const [hover, setHover]   = useMFC(null);
  const TICKS = 4;

  const valOf   = (d) => (metric === "volume" ? d.volume : d.amount);
  const niceMax = chartNiceMax(Math.max(...data.map(valOf), 1));
  const fmtVal  = (v) => (metric === "volume" ? HC.fmtL(v) : HC.fmtRM(v));
  const fmtAxis = (v) => (metric === "volume" ? chartCompact(v) : "RM " + chartCompact(v));

  return (
    <div className="ml-card hac-detail-card hm-chart-card">
      <div className="hm-chart-head">
        <div className="hm-chart-title-wrap">
          <div className="hm-stat-icon"><HIcon name={icon} size={18} color="#00AA4F" /></div>
          <div>
            <div className="hm-chart-title">{title}</div>
            {subtitle && <div className="hm-chart-sub">{subtitle}</div>}
          </div>
        </div>
        <div className="hm-seg" role="tablist">
          <button className={"hm-seg-btn" + (metric === "volume" ? " active" : "")}
            onClick={() => setMetric("volume")}>Volume</button>
          <button className={"hm-seg-btn" + (metric === "amount" ? " active" : "")}
            onClick={() => setMetric("amount")}>Amount</button>
        </div>
      </div>

      <div className="hm-chart-body">
        <div className="hm-chart-yaxis">
          {Array.from({ length:TICKS + 1 }).map((_, i) => (
            <div key={i} className="hm-chart-ytick">{fmtAxis(niceMax * (TICKS - i) / TICKS)}</div>
          ))}
        </div>
        <div className="hm-chart-plot">
          <div className="hm-chart-grid">
            {Array.from({ length:TICKS + 1 }).map((_, i) => <div key={i} className="hm-chart-gridline" />)}
          </div>
          <div className="hm-chart-bars">
            {data.map((d, i) => (
              <div key={i} className="hm-chart-col"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onClick={() => setHover(h => (h === i ? null : i))}>
                <div className={"hm-chart-bar-track" + (hover === i ? " active" : "")}>
                  <div className={"hm-chart-bar" + (hover === i ? " active" : "")}
                    style={{ height:(valOf(d) / niceMax * 100) + "%" }} />
                  {hover === i && (
                    <div className="hm-chart-tip">
                      <div className="hm-chart-tip-val">{fmtVal(valOf(d))}</div>
                      <div className="hm-chart-tip-period">{(metric === "volume" ? "Volume" : "Amount") + " · " + d.period}</div>
                    </div>
                  )}
                </div>
                <div className="hm-chart-xlabel">{d.period}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MyFuel KPI header strip ────────────────────────────────── */
function MyFuelKPIHeader() {
  const s = HC.MYFUEL_SUMMARY;
  const recs = HC.MYFUEL_RECORDS;
  const agents = HC.AGENTS || [];
  const avgKpiSource = recs.filter(r => r.kpiPhase !== "future");
  const avgKpi = avgKpiSource.length
    ? avgKpiSource.reduce((a, r) => a + r.kpiPct, 0) / avgKpiSource.length
    : 0;
  const activeAgents = agents.filter(a => a.status === "active").length;
  const pendingTermination = agents.filter(a => a.status === "terminating").length;
  const totalAgents = activeAgents + pendingTermination;
  return (
    <div className="hm-kpi-strip">
      <div className="hm-stat-card-a">
        <div className="hm-stat-header">
          <div className="hm-stat-header-left">
            <div className="hm-stat-icon">
              <HIcon name="payments" size={18} color="#00AA4F" />
            </div>
            <div>
              <div className="hm-stat-title">Total Commission Payable</div>
              <div className="hm-stat-subtitle">{s.period}</div>
            </div>
          </div>
        </div>
        <div className="hm-stat-value-row">
          <span className="hm-stat-value">{HC.fmtRM(s.totalPayable)}</span>
        </div>
      </div>

      <div className="hm-stat-card-a">
        <div className="hm-stat-header">
          <div className="hm-stat-header-left">
            <div className="hm-stat-icon">
              <HIcon name="group" size={18} color="#00AA4F" />
            </div>
            <div>
              <div className="hm-stat-title">Total Agents</div>
              <div className="hm-stat-subtitle">{s.period}</div>
            </div>
          </div>
        </div>
        <div className="hm-stat-value-row">
          <span className="hm-stat-value">{totalAgents}</span>
        </div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:2 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            <span style={{ fontSize:11, fontWeight:600, color:"var(--fg-tertiary)", textTransform:"uppercase", letterSpacing:".04em" }}>Active</span>
            <span style={{ fontSize:14, fontWeight:700, color:"var(--fg-primary)" }}>{activeAgents}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            <span style={{ fontSize:11, fontWeight:600, color:"var(--fg-tertiary)", textTransform:"uppercase", letterSpacing:".04em" }}>Pending termination</span>
            <span style={{ fontSize:14, fontWeight:700, color:"var(--fg-primary)" }}>{pendingTermination}</span>
          </div>
        </div>
      </div>

      <div className="hm-stat-card-a">
          <div className="hm-stat-header">
            <div className="hm-stat-header-left">
              <div className="hm-stat-icon">
                <HIcon name="track_changes" size={18} color="#00AA4F" />
              </div>
              <div>
                <div className="hm-stat-title">Average KPI Progress</div>
                <div className="hm-stat-subtitle">Across all agents</div>
              </div>
            </div>
          </div>
          <div className="hm-stat-value-row">
            <span className="hm-stat-value">{avgKpi.toFixed(1) + "%"}</span>
          </div>
        </div>
    </div>
  );
}

/* ─── Agent Commission Drill-down ────────────────────────────── */
function AgentCommissionDrilldown({ record, onBack }) {
  const MONTHS = ["Jun 2026","May 2026","Apr 2026","Mar 2026","Feb 2026","Jan 2026","Dec 2025","Nov 2025","Oct 2025"];
  const breakdown  = HC.SP_COMMISSION_BREAKDOWN[record.agentId] || [];
  const history    = HC.COMMISSION_HISTORY[record.agentId] || HC.COMMISSION_HISTORY._default;
  const [spQ, setSpQ]   = useMFC("");
  const [month, setMonth] = useMFC(record.period);
  const [page, setPage] = useMFC(1);
  const [perPage, setPerPage] = useMFC(10);
  const onSpSearch = (v) => { setSpQ(v); setPage(1); };

  const rows = spQ
    ? breakdown.filter(b => {
        const q = spQ.toLowerCase();
        return b.org.toLowerCase().includes(q) || b.sp.toLowerCase().includes(q);
      })
    : breakdown;
  const pageRows = rows.slice((page - 1) * perPage, page * perPage);
  const totalVol   = rows.reduce((a, b) => a + b.volume, 0);
  const totalBase  = rows.reduce((a, b) => a + b.baseCommission, 0);
  const totalFinal = rows.reduce((a, b) => a + b.finalCommission, 0);

  return (
    <div>
      <div className="hac-breadcrumb">
        <button className="hac-bc-link" onClick={onBack}>
          <HIcon name="arrow_back" size={15} color="var(--green-600)" />
          Back to MyFuel Commission
        </button>
      </div>

      <div className="ml-page-head" style={{ margin:"10px 0 20px" }}>
        <div>
          <h1 className="ml-h1">{record.agentName}</h1>
          <div style={{ fontSize:12, color:"var(--fg-secondary)", marginTop:3 }}>
            {record.agentId} · {record.period}
          </div>
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

      {/* Per-SP breakdown — bare table, mirrors the agent list */}
      <div style={{ marginBottom:16 }}>
        {breakdown.length === 0 ? (
          <div style={{ padding:"32px 0", textAlign:"center", color:"var(--fg-tertiary)", fontSize:14 }}>
            <HIcon name="table_chart" size={32} color="var(--fg-disabled)" /><br/>
            <span style={{ marginTop:8, display:"block" }}>No SP account breakdown available for this agent.</span>
          </div>
        ) : (
          <>
            <div className="hac-toolbar">
              <div className="hac-toolbar-left">
                <div className="hac-search-group">
                  <button className="hac-scope-pill">
                    SP Account <HIcon name="arrow_drop_down" size={18} color="var(--green-600)" />
                  </button>
                  <div className="hac-search-bar">
                    <HIcon name="search" size={18} color="var(--fg-tertiary)" />
                    <input className="hac-search-input" placeholder="Search SP account or code"
                      value={spQ} onChange={e => onSpSearch(e.target.value)} />
                    {spQ && (
                      <button className="hac-search-clear" onClick={() => onSpSearch("")}>
                        <HIcon name="close" size={16} color="var(--fg-tertiary)" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="hm-month-group">
                  <label className="hm-month-label">Month</label>
                  <select className="hm-month-select" value={month} onChange={e => setMonth(e.target.value)}>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="hac-count" style={{ marginBottom:8 }}>
              {rows.length} SP account{rows.length !== 1 ? "s" : ""}
            </div>
            <div className="ml-table-wrap">
              <table className="ml-table" style={{ minWidth:860 }}>
                <thead>
                  <tr>
                    <th>SP Account</th>
                    <th>Volume (L)</th>
                    <th>Rate / Tier</th>
                    <th>Base Commission</th>
                    <th>KPI Multiplier</th>
                    <th>Final Commission</th>
                    <th>Commission Validity</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign:"center", padding:"24px 0", color:"var(--fg-tertiary)" }}>
                        No SP accounts match “{spQ}”.
                      </td>
                    </tr>
                  ) : pageRows.map((b, i) => (
                    <tr key={i}>
                      <td>
                        <div className="ml-cell-main">{b.org}</div>
                        <div className="ml-cell-sub"><code className="hac-code">{b.sp}</code></div>
                      </td>
                      <td className="ml-mono">{b.volume.toLocaleString()}</td>
                      <td>
                        <div className="ml-mono" style={{ fontWeight:600 }}>{HC.fmtRate(b.rate)}</div>
                        <div className="ml-cell-sub">{b.tier}</div>
                      </td>
                      <td className="ml-mono">{HC.fmtRM(b.baseCommission)}</td>
                      <td className="ml-mono">×{(b.kpiMult / 100).toFixed(2)}</td>
                      <td className="ml-mono" style={{ fontWeight:600, color:"var(--navy-800)" }}>{HC.fmtRM(b.finalCommission)}</td>
                      <td>
                        <div style={{ fontSize:12, color:"var(--fg-secondary)" }}>{b.eff} – {b.end}</div>
                        <div style={{ marginTop:4 }}><MFCommStatusBadge status={b.commissionStatus} /></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 0 && (
              <HPager page={page} perPage={perPage} total={rows.length} onPage={setPage} onPerPage={setPerPage} />
            )}
          </>
        )}
      </div>

      {/* Commission history */}
      <TrendBarChart data={history} title="Commission History" subtitle="Last 12 months" defaultMetric="volume" />
    </div>
  );
}

/* ─── MyFuel Commission Tab (root) ───────────────────────────── */
function MyFuelCommissionTab() {
  const MONTHS = ["Jun 2026","May 2026","Apr 2026","Mar 2026","Feb 2026","Jan 2026","Dec 2025","Nov 2025","Oct 2025"];
  const [drillRecord, setDrillRecord] = useMFC(null);
  const [month, setMonth]   = useMFC("Jun 2026");
  const [agentQ, setAgentQ] = useMFC("");
  const [page, setPage]     = useMFC(1);
  const [perPage, setPerPage] = useMFC(10);

  const records = useMFM(() => {
    if (!agentQ) return HC.MYFUEL_RECORDS;
    const q = agentQ.toLowerCase();
    return HC.MYFUEL_RECORDS.filter(r =>
      r.agentName.toLowerCase().includes(q) || r.agentId.toLowerCase().includes(q));
  }, [agentQ]);

  const pageData = records.slice((page - 1) * perPage, page * perPage);
  const onSearch = (v) => { setAgentQ(v); setPage(1); };

  if (drillRecord) {
    return <AgentCommissionDrilldown record={drillRecord} onBack={() => setDrillRecord(null)} />;
  }

  return (
    <div>
      {/* Portfolio commission trend */}
      <div>
        <TrendBarChart data={HC.MYFUEL_TREND} title="Commission Trend"
          subtitle={"Last 12 months · ending " + month} defaultMetric="volume" icon="bar_chart" />
      </div>

      {/* Search (filters list) + Month selector (page-level) */}
      <div className="hac-toolbar" style={{ marginTop:20 }}>
        <div className="hac-toolbar-left">
          <div className="hac-search-group">
            <button className="hac-scope-pill">
              Agent <HIcon name="arrow_drop_down" size={18} color="var(--green-600)" />
            </button>
            <div className="hac-search-bar">
              <HIcon name="search" size={18} color="var(--fg-tertiary)" />
              <input className="hac-search-input" placeholder="Search by name or ID"
                value={agentQ} onChange={e => onSearch(e.target.value)} />
              {agentQ && (
                <button className="hac-search-clear" onClick={() => onSearch("")}>
                  <HIcon name="close" size={16} color="var(--fg-tertiary)" />
                </button>
              )}
            </div>
          </div>
          <div className="hm-month-group">
            <label className="hm-month-label">Month</label>
            <select className="hm-month-select" value={month} onChange={e => setMonth(e.target.value)}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      <MyFuelKPIHeader />

      {/* Agent performance table */}
      <div className="hac-count" style={{ marginBottom:8 }}>
        {records.length} agent{records.length !== 1 ? "s" : ""}
      </div>
      <div className="ml-table-wrap">
        <table className="ml-table" style={{ minWidth:780 }}>
          <thead>
            <tr>
              <th>Agent</th>
              <th>SP Accounts</th>
              <th>Total Volume (L)</th>
              <th>KPI Progress</th>
              <th>Commission</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r, i) => (
              <tr key={i} onClick={() => setDrillRecord(r)} style={{ cursor:"pointer" }}>
                <td>
                  <div className="ml-cell-main">{r.agentName}</div>
                  <div className="ml-cell-sub"><code className="hac-code">{r.agentId}</code></div>
                </td>
                <td className="ml-mono">{r.spCount}</td>
                <td className="ml-mono">{r.totalLiters.toLocaleString()}</td>
                <td><KPIProgress pct={r.kpiPct} actual={r.totalLiters} target={r.kpiTarget} period="Dec 1–31" /></td>
                <td className="ml-mono" style={{ fontWeight:600, color:"var(--navy-800)" }}>{HC.fmtRM(r.commission)}</td>
                <td className="hm-view-cell">
                  <HIcon name="chevron_right" size={20} color="var(--fg-tertiary)" />
                </td>
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
