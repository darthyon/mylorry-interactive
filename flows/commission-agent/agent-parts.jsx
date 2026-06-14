// agent-parts.jsx — Shared building blocks for the Agent Commission page:
// KPI hero, table cell renderers, and the transaction drill modal.
// Composed by agent-app.jsx + agent-statements.jsx via the window.* exports below.
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
                <div className="ml-txn-card-cell">
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

Object.assign(window, { KpiHero, TierCell, KpiTierCell, SpAccountCell, TxnModal });
