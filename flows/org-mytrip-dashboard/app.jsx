{

const { useState, useMemo, useRef, useEffect } = React;
const { Icon, OrgSwitcher, CardHead, Segmented, StatusBadge, ExportMenu, Pager, SelectMenu, CountCard, HistoryCard, Modal } = window.SharedShell;
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

/* ── Search box (shared within this file — chart card + schedule toolbar) ── */
function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="mt-search">
      <Icon name="search" size={16} color="var(--fg-tertiary)" />
      <input value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} aria-label={placeholder} />
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
        return (
          <CountCard key={k.key} icon={k.icon} count={count} label={k.label} sub={k.sub} tone={k.tone} fill
            attention={k.key === "paused" && count > 0}
            actionLabel={`View ${k.label.toLowerCase()} trips`}
            onClick={() => go({ name: "trips", tab: "trips", filter: { status: k.key, range: "today" } })} />
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
  const [hover, setHover] = useState(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return D.chart[scope][range]
      .filter((r) => !q || r.label.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => b.assigned - a.assigned);
  }, [scope, range, query]);

  useEffect(() => { setPage(1); setHover(null); }, [scope, range, query]);
  useEffect(() => { setHover(null); }, [page]);

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
        <SearchBox value={query} onChange={setQuery} placeholder={scope === "vehicle" ? "Search vehicle" : "Search driver"} />
        <span className="mt-hbar-count">{rows.length} {scope === "vehicle" ? "vehicles" : "drivers"}</span>
      </div>
      <div className="mt-hbar-list">
        {shown.length === 0 && <div className="mt-empty">No {scope === "vehicle" ? "vehicles" : "drivers"} match this search.</div>}
        {shown.map((r, i) => {
          const remaining = r.assigned - r.completed;
          const completedPct = r.assigned ? (r.completed / r.assigned) * 100 : 0;
          const remainingPct = r.assigned ? (remaining / r.assigned) * 100 : 0;
          return (
            <button key={r.id} type="button" className="mt-hbar-row"
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              onClick={() => go({
                name: "trips", tab: "trips",
                filter: scope === "vehicle" ? { vehicleId: r.id, range } : { driverId: r.id, range },
              })}>
              <span className="mt-hbar-label">{r.label}</span>
              <span className="mt-hbar-track">
                {hover === i && (
                  <div className="mt-hbar-tip">
                    <div className="mt-hbar-tip-val">{r.label}</div>
                    <div className="mt-hbar-tip-row"><i className="mt-dot" style={{ background: "#00AA4F" }} />Completed {N(r.completed)}</div>
                    <div className="mt-hbar-tip-row"><i className="mt-dot" style={{ background: "#0081AA" }} />Assigned, not completed {N(remaining)}</div>
                  </div>
                )}
                <span className="mt-hbar-group" style={{ width: `${(r.assigned / maxVal) * 100}%` }}>
                  <i className="mt-hbar-fill completed" style={{ width: `${completedPct}%` }} />
                  <i className="mt-hbar-fill assigned" style={{ width: `${remainingPct}%` }} />
                </span>
              </span>
              <span className="mt-hbar-val">{N(r.completed)} / {N(r.assigned)}</span>
            </button>
          );
        })}
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
              <HistoryCard key={t.id}
                prefix={<div className="ml-stat-icon amber"><Icon name="pause_circle" size={18} fill={1} color="var(--amber-600)" /></div>}
                title={`${v.plate} · ${d.name}`}
                subtitle={`${t.from} → ${t.to} · ${t.pauseReason}`}
                meta={t.pausedFor}
                onClick={() => go({ name: "detail", tripId: t.id, from: { name: "dashboard" } })} />
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
   render the same anatomy. Whole row is the click target (opens that
   vehicle's current active trip) on both densities — bars are hover-only
   (tooltip), not independently clickable, so there's one click target per
   row, not one per bar plus the row. */
function TimelineLegend({ showNow }) {
  return (
    <div className="mt-tl-legend">
      <span><i className="mt-dot" style={{ background: "var(--green-500)" }} />Completed</span>
      <span><i className="mt-dot" style={{ background: "#0081AA" }} />Assigned</span>
      <span><i className="mt-dot" style={{ background: "var(--red-400)" }} />Terminated</span>
      {showNow && <span><i className="mt-now-line" />Now · {D.nowLabel}</span>}
    </div>
  );
}

const BAR_STATUS_LABEL = { completed: "Completed", assigned: "Assigned", terminated: "Terminated" };

function FleetTimeline({ rows, showNow, onRow, onBar, roomy }) {
  // Portal-rendered tooltip (position:fixed via getBoundingClientRect) — the
  // .mt-ops container clips overflow for its rounded corners, so an in-flow
  // absolute tooltip would be cut off for bars in the first/last row. Same
  // technique as the existing KPIProgress hover tooltip in shared-shell.jsx.
  const [hover, setHover] = useState(null);
  const showTip = (e, b) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ top: r.top - 8, left: r.left + r.width / 2, b });
  };
  const hideTip = () => setHover(null);

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
        // Row is a div (not a button) so a real nested <button> per bar stays
        // valid HTML. Clicking a bar opens THAT trip and stops propagation;
        // clicking anywhere else in the row opens the vehicle's current trip.
        return (
          <div key={row.vehicleId} role="button" tabIndex={0} className="mt-ops-row"
            onClick={() => onRow(row)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onRow(row); } }}>
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
                const label = `${b.tripId} · ${fmtHour(Math.floor(b.start))}–${fmtHour(Math.ceil(b.end))} · ${BAR_STATUS_LABEL[b.status]}`;
                const hoverProps = { onMouseEnter: (e) => showTip(e, b), onMouseLeave: hideTip };
                return onBar ? (
                  <button key={b.tripId} type="button" className={"mt-ops-bar " + b.status} style={style}
                    aria-label={label} onClick={(e) => { e.stopPropagation(); onBar(b); }} {...hoverProps} />
                ) : (
                  <i key={b.tripId} className={"mt-ops-bar " + b.status} style={style} aria-label={label} {...hoverProps} />
                );
              })}
            </span>
            <span className="mt-ops-frac">{done}/{planned} done</span>
          </div>
        );
      })}
      {rows.length === 0 && <div className="mt-empty">No vehicles match this filter.</div>}
      {hover && ReactDOM.createPortal(
        <div className="mt-ops-tip" style={{ top: hover.top, left: hover.left }}>
          <div className="mt-ops-tip-val">{hover.b.tripId}</div>
          <div className="mt-ops-tip-row">{fmtHour(Math.floor(hover.b.start))}–{fmtHour(Math.ceil(hover.b.end))} · {BAR_STATUS_LABEL[hover.b.status]}</div>
        </div>,
        document.body
      )}
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

/* ── Trips toolbar: scoped search + status/date filter panel ──────
   Follows the codebase's established .hac-search-group.scoped / .hac-filter-*
   convention (org-vehicle-list, host-sp-account) — same classes, same
   pending-until-Apply filter panel, reused verbatim rather than inventing
   a new search widget. */
const TRIP_SEARCH_SCOPES = [
  { value: "tripId", label: "Trip ID" },
  { value: "vehicle", label: "Vehicle" },
  { value: "driver", label: "Driver" },
];
const TRIPS_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "ongoing", label: "Ongoing" },
  { value: "pending", label: "Pending" },
  { value: "paused", label: "Paused" },
  { value: "terminated", label: "Terminated" },
];

function TripsToolbar({ scope, setScope, query, setQuery, filter, onChange }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(filter.status || "all");
  const [pendingStart, setPendingStart] = useState("2026-07-10");
  const [pendingEnd, setPendingEnd] = useState("2026-07-10");
  const activeCount = filter.status ? 1 : 0;

  const toggleFilterPanel = () => {
    if (!filterOpen) setPendingStatus(filter.status || "all");
    setFilterOpen((v) => !v);
  };
  const applyFilters = () => {
    onChange({ ...filter, status: pendingStatus === "all" ? undefined : pendingStatus });
    setFilterOpen(false);
  };
  const resetFilters = () => {
    setQuery("");
    setScope("tripId");
    setPendingStatus("all");
    setPendingStart("2026-07-10");
    setPendingEnd("2026-07-10");
    onChange({ ...filter, status: undefined });
    setFilterOpen(false);
  };

  return (
    <div className="hac-toolbar">
      <div className="hac-toolbar-left">
        <div className="hac-search-group scoped">
          <SelectMenu className="hac-search-scope" value={scope} options={TRIP_SEARCH_SCOPES}
            onChange={setScope} ariaLabel="Search by" />
          <div className="hac-search-bar">
            <Icon name="search" size={17} color="var(--fg-tertiary)" />
            <input className="hac-search-input" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search by ${TRIP_SEARCH_SCOPES.find((s) => s.value === scope).label.toLowerCase()}`} />
            {query && (
              <button type="button" className="hac-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
        </div>
        <button type="button" className={"hac-filter-btn" + (activeCount ? " active" : "")} onClick={toggleFilterPanel}>
          <Icon name="tune" size={18} /> Filter
          {activeCount > 0 && <span className="hac-filter-badge">{activeCount}</span>}
        </button>
      </div>
      {filterOpen && (
        <div className="hac-filter-panel" style={{ width: "100%" }}>
          <div className="hac-filter-grid">
            <div className="hac-filter-field">
              <label>Status</label>
              <div className="hac-select-wrap">
                <SelectMenu className="hac-select" value={pendingStatus} options={TRIPS_STATUS_OPTIONS}
                  onChange={setPendingStatus} ariaLabel="Status" />
              </div>
            </div>
            <div className="hac-filter-field">
              <label>Start date</label>
              <div className="hac-date-range-field">
                <Icon name="event" size={16} color="var(--fg-tertiary)" />
                <input className="hac-date-range-input" type="date" value={pendingStart} onChange={(e) => setPendingStart(e.target.value)} />
              </div>
            </div>
            <div className="hac-filter-field">
              <label>End date</label>
              <div className="hac-date-range-field">
                <Icon name="event" size={16} color="var(--fg-tertiary)" />
                <input className="hac-date-range-input" type="date" value={pendingEnd} onChange={(e) => setPendingEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="mt-cell-sub" style={{ marginBottom: 12 }}>This prototype only has today&rsquo;s trip data — date range is for review only.</div>
          <div className="hac-filter-actions">
            <button type="button" className="hac-filter-apply" onClick={applyFilters}>Apply Filters</button>
            <button type="button" className="hac-filter-reset" onClick={resetFilters}>Reset All</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TripsTable({ filter, scope, query, go, onVehicle, onDriver }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const rows = useMemo(() => D.trips.filter((t) => {
    if (filter.status && t.status !== filter.status) return false;
    if (filter.vehicleId && t.vehicleId !== filter.vehicleId) return false;
    if (filter.driverId && t.driverId !== filter.driverId) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    if (scope === "tripId") return t.id.toLowerCase().includes(q);
    if (scope === "vehicle") return vehicleById(t.vehicleId).plate.toLowerCase().includes(q);
    return driverById(t.driverId).name.toLowerCase().includes(q);
  }), [filter, scope, query]);
  useEffect(() => { setPage(1); }, [filter, scope, query]);
  const shown = rows.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="ml-table-wrap">
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
                    <button type="button" className="mt-cell-link"
                      onClick={(e) => { e.stopPropagation(); onVehicle(v.id); }}>{v.plate}</button>
                    <div className="mt-cell-sub">{v.model}</div>
                  </td>
                  <td>
                    <button type="button" className="mt-cell-link"
                      onClick={(e) => { e.stopPropagation(); onDriver(d.id); }}>
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

const FLEET_SEARCH_SCOPES = [
  { value: "vehicle", label: "Vehicle" },
  { value: "driver", label: "Driver" },
];
const FLEET_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "in_progress", label: "In Progress" },
  { value: "assigned", label: "Assigned" },
  { value: "idle", label: "Idle" },
];

function FleetStatusToolbar({ scope, setScope, query, setQuery, status, setStatus }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(status);
  const activeCount = status !== "all" ? 1 : 0;

  const toggleFilterPanel = () => {
    if (!filterOpen) setPendingStatus(status);
    setFilterOpen((v) => !v);
  };
  const applyFilters = () => { setStatus(pendingStatus); setFilterOpen(false); };
  const resetFilters = () => {
    setQuery(""); setScope("vehicle"); setStatus("all"); setPendingStatus("all"); setFilterOpen(false);
  };

  return (
    <div className="hac-toolbar">
      <div className="hac-toolbar-left">
        <div className="hac-search-group scoped">
          <SelectMenu className="hac-search-scope" value={scope} options={FLEET_SEARCH_SCOPES}
            onChange={setScope} ariaLabel="Search by" />
          <div className="hac-search-bar">
            <Icon name="search" size={17} color="var(--fg-tertiary)" />
            <input className="hac-search-input" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search by ${FLEET_SEARCH_SCOPES.find((s) => s.value === scope).label.toLowerCase()}`} />
            {query && (
              <button type="button" className="hac-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
        </div>
        <button type="button" className={"hac-filter-btn" + (activeCount ? " active" : "")} onClick={toggleFilterPanel}>
          <Icon name="tune" size={18} /> Filter
          {activeCount > 0 && <span className="hac-filter-badge">{activeCount}</span>}
        </button>
      </div>
      {filterOpen && (
        <div className="hac-filter-panel" style={{ width: "100%" }}>
          <div className="hac-filter-grid">
            <div className="hac-filter-field">
              <label>Status</label>
              <div className="hac-select-wrap">
                <SelectMenu className="hac-select" value={pendingStatus} options={FLEET_STATUS_OPTIONS}
                  onChange={setPendingStatus} ariaLabel="Status" />
              </div>
            </div>
          </div>
          <div className="hac-filter-actions">
            <button type="button" className="hac-filter-apply" onClick={applyFilters}>Apply Filters</button>
            <button type="button" className="hac-filter-reset" onClick={resetFilters}>Reset All</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FleetStatusTable({ go, onVehicle, onDriver }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [scope, setScope] = useState("vehicle");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => D.fleetStatus.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    if (scope === "vehicle") return vehicleById(r.vehicleId).plate.toLowerCase().includes(q);
    return driverById(r.driverId).name.toLowerCase().includes(q);
  }), [scope, query, status]);
  useEffect(() => { setPage(1); }, [scope, query, status]);
  const shown = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <>
      <FleetStatusToolbar scope={scope} setScope={setScope} query={query} setQuery={setQuery} status={status} setStatus={setStatus} />
      <div className="ml-table-wrap">
        <table className="ml-table">
          <thead><tr><th>Vehicle</th><th>Driver</th><th>Current status</th><th>Active trip</th></tr></thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={4}><div className="mt-empty">No vehicles match this filter.</div></td></tr>
            )}
            {shown.map((r) => {
              const v = vehicleById(r.vehicleId); const d = driverById(r.driverId);
              const clickable = !!r.tripId;
              return (
                <tr key={r.vehicleId} className={clickable ? "mt-table-row" : ""}
                  onClick={clickable ? () => go({ name: "detail", tripId: r.tripId, from: { name: "trips", tab: "fleet", filter: {} } }) : undefined}>
                  <td>
                    <button type="button" className="mt-cell-link"
                      onClick={(e) => { e.stopPropagation(); onVehicle(v.id); }}>{v.plate}</button>
                    <div className="mt-cell-sub">{v.model}</div>
                  </td>
                  <td>
                    <button type="button" className="mt-cell-link"
                      onClick={(e) => { e.stopPropagation(); onDriver(d.id); }}>
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
      <Pager page={page} perPage={perPage} total={rows.length} onPage={setPage} onPerPage={setPerPage} />
    </>
  );
}

function TripsView({ go, tab, filter, onVehicle, onDriver }) {
  const [scope, setScope] = useState("tripId");
  const [query, setQuery] = useState("");
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
          <TripsToolbar scope={scope} setScope={setScope} query={query} setQuery={setQuery} filter={filter} onChange={setFilter} />
          <FilterChips filter={filter} onChange={setFilter} />
          <TripsTable filter={filter} scope={scope} query={query} go={go} onVehicle={onVehicle} onDriver={onDriver} />
        </>
      ) : (
        <FleetStatusTable go={go} onVehicle={onVehicle} onDriver={onDriver} />
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

function ScheduleView({ go, onVehicle, onDriver }) {
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

  const openRow = (row) => {
    const st = fleetStatusOf(row.vehicleId);
    if (st && st.tripId) go({ name: "detail", tripId: st.tripId, from: { name: "schedule" } });
  };
  const openBar = (b) => tripById(b.tripId) && go({ name: "detail", tripId: b.tripId, from: { name: "schedule" } });

  return (
    <>
      <div className="mt-pagehead">
        <div>
          <h1 className="mt-title">Schedule</h1>
          <div className="mt-subtitle">Vehicle trip timelines · click a trip to open it, or the row for its current trip</div>
        </div>
        <ExportMenu />
      </div>
      <div className="mt-section">
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
          <SearchBox value={query} onChange={setQuery} placeholder="Search vehicle or driver" />
          <SelectMenu value={status} options={SCHED_STATUS_OPTIONS} onChange={setStatus}
            ariaLabel="Filter by status" wrapperClassName="hac-select-wrap compact" className="hac-select" />
        </div>
        <FleetTimeline rows={rows} showNow={showNow} onRow={openRow} onBar={openBar} roomy />
        <TimelineLegend showNow={showNow} />

        {/* Mobile fallback: vertical per-vehicle list */}
        <div className="mt-tl-mobile">
          {rows.map((row) => {
            const v = vehicleById(row.vehicleId);
            return (
              <div key={row.vehicleId} className="mt-tlm-card">
                <div className="mt-tlm-head">
                  <button type="button" className="mt-tl-veh-plate" onClick={() => onVehicle(v.id)}>{v.plate}</button>
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
      <UpcomingTripsSection go={go} onVehicle={onVehicle} onDriver={onDriver} />
    </>
  );
}

const parseClock = (str) => {
  const m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(str.trim());
  if (!m) return 0;
  let h = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2], 10);
};

function UpcomingTripsSection({ go, onVehicle, onDriver }) {
  const upcoming = useMemo(() =>
    D.trips.filter((t) => t.status === "pending").sort((a, b) => parseClock(a.scheduled) - parseClock(b.scheduled)),
  []);
  const shown = upcoming.slice(0, 6);
  return (
    <div className="mt-section" style={{ marginTop: 28 }}>
      <CardHead icon="event" title="Upcoming trips" sub="Pending departures, soonest first" />
      <div className="ml-table-wrap" style={{ marginTop: 12 }}>
        <table className="ml-table">
          <thead><tr><th>Trip ID</th><th>Vehicle</th><th>Driver</th><th>Route</th><th>Departs</th></tr></thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={5}><div className="mt-empty">No upcoming trips.</div></td></tr>
            )}
            {shown.map((t) => {
              const v = vehicleById(t.vehicleId); const d = driverById(t.driverId);
              return (
                <tr key={t.id} className="mt-table-row"
                  onClick={() => go({ name: "detail", tripId: t.id, from: { name: "schedule" } })}>
                  <td><b>{t.id}</b></td>
                  <td>
                    <button type="button" className="mt-cell-link"
                      onClick={(e) => { e.stopPropagation(); onVehicle(v.id); }}>{v.plate}</button>
                    <div className="mt-cell-sub">{v.model}</div>
                  </td>
                  <td>
                    <button type="button" className="mt-cell-link"
                      onClick={(e) => { e.stopPropagation(); onDriver(d.id); }}>{d.name}</button>
                  </td>
                  <td>{t.from} <span className="mt-cell-muted">→</span> {t.to}</td>
                  <td>{t.scheduled}<div className="mt-cell-sub">ETA {t.eta}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {upcoming.length > shown.length && (
        <div className="mt-card-footer" style={{ justifyContent: "flex-start", paddingTop: 10 }}>
          <button type="button" className="ml-btn-text-blue"
            onClick={() => go({ name: "trips", tab: "trips", filter: { status: "pending", range: "today" } })}>
            View all {upcoming.length} pending trips<Icon name="chevron_right" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Vehicle / driver info modals ──────────────────────────────────
   Vehicle and driver profile pages aren't part of this prototype — clicking
   a plate or driver name used to either navigate away to a different flow
   (org-vehicle-list) or just toast. Neither belongs inside a trip-scoped
   view, so both now open a small in-context info modal instead. */
function VehicleInfoModal({ vehicleId, onClose }) {
  const v = vehicleById(vehicleId);
  const st = fleetStatusOf(vehicleId);
  const todayTrips = D.trips.filter((t) => t.vehicleId === vehicleId);
  return (
    <Modal onClose={onClose} ariaLabel={`${v.plate} details`} backdropClassName="mt-modal-backdrop" className="mt-modal">
      <div className="mt-modal-head">
        <span className="mt-modal-title">{v.plate}</span>
        <button type="button" className="mt-modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
      </div>
      <div className="mt-modal-sub">{v.model}</div>
      <div className="mt-info-grid" style={{ marginTop: 14 }}>
        <div className="mt-info-field">
          <div className="mt-info-label">Current status</div>
          <div className="mt-info-value">{st ? <StatusBadge status={FLEET_STATUS_KEY[st.status]} /> : "—"}</div>
        </div>
        <div className="mt-info-field">
          <div className="mt-info-label">Driver</div>
          <div className="mt-info-value">{st ? driverById(st.driverId).name : "Unassigned"}</div>
        </div>
        <div className="mt-info-field">
          <div className="mt-info-label">Category</div>
          <div className="mt-info-value">{v.category}</div>
        </div>
        <div className="mt-info-field">
          <div className="mt-info-label">Vendor</div>
          <div className="mt-info-value">{v.vendor}</div>
        </div>
        <div className="mt-info-field">
          <div className="mt-info-label">Capacity</div>
          <div className="mt-info-value">{N(v.capacity)} kg</div>
        </div>
        <div className="mt-info-field">
          <div className="mt-info-label">Trips today</div>
          <div className="mt-info-value">{todayTrips.length}</div>
        </div>
      </div>
    </Modal>
  );
}

function DriverInfoModal({ driverId, onClose }) {
  const d = driverById(driverId);
  const st = D.fleetStatus.find((r) => r.driverId === driverId);
  const todayTrips = D.trips.filter((t) => t.driverId === driverId);
  return (
    <Modal onClose={onClose} ariaLabel={`${d.name} details`} backdropClassName="mt-modal-backdrop" className="mt-modal">
      <div className="mt-modal-head">
        <span className="mt-modal-title">{d.name}</span>
        <button type="button" className="mt-modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
      </div>
      <div className="mt-modal-sub">{d.driverId} · {d.phone}</div>
      <div className="mt-info-grid" style={{ marginTop: 14 }}>
        <div className="mt-info-field">
          <div className="mt-info-label">Vehicle</div>
          <div className="mt-info-value">{st ? vehicleById(st.vehicleId).plate : "Unassigned"}</div>
        </div>
        <div className="mt-info-field">
          <div className="mt-info-label">Current status</div>
          <div className="mt-info-value">{st ? <StatusBadge status={FLEET_STATUS_KEY[st.status]} /> : "—"}</div>
        </div>
        <div className="mt-info-field">
          <div className="mt-info-label">Trips today</div>
          <div className="mt-info-value">{todayTrips.length}</div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Share modal ───────────────────────────────────────────────── */
function ShareModal({ trip, onClose, go, toast }) {
  const url = `https://track.mylorry.my/t/${trip.id.toLowerCase()}-9f3kq7`;
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    toast("Tracking link copied");
  };
  return (
    <Modal onClose={onClose} ariaLabel="Share tracking link"
      backdropClassName="mt-modal-backdrop" className="mt-modal">
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
    </Modal>
  );
}

/* ── Trip detail ───────────────────────────────────────────────── */
function DetailView({ tripId, from, go, toast, onVehicle, onDriver }) {
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
                <button type="button" className="mt-info-link" onClick={() => onVehicle(v.id)}>{v.plate}</button>
                <div className="mt-cell-sub">{v.model}</div>
              </div>
            </div>
            <div className="mt-info-field">
              <div className="mt-info-label">Driver</div>
              <div className="mt-info-value">
                <button type="button" className="mt-info-link" onClick={() => onDriver(d.id)}>{d.name}</button>
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
  const [infoModal, setInfoModal] = useState(null); // { type: "vehicle"|"driver", id } | null
  const go = (next) => { setRoute(next); window.scrollTo(0, 0); };
  const onVehicle = (vehicleId) => setInfoModal({ type: "vehicle", id: vehicleId });
  const onDriver = (driverId) => setInfoModal({ type: "driver", id: driverId });
  const closeInfoModal = () => setInfoModal(null);

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
          {route.name === "trips" && <TripsView go={go} tab={route.tab || "trips"} filter={route.filter || {}} onVehicle={onVehicle} onDriver={onDriver} />}
          {route.name === "schedule" && <ScheduleView go={go} onVehicle={onVehicle} onDriver={onDriver} />}
          {route.name === "detail" && <DetailView tripId={route.tripId} from={route.from} go={go} toast={toast} onVehicle={onVehicle} onDriver={onDriver} />}
        </div>
      </main>
      {infoModal?.type === "vehicle" && <VehicleInfoModal vehicleId={infoModal.id} onClose={closeInfoModal} />}
      {infoModal?.type === "driver" && <DriverInfoModal driverId={infoModal.id} onClose={closeInfoModal} />}
      {toastNode}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

}
