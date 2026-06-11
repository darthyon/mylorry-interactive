// agent-dashboard.jsx — Agent Commission Dashboard view.
// Consumes a precomputed `model` from the app. Exports window.Dashboard.
const { useState: useStateD } = React;

function gaugeStyle(pct) {
  const clamped = Math.max(0, Math.min(100, pct));
  const deg = clamped * 3.6;
  const col = pct >= 100 ? "#00AA4F" : pct >= 75 ? "#0081AA" : "#FF7476";
  return { background: `conic-gradient(${col} ${deg}deg, #E9E9E9 ${deg}deg 360deg)` };
}

// KPI tier threshold track (recommended) — shows the three bands, the 75% / 100%
// thresholds, and a marker for where the agent currently sits.
const TT_MAX = 125;
function TierTrack({ pct }) {
  const [tipZone, setTipZone] = React.useState(null);
  const pos = Math.min(pct, TT_MAX) / TT_MAX * 100;
  const markCol = pct >= 100 ? "#00AA4F" : pct >= 75 ? "#0081AA" : "#D14B4D";
  const zones = [
    { key: "z3", cls: "z3", label: "Tier 3", detail: "<75% · 0%",       width: (75 / TT_MAX * 100) + "%" },
    { key: "z2", cls: "z2", label: "Tier 2", detail: "75–100% · 50%",   width: (25 / TT_MAX * 100) + "%" },
    { key: "z1", cls: "z1", label: "Tier 1", detail: "≥100% · 100%",    width: (25 / TT_MAX * 100) + "%" },
  ];
  return (
    <div className="ml-tt">
      <div className="ml-tt-bar">
        {zones.map(z => (
          <div key={z.key} className={"ml-tt-zone " + z.cls} style={{ width: z.width }}
            onClick={() => setTipZone(tipZone === z.key ? null : z.key)}>
            <span className="ml-tz-full">{z.label}: {z.detail}</span>
            <span className="ml-tz-short">{z.label}</span>
            {tipZone === z.key && <div className="ml-tz-tip">{z.detail}</div>}
          </div>
        ))}
        <div className="ml-tt-marker" style={{ left: pos + "%", borderColor: markCol }}>
          <div className="ml-tt-flag" style={{ background: markCol }}>{pct.toFixed(1)}%</div>
        </div>
      </div>
      <div className="ml-tt-ticks">
        <span style={{ left: "0%" }}>0%</span>
        <span style={{ left: (75 / TT_MAX * 100) + "%" }}>75%</span>
        <span style={{ left: (100 / TT_MAX * 100) + "%" }}>100%</span>
        <span style={{ left: "100%" }}>{TT_MAX}%</span>
      </div>
    </div>
  );
}

function KpiHero({ m, visual }) {
  const [calcOpen, setCalcOpen] = React.useState(false);
  const pct = m.achievementPct;
  const fillCol = pct >= 100 ? "#00AA4F" : pct >= 75 ? "#0081AA" : "#FF7476";

  const head = (
    <div className="ml-kpi-headrow">
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <div className="ml-kpi-title">KPI Progress — Evaluation {AC.KPI.windowLabel}</div>
        <div className="ml-tooltip-wrap">
          <button className="ml-info-btn" tabIndex={0}><Icon name="info" size={15} /></button>
          <div className="ml-tooltip">Evaluation is counted from 1 Dec – 31 Dec 2026 and determines next year's commission multiplier</div>
        </div>
      </div>
      <KpiTierChip mult={m.mult} />
    </div>
  );

  const nums = (
    <div className="ml-kpi-nums">
      <div><span className="ml-k">Portfolio volume</span><b style={{color:"var(--navy-800)"}}>{AC.fmtL(m.actual)}</b></div>
      <div><span className="ml-k">Target volume</span><b style={{color:"var(--navy-800)"}}>{AC.fmtL(m.target)}</b></div>
      <div><span className="ml-k">Target achieved</span><b className="ml-green">{pct.toFixed(1)}%</b></div>
      <div><span className="ml-k">Applied multiplier</span><b className="ml-green">{m.mult}%</b></div>
    </div>
  );

  const formulaInner = (
    <div className="ml-formula">
      <span className="ml-f-step"><span className="ml-k">Base commission</span><b>{AC.fmtRM(m.summary.base)}</b><span className="ml-f-note">Σ volume × tier rate</span></span>
      <Icon name="close" size={14} color="#999AA5" />
      <span className="ml-f-step"><span className="ml-k">KPI multiplier</span><b>{m.mult}%</b><span className="ml-f-note">{m.note}</span></span>
      <span style={{fontSize:16,color:"#999AA5",fontWeight:600,lineHeight:1,flexShrink:0}}>=</span>
      <span className="ml-f-step ml-f-total"><span className="ml-k">Commission</span><b className="ml-green">{AC.fmtRM(m.summary.commission)}</b><span className="ml-f-note">this month</span></span>
    </div>
  );

  const calcCard = (
    <div className="ml-kpi-calc-card">
      <button className="ml-accordion-btn" onClick={() => setCalcOpen(v => !v)}>
        <Icon name={calcOpen ? "expand_less" : "expand_more"} size={16} />
        {calcOpen ? "Hide calculation" : "View calculation"}
      </button>
      <div className={"ml-accordion-body " + (calcOpen ? "open" : "closed")}>
        <div style={{paddingTop:14,display:"flex",flexDirection:"column",gap:14}}>
          <div className="ml-kpi-calc-step">
            <span className="ml-k">Base commission</span>
            <b>{AC.fmtRM(m.summary.base)}</b>
            <span className="ml-note">Σ volume × tier rate</span>
          </div>
          <div className="ml-kpi-calc-row">
            <span className="ml-kpi-calc-op">×</span>
            <div className="ml-kpi-calc-step">
              <span className="ml-k">KPI multiplier</span>
              <b>{m.mult}%</b>
              <span className="ml-note">{m.note}</span>
            </div>
          </div>
          <div className="ml-kpi-calc-divider" />
          <div className="ml-kpi-calc-row">
            <span className="ml-kpi-calc-op eq">=</span>
            <div className="ml-kpi-calc-step ml-kpi-calc-total">
              <span className="ml-k">Commission this month</span>
              <b>{AC.fmtRM(m.summary.commission)}</b>
              <span className="ml-note">provisional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (visual === "gauge") {
    return (
      <div className="ml-kpi-hero">
        <div className="ml-kpi-gauge">
          <div className="ml-gauge" style={gaugeStyle(pct)}>
            <div className="ml-gauge-inner">
              <div className="ml-gauge-pct">{pct.toFixed(1)}%</div>
              <div className="ml-gauge-cap">achieved</div>
            </div>
          </div>
        </div>
        <div className="ml-kpi-body">
          {head}
          <div className="ml-kpi-bar"><div className="ml-kpi-fill" style={{ width: Math.min(100, pct) + "%", background: fillCol }} /><div className="ml-kpi-target" style={{ left: "100%" }} /></div>
          {nums}{formulaInner}
        </div>
      </div>
    );
  }

  // Track visual — single column, calculation below
  return (
    <div className="ml-kpi-hero col">
      <div className="ml-kpi-body">
        {head}
        {nums}
        <TierTrack pct={pct} />
      </div>
      <div style={{marginTop:12,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
        <button className="ml-accordion-btn" onClick={() => setCalcOpen(v => !v)}>
          <Icon name={calcOpen ? "expand_less" : "expand_more"} size={16} />
          {calcOpen ? "Hide calculation" : "View calculation"}
        </button>
        <div className={"ml-accordion-body " + (calcOpen ? "open" : "closed")} style={{width:"100%"}}>
          {formulaInner}
        </div>
      </div>
    </div>
  );
}
function ExceptionCell({ r }) {
  if (r.isException) {
    const label = r.exception.mode === "custom"
      ? `${r.exception.rate}% · custom`
      : `${r.exception.rate}% · auto`;
    return (
      <div className="ml-stack">
        <Badge kind="new">New org</Badge>
        <span className="ml-sub-xs">{label}</span>
      </div>
    );
  }
  return (
    <div className="ml-stack">
      <span className="ml-mult">{r.appliedMult}%</span>
      <span className="ml-sub-xs">KPI tier</span>
    </div>
  );
}

function ValidityCell({ r, expiring }) {
  return (
    <div className="ml-stack">
      <span className="ml-validity-date">{r.end}</span>
      {expiring
        ? <Badge kind="expire">Expiring ≤60d</Badge>
        : <span className="ml-sub-xs">Active window</span>}
    </div>
  );
}

function TxnModal({ row, onClose }) {
  if (!row) return null;
  const n = 20;
  const per = Math.round(row.volume / n / 10) * 10;
  const allTxns = Array.from({ length: n }).map((_, i) => {
    const vol = per + (i - 2) * 120;
    const amt = vol * row.tier.rate * (row.appliedMult / 100);
    return { date: `${2 + i * 5} Dec 2026`, ref: `TXN-${row.sp.split("-")[0]}-${4810 + i}`, vol, amt };
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
            <div className="ml-modal-sub">{row.sp} · settled transactions · Dec 2026</div>
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

function Dashboard({ model, t }) {
  const [drawer, setDrawer] = useStateD(null);
  const [spPage, setSpPage] = useStateD(1);
  const [spPerPage, setSpPerPage] = useStateD(10);
  const expiring = t.timeMachine === "dec2028";
  const m = model;
  const pct = m.achievementPct;
  const spRows = m.rows.slice((spPage - 1) * spPerPage, spPage * spPerPage);

  return (
    <div className="ml-view">
      {/* Summary cards */}
      <div className="ml-row ml-cards3">
        <SummaryCard icon="payments" title="Commission · This Month" sub="Dec 2026 · provisional"
          value={AC.fmtRM(m.summary.commission)} trend={{ dir: "up", val: "8%" }} />
        <SummaryCard icon="local_gas_station" title="Portfolio Volume" sub="MTD · 6 SP accounts"
          value={AC.fmtL(m.actual)} trend={{ dir: "up", val: "4%" }} />
        <SummaryCard icon="account_balance" title="Active SP Accounts" sub="Assigned to you"
          value={String(m.rows.length)} accent="#0081AA" />
      </div>

      {/* KPI progress hero — NEW component */}
      <KpiHero m={m} visual={t.kpiVisual} />

      {/* SP breakdown */}
      <div className="ml-card">
        <CardHead icon="receipt_long" title="Commission by SP Account" sub="December 2026 · click a row for transaction detail"
          right={<span className="ml-synced"><Icon name="sync" size={14} color="#999AA5" /> Last synced {AC.AGENT.lastSync}</span>} />

        {/* Desktop table */}
        <div className="ml-table-wrap ml-desk-only">
          <table className="ml-table">
            <thead>
              <tr>
                <th style={{minWidth:220}}>SP Account</th>
                <th>Volume</th>
                <th>Tier · rate</th>
                <th>Base</th>
                <th>Multiplier</th>
                <th>Validity</th>
                <th style={{textAlign:"right"}}>Commission</th>
                <th style={{width:40}}></th>
              </tr>
            </thead>
            <tbody>
              {spRows.map((r) => (
                <tr key={r.sp} onClick={() => setDrawer(r)}>
                  <td><div className="ml-cell-main">{r.org}</div><div className="ml-cell-id">{r.sp}</div></td>
                  <td>{AC.fmtL(r.volume)}</td>
                  <td><span className={"ml-tier-tag t" + r.tier.id}>{r.tier.label}</span><div className="ml-sub-xs">{AC.fmtRate(r.tier.rate)}</div></td>
                  <td>{AC.fmtRM(r.base)}</td>
                  <td><ExceptionCell r={r} /></td>
                  <td><ValidityCell r={r} expiring={expiring && r.end.includes("2028")} /></td>
                  <td style={{textAlign:"right"}}><CurrencyPill>{AC.fmtRM(r.commission)}</CurrencyPill></td>
                  <td><Icon name="chevron_right" size={18} color="#BBBBBB" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={spPage} perPage={spPerPage} total={m.rows.length} onPage={setSpPage} onPerPage={(v) => { setSpPerPage(v); setSpPage(1); }} perPageOptions={[10, 50, 100]} />

        {/* ── Mobile cards ── */}
        <div className="ml-sp-mob">
          {spRows.map((r) => (
            <div key={r.sp} className="ml-sp-mob-card" onClick={() => setDrawer(r)}>
              <div className="ml-sp-mob-head">
                <div>
                  <div className="ml-cell-main">{r.org}</div>
                  <div className="ml-cell-id">{r.sp}</div>
                </div>
                <CurrencyPill>{AC.fmtRM(r.commission)}</CurrencyPill>
              </div>
              <div className="ml-sp-mob-metas">
                <div><span className="ml-k">Volume</span><b>{AC.fmtL(r.volume)}</b></div>
                <div><span className="ml-k">Tier · rate</span>
                  <span className={"ml-tier-tag t" + r.tier.id} style={{display:"block",marginTop:2}}>{r.tier.label}</span>
                </div>
                <div><span className="ml-k">Base</span><b>{AC.fmtRM(r.base)}</b></div>
              </div>
            </div>
          ))}
          <div style={{fontSize:12,color:"var(--fg-tertiary)",paddingTop:4}}>
            Total {m.rows.length} accounts · base × KPI {m.mult}% = <b className="ml-green">{AC.fmtRM(m.summary.commission)}</b>
          </div>
          <Pager page={spPage} perPage={spPerPage} total={m.rows.length} onPage={setSpPage} onPerPage={(v) => { setSpPerPage(v); setSpPage(1); }} perPageOptions={[10, 50, 100]} />
        </div>
      </div>

      <TxnModal row={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}

Object.assign(window, { Dashboard });
