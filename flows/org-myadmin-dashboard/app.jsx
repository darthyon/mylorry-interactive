{

const { useState, useMemo, useRef } = React;
const { Icon, OrgSwitcher, CountCard, CardHead, Segmented, SelectMenu, Pager, StatusBadge, ExportMenu } = window.SharedShell;
const D = window.MYADMIN_DASH;

const N = (n) => Number(n).toLocaleString("en-US");

const MYADMIN_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", href: "index.html" },
  { key: "user", label: "User", icon: "group" },
  { key: "driver", label: "Driver", icon: "badge" },
  { key: "vehicle", label: "Vehicle", icon: "local_shipping", href: "../org-vehicle-list/index.html" },
  { key: "vendor", label: "Vendor", icon: "storefront" },
  { key: "checklist", label: "Checklist", icon: "fact_check" },
  { key: "history", label: "Check In History", icon: "history" },
];

function Rail() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`mad-rail-wrap${expanded ? " expanded" : ""}`}>
      <nav className={`mad-rail${expanded ? " expanded" : ""}`} aria-label="MyAdmin navigation">
        <div className="mad-rail-profile">
          <div className="mad-rail-avatar-wrap">
            <div className="mad-rail-avatar"><Icon name="person" size={18} fill={1} color="#94A8B2" /></div>
            {!expanded && <span className="mad-rail-badge">ORG</span>}
          </div>
          {expanded && (
            <div className="mad-rail-profile-text">
              <span className="mad-rail-profile-role">MyAdmin</span>
              <span className="mad-rail-profile-name">Module</span>
            </div>
          )}
        </div>

        {MYADMIN_ITEMS.map((item) => {
          const body = (
            <>
              <Icon name={item.icon} size={20} fill={item.key === "dashboard" ? 1 : 0} />
              <span>{item.label}</span>
            </>
          );
          return item.href ? (
            <a key={item.key} href={item.href} className={`mad-rail-item${item.key === "dashboard" ? " active" : ""}`}>
              {body}
            </a>
          ) : (
            <button key={item.key} type="button" className="mad-rail-item">
              {body}
            </button>
          );
        })}

        <div className="mad-rail-divider" />
        <div className="mad-rail-footer">
          <a href="../org-dashboard/index.html" className="mad-rail-item mad-rail-signout">
            <Icon name="logout" size={20} />
            {expanded && <span>Back to Home</span>}
          </a>
        </div>
      </nav>
      <button type="button" className="mad-rail-toggle" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}>
        <Icon name="chevron_left" size={16} />
      </button>
    </div>
  );
}

/* ── Fleet Status Summary ─────────────────────────────────────── */
function FleetSummary({ onFilter }) {
  const f = D.fleet;
  return (
    <div className="mad-kpi-row">
      <div className="ml-statcard">
        <div className="ml-statcard-head">
          <div className="ml-statcard-main">
            <div className="ml-statcard-ico green"><Icon name="local_shipping" size={20} fill={1} /></div>
            <div className="ml-statcard-count">{f.vehicles.total}</div>
          </div>
        </div>
        <div className="ml-statcard-labelrow"><span className="ml-statcard-label">Vehicles</span></div>
        <div className="ml-statcard-band">
          <button type="button" className="ml-statcard-cell mad-cell-btn" onClick={() => onFilter({ scope: "vehicle", vehicleStatus: "in_use" })}>
            <div className="ml-statcard-n green">{f.vehicles.inUse}</div>
            <div className="ml-statcard-l">in use</div>
          </button>
          <button type="button" className="ml-statcard-cell mad-cell-btn" onClick={() => onFilter({ scope: "vehicle", vehicleStatus: "unused" })}>
            <div className="ml-statcard-n gray">{f.vehicles.unused}</div>
            <div className="ml-statcard-l">unused</div>
          </button>
          <button type="button" className="ml-statcard-cell mad-cell-btn" onClick={() => onFilter({ scope: "vehicle", vehicleStatus: "inactive" })}>
            <div className="ml-statcard-n red">{f.vehicles.inactive}</div>
            <div className="ml-statcard-l">inactive</div>
          </button>
        </div>
      </div>

      <div className="ml-statcard">
        <div className="ml-statcard-head">
          <div className="ml-statcard-main">
            <div className="ml-statcard-ico green"><Icon name="badge" size={20} fill={1} /></div>
            <div className="ml-statcard-count">{f.drivers.total}</div>
          </div>
        </div>
        <div className="ml-statcard-labelrow"><span className="ml-statcard-label">Drivers</span></div>
        <div className="ml-statcard-band">
          <button type="button" className="ml-statcard-cell mad-cell-btn" onClick={() => onFilter({ scope: "driver", driverStatus: "on_duty" })}>
            <div className="ml-statcard-n green">{f.drivers.onDuty}</div>
            <div className="ml-statcard-l">on duty</div>
          </button>
          <button type="button" className="ml-statcard-cell mad-cell-btn" onClick={() => onFilter({ scope: "driver", driverStatus: "off_duty" })}>
            <div className="ml-statcard-n gray">{f.drivers.offDuty}</div>
            <div className="ml-statcard-l">off duty</div>
          </button>
        </div>
      </div>

      <div className="ed-kpi-tile" onClick={() => onFilter({ bucket: "Expired" })}>
        <CountCard icon="warning" tone="red" count={f.expiredDocs.count} label="Expired Documents" sub="Action needed" />
      </div>

      <div className="ml-statcard mad-cell-btn" onClick={() => onFilter({ bucket: "0-30" })} role="button" tabIndex={0}>
        <div className="ml-statcard-head">
          <div className="ml-statcard-main">
            <div className="ml-statcard-ico amber"><Icon name="schedule" size={20} fill={1} /></div>
            <div className="ml-statcard-count">{f.dueSoon.count}</div>
          </div>
        </div>
        <div className="ml-statcard-labelrow"><span className="ml-statcard-label">Due Soon</span></div>
        <button type="button" className="mad-inline-link" onClick={(e) => { e.stopPropagation(); onFilter({ bucket: "0-7 days" }); }}>
          {f.dueSoon.within7} within 7 days
        </button>
      </div>
    </div>
  );
}

/* ── Document Expiry chart — stacked bar, vehicle/driver toggle ──── */
function DocumentExpiryChart({ scope, setScope, onFilter }) {
  const [hover, setHover] = useState(null);
  const group = D.docExpiry[scope];
  const buckets = D.docExpiry.buckets;
  const maxVal = Math.max(1, ...group.series.map((row) => group.types.reduce((sum, t) => sum + row[t], 0)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));
  const TONES = ["#00AA4F", "#2F80ED", "#F2994A", "#9B51E0", "#94A8B2"];

  const chips = [
    { label: "Expired", count: D.fleet.expiredDocs.count, bucket: "Expired" },
    { label: "0-7 days", count: D.fleet.dueSoon.within7, bucket: "0-7 days" },
    { label: "8-30 days", count: group.series[2] ? group.types.reduce((s, t) => s + group.series[2][t], 0) : 0, bucket: "8-30 days" },
    { label: "31-60 days", count: group.series[3] ? group.types.reduce((s, t) => s + group.series[3][t], 0) : 0, bucket: "31-60 days" },
    { label: "61-90 days", count: group.series[4] ? group.types.reduce((s, t) => s + group.series[4][t], 0) : 0, bucket: "61-90 days" },
  ];

  return (
    <div className="ed-card mad-chartcard">
      <CardHead
        icon="bar_chart"
        title="Document expiry"
        sub="Track vehicle and driver documents by expiry window."
        right={
          <div className="mad-chart-controls">
            <Segmented value={scope} onChange={setScope} options={[{ value: "vehicle", label: "Vehicle docs" }, { value: "driver", label: "Driver docs" }]} />
            <ExportMenu comingSoon />
          </div>
        }
      />
      <div className="mad-chip-row">
        {chips.map((c) => (
          <button key={c.label} type="button" className="mad-chip" onClick={() => onFilter({ scope, bucket: c.bucket })}>
            {c.label}: {c.count}
          </button>
        ))}
      </div>
      <div className="ed-chart">
        <div className="ed-chart-plotwrap">
          <div className="ed-chart-yaxis">
            {ticks.slice().reverse().map((t, i) => <span key={i}>{t}</span>)}
          </div>
          <div className="ed-chart-plot">
            <div className="ed-bars">
              {group.series.map((row, i) => {
                const total = group.types.reduce((s, t) => s + row[t], 0);
                return (
                  <div key={i} className="ed-bar-col" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                    {hover === i && (
                      <div className="ed-bar-tip">
                        <div className="ed-bar-tip-val">{N(total)} total · {buckets[i]}</div>
                        {group.types.map((t, ti) => (
                          <div className="ed-bar-tip-row" key={t}><i className="ed-dot" style={{ background: TONES[ti % TONES.length] }} />{t} {N(row[t])}</div>
                        ))}
                      </div>
                    )}
                    <div className="ed-bar-track">
                      {group.types.slice().reverse().map((t) => {
                        const ti = group.types.indexOf(t);
                        return (
                          <div key={t} className="ed-bar-seg" style={{ height: `${(row[t] / maxVal) * 100}%`, background: TONES[ti % TONES.length], cursor: "pointer" }}
                            onClick={() => onFilter({ scope, bucket: buckets[i], docType: t })} />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="ed-chart-xaxis">
          {buckets.map((b, i) => <span key={i}>{b}</span>)}
        </div>
        <div className="ed-chart-legend">
          {group.types.map((t, ti) => (
            <span key={t}><i className="ed-dot" style={{ background: TONES[ti % TONES.length] }} />{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Document Action List ─────────────────────────────────────── */
const DOC_TYPE_OPTIONS = [{ value: "all", label: "All document types" },
  ...Array.from(new Set([...D.docExpiry.vehicle.types, ...D.docExpiry.driver.types])).map((t) => ({ value: t, label: t }))];
const BUCKET_OPTIONS = [{ value: "all", label: "All expiry buckets" }, ...D.docExpiry.buckets.map((b) => ({ value: b, label: b }))];

function DocumentActionList({ filter, setFilter, listRef }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const rows = useMemo(() => {
    return D.documentActions.filter((r) => {
      if (search && !r.subject.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter.scope && r.scope !== filter.scope) return false;
      if (filter.docType && filter.docType !== "all" && r.docType !== filter.docType) return false;
      if (filter.bucket === "0-30" && !["Expired", "0-7 days", "8-30 days"].includes(r.bucket)) return false;
      else if (filter.bucket && filter.bucket !== "0-30" && filter.bucket !== "all" && r.bucket !== filter.bucket) return false;
      if (filter.vehicleStatus || filter.driverStatus) return false; // vehicle/driver-status filters have no document-list analog
      return true;
    });
  }, [search, filter]);

  const pageRows = rows.slice((page - 1) * perPage, page * perPage);
  const activeFilterCount = ["scope", "docType", "bucket"].filter((k) => filter[k] && filter[k] !== "all").length;

  return (
    <div className="ed-card mad-doclist" ref={listRef}>
      <CardHead icon="description" title="Documents needing action" sub="Showing expired and due within 7 days first." />
      <div className="mad-doclist-controls">
        <div className="hac-search-bar mad-search">
          <Icon name="search" size={16} />
          <input placeholder="Search vehicle / driver" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          {search && <button type="button" onClick={() => setSearch("")}><Icon name="close" size={14} /></button>}
        </div>
        <SelectMenu value={filter.docType || "all"} options={DOC_TYPE_OPTIONS} onChange={(v) => { setFilter({ ...filter, docType: v }); setPage(1); }} className="hac-select" />
        <SelectMenu value={filter.bucket || "all"} options={BUCKET_OPTIONS} onChange={(v) => { setFilter({ ...filter, bucket: v }); setPage(1); }} className="hac-select" />
        {activeFilterCount > 0 && (
          <button type="button" className="mad-clear-filters" onClick={() => setFilter({})}>Clear filters</button>
        )}
      </div>
      <div className="ml-table-wrap">
        <table className="ml-table">
          <thead>
            <tr>
              <th>Vehicle / Driver</th>
              <th>Document</th>
              <th style={{ textAlign: "right" }}>Expiry Date</th>
              <th style={{ textAlign: "right" }}>Days Left</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={6} className="ed-emptyrow">No documents match this filter.</td></tr>
            ) : pageRows.map((r, i) => (
              <tr key={i}>
                <td>{r.subject}</td>
                <td>{r.docType}</td>
                <td style={{ textAlign: "right" }}>{r.expiryDate}</td>
                <td style={{ textAlign: "right" }}>{r.daysLabel}</td>
                <td><StatusBadge status={r.status} /></td>
                <td><a href="#" className="ml-btn-text-blue">{r.status === "expired" ? "Renew" : "Renew"}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={page} perPage={perPage} total={rows.length} onPage={setPage} perPageOptions={[10, 25, 50]} />
    </div>
  );
}

/* ── Activity Tabs ─────────────────────────────────────────────── */
const ACTIVITY_TABS = [
  { key: "checklist", label: "Checklist Endorsement" },
  { key: "checkinout", label: "Check-in / Check-out" },
];

function ChecklistEndorsementTable() {
  return (
    <>
      <div className="mad-tab-head">
        <h2 className="ed-sec-title">Latest checklist submissions</h2>
        <div className="mad-tab-sub">Most recent submissions requiring review.</div>
      </div>
      <div className="ml-table-wrap">
        <table className="ml-table">
          <thead>
            <tr><th>Vehicle</th><th>Driver</th><th>Submitted</th><th>Type</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {D.checklists.map((r, i) => (
              <tr key={i}>
                <td>{r.vehicle}</td>
                <td>{r.driver}</td>
                <td>{r.submitted}</td>
                <td>{r.type}</td>
                <td><StatusBadge status={r.status} /></td>
                <td><a href="#" className="ml-btn-text-blue">{r.status === "pending_endorsement" ? "Endorse" : "View"}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ed-queue-footer"><a className="ml-btn-text-blue" href="#">View all checklist submissions<Icon name="chevron_right" size={16} /></a></div>
    </>
  );
}

function CheckInOutTable() {
  return (
    <>
      <div className="mad-tab-head">
        <h2 className="ed-sec-title">Latest check-in / check-out</h2>
        <div className="mad-tab-sub">Recent driver activity from managed vehicles.</div>
      </div>
      <div className="ml-table-wrap">
        <table className="ml-table">
          <thead>
            <tr><th>Vehicle</th><th>Driver</th><th>Event</th><th style={{ textAlign: "right" }}>Time</th><th style={{ textAlign: "right" }}>Odometer</th><th>Status</th></tr>
          </thead>
          <tbody>
            {D.checkInOut.map((r, i) => (
              <tr key={i}>
                <td>{r.vehicle}</td>
                <td>{r.driver}</td>
                <td>{r.event === "check_in" ? "Check-in" : "Check-out"}</td>
                <td style={{ textAlign: "right" }}>{r.time}</td>
                <td style={{ textAlign: "right" }}>{r.odometer}</td>
                <td><StatusBadge status={"checkin_" + r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ed-queue-footer"><a className="ml-btn-text-blue" href="#">View all check-in / check-out<Icon name="chevron_right" size={16} /></a></div>
    </>
  );
}

function ActivityTabs() {
  const [tab, setTab] = useState("checklist");
  return (
    <div className="ed-card mad-activity">
      <div className="ml-tabs">
        {ACTIVITY_TABS.map((t) => (
          <button key={t.key} className={"ml-tab" + (t.key === tab ? " active" : "")} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "checklist" ? <ChecklistEndorsementTable /> : <CheckInOutTable />}
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [filter, setFilter] = useState({});
  const [chartScope, setChartScope] = useState("vehicle");
  const listRef = useRef(null);

  function handleFilter(next) {
    if (next.scope) setChartScope(next.scope);
    setFilter(next);
    if (listRef.current) listRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mad-shell">
      <Rail />
      <main className="mad-main">
        <div className="mad-topbar">
          <OrgSwitcher orgs={D.orgs} initialId={D.org.id} />
          <div className="mad-topbar-spacer" />
          <div style={{ fontSize: 12, color: "var(--fg-tertiary)" }}>MyAdmin module</div>
          <button className="mad-iconbtn" type="button" aria-label="Notifications"><Icon name="notifications" size={18} /></button>
        </div>
        <div className="mad-content">
          <div className="mad-pagehead">
            <div>
              <div className="mad-breadcrumb">MyAdmin / Dashboard</div>
              <h1 className="mad-title">MyAdmin Dashboard</h1>
              <div className="mad-subtitle">Monitor fleet readiness, document expiry, and latest driver submissions.</div>
            </div>
            <div className="mad-headctl">
              <div className="mad-datepill"><Icon name="calendar_today" size={14} /> {D.dateLabel}</div>
              <ExportMenu comingSoon />
            </div>
          </div>

          <FleetSummary onFilter={handleFilter} />
          <DocumentExpiryChart scope={chartScope} setScope={setChartScope} onFilter={handleFilter} />
          <DocumentActionList filter={filter} setFilter={setFilter} listRef={listRef} />
          <ActivityTabs />
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

}
