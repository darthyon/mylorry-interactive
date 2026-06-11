(function(){
// host-myfuel-commission.jsx — MyFuel Commission tab + Subscription Commission tab
// Exports: MyFuelCommissionTab, SubscriptionCommissionTab → window

const {
  useState: useMFC,
  useMemo: useMFM
} = React;
const KPIProgress = window.HKPIProgress;

/* ─── Commission Status Badge ────────────────────────────────── */
const COMM_STATUS_META = {
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
function MFCommStatusBadge({
  status
}) {
  const m = COMM_STATUS_META[status] || COMM_STATUS_META.activated;
  return /*#__PURE__*/React.createElement("span", {
    className: "ml-badge " + m.cls
  }, m.label);
}

/* ─── Payout Status Badge ────────────────────────────────────── */
const PAYOUT_META = {
  Pending: {
    cls: "payout-pending"
  },
  Approved: {
    cls: "payout-approved"
  },
  Paid: {
    cls: "payout-paid"
  },
  Rejected: {
    cls: "payout-rejected"
  }
};
function PayoutBadge({
  status
}) {
  const m = PAYOUT_META[status] || PAYOUT_META.Pending;
  return /*#__PURE__*/React.createElement("span", {
    className: "ml-badge " + m.cls
  }, status);
}

/* ─── KPI attainment bar ─────────────────────────────────────── */
function KPIBar({
  pct
}) {
  const col = pct >= 75 ? "var(--green-500)" : "var(--red-400)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 6,
      background: "var(--bg-muted)",
      borderRadius: 3,
      overflow: "hidden",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: Math.min(pct, 100) + "%",
      background: col,
      borderRadius: 3
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: col,
      whiteSpace: "nowrap"
    }
  }, pct, "%"));
}

/* ─── History bar chart ──────────────────────────────────────── */
function HistoryBarChart({
  history
}) {
  const max = Math.max(...history.map(h => h.commission), 1);
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-hist-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-hist-bars"
  }, history.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-hist-col",
    title: HC.fmtRM(h.commission)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 80,
      display: "flex",
      alignItems: "flex-end",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-hist-bar",
    style: {
      height: Math.max(h.commission / max * 80, 4) + "px"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-hist-label"
  }, h.period)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--fg-tertiary)"
    }
  }, "Min: ", HC.fmtRM(Math.min(...history.map(h => h.commission)))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--fg-tertiary)"
    }
  }, "Max: ", HC.fmtRM(Math.max(...history.map(h => h.commission))))));
}

/* ─── MyFuel KPI header strip ────────────────────────────────── */
function MyFuelKPIHeader() {
  const s = HC.MYFUEL_SUMMARY;
  const kpis = [{
    title: "Total Commission Payable",
    value: HC.fmtRM(s.totalPayable),
    sub: s.period,
    icon: "payments"
  }, {
    title: "Total Active Agents",
    value: s.activeAgents,
    sub: "Currently active",
    icon: "group"
  }, {
    title: "Pending Payout Requests",
    value: s.pendingPayout,
    sub: "Awaiting approval",
    icon: "pending_actions"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-kpi-strip"
  }, kpis.map((k, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-stat-card-a"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-header-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: k.icon,
    size: 18,
    color: "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-title"
  }, k.title), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-subtitle"
  }, k.sub)))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-value-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-stat-value"
  }, k.value)))));
}

/* ─── Agent Commission Drill-down ────────────────────────────── */
function AgentCommissionDrilldown({
  record,
  onBack
}) {
  const breakdown = HC.SP_COMMISSION_BREAKDOWN[record.agentId] || [];
  const history = HC.COMMISSION_HISTORY[record.agentId] || HC.COMMISSION_HISTORY._default;
  const totalVol = breakdown.reduce((a, b) => a + b.volume, 0);
  const totalComm = breakdown.reduce((a, b) => a + b.commission, 0);
  const tierCls = {
    "Tier 1": "t1",
    "Tier 2": "t2",
    "Tier 3": "t3"
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hac-breadcrumb"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-bc-link",
    onClick: onBack
  }, "MyFuel Commission"), /*#__PURE__*/React.createElement(HIcon, {
    name: "chevron_right",
    size: 15,
    color: "var(--fg-tertiary)"
  }), /*#__PURE__*/React.createElement("span", null, record.agentName)), /*#__PURE__*/React.createElement("div", {
    className: "ml-page-head",
    style: {
      margin: "10px 0 20px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "ml-h1"
  }, record.agentName), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-secondary)",
      marginTop: 3
    }
  }, record.agentId, " \xB7 ", record.period)), /*#__PURE__*/React.createElement("div", {
    className: "ml-page-head-right"
  }, /*#__PURE__*/React.createElement(PayoutBadge, {
    status: record.payout
  }), /*#__PURE__*/React.createElement(HExportMenu, null))), /*#__PURE__*/React.createElement("div", {
    className: "hm-kpi-strip",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-card-a"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-header-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "local_gas_station",
    size: 18,
    color: "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-title"
  }, "Total Volume"), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-subtitle"
  }, record.spCount, " SP accounts")))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-value-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-stat-value"
  }, HC.fmtL(record.totalLiters)))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-card-a"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-header-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "track_changes",
    size: 18,
    color: "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-title"
  }, "KPI Progress"), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-subtitle"
  }, "Target: ", (record.kpiTarget || 200000).toLocaleString("en-US"), " L \xB7 Dec 1\u201331")))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-value-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-stat-value"
  }, record.kpiPct, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: record.kpiPct >= 75 ? "var(--green-500)" : "var(--red-400)"
    }
  }, record.kpiPct >= 100 ? "✓ Full commission" : record.kpiPct >= 75 ? "✓ 50% multiplier" : "No commission"))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-card-a"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-header-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "payments",
    size: 18,
    color: "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-title"
  }, "Commission Amount"), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-subtitle"
  }, "Confirmed transactions only")))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-value-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-stat-value"
  }, HC.fmtRM(record.commission))))), /*#__PURE__*/React.createElement("div", {
    className: "ml-card hac-detail-card",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-sec-header"
  }, "SP Account Breakdown \u2014 ", record.period), breakdown.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "32px 0",
      textAlign: "center",
      color: "var(--fg-tertiary)",
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "table_chart",
    size: 32,
    color: "var(--fg-disabled)"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 8,
      display: "block"
    }
  }, "No SP account breakdown available for this agent.")) : /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table",
    style: {
      minWidth: 700
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "SP Code"), /*#__PURE__*/React.createElement("th", null, "Organisation"), /*#__PURE__*/React.createElement("th", null, "Volume (L)"), /*#__PURE__*/React.createElement("th", null, "Tier Applied"), /*#__PURE__*/React.createElement("th", null, "Base Rate"), /*#__PURE__*/React.createElement("th", null, "Commission"), /*#__PURE__*/React.createElement("th", null, "Commission Status"))), /*#__PURE__*/React.createElement("tbody", null, breakdown.map((b, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "hac-code"
  }, b.sp)), /*#__PURE__*/React.createElement("td", {
    className: "ml-cell-main"
  }, b.org), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, b.volume.toLocaleString()), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-tier-tag " + (tierCls[b.tier] || "t1")
  }, b.tier)), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, HC.fmtRate(b.rate)), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono",
    style: {
      fontWeight: 600,
      color: "var(--navy-800)"
    }
  }, HC.fmtRM(b.commission)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(MFCommStatusBadge, {
    status: b.commissionStatus
  }))))), /*#__PURE__*/React.createElement("tfoot", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 2
  }, "Total \u2014 ", breakdown.length, " accounts"), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, totalVol.toLocaleString()), /*#__PURE__*/React.createElement("td", {
    colSpan: 2
  }), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono",
    style: {
      fontWeight: 700
    }
  }, HC.fmtRM(totalComm)), /*#__PURE__*/React.createElement("td", null)))))), /*#__PURE__*/React.createElement("div", {
    className: "ml-card hac-detail-card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      flexWrap: "wrap",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "history",
    size: 18,
    color: "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: "var(--fg-primary)"
    }
  }, "Commission History"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-secondary)"
    }
  }, "Last 12 months")))), /*#__PURE__*/React.createElement("div", {
    className: "hm-hist-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-hist-bars"
  }, history.map((h, i) => {
    const max = Math.max(...history.map(x => x.commission), 1);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "hm-hist-col",
      title: HC.fmtRM(h.commission)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 80,
        display: "flex",
        alignItems: "flex-end",
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-hist-bar",
      style: {
        height: Math.max(h.commission / max * 80, 4) + "px"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "hm-hist-label"
    }, h.period));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "commission-grid-ds"
  }, [...history].slice(-6).map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "commission-cell-ds"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--fg-primary)",
      background: "#F4F4F6",
      padding: "8px 12px",
      borderBottom: "1px solid #E5E5E8"
    }
  }, h.period), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--fg-primary)"
    }
  }, HC.fmtRM(h.commission)))))))));
}

/* ─── MyFuel Commission Tab (root) ───────────────────────────── */
function MyFuelCommissionTab() {
  const [drillRecord, setDrillRecord] = useMFC(null);
  const [filters, setFilters] = useMFC({
    period: "Jun 2026",
    agentQ: "",
    spAccount: "",
    payoutStatus: "all"
  });
  const setF = (k, v) => {
    setFilters(f => ({
      ...f,
      [k]: v
    }));
    setPage(1);
  };
  const [filterOpen, setFilterOpen] = useMFC(false);
  const [pending, setPending] = useMFC({
    period: "Jun 2026",
    spAccount: "",
    payoutStatus: "all"
  });
  const [page, setPage] = useMFC(1);
  const [perPage, setPerPage] = useMFC(10);
  const activeCount = (filters.period !== "Jun 2026" ? 1 : 0) + (filters.spAccount !== "" ? 1 : 0) + (filters.payoutStatus !== "all" ? 1 : 0);
  const hasActiveFilters = activeCount > 0;
  const toggleFilter = () => {
    if (!filterOpen) setPending({
      period: filters.period,
      spAccount: filters.spAccount,
      payoutStatus: filters.payoutStatus
    });
    setFilterOpen(v => !v);
  };
  const applyFilters = () => {
    setFilters(f => ({
      ...f,
      ...pending
    }));
    setFilterOpen(false);
    setPage(1);
  };
  const resetFilters = () => {
    const cleared = {
      period: "Jun 2026",
      spAccount: "",
      payoutStatus: "all"
    };
    setPending(cleared);
    setFilters(f => ({
      ...f,
      ...cleared
    }));
    setPage(1);
  };
  const records = useMFM(() => {
    let data = HC.MYFUEL_RECORDS;
    if (filters.agentQ) {
      const q = filters.agentQ.toLowerCase();
      data = data.filter(r => r.agentName.toLowerCase().includes(q) || r.agentId.toLowerCase().includes(q));
    }
    if (filters.payoutStatus !== "all") data = data.filter(r => r.payout === filters.payoutStatus);
    return data;
  }, [filters]);
  const totalPayable = records.reduce((a, r) => a + r.commission, 0);
  const pageData = records.slice((page - 1) * perPage, page * perPage);
  if (drillRecord) {
    return /*#__PURE__*/React.createElement(AgentCommissionDrilldown, {
      record: drillRecord,
      onBack: () => setDrillRecord(null)
    });
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(MyFuelKPIHeader, null), /*#__PURE__*/React.createElement("div", {
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
    placeholder: "Search by name or ID",
    value: filters.agentQ,
    onChange: e => setF("agentQ", e.target.value)
  }), filters.agentQ && /*#__PURE__*/React.createElement("button", {
    className: "hac-search-clear",
    onClick: () => setF("agentQ", "")
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
  }, activeCount))), /*#__PURE__*/React.createElement(HExportMenu, null)), filterOpen && /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-field"
  }, /*#__PURE__*/React.createElement("label", null, "Period"), /*#__PURE__*/React.createElement("select", {
    value: pending.period,
    onChange: e => setPending(p => ({
      ...p,
      period: e.target.value
    }))
  }, ["Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026", "Dec 2025", "Nov 2025", "Oct 2025"].map(p => /*#__PURE__*/React.createElement("option", {
    key: p
  }, p)))), /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-field"
  }, /*#__PURE__*/React.createElement("label", null, "SP Account"), /*#__PURE__*/React.createElement("select", {
    value: pending.spAccount,
    onChange: e => setPending(p => ({
      ...p,
      spAccount: e.target.value
    }))
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "All accounts"), /*#__PURE__*/React.createElement("option", null, "CK-PTN-001"), /*#__PURE__*/React.createElement("option", null, "SUM-PTN-012"), /*#__PURE__*/React.createElement("option", null, "MEGA-PTN-007"), /*#__PURE__*/React.createElement("option", null, "PIN-PTN-033"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-field"
  }, /*#__PURE__*/React.createElement("label", null, "Payout Status"), /*#__PURE__*/React.createElement("select", {
    value: pending.payoutStatus,
    onChange: e => setPending(p => ({
      ...p,
      payoutStatus: e.target.value
    }))
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All statuses"), /*#__PURE__*/React.createElement("option", {
    value: "Pending"
  }, "Pending"), /*#__PURE__*/React.createElement("option", {
    value: "Approved"
  }, "Approved"), /*#__PURE__*/React.createElement("option", {
    value: "Paid"
  }, "Paid"), /*#__PURE__*/React.createElement("option", {
    value: "Rejected"
  }, "Rejected")))), /*#__PURE__*/React.createElement("div", {
    className: "hac-filter-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-filter-apply",
    onClick: applyFilters
  }, "Apply Filters"), /*#__PURE__*/React.createElement("button", {
    className: "hac-filter-reset",
    onClick: resetFilters
  }, "Reset All"))), /*#__PURE__*/React.createElement("div", {
    className: "hac-count",
    style: {
      marginBottom: 8
    }
  }, records.length, " agent", records.length !== 1 ? "s" : ""), /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table",
    style: {
      minWidth: 780
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Agent"), /*#__PURE__*/React.createElement("th", null, "Agent ID"), /*#__PURE__*/React.createElement("th", null, "SP Accounts"), /*#__PURE__*/React.createElement("th", null, "Total Volume (L)"), /*#__PURE__*/React.createElement("th", null, "KPI Progress"), /*#__PURE__*/React.createElement("th", null, "Commission"), /*#__PURE__*/React.createElement("th", null, "Payout Status"))), /*#__PURE__*/React.createElement("tbody", null, pageData.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    onClick: () => setDrillRecord(r),
    style: {
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("td", {
    className: "ml-cell-main"
  }, r.agentName), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", {
    className: "hac-code"
  }, r.agentId)), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, r.spCount), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, r.totalLiters.toLocaleString()), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(KPIProgress, {
    pct: r.kpiPct,
    actual: r.totalLiters,
    target: r.kpiTarget,
    period: "Dec 1\u201331"
  })), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono",
    style: {
      fontWeight: 600,
      color: "var(--navy-800)"
    }
  }, HC.fmtRM(r.commission)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(PayoutBadge, {
    status: r.payout
  }))))))), /*#__PURE__*/React.createElement(HPager, {
    page: page,
    perPage: perPage,
    total: records.length,
    onPage: setPage,
    onPerPage: setPerPage
  }));
}

/* ─── Subscription Commission Tab (coming soon) ──────────────── */
function SubscriptionCommissionTab() {
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-coming-soon"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-cs-icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "workspace_premium",
    size: 34,
    color: "var(--fg-tertiary)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-cs-title"
  }, "Subscription Commission"), /*#__PURE__*/React.createElement("div", {
    className: "hm-cs-sub"
  }, "Subscription-based commission tracking is currently in development and will be available in an upcoming release."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      padding: "10px 18px",
      background: "var(--bg-muted)",
      borderRadius: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "info",
    size: 15,
    color: "var(--fg-tertiary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--fg-secondary)"
    }
  }, "Expected: Q3 2026")));
}
Object.assign(window, {
  MyFuelCommissionTab,
  SubscriptionCommissionTab
});

})();
