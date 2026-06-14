// agent-dashboard.jsx — Agent Commission Dashboard view.
// Consumes a precomputed `model` from the app. Exports window.Dashboard.
const { useState: useStateD } = React;
const KPIProgressMeta = window.KPIProgressMeta;

function gaugeStyle(pct) {
  const clamped = Math.max(0, Math.min(100, pct));
  const deg = clamped * 3.6;
  const col = KPIProgressMeta(pct).solid;
  return { background: `conic-gradient(${col} ${deg}deg, #E9E9E9 ${deg}deg 360deg)` };
}

// KPI tier segmented bar — mirrors the Host Agent Config SegmentedProgressView:
// 10 discrete cells tinted by progress bands, with ticks at the tier boundaries.
// Ascending zones {from,to,mult,tier,isFinal} derived from the KPI thresholds.
// The visual axis is capped at 100% even if achievement exceeds target.
function kpiSegZones() {
  const asc = [...AC.KPI.thresholds].sort((a, b) => a.min - b.min);
  const axisMax = 100;
  const zones = asc.map((t, i) => ({
    from: t.min, to: asc[i + 1] ? asc[i + 1].min : axisMax,
    mult: t.mult, tier: t.tier, isFinal: i === asc.length - 1,
  }));
  return { zones, axisMax };
}
const segZoneOf = (pct, zones) => zones.find(z => pct >= z.from && pct < z.to) || zones[zones.length - 1];
const segRange = z => z.isFinal ? `≥ ${z.from}%` : `${z.from}%–${z.to}%`;
const segMetaOf = z => KPIProgressMeta(z?.mult >= 100 ? 100 : z?.mult >= 50 ? 75 : 0);

function KpiSegBar({ pct }) {
  const { zones, axisMax } = kpiSegZones();
  const CELLS = 10, STEP = axisMax / CELLS;
  const pos = p => Math.min(p, axisMax) / axisMax * 100;
  const ticks = zones.filter(z => z.from > 0).map(z => z.from);
  const finalZone = zones[zones.length - 1];
  const cells = Array.from({ length: CELLS }, (_, i) => {
    const from = i * STEP;
    const sampled = segZoneOf(from + STEP / 2, zones) || {};
    const z = i === CELLS - 1 && finalZone?.from >= axisMax ? finalZone : sampled;
    const meta = segMetaOf(z);
    const reached = pct > from;
    return {
      bg: reached ? meta.solid : meta.fill,
      tier: z.tier, range: z.from != null ? segRange(z) : "", mult: z.mult,
    };
  });
  return (
    <div className="hac-kpiaxis" style={{ marginTop: 4 }}>
      <div className="hac-kpiseg">
        {cells.map((c, i) => (
          <div key={i} className="hac-kpiseg-cell ml-tooltip-wrap" style={{ background: c.bg }}>
            {c.tier && (
              <span className="ml-tooltip"><b>{c.tier}</b><br />{c.range} · {c.mult}% multiplier</span>
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
  );
}

function KpiHero({ m, visual }) {
  const pct = m.achievementPct;
  const progressMeta = KPIProgressMeta(pct);

  const head = (
    <div className="ml-kpi-headrow">
      <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
        <div className="ml-kpi-title">KPI Progress</div>
        <div className="ml-tooltip-wrap">
          <button className="ml-info-btn" tabIndex={0}><Icon name="info" size={15} /></button>
          <div className="ml-tooltip">Evaluation period: {AC.KPI.windowLabel}. This period determines the KPI multiplier applied to commission.</div>
        </div>
      </div>
      <KpiTierChip mult={m.mult} />
    </div>
  );

  const nums = (
    <div className="ml-kpi-nums">
      <div><span className="ml-k">Portfolio volume</span><b style={{color:"var(--navy-800)"}}>{AC.fmtL(m.actual)}</b></div>
      <div><span className="ml-k">Target volume</span><b style={{color:"var(--navy-800)"}}>{AC.fmtL(m.target)}</b></div>
      <div>
        <span className="ml-k">Target KPI</span>
        <b style={{color:progressMeta.solid, display:"inline-flex", alignItems:"center", gap:4}}>
          <span>{pct.toFixed(1)}%</span>
          {progressMeta.isAchieved && <span style={{ fontSize:11, lineHeight:1 }}>✓</span>}
        </b>
      </div>
      <div><span className="ml-k">Applied multiplier</span><b style={{color:"var(--navy-800)"}}>{m.mult}%</b></div>
    </div>
  );

  const formulaInner = (
    <div className="ml-formula">
      <span className="ml-f-step"><span className="ml-k">Base Commission</span><b>{AC.fmtRM(m.summary.base)}</b><span className="ml-f-note">Σ volume × tier rate</span></span>
      <Icon name="close" size={14} color="#999AA5" />
      <span className="ml-f-step"><span className="ml-k">KPI multiplier</span><b>{m.mult}%</b><span className="ml-f-note">{m.note}</span></span>
      <span style={{fontSize:16,color:"#999AA5",fontWeight:600,lineHeight:1,flexShrink:0}}>=</span>
      <span className="ml-f-step ml-f-total"><span className="ml-k">Commission</span><b className="ml-green">{AC.fmtRM(m.summary.commission)}</b><span className="ml-f-note">this month</span></span>
    </div>
  );

  return (
    <div className="ml-kpi-hero col">
      <div className="ml-kpi-body">
        {head}
        <div className="ml-kpi-mainrow">
          <div className="ml-kpi-metrics-col">
            {nums}
            <div className="ml-kpi-progress-wrap">
              <KpiSegBar pct={pct} />
            </div>
          </div>
          <div className="ml-kpi-formula-col">
            {formulaInner}
          </div>
        </div>
      </div>
    </div>
  );
}
// Volume range for a tier, e.g. "45,001 L and above".
function tierRange(t) {
  const from = t.from.toLocaleString("en-US");
  if (t.to == null) return from + " L and above";
  return from + " – " + t.to.toLocaleString("en-US") + " L";
}

// Commission Tier — rate primary, tier secondary, range on hover.
function TierCell({ r }) {
  return (
    <span className="ml-tooltip-wrap">
      <span className="ml-stack ml-tier-cell">
        <span className="ml-tier-rate">{AC.fmtRate(r.tier.rate)}</span>
        <span className="ml-sub-xs">{r.tier.label}</span>
      </span>
      <span className="ml-tooltip">{r.tier.label} · {tierRange(r.tier)}</span>
    </span>
  );
}

// KPI Tier — applied multiplier primary; "New SP Account" sublabel for new/pending.
function KpiTierCell({ r }) {
  return (
    <div className="ml-stack">
      <span className="ml-mult">{r.appliedMult}%</span>
      <span className="ml-sub-xs">{(r.isException || r.pending) ? "New SP Account" : "KPI tier"}</span>
    </div>
  );
}

// Commission Validity — activation/validity only, never payout state.
function ValidityCell({ r, expiring }) {
  if (r.pending) {
    return (
      <div className="ml-stack">
        <span className="ml-validity-date">Not active</span>
        <Badge kind="pending">Pending activation</Badge>
      </div>
    );
  }
  return (
    <div className="ml-stack">
      <span className="ml-validity-date">{r.end}</span>
      {expiring
        ? <Badge kind="expire">Expiring ≤60d</Badge>
        : <span className="ml-sub-xs">Active window</span>}
    </div>
  );
}

// Month picker — drives the commission summary + SP table (not KPI).
// Mirrors the Host MyFuel Commission month selector (floating-label select).
function MonthSelect({ history, value, onChange }) {
  return (
    <div className="hm-month-group">
      <label className="hm-month-label">Month</label>
      <select className="hm-month-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {[...history].reverse().map((h) => <option key={h.key} value={h.key}>{h.label}</option>)}
      </select>
    </div>
  );
}

function TxnModal({ row, monthLabel = "Dec 2026", onClose }) {
  if (!row) return null;
  const n = 20;
  const per = Math.round(row.volume / n / 10) * 10;
  const allTxns = Array.from({ length: n }).map((_, i) => {
    const vol = per + (i - 2) * 120;
    const amt = vol * row.tier.rate * (row.appliedMult / 100);
    return { date: `${String(1 + i).padStart(2, "0")} ${monthLabel}`, ref: `TXN-${row.sp.split("-")[0]}-${4810 + i}`, vol, amt };
  });
  const [modalPage, setModalPage] = React.useState(1);
  const [modalPerPage, setModalPerPage] = React.useState(5);
  const txns = allTxns.slice((modalPage - 1) * modalPerPage, modalPage * modalPerPage);
  return (
    <div className="ml-modal-overlay" onClick={onClose}>
      <div className="ml-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ml-modal-head">
          <div>
            <div className="ml-modal-title">{row.org}</div>
            <div className="ml-modal-sub">{row.sp} · settled transactions · {monthLabel}</div>
          </div>
          <button className="ml-icon-btn" onClick={onClose}><Icon name="close" size={20} /></button>
        </div>
        <div className="ml-modal-summary">
          <div><span className="ml-k">Volume</span><b>{AC.fmtL(row.volume)}</b></div>
          <div><span className="ml-k">Tier rate</span><b>{AC.fmtRate(row.tier.rate)}</b></div>
          <div><span className="ml-k">Multiplier</span><b>{row.appliedMult}%</b></div>
          <div><span className="ml-k">Commission</span><b className="ml-green">{AC.fmtRM(row.commission)}</b></div>
        </div>
        <div className="ml-modal-body">
          {txns.map((t, i) => (
            <div key={i} className="ml-txn-card">
              <div className="ml-txn-card-row">
                <div className="ml-txn-card-cell">
                  <span className="ml-k">Date</span>
                  <span className="ml-txn-value">{t.date}</span>
                </div>
                <div className="ml-txn-card-cell">
                  <span className="ml-k">Reference</span>
                  <span className="ml-txn-value ml-mono">{t.ref}</span>
                </div>
              </div>
              <div className="ml-txn-card-row">
                <div className="ml-txn-card-cell">
                  <span className="ml-k">Volume</span>
                  <span className="ml-txn-value">{AC.fmtL(t.vol)}</span>
                </div>
                <div className="ml-txn-card-cell" style={{textAlign:"right"}}>
                  <span className="ml-k">Commission</span>
                  <span className="ml-txn-value ml-green">{AC.fmtRM(t.amt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="ml-modal-pager">
          <Pager page={modalPage} perPage={modalPerPage} total={allTxns.length}
            onPage={setModalPage} onPerPage={(v) => { setModalPerPage(v); setModalPage(1); }}
            perPageOptions={[5, 10, 20]} />
        </div>
        <div className="ml-modal-foot"><Icon name="info" size={15} color="#999AA5" /> Commission is calculated on confirmed (settled) Petron transactions only.</div>
      </div>
    </div>
  );
}

// SP Account label — org name (primary), SP number with Petron mark (secondary).
function SpAccountCell({ r }) {
  return (
    <div>
      <div className="ml-cell-main">{r.org}</div>
      <div className="ml-cell-id ml-sp-id"><PetronLogo size={14} />{r.sp}</div>
    </div>
  );
}

function Dashboard({ model, history, t }) {
  const [drawer, setDrawer] = useStateD(null);
  const [spPage, setSpPage] = useStateD(1);
  const [spPerPage, setSpPerPage] = useStateD(10);
  // Month filter — defaults to the latest month; drives summary + SP table only.
  const [monthKey, setMonthKey] = useStateD(history[history.length - 1].key);
  const month = history.find((h) => h.key === monthKey) || history[history.length - 1];
  const expiring = t.timeMachine === "dec2028";
  const m = model; // KPI Progress stays on the live evaluation model (not month-filtered)
  const spRows = month.rows.slice((spPage - 1) * spPerPage, spPage * spPerPage);
  const onMonth = (k) => { setMonthKey(k); setSpPage(1); };
  const cardsCls = month.newCount > 0 ? "ml-cards4" : "ml-cards3";

  return (
    <div className="ml-view">
      {/* 1 — KPI progress hero (top, NOT month-filtered) */}
      <KpiHero m={m} visual={t.kpiVisual} />

      {/* 2 — Month-filtered commission summary */}
      <div className="ml-month-head">
        <div className="ml-month-head-title">
          <Icon name="payments" size={18} color="#00AA4F" />
          <span>Commission Overview</span>
        </div>
        <MonthSelect history={history} value={monthKey} onChange={onMonth} />
      </div>
      <div className={"ml-row " + cardsCls}>
        <SummaryCard icon="payments" title="Total Commission" sub={month.label + " · provisional"}
          value={AC.fmtRM(month.summary.commission)} />
        <SummaryCard icon="local_gas_station" title="Total Volume" sub={"MyFuel · " + month.label}
          value={AC.fmtL(month.volume)} />
        <SummaryCard icon="account_balance" title="Active SP Accounts" sub="Transacting this month"
          value={String(month.activeCount)} />
        {month.newCount > 0 && (
          <SummaryCard icon="fiber_new" title="New SP Accounts" sub="Activated this month"
            value={String(month.newCount)} accent="#00AA4F" />
        )}
      </div>

      {/* 3 — Commission by SP Account (month-filtered) */}
      <div className="ml-month-head" style={{ marginTop: 20 }}>
        <div className="ml-month-head-title">
          <Icon name="receipt_long" size={18} color="#00AA4F" />
          <span>Commission by SP Account</span>
        </div>
        <span className="ml-synced"><Icon name="sync" size={14} color="#999AA5" /> Last synced {AC.AGENT.lastSync}</span>
      </div>
      <div className="hac-count" style={{ marginBottom:8 }}>
        {month.rows.length} SP account{month.rows.length !== 1 ? "s" : ""} · {month.label}
      </div>

      {/* Desktop table */}
      <div className="ml-table-wrap ml-desk-only">
        <table className="ml-table">
          <thead>
            <tr>
              <th style={{minWidth:240}}>SP Account</th>
              <th>Volume</th>
              <th>Commission Tier</th>
              <th>Base Commission</th>
              <th>KPI Tier</th>
              <th style={{textAlign:"right"}}>Final Commission</th>
              <th>Commission Validity</th>
              <th style={{width:40}}></th>
            </tr>
          </thead>
          <tbody>
            {spRows.map((r) => (
              <tr key={r.sp} onClick={() => setDrawer(r)}>
                <td><SpAccountCell r={r} /></td>
                <td>{AC.fmtL(r.volume)}</td>
                <td><TierCell r={r} /></td>
                <td>{AC.fmtRM(r.base)}</td>
                <td><KpiTierCell r={r} /></td>
                <td style={{textAlign:"right"}}><CurrencyPill>{AC.fmtRM(r.commission)}</CurrencyPill></td>
                <td><ValidityCell r={r} expiring={expiring && r.end.includes("2028")} /></td>
                <td><Icon name="chevron_right" size={18} color="#BBBBBB" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={spPage} perPage={spPerPage} total={month.rows.length} onPage={setSpPage} onPerPage={(v) => { setSpPerPage(v); setSpPage(1); }} perPageOptions={[10, 50, 100]} />

      {/* ── Mobile cards — same hierarchy: SP → Volume → Tier → Actual → KPI Tier → Final ── */}
      <div className="ml-sp-mob">
        {spRows.map((r) => (
          <div key={r.sp} className="ml-sp-mob-card" onClick={() => setDrawer(r)}>
            <div className="ml-sp-mob-head">
              <SpAccountCell r={r} />
              <CurrencyPill>{AC.fmtRM(r.commission)}</CurrencyPill>
            </div>
            <div className="ml-sp-mob-metas">
              <div><span className="ml-k">Volume</span><b>{AC.fmtL(r.volume)}</b></div>
              <div><span className="ml-k">Commission Tier</span>
                <b>{AC.fmtRate(r.tier.rate)}</b>
                <span className="ml-sub-xs" style={{display:"block"}}>{r.tier.label}</span>
              </div>
              <div><span className="ml-k">Base Commission</span><b>{AC.fmtRM(r.base)}</b></div>
              <div><span className="ml-k">KPI Tier</span>
                <b>{r.appliedMult}%</b>
                {(r.isException || r.pending) && <span className="ml-sub-xs" style={{display:"block"}}>New SP Account</span>}
              </div>
              <div><span className="ml-k">Final Commission</span><b className="ml-green">{AC.fmtRM(r.commission)}</b></div>
            </div>
          </div>
        ))}
        <div style={{fontSize:12,color:"var(--fg-tertiary)",paddingTop:4}}>
          {month.activeCount} accounts · actual × KPI {month.mult}% = <b className="ml-green">{AC.fmtRM(month.summary.commission)}</b>
        </div>
        <Pager page={spPage} perPage={spPerPage} total={month.rows.length} onPage={setSpPage} onPerPage={(v) => { setSpPerPage(v); setSpPage(1); }} perPageOptions={[10, 50, 100]} />
      </div>

      <TxnModal row={drawer} monthLabel={month.label} onClose={() => setDrawer(null)} />
    </div>
  );
}

Object.assign(window, { Dashboard });
