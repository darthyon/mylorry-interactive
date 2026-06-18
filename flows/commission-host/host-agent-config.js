(function () {
// host-agent-config.jsx — Host portal: Agent Module (tabs + commission config)

const {
  useState,
  useMemo,
  useRef,
  useEffect
} = React;
const MyFuelCommissionTabView = window.MyFuelCommissionTab;

/* ─── Commission Status Badge — shared (window.HStatusBadge) ──── */
const CommissionStatusBadge = window.HStatusBadge;

/* ─── KPI progress bar — shared (window.HKPIProgress) ───────── */
const KPIProgress = window.HKPIProgress;
const KPIProgressMeta = window.KPIProgressMeta;
const AccountStatusBadge = window.HAccountStatusBadge;
const PetronLogo = window.SharedShell.PetronLogo;

/* ─── KPI multiplier zones — derived from configurable thresholds ─────── */
// Each threshold stores only a lower bound (minPct); the upper bound of a tier
// is the next-higher tier's lower bound, so ranges stay contiguous (no gaps /
// overlaps) by construction. The final tier (isFinal) is open-ended upward, but
// the visual axis is capped at 100% because target achievement is the ceiling
// of the progress track.
// Returns { zones (ascending, with from/to/mult/tier/isFinal/col/fill), axisMax }.
function kpiZones(thresholds) {
  const asc = [...(thresholds || [])].sort((a, b) => a.minPct - b.minPct);
  if (asc.length === 0) return {
    zones: [],
    axisMax: 100
  };
  const axisMax = 100;
  const zones = asc.map((t, i) => ({
    from: t.minPct,
    to: asc[i + 1] ? asc[i + 1].minPct : axisMax,
    mult: t.mult,
    tier: t.tier,
    isFinal: t.isFinal
  }));
  return {
    zones,
    axisMax
  };
}
const kpiZoneOf = (pct, zones) => zones.find(z => pct >= z.from && pct < z.to) || zones[zones.length - 1];
// Range text for a zone — final tier is open-ended (≥ lower%).
const zoneRange = z => z.isFinal ? `≥ ${z.from}%` : `${z.from}%–${(z.to - 0.01).toFixed(2)}%`;
// Tint a cell by its zone's multiplier band (not cell-center %), so the final
// tier turns green even though no cell center reaches 100. Mirrors agent-parts.jsx.
const zoneMeta = z => KPIProgressMeta(z?.mult >= 100 ? 100 : z?.mult >= 50 ? 75 : 0);
const monthKeyOfDate = value => value ? value.slice(0, 7) : "";
const currentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
const nextMonthKey = value => {
  if (!value) return "";
  const [year, month] = value.split("-").map(Number);
  const dt = new Date(year, month, 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};
const monthLabel = value => {
  if (!value) return "—";
  const [year, month] = value.split("-");
  const dt = new Date(Number(year), Number(month) - 1, 1);
  return dt.toLocaleDateString("en-MY", {
    month: "long",
    year: "numeric"
  });
};
function buildAgentConfig(agent) {
  const base = window.HC.AGENT_CONFIG;
  const row = agent || base;
  return {
    ...base,
    id: row.id,
    name: row.name,
    referrer: row.referrer,
    joined: row.joined,
    status: row.status || base.status,
    accountStatus: row.accountStatus || base.accountStatus,
    kpi: {
      ...base.kpi,
      actual: row.volume ?? base.kpi.actual,
      locked: row.kpiPhase === "complete",
      phase: row.kpiPhase || "active",
      current: {
        ...base.kpi.current,
        target: row.kpiTarget ?? base.kpi.current.target
      }
    },
    termination: row.id === base.id ? {
      ...base.termination,
      scheduledTransfer: base.termination?.scheduledTransfer ? {
        ...base.termination.scheduledTransfer
      } : null
    } : {
      date: "",
      commissionEndDate: "",
      scheduledTransfer: null
    }
  };
}

/* ─── KPI Progress block (segmented axis) — inline inside KPI Config ─── */
function KPIProgressBlock({
  kpi,
  target,
  thresholds,
  showSummary = true
}) {
  const actual = kpi?.actual ?? 0;
  const period = kpi?.progressPeriod || "Dec 1–31";
  const phase = kpi?.phase || (kpi?.locked ? "complete" : "active");
  const isFuture = phase === "future";
  const pct = target ? Math.round(actual / target * 1000) / 10 : 0;
  const progressMeta = KPIProgressMeta(pct);
  const {
    zones,
    axisMax
  } = kpiZones(thresholds);
  const zone = kpiZoneOf(pct, zones);
  const markerCol = isFuture ? "var(--fg-tertiary)" : progressMeta.solid;
  const pos = p => Math.min(p, axisMax) / axisMax * 100;
  // Tick marks at every interior boundary (each zone's lower bound > 0).
  const ticks = zones.filter(z => z.from > 0).map(z => z.from);
  const finalZone = zones[zones.length - 1];
  // Discrete cells (SegmentedProgressView-style). Each cell is tinted by the
  // shared progress bands: light tint when not yet reached, saturated colour
  // once achieved. Threshold ticks remain as quiet guides only.
  const CELLS = 10;
  const STEP = axisMax / CELLS;
  const cells = Array.from({
    length: CELLS
  }, (_, i) => {
    const from = i * STEP;
    const sampled = kpiZoneOf(from + STEP / 2, zones) || {};
    const z = i === CELLS - 1 && finalZone?.from >= axisMax ? finalZone : sampled;
    const meta = zoneMeta(z);
    const reached = !isFuture && pct > from;
    return {
      bg: reached ? meta.solid : meta.fill,
      tier: z.tier,
      range: z.from != null ? zoneRange(z) : "",
      mult: z.mult
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-progress-block"
  }, showSummary && /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis-pct",
    style: {
      color: markerCol,
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", null, isFuture ? "–" : pct + "%"), !isFuture && progressMeta.isAchieved && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      lineHeight: 1
    }
  }, "\u2713")), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis-readout"
  }, /*#__PURE__*/React.createElement("span", null, "Achieved ", /*#__PURE__*/React.createElement("b", null, isFuture ? "–" : actual.toLocaleString("en-US") + " L")), !isFuture && zone && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-secondary)"
    }
  }, "Current multiplier ", zone.mult, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis" + (isFuture ? " future" : ""),
    style: {
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiseg"
  }, cells.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hac-kpiseg-cell ml-tooltip-wrap",
    style: {
      background: c.bg
    }
  }, c.tier && /*#__PURE__*/React.createElement("span", {
    className: "ml-tooltip"
  }, /*#__PURE__*/React.createElement("b", null, c.tier), /*#__PURE__*/React.createElement("br", null), c.range, " \xB7 ", c.mult, "% multiplier")))), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis-ticks"
  }, ticks.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    className: "hac-kpiaxis-tick",
    style: {
      left: pos(t) + "%"
    }
  }, t, "%")))), isFuture && /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis-note"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "info",
    size: 14,
    color: "var(--fg-tertiary)"
  }), "Evaluation period has not started. Progress tracked from ", period, "."));
}

/* ─── Bank badge ─────────────────────────────────────────────── */
const BANK_META = {
  "Maybank": {
    "bg": "#FFF3D4",
    "fg": "#7A4F00",
    "abbr": "MB"
  },
  "CIMB": {
    "bg": "#FFE4E4",
    "fg": "#B71C1C",
    "abbr": "CIMB"
  },
  "Public Bank": {
    "bg": "#E3F0FF",
    "fg": "#1A5CA8",
    "abbr": "PB"
  },
  "RHB Bank": {
    "bg": "#FFE8D6",
    "fg": "#B94000",
    "abbr": "RHB"
  },
  "Hong Leong Bank": {
    "bg": "#E8F5E9",
    "fg": "#2E7D32",
    "abbr": "HLB"
  },
  "AmBank": {
    "bg": "#F3E5FF",
    "fg": "#6A1B9A",
    "abbr": "AMB"
  },
  "Bank Islam": {
    "bg": "#E0F4FF",
    "fg": "#006E9F",
    "abbr": "BI"
  },
  "Bank Rakyat": {
    "bg": "#E8F5E9",
    "fg": "#1B5E20",
    "abbr": "BR"
  },
  "BSN": {
    "bg": "#FFF3E0",
    "fg": "#E65100",
    "abbr": "BSN"
  },
  "OCBC": {
    "bg": "#FFF9E6",
    "fg": "#7B5800",
    "abbr": "OCBC"
  },
  "UOB": {
    "bg": "#E8EEFF",
    "fg": "#1A237E",
    "abbr": "UOB"
  },
  "Standard Chartered": {
    "bg": "#E8F5E9",
    "fg": "#1B5E20",
    "abbr": "SC"
  }
};
function BankBadge({
  name
}) {
  if (!name || name === "-") return /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-disabled)"
    }
  }, "\u2014");
  const m = BANK_META[name] || {
    bg: "#F5F5F5",
    fg: "#757575",
    abbr: name.substring(0, 2).toUpperCase()
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "hac-bank-badge"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-bank-icon",
    style: {
      background: m.bg,
      color: m.fg
    }
  }, m.abbr), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, name));
}

/* ─── Ellipsis menu ──────────────────────────────────────────── */
function EllipsisMenu({
  agent,
  onView,
  onEdit,
  onTerminate
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({
    top: 0,
    left: 0
  });
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const DROP_W = 150;
  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (dropRef.current && dropRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const dismiss = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);
  const toggle = e => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({
        top: r.bottom + 4,
        left: r.right - DROP_W
      });
    }
    setOpen(v => !v);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "hac-ellipsis"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-icon-btn",
    ref: btnRef,
    onClick: toggle
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "more_horiz",
    size: 18
  })), open && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "hac-drop-fixed",
    ref: dropRef,
    style: {
      top: pos.top,
      left: pos.left
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-drop-item",
    onClick: () => {
      setOpen(false);
      onView();
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "visibility",
    size: 15
  }), " View"), /*#__PURE__*/React.createElement("button", {
    className: "hac-drop-item",
    onClick: () => {
      setOpen(false);
      onEdit();
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "edit",
    size: 15
  }), " Edit"), agent.status !== "terminating" && /*#__PURE__*/React.createElement("button", {
    className: "hac-drop-item danger",
    onClick: () => {
      setOpen(false);
      onTerminate();
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "event_busy",
    size: 15
  }), " Terminate")), document.body));
}

/* ─── Agents list (Tab 1) ────────────────────────────────────── */
function AgentsListView({
  onView,
  onEdit,
  onCreate,
  onTerminate
}) {
  const {
    AGENTS
  } = window.HC;
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  // staged values inside panel
  const [pendingType, setPendingType] = useState("all");
  const [pendingStatus, setPendingStatus] = useState("all");
  const [perPage, setPerPage] = useState(10);
  const hasActiveFilters = filter !== "all" || statusFilter !== "all";
  const activeCount = (filter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);
  const toggleFilter = () => {
    if (!filterOpen) {
      setPendingType(filter);
      setPendingStatus(statusFilter);
    }
    setFilterOpen(v => !v);
  };
  const applyFilters = () => {
    setFilter(pendingType);
    setStatusFilter(pendingStatus);
    setPage(1);
    setFilterOpen(false);
  };
  const resetFilters = () => {
    setPendingType("all");
    setPendingStatus("all");
    setFilter("all");
    setStatusFilter("all");
    setPage(1);
  };
  const filtered = useMemo(() => {
    let list = AGENTS;
    if (q) list = list.filter(a => a.name.toLowerCase().includes(q.toLowerCase()) || a.id.toLowerCase().includes(q.toLowerCase()) || a.email.toLowerCase().includes(q.toLowerCase()));
    if (filter === "referrer") list = list.filter(a => a.referrer);
    if (filter === "agent") list = list.filter(a => !a.referrer);
    if (statusFilter !== "all") list = list.filter(a => a.accountStatus === statusFilter);
    return list;
  }, [AGENTS, q, filter, statusFilter]);
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hac-toolbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-toolbar-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-search-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-search-bar single"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "search",
    size: 18,
    color: "var(--fg-tertiary)"
  }), /*#__PURE__*/React.createElement("input", {
    className: "hac-search-input",
    placeholder: "Search by name, ID or email",
    value: q,
    onChange: e => {
      setQ(e.target.value);
      setPage(1);
    }
  }), q && /*#__PURE__*/React.createElement("button", {
    className: "hac-search-clear",
    onClick: () => {
      setQ("");
      setPage(1);
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "close",
    size: 16,
    color: "var(--fg-tertiary)"
  })))), /*#__PURE__*/React.createElement("button", {
    className: "hac-filter-btn" + (hasActiveFilters ? " active" : ""),
    onClick: toggleFilter
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "tune",
    size: 18
  }), "Filter", activeCount > 0 && /*#__PURE__*/React.createElement("span", {
    className: "hac-filter-badge"
  }, activeCount))), /*#__PURE__*/React.createElement("button", {
    className: "hac-create-btn",
    onClick: onCreate
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "add",
    size: 16,
    color: "#fff"
  }), " Create Account")), filterOpen && /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-field"
  }, /*#__PURE__*/React.createElement("label", null, "Role"), /*#__PURE__*/React.createElement("select", {
    value: pendingType,
    onChange: e => setPendingType(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All roles"), /*#__PURE__*/React.createElement("option", {
    value: "agent"
  }, "Agent"), /*#__PURE__*/React.createElement("option", {
    value: "referrer"
  }, "Referrer"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-field"
  }, /*#__PURE__*/React.createElement("label", null, "Account Status"), /*#__PURE__*/React.createElement("select", {
    value: pendingStatus,
    onChange: e => setPendingStatus(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All statuses"), /*#__PURE__*/React.createElement("option", {
    value: "active"
  }, "Active"), /*#__PURE__*/React.createElement("option", {
    value: "terminated"
  }, "Terminated")))), /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-filter-apply",
    onClick: applyFilters
  }, "Apply Filters"), /*#__PURE__*/React.createElement("button", {
    className: "hac-filter-reset",
    onClick: resetFilters
  }, "Reset All"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-count"
  }, filtered.length, " Salesperson account", filtered.length !== 1 ? "s" : ""), /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table hac-agent-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "No."), /*#__PURE__*/React.createElement("th", null, "Salesperson"), /*#__PURE__*/React.createElement("th", null, "Role"), /*#__PURE__*/React.createElement("th", null, "KPI Progress"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Mobile Number"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "IC Number"), /*#__PURE__*/React.createElement("th", null, "Bank Name"), /*#__PURE__*/React.createElement("th", null, "Account Number"), /*#__PURE__*/React.createElement("th", null, "Account Name"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, pageData.map((a, i) => /*#__PURE__*/React.createElement("tr", {
    key: a.id,
    onClick: () => onView(a)
  }, /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, (page - 1) * perPage + i + 1), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-main"
  }, a.name), /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-sub"
  }, /*#__PURE__*/React.createElement("code", {
    className: "hac-code"
  }, a.id))), /*#__PURE__*/React.createElement("td", null, a.referrer ? "Referrer" : "Agent"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(KPIProgress, {
    pct: a.kpiPct,
    actual: a.volume,
    target: a.kpiTarget,
    period: "Dec 1\u201331",
    phase: a.kpiPhase
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(AccountStatusBadge, {
    status: a.accountStatus
  })), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, a.mobile), /*#__PURE__*/React.createElement("td", {
    style: {
      color: "var(--fg-secondary)",
      fontSize: 12
    }
  }, a.email), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono",
    style: {
      fontSize: 12
    }
  }, a.ic), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(BankBadge, {
    name: a.bankName
  })), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono",
    style: {
      fontSize: 12
    }
  }, a.accNo === "-" ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-disabled)"
    }
  }, "\u2014") : a.accNo), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: 13
    }
  }, a.accName === "-" ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-disabled)"
    }
  }, "\u2014") : a.accName), /*#__PURE__*/React.createElement("td", {
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement(EllipsisMenu, {
    agent: a,
    onView: () => onView(a),
    onEdit: () => onEdit(a),
    onTerminate: () => onTerminate(a)
  }))))))), /*#__PURE__*/React.createElement(HPager, {
    page: page,
    perPage: perPage,
    total: filtered.length,
    onPage: setPage,
    onPerPage: setPerPage
  }));
}

/* ─── Modal shell ────────────────────────────────────────────── */
function Modal({
  title,
  onClose,
  children,
  footer
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "hac-modal-overlay",
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-modal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-modal-drag"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hac-modal-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-modal-title"
  }, title), /*#__PURE__*/React.createElement("button", {
    className: "hac-modal-close",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "cancel",
    size: 22,
    fill: 1,
    color: "var(--fg-disabled)"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hac-modal-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hac-modal-body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "hac-modal-foot"
  }, footer)));
}

/* ─── Threshold Modal (add / edit) ───────────────────────────── */
// Single lower-bound model: user sets the lower bound (minPct) and multiplier.
// The upper bound is derived (next-higher tier's lower bound) and shown read-only,
// so ranges stay contiguous. Final tier hides the upper bound and is open-ended.
function ThresholdModal({
  editThreshold,
  siblings,
  onClose,
  onSave
}) {
  const isEdit = !!editThreshold;
  const others = (siblings || []).filter(t => !isEdit || t.id !== editThreshold.id);
  const [tierName, setTierName] = useState(editThreshold ? editThreshold.tier : "");
  const [minPct, setMinPct] = useState(editThreshold ? String(editThreshold.minPct ?? "") : "");
  const [mult, setMult] = useState(editThreshold ? String(editThreshold.mult ?? "") : "");
  const [isFinal, setIsFinal] = useState(editThreshold ? !!editThreshold.isFinal : false);
  const lower = minPct === "" ? null : +minPct;
  // Derived upper bound = lowest sibling lower-bound still above this tier's lower.
  const higher = others.map(t => t.minPct).filter(m => lower != null && m > lower);
  const derivedUpper = higher.length ? Math.min(...higher) : 100;
  const lowerValid = lower != null && lower >= 0 && lower <= 100;
  const overlaps = others.some(t => t.minPct === lower); // duplicate lower bound
  const canSave = mult !== "" && !isNaN(+mult) && (isFinal || lowerValid && !overlaps && lower < derivedUpper);
  const handleSave = () => {
    if (!canSave) return;
    const fallbackName = `Tier ${(siblings ? siblings.length : 0) + (isEdit ? 0 : 1)}`;
    onSave({
      tier: tierName.trim() || fallbackName,
      minPct: lower,
      mult: +mult,
      isFinal
    }, isEdit ? editThreshold.id : null);
    onClose();
  };

  // Derived range preview — single progress-start field, upper inferred from next tier.
  const rangePreview = lower == null ? "Enter a progress start to preview the range." : isFinal ? `Covers ≥ ${lower}% — open-ended, including KPI progress above 100%.` : `Covers ${lower}%–${(derivedUpper - 0.01).toFixed(2)}% (up to the next tier).`;
  return /*#__PURE__*/React.createElement(Modal, {
    title: isEdit ? "Edit Threshold" : "Add Threshold",
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "hac-modal-cancel",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "hac-modal-save",
      disabled: !canSave,
      onClick: handleSave
    }, "Save"))
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-fg",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Tier name"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    placeholder: "Auto (e.g. Tier 1)",
    value: tierName,
    onChange: e => setTierName(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg",
    style: {
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label req"
  }, "Progress start %*"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    type: "number",
    min: "0",
    max: "100",
    placeholder: "e.g. 75",
    value: minPct,
    onChange: e => setMinPct(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-field-hint",
    style: {
      marginBottom: 14
    }
  }, rangePreview), /*#__PURE__*/React.createElement("label", {
    className: "hac-check-row",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isFinal,
    onChange: e => setIsFinal(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Set as final tier (open-ended, \u2265 progress start)")), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label req"
  }, "Multiplier %*"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    type: "number",
    placeholder: "e.g. 50",
    value: mult,
    onChange: e => setMult(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "hac-field-hint"
  }, "Applied to the commission earned by the agent")));
}

/* ─── Add SP Account modal ───────────────────────────────────── */
const SP_ORG_LIST = [{
  sp: "ARC-PTN-063",
  org: "Arcadian Haulage"
}, {
  sp: "BLU-PTN-088",
  org: "Bluechip Freight Sdn Bhd"
}, {
  sp: "GLD-PTN-071",
  org: "Golden Transport Corp"
}, {
  sp: "EAG-PTN-012",
  org: "Eagle Logistics Sdn Bhd"
}, {
  sp: "SWF-PTN-034",
  org: "SwiftHaul Transport"
}, {
  sp: "IRT-PTN-056",
  org: "IronTrail Trucking"
}, {
  sp: "CGP-PTN-078",
  org: "CargoPulse Express"
}, {
  sp: "GSR-PTN-091",
  org: "GoSwift Rides"
}, {
  sp: "TRW-PTN-102",
  org: "TransWorld Cargo"
}, {
  sp: "CLN-PTN-115",
  org: "CleanShift Transit"
}];
function AddSPModal({
  onClose,
  onAdd,
  existing
}) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(new Set());
  const available = SP_ORG_LIST.filter(o => !existing.includes(o.sp));
  const filtered = available.filter(o => o.org.toLowerCase().includes(q.toLowerCase()));
  const toggle = sp => setSelected(s => {
    const n = new Set(s);
    n.has(sp) ? n.delete(sp) : n.add(sp);
    return n;
  });
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Add SP Account",
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "hac-modal-cancel",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement("button", {
      className: "hac-modal-save",
      disabled: selected.size === 0,
      onClick: () => {
        onAdd([...selected]);
        onClose();
      }
    }, "Add SP Account", selected.size > 0 ? ` (${selected.size})` : ""))
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sp-search-wrap"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "search",
    size: 15,
    color: "var(--fg-tertiary)"
  }), /*#__PURE__*/React.createElement("input", {
    className: "hac-search",
    style: {
      flex: 1,
      minWidth: 0
    },
    placeholder: "Search organisation",
    value: q,
    onChange: e => setQ(e.target.value)
  })), selected.size > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      margin: "6px 0 2px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-clear-sel",
    onClick: () => setSelected(new Set())
  }, "Clear selection")), /*#__PURE__*/React.createElement("div", {
    className: "hac-sp-list"
  }, filtered.map(o => {
    const checked = selected.has(o.sp);
    return /*#__PURE__*/React.createElement("label", {
      key: o.sp,
      className: "hac-sp-item" + (checked ? " checked" : ""),
      onClick: () => toggle(o.sp)
    }, /*#__PURE__*/React.createElement("div", {
      className: "hac-sp-checkbox" + (checked ? " checked" : "")
    }, checked && /*#__PURE__*/React.createElement(HIcon, {
      name: "check",
      size: 13,
      color: "#fff"
    })), /*#__PURE__*/React.createElement("span", null, o.org), /*#__PURE__*/React.createElement("code", {
      className: "hac-code",
      style: {
        marginLeft: "auto",
        fontSize: 11
      }
    }, o.sp));
  })));
}

/* ─── Inline info tooltip ────────────────────────────────────── */
function InfoTip({
  text
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "ml-tooltip-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-info-btn",
    type: "button",
    "aria-label": text
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "info",
    size: 14
  })), /*#__PURE__*/React.createElement("span", {
    className: "ml-tooltip"
  }, text));
}

/* ─── Three-dot card menu (Edit / Delete) ────────────────────── */
function CardMenu({
  onEdit,
  onDelete,
  deleteDisabled
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({
    top: 0,
    left: 0
  });
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const DROP_W = 150;
  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      if (dropRef.current && dropRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const dismiss = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);
  const toggle = e => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({
        top: r.bottom + 4,
        left: r.right - DROP_W
      });
    }
    setOpen(v => !v);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "hac-ellipsis"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-icon-btn",
    ref: btnRef,
    onClick: toggle,
    title: "Threshold actions"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "more_horiz",
    size: 18
  })), open && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "hac-drop-fixed",
    ref: dropRef,
    style: {
      top: pos.top,
      left: pos.left
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-drop-item",
    onClick: () => {
      setOpen(false);
      onEdit();
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "edit",
    size: 15
  }), " Edit"), !deleteDisabled && /*#__PURE__*/React.createElement("button", {
    className: "hac-drop-item danger",
    onClick: () => {
      setOpen(false);
      onDelete();
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "delete",
    size: 15
  }), " Delete")), document.body));
}

/* ─── Evaluation period options ──────────────────────────────── */
const EVAL_PERIOD_GROUPS = [{
  label: "Custom period",
  options: [{
    label: "Custom range",
    description: "Choose a start and end date manually. Default window: Dec 1 - Dec 31."
  }]
}, {
  label: "Recent periods",
  options: [{
    label: "Last completed month",
    description: "Uses the most recent completed reporting month."
  }, {
    label: "Last 3 completed months",
    description: "Uses the most recent 3 completed reporting months."
  }, {
    label: "Last 6 completed months",
    description: "Uses the most recent 6 completed reporting months."
  }, {
    label: "Last 12 completed months",
    description: "Uses the most recent 12 completed reporting months."
  }]
}, {
  label: "Calendar periods",
  options: [{
    label: "Last completed quarter",
    description: "Uses the previous completed calendar quarter."
  }, {
    label: "Last completed half year",
    description: "Uses the previous completed half-year period, H1 or H2."
  }, {
    label: "Last completed year",
    description: "Uses the previous completed KPI window to set the following year's multiplier."
  }]
}];
function normalizeEvalPeriod(value) {
  const map = {
    Monthly: "Last completed month",
    Quarterly: "Last completed quarter",
    "Half-yearly": "Last completed half year",
    Yearly: "Last completed year",
    "Last month": "Last completed month",
    "Last 3 months": "Last 3 completed months",
    "Last 6 months": "Last 6 completed months",
    "Last 12 months": "Last 12 completed months",
    "Every Last Quarter": "Last completed quarter",
    "Every Last Half Year": "Last completed half year",
    "Every Last Year": "Last completed year",
    "Last year": "Last completed year",
    "[Default - Dec] Start Month + End Month": "Custom range"
  };
  return map[value] || value || "Last completed year";
}
function formatShortDate(value) {
  if (!value) return "—";
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString("en-MY", {
    month: "short",
    day: "numeric"
  });
}
function formatRangeDisplay(startDate, endDate) {
  if (!startDate || !endDate) return "Select date range";
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${startDate} - ${endDate}`;
  return `${start.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })} - ${end.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })}`;
}
function evalPeriodSummary(period) {
  const map = {
    "Custom range": "",
    "Last completed month": "Most recent completed reporting month",
    "Last 3 completed months": "Most recent 3 completed reporting months",
    "Last 6 completed months": "Most recent 6 completed reporting months",
    "Last 12 completed months": "Most recent 12 completed reporting months",
    "Last completed quarter": "Previous completed calendar quarter",
    "Last completed half year": "Previous completed half-year period, H1 or H2",
    "Last completed year": "Period used to calculate KPI achievement and set the following year's multiplier. Default: Dec 1 - Dec 31, configurable."
  };
  return map[period] || "Period used to calculate KPI achievement and set the following year's multiplier. Default: Dec 1 - Dec 31, configurable.";
}

/* ─── KPI config section ─────────────────────────────────────── */
function CommissionSection({
  kpi,
  editing,
  showHistory,
  setShowHistory
}) {
  const [kpiTarget, setKpiTarget] = useState(kpi?.current?.target ?? 150000);
  const [showEvalHelp, setShowEvalHelp] = useState(false);
  const [kpiThresholds, setKpiThresholds] = useState(() => {
    const t = kpi?.current?.thresholds || [{
      id: 1,
      tier: "Tier 3",
      minPct: 100,
      mult: 100,
      isFinal: true
    }, {
      id: 2,
      tier: "Tier 2",
      minPct: 75,
      mult: 50
    }, {
      id: 3,
      tier: "Tier 1",
      minPct: 0,
      mult: 0
    }];
    return t.map((x, i) => ({
      ...x,
      id: x.id || i + 1
    }));
  });
  const [evalPeriod, setEvalPeriod] = useState(normalizeEvalPeriod(kpi?.evalPeriodOpt));
  const defaultCustomStart = "2026-01-01";
  const defaultCustomEnd = "2026-12-31";
  const [customStartDate, setCustomStartDate] = useState(kpi?.customStartDate || defaultCustomStart);
  const [customEndDate, setCustomEndDate] = useState(kpi?.customEndDate || defaultCustomEnd);
  const [useDefaultRange, setUseDefaultRange] = useState((kpi?.customStartDate || defaultCustomStart) === defaultCustomStart && (kpi?.customEndDate || defaultCustomEnd) === defaultCustomEnd);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(null);
  const progressPct = kpiTarget ? Math.round((kpi?.actual ?? 0) / kpiTarget * 1000) / 10 : 0;
  const {
    zones: progressZones
  } = kpiZones(kpiThresholds);
  const activeZone = progressZones.length ? kpiZoneOf(progressPct, progressZones) : null;
  const progressMeta = KPIProgressMeta(progressPct);
  const evaluationWindowLabel = evalPeriod === "Custom range" ? formatRangeDisplay(customStartDate, customEndDate) : kpi?.progressPeriod || evalPeriod;
  const evaluationWindowSummary = evalPeriod === "Custom range" ? "Custom KPI evaluation window" : evalPeriodSummary(evalPeriod);

  // Final tier enforced single — clear the flag on every other tier when set.
  const handleSaveThreshold = (data, editId) => {
    setKpiThresholds(prev => {
      const savedId = editId != null ? editId : Math.max(0, ...prev.map(t => t.id || 0)) + 1;
      const merged = editId != null ? prev.map(t => t.id === editId ? {
        ...t,
        ...data,
        id: savedId
      } : t) : [...prev, {
        ...data,
        id: savedId
      }];
      const deduped = data.isFinal ? merged.map(t => t.id === savedId ? t : {
        ...t,
        isFinal: false
      }) : merged;
      return deduped.sort((a, b) => b.minPct - a.minPct);
    });
  };
  const deleteThreshold = id => {
    setKpiThresholds(prev => prev.filter(t => t.id !== id));
  };

  // Range text for a card — final tier is open-ended (≥ start%); others end just
  // below the next-higher tier's progress-start (order-independent).
  const getThresholdRange = t => {
    if (t.isFinal) return `≥ ${t.minPct}%`;
    const higher = kpiThresholds.map(x => x.minPct).filter(m => m > t.minPct);
    const upper = higher.length ? Math.min(...higher) - 0.01 : 100;
    return `${t.minPct}%–${upper.toFixed(2)}%`;
  };

  // Validation — exactly one final tier, ranges must start at 0%.
  const finalCount = kpiThresholds.filter(t => t.isFinal).length;
  const lowest = Math.min(...kpiThresholds.map(t => t.minPct));
  const issues = [];
  if (finalCount === 0) issues.push("Set one tier as the final tier.");
  if (finalCount > 1) issues.push("Only one tier can be the final tier.");
  if (lowest !== 0) issues.push("Thresholds must start at 0% — the lowest tier's lower bound should be 0.");
  return /*#__PURE__*/React.createElement(React.Fragment, null, kpi && /*#__PURE__*/React.createElement("div", {
    className: "hac-cc-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-summary" + (editing ? " editing" : "")
  }, editing ? /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-edit-grid" + (evalPeriod === "Custom range" ? " custom-range" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-summary-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-summary-label"
  }, "Evaluation Period", /*#__PURE__*/React.createElement("button", {
    className: "ml-info-btn",
    type: "button",
    "aria-label": "How evaluation periods work",
    onClick: () => setShowEvalHelp(true)
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "info",
    size: 14
  }))), /*#__PURE__*/React.createElement("select", {
    className: "hac-select hac-kpi-field",
    value: evalPeriod,
    onChange: e => setEvalPeriod(e.target.value)
  }, EVAL_PERIOD_GROUPS.map(group => /*#__PURE__*/React.createElement("optgroup", {
    key: group.label,
    label: group.label
  }, group.options.map(option => /*#__PURE__*/React.createElement("option", {
    key: option.label,
    value: option.label
  }, option.label)))))), evalPeriod === "Custom range" && /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-summary-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-summary-label"
  }, "Date range"), /*#__PURE__*/React.createElement("div", {
    className: "hac-date-range-field"
  }, /*#__PURE__*/React.createElement("input", {
    className: "hac-date-range-input",
    type: "date",
    value: customStartDate,
    onChange: e => {
      const next = e.target.value;
      setCustomStartDate(next);
      if (useDefaultRange && (next !== defaultCustomStart || customEndDate !== defaultCustomEnd)) {
        setUseDefaultRange(false);
      }
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "hac-date-range-sep"
  }, "-"), /*#__PURE__*/React.createElement("input", {
    className: "hac-date-range-input",
    type: "date",
    value: customEndDate,
    onChange: e => {
      const next = e.target.value;
      setCustomEndDate(next);
      if (useDefaultRange && (customStartDate !== defaultCustomStart || next !== defaultCustomEnd)) {
        setUseDefaultRange(false);
      }
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-shortcut"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-check-row hac-kpi-default-check"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: useDefaultRange,
    onChange: e => {
      if (e.target.checked) {
        setUseDefaultRange(true);
        setCustomStartDate(defaultCustomStart);
        setCustomEndDate(defaultCustomEnd);
      } else {
        setUseDefaultRange(false);
      }
    }
  }), /*#__PURE__*/React.createElement("span", null, "Use Dec 1 - Dec 31 default")))), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-summary-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-summary-label"
  }, "KPI Target Volume", /*#__PURE__*/React.createElement(InfoTip, {
    text: "Total fuel volume the agent must reach within the evaluation period."
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-input-unit"
  }, /*#__PURE__*/React.createElement("input", {
    className: "hac-input hac-kpi-field",
    type: "number",
    value: kpiTarget,
    onChange: e => setKpiTarget(+e.target.value)
  }), /*#__PURE__*/React.createElement("span", {
    className: "hac-kpi-unit"
  }, "L")))) : /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat-titlewrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-hero-icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "track_changes",
    size: 18,
    color: "var(--green-600)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat-title"
  }, "KPI Progress"), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat-period"
  }, "Evaluation period: ", evaluationWindowLabel), /*#__PURE__*/React.createElement("button", {
    className: "ml-info-btn",
    type: "button",
    "aria-label": "How evaluation periods work",
    onClick: () => setShowEvalHelp(true)
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "info",
    size: 14
  }))), activeZone && /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat-chip"
  }, activeZone.tier, " \xB7 ", activeZone.mult, "%")), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat-metrics"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat-metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-kpi-flat-label"
  }, "KPI volume"), /*#__PURE__*/React.createElement("b", {
    className: "hac-kpi-flat-value"
  }, HC.fmtL(kpi?.actual ?? 0))), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat-metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-kpi-flat-label"
  }, "Target volume"), /*#__PURE__*/React.createElement("b", {
    className: "hac-kpi-flat-value"
  }, HC.fmtL(kpiTarget))), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat-metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-kpi-flat-label"
  }, "KPI progress"), /*#__PURE__*/React.createElement("b", {
    className: "hac-kpi-flat-value",
    style: {
      color: progressMeta.solid,
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", null, progressPct.toFixed(1), "%"), progressMeta.isAchieved && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      lineHeight: 1
    }
  }, "\u2713"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpi-flat-metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-kpi-flat-label"
  }, "Applied multiplier"), /*#__PURE__*/React.createElement("b", {
    className: "hac-kpi-flat-value"
  }, activeZone ? `${activeZone.mult}%` : "—"))), /*#__PURE__*/React.createElement(KPIProgressBlock, {
    kpi: kpi,
    target: kpiTarget,
    thresholds: kpiThresholds,
    showSummary: false
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-cc-sec-head",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: "var(--fg-secondary)"
    }
  }, "Multiplier Thresholds"), editing && /*#__PURE__*/React.createElement("button", {
    className: "hac-add-tier-btn",
    onClick: () => {
      setEditingThreshold(null);
      setShowThresholdModal(true);
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "add",
    size: 15
  }), " Add Threshold")), editing && issues.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "hac-tier-empty",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(HIcon, {
    name: "warning",
    size: 15,
    color: "var(--red-400)"
  }), " Threshold setup incomplete"), issues.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      fontSize: 13,
      color: "var(--red-400)",
      marginTop: 4
    }
  }, m))), /*#__PURE__*/React.createElement("div", {
    className: "hac-tiers-grid hac-thr-grid"
  }, [...kpiThresholds].sort((a, b) => a.minPct - b.minPct).map(t => {
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      className: "hac-tier-item"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hac-tier-item-head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hac-tier-item-label"
    }, /*#__PURE__*/React.createElement(HIcon, {
      name: "stacked_bar_chart",
      size: 16,
      color: "var(--navy-800)"
    }), t.tier, t.isFinal && /*#__PURE__*/React.createElement("span", {
      className: "hac-final-badge"
    }, "Final Tier")), editing && /*#__PURE__*/React.createElement(CardMenu, {
      deleteDisabled: kpiThresholds.length <= 1,
      onEdit: () => {
        setEditingThreshold(t);
        setShowThresholdModal(true);
      },
      onDelete: () => deleteThreshold(t.id)
    })), /*#__PURE__*/React.createElement("div", {
      className: "hac-tier-item-body"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ml-k"
    }, "Progress range"), /*#__PURE__*/React.createElement("b", null, getThresholdRange(t))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ml-k"
    }, "Multiplier"), /*#__PURE__*/React.createElement("b", null, t.mult, "%"))));
  })))), showThresholdModal && /*#__PURE__*/React.createElement(ThresholdModal, {
    editThreshold: editingThreshold,
    siblings: kpiThresholds,
    onClose: () => {
      setShowThresholdModal(false);
      setEditingThreshold(null);
    },
    onSave: handleSaveThreshold
  }), showHistory && /*#__PURE__*/React.createElement(Modal, {
    title: "Version history",
    onClose: () => setShowHistory(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-vh-list"
  }, kpi.history && kpi.history.length > 0 ? kpi.history.map(h => /*#__PURE__*/React.createElement("div", {
    key: h.version,
    className: "hac-vh-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-vh-ver"
  }, "v", h.version), /*#__PURE__*/React.createElement("div", {
    className: "hac-vh-detail"
  }, /*#__PURE__*/React.createElement("b", null, HC.fmtL(h.target)), /*#__PURE__*/React.createElement("span", null, "Effective ", h.effective)), /*#__PURE__*/React.createElement("span", {
    className: "hac-vh-status " + h.status
  }, h.status === "active" ? "Active" : "Superseded"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--fg-tertiary)",
      padding: "8px 0"
    }
  }, "No previous versions."))), showEvalHelp && /*#__PURE__*/React.createElement(Modal, {
    title: "How evaluation periods work",
    onClose: () => setShowEvalHelp(false),
    footer: /*#__PURE__*/React.createElement("button", {
      className: "hac-modal-save",
      onClick: () => setShowEvalHelp(false)
    }, "Got it")
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-help-subtitle"
  }, "Choose the period used to calculate KPI achievement. That result sets the multiplier for the following year."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, [{
    label: "Custom period",
    description: "Set a specific start and end date."
  }, {
    label: "Recent periods",
    description: "Use the most recent completed month(s), such as last month or last 3 months."
  }, {
    label: "Calendar periods",
    description: "Use the previous completed quarter, half year, or year."
  }].map(group => /*#__PURE__*/React.createElement("div", {
    key: group.label
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "var(--fg-primary)",
      marginBottom: 8
    }
  }, group.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-secondary)",
      lineHeight: 1.5,
      paddingBottom: 8,
      borderBottom: "1px solid var(--border-light)"
    }
  }, group.description))))));
}

/* ─── KPI config card ────────────────────────────────────────── */
function CommissionConfigCard({
  kpi,
  editing
}) {
  const [showHistory, setShowHistory] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-card hac-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sec-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sec-header-row"
  }, /*#__PURE__*/React.createElement("span", null, "KPI Configuration"), kpi?.current && /*#__PURE__*/React.createElement("button", {
    className: "hac-version-tag clickable",
    type: "button",
    onClick: () => setShowHistory(true)
  }, "v", kpi.current.version, " \xB7 Effective ", kpi.current.effective))), /*#__PURE__*/React.createElement(CommissionSection, {
    kpi: kpi,
    editing: editing,
    showHistory: showHistory,
    setShowHistory: setShowHistory
  }));
}

/* ─── SP Accounts card ───────────────────────────────────────── */
function SPAccountsCard({
  spAccounts: initSP
}) {
  const [spAccounts, setSPAccounts] = useState(initSP);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const existing = spAccounts.map(s => s.sp);
  const hasAccounts = spAccounts.length > 0;
  const paginated = spAccounts.slice((page - 1) * perPage, page * perPage);
  const handleAdd = selectedSPs => {
    const added = SP_ORG_LIST.filter(o => selectedSPs.includes(o.sp)).map(o => ({
      sp: o.sp,
      org: o.org,
      volume: 0,
      eff: "—",
      end: "Dec 2028",
      exception: null,
      commissionStatus: "pending_onboarding"
    }));
    setSPAccounts(prev => [...prev, ...added]);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-card hac-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sec-header"
  }, "SP Accounts"), /*#__PURE__*/React.createElement("div", {
    className: "hac-dcard-head",
    style: {
      marginBottom: hasAccounts ? 12 : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-dcard-sub"
  }, spAccounts.length, " assigned account", spAccounts.length !== 1 ? "s" : ""), /*#__PURE__*/React.createElement("button", {
    className: "ml-btn-outline",
    style: {
      fontSize: 13
    },
    onClick: () => setShowModal(true)
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "add",
    size: 15
  }), " Add Account")), hasAccounts ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table",
    style: {
      minWidth: 820
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Owner"), /*#__PURE__*/React.createElement("th", null, "Volume (L)"), /*#__PURE__*/React.createElement("th", null, "KPI Attribution"), /*#__PURE__*/React.createElement("th", null, "Commission Status"), /*#__PURE__*/React.createElement("th", null, "Commission Validity"), /*#__PURE__*/React.createElement("th", null, "Exception"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, paginated.map((sp, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "ml-cell-main"
  }, sp.org, /*#__PURE__*/React.createElement("div", {
    className: "hac-owner-code"
  }, /*#__PURE__*/React.createElement(PetronLogo, {
    size: 14
  }), /*#__PURE__*/React.createElement("code", {
    className: "hac-code"
  }, sp.sp))), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, sp.volume ? sp.volume.toLocaleString() : "—"), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, sp.commissionStatus !== "pending_onboarding" && sp.kpiVolume != null ? /*#__PURE__*/React.createElement(React.Fragment, null, sp.kpiVolume.toLocaleString(), /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-sub"
  }, sp.kpiSplitPct, "% attributed")) : "—"), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(CommissionStatusBadge, {
    status: sp.commissionStatus || "activated"
  })), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono",
    style: {
      fontSize: 12
    }
  }, sp.commissionStatus === "pending_onboarding" ? "—" : `${sp.eff} – ${sp.end}`), /*#__PURE__*/React.createElement("td", null, sp.exception ? /*#__PURE__*/React.createElement("span", {
    className: "hac-exc-tag " + sp.exception.mode
  }, sp.exception.mode === "auto" ? "Auto" : "Custom", " \xB7 ", sp.exception.rate, "%") : /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-disabled)",
      fontSize: 12
    }
  }, "\u2014")), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("button", {
    className: "ml-icon-btn"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "more_horiz",
    size: 17
  })))))))), /*#__PURE__*/React.createElement(HPager, {
    page: page,
    perPage: perPage,
    total: spAccounts.length,
    onPage: setPage,
    onPerPage: v => {
      setPerPage(v);
      setPage(1);
    },
    perPageOptions: [5, 10, 20]
  })) : /*#__PURE__*/React.createElement("div", {
    className: "hac-empty-state"
  }, "No SP accounts assigned yet."), showModal && /*#__PURE__*/React.createElement(AddSPModal, {
    onClose: () => setShowModal(false),
    onAdd: handleAdd,
    existing: existing
  }));
}

/* ─── Termination card ───────────────────────────────────────── */
const longDateLabel = value => {
  if (!value) return "—";
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};
function TerminationCard({
  cfg,
  editing = false
}) {
  const agentLookup = useMemo(() => Object.fromEntries((cfg.otherAgents || []).map(agent => [agent.id, agent])), [cfg.otherAgents]);
  const scheduledSeed = cfg.termination?.scheduledTransfer || null;
  const [date, setDate] = useState(cfg.termination.date || "");
  const [commissionEndDate, setCommissionEndDate] = useState(cfg.termination.commissionEndDate || "");
  const [transferQuery, setTransferQuery] = useState(scheduledSeed?.toAgentId || "");
  const [effectiveMonth, setEffectiveMonth] = useState(scheduledSeed?.effectiveCommissionMonth || "");
  const [scheduledTransfer, setScheduledTransfer] = useState(scheduledSeed);
  const exceptionCount = (cfg.spAccounts || []).filter(sp => sp.exception).length;
  const cancelTermination = () => {
    setDate("");
    setCommissionEndDate("");
    setScheduledTransfer(null);
    setTransferQuery("");
    setEffectiveMonth("");
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-card hac-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sec-header",
    style: {
      color: "var(--red-400)"
    }
  }, "Termination"), cfg.status === "terminating" && /*#__PURE__*/React.createElement("div", {
    className: "hac-warn-banner",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "warning",
    size: 15,
    color: "#B26A00"
  }), /*#__PURE__*/React.createElement("span", null, "This agent is in a ", /*#__PURE__*/React.createElement("b", null, "terminating"), " state. Finalise below.")), /*#__PURE__*/React.createElement("div", {
    className: "hac-term-stack"
  }, editing ? /*#__PURE__*/React.createElement("div", {
    className: "hac-term-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Termination date ", /*#__PURE__*/React.createElement(InfoTip, {
    text: "The agent becomes terminated on this date."
  })), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Commission end date ", /*#__PURE__*/React.createElement(InfoTip, {
    text: "The agent receives commission only until this date."
  })), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    type: "date",
    value: commissionEndDate,
    onChange: e => setCommissionEndDate(e.target.value)
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "hac-term-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Termination date ", /*#__PURE__*/React.createElement(InfoTip, {
    text: "The agent becomes terminated on this date."
  })), /*#__PURE__*/React.createElement("span", {
    className: "hac-view-val"
  }, longDateLabel(date))), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Commission end date ", /*#__PURE__*/React.createElement(InfoTip, {
    text: "The agent receives commission only until this date."
  })), /*#__PURE__*/React.createElement("span", {
    className: "hac-view-val"
  }, longDateLabel(commissionEndDate)))), editing ? /*#__PURE__*/React.createElement("div", {
    className: "hac-term-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-form-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-label-row"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Transferred to"), /*#__PURE__*/React.createElement("span", {
    className: "hac-inline-badge"
  }, "Total: ", cfg.spAccounts?.length || 0, " accounts", exceptionCount ? ` \u00b7 ${exceptionCount} with exceptions` : "")), /*#__PURE__*/React.createElement("select", {
    className: "hac-input hac-select-input",
    value: transferQuery,
    onChange: e => setTransferQuery(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select agent"), (cfg.otherAgents || []).map(agent => /*#__PURE__*/React.createElement("option", {
    key: agent.id,
    value: agent.id
  }, agent.name, " (", agent.id, ")")))), /*#__PURE__*/React.createElement("div", {
    className: "hac-form-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-label-row"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Effective commission month ", /*#__PURE__*/React.createElement(InfoTip, {
    text: "The new agent starts receiving commission from this month."
  }))), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    type: "month",
    value: effectiveMonth,
    onChange: e => setEffectiveMonth(e.target.value)
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "hac-term-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Transferred to"), /*#__PURE__*/React.createElement("span", {
    className: "hac-view-val"
  }, scheduledTransfer ? agentLookup[scheduledTransfer.toAgentId]?.name || scheduledTransfer.toAgentId : "—")), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Effective commission month ", /*#__PURE__*/React.createElement(InfoTip, {
    text: "The new agent starts receiving commission from this month."
  })), /*#__PURE__*/React.createElement("span", {
    className: "hac-view-val"
  }, scheduledTransfer ? monthLabel(scheduledTransfer.effectiveCommissionMonth) : "—"))), editing && /*#__PURE__*/React.createElement("div", {
    className: "hac-term-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-secondary-btn",
    type: "button",
    onClick: cancelTermination
  }, "Cancel termination"))));
}

/* ─── Personal details section ───────────────────────────────── */
function PersonalDetailsSection({
  cfg,
  editing
}) {
  const {
    BANKS
  } = window.HC;
  const [form, setForm] = useState({
    ...cfg
  });
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const fields = [{
    key: "name",
    label: "Name",
    req: true
  }, {
    key: "email",
    label: "Email",
    req: true
  }, {
    key: "mobile",
    label: "Mobile No.",
    req: true
  }, {
    key: "ic",
    label: "IC No.",
    req: true
  }, {
    key: "bankName",
    label: "Bank Name",
    req: false
  }, {
    key: "accName",
    label: "Bank Account Name",
    req: false
  }, {
    key: "accNo",
    label: "Bank Account No.",
    req: false
  }, {
    key: "role",
    label: "Role",
    req: false
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-card hac-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sec-header"
  }, "Personal Details"), /*#__PURE__*/React.createElement("div", {
    className: "hac-form-grid3" + (!editing ? " hac-view-grid" : "")
  }, fields.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.key,
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label" + (editing && f.req ? " req" : "")
  }, f.label, editing && f.req ? "*" : ""), editing ? f.key === "bankName" ? /*#__PURE__*/React.createElement("select", {
    className: "hac-input hac-select-input",
    value: form.bankName,
    onChange: e => set("bankName", e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select bank"), BANKS.map(b => /*#__PURE__*/React.createElement("option", {
    key: b
  }, b))) : f.key === "role" ? /*#__PURE__*/React.createElement("select", {
    className: "hac-input hac-select-input",
    value: form.referrer ? "referrer" : "agent",
    onChange: e => set("referrer", e.target.value === "referrer")
  }, /*#__PURE__*/React.createElement("option", {
    value: "agent"
  }, "Agent"), /*#__PURE__*/React.createElement("option", {
    value: "referrer"
  }, "Referrer")) : /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    value: form[f.key] || "",
    onChange: e => set(f.key, e.target.value)
  }) : /*#__PURE__*/React.createElement("span", {
    className: "hac-view-val"
  }, f.key === "role" ? cfg.referrer ? "Referrer" : "Agent" : cfg[f.key] || /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-disabled)"
    }
  }, "\u2014")))), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Account Status"), /*#__PURE__*/React.createElement("span", {
    className: "hac-view-val"
  }, /*#__PURE__*/React.createElement(AccountStatusBadge, {
    status: cfg.accountStatus || "active"
  })))));
}

/* ─── Agent form (create / edit) ─────────────────────────────── */
function AgentFormView({
  agent,
  onBack,
  onSave
}) {
  const {
    BANKS
  } = window.HC;
  const isEdit = !!agent;
  const editCfg = isEdit ? buildAgentConfig(agent) : null;
  const [form, setForm] = useState({
    name: agent?.name || "",
    email: agent?.email || "",
    mobile: agent?.mobile || "",
    ic: agent?.ic || "",
    bankName: (agent?.bankName !== "-" ? agent?.bankName : "") || "",
    accName: (agent?.accName !== "-" ? agent?.accName : "") || "",
    accNo: (agent?.accNo !== "-" ? agent?.accNo : "") || "",
    referrer: agent?.referrer || false
  });
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-breadcrumb"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-bc-link",
    onClick: onBack
  }, "Salesperson List"), /*#__PURE__*/React.createElement(HIcon, {
    name: "chevron_right",
    size: 15,
    color: "var(--fg-tertiary)"
  }), /*#__PURE__*/React.createElement("span", null, isEdit ? "Edit" : "Create")), /*#__PURE__*/React.createElement("h1", {
    className: "ml-h1",
    style: {
      margin: "10px 0 18px"
    }
  }, isEdit ? "Edit Account" : "Create Account"), /*#__PURE__*/React.createElement("div", {
    className: "hac-detail-sections"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-card hac-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sec-header"
  }, "Personal Details"), /*#__PURE__*/React.createElement("div", {
    className: "hac-form-grid3"
  }, [["name", "Name", true], ["email", "Email", true], ["mobile", "Mobile", true], ["ic", "IC No.", true]].map(([k, l, r]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label req"
  }, l, "*"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    value: form[k],
    onChange: e => set(k, e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label req"
  }, "Role*"), /*#__PURE__*/React.createElement("select", {
    className: "hac-input hac-select-input",
    value: form.referrer ? "referrer" : "agent",
    onChange: e => set("referrer", e.target.value === "referrer")
  }, /*#__PURE__*/React.createElement("option", {
    value: "agent"
  }, "Agent"), /*#__PURE__*/React.createElement("option", {
    value: "referrer"
  }, "Referrer"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Bank name"), /*#__PURE__*/React.createElement("select", {
    className: "hac-input hac-select-input",
    value: form.bankName,
    onChange: e => set("bankName", e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select bank"), BANKS.map(b => /*#__PURE__*/React.createElement("option", {
    key: b
  }, b)))), [["accName", "Bank account name"], ["accNo", "Bank account number"]].map(([k, l]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, l), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    value: form[k],
    onChange: e => set(k, e.target.value)
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "ml-card hac-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sec-header"
  }, "KPI Configuration"), /*#__PURE__*/React.createElement(CommissionSection, {
    kpi: {
      evalPeriodOpt: "Last year",
      current: {
        version: 1,
        effective: "",
        target: 0,
        thresholds: [{
          tier: "Tier 3",
          minPct: 100,
          mult: 100,
          isFinal: true
        }, {
          tier: "Tier 2",
          minPct: 75,
          mult: 50
        }, {
          tier: "Tier 1",
          minPct: 0,
          mult: 0
        }]
      }
    },
    editing: true
  })), /*#__PURE__*/React.createElement(SPAccountsCard, {
    spAccounts: []
  }), isEdit && /*#__PURE__*/React.createElement(TerminationCard, {
    cfg: editCfg,
    editing: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-edit-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-cancel-btn",
    onClick: onBack
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "hac-save-btn",
    onClick: () => onSave(form)
  }, isEdit ? "Save Changes" : "Create")));
}

/* ─── Agent detail view ──────────────────────────────────────── */
function AgentDetailView({
  agent,
  onBack
}) {
  const cfg = buildAgentConfig(agent);
  const [editing, setEditing] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: editing ? 80 : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-breadcrumb"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-bc-link",
    onClick: onBack
  }, "Salesperson List"), /*#__PURE__*/React.createElement(HIcon, {
    name: "chevron_right",
    size: 15,
    color: "var(--fg-tertiary)"
  }), /*#__PURE__*/React.createElement("span", null, cfg.name)), /*#__PURE__*/React.createElement("div", {
    className: "ml-page-head",
    style: {
      margin: "10px 0 20px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "ml-h1"
  }, cfg.name), /*#__PURE__*/React.createElement(AccountStatusBadge, {
    status: cfg.accountStatus || "active"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-secondary)",
      marginTop: 3
    }
  }, cfg.id, " \xB7 Joined ", cfg.joined)), /*#__PURE__*/React.createElement("div", {
    className: "ml-page-head-right"
  }, !editing && /*#__PURE__*/React.createElement("button", {
    className: "ml-btn-outline",
    onClick: () => setEditing(true)
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "edit",
    size: 15
  }), " Edit"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-detail-sections"
  }, /*#__PURE__*/React.createElement(PersonalDetailsSection, {
    cfg: cfg,
    editing: editing
  }), /*#__PURE__*/React.createElement(CommissionConfigCard, {
    kpi: cfg.kpi,
    editing: editing
  }), /*#__PURE__*/React.createElement(SPAccountsCard, {
    spAccounts: cfg.spAccounts
  }), /*#__PURE__*/React.createElement(TerminationCard, {
    cfg: cfg,
    editing: editing
  })), editing && /*#__PURE__*/React.createElement("div", {
    className: "hac-edit-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-cancel-btn",
    onClick: () => setEditing(false)
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "hac-save-btn",
    onClick: () => setEditing(false)
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "check",
    size: 15
  }), " Save Changes")));
}

/* ─── Root: Agent module with tabs ───────────────────────────── */
function HostAgentConfig() {
  const [activeTab, setActiveTab] = useState("list");
  const [agentView, setAgentView] = useState("list"); // list | detail | create
  const [activeAgent, setActiveAgent] = useState(null);
  const inSubPage = agentView !== "list";
  const goView = a => {
    setActiveAgent(a);
    setAgentView("detail");
  };
  const goEdit = a => {
    setActiveAgent(a);
    setAgentView("edit");
  };
  const goCreate = () => {
    setActiveAgent(null);
    setAgentView("create");
  };
  const goBack = () => setAgentView("list");
  const goSave = () => setAgentView("list");
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-app"
  }, /*#__PURE__*/React.createElement(HostTopBar, null), /*#__PURE__*/React.createElement(HostSidebar, {
    active: "agent"
  }), /*#__PURE__*/React.createElement("main", {
    className: "ml-main"
  }, !inSubPage && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "ml-h1",
    style: {
      marginBottom: 14
    }
  }, "Salesperson"), /*#__PURE__*/React.createElement("div", {
    className: "ml-tabs"
  }, [{
    key: "list",
    label: "Salesperson List",
    icon: "group"
  }, {
    key: "myfuel",
    label: "MyFuel Commission",
    icon: "local_gas_station"
  }].map(t => /*#__PURE__*/React.createElement("button", {
    key: t.key,
    className: "ml-tab" + (activeTab === t.key ? " active" : ""),
    onClick: () => setActiveTab(t.key)
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: t.icon,
    size: 16
  }), t.label)))), activeTab === "list" && /*#__PURE__*/React.createElement(React.Fragment, null, agentView === "list" && /*#__PURE__*/React.createElement(AgentsListView, {
    onView: goView,
    onEdit: goEdit,
    onCreate: goCreate,
    onTerminate: goView
  }), agentView === "create" && /*#__PURE__*/React.createElement(AgentFormView, {
    agent: null,
    onBack: goBack,
    onSave: goSave
  }), agentView === "edit" && /*#__PURE__*/React.createElement(AgentFormView, {
    agent: activeAgent,
    onBack: goBack,
    onSave: goSave
  }), agentView === "detail" && /*#__PURE__*/React.createElement(AgentDetailView, {
    agent: activeAgent,
    onBack: goBack
  })), activeTab === "myfuel" && /*#__PURE__*/React.createElement(MyFuelCommissionTabView, null)));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(HostAgentConfig, null));
})();
