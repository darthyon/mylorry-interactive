const { useState } = React;
const { Pager } = window.SharedShell;

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
  { id:1,  owner:'Tesla',      acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', date:'17 Jul 2026 · 7:48 AM',  veh:'STG0234', subsidy:{ type:'amount', v:38.20 },  tag:'MAIN-12', amount:196.39,  fuel:'diesel', volume:48.25,  station:'P-PJ HUB SENTRAL' },
  { id:2,  owner:'Wayne Ent.', acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', date:'17 Jul 2026 · 6:12 AM',  veh:'WQM1190', subsidy:{ type:'calculating' },        tag:null,      amount:1167.24, fuel:'diesel', volume:286.79, station:'P-SHAH ALAM DEPOT' },
  { id:3,  owner:'Cyberdyne',  acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', date:'16 Jul 2026 · 5:44 PM',  veh:'JKM4521', subsidy:{ type:'none' },              tag:null,      amount:122.03,  fuel:'ron95',  volume:29.98,  station:'P-PORT KLANG YARD' },
  { id:4,  owner:'Globex',     acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', date:'16 Jul 2026 · 2:58 PM',  veh:'BCA8831', subsidy:{ type:'amount', v:22.90 },  tag:'MAIN-12', amount:190.07,  fuel:'diesel', volume:46.70,  station:'P-KLIA CARGO TERMINAL' },
  { id:5,  owner:'Oscorp',     acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', date:'16 Jul 2026 · 1:30 PM',  veh:'VANB791', subsidy:{ type:'calculating' },        tag:null,      amount:407.41,  fuel:'diesel', volume:100.10, station:'P-SUBANG JAYA' },
  { id:6,  owner:'Acme Corp',  acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', date:'15 Jul 2026 · 11:02 AM', veh:'STG0234', subsidy:{ type:'none' },              tag:null,      amount:203.50,  fuel:'diesel', volume:50.00,  station:'P-PJ HUB SENTRAL' },
  { id:7,  owner:'LexCorp',    acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', date:'15 Jul 2026 · 9:14 AM',  veh:'WQM1190', subsidy:{ type:'amount', v:14.60 },  tag:null,      amount:107.72,  fuel:'ron95',  volume:31.50,  station:'P-SHAH ALAM DEPOT' },
  { id:8,  owner:'Initech',    acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', date:'15 Jul 2026 · 8:47 AM',  veh:'JKM4521', subsidy:{ type:'calculating' },        tag:'MAIN-12', amount:630.00,  fuel:'diesel', volume:154.79, station:'P-PORT KLANG YARD' },
  { id:9,  owner:'Stark Ind.', acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', date:'14 Jul 2026 · 4:20 PM',  veh:'BCA8831', subsidy:{ type:'none' },              tag:null,      amount:67.90,   fuel:'ron95',  volume:16.68,  station:'P-KLIA CARGO TERMINAL' },
  { id:10, owner:'Umbrella',   acc:'ORG59-SPA-MEMBER', card:'5241 9876 1234 1234', date:'14 Jul 2026 · 2:09 PM',  veh:'VANB791', subsidy:{ type:'amount', v:9.35 },   tag:null,      amount:310.02,  fuel:'diesel', volume:76.17,  station:'P-SUBANG JAYA' },
];
const N = n => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── TopBar ────────────────────────────────────────────────────── */
function TopBar() {
  return (
    <header className="topbar">
      <a href="../../index.html" title="Back to prototype library" style={{display:'block', marginLeft:88}}>
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
            const cls = `sb-sub${label === 'Transaction' ? ' sb-sub-act' : ''}`;
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
  );
}

/* ── Subsidy cell ──────────────────────────────────────────────── */
function SubsidyCell({ subsidy }) {
  if (subsidy.type === 'calculating') return <span className="subsidy-calc">Calculating…</span>;
  if (subsidy.type === 'none')        return <span className="subsidy-none">No subsidy</span>;
  return <span className="subsidy-amt">RM {N(subsidy.v)}</span>;
}

/* ── Volume cell ───────────────────────────────────────────────── */
function VolumeCell({ fuel, volume }) {
  return (
    <div className="vol-wrap">
      <span className={`fuel-tag ${fuel === 'ron95' ? 'fuel-ron95' : 'fuel-diesel'}`}>
        {fuel === 'ron95' ? 'RON95' : 'Diesel'}
      </span>
      <span className="vol-num">{volume.toFixed(2)} L</span>
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  return (
    <div className="shell">
      <TopBar />
      <Sidebar />

      <main className="content" data-screen-label="Transaction">
        <div className="inner">

          {/* Page header */}
          <div className="page-hdr">
            <h1 className="page-title">Transaction</h1>
          </div>

          {/* Toolbar */}
          <div className="hac-toolbar">
            <div className="hac-toolbar-left">
              <div className="hac-search-group scoped">
                <button className="hac-search-scope">
                  Org
                  <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{marginLeft:5}}>
                    <path d="M1 1l3 3 3-3" stroke="#00AA4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="hac-search-bar">
                  <Icon name="search" size={16} style={{color:'var(--fg-tertiary)'}} />
                  <input className="hac-search-input" placeholder="Search by Org Name" value={q} onChange={e => setQ(e.target.value)} />
                  {q && <button className="hac-search-clear" type="button" onClick={() => setQ('')}><Icon name="close" size={16} /></button>}
                </div>
              </div>
              <button className="hac-filter-btn" type="button">
                <Icon name="tune" size={18} />
                Filter
              </button>
            </div>
            <div className="tb-actions">
              <button className="ml-btn-primary">
                <Icon name="download" size={15} /> Download Excel
              </button>
              <button className="ml-btn-soft">
                <Icon name="upload" size={15} /> Upload TXN Excel
              </button>
            </div>
          </div>

          {/* Result count */}
          <div className="hac-count">{ROWS.length} Transaction</div>

          {/* Table */}
          <div className="ml-table-wrap">
            <table className="ml-table tbl">
              <thead>
                <tr>
                  <th className="c-no">No.</th>
                  <th>Owner</th>
                  <th>Provider Acc. No.</th>
                  <th>TXN Date</th>
                  <th>Card No</th>
                  <th>Vehicle No.</th>
                  <th>Subsidy</th>
                  <th>Card Tag</th>
                  <th>Amount</th>
                  <th>Volume</th>
                  <th>Station</th>
                  <th className="c-act"></th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(row => (
                  <tr key={row.id}>
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
                    <td>{row.date}</td>
                    <td><div className="card-num">{row.card}</div></td>
                    <td>{row.veh}</td>
                    <td><SubsidyCell subsidy={row.subsidy} /></td>
                    <td>{row.tag ? row.tag : <span className="tag-none">—</span>}</td>
                    <td><span className="amt-sign">-</span> <span className="amt-neg">RM {N(row.amount)}</span></td>
                    <td><VolumeCell fuel={row.fuel} volume={row.volume} /></td>
                    <td>{row.station}</td>
                    <td className="c-act">
                      <button className="btn-3dot"><Icon name="more_horiz" size={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pager
            page={page}
            perPage={perPage}
            total={ROWS.length}
            onPage={setPage}
            onPerPage={setPerPage}
          />

        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
