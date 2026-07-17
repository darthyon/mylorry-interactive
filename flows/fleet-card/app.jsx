const { useState, useEffect, useRef, useCallback } = React;
const { CalcPopover } = window.SharedShell;

/* ── Icon helper ───────────────────────────────────────────────── */
function Icon({ name, size = 20, fill = 0, style }) {
  return (
    <span className="ms" style={{
      fontSize: size,
      fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      ...style
    }}>{name}</span>
  );
}

/* ── Data ──────────────────────────────────────────────────────── */
const FUEL_SETS = {
  all:      ['95','97','100','diesel-max','diesel'],
  diesel:   ['diesel-max','diesel'],
  petrol:   ['95','97','100'],
  standard: ['95','diesel'],
};
const ROWS = [
  { id:1,  owner:'Tesla',      org:'Org 15', acc:'ORG59-SPA-MEMBER', bal:842.10,  card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:180, dm:500,   du:320, dL:12.5, mr:6640,  mm:15000, mu:8360, mL:326.6, sm:900,     su:320,     sEst:365.4,   st:'Active',   fuels: FUEL_SETS.all },
  { id:2,  owner:'Wayne Ent.', org:'Org 3',  acc:'ORG59-SPA-MEMBER', bal:842.10,  card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:255, dm:500,   du:245, dL:9.6,  mr:8520,  mm:15000, mu:6480, mL:253.1, sm:900,     su:320,     sEst:320,     st:'Active',   fuels: FUEL_SETS.diesel },
  { id:3,  owner:'Cyberdyne',  org:'Org 22', acc:'ORG59-SPA-MEMBER', bal:-158.40, card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:90,  dm:500,   du:410, dL:16.0, mr:4250,  mm:15000, mu:10750, mL:419.9, sm:null,    su:null,    sEst:null,    st:'Active',   fuels: FUEL_SETS.petrol },
  { id:4,  owner:'Globex',     org:'Org 8',  acc:'ORG59-SPA-MEMBER', bal:842.10,  card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:350, dm:500,   du:150, dL:5.9,  mr:10800, mm:15000, mu:4200, mL:164.1, sm:900,     su:320,     sEst:410.8,   st:'Active',   fuels: FUEL_SETS.all },
  { id:5,  owner:'Oscorp',     org:'Org 15', acc:'ORG59-SPA-MEMBER', bal:842.10,  card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:205, dm:500,   du:295, dL:11.5, mr:7100,  mm:15000, mu:7900, mL:308.6, sm:900,     su:320,     sEst:320,     st:'Active',   fuels: FUEL_SETS.standard },
  { id:6,  owner:'Acme Corp',  org:'Org 41', acc:'ORG59-SPA-MEMBER', bal:0,       card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:501, dm:501,   du:0,   dL:0,    mr:20001, mm:20001, mu:0,   mL:0,    sm:5000,    su:3120.5,   sEst:3480.75,   st:'Active', fuels: FUEL_SETS.all },
  { id:7,  owner:'LexCorp',    org:'Org 6',  acc:'ORG59-SPA-MEMBER', bal:-258.58, card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:500, dm:500,   du:0,   dL:0,    mr:8900,  mm:15000, mu:6100, mL:238.3, sm:900,     su:320,     sEst:320,     st:'Inactive', fuels: FUEL_SETS.diesel },
  { id:8,  owner:'Initech',    org:'Org 6',  acc:'ORG59-SPA-MEMBER', bal:-258.58, card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:500, dm:500,   du:0,   dL:0,    mr:11050, mm:15000, mu:3950, mL:154.3, sm:900,     su:320,     sEst:320,     st:'Inactive', fuels: FUEL_SETS.petrol },
  { id:9,  owner:'Stark Ind.', org:'Org 19', acc:'ORG59-SPA-MEMBER', bal:842.10,  card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:160, dm:500,   du:340, dL:13.3, mr:5800,  mm:15000, mu:9200, mL:359.4, sm:900,     su:320,     sEst:320,     st:'Active',   fuels: FUEL_SETS.all },
  { id:10, owner:'Umbrella',   org:'Org 15', acc:'ORG59-SPA-MEMBER', bal:842.10,  card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:240, dm:500,   du:260, dL:10.2, mr:7850,  mm:15000, mu:7150, mL:279.3, sm:900,     su:320,     sEst:320,     st:'Active',   fuels: FUEL_SETS.standard },
];
const N  = n => n.toLocaleString();
const NRM = n => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── TopBar ────────────────────────────────────────────────────── */
function TopBar({ onMenuClick }) {
  return (
    <header className="topbar">
      <button type="button" className="topbar-hamburger" onClick={onMenuClick} aria-label="Open menu">
        <Icon name="menu" size={22} style={{color:'#fff'}} />
      </button>
      <a href="../../index.html" title="Back to prototype library" className="topbar-logo-link">
        <img src="img_logo_white.svg" height="27" alt="MyLorry" style={{display:'block'}} />
      </a>
    </header>
  );
}

/* ── Sidebar ───────────────────────────────────────────────────── */
const MYFUEL_SUBS = [
  {icon:'grid_view',          label:'Dashboard'},
  {icon:'credit_card',        label:'Fleet Card',  href:'../fleet-card/index.html'},
  {icon:'receipt_long',       label:'Transaction', href:'../host-myfuel-transaction/index.html'},
  {icon:'redeem',             label:'Rebate'},
  {icon:'volunteer_activism', label:'Subsidy'},
  {icon:'bar_chart',          label:'Usage History'},
  {icon:'add_card',           label:'Top-Up'},
  {icon:'payment',            label:'Payment History'},
  {icon:'currency_exchange',  label:'Balance Adj.'},
  {icon:'description',        label:'Report'},
  {icon:'analytics',          label:'Usage Report'},
];

function Sidebar({ mobileOpen, onClose }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen, onClose]);

  return (
    <>
      {mobileOpen && <div className="sb-backdrop" onClick={onClose} role="presentation"></div>}
      <nav className={`sidebar${mobileOpen ? ' sb-open' : ''}`}>
      <div className="sb-card" ref={cardRef}>
        <button type="button" className="sb-mobile-close" onClick={onClose} aria-label="Close menu">
          <Icon name="close" size={18} />
        </button>
        {/* Avatar + host badge */}
        <div className="sb-ava-wrap">
          <div className="sb-ava"><Icon name="person" size={18} style={{color:'rgb(148,168,178)'}} /></div>
          <div className="sb-host-pill">host</div>
        </div>

        <div className="sb-div"></div>

        {/* HOST */}
        <span className="sb-ovl">HOST</span>
        {[
          {icon:'grid_view',       label:'Dashboard'},
          {icon:'manage_accounts', label:'Host User'},
          {icon:'swap_horiz',      label:'User Activity'},
          {icon:'support_agent',   label:'Salesperson'},
          {icon:'diamond',         label:'Subscription'},
          {icon:'campaign',        label:'Announce..'},
        ].map(({icon,label}) => (
          <div key={label} className="sb-nav">
            <Icon name={icon} size={20} /><span>{label}</span>
          </div>
        ))}

        {/* ORG */}
        <span className="sb-ovl">ORG</span>
        <div className="sb-nav"><Icon name="business_center" size={20} /><span>Organisation</span></div>
        <div className="sb-nav"><Icon name="supervisor_account" size={20} /><span style={{lineHeight:'9px'}}>Organisation User</span></div>

        {/* PRODUCT */}
        <span className="sb-ovl">PRODUCT</span>

        {/* MyFuel — expanded with gradient */}
        <div className="sb-nav sb-grad">
          <Icon name="local_gas_station" size={20} />
          <span>MyFuel</span>
          <div className="sb-chev"><Icon name="expand_less" size={11} /></div>
        </div>

        {/* MyFuel sub-items */}
        <div className="sb-sub-panel">
          {MYFUEL_SUBS.map(({icon, label, href}) => {
            const cls = `sb-sub${label === 'Fleet Card' ? ' sb-sub-act' : ''}`;
            const content = <><Icon name={icon} size={18} /><span>{label}</span></>;
            return href
              ? <a key={label} className={cls} href={href}>{content}</a>
              : <div key={label} className={cls}>{content}</div>;
          })}
        </div>

        {/* MyAdmin */}
        <div className="sb-nav">
          <Icon name="admin_panel_settings" size={20} /><span>MyAdmin</span>
          <div className="sb-chev"><Icon name="expand_more" size={11} /></div>
        </div>

        {/* MyTrip */}
        <div className="sb-nav">
          <Icon name="alt_route" size={20} /><span>MyTrip</span>
          <div className="sb-chev"><Icon name="expand_more" size={11} /></div>
        </div>

        <div className="sb-div"></div>

        {/* Bottom icons */}
        <div className="sb-nav"><Icon name="language" size={20} /></div>
        <div className="sb-nav sb-logout"><Icon name="logout" size={20} /></div>
      </div>

      {/* Collapse toggle */}
      <div className="sb-btn-col">
        <Icon name="chevron_right" size={14} />
      </div>
      </nav>
    </>
  );
}

/* ── Progress Cell ─────────────────────────────────────────────── */
function ProgressCell({ rem, max, used, liters, unit = 'RM', status, pending, failed, utype }) {
  if (utype === 'limit' && failed) {
    return <span className="fail-lbl">Update failed</span>;
  }
  if (utype === 'limit' && pending) {
    return (
      <div className="pend-cell">
        <div className="skel skel-w"></div>
        <span className="pend-lbl">Pending update</span>
      </div>
    );
  }
  if (max == null) {
    return <span className="na-lbl">N/A</span>;
  }
  const pct = Math.min(100, (rem / max) * 100);
  const isRed = status === 'Inactive';
  const rows = [
    { label: 'Limit',     value: `RM ${NRM(max)}` },
    { label: 'Used',      value: `RM ${NRM(used)}` },
    { label: 'Remaining', value: `RM ${NRM(rem)}`, total: true, tone: 'green' },
  ];
  if (liters != null) rows.splice(2, 0, { label: 'Fuel volume', value: `${N(Math.round(liters))} L` });
  const trigger = (
    <div className="prog-cell">
      <div className="prog-row">
        <div className="prog-track">
          <div className={`prog-fill ${isRed ? 'pf-r' : 'pf-g'}`} style={{width: pct + '%'}}></div>
        </div>
        <span className="prog-num">{unit === 'RM' ? NRM(rem) : N(rem)}<span>/{unit === 'RM' ? NRM(max) : N(max)}</span></span>
      </div>
      <span className="prog-used">
        {unit === 'RM' ? `RM ${NRM(used)}` : `${N(used)} L used`}{liters != null && ` · ${N(Math.round(liters))} L used`}
      </span>
    </div>
  );
  return <CalcPopover title="Usage breakdown" rows={rows} trigger={trigger} />;
}

/* ── Subsidy Quota Cell ────────────────────────────────────────── */
// Confirmed usage settles hours after the trip; the live number shown to
// the fleet is an estimate until then. Bar shows confirmed (solid) with
// the estimate extending past it (lighter) so a settlement bump is visible
// before it happens, instead of the number just jumping later.
function SubsidyProgressCell({ max, used, estUsed, pending, failed, utype }) {
  if (utype === 'limit' && failed) {
    return <span className="fail-lbl">Update failed</span>;
  }
  if (utype === 'limit' && pending) {
    return (
      <div className="pend-cell">
        <div className="skel skel-w"></div>
        <span className="pend-lbl">Pending update</span>
      </div>
    );
  }
  if (max == null) {
    return <span className="na-lbl">N/A</span>;
  }
  max = Math.round(max);
  used = Math.round(used);
  estUsed = Math.round(estUsed);
  const usedPct = Math.min(100, (used / max) * 100);
  const estPct  = Math.min(100, (estUsed / max) * 100);
  const rows = [
    { label: 'Max quota',      value: `${N(max)} L` },
    { label: 'Confirmed used', value: `${N(used)} L` },
    { label: 'Estimated used', value: `${N(estUsed)} L`, tone: 'amber' },
    { label: <>Remaining <span className="ml-calc-row-note">(confirmed and estimated)</span></>, value: `${N(max - (used + estUsed))} L`, total: true, tone: 'green' },
  ];
  const trigger = (
    <div className="prog-cell">
      <div className="prog-row">
        <div className="prog-track">
          <div className="prog-fill prog-fill-est" style={{width: estPct + '%'}}></div>
          <div className="prog-fill pf-g" style={{width: usedPct + '%'}}></div>
        </div>
        <span className="prog-num">{N(used)}<span>/{N(max)}</span></span>
      </div>
      <span className="prog-used">
        {N(used)} L used <span className="prog-used-sep">·</span>
        <span className="prog-used-est"><span className="prog-used-dot"></span>Est. {N(estUsed)} L used</span>
      </span>
    </div>
  );
  return <CalcPopover title="Subsidy quota breakdown" rows={rows} trigger={trigger} align="right" />;
}

/* ── Status Cell ───────────────────────────────────────────────── */
function StatusCell({ status, pending, failed, utype }) {
  if (utype === 'status' && failed)  return <span className="fail-status">Update failed</span>;
  if (utype === 'status' && pending) return <span className="pill pill-p">Pending update</span>;
  return <span className={`pill ${status === 'Active' ? 'pill-a' : 'pill-i'}`}>{status}</span>;
}

/* ── Mobile Card ───────────────────────────────────────────────── */
const FUEL_LABELS = {
  '95': { top: '95', bottom: 'RON' },
  '97': { top: '97', bottom: 'RON' },
  '100': { top: '100', bottom: 'RON' },
  'diesel-max': { top: 'DIESEL', bottom: 'MAX', wide: true },
  'diesel': { top: 'DIESEL', bottom: null, wide: true },
};
function FleetCardMobile({ row, pending, failed, utype }) {
  return (
    <article className="fc-card">
      <div className="fc-card-top">
        <div className="fc-card-head">
          <img src="petron.png" className="fc-card-logo" alt="Petron" />
          <StatusCell status={row.st} pending={pending} failed={failed} utype={utype} />
          <button className="btn-3dot"><Icon name="more_horiz" size={17} /></button>
        </div>
        <div className="fc-card-wave-wrap">
          {/* Exact wave asset from Figma (MyLorry 2.0, node 2873:7025) */}
          <svg className="fc-card-wave" preserveAspectRatio="none" viewBox="0 0 366 66" fill="none">
            <path d="M366 66C231.677 10.6745 66.0322 7.00976 0 12.0931V3.58154C150.229 -11.1719 306.596 23.2055 366 42.2385V66Z" fill={`url(#fcWaveGrad${row.id})`} />
            <defs>
              <linearGradient id={`fcWaveGrad${row.id}`} x1="0" y1="33" x2="366" y2="33" gradientUnits="userSpaceOnUse">
                <stop stopColor="#273573" />
                <stop offset="0.495" stopColor="#3555A5" />
                <stop offset="0.97" stopColor="#283877" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="fc-card-numwrap">
          <div className="card-num fc-card-num">{row.card}</div>
          <div className="fc-card-tags">
            <span className="fc-card-veh">{row.veh}</span>
            <span className="fc-card-pin">Pin: {row.pin}</span>
          </div>
        </div>
      </div>
      <div className="fc-card-div"></div>
      <div className="fc-card-limits">
        <div>
          <div className="fc-card-label">Daily Limit:</div>
          <ProgressCell rem={row.dr} max={row.dm} used={row.du} liters={row.dL} status={row.st} pending={pending} failed={failed} utype={utype} />
        </div>
        <div>
          <div className="fc-card-label">Monthly Limit:</div>
          <ProgressCell rem={row.mr} max={row.mm} used={row.mu} liters={row.mL} status={row.st} pending={pending} failed={failed} utype={utype} />
        </div>
        <div>
          <div className="fc-card-label">Subsidy Quota (Ltr):</div>
          <SubsidyProgressCell max={row.sm} used={row.su} estUsed={row.sEst} pending={pending} failed={failed} utype={utype} />
        </div>
      </div>
      <div className="fc-card-div"></div>
      <div className="fc-card-foot">
        <span className="fc-card-org">{row.org}</span>
        <span className={`fc-card-bal${row.bal < 0 ? ' fc-card-bal-neg' : ''}`}>
          Balance: RM {row.bal < 0 ? '-' : ''}{Math.abs(row.bal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="fc-card-fuels">
        {row.fuels.map(f => {
          const meta = FUEL_LABELS[f];
          return (
            <div key={f} className={`fc-fuel${meta.wide ? ' fc-fuel-wide' : ''}`}>
              <span className="fc-fuel-top">{meta.top}</span>
              {meta.bottom && <span className="fc-fuel-bottom">{meta.bottom}</span>}
            </div>
          );
        })}
      </div>
    </article>
  );
}

/* ── Status Strip ──────────────────────────────────────────────── */
function StatusStrip({ state, utype, count, failCount, eta, onView, onDismiss, fading }) {
  if (!state) return null;
  const tw = utype === 'status' ? 'status' : 'limits';
  const cards = n => `${n} fleet ${n === 1 ? 'card' : 'cards'}`;
  const C = {
    updating: { ico: <div className="strip-spinner"></div>,         primary: `Updating ${tw} for ${cards(count)}…`,       sec: 'Auto-refreshing affected fields', bg: 'rgba(0,0,0,0.02)' },
    queued:   { ico: <Icon name="hourglass_empty" size={18} style={{color:'#E6A700'}} />, primary: eta?.primary ?? 'Update queued…', sec: eta?.sec ?? null, bg: 'rgba(230,167,0,0.07)' },
    delayed:  { ico: <div className="strip-spinner"></div>,         primary: 'Still updating…',                            sec: 'This is taking longer than usual', bg: 'rgba(0,0,0,0.02)' },
    success:  { ico: <Icon name="check_circle" size={18} fill={1} style={{color:'#00AA4F'}} />, primary: `${cards(count)} updated`, sec: null, bg: 'rgba(0,170,79,0.07)' },
    partial:  { ico: <Icon name="warning"      size={18} fill={1} style={{color:'#E6A700'}} />, primary: `${count - failCount} updated, ${failCount} needs attention`, sec: null, bg: 'rgba(230,167,0,0.07)' },
    failure:  { ico: <Icon name="error"        size={18} fill={1} style={{color:'#FF7476'}} />, primary: 'Update failed. No changes were applied.', sec: null, bg: 'rgba(255,116,118,0.08)' },
  }[state];
  if (!C) return null;
  return (
    <div className={`strip${fading ? ' strip-fade-out' : ''}`} style={{background: C.bg}}>
      <div className="strip-icon">{C.ico}</div>
      <div className="strip-body">
        <span className="strip-primary">{C.primary}</span>
        {C.sec && <><span className="strip-dot">·</span><span className="strip-sec">{C.sec}</span></>}
      </div>
      <div className="strip-end">
        {(state === 'partial' || state === 'failure') && (
          <button className="btn-view" onClick={onView}>View</button>
        )}
        {(state === 'partial' || state === 'failure' || state === 'delayed' || state === 'queued') && (
          <button className="btn-x" onClick={onDismiss}><Icon name="close" size={15} /></button>
        )}
      </div>
    </div>
  );
}

/* ── Edit Status Modal ─────────────────────────────────────────── */
function EditStatusModal({ count, onClose, onDone }) {
  const [status, setStatus] = useState('Active');

  return (
    <div className="modal-back" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-handle"></div>
        <div className="modal-head">
          <span className="modal-title">Confirm Edit Status</span>
          <button className="modal-xbtn" onClick={onClose}><Icon name="close" size={16} /></button>
        </div>
        <div className="modal-divider"></div>
        <div className="modal-body">
          <div className="field">
            <label className="field-lbl">Status <span className="req">*</span></label>
            <select className="field-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="modal-info">
            <Icon name="info" size={16} />
            <span>This update may take a short while. We'll refresh the affected cards automatically.</span>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-apply" onClick={onDone}>
            Apply to {count} {count === 1 ? 'card' : 'cards'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit Limit Modal ──────────────────────────────────────────── */
function EditLimitModal({ count, onClose, onDone }) {
  const [daily, setDaily] = useState('');
  const [monthly, setMonthly] = useState('');
  const canApply = daily.trim() !== '' || monthly.trim() !== '';

  return (
    <div className="modal-back" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-handle"></div>
        <div className="modal-head">
          <span className="modal-title">Edit Limit</span>
          <button className="modal-xbtn" onClick={onClose}><Icon name="close" size={16} /></button>
        </div>
        <div className="modal-divider"></div>
        <div className="modal-body">
          <div className="field">
            <label className="field-lbl">Daily Limit <span className="req">*</span></label>
            <input className="field-input" type="number" min="0" placeholder="Enter usage daily limit" value={daily} onChange={e => setDaily(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-lbl">Monthly Limit <span className="req">*</span></label>
            <input className="field-input" type="number" min="0" placeholder="Enter usage monthly limit" value={monthly} onChange={e => setMonthly(e.target.value)} />
          </div>
          <div className="modal-info">
            <Icon name="info" size={16} />
            <span>This update may take a short while. We'll refresh the affected cards automatically.</span>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-apply" onClick={onDone} disabled={!canApply} style={!canApply ? {opacity:0.4,cursor:'not-allowed'} : {}}>
            Apply to {count} {count === 1 ? 'card' : 'cards'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tweaks defaults ───────────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "outcome": "success"
}/*EDITMODE-END*/;

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sel, setSel]         = useState(new Set([3,4,5]));
  const [modal, setModal]     = useState(null);   // 'status' | 'limit'
  const [strip, setStrip]     = useState(null);   // 'updating'|'queued'|'delayed'|'success'|'partial'|'failure'
  const [utype, setUtype]     = useState(null);   // 'status' | 'limit'
  const [ucount, setUcount]   = useState(0);
  const [pending, setPending] = useState(new Set());
  const [failed, setFailed]   = useState(new Set());
  const [fading, setFading]   = useState(false);
  const [eta, setEta]         = useState(null);   // { phase, primary, sec }
  const lastRows = useRef(new Set());
  const timers   = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const addTimer    = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  const count    = sel.size;
  const canEdit  = count > 0 && !strip;
  const allChk   = sel.size === ROWS.length;
  const someChk  = sel.size > 0 && !allChk;

  const resolve = useCallback((rowSet) => {
    if (t.outcome === 'success') {
      setStrip('success');
      setPending(new Set());
      addTimer(() => {
        setFading(true);
        addTimer(() => { setStrip(null); setFading(false); setEta(null); }, 550);
      }, 2200);
    } else if (t.outcome === 'partial') {
      const arr = [...rowSet];
      setFailed(new Set([arr[arr.length - 1]]));
      setPending(new Set());
      setStrip('partial');
    } else {
      setFailed(rowSet);
      setPending(new Set());
      setStrip('failure');
    }
  // eslint-disable-next-line
  }, [t.outcome]);

  const doStart = useCallback((type, rows) => {
    clearTimers();
    const rowSet = new Set(rows);
    lastRows.current = rowSet;
    setUtype(type);
    setUcount(rowSet.size);
    setPending(rowSet);
    setFailed(new Set());
    setSel(new Set());
    setFading(false);
    setEta(null);

    setStrip('queued');
    setEta({ phase: 0, primary: 'Update queued — est. ~30 min', sec: 'High traffic period' });
    addTimer(() => setEta({ phase: 1, primary: 'Update in progress — est. ~10 min', sec: 'High traffic period' }), 3000);
    addTimer(() => setEta({ phase: 2, primary: 'Update in progress — est. ~8 min',  sec: null }), 6000);
    addTimer(() => setEta({ phase: 3, primary: 'Almost done — est. ~1 min',          sec: null }), 9000);
    addTimer(() => resolve(rowSet), 12000);
  // eslint-disable-next-line
  }, [resolve]);

  const selRef = useRef(new Set([3,4,5]));
  useEffect(() => { selRef.current = sel; }, [sel]);

  const handleDone = useCallback((type) => {
    setModal(null);
    doStart(type, [...selRef.current]);
  }, [doStart]);

  const handleView = () => { clearTimers(); setSel(new Set(failed)); setStrip(null); setFading(false); setEta(null); };
  const handleDismiss = () => { clearTimers(); setSel(new Set()); setFailed(new Set()); setPending(new Set()); setStrip(null); setFading(false); setEta(null); };

  const toggleRow = id => setSel(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleAll = () => setSel(allChk ? new Set() : new Set(ROWS.map(r => r.id)));

  return (
    <div className="shell">
      <TopBar onMenuClick={() => setMobileNavOpen(true)} />
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <main className="content" data-screen-label="Fleet Card">
        <div className="inner">

          {/* Page header */}
          <div className="page-hdr">
            <h1 className="page-title">Fleet Card</h1>
            <button className="btn btn-primary"><Icon name="add" size={15} /> Create Card</button>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrap">
              <button className="scope-btn">
                SP Account
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
                  <path d="M1 1l3 3 3-3" stroke="#00AA4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="search-field-wrap">
                <Icon name="search" size={16} style={{color:'#999AA5'}} />
                <input className="search-field" placeholder="Search by SP Account Name" />
              </div>
            </div>
            <button className="filter-btn">
              <Icon name="tune" size={17} style={{color:'var(--fg-tertiary)'}} />
              Filter
            </button>
            <div className="tb-actions">
              <button
                className={`btn ${canEdit ? 'btn-primary' : 'btn-off'}`}
                onClick={() => canEdit && setModal('status')}
              >
                <Icon name="edit" size={15} /> Edit Status
              </button>
              <button
                className={`btn ${canEdit ? 'btn-primary' : 'btn-off'}`}
                onClick={() => canEdit && setModal('limit')}
              >
                <Icon name="edit" size={15} /> Edit Limit
              </button>
              <button className="btn btn-soft">
                <Icon name="upload" size={15} style={{color:'var(--green-500)'}} /> Upload Excel
              </button>
            </div>
          </div>

          {/* Status strip */}
          {strip && (
            <StatusStrip
              state={strip}
              utype={utype}
              count={ucount}
              failCount={failed.size}
              eta={eta}
              onView={handleView}
              onDismiss={handleDismiss}
              fading={fading}
            />
          )}

          {/* Table (desktop) */}
          <div className="tbl-wrap fc-desktop-only">
            <table className="tbl">
              <thead>
                <tr>
                  <th className="c-chk">
                    <input
                      type="checkbox"
                      checked={allChk}
                      onChange={toggleAll}
                      ref={el => { if (el) el.indeterminate = someChk; }}
                    />
                  </th>
                  <th className="c-no">No.</th>
                  <th>Owner</th>
                  <th>Provider Acc. No.</th>
                  <th>Card No.</th>
                  <th>Vehicle No.</th>
                  <th>Tag</th>
                  <th style={{minWidth:190}}>Daily Limit (RM)</th>
                  <th style={{minWidth:190}}>Monthly Limit (RM)</th>
                  <th style={{minWidth:190}}>Subsidy Quota (Ltr)</th>
                  <th style={{minWidth:120}}>Status</th>
                  <th className="c-act"></th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(row => {
                  const isPend = pending.has(row.id);
                  const isFail = failed.has(row.id);
                  const isSel  = sel.has(row.id);
                  return (
                    <tr key={row.id} className={isSel ? 'row-sel' : ''}>
                      <td className="c-chk">
                        <input type="checkbox" checked={isSel} onChange={() => toggleRow(row.id)} />
                      </td>
                      <td className="c-no">{row.id}</td>
                      <td style={{fontWeight:500}}>{row.owner}</td>
                      <td>
                        <div className="prov-wrap">
                          <div className="prov-icon">
                            <img src="petron.png" width="20" height="24" style={{objectFit:'contain',display:'block'}} alt="Petron" />
                          </div>
                          <div>
                            <div style={{fontSize:12}}>{row.acc}</div>
                            <div className={`prov-bal${row.bal < 0 ? ' prov-bal-neg' : ''}`}>
                              RM {row.bal < 0 ? '-' : ''}{Math.abs(row.bal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="card-num">{row.card}</div>
                        <div className="card-sub">Pin: {row.pin}</div>
                      </td>
                      <td>{row.veh}</td>
                      <td>{row.tag}</td>
                      <td>
                        <ProgressCell
                          rem={row.dr} max={row.dm} used={row.du} liters={row.dL}
                          status={row.st} pending={isPend} failed={isFail} utype={utype}
                        />
                      </td>
                      <td>
                        <ProgressCell
                          rem={row.mr} max={row.mm} used={row.mu} liters={row.mL}
                          status={row.st} pending={isPend} failed={isFail} utype={utype}
                        />
                      </td>
                      <td>
                        <SubsidyProgressCell
                          max={row.sm} used={row.su} estUsed={row.sEst}
                          pending={isPend} failed={isFail} utype={utype}
                        />
                      </td>
                      <td>
                        <StatusCell status={row.st} pending={isPend} failed={isFail} utype={utype} />
                      </td>
                      <td className="c-act">
                        <button className="btn-3dot"><Icon name="more_horiz" size={17} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <div className="fc-mobile-list">
            {ROWS.map(row => {
              const isPend = pending.has(row.id);
              const isFail = failed.has(row.id);
              return (
                <FleetCardMobile
                  key={row.id} row={row}
                  pending={isPend} failed={isFail} utype={utype}
                />
              );
            })}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span>Rows per page:</span>
            <select defaultValue="10">
              <option>10</option><option>25</option><option>50</option>
            </select>
            <span>1–10 of 54</span>
            <button className="pg-btn">‹</button>
            <button className="pg-btn">›</button>
          </div>

        </div>
      </main>

      {/* Edit Status Modal */}
      {modal === 'status' && (
        <EditStatusModal
          count={count}
          onClose={() => setModal(null)}
          onDone={() => handleDone('status')}
        />
      )}

      {/* Edit Limit Modal */}
      {modal === 'limit' && (
        <EditLimitModal
          count={count}
          onClose={() => setModal(null)}
          onDone={() => handleDone('limit')}
        />
      )}

      {/* Tweaks Panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Outcome" />
        <TweakRadio
          label="Result"
          value={t.outcome}
          options={['success', 'partial', 'failure']}
          onChange={v => setTweak('outcome', v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
