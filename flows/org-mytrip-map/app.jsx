{

const { useState, useMemo, useRef, useEffect } = React;
const { Icon, OrgSwitcher } = window.SharedShell;
const D = window.MYTRIP_MAP;

const vehicleById = (id) => D.vehicles.find((v) => v.id === id);
const driverById = (id) => D.drivers.find((d) => d.id === id);

/* Vehicle live-state → dot colour + label. Kept local (small, view-specific)
   rather than forking a shared StatusBadge variant. */
const STATE_META = {
  moving:   { label: "On the road", color: "#0081AA" },
  paused:   { label: "Paused",      color: "var(--amber-500)" },
  assigned: { label: "Upcoming",    color: "var(--fg-tertiary)" },
  done:     { label: "Completed",   color: "var(--green-500)" },
};

const SECTIONS = [
  { key: "ongoing",     label: "Ongoing" },
  { key: "not_started", label: "Upcoming" },
  { key: "completed",   label: "Completed" },
];

const KPI_DEFS = [
  { key: "completed", label: "Completed", color: "var(--green-600)" },
  { key: "ongoing",   label: "Ongoing",   color: "#0081AA" },
  { key: "pending",   label: "Pending",   color: "var(--fg-secondary)" },
  { key: "paused",    label: "Paused",    color: "var(--amber-500)" },
];

/* Checkpoint pin = last "current" waypoint, else last "done", else origin. */
function pinIndex(wps) {
  const cur = wps.findIndex((w) => w.status === "current");
  if (cur >= 0) return cur;
  let last = -1;
  wps.forEach((w, i) => { if (w.status === "done") last = i; });
  return last >= 0 ? last : 0;
}

function progressOf(entry) {
  const total = entry.waypoints.length;
  if (entry.section === "not_started") return { text: "Not departed", short: `0/${total}` };
  if (entry.section === "completed") return { text: `All ${total} stops done`, short: `${total}/${total}` };
  const done = entry.waypoints.filter((w) => w.status === "done").length;
  const cur = entry.waypoints.some((w) => w.status === "current") ? 1 : 0;
  const n = done + cur;
  return { text: `${n} of ${total} waypoints`, short: `${n}/${total}` };
}

/* ── Icon nav rail (mirrors the MyTrip module shell) ───────────────
   Dashboard / Trips / Schedule live in the sibling dashboard flow (state-
   routed, no deep links) so they navigate to its index; Live Map is here. */
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", href: "../org-mytrip-dashboard/index.html" },
  { key: "trips", label: "Trips", icon: "route", href: "../org-mytrip-dashboard/index.html" },
  { key: "schedule", label: "Schedule", icon: "calendar_view_day", href: "../org-mytrip-dashboard/index.html" },
  { key: "map", label: "Live Map", icon: "map", active: true },
];

function NavRail() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={"mt-rail-wrap" + (expanded ? " expanded" : "")}>
      <nav className={"mt-rail" + (expanded ? " expanded" : "")} aria-label="MyTrip navigation">
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
        {NAV_ITEMS.map((item) => item.active ? (
          <button key={item.key} type="button" className="mt-rail-item active" aria-current="page">
            <Icon name={item.icon} size={20} fill={1} />
            <span>{item.label}</span>
          </button>
        ) : (
          <a key={item.key} href={item.href} className="mt-rail-item">
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </a>
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

/* ── Leaflet map ───────────────────────────────────────────────────
   All Leaflet calls sit inside effects (never at module/render time) so an
   SSR sanity render — where window.L is undefined — never throws. */
function stopIcon(L, kind) {
  if (kind === "truck") {
    return L.divIcon({
      className: "mtm-di",
      html: '<div class="mtm-pin mtm-pin-truck"><span class="msr">local_shipping</span></div>',
      iconSize: [34, 34], iconAnchor: [17, 17],
    });
  }
  return L.divIcon({
    className: "mtm-di",
    html: `<span class="mtm-pin mtm-pin-${kind}"></span>`,
    iconSize: [16, 16], iconAnchor: [8, 8],
  });
}

function FleetMap({ entry, onPinMove }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const pinRef = useRef(null);          // pin [lat,lng]
  const onPinMoveRef = useRef(onPinMove);
  useEffect(() => { onPinMoveRef.current = onPinMove; }, [onPinMove]);

  // Push the pin's current pixel position (relative to the map container) up
  // so the summary callout can anchor beside the truck marker.
  const emitPin = () => {
    const L = window.L, map = mapRef.current;
    if (!L || !map || !pinRef.current || !onPinMoveRef.current) return;
    const p = map.latLngToContainerPoint(L.latLng(pinRef.current));
    onPinMoveRef.current({ x: p.x, y: p.y });
  };

  useEffect(() => {
    const L = window.L;
    if (!L || !elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { zoomControl: false, attributionControl: true })
      .setView([3.05, 101.55], 9);
    L.control.zoom({ position: "topright" }).addTo(map); // clears the floating panel
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    map.on("move zoom resize", emitPin);
    // Leaflet mis-sizes if the container animated/flex-sized after init.
    setTimeout(() => { map.invalidateSize(); emitPin(); }, 60);
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const L = window.L;
    const map = mapRef.current, grp = layerRef.current;
    if (!L || !map || !grp) return;
    grp.clearLayers();
    if (!entry) return;

    const wps = entry.waypoints;
    const pts = wps.map((w) => [w.lat, w.lng]);
    const pi = pinIndex(wps);
    const solid = pts.slice(0, pi + 1);
    const ghost = pts.slice(pi);

    if (solid.length > 1) L.polyline(solid, { color: "#00AA4F", weight: 4, opacity: 0.9 }).addTo(grp);
    if (ghost.length > 1) L.polyline(ghost, { color: "#9AA7AE", weight: 3, opacity: 0.75, dashArray: "6 8" }).addTo(grp);

    wps.forEach((w, i) => {
      const kind = i === pi ? "truck" : (w.status === "pending" ? "pending" : "done");
      L.marker([w.lat, w.lng], { icon: stopIcon(L, kind), zIndexOffset: i === pi ? 1000 : 0 })
        .bindTooltip(`${w.label}<br><span style="color:#7b8a91">${w.t}</span>`, { direction: "top", offset: [0, -10] })
        .addTo(grp);
    });

    pinRef.current = [wps[pi].lat, wps[pi].lng];
    map.invalidateSize();
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [56, 56], maxZoom: 13 });
    emitPin();
  }, [entry]);

  if (typeof window !== "undefined" && !window.L) {
    return <div className="mtm-map mtm-map-fallback"><span>Map unavailable</span></div>;
  }
  return <div className="mtm-map" ref={elRef} />;
}

/* ── Left rail: KPI chips + sectioned vehicle selector ─────────────── */
function KpiChips() {
  return (
    <div className="mtm-kpis">
      {KPI_DEFS.map((k) => (
        <div key={k.key} className="mtm-chip">
          <span className="mtm-chip-dot" style={{ background: k.color }} />
          <span className="mtm-chip-num">{D.kpis[k.key]}</span>
          <span className="mtm-chip-label">{k.label}</span>
        </div>
      ))}
    </div>
  );
}

function FleetRow({ entry, active, onSelect }) {
  const v = vehicleById(entry.vehicleId);
  const dr = driverById(entry.driverId);
  const meta = STATE_META[entry.state] || STATE_META.assigned;
  const prog = progressOf(entry);
  return (
    <button type="button" className={"mtm-row" + (active ? " active" : "")}
      onClick={() => onSelect(entry.vehicleId)}>
      <span className="mtm-row-dot" style={{ background: meta.color }} />
      <span className="mtm-row-main">
        <span className="mtm-row-plate">{v.plate}</span>
        <span className="mtm-row-driver">{dr.name}</span>
      </span>
      <span className="mtm-row-prog">{prog.short}</span>
    </button>
  );
}

function FleetRail({ selectedId, onSelect }) {
  const [open, setOpen] = useState({ ongoing: true, not_started: true, completed: true });
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const grouped = useMemo(() => {
    const g = {};
    SECTIONS.forEach((s) => { g[s.key] = D.fleet.filter((f) => f.section === s.key); });
    return g;
  }, []);
  const matches = (entry) => {
    if (!searching) return true;
    const v = vehicleById(entry.vehicleId), dr = driverById(entry.driverId);
    return v.plate.toLowerCase().includes(q) || dr.name.toLowerCase().includes(q);
  };
  const totalMatches = D.fleet.filter(matches).length;

  return (
    <aside className="mtm-panel">
      <div className="mtm-pcard mtm-pcard-kpis">
        <div className="mtm-panel-head">
          <div className="mtm-panel-title">Fleet</div>
          <div className="mtm-panel-sub">{D.dateLabel} · as of {D.nowLabel}</div>
        </div>
        <KpiChips />
      </div>
      <div className="mtm-pcard mtm-pcard-list">
        <div className="mtm-search-box">
          <Icon name="search" size={16} color="var(--fg-tertiary)" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vehicle or driver" aria-label="Search vehicle or driver" />
          {searching && (
            <button type="button" className="mtm-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
              <Icon name="close" size={15} />
            </button>
          )}
        </div>
        {searching && totalMatches === 0 ? (
          <div className="mtm-sec-empty" style={{ padding: "10px 8px 4px" }}>No vehicle or driver matches &ldquo;{query}&rdquo;.</div>
        ) : (
          <div className="mtm-sections">
          {SECTIONS.map((s) => {
            const rows = grouped[s.key].filter(matches);
            if (searching && rows.length === 0) return null;
            const isOpen = searching || open[s.key];
            return (
              <div key={s.key} className="mtm-sec">
                <button type="button" className="mtm-sec-head"
                  onClick={() => setOpen((o) => ({ ...o, [s.key]: !o[s.key] }))}>
                  <Icon name={isOpen ? "expand_more" : "chevron_right"} size={18} />
                  <span className="mtm-sec-label">{s.label}</span>
                  <span className="mtm-sec-count">{rows.length}</span>
                </button>
                {isOpen && (
                  <div className="mtm-sec-list">
                    {rows.length === 0
                      ? <div className="mtm-sec-empty">None</div>
                      : rows.map((e) => (
                          <FleetRow key={e.vehicleId} entry={e}
                            active={e.vehicleId === selectedId} onSelect={onSelect} />
                        ))}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── Summary callout: compact card anchored beside the truck pin ───── */
function FleetCallout({ entry, pinPt, onOpenWaypoints }) {
  if (!entry || !pinPt) return null;
  const v = vehicleById(entry.vehicleId);
  const dr = driverById(entry.driverId);
  const meta = STATE_META[entry.state] || STATE_META.assigned;
  const prog = progressOf(entry);
  const timeLabel = entry.section === "completed" ? `Completed ${entry.completedAt}`
    : entry.section === "not_started" ? `Departs ${entry.scheduled}`
    : `ETA ${entry.eta}`;
  // Flip to the left of the pin when it sits in the right third of the map.
  const flip = typeof window !== "undefined" && pinPt.x > window.innerWidth - 300;
  const style = { left: pinPt.x, top: pinPt.y };
  return (
    <div className={"mtm-callout" + (flip ? " flip" : "")} style={style}>
      <div className="mtm-callout-head">
        <span className="mtm-callout-state" style={{ background: meta.color }} />
        <span className="mtm-callout-plate">{v.plate}</span>
        <span className="mtm-callout-tag">{meta.label}</span>
      </div>
      <div className="mtm-callout-rows">
        <span className="mtm-callout-row"><Icon name="person" size={14} /> <span className="mtm-callout-val">{dr.name}</span></span>
        <span className="mtm-callout-row"><Icon name="call" size={14} /> <span className="mtm-callout-val">{dr.phone}</span></span>
        <span className="mtm-callout-row"><Icon name="mail" size={14} /> <span className="mtm-callout-val" title={dr.email}>{dr.email}</span></span>
        <span className="mtm-callout-row"><Icon name="near_me" size={14} /> <span className="mtm-callout-val">{entry.to}</span></span>
        <span className="mtm-callout-row"><Icon name="pin_drop" size={14} /> <span className="mtm-callout-val">{prog.text}</span></span>
        <span className="mtm-callout-row"><Icon name="schedule" size={14} /> <span className="mtm-callout-val">{timeLabel}</span></span>
      </div>
      <button type="button" className="mtm-callout-btn" onClick={onOpenWaypoints}>
        <Icon name="list_alt" size={15} /> View waypoints
      </button>
    </div>
  );
}

/* ── Trip stats: distance is computed for real from waypoint coords;
   duration is derived from started→ETA when both are clock times parseable.
   On-time % is a presentational mock (paused trips read lower). ────────── */
function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
function routeDistanceKm(wps) {
  let km = 0;
  for (let i = 1; i < wps.length; i++) km += haversineKm(wps[i - 1], wps[i]);
  return km;
}
function parseClock(str) {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(str || "");
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + Number(m[2]);
}
function formatClock(mins) {
  mins = ((mins % 1440) + 1440) % 1440;
  let h = Math.floor(mins / 60), m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}
function formatDuration(mins) {
  if (mins == null || mins < 0) return "—";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function tripStats(entry) {
  const distanceKm = routeDistanceKm(entry.waypoints);
  const startClock = parseClock(entry.started || entry.scheduled);
  const endClock = parseClock(entry.eta || entry.completedAt);
  let durationMins = null;
  if (startClock != null && endClock != null) {
    durationMins = endClock - startClock;
    if (durationMins < 0) durationMins += 1440;
  }
  const onTimePct = entry.state === "paused" ? 82 : entry.state === "assigned" ? 100 : 96;
  return { distanceKm, durationMins, onTimePct };
}
// Per-stop Arrival/Departure/Duration — mocked dwell time at completed stops
// (the source data only carries one timestamp per waypoint).
function waypointTimes(w, isPin) {
  const clock = parseClock(w.t);
  if (w.status === "pending" || clock == null) return { arrival: "—", departure: "—", duration: "—" };
  if (isPin) return { arrival: formatClock(clock), departure: "—", duration: "—" };
  const dwell = 12;
  return { arrival: formatClock(clock), departure: formatClock(clock + dwell), duration: formatDuration(dwell) };
}
function wpBadge(w, isPin) {
  if (isPin) return { label: "Ongoing", cls: "ongoing" };
  if (w.status === "pending") return { label: "Upcoming", cls: "upcoming" };
  return { label: "Completed", cls: "completed" };
}
const WP_NOTE = {
  completed: "Delivery confirmed. No exceptions logged.",
  ongoing: "Live position — last checkpoint ping above.",
  upcoming: "Not yet reached.",
};

/* ── Right drawer: trip overview + waypoint progress (adapts mfd-drawer) ── */
function WaypointDrawer({ entry, open, onClose }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape" && open) onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  useEffect(() => { setExpandedIdx(null); }, [entry?.vehicleId, open]);
  if (!open || !entry) return null;
  const v = vehicleById(entry.vehicleId);
  const dr = driverById(entry.driverId);
  const wps = entry.waypoints;
  const pi = pinIndex(wps);
  const prog = progressOf(entry);
  const stats = tripStats(entry);
  const endLabel = entry.section === "completed" ? "Completed" : entry.section === "not_started" ? "Departs" : "ETA";
  const endValue = entry.completedAt || entry.eta || entry.scheduled;
  return ReactDOM.createPortal(
    <div className="mtm-drawer-backdrop" onClick={onClose} role="presentation">
      <div className="mtm-drawer" onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label={`Trip details for ${v.plate}`}>
        <div className="mtm-drawer-head">
          <div>
            <div className="mtm-drawer-plate">{v.plate}</div>
            <div className="mtm-drawer-route">{entry.from} → {entry.to}</div>
          </div>
          <button type="button" className="mtm-drawer-close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="mtm-drawer-body">
          <div className="mtm-drawer-meta">
            <span><Icon name="person" size={14} /> {dr.name}</span>
            <span><Icon name="call" size={14} /> {dr.phone}</span>
            <span><Icon name="mail" size={14} /> <span className="mtm-meta-val" title={dr.email}>{dr.email}</span></span>
          </div>

          <div className="mtm-trip-card">
            <div className="mtm-trip-card-title"><Icon name="route" size={16} /> Trip overview</div>
            <div className="mtm-trip-stat-grid">
              <span>Started</span><b>{entry.started || `Scheduled ${entry.scheduled}`}</b>
              <span>{endLabel}</span><b>{endValue}</b>
              <span>Distance</span><b>{stats.distanceKm.toFixed(1)} km</b>
              <span>Duration</span><b>{formatDuration(stats.durationMins)}</b>
            </div>
            <div className="mtm-trip-metrics">
              <div className="mtm-metric">
                <span className="mtm-metric-circle good"><Icon name="bolt" size={18} /></span>
                <span className="mtm-metric-val">{stats.onTimePct}%</span>
                <span className="mtm-metric-label">On time</span>
              </div>
              <div className="mtm-metric">
                <span className="mtm-metric-circle"><Icon name="check" size={18} /></span>
                <span className="mtm-metric-val">{prog.short}</span>
                <span className="mtm-metric-label">completed</span>
              </div>
            </div>
          </div>

          <div className="mtm-progress-title"><Icon name="alt_route" size={16} /> Route Progress</div>
          <div className="mtm-wps">
            {wps.map((w, i) => {
              const isPin = i === pi;
              const cls = isPin ? "pin" : (w.status === "pending" ? "pending" : "done");
              const badge = wpBadge(w, isPin);
              const times = waypointTimes(w, isPin);
              const isExpanded = expandedIdx === i;
              return (
                <div key={i} className="mtm-wp">
                  <div className="mtm-wp-rail">
                    <span className={"mtm-wp-node mtm-wp-node-" + cls}>
                      {isPin && <span className="msr" style={{ fontSize: 13 }}>local_shipping</span>}
                    </span>
                    {i < wps.length - 1 && <span className="mtm-wp-line" />}
                  </div>
                  <button type="button" className="mtm-wp-copy" onClick={() => setExpandedIdx(isExpanded ? null : i)}
                    aria-expanded={isExpanded}>
                    <div className="mtm-wp-toprow">
                      <div className="mtm-wp-label">{w.label}</div>
                      <span className={"mtm-wp-badge mtm-wp-badge-" + badge.cls}>{badge.label}</span>
                    </div>
                    <div className="mtm-wp-times">
                      <span><i>Arrival</i><b>{times.arrival}</b></span>
                      <span><i>Departure</i><b>{times.departure}</b></span>
                      <span><i>Duration</i><b>{times.duration}</b></span>
                    </div>
                    {isExpanded && (
                      <div className="mtm-wp-expand">
                        <Icon name="notes" size={14} /> {WP_NOTE[badge.cls]}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── App ───────────────────────────────────────────────────────────── */
function App() {
  const [selectedId, setSelectedId] = useState(D.fleet[0].vehicleId);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pinPt, setPinPt] = useState(null);
  const entry = D.fleet.find((f) => f.vehicleId === selectedId);

  const onSelect = (id) => { setSelectedId(id); };

  return (
    <div className="mtm-shell">
      <NavRail />
      <div className="mtm-app">
        <div className="mtm-topbar">
          <OrgSwitcher orgs={D.orgs} initialId={D.org.id} />
          <span className="mtm-topbar-title">MyTrip · Live Fleet Map <span className="mtm-topbar-tag">TEST</span></span>
          <div className="mtm-topbar-spacer" />
        </div>
        <div className="mtm-body">
          <FleetMap entry={entry} onPinMove={setPinPt} />
          <FleetRail selectedId={selectedId} onSelect={onSelect} />
          <FleetCallout entry={entry} pinPt={pinPt} onOpenWaypoints={() => setDrawerOpen(true)} />
        </div>
        <WaypointDrawer entry={entry} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

}
