{

const { useState, useMemo, useRef, useEffect } = React;
const { Icon, OrgSwitcher, CountCard, CardHead, Segmented, Pager, StatusBadge, ExportMenu, ChecklistCard } = window.SharedShell;
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

function getDocumentFilterSummary(filter, scope) {
  const scopeLabel = scope === "driver" ? "Driver documents" : "Vehicle documents";
  const parts = [scopeLabel];
  if (filter.bucket && filter.bucket !== "all") parts.push(filter.bucket);
  if (filter.docType && filter.docType !== "all") parts.push(filter.docType);
  return parts.join(" · ");
}

/* ── Fleet Status Summary ─────────────────────────────────────── */
function FleetSummary({ onFilter }) {
  const f = D.fleet;
  return (
    <div className="mad-kpi-stack">
      <div className="mad-kpi-row">
        <div className="ml-statcard mad-kpi-primary">
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

        <div className="ml-statcard mad-kpi-primary">
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

      </div>
      <div className="mad-kpi-alerts" aria-label="Document alerts">
        <button type="button" className="mad-kpi-alert mad-kpi-alert-red" onClick={() => onFilter({ bucket: "Expired" })}>
          <span className="mad-kpi-alert-icon"><Icon name="warning" size={16} fill={1} /></span>
          <span className="mad-kpi-alert-copy">
            <span className="mad-kpi-alert-label">Expired documents</span>
            <span className="mad-kpi-alert-sub">Action needed</span>
          </span>
          <span className="mad-kpi-alert-count">{f.expiredDocs.count}</span>
        </button>
        <button type="button" className="mad-kpi-alert mad-kpi-alert-amber" onClick={() => onFilter({ bucket: "0-30" })}>
          <span className="mad-kpi-alert-icon"><Icon name="schedule" size={16} fill={1} /></span>
          <span className="mad-kpi-alert-copy">
            <span className="mad-kpi-alert-label">Due soon</span>
            <span className="mad-kpi-alert-sub">{f.dueSoon.within7} within 7 days</span>
          </span>
          <span className="mad-kpi-alert-count">{f.dueSoon.count}</span>
        </button>
      </div>
    </div>
  );
}

/* ── Document Expiry chart — stacked bar, vehicle/driver toggle ──── */
function DocumentExpiryChart({ scope, onFilter, filter }) {
  const [hover, setHover] = useState(null);
  const group = D.docExpiry[scope];
  const buckets = D.docExpiry.buckets;
  const maxVal = Math.max(1, ...group.series.map((row) => group.types.reduce((sum, t) => sum + row[t], 0)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));
  const TONES = ["#00AA4F", "#0081AA", "#F5A623", "#1A2472", "#94A8B2"];
  const chips = buckets.map((bucket, i) => ({
    label: bucket,
    bucket,
    count: group.series[i] ? group.types.reduce((s, t) => s + group.series[i][t], 0) : 0,
    tone: i === 0 ? "red" : i === 1 ? "amber" : i === 2 ? "teal" : i === 3 ? "navy" : "green",
  }));

  return (
    <div className="mad-chartcard">
      <div className="mad-range-panel">
        <div className="mad-range-list">
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              className={`mad-range-card ${c.tone}${filter.bucket === c.bucket ? " active" : ""}`}
              onClick={() => onFilter({ scope, bucket: c.bucket })}
            >
              <span className="mad-range-card-label">{c.label}</span>
              <span className="mad-range-card-count">{c.count}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mad-chart-body">
        <div className="mad-chart-panel">
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
      </div>
    </div>
  );
}

/* ── Document Action List ─────────────────────────────────────── */
function DocumentActionList({ filter, listRef, chartScope }) {
  const [page, setPage] = useState(1);
  const perPage = 4;
  const activeScope = filter.scope || chartScope || "vehicle";

  const rows = useMemo(() => {
    return D.documentActions.filter((r) => {
      if (r.scope !== activeScope) return false;
      if (filter.docType && filter.docType !== "all" && r.docType !== filter.docType) return false;
      if (filter.bucket === "0-30" && !["Expired", "0-7 days", "8-30 days"].includes(r.bucket)) return false;
      else if (filter.bucket && filter.bucket !== "0-30" && filter.bucket !== "all" && r.bucket !== filter.bucket) return false;
      if (filter.vehicleStatus || filter.driverStatus) return false; // vehicle/driver-status filters have no document-list analog
      return true;
    });
  }, [activeScope, filter]);

  const pageRows = rows.slice((page - 1) * perPage, page * perPage);
  useEffect(() => {
    setPage(1);
  }, [activeScope, filter.bucket, filter.docType]);

  return (
    <div className="mad-doclist" ref={listRef}>
      {pageRows.length === 0 ? (
        <div className="ed-emptyrow">No documents match this filter.</div>
      ) : (
        <div className="mad-doc-grid">
          {pageRows.map((r, i) => (
            <article key={`${r.subject}-${r.docType}-${i}`} className="mad-doc-row">
              <div className="mad-doc-row-top">
                <div className={`mad-doc-card-icon ${r.status === "expired" ? "expired" : "soon"}`}>
                  <Icon name={activeScope === "vehicle" ? "local_shipping" : "badge"} size={18} />
                </div>
                <div className="mad-doc-row-copy">
                  <div className="mad-doc-card-subject">{r.subject}</div>
                  <div className="mad-doc-card-type">{r.docType}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mad-doc-row-grid">
                <div className="mad-doc-card-field">
                  <span className="mad-doc-card-label">Expiry date</span>
                  <span className="mad-doc-card-value">{r.expiryDate}</span>
                </div>
                <div className="mad-doc-card-field">
                  <span className="mad-doc-card-label">Expiry range</span>
                  <span className="mad-doc-card-value">{r.bucket}</span>
                </div>
                <div className="mad-doc-card-field">
                  <span className="mad-doc-card-label">Time left</span>
                  <span className={`mad-doc-card-value ${r.status === "expired" ? "expired" : "soon"}`}>{r.daysLabel}</span>
                </div>
              </div>
              <div className="mad-doc-row-footer">
                <button type="button" className="ml-btn-text-blue">Review and renew<Icon name="chevron_right" size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      <Pager page={page} perPage={perPage} total={rows.length} onPage={setPage} perPageOptions={[6, 12, 24]} />
    </div>
  );
}

function DocumentExpiryModule({ filter, chartScope, setChartScope, onFilter, listRef }) {
  function handleScopeChange(nextScope) {
    setChartScope(nextScope);
    onFilter({
      scope: nextScope,
      bucket: filter.bucket && filter.bucket !== "all" ? filter.bucket : undefined,
    });
  }

  return (
    <div className="ed-card mad-doc-expiry-layout">
      <CardHead
        icon="bar_chart"
        title="Document expiry"
        sub="Track vehicle and driver documents by expiry window."
        right={
          <div className="mad-chart-controls">
            <Segmented value={chartScope} onChange={handleScopeChange} options={[{ value: "vehicle", label: "Vehicle docs" }, { value: "driver", label: "Driver docs" }]} />
            <ExportMenu comingSoon />
          </div>
        }
      />
      <div className="mad-doc-expiry-main">
        <DocumentExpiryChart
          scope={chartScope}
          onFilter={onFilter}
          filter={filter}
        />
      </div>
      <div className="mad-doc-expiry-side">
        <DocumentActionList filter={filter} listRef={listRef} chartScope={chartScope} />
      </div>
    </div>
  );
}

/* ── Activity Tabs ─────────────────────────────────────────────── */
const ACTIVITY_TABS = [
  { key: "checklist", label: "Checklist Endorsement" },
  { key: "checkinout", label: "Check-in / Check-out" },
];

function ChecklistEndorsementGrid() {
  return (
    <>
      <div className="mad-tab-head">
        <h2 className="ed-sec-title">Latest checklist submissions</h2>
        <div className="mad-tab-sub">Most recent submissions requiring review.</div>
      </div>
      <div className="mad-activity-grid">
        {D.checklists.map((r) => <ChecklistCard key={`${r.plate}-${r.checkIn}`} row={r} />)}
      </div>
      <div className="ed-queue-footer"><a className="ml-btn-text-blue" href="#">View all checklist submissions<Icon name="chevron_right" size={16} /></a></div>
    </>
  );
}

function CheckInOutGrid() {
  return (
    <>
      <div className="mad-tab-head">
        <h2 className="ed-sec-title">Latest check-in / check-out</h2>
        <div className="mad-tab-sub">Recent driver activity from managed vehicles.</div>
      </div>
      <div className="mad-activity-grid mad-activity-grid--compact">
        {D.checkInOut.map((r) => (
          <article key={`${r.vehicle}-${r.time}`} className="od-preview-card od-checklist-card mad-check-card">
            <div className="od-cl-header">
              <img className="od-cl-avatar" src={`https://i.pravatar.cc/64?u=${encodeURIComponent(r.vehicle)}`} alt={r.driver} />
              <div className="od-cl-meta">
                <div className="od-cl-name">{r.driver}</div>
                <div className="od-cl-plate">{r.vehicle}</div>
              </div>
            </div>
            <div className="od-cl-divider" />
            <div className="od-cl-checkinout mad-check-card-body">
              <div className="od-cl-col">
                <div className="od-cl-col-label">
                  <Icon name={r.event === "check_in" ? "login" : "logout"} size={14} color={r.event === "check_in" ? "var(--green-600)" : "var(--red-400)"} />
                  {r.event === "check_in" ? "Check-in" : "Check-out"}
                </div>
                <div className="od-cl-col-val">{r.time}</div>
                <div className="od-cl-col-sub">Status: {r.status === "active" ? "Active" : "Completed"}</div>
              </div>
              <div className="od-cl-col">
                <div className="od-cl-col-label">
                  <Icon name="pin_drop" size={14} color="var(--fg-tertiary)" />
                  Vehicle data
                </div>
                <div className="od-cl-col-val">{r.odometer}</div>
                <div className="od-cl-col-sub">Recorded: {r.status === "active" ? "Live update" : "Synced"}</div>
              </div>
            </div>
            <div className="od-cl-divider" />
            <div className={"od-cl-decision " + (r.status === "active" ? "od-cl-decision-good" : "mad-check-card-decision-neutral")}>
              <Icon name={r.status === "active" ? "schedule" : "check_circle"} size={16} />
              {r.status === "active" ? "Awaiting latest trip sync" : "Trip record synced"}
            </div>
          </article>
        ))}
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
      {tab === "checklist" ? <ChecklistEndorsementGrid /> : <CheckInOutGrid />}
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
          <a className="mad-iconbtn mad-closebtn" href="../org-dashboard/index.html" aria-label="Close and return to organization dashboard">
            <Icon name="close" size={18} />
          </a>
        </div>
        <div className="mad-content">
          <div className="mad-pagehead">
            <div>
              <h1 className="mad-title">MyAdmin Dashboard</h1>
              <div className="mad-subtitle">Monitor fleet readiness, document expiry, and latest driver submissions.</div>
            </div>
          </div>

          <div className="mad-overview">
            <FleetSummary onFilter={handleFilter} />
            <div className="mad-overview-main">
              <DocumentExpiryModule filter={filter} chartScope={chartScope} setChartScope={setChartScope} onFilter={handleFilter} listRef={listRef} />
              <ActivityTabs />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

}
