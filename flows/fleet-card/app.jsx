const { useState, useEffect, useRef, useCallback } = React;

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
const ROWS = [
  { id:1,  owner:'Tesla',      acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:180, dm:500,   du:320, mr:1600,  mm:15000, mu:320, sr:300, sm:900,   su:320, st:'Active'   },
  { id:2,  owner:'Wayne Ent.', acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:180, dm:500,   du:320, mr:1600,  mm:15000, mu:320, sr:300, sm:900,   su:320, st:'Active'   },
  { id:3,  owner:'Cyberdyne',  acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:180, dm:500,   du:320, mr:1600,  mm:15000, mu:320, sr:null, sm:null, su:null, st:'Active'   },
  { id:4,  owner:'Globex',     acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:180, dm:500,   du:320, mr:1600,  mm:15000, mu:320, sr:300, sm:900,   su:320, st:'Active'   },
  { id:5,  owner:'Oscorp',     acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:180, dm:500,   du:320, mr:1600,  mm:15000, mu:320, sr:300, sm:900,   su:320, st:'Active'   },
  { id:6,  owner:'Acme Corp',  acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:501, dm:501,   du:0,   mr:20001, mm:20001, mu:0,   sr:300, sm:900,   su:320, st:'Active'   },
  { id:7,  owner:'LexCorp',    acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:500, dm:500,   du:0,   mr:1600,  mm:15000, mu:320, sr:300, sm:900,   su:320, st:'Inactive' },
  { id:8,  owner:'Initech',    acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:500, dm:500,   du:0,   mr:1600,  mm:15000, mu:320, sr:300, sm:900,   su:320, st:'Inactive' },
  { id:9,  owner:'Stark Ind.', acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:180, dm:500,   du:320, mr:1600,  mm:15000, mu:320, sr:300, sm:900,   su:320, st:'Active'   },
  { id:10, owner:'Umbrella',   acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', pin:'123', veh:'XYZ-789', tag:'MAIN-12', dr:180, dm:500,   du:320, mr:1600,  mm:15000, mu:320, sr:300, sm:900,   su:320, st:'Active'   },
];
const N = n => n.toLocaleString();

/* ── TopBar ────────────────────────────────────────────────────── */
function TopBar() {
  return (
    <header className="topbar">
      <img src="img_logo_white.svg" height="27" alt="MyLorry" style={{display:'block', marginLeft:88}} />
    </header>
  );
}

/* ── Sidebar ───────────────────────────────────────────────────── */
const MYFUEL_SUBS = [
  {icon:'grid_view',          label:'Dashboard'},
  {icon:'credit_card',        label:'Fleet Card'},
  {icon:'receipt_long',       label:'Transaction'},
  {icon:'redeem',             label:'Rebate'},
  {icon:'volunteer_activism', label:'Subsidy'},
  {icon:'bar_chart',          label:'Usage History'},
  {icon:'add_card',           label:'Top-Up'},
  {icon:'payment',            label:'Payment History'},
  {icon:'currency_exchange',  label:'Balance Adj.'},
  {icon:'description',        label:'Report'},
  {icon:'analytics',          label:'Usage Report'},
];

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sb-card">
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
          {icon:'support_agent',   label:'Agent'},
          {icon:'paid',            label:'Commission'},
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
          {MYFUEL_SUBS.map(({icon, label}) => (
            <div key={label} className={`sb-sub${label === 'Fleet Card' ? ' sb-sub-act' : ''}`}>
              <Icon name={icon} size={18} />
              <span>{label}</span>
            </div>
          ))}
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
  );
}

/* ── Progress Cell ─────────────────────────────────────────────── */
function ProgressCell({ rem, max, used, status, pending, failed, utype }) {
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
  return (
    <div className="prog-cell">
      <div className="prog-row">
        <div className="prog-track">
          <div className={`prog-fill ${isRed ? 'pf-r' : 'pf-g'}`} style={{width: pct + '%'}}></div>
        </div>
        <span className="prog-num">{N(rem)}<span>/{N(max)}</span></span>
      </div>
      <span className="prog-used">{N(used)} Used</span>
    </div>
  );
}

/* ── Status Cell ───────────────────────────────────────────────── */
function StatusCell({ status, pending, failed, utype }) {
  if (utype === 'status' && failed)  return <span className="fail-status">Update failed</span>;
  if (utype === 'status' && pending) return <span className="pill pill-p">Pending update</span>;
  return <span className={`pill ${status === 'Active' ? 'pill-a' : 'pill-i'}`}>{status}</span>;
}

/* ── Status Strip ──────────────────────────────────────────────── */
function StatusStrip({ state, utype, count, failCount, onView, onDismiss, fading }) {
  if (!state) return null;
  const tw = utype === 'status' ? 'status' : 'limits';
  const cards = n => `${n} fleet ${n === 1 ? 'card' : 'cards'}`;
  const C = {
    updating: { ico: <div className="strip-spinner"></div>,         primary: `Updating ${tw} for ${cards(count)}…`,       sec: 'Auto-refreshing affected fields' },
    delayed:  { ico: <div className="strip-spinner"></div>,         primary: 'Still updating…',                            sec: 'This is taking longer than usual' },
    success:  { ico: <Icon name="check_circle" size={18} fill={1} style={{color:'#00AA4F'}} />, primary: `${cards(count)} updated`, sec: null },
    partial:  { ico: <Icon name="warning"      size={18} fill={1} style={{color:'#E6A700'}} />, primary: `${count - failCount} updated, ${failCount} needs attention`, sec: null },
    failure:  { ico: <Icon name="error"        size={18} fill={1} style={{color:'#FF7476'}} />, primary: 'Update failed. No changes were applied.', sec: null },
  }[state];
  if (!C) return null;
  return (
    <div className={`strip${fading ? ' strip-fade-out' : ''}`}>
      <div className="strip-icon">{C.ico}</div>
      <div className="strip-body">
        <span className="strip-primary">{C.primary}</span>
        {C.sec && <><span className="strip-dot">·</span><span className="strip-sec">{C.sec}</span></>}
      </div>
      <div className="strip-end">
        {(state === 'partial' || state === 'failure') && (
          <button className="btn-view" onClick={onView}>View</button>
        )}
        {(state === 'partial' || state === 'failure' || state === 'delayed') && (
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
  "outcome": "success",
  "delay": false
}/*EDITMODE-END*/;

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [sel, setSel]         = useState(new Set([3,4,5]));
  const [modal, setModal]     = useState(null);   // 'status' | 'limit'
  const [strip, setStrip]     = useState(null);   // 'updating'|'delayed'|'success'|'partial'|'failure'
  const [utype, setUtype]     = useState(null);   // 'status' | 'limit'
  const [ucount, setUcount]   = useState(0);
  const [pending, setPending] = useState(new Set());
  const [failed, setFailed]   = useState(new Set());
  const [fading, setFading]   = useState(false);
  const lastRows = useRef(new Set());
  const timers   = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const addTimer    = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };

  const count    = sel.size;
  const canEdit  = count > 0 && !strip;
  const allChk   = sel.size === ROWS.length;
  const someChk  = sel.size > 0 && !allChk;

  const doStart = useCallback((type, rows) => {
    clearTimers();
    const rowSet = new Set(rows);
    lastRows.current = rowSet;
    setUtype(type);
    setUcount(rowSet.size);
    setPending(rowSet);
    setFailed(new Set());
    setSel(new Set());
    setStrip('updating');
    setFading(false);

    const resolvMs = t.delay ? 9000 : 3500;
    addTimer(() => {
      if (t.delay) { setStrip('delayed'); return; }
      if (t.outcome === 'success') {
        setStrip('success');
        setPending(new Set());
        addTimer(() => {
          setFading(true);
          addTimer(() => { setStrip(null); setFading(false); }, 550);
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
    }, resolvMs);
  // eslint-disable-next-line
  }, [t.outcome, t.delay]);

  const selRef = useRef(new Set([3,4,5]));
  useEffect(() => { selRef.current = sel; }, [sel]);

  const handleDone = useCallback((type) => {
    setModal(null);
    doStart(type, [...selRef.current]);
  }, [doStart]);

  const handleView = () => { clearTimers(); setSel(new Set(failed)); setStrip(null); setFading(false); };
  const handleDismiss = () => { clearTimers(); setSel(new Set()); setFailed(new Set()); setStrip(null); setFading(false); };

  const toggleRow = id => setSel(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleAll = () => setSel(allChk ? new Set() : new Set(ROWS.map(r => r.id)));

  return (
    <div className="shell">
      <TopBar />
      <Sidebar />

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
              onView={handleView}
              onDismiss={handleDismiss}
              fading={fading}
            />
          )}

          {/* Table */}
          <div className="tbl-wrap">
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
                  <th style={{minWidth:155}}>Daily Limit</th>
                  <th style={{minWidth:180}}>Monthly Limit</th>
                  <th style={{minWidth:155}}>Subsidy Quota</th>
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
                          <span style={{fontSize:12}}>{row.acc}</span>
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
                          rem={row.dr} max={row.dm} used={row.du}
                          status={row.st} pending={isPend} failed={isFail} utype={utype}
                        />
                      </td>
                      <td>
                        <ProgressCell
                          rem={row.mr} max={row.mm} used={row.mu}
                          status={row.st} pending={isPend} failed={isFail} utype={utype}
                        />
                      </td>
                      <td>
                        <ProgressCell
                          rem={row.sr} max={row.sm} used={row.su}
                          status={undefined} pending={isPend} failed={isFail} utype={utype}
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
        <TweakSection label="Timing" />
        <TweakToggle
          label="Simulate delay (20–30s)"
          value={t.delay}
          onChange={v => setTweak('delay', v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
