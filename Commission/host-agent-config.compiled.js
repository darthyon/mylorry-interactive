// host-agent-config.jsx — Host portal: Agent Module (tabs + commission config)

const {
  useState,
  useMemo,
  useRef,
  useEffect
} = React;
const MyFuelCommissionTabView = window.MyFuelCommissionTab;
const SubscriptionCommissionTabView = window.SubscriptionCommissionTab;

/* ─── Commission Status Badge ────────────────────────────────── */
const CS_META = {
  activated: {
    label: "Activated",
    cls: "comm-activated"
  },
  pending_onboarding: {
    label: "Pending Onboarding",
    cls: "comm-pending-ob"
  },
  on_hold: {
    label: "On Hold",
    cls: "comm-on-hold"
  },
  deactivated: {
    label: "Deactivated",
    cls: "comm-deactivated"
  }
};
function CommissionStatusBadge({
  status
}) {
  const m = CS_META[status] || CS_META.activated;
  return /*#__PURE__*/React.createElement("span", {
    className: "ml-badge " + m.cls
  }, m.label);
}

/* ─── KPI progress bar — shared (window.HKPIProgress) ───────── */
const KPIProgress = window.HKPIProgress;
const AccountStatusBadge = window.HAccountStatusBadge;

/* ─── KPI Progress block (zoned axis) — inline inside Commission Config ─ */
const KPI_AXIS_MAX = 125;
const KPI_ZONES = [{
  from: 0,
  to: 75,
  mult: 0,
  label: "No commission",
  col: "var(--red-400)",
  fill: "#FCEBEC"
}, {
  from: 75,
  to: 100,
  mult: 50,
  label: "Half commission",
  col: "#B26A00",
  fill: "#FBF1DD"
}, {
  from: 100,
  to: KPI_AXIS_MAX,
  mult: 100,
  label: "Full commission",
  col: "var(--green-600)",
  fill: "#E4F6EC"
}];
const kpiZoneOf = pct => KPI_ZONES.find(z => pct >= z.from && pct < z.to) || KPI_ZONES[KPI_ZONES.length - 1];
function KPIProgressBlock({
  kpi,
  target
}) {
  const actual = kpi?.actual ?? 0;
  const period = kpi?.progressPeriod || "Dec 1–31";
  const phase = kpi?.phase || (kpi?.locked ? "complete" : "active");
  const isFuture = phase === "future";
  const isComplete = phase === "complete";
  const pct = target ? Math.round(actual / target * 1000) / 10 : 0;
  const zone = kpiZoneOf(pct);
  const markerCol = isFuture ? "var(--fg-tertiary)" : zone.col;
  const pos = p => Math.min(p, KPI_AXIS_MAX) / KPI_AXIS_MAX * 100;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: "18px",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis-pct",
    style: {
      color: markerCol,
      lineHeight: .9
    }
  }, isFuture ? "–" : pct + "%"), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis-readout",
    style: {
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", null, "Achieved ", /*#__PURE__*/React.createElement("b", null, isFuture ? "–" : actual.toLocaleString("en-US") + " L")), !isFuture && /*#__PURE__*/React.createElement("span", {
    style: {
      color: zone.col
    }
  }, zone.label, " \xB7 ", zone.mult, "% multiplier"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis" + (isFuture ? " future" : ""),
    style: {
      marginTop: 0,
      alignSelf: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis-track"
  }, KPI_ZONES.map((z, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hac-kpiaxis-zone",
    style: {
      width: (Math.min(z.to, KPI_AXIS_MAX) - z.from) / KPI_AXIS_MAX * 100 + "%",
      background: z.fill
    }
  })), !isFuture && /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis-marker",
    style: {
      left: pos(pct) + "%",
      background: markerCol
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-kpiaxis-dot",
    style: {
      background: markerCol
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis-ticks"
  }, [75, 100].map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    className: "hac-kpiaxis-tick",
    style: {
      left: pos(t) + "%"
    }
  }, t, "%"))))), isFuture && /*#__PURE__*/React.createElement("div", {
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
    if (filter === "sales") list = list.filter(a => !a.referrer);
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
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-scope-pill"
  }, "Agent ", /*#__PURE__*/React.createElement(HIcon, {
    name: "arrow_drop_down",
    size: 18,
    color: "var(--green-600)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-search-bar"
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
  }), " Create Agent Account")), filterOpen && /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-field"
  }, /*#__PURE__*/React.createElement("label", null, "Agent Type"), /*#__PURE__*/React.createElement("select", {
    value: pendingType,
    onChange: e => setPendingType(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All types"), /*#__PURE__*/React.createElement("option", {
    value: "referrer"
  }, "Referrer"), /*#__PURE__*/React.createElement("option", {
    value: "sales"
  }, "Sales"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-field"
  }, /*#__PURE__*/React.createElement("label", null, "Account Status"), /*#__PURE__*/React.createElement("select", {
    value: pendingStatus,
    onChange: e => setPendingStatus(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All statuses"), /*#__PURE__*/React.createElement("option", {
    value: "active"
  }, "Active"), /*#__PURE__*/React.createElement("option", {
    value: "inactive"
  }, "Inactive"), /*#__PURE__*/React.createElement("option", {
    value: "suspended"
  }, "Suspended"), /*#__PURE__*/React.createElement("option", {
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
  }, filtered.length, " Agent account", filtered.length !== 1 ? "s" : ""), /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table hac-agent-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "No."), /*#__PURE__*/React.createElement("th", null, "ID"), /*#__PURE__*/React.createElement("th", null, "Referrer"), /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "KPI Progress"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Mobile Number"), /*#__PURE__*/React.createElement("th", null, "Email"), /*#__PURE__*/React.createElement("th", null, "IC Number"), /*#__PURE__*/React.createElement("th", null, "Bank Name"), /*#__PURE__*/React.createElement("th", null, "Account Number"), /*#__PURE__*/React.createElement("th", null, "Account Name"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, pageData.map((a, i) => /*#__PURE__*/React.createElement("tr", {
    key: a.id,
    onClick: () => onView(a)
  }, /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, (page - 1) * perPage + i + 1), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "hac-code"
  }, a.id)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(HBadge, {
    kind: a.referrer ? "active" : "inactive"
  }, a.referrer ? "Yes" : "No")), /*#__PURE__*/React.createElement("td", {
    className: "ml-cell-main"
  }, a.name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(KPIProgress, {
    pct: a.kpiPct,
    actual: a.volume,
    target: a.kpiTarget,
    period: "Dec 1\u201331"
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

/* ─── Tier Modal (add / edit) ────────────────────────────────── */
function TierModal({
  editTier,
  onClose,
  onSave
}) {
  const isEdit = !!editTier;
  const [usage, setUsage] = useState(editTier ? editTier.final ? "" : String(editTier.to ?? "") : "");
  const [amount, setAmount] = useState(editTier ? String(editTier.rate ?? "") : "");
  const [isFinal, setIsFinal] = useState(editTier ? editTier.final : false);
  const canSave = amount !== "" && (isFinal || usage !== "");
  const handleSave = () => {
    if (!canSave) return;
    onSave({
      usage: isFinal ? null : +usage,
      rate: +amount,
      final: isFinal
    }, isEdit ? editTier.id : null);
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    title: isEdit ? "Edit Tier" : "Add Tier",
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
    className: "hac-modal-row-split"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-fg",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label req"
  }, "Volume up to (litres)*"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    placeholder: "e.g. 25000",
    value: usage,
    disabled: isFinal,
    onChange: e => setUsage(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "hac-field-hint"
  }, "Upper bound of this volume band")), /*#__PURE__*/React.createElement("label", {
    className: "hac-check-row",
    style: {
      marginTop: 24,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isFinal,
    onChange: e => setIsFinal(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Final tier (no upper cap)"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label req"
  }, "Base Rate (RM / litre)*"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    placeholder: "e.g. 0.015",
    value: amount,
    onChange: e => setAmount(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "hac-field-hint"
  }, "Applied to every confirmed litre in this band")));
}

/* ─── Threshold Modal (add / edit) ───────────────────────────── */
function ThresholdModal({
  editThreshold,
  onClose,
  onSave
}) {
  const isEdit = !!editThreshold;
  const [tierName, setTierName] = useState(editThreshold ? editThreshold.tier : "");
  const [minPct, setMinPct] = useState(editThreshold ? String(editThreshold.minPct ?? "") : "");
  const [mult, setMult] = useState(editThreshold ? String(editThreshold.mult ?? "") : "");
  const [meaning, setMeaning] = useState(editThreshold ? editThreshold.label : "");
  const [isFinal, setIsFinal] = useState(editThreshold ? editThreshold.isFinal : false);
  const canSave = tierName !== "" && mult !== "" && meaning !== "" && (isFinal || minPct !== "");
  const handleSave = () => {
    if (!canSave) return;
    onSave({
      tier: tierName,
      minPct: isFinal ? 0 : +minPct,
      mult: +mult,
      label: meaning,
      isFinal
    }, isEdit ? editThreshold.id : null);
    onClose();
  };
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
    className: "hac-label req"
  }, "Tier name*"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    placeholder: "e.g. Tier 1",
    value: tierName,
    onChange: e => setTierName(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-modal-row-split",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-fg",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label req"
  }, "Minimum progress %*"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    placeholder: "e.g. 75",
    value: minPct,
    disabled: isFinal,
    onChange: e => setMinPct(e.target.value)
  })), /*#__PURE__*/React.createElement("label", {
    className: "hac-check-row",
    style: {
      marginTop: 24,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: isFinal,
    onChange: e => setIsFinal(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Final threshold (no minimum)"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label req"
  }, "Multiplier %*"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    placeholder: "e.g. 50",
    value: mult,
    onChange: e => setMult(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "hac-field-hint"
  }, "Applied to the commission earned from volume tiers")), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label req"
  }, "Meaning / label*"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    placeholder: "e.g. Half commission",
    value: meaning,
    onChange: e => setMeaning(e.target.value)
  })));
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
    }, "Add ", selected.size > 0 ? `(${selected.size})` : ""))
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

/* ─── Commission config section ──────────────────────────────── */
function CommissionSection({
  kpi,
  tiers: initTiers,
  editing
}) {
  const [tiers, setTiers] = useState(initTiers || []);
  const [kpiTarget, setKpiTarget] = useState(kpi?.current?.target ?? 150000);
  const [showHistory, setShowHistory] = useState(false);
  const [kpiThresholds, setKpiThresholds] = useState(() => {
    const t = kpi?.current?.thresholds || [{
      id: 1,
      tier: "Tier 1",
      label: "Full commission",
      minPct: 100,
      mult: 100
    }, {
      id: 2,
      tier: "Tier 2",
      label: "Half commission",
      minPct: 75,
      mult: 50
    }, {
      id: 3,
      tier: "Tier 3",
      label: "No commission",
      minPct: 0,
      mult: 0
    }];
    return t.map((x, i) => ({
      ...x,
      id: x.id || i + 1
    }));
  });
  const [useCustomPeriod, setUseCustomPeriod] = useState(kpi?.useCustomPeriod || false);
  const [evalStart, setEvalStart] = useState(kpi?.customStart || "Dec");
  const [evalEnd, setEvalEnd] = useState(kpi?.customEnd || "Dec");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [showTierModal, setShowTierModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(null);
  const hasFinalTier = tiers.some(t => t.final);
  const handleSaveTier = (data, editId) => {
    setTiers(prev => {
      if (editId != null) {
        return prev.map(t => t.id === editId ? {
          ...t,
          to: data.final ? null : data.usage,
          rate: data.rate,
          final: data.final
        } : {
          ...t,
          final: data.final ? false : t.final
        });
      }
      const base = prev.map(t => ({
        ...t,
        final: data.final ? false : t.final
      }));
      const last = base[base.length - 1];
      return [...base, {
        id: base.length + 1,
        from: last ? (last.to || 0) + 1 : 0,
        to: data.final ? null : data.usage,
        rate: data.rate,
        final: data.final
      }];
    });
  };
  const deleteTier = id => {
    setTiers(prev => prev.filter(t => t.id !== id).map((t, i) => ({
      ...t,
      id: i + 1
    })));
  };
  const handleSaveThreshold = (data, editId) => {
    setKpiThresholds(prev => {
      if (editId != null) {
        return prev.map(t => t.id === editId ? {
          ...t,
          ...data
        } : t).sort((a, b) => b.minPct - a.minPct);
      }
      const nextId = Math.max(0, ...prev.map(t => t.id || 0)) + 1;
      return [...prev, {
        ...data,
        id: nextId
      }].sort((a, b) => b.minPct - a.minPct);
    });
  };
  const deleteThreshold = id => {
    setKpiThresholds(prev => prev.filter(t => t.id !== id));
  };
  const tierCls = ["t1", "t2", "t3"];
  const thrCol = ["var(--green-600)", "#B26A00", "var(--red-400)"];
  const getThresholdRange = (t, i, sorted) => {
    if (i === 0) return `≥ ${t.minPct}%`;
    if (i === sorted.length - 1) return `< ${sorted[i - 1].minPct}%`;
    const upper = sorted[i - 1].minPct - 0.01;
    return `${t.minPct}%–${upper.toFixed(2)}%`;
  };
  const getThresholdLabel = pct => {
    const sorted = [...kpiThresholds].sort((a, b) => b.minPct - a.minPct);
    const match = sorted.find(t => pct >= t.minPct);
    return match ? match.label : sorted[sorted.length - 1]?.label;
  };
  const kpiActual = kpi?.actual ?? 0;
  const kpiPct = kpiTarget ? Math.round(kpiActual / kpiTarget * 1000) / 10 : 0;
  const kpiPeriod = useCustomPeriod ? `${evalStart} 1–${evalEnd} 31` : kpi?.progressPeriod || "Dec 1–31";
  const kpiLabel = getThresholdLabel(kpiPct);
  return /*#__PURE__*/React.createElement(React.Fragment, null, kpi && /*#__PURE__*/React.createElement("div", {
    className: "hac-cc-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-cc-sec-head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-cc-sec-label"
  }, "KPI Configuration"), /*#__PURE__*/React.createElement(InfoTip, {
    text: "Sets the multiplier applied to volume tier commission, based on KPI progress."
  })), kpi.current && /*#__PURE__*/React.createElement("button", {
    className: "hac-version-tag clickable",
    onClick: () => setShowHistory(true)
  }, "v", kpi.current.version, " \xB7 Effective ", kpi.current.effective, /*#__PURE__*/React.createElement(HIcon, {
    name: "expand_more",
    size: 15
  }))), editing && /*#__PURE__*/React.createElement("div", {
    className: "hac-effective-band"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-effective-label"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "new_releases",
    size: 14,
    color: "var(--teal-600)"
  }), "New version \xB7 effective from"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    type: "month",
    style: {
      maxWidth: 200
    },
    value: effectiveFrom,
    onChange: e => setEffectiveFrom(e.target.value)
  })), !editing && kpiTarget > 0 && /*#__PURE__*/React.createElement(KPIProgressBlock, {
    kpi: kpi,
    target: kpiTarget
  }), /*#__PURE__*/React.createElement("div", {
    className: "hac-cc-row2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-cc-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-field-label"
  }, "Evaluation Period"), editing ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-period-pill"
  }, "Dec 1 \u2013 Dec 31"), /*#__PURE__*/React.createElement("label", {
    className: "hac-check-row",
    style: {
      marginLeft: 4
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: useCustomPeriod,
    onChange: e => setUseCustomPeriod(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "Custom period"))), useCustomPeriod && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("select", {
    className: "hac-select",
    style: {
      maxWidth: 120
    },
    value: evalStart,
    onChange: e => setEvalStart(e.target.value)
  }, HC.MONTHS.map(m => /*#__PURE__*/React.createElement("option", {
    key: m
  }, m))), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-tertiary)",
      fontSize: 13
    }
  }, "to"), /*#__PURE__*/React.createElement("select", {
    className: "hac-select",
    style: {
      maxWidth: 120
    },
    value: evalEnd,
    onChange: e => setEvalEnd(e.target.value)
  }, HC.MONTHS.map(m => /*#__PURE__*/React.createElement("option", {
    key: m
  }, m))))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-period-pill"
  }, useCustomPeriod ? `${evalStart} 1 – ${evalEnd} 31` : kpi.evalPeriod || "Dec 1 – Dec 31"), !useCustomPeriod && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--fg-tertiary)"
    }
  }, "Default annual period"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-cc-col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-field-label"
  }, "KPI Target Volume", /*#__PURE__*/React.createElement(InfoTip, {
    text: "Total fuel volume the agent must reach within the evaluation period."
  })), editing ? /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    type: "number",
    value: kpiTarget,
    style: {
      maxWidth: 200
    },
    onChange: e => setKpiTarget(+e.target.value)
  }) : /*#__PURE__*/React.createElement("span", {
    className: "hac-big-num"
  }, HC.fmtL(kpiTarget)))), /*#__PURE__*/React.createElement("div", {
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
  }), " Add Threshold")), /*#__PURE__*/React.createElement("div", {
    className: "hac-tiers-grid hac-thr-grid"
  }, kpiThresholds.map((t, i) => {
    const sorted = [...kpiThresholds].sort((a, b) => b.minPct - a.minPct);
    const idx = sorted.findIndex(x => x.id === t.id);
    const col = thrCol[idx] || "var(--fg-tertiary)";
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
    }), t.tier), editing && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "ml-icon-btn",
      title: "Edit threshold",
      onClick: () => {
        setEditingThreshold(t);
        setShowThresholdModal(true);
      }
    }, /*#__PURE__*/React.createElement(HIcon, {
      name: "edit",
      size: 15,
      color: "var(--fg-secondary)"
    })), /*#__PURE__*/React.createElement("button", {
      className: "ml-icon-btn",
      title: "Delete threshold",
      onClick: () => deleteThreshold(t.id),
      style: {
        color: kpiThresholds.length <= 1 ? "var(--fg-disabled)" : "var(--red-400)"
      },
      disabled: kpiThresholds.length <= 1
    }, /*#__PURE__*/React.createElement(HIcon, {
      name: "delete",
      size: 15
    })))), /*#__PURE__*/React.createElement("div", {
      className: "hac-tier-item-body"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ml-k"
    }, "Progress range"), /*#__PURE__*/React.createElement("b", null, getThresholdRange(t, idx, sorted))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ml-k"
    }, "Multiplier"), /*#__PURE__*/React.createElement("b", null, t.mult, "%"))));
  })))), kpi && /*#__PURE__*/React.createElement("div", {
    className: "hac-cc-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "hac-cc-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-cc-sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hac-cc-sec-label"
  }, "Commission Tiers (Volume-based)"), editing && /*#__PURE__*/React.createElement("button", {
    className: "hac-add-tier-btn",
    onClick: () => {
      setEditingTier(null);
      setShowTierModal(true);
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "add",
    size: 15
  }), " Add Tier")), tiers.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "hac-tier-empty"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(HIcon, {
    name: "warning",
    size: 15,
    color: "var(--red-400)"
  }), " No tiers configured"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--red-400)",
      marginTop: 4
    }
  }, "At least one tier is required.")), editing && tiers.length > 0 && !hasFinalTier && /*#__PURE__*/React.createElement("div", {
    className: "hac-tier-empty",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(HIcon, {
    name: "warning",
    size: 15,
    color: "var(--red-400)"
  }), " No final tier set"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--red-400)",
      marginTop: 4
    }
  }, "Please set a final tier before saving. (FR-HC-05)")), /*#__PURE__*/React.createElement("div", {
    className: "hac-tiers-grid"
  }, tiers.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: "hac-tier-item" + (t.final ? " editing" : "")
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-tier-item-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-tier-item-label"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "stacked_bar_chart",
    size: 16,
    color: "var(--navy-800)"
  }), "Tier ", t.id, t.final && /*#__PURE__*/React.createElement("span", {
    className: "hac-final-badge"
  }, "Final Tier")), editing ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-icon-btn",
    title: "Edit tier",
    onClick: () => {
      setEditingTier(t);
      setShowTierModal(true);
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "edit",
    size: 15,
    color: "var(--fg-secondary)"
  })), /*#__PURE__*/React.createElement("button", {
    className: "ml-icon-btn",
    title: "Delete tier",
    onClick: () => deleteTier(t.id),
    style: {
      color: tiers.length <= 1 ? "var(--fg-disabled)" : "var(--red-400)"
    },
    disabled: tiers.length <= 1
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "delete",
    size: 15
  }))) : /*#__PURE__*/React.createElement("button", {
    className: "ml-icon-btn"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "more_horiz",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hac-tier-item-body"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Volume range"), /*#__PURE__*/React.createElement("b", null, t.from?.toLocaleString(), " \u2013 ", t.final ? "∞" : t.to?.toLocaleString(), " L")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Base rate"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--navy-800)"
    }
  }, "RM ", t.rate?.toFixed(3), "/L"))))))), showTierModal && /*#__PURE__*/React.createElement(TierModal, {
    editTier: editingTier,
    onClose: () => {
      setShowTierModal(false);
      setEditingTier(null);
    },
    onSave: handleSaveTier
  }), showThresholdModal && /*#__PURE__*/React.createElement(ThresholdModal, {
    editThreshold: editingThreshold,
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
  }, "No previous versions."))));
}

/* ─── Commission config card ─────────────────────────────────── */
function CommissionConfigCard({
  kpi,
  tiers,
  editing
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-card hac-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sec-header"
  }, "Commission Configuration"), /*#__PURE__*/React.createElement(CommissionSection, {
    kpi: kpi,
    tiers: tiers,
    editing: editing
  }));
}

/* ─── SP Accounts card ───────────────────────────────────────── */
function SPAccountsCard({
  spAccounts: initSP
}) {
  const [spAccounts, setSPAccounts] = useState(initSP);
  const [showModal, setShowModal] = useState(false);
  const existing = spAccounts.map(s => s.sp);
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
      marginBottom: 12
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
  }), " Add Account")), /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table",
    style: {
      minWidth: 680
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "SP Code"), /*#__PURE__*/React.createElement("th", null, "Organisation"), /*#__PURE__*/React.createElement("th", null, "Commission Status"), /*#__PURE__*/React.createElement("th", null, "Volume (L)"), /*#__PURE__*/React.createElement("th", null, "Effective"), /*#__PURE__*/React.createElement("th", null, "End"), /*#__PURE__*/React.createElement("th", null, "Exception"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, spAccounts.map((sp, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "hac-code"
  }, sp.sp)), /*#__PURE__*/React.createElement("td", {
    className: "ml-cell-main"
  }, sp.org), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(CommissionStatusBadge, {
    status: sp.commissionStatus || "activated"
  })), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, sp.volume ? sp.volume.toLocaleString() : "—"), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono",
    style: {
      fontSize: 12
    }
  }, sp.eff), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono",
    style: {
      fontSize: 12
    }
  }, sp.end), /*#__PURE__*/React.createElement("td", null, sp.exception ? /*#__PURE__*/React.createElement("span", {
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
  })))))), /*#__PURE__*/React.createElement("tfoot", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 3
  }, "Total: ", spAccounts.length, " accounts"), /*#__PURE__*/React.createElement("td", {
    colSpan: 5,
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-foot-note"
  }, spAccounts.filter(s => s.exception).length, " with exceptions")))))), showModal && /*#__PURE__*/React.createElement(AddSPModal, {
    onClose: () => setShowModal(false),
    onAdd: handleAdd,
    existing: existing
  }));
}

/* ─── Termination card ───────────────────────────────────────── */
function TerminationCard({
  cfg
}) {
  const [date, setDate] = useState(cfg.termination.date || "");
  const [hold, setHold] = useState(cfg.termination.holdState);
  const [transferTo, setTransferTo] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const canTerminate = confirmed && !!date;
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
    className: "hac-term-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Effective termination date"), /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value),
    style: {
      maxWidth: 220
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-form-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Transfer SP accounts to"), /*#__PURE__*/React.createElement("select", {
    className: "hac-select",
    value: transferTo,
    onChange: e => setTransferTo(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u2014 Select agent \u2014"), cfg.otherAgents.map(a => /*#__PURE__*/React.createElement("option", {
    key: a.id,
    value: a.id
  }, a.name, " (", a.id, ")"))))), /*#__PURE__*/React.createElement("div", {
    className: "hac-toggle-row",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hac-toggle-label-text"
  }, "Hold commission payouts"), /*#__PURE__*/React.createElement("div", {
    className: "hac-toggle-label-sub"
  }, "Suspend until final reconciliation is complete")), /*#__PURE__*/React.createElement("div", {
    className: "hac-toggle" + (hold ? " on" : ""),
    onClick: () => setHold(v => !v)
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-toggle-knob"
  }))), date && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      padding: "12px 14px",
      background: "var(--bg-muted)",
      borderRadius: 6,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: "var(--fg-primary)",
      marginBottom: 4
    }
  }, "Pro-rated commission estimate"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--fg-secondary)",
      marginBottom: 6
    }
  }, "Calculated up to ", new Date(date).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      color: "var(--fg-tertiary)"
    }
  }, "\xB7 Cutoff: 4th of month")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: "var(--navy-800)"
    }
  }, "RM ", Math.round((cfg.commission || 0) * (new Date(date).getDate() / 30)).toLocaleString("en-MY", {
    minimumFractionDigits: 2
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hac-term-confirm"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-check-label"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: confirmed,
    onChange: e => setConfirmed(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", null, "I confirm all SP accounts have been reviewed and this agent's commission config will be locked upon termination.")), /*#__PURE__*/React.createElement("button", {
    className: "hac-danger-btn" + (!canTerminate ? " disabled" : ""),
    disabled: !canTerminate
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "event_busy",
    size: 15
  }), " Terminate Agent")));
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
    className: "hac-form-grid3"
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
  }, b))) : /*#__PURE__*/React.createElement("input", {
    className: "hac-input",
    value: form[f.key] || "",
    onChange: e => set(f.key, e.target.value)
  }) : /*#__PURE__*/React.createElement("span", {
    className: "hac-view-val"
  }, cfg[f.key] || /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--fg-disabled)"
    }
  }, "\u2014")))), /*#__PURE__*/React.createElement("div", {
    className: "hac-fg"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hac-label"
  }, "Account Status"), /*#__PURE__*/React.createElement("span", {
    className: "hac-view-val",
    style: {
      paddingTop: 6
    }
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
  }, "Agent List"), /*#__PURE__*/React.createElement(HIcon, {
    name: "chevron_right",
    size: 15,
    color: "var(--fg-tertiary)"
  }), /*#__PURE__*/React.createElement("span", null, isEdit ? "Edit" : "Create")), /*#__PURE__*/React.createElement("h1", {
    className: "ml-h1",
    style: {
      margin: "10px 0 18px"
    }
  }, isEdit ? "Edit agent account" : "Create agent account"), /*#__PURE__*/React.createElement("div", {
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
    className: "ml-card hac-detail-card",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sec-header"
  }, "Commission Configuration"), /*#__PURE__*/React.createElement(CommissionSection, {
    kpi: {
      evalPeriod: "",
      useCustomPeriod: false,
      customStart: "Dec",
      customEnd: "Dec",
      current: {
        version: 1,
        effective: "",
        target: 0,
        thresholds: [{
          tier: "Tier 1",
          label: "Full commission",
          minPct: 100,
          mult: 100
        }, {
          tier: "Tier 2",
          label: "Half commission",
          minPct: 75,
          mult: 50
        }, {
          tier: "Tier 3",
          label: "No commission",
          minPct: 0,
          mult: 0
        }]
      }
    },
    tiers: [],
    editing: true
  })), /*#__PURE__*/React.createElement(SPAccountsCard, {
    spAccounts: []
  }), /*#__PURE__*/React.createElement("div", {
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
  const base = window.HC.AGENT_CONFIG;
  const row = agent || base;
  // Build the per-agent config off the shared template, overriding identity + KPI
  // from the clicked row so every agent renders its real KPI state.
  const cfg = {
    ...base,
    id: row.id,
    name: row.name,
    role: row.role,
    joined: row.joined,
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
    }
  };
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
  }, "Agent List"), /*#__PURE__*/React.createElement(HIcon, {
    name: "chevron_right",
    size: 15,
    color: "var(--fg-tertiary)"
  }), /*#__PURE__*/React.createElement("span", null, cfg.name)), /*#__PURE__*/React.createElement("div", {
    className: "ml-page-head",
    style: {
      margin: "10px 0 20px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "ml-h1"
  }, cfg.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-secondary)",
      marginTop: 3
    }
  }, cfg.role, " \xB7 ", cfg.id, " \xB7 Joined ", cfg.joined)), /*#__PURE__*/React.createElement("div", {
    className: "ml-page-head-right"
  }, /*#__PURE__*/React.createElement(AccountStatusBadge, {
    status: cfg.accountStatus || "active"
  }), !editing && /*#__PURE__*/React.createElement("button", {
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
    tiers: cfg.tiers,
    editing: editing
  }), /*#__PURE__*/React.createElement(SPAccountsCard, {
    spAccounts: cfg.spAccounts
  }), /*#__PURE__*/React.createElement(TerminationCard, {
    cfg: cfg
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
  }, "Agent"), /*#__PURE__*/React.createElement("div", {
    className: "ml-tabs"
  }, [{
    key: "list",
    label: "Agent List",
    icon: "group"
  }, {
    key: "myfuel",
    label: "MyFuel Commission",
    icon: "local_gas_station"
  }, {
    key: "subscription",
    label: "Subscription Commission",
    icon: "workspace_premium"
  }].map(t => /*#__PURE__*/React.createElement("button", {
    key: t.key,
    className: "ml-tab" + (activeTab === t.key ? " active" : ""),
    onClick: () => setActiveTab(t.key)
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: t.icon,
    size: 16
  }), t.label, t.key === "subscription" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      background: "var(--amber-50)",
      color: "var(--amber-600)",
      padding: "1px 6px",
      borderRadius: 4,
      marginLeft: 4
    }
  }, "Soon"))))), activeTab === "list" && /*#__PURE__*/React.createElement(React.Fragment, null, agentView === "list" && /*#__PURE__*/React.createElement(AgentsListView, {
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
  })), activeTab === "myfuel" && /*#__PURE__*/React.createElement(MyFuelCommissionTabView, null), activeTab === "subscription" && /*#__PURE__*/React.createElement(SubscriptionCommissionTabView, null)));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(HostAgentConfig, null));
