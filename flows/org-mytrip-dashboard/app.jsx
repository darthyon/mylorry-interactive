{

const { useState, useMemo, useRef, useEffect } = React;
const { Icon, OrgSwitcher, CardHead, Segmented, StatusBadge, ExportMenu, Pager, SelectMenu, CountCard } = window.SharedShell;
const D = window.MYTRIP_DASH;

const N = (n) => Number(n).toLocaleString("en-US");
const vehicleById = (id) => D.vehicles.find((v) => v.id === id);
const driverById = (id) => D.drivers.find((d) => d.id === id);
const tripById = (id) => D.trips.find((t) => t.id === id);

const TRIP_STATUS_KEY = {
  completed: "trip_completed", ongoing: "trip_ongoing", pending: "trip_pending",
  paused: "trip_paused", terminated: "trip_terminated",
};
const FLEET_STATUS_KEY = { in_progress: "veh_in_progress", idle: "veh_idle", assigned: "veh_assigned" };

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "mtd", label: "Month-to-date" },
  { value: "six", label: "Last 6 months" },
];
const RANGE_LABEL = { today: "Today", mtd: "Month-to-date", six: "Last 6 months" };

/* ── Rail ──────────────────────────────────────────────────────── */
const MYTRIP_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "trips", label: "Trips", icon: "route" },
  { key: "schedule", label: "Schedule", icon: "calendar_view_day" },
];

function Rail({ active, go }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`mt-rail-wrap${expanded ? " expanded" : ""}`}>
      <nav className={`mt-rail${expanded ? " expanded" : ""}`} aria-label="MyTrip navigation">
        <div className="mt-rail-profile">
          <div className="mt-rail-avatar-wrap">
            <div className="mt-rail-avatar"><Icon name="person" size={18} fill={1} color="#94A8B2" /></div>
            {!expanded && <span className="mt-rail-badge">ORG</span>}
          </div>
          {expanded && (
            <div className="mt-rail-profile-text">
              <span className="mt-rail-profile-role">MyTrip</span>
              <span className="mt-rail-profile-name">Module</span>
            </div>
          )}
        </div>

        {MYTRIP_ITEMS.map((item) => (
          <button key={item.key} type="button"
            className={`mt-rail-item${item.key === active ? " active" : ""}`}
            onClick={() => go({ name: item.key })}>
            <Icon name={item.icon} size={20} fill={item.key === active ? 1 : 0} />
            <span>{item.label}</span>
          </button>
        ))}

        <div className="mt-rail-divider" />
        <div className="mt-rail-footer">
          <a href="../org-dashboard/index.html" className="mt-rail-item mt-rail-signout">
            <Icon name="logout" size={20} />
            {expanded && <span>Back to Home</span>}
          </a>
        </div>
      </nav>
      <button type="button" className="mt-rail-toggle" onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}>
        <Icon name="chevron_left" size={16} />
      </button>
    </div>
  );
}

/* ── Toast ─────────────────────────────────────────────────────── */
function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = (msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = toast ? (
    <div className="ml-toast" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 1100 }}>
      <Icon name="check_circle" size={16} color="#00AA4F" /> {toast}
    </div>
  ) : null;
  return [show, node];
}

/* ── Dashboard: KPI row ────────────────────────────────────────── */
const KPI_TOTAL = D.kpis.completed + D.kpis.ongoing + D.kpis.pending + D.kpis.paused;
const KPI_DEFS = [
  { key: "completed", label: "Completed", icon: "check_circle", tone: "green", sub: `of ${KPI_TOTAL} trips today` },
  { key: "ongoing", label: "Ongoing", icon: "local_shipping", tone: "green", sub: "on the road now" },
  { key: "pending", label: "Pending", icon: "schedule", tone: "green", sub: "departing later today" },
  { key: "paused", label: "Paused", icon: "pause_circle", tone: "amber", sub: "needs attention" },
];

function KpiRow({ go }) {
  return (
    <div className="mt-kpi-row">
      {KPI_DEFS.map((k) => {
        const count = D.kpis[k.key];
        const attention = k.key === "paused" && count > 0;
        return (
          <div key={k.key} className={attention ? "mt-kpi-attn" : undefined}>
            <CountCard icon={k.icon} count={count} label={k.label} sub={k.sub} tone={k.tone} fill
              actionLabel={`View ${k.label.toLowerCase()} trips`}
              onClick={() => go({ name: "trips", tab: "trips", filter: { status: k.key, range: "today" } })} />
          </div>
        );
      })}
    </div>
  );
}

/* ── Dashboard: Assigned vs Completed — horizontal bar rows ────── */
const CHART_PER_PAGE = 5;

function TripChartCard({ go }) {
  const [scope, setScope] = useState("vehicle");
  const [range, setRange] = useState("today");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return D.chart[scope][range]
      .filter((r) => !q || r.label.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => b.assigned - a.assigned);
  }, [scope, range, query]);

  useEffect(() => { setPage(1); }, [scope, range, query]);

  const maxVal = Math.max(1, ...rows.map((r) => r.assigned));
  const totalPages = Math.max(1, Math.ceil(rows.length / CHART_PER_PAGE));
  const start = (page - 1) * CHART_PER_PAGE;
  const shown = rows.slice(start, start + CHART_PER_PAGE);

  return (
    <div className="mt-card">
      <CardHead icon="bar_chart" title="Trips per vehicle / driver" sub="Total assigned vs total completed"
        right={
          <div className="mt-chart-controls">
            <Segmented value={scope} onChange={setScope}
              options={[{ value: "vehicle", label: "Per Vehicle" }, { value: "driver", label: "Per Driver" }]} />
            <SelectMenu value={range} options={RANGE_OPTIONS} onChange={setRange} ariaLabel="Time range"
              wrapperClassName="hac-select-wrap compact" className="hac-select" />
            <ExportMenu />
          </div>
        } />
      <div className="mt-hbar-toolbar">
        <div className="mt-search">
          <Icon name="search" size={16} color="var(--fg-tertiary)" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={scope === "vehicle" ? "Search vehicle" : "Search driver"}
            aria-label={scope === "vehicle" ? "Search vehicle" : "Search driver"} />
        </div>
        <span className="mt-hbar-count">{rows.length} {scope === "vehicle" ? "vehicles" : "drivers"}</span>
      </div>
      <div className="mt-hbar-list">
        {shown.length === 0 && <div className="mt-empty">No {scope === "vehicle" ? "vehicles" : "drivers"} match this search.</div>}
        {shown.map((r) => (
          <button key={r.id} type="button" className="mt-hbar-row"
            title={`${r.label} · ${N(r.completed)} completed of ${N(r.assigned)} assigned — view trips`}
            onClick={() => go({
              name: "trips", tab: "trips",
              filter: scope === "vehicle" ? { vehicleId: r.id, range } : { driverId: r.id, range },
            })}>
            <span className="mt-hbar-label">{r.label}</span>
            <span className="mt-hbar-track">
              <i className="mt-hbar-fill assigned" style={{ width: `${(r.assigned / maxVal) * 100}%` }} />
              <i className="mt-hbar-fill completed" style={{ width: `${(r.completed / maxVal) * 100}%` }} />
            </span>
            <span className="mt-hbar-val">{N(r.completed)} / {N(r.assigned)}</span>
          </button>
        ))}
      </div>
      <div className="mt-hbar-footer">
        <span className="mt-hbar-count">
          {rows.length === 0 ? "0 of 0" : `${start + 1}–${Math.min(start + CHART_PER_PAGE, rows.length)} of ${rows.length}`}
        </span>
        <div className="ml-pager-nav">
          <button type="button" className="ml-pager-btn" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
            <Icon name="chevron_left" size={18} />
          </button>
          <button type="button" className="ml-pager-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)} aria-label="Next page">
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      </div>
      <div className="mt-chart-legend">
        <span><i className="mt-dot" style={{ background: "#00AA4F" }} />Completed</span>
        <span><i className="mt-dot" style={{ background: "#0081AA" }} />Assigned, not yet completed</span>
      </div>
    </div>
  );
}

/* ── Dashboard: paused trips card ──────────────────────────────── */
function PausedCard({ go }) {
  const paused = D.trips.filter((t) => t.status === "paused");
  return (
    <div className="mt-card">
      <CardHead icon="pause_circle" tone="amber" title="Paused trips" sub="Needs attention — trips currently on hold" />
      {paused.length === 0 ? (
        <div className="mt-empty">
          <Icon name="check_circle" size={28} color="var(--green-500)" />
          No paused trips right now.
        </div>
      ) : (
        <div className="mt-paused-list">
          {paused.map((t) => {
            const v = vehicleById(t.vehicleId); const d = driverById(t.driverId);
            return (
              <button key={t.id} type="button" className="mt-paused-row"
                onClick={() => go({ name: "detail", tripId: t.id, from: { name: "dashboard" } })}>
                <div className="mt-paused-ico"><Icon name="pause_circle" size={18} fill={1} /></div>
                <div className="mt-paused-copy">
                  <div className="mt-paused-main">{v.plate} · {d.name}</div>
                  <div className="mt-paused-sub">{t.from} → {t.to} · {t.pauseReason}</div>
                </div>
                <div className="mt-paused-dur">{t.pausedFor}</div>
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-card-footer">
        <button type="button" className="ml-btn-text-blue"
          onClick={() => go({ name: "trips", tab: "trips", filter: { status: "paused", range: "today" } })}>
          View all paused trips<Icon name="chevron_right" size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Dashboard: schedule entry + trips link ────────────────────── */
const TL_START = 4, TL_END = 22; // schedule timeline window (hours)
const tlPct = (h) => ((h - TL_START) / (TL_END - TL_START)) * 100;

const OPS_TICKS = [6, 9, 12, 15, 18, 21];
const fleetStatusOf = (vehicleId) => D.fleetStatus.find((r) => r.vehicleId === vehicleId);

/* Shared fleet timeline — dashboard preview (dense) and Schedule page (roomy)
   render the same anatomy. onRow makes the whole row a target; onBar makes
   individual trip bars targets (use one or the other, not both). */
function TimelineLegend({ showNow }) {
  return (
    <div className="mt-tl-legend">
      <span><i className="mt-dot" style={{ background: "var(--green-500)" }} />Completed</span>
      <span><i className="mt-dot" style={{ background: "#0081AA" }} />Assigned</span>
      <span><i className="mt-dot" style={{ background: "var(--red-400)" }} />Terminated</span>
      {showNow && <span><i className="mt-dot" style={{ background: "var(--red-400)", borderRadius: "50%" }} />Now · {D.nowLabel}</span>}
    </div>
  );
}

function FleetTimeline({ rows, showNow, onRow, onBar, roomy }) {
  return (
    <div className={"mt-ops" + (roomy ? " roomy" : "")}>
      <div className="mt-ops-axis" aria-hidden="true">
        <span className="mt-ops-axis-label" />
        <div className="mt-ops-axis-track">
          {OPS_TICKS.map((h) => (
            <span key={h} className="mt-ops-tick" style={{ left: `${tlPct(h)}%` }}>{fmtHour(h)}</span>
          ))}
        </div>
        <span className="mt-ops-frac" />
      </div>
      {rows.map((row) => {
        const v = vehicleById(row.vehicleId);
        const st = fleetStatusOf(row.vehicleId);
        const d = st && driverById(st.driverId);
        const done = row.bars.filter((b) => b.status === "completed").length;
        const planned = row.bars.filter((b) => b.status !== "terminated").length;
        const RowTag = onRow ? "button" : "div";
        return (
          <RowTag key={row.vehicleId} {...(onRow ? { type: "button", onClick: () => onRow(row) } : {})}
            className="mt-ops-row">
            <span className="mt-ops-veh">
              <span className={"mt-ops-dot " + (st ? st.status : "idle")} />
              <span className="mt-ops-veh-copy">
                <span className="mt-ops-plate">{v.plate}</span>
                <span className="mt-ops-driver">{d ? d.name : "Unassigned"}</span>
              </span>
            </span>
            <span className="mt-ops-lane">
              {OPS_TICKS.map((h) => <i key={h} className="mt-ops-grid" style={{ left: `${tlPct(h)}%` }} />)}
              {showNow && <i className="mt-ops-now" style={{ left: `${tlPct(D.nowHour)}%` }} />}
              {row.bars.map((b) => {
                const style = { left: `${tlPct(b.start)}%`, width: `${Math.max(tlPct(b.end) - tlPct(b.start), 1.5)}%` };
                const tip = `${b.tripId} · ${fmtHour(Math.floor(b.start))}–${fmtHour(Math.ceil(b.end))} · ${b.status}`;
                return onBar ? (
                  <button key={b.tripId} type="button" className={"mt-ops-bar " + b.status}
                    style={style} title={tip} aria-label={tip} onClick={() => onBar(b)} />
                ) : (
                  <i key={b.tripId} className={"mt-ops-bar " + b.status} style={style} title={tip} />
                );
              })}
            </span>
            <span className="mt-ops-frac">{done}/{planned} done</span>
          </RowTag>
        );
      })}
      {rows.length === 0 && <div className="mt-empty">No vehicles match this filter.</div>}
    </div>
  );
}

function TodayOperationsCard({ go }) {
  const onRoad = D.fleetStatus.filter((r) => r.status === "in_progress").length;
  const idle = D.fleetStatus.filter((r) => r.status === "idle").length;
  const nextDeparture = D.trips.filter((t) => t.status === "pending")[0];
  const openRow = (row) => {
    const st = fleetStatusOf(row.vehicleId);
    if (st && st.tripId) go({ name: "detail", tripId: st.tripId, from: { name: "dashboard" } });
    else go({ name: "schedule" });
  };
  return (
    <div className="mt-card">
      <CardHead icon="calendar_view_day" title="Today&rsquo;s operations"
        sub={`${onRoad} on the road · ${idle} idle` +
          (nextDeparture ? ` · next departure ${nextDeparture.scheduled} (${vehicleById(nextDeparture.vehicleId).plate})` : "")}
        right={
          <button type="button" className="ml-btn-soft" onClick={() => go({ name: "schedule" })}>
            Open schedule <Icon name="arrow_forward" size={16} />
          </button>
        } />
      <FleetTimeline rows={D.schedule.today} showNow onRow={openRow} />
      <div className="mt-ops-footer">
        <TimelineLegend showNow />
        <div className="mt-ops-links">
          <button type="button" className="ml-btn-text-blue" onClick={() => go({ name: "trips", tab: "trips", filter: {} })}>
            All trips ({D.trips.length})<Icon name="chevron_right" size={16} />
          </button>
          <button type="button" className="ml-btn-text-blue" onClick={() => go({ name: "trips", tab: "fleet", filter: {} })}>
            Fleet status<Icon name="chevron_right" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ go }) {
  return (
    <>
      <div className="mt-pagehead">
        <div>
          <h1 className="mt-title">MyTrip Dashboard</h1>
          <div className="mt-subtitle">Today&rsquo;s trip activity, fleet performance, and schedules · {D.dateLabel}</div>
        </div>
      </div>
      <KpiRow go={go} />
      <div className="mt-band">
        <TripChartCard go={go} />
        <PausedCard go={go} />
      </div>
      <TodayOperationsCard go={go} />
    </>
  );
}

/* ── Trips page ────────────────────────────────────────────────── */
const TRIPS_TABS = [
  { key: "trips", label: "Trips" },
  { key: "fleet", label: "Fleet Status" },
];

function FilterChips({ filter, onChange }) {
  const chips = [];
  if (filter.status) chips.push({ key: "status", label: `Status: ${STATUS_LABEL[filter.status] || filter.status}` });
  if (filter.vehicleId) chips.push({ key: "vehicleId", label: `Vehicle: ${vehicleById(filter.vehicleId).plate}` });
  if (filter.driverId) chips.push({ key: "driverId", label: `Driver: ${driverById(filter.driverId).name}` });
  if (filter.range && filter.range !== "today") chips.push({ key: "range", label: RANGE_LABEL[filter.range] });
  if (chips.length === 0) return null;
  return (
    <div className="mt-chips">
      {chips.map((c) => (
        <span key={c.key} className="mt-chip">
          {c.label}
          <button type="button" aria-label={`Remove ${c.label} filter`}
            onClick={() => onChange({ ...filter, [c.key]: undefined })}>
            <Icon name="close" size={14} />
          </button>
        </span>
      ))}
      <button type="button" className="mt-chips-clear" onClick={() => onChange({})}>Clear all</button>
    </div>
  );
}

const STATUS_LABEL = { completed: "Completed", ongoing: "Ongoing", pending: "Pending", paused: "Paused", terminated: "Terminated" };

function TripsTable({ filter, go, toast }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const rows = useMemo(() => D.trips.filter((t) => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.vehicleId && t.vehicleId !== filter.vehicleId) return false;
    if (filter.driverId && t.driverId !== filter.driverId) return false;
    return true;
  }), [filter]);
  useEffect(() => { setPage(1); }, [filter]);
  const shown = rows.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="ml-tablewrap">
        <table className="ml-table">
          <thead><tr>
            <th>Trip ID</th><th>Vehicle</th><th>Driver</th><th>Route</th><th>Status</th><th>Started / ETA</th>
          </tr></thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={6}><div className="mt-empty">No trips match this filter.</div></td></tr>
            )}
            {shown.map((t) => {
              const v = vehicleById(t.vehicleId); const d = driverById(t.driverId);
              return (
                <tr key={t.id} className="mt-table-row"
                  onClick={() => go({ name: "detail", tripId: t.id, from: { name: "trips", tab: "trips", filter } })}>
                  <td><b>{t.id}</b></td>
                  <td>
                    <a className="mt-cell-link" href="../org-vehicle-list/index.html"
                      onClick={(e) => e.stopPropagation()}>{v.plate}</a>
                    <div className="mt-cell-sub">{v.model}</div>
                  </td>
                  <td>
                    <button type="button" className="mt-cell-link"
                      onClick={(e) => { e.stopPropagation(); toast("Driver profile — separate flow, not in this prototype"); }}>
                      {d.name}
                    </button>
                  </td>
                  <td>{t.from} <span className="mt-cell-muted">→</span> {t.to}</td>
                  <td><StatusBadge status={TRIP_STATUS_KEY[t.status]} /></td>
                  <td>
                    {t.status === "pending"
                      ? <>Departs {t.scheduled}<div className="mt-cell-sub">ETA {t.eta}</div></>
                      : t.status === "completed"
                        ? <>{t.started}<div className="mt-cell-sub">Done {t.completedAt}</div></>
                        : t.status === "terminated"
                          ? <>{t.started}<div className="mt-cell-sub">Ended {t.terminatedAt}</div></>
                          : <>{t.started}<div className="mt-cell-sub">ETA {t.eta}</div></>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pager page={page} perPage={perPage} total={rows.length} onPage={setPage} onPerPage={setPerPage} />
    </>
  );
}

function FleetStatusTable({ go, toast }) {
  return (
    <div className="ml-tablewrap">
      <table className="ml-table">
        <thead><tr><th>Vehicle</th><th>Driver</th><th>Current status</th><th>Active trip</th></tr></thead>
        <tbody>
          {D.fleetStatus.map((r) => {
            const v = vehicleById(r.vehicleId); const d = driverById(r.driverId);
            const clickable = !!r.tripId;
            return (
              <tr key={r.vehicleId} className={clickable ? "mt-table-row" : ""}
                onClick={clickable ? () => go({ name: "detail", tripId: r.tripId, from: { name: "trips", tab: "fleet", filter: {} } }) : undefined}>
                <td>
                  <a className="mt-cell-link" href="../org-vehicle-list/index.html"
                    onClick={(e) => e.stopPropagation()}>{v.plate}</a>
                  <div className="mt-cell-sub">{v.model}</div>
                </td>
                <td>
                  <button type="button" className="mt-cell-link"
                    onClick={(e) => { e.stopPropagation(); toast("Driver profile — separate flow, not in this prototype"); }}>
                    {d.name}
                  </button>
                </td>
                <td><StatusBadge status={FLEET_STATUS_KEY[r.status]} /></td>
                <td>{r.tripId ? <b>{r.tripId}</b> : <span className="mt-cell-muted">—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TripsView({ go, tab, filter, toast }) {
  const setTab = (next) => go({ name: "trips", tab: next, filter });
  const setFilter = (next) => {
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v !== undefined));
    go({ name: "trips", tab, filter: clean });
  };
  return (
    <>
      <div className="mt-pagehead">
        <div>
          <h1 className="mt-title">Trips</h1>
          <div className="mt-subtitle">Trip records and live fleet status · {D.dateLabel}</div>
        </div>
        <ExportMenu />
      </div>
      <div className="ml-tabs">
        {TRIPS_TABS.map((t) => (
          <button key={t.key} className={"ml-tab" + (t.key === tab ? " active" : "")} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "trips" ? (
        <>
          <FilterChips filter={filter} onChange={setFilter} />
          <TripsTable filter={filter} go={go} toast={toast} />
        </>
      ) : (
        <FleetStatusTable go={go} toast={toast} />
      )}
    </>
  );
}

/* ── Schedule page ─────────────────────────────────────────────── */
const fmtHour = (h) => {
  const hr = h % 24;
  const ampm = hr >= 12 ? "PM" : "AM";
  const display = hr % 12 === 0 ? 12 : hr % 12;
  return `${display}${ampm}`;
};

const SCHED_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "assigned", label: "Assigned" },
  { value: "terminated", label: "Terminated" },
];

function ScheduleView({ go }) {
  const [range, setRange] = useState("today");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const showNow = range === "today";

  const rows = useMemo(() => {
    const base = D.schedule[range === "custom" ? "today" : range];
    const q = query.trim().toLowerCase();
    return base
      .map((row) => ({
        ...row,
        bars: status === "all" ? row.bars : row.bars.filter((b) => b.status === status),
      }))
      .filter((row) => {
        if (status !== "all" && row.bars.length === 0) return false;
        if (!q) return true;
        const v = vehicleById(row.vehicleId);
        const st = fleetStatusOf(row.vehicleId);
        const d = st && driverById(st.driverId);
        return v.plate.toLowerCase().includes(q) || (d && d.name.toLowerCase().includes(q));
      });
  }, [range, query, status]);

  const openBar = (b) => tripById(b.tripId) && go({ name: "detail", tripId: b.tripId, from: { name: "schedule" } });

  return (
    <>
      <div className="mt-pagehead">
        <div>
          <h1 className="mt-title">Schedule</h1>
          <div className="mt-subtitle">Vehicle trip timelines · click a bar to open the trip</div>
        </div>
        <ExportMenu />
      </div>
      <div className="mt-card">
        <CardHead icon="calendar_view_day" title={range === "tomorrow" ? "Tomorrow" : range === "custom" ? "Custom range" : "Today"}
          sub={range === "today" ? D.dateLabel : range === "tomorrow" ? "Saturday, 11 Jul 2026" : "Pick a date range"}
          right={
            <div className="mt-chart-controls">
              <Segmented value={range} onChange={setRange}
                options={[{ value: "today", label: "Today" }, { value: "tomorrow", label: "Tomorrow" }, { value: "custom", label: "Custom" }]} />
            </div>
          } />
        {range === "custom" && (
          <div className="mt-custom-range" style={{ marginTop: 12 }}>
            <input type="date" defaultValue="2026-07-10" aria-label="From date" />
            <span>to</span>
            <input type="date" defaultValue="2026-07-10" aria-label="To date" />
            <span className="mt-cell-muted">(showing today&rsquo;s data in this prototype)</span>
          </div>
        )}
        <div className="mt-sched-toolbar">
          <div className="mt-search">
            <Icon name="search" size={16} color="var(--fg-tertiary)" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vehicle or driver" aria-label="Search vehicle or driver" />
          </div>
          <SelectMenu value={status} options={SCHED_STATUS_OPTIONS} onChange={setStatus}
            ariaLabel="Filter by status" wrapperClassName="hac-select-wrap compact" className="hac-select" />
        </div>
        <FleetTimeline rows={rows} showNow={showNow} onBar={openBar} roomy />
        <TimelineLegend showNow={showNow} />

        {/* Mobile fallback: vertical per-vehicle list */}
        <div className="mt-tl-mobile">
          {rows.map((row) => {
            const v = vehicleById(row.vehicleId);
            return (
              <div key={row.vehicleId} className="mt-tlm-card">
                <div className="mt-tlm-head">
                  <a className="mt-tl-veh-plate" href="../org-vehicle-list/index.html">{v.plate}</a>
                  <span className="mt-cell-muted" style={{ fontSize: 11 }}>{row.bars.length} trip{row.bars.length === 1 ? "" : "s"}</span>
                </div>
                <div className="mt-tlm-trips">
                  {row.bars.length === 0 && <span className="mt-cell-muted" style={{ fontSize: 12 }}>No trips scheduled.</span>}
                  {row.bars.map((b) => (
                    <button key={b.tripId} type="button" className="mt-tlm-trip"
                      onClick={() => tripById(b.tripId) && go({ name: "detail", tripId: b.tripId, from: { name: "schedule" } })}>
                      <span className="mt-tlm-time">{fmtHour(Math.floor(b.start))} – {fmtHour(Math.ceil(b.end))}</span>
                      <span className="mt-tlm-id">{b.tripId}</span>
                      <StatusBadge status={b.status === "completed" ? "trip_completed" : b.status === "terminated" ? "trip_terminated" : "veh_assigned"} label={b.status === "assigned" ? "Assigned" : undefined} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ── Share modal ───────────────────────────────────────────────── */
function ShareModal({ trip, onClose, go, toast }) {
  const wrapRef = useRef(null);
  const url = `https://track.mylorry.my/t/${trip.id.toLowerCase()}-9f3kq7`;
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    toast("Tracking link copied");
  };
  return ReactDOM.createPortal(
    <div className="mt-modal-backdrop" ref={wrapRef}
      onMouseDown={(e) => { if (e.target === wrapRef.current) onClose(); }}
      role="dialog" aria-modal="true" aria-label="Share tracking link">
      <div className="mt-modal">
        <div className="mt-modal-head">
          <span className="mt-modal-title">Share tracking link</span>
          <button type="button" className="mt-modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>
        <div className="mt-modal-sub">
          Send this link to your customer so they can follow <b>{trip.id}</b> live. No MyLorry account needed.
        </div>
        <div className="mt-share-url">
          <input readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Tracking link" />
          <button type="button" className="ml-btn-outline" onClick={copy}><Icon name="content_copy" size={16} /> Copy</button>
        </div>
        <div className="mt-share-actions">
          <button type="button" className="mt-share-wa" onClick={() => toast("Opening WhatsApp… (prototype)")}>
            <Icon name="chat" size={18} fill={1} /> Share via WhatsApp
          </button>
        </div>
        <div className="mt-share-scope">
          <div className="mt-share-scope-row"><Icon name="check" size={15} />Recipient sees truck location, trip details, and estimated arrival only.</div>
          <div className="mt-share-scope-row"><Icon name="check" size={15} />Scoped to this trip — no other trips or organisation data.</div>
          <div className="mt-share-scope-row"><Icon name="check" size={15} />Link stops working when the trip is completed.</div>
        </div>
        <div className="mt-share-preview-link">
          <button type="button" className="ml-btn-text-blue"
            onClick={() => { onClose(); go({ name: "public", tripId: trip.id }); }}>
            Preview what the customer sees<Icon name="chevron_right" size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Trip detail ───────────────────────────────────────────────── */
function DetailView({ tripId, from, go, toast }) {
  const [shareOpen, setShareOpen] = useState(false);
  const trip = tripById(tripId);
  if (!trip) return <div className="mt-empty">Trip not found.</div>;
  const v = vehicleById(trip.vehicleId); const d = driverById(trip.driverId);
  const backLabel = from?.name === "schedule" ? "Back to Schedule" : from?.name === "trips" ? "Back to Trips" : "Back to Dashboard";
  return (
    <>
      {shareOpen && <ShareModal trip={trip} onClose={() => setShareOpen(false)} go={go} toast={toast} />}
      <button type="button" className="mt-back" onClick={() => go(from || { name: "dashboard" })}>
        <Icon name="arrow_back" size={16} /> {backLabel}
      </button>
      <div className="mt-pagehead">
        <div>
          <h1 className="mt-title">{trip.id}</h1>
          <div className="mt-detail-head-badges" style={{ marginTop: 8 }}>
            <StatusBadge status={TRIP_STATUS_KEY[trip.status]} />
            <span className="mt-subtitle" style={{ marginTop: 0 }}>{trip.from} → {trip.to}</span>
          </div>
        </div>
        <button type="button" className="ml-btn-primary" onClick={() => setShareOpen(true)}>
          <Icon name="share" size={16} /> Share tracking link
        </button>
      </div>
      <div className="mt-detail-grid">
        <div className="mt-card">
          <CardHead icon="route" title="Trip information" />
          <div className="mt-info-grid">
            <div className="mt-info-field">
              <div className="mt-info-label">Vehicle</div>
              <div className="mt-info-value">
                <a className="mt-cell-link" href="../org-vehicle-list/index.html">{v.plate}</a>
                <div className="mt-cell-sub">{v.model}</div>
              </div>
            </div>
            <div className="mt-info-field">
              <div className="mt-info-label">Driver</div>
              <div className="mt-info-value">
                <button type="button" className="mt-cell-link"
                  onClick={() => toast("Driver profile — separate flow, not in this prototype")}>{d.name}</button>
              </div>
            </div>
            <div className="mt-info-field">
              <div className="mt-info-label">{trip.status === "pending" ? "Scheduled departure" : "Started"}</div>
              <div className="mt-info-value">{trip.status === "pending" ? trip.scheduled : trip.started}</div>
            </div>
            <div className="mt-info-field">
              <div className="mt-info-label">{trip.status === "completed" ? "Completed" : trip.status === "terminated" ? "Terminated" : "Estimated arrival"}</div>
              <div className="mt-info-value">{trip.completedAt || trip.terminatedAt || trip.eta}</div>
            </div>
          </div>
          <div className="mt-route">
            <div className="mt-route-stop">
              <div className="mt-route-marker"><span className="mt-route-dot" /><span className="mt-route-line" /></div>
              <div className="mt-route-copy">
                <div className="mt-route-name">{trip.from}</div>
                <div className="mt-route-sub">Origin{trip.started ? ` · departed ${trip.started}` : ""}</div>
              </div>
            </div>
            <div className="mt-route-stop">
              <div className="mt-route-marker"><span className="mt-route-dot dest" /></div>
              <div className="mt-route-copy" style={{ paddingBottom: 0 }}>
                <div className="mt-route-name">{trip.to}</div>
                <div className="mt-route-sub">Destination{trip.eta && !trip.completedAt ? ` · ETA ${trip.eta}` : ""}</div>
              </div>
            </div>
          </div>
          {trip.status === "paused" && (
            <div className="mt-pause-note">
              <Icon name="pause_circle" size={18} />
              <div><b>Paused {trip.pausedFor}</b> — {trip.pauseReason}. Paused at {trip.pausedAt}.</div>
            </div>
          )}
          {trip.status === "terminated" && (
            <div className="mt-pause-note" style={{ borderColor: "var(--red-400)", background: "#FFF0F0", color: "var(--red-400)" }}>
              <Icon name="cancel" size={18} />
              <div><b>Terminated at {trip.terminatedAt}</b> — {trip.terminateReason}.</div>
            </div>
          )}
          {(trip.status === "ongoing" || trip.status === "paused") && (
            <div className="mt-eta-strip">
              <Icon name="schedule" size={20} />
              <div>
                <div className="mt-eta-label">Estimated arrival</div>
                <div className="mt-eta-value">{trip.eta}</div>
              </div>
            </div>
          )}
          <div className="mt-map">
            <div className="mt-map-pin">
              <div className="mt-map-truck"><Icon name="local_shipping" size={20} fill={1} /></div>
              Live location (map placeholder)
            </div>
          </div>
        </div>
        <div className="mt-card">
          <CardHead icon="timeline" title="Trip activity" />
          <div className="mt-events">
            {trip.events.map((ev, i) => (
              <div key={i} className="mt-event">
                <div className="mt-event-rail">
                  <div className="mt-event-ico"><Icon name={ev.icon} size={15} /></div>
                  {i < trip.events.length - 1 && <span className="mt-event-line" />}
                </div>
                <div className="mt-event-copy" style={i === trip.events.length - 1 ? { paddingBottom: 0 } : undefined}>
                  <div className="mt-event-label">{ev.label}</div>
                  <div className="mt-event-time">{ev.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Public tracking view (customer-facing, no shell) ──────────── */
function PublicView({ tripId, go }) {
  const trip = tripById(tripId);
  const v = trip && vehicleById(trip.vehicleId);
  if (!trip) return null;
  return (
    <div className="mt-public">
      <div className="mt-public-topbar">
        <Icon name="local_shipping" size={20} fill={1} />
        <div><b>MyLorry Tracking</b><br /><span>Live delivery tracking · {trip.id}</span></div>
      </div>
      <div className="mt-public-body">
        <div className="mt-public-card mt-public-map mt-map" style={{ marginTop: 0 }}>
          <div className="mt-map-pin">
            <div className="mt-map-truck"><Icon name="local_shipping" size={20} fill={1} /></div>
            Truck location (map placeholder)
          </div>
        </div>
        <div className="mt-public-card">
          <div className="mt-public-eta">
            <div>
              <div className="mt-eta-label">Estimated arrival</div>
              <div className="mt-public-eta-num">{trip.eta || trip.completedAt}</div>
            </div>
            <StatusBadge status={TRIP_STATUS_KEY[trip.status]} />
          </div>
        </div>
        <div className="mt-public-card">
          <div className="mt-info-grid" style={{ marginTop: 0 }}>
            <div className="mt-info-field">
              <div className="mt-info-label">From</div>
              <div className="mt-info-value">{trip.from}</div>
            </div>
            <div className="mt-info-field">
              <div className="mt-info-label">To</div>
              <div className="mt-info-value">{trip.to}</div>
            </div>
            <div className="mt-info-field">
              <div className="mt-info-label">Vehicle</div>
              <div className="mt-info-value">{v.plate}</div>
            </div>
            <div className="mt-info-field">
              <div className="mt-info-label">Departed</div>
              <div className="mt-info-value">{trip.started || trip.scheduled}</div>
            </div>
          </div>
        </div>
        <div className="mt-public-note">
          You&rsquo;re viewing a single-trip tracking link shared by Padu Logistik Sdn. Bhd.
          This page shows truck location, trip details, and estimated arrival only.
        </div>
        <button type="button" className="ml-btn-outline mt-public-exit"
          onClick={() => go({ name: "detail", tripId: trip.id, from: { name: "dashboard" } })}>
          <Icon name="arrow_back" size={16} /> Exit customer preview
        </button>
      </div>
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [route, setRoute] = useState({ name: "dashboard" });
  const [toast, toastNode] = useToast();
  const go = (next) => { setRoute(next); window.scrollTo(0, 0); };

  if (route.name === "public") {
    return <>{toastNode}<PublicView tripId={route.tripId} go={go} /></>;
  }

  const railActive = route.name === "detail" ? (route.from?.name || "dashboard") : route.name;
  return (
    <div className="mt-shell">
      <Rail active={railActive} go={go} />
      <main className="mt-main">
        <div className="mt-topbar">
          <OrgSwitcher orgs={D.orgs} initialId={D.org.id} />
          <div className="mt-topbar-spacer" />
          <a className="mt-iconbtn mt-closebtn" href="../org-dashboard/index.html" aria-label="Close">
            <Icon name="close" size={18} />
          </a>
        </div>
        <div className="mt-content">
          {route.name === "dashboard" && <DashboardView go={go} />}
          {route.name === "trips" && <TripsView go={go} tab={route.tab || "trips"} filter={route.filter || {}} toast={toast} />}
          {route.name === "schedule" && <ScheduleView go={go} />}
          {route.name === "detail" && <DetailView tripId={route.tripId} from={route.from} go={go} toast={toast} />}
        </div>
      </main>
      {toastNode}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

}
