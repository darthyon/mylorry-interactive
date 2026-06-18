(function () {
// host-myfuel-commission.jsx — MyFuel Commission tab + Subscription Commission tab
// Exports: MyFuelCommissionTab, SubscriptionCommissionTab -> window

const {
  useState: useMFC,
  useMemo: useMFM
} = React;
const KPIProgress = window.HKPIProgress;
const KPIProgressMeta = window.KPIProgressMeta;
const MYFUEL_VIEW_OPTIONS = [{
  key: "all",
  label: "All"
}, {
  key: "agent",
  label: "Agent"
}, {
  key: "referrer",
  label: "Referrer"
}];
const ROLE_META = {
  agent: {
    label: "Agent",
    accent: "#00AA4F",
    tint: "#D9F3E4"
  },
  referrer: {
    label: "Referrer",
    accent: "#0E7490",
    tint: "#D9F0F6"
  }
};

/* ─── Commission Status Badge — shared (window.HStatusBadge) ──── */
const MFCommStatusBadge = window.HStatusBadge;

/* ─── KPI attainment bar ─────────────────────────────────────── */
function KPIBar({
  pct
}) {
  const meta = KPIProgressMeta(pct);
  const col = meta.solid;
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

/* ─── Helpers ────────────────────────────────────────────────── */
function chartCompact(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(v % 1e6 === 0 ? 0 : 1) + "M";
  if (v >= 1e3) return Math.round(v / 1e3) + "K";
  return String(Math.round(v));
}
function chartNiceMax(max) {
  const safeMax = Math.max(max, 1);
  const pow = Math.pow(10, Math.floor(Math.log10(safeMax)));
  const n = safeMax / pow;
  const step = n <= 1 ? 1 : n <= 1.5 ? 1.5 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 3 ? 3 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 7.5 ? 7.5 : 10;
  return step * pow;
}
function shortPeriodFromMonth(monthLabel) {
  if (!monthLabel) return null;
  const parts = monthLabel.split(" ");
  if (parts.length !== 2) return null;
  return `${parts[0]} '${String(parts[1]).slice(-2)}`;
}
function getTrendWindow(data, selectedMonth) {
  const target = shortPeriodFromMonth(selectedMonth);
  if (!target) return data;
  const idx = data.findIndex(item => item.period === target);
  if (idx === -1) return data;
  return data.slice(Math.max(0, idx - 11), idx + 1);
}
function getRecordId(record) {
  return record.salespersonId || record.agentId;
}
function getRecordName(record) {
  return record.salespersonName || record.agentName;
}
function getRoleKey(record) {
  return (record.roleKey || record.role || "agent").toLowerCase();
}
function getRoleLabel(record) {
  const roleKey = getRoleKey(record);
  return ROLE_META[roleKey]?.label || "Agent";
}
function getMetricKey(metric) {
  return metric === "volume" ? "Volume" : "Amount";
}
function getMetricValue(point, metric, roleView) {
  const key = getMetricKey(metric);
  if (roleView === "agent") return point["agent" + key] ?? point[metric] ?? point.commission ?? 0;
  if (roleView === "referrer") return point["referrer" + key] ?? point[metric] ?? point.commission ?? 0;
  return point[metric] ?? point.amount ?? point.commission ?? 0;
}
function getStackValues(point, metric, roleView, stackedInAll) {
  if (stackedInAll) {
    const agent = point["agent" + getMetricKey(metric)] ?? 0;
    const referrer = point["referrer" + getMetricKey(metric)] ?? 0;
    if (roleView === "agent") return {
      total: agent,
      agent,
      referrer: 0
    };
    if (roleView === "referrer") return {
      total: referrer,
      agent: 0,
      referrer
    };
    return {
      total: agent + referrer,
      agent,
      referrer
    };
  }
  const total = getMetricValue(point, metric, roleView);
  return {
    total,
    agent: total,
    referrer: 0
  };
}
function formatMetricValue(metric, value) {
  return metric === "volume" ? HC.fmtL(value) : HC.fmtRM(value);
}
function formatAxisValue(metric, value) {
  return metric === "volume" ? chartCompact(value) : "RM " + chartCompact(value);
}

/* ─── Trend bar chart — Volume / Amount toggle + tooltip ──────── */
function TrendBarChart({
  data,
  title,
  subtitle,
  defaultMetric = "volume",
  icon = "history",
  view = "all",
  stackedInAll = false
}) {
  const [metric, setMetric] = useMFC(defaultMetric);
  const [hover, setHover] = useMFC(null);
  const TICKS = 4;
  const maxValue = Math.max(...data.map(point => getStackValues(point, metric, view, stackedInAll).total), 1);
  const niceMax = chartNiceMax(maxValue);
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-card hac-detail-card hm-chart-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-chart-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-chart-title-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: icon,
    size: 18,
    color: "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-chart-title"
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    className: "hm-chart-sub"
  }, subtitle))), /*#__PURE__*/React.createElement(Segmented, {
    value: metric,
    onChange: setMetric,
    options: [{
      value: "volume",
      label: "Volume"
    }, {
      value: "amount",
      label: "Amount"
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: "hm-chart-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-chart-yaxis"
  }, Array.from({
    length: TICKS + 1
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-chart-ytick"
  }, formatAxisValue(metric, niceMax * (TICKS - i) / TICKS)))), /*#__PURE__*/React.createElement("div", {
    className: "hm-chart-plot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-chart-grid"
  }, Array.from({
    length: TICKS + 1
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "hm-chart-gridline"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "hm-chart-bars"
  }, data.map((point, i) => {
    const values = getStackValues(point, metric, view, stackedInAll);
    const totalHeight = values.total / niceMax * 100;
    const isStacked = stackedInAll && view === "all";
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "hm-chart-col",
      onMouseEnter: () => setHover(i),
      onMouseLeave: () => setHover(null),
      onClick: () => setHover(current => current === i ? null : i)
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-chart-bar-track" + (hover === i ? " active" : "")
    }, isStacked ? /*#__PURE__*/React.createElement("div", {
      style: {
        height: totalHeight + "%",
        width: "58%",
        maxWidth: 26,
        minHeight: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: 2
      }
    }, values.referrer > 0 && /*#__PURE__*/React.createElement("div", {
      className: "hm-chart-bar",
      style: {
        height: Math.max(values.referrer / values.total * 100, 3) + "%",
        width: "100%",
        maxWidth: "none",
        background: ROLE_META.referrer.accent,
        borderRadius: "4px 4px 0 0"
      }
    }), values.agent > 0 && /*#__PURE__*/React.createElement("div", {
      className: "hm-chart-bar",
      style: {
        height: Math.max(values.agent / values.total * 100, 3) + "%",
        width: "100%",
        maxWidth: "none",
        background: ROLE_META.agent.accent,
        borderRadius: values.referrer > 0 ? "0" : "4px 4px 0 0"
      }
    })) : /*#__PURE__*/React.createElement("div", {
      className: "hm-chart-bar" + (hover === i ? " active" : ""),
      style: {
        height: totalHeight + "%",
        background: view === "referrer" ? ROLE_META.referrer.accent : ROLE_META.agent.accent
      }
    }), hover === i && /*#__PURE__*/React.createElement("div", {
      className: "hm-chart-tip"
    }, /*#__PURE__*/React.createElement("div", {
      className: "hm-chart-tip-val"
    }, formatMetricValue(metric, values.total)), /*#__PURE__*/React.createElement("div", {
      className: "hm-chart-tip-period"
    }, point.period), isStacked && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        display: "grid",
        gap: 4
      }
    }, [{
      label: "Total",
      value: values.total,
      color: "#3A3D46"
    }, {
      label: "Agent",
      value: values.agent,
      color: ROLE_META.agent.accent
    }, {
      label: "Referrer",
      value: values.referrer,
      color: ROLE_META.referrer.accent
    }].map(row => /*#__PURE__*/React.createElement("div", {
      key: row.label,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "var(--fg-secondary)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 999,
        background: row.color,
        display: "inline-block"
      }
    }), row.label), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--fg-primary)",
        fontWeight: 700
      }
    }, formatMetricValue(metric, row.value))))))), /*#__PURE__*/React.createElement("div", {
      className: "hm-chart-xlabel"
    }, point.period));
  })))));
}

/* ─── MyFuel KPI header strip ────────────────────────────────── */
function MyFuelKPIHeader({
  view,
  records,
  month
}) {
  const activeRecords = records.filter(record => record.status === "active");
  const avgKpiSource = records.filter(record => record.kpiPhase !== "future");
  const avgKpi = avgKpiSource.length ? avgKpiSource.reduce((sum, record) => sum + (record.kpiPct || 0), 0) / avgKpiSource.length : 0;
  const agentCount = activeRecords.filter(record => getRoleKey(record) === "agent").length;
  const referrerCount = activeRecords.filter(record => getRoleKey(record) === "referrer").length;
  const totalCommission = records.reduce((sum, record) => sum + (record.commission || 0), 0);
  const activeTitle = view === "agent" ? "Active Agent" : view === "referrer" ? "Active Referrer" : "Total Active Salesperson";
  const kpiSubtitle = view === "agent" ? "Across active Agent records" : view === "referrer" ? "Across active Referrer records" : "Across current selection";
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-kpi-strip"
  }, /*#__PURE__*/React.createElement("div", {
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
  }, "Total Commission Payable"), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-subtitle"
  }, month)))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-value-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-stat-value"
  }, HC.fmtRM(totalCommission)))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-card-a"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-header-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-icon"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "group",
    size: 18,
    color: "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-title"
  }, activeTitle), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-subtitle"
  }, month)))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-value-row",
    style: {
      flexWrap: "wrap",
      alignItems: "baseline",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-stat-value"
  }, activeRecords.length), view === "all" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--fg-secondary)"
    }
  }, agentCount, " Agent \xB7 ", referrerCount, " Referrer"))), /*#__PURE__*/React.createElement("div", {
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
  }, "Average KPI Progress"), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-subtitle"
  }, kpiSubtitle)))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-value-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-stat-value"
  }, avgKpi.toFixed(1) + "%"))));
}

/* ─── Salesperson Commission Drill-down ───────────────────────── */
function AgentCommissionDrilldown({
  record,
  onBack
}) {
  const MONTHS = ["Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026", "Dec 2025", "Nov 2025", "Oct 2025"];
  const recordId = getRecordId(record);
  const recordName = getRecordName(record);
  const roleLabel = getRoleLabel(record);
  const breakdown = HC.SP_COMMISSION_BREAKDOWN[recordId] || [];
  const history = HC.COMMISSION_HISTORY[recordId] || HC.COMMISSION_HISTORY._default;
  const [spQ, setSpQ] = useMFC("");
  const [month, setMonth] = useMFC(record.period);
  const [page, setPage] = useMFC(1);
  const [perPage, setPerPage] = useMFC(10);
  const onSpSearch = value => {
    setSpQ(value);
    setPage(1);
  };
  const isPendingOnboarding = item => item.commissionStatus === "pending_onboarding";
  const rows = spQ ? breakdown.filter(item => {
    const q = spQ.toLowerCase();
    return item.org.toLowerCase().includes(q) || item.sp.toLowerCase().includes(q);
  }) : breakdown;
  const pageRows = rows.slice((page - 1) * perPage, page * perPage);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "hac-breadcrumb"
  }, /*#__PURE__*/React.createElement("button", {
    className: "hac-bc-link",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "arrow_back",
    size: 15,
    color: "var(--green-600)"
  }), "Back to MyFuel Commission")), /*#__PURE__*/React.createElement("div", {
    className: "ml-page-head",
    style: {
      margin: "10px 0 20px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "ml-h1"
  }, recordName), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-secondary)",
      marginTop: 3
    }
  }, recordId, " \xB7 ", roleLabel, " \xB7 ", record.period))), /*#__PURE__*/React.createElement("div", {
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
  }, record.attributedKpiVolume != null ? `${record.attributedKpiVolume.toLocaleString("en-US")} L attributed · target ${(record.kpiTarget || 200000).toLocaleString("en-US")} L` : `Target: ${(record.kpiTarget || 200000).toLocaleString("en-US")} L · Dec 1–31`)))), /*#__PURE__*/React.createElement("div", {
    className: "hm-stat-value-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-stat-value"
  }, record.kpiPhase === "future" ? "—" : `${record.kpiPct}%`))), /*#__PURE__*/React.createElement("div", {
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
    style: {
      marginBottom: 16
    }
  }, breakdown.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
  }, "No SP account breakdown available for this salesperson.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "hac-toolbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-toolbar-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-search-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hac-search-bar"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "search",
    size: 18,
    color: "var(--fg-tertiary)"
  }), /*#__PURE__*/React.createElement("input", {
    className: "hac-search-input",
    placeholder: "Search SP account or code",
    value: spQ,
    onChange: e => onSpSearch(e.target.value)
  }), spQ && /*#__PURE__*/React.createElement("button", {
    className: "hac-search-clear",
    onClick: () => onSpSearch("")
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "close",
    size: 16,
    color: "var(--fg-tertiary)"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "hm-month-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-month-label"
  }, "Month"), /*#__PURE__*/React.createElement("select", {
    className: "hm-month-select",
    value: month,
    onChange: e => setMonth(e.target.value)
  }, MONTHS.map(item => /*#__PURE__*/React.createElement("option", {
    key: item
  }, item)))))), /*#__PURE__*/React.createElement("div", {
    className: "hac-count",
    style: {
      marginBottom: 8
    }
  }, rows.length, " SP account", rows.length !== 1 ? "s" : ""), /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table",
    style: {
      minWidth: 860
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "SP Account"), /*#__PURE__*/React.createElement("th", null, "Volume (L)"), /*#__PURE__*/React.createElement("th", null, "KPI Attribution"), /*#__PURE__*/React.createElement("th", null, "Commission Tier"), /*#__PURE__*/React.createElement("th", null, "Base Commission"), /*#__PURE__*/React.createElement("th", null, "KPI Multiplier"), /*#__PURE__*/React.createElement("th", null, "Final Commission"), /*#__PURE__*/React.createElement("th", null, "Commission Validity"), /*#__PURE__*/React.createElement("th", null, "Commission Status"))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 9,
    style: {
      textAlign: "center",
      padding: "24px 0",
      color: "var(--fg-tertiary)"
    }
  }, "No SP accounts match \u201C", spQ, "\u201D.")) : pageRows.map((item, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "hm-sp-account-cell"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-main"
  }, item.org), /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-sub hm-sp-account-code"
  }, /*#__PURE__*/React.createElement(PetronLogo, {
    size: 18
  }), /*#__PURE__*/React.createElement("code", {
    className: "hac-code"
  }, item.sp))))), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, isPendingOnboarding(item) || item.volume == null ? "—" : item.volume.toLocaleString()), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, !isPendingOnboarding(item) && item.kpiVolume != null ? /*#__PURE__*/React.createElement(React.Fragment, null, item.kpiVolume.toLocaleString(), /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-sub"
  }, item.kpiSplitPct, "% attributed")) : "—"), /*#__PURE__*/React.createElement("td", null, isPendingOnboarding(item) || item.rate == null ? /*#__PURE__*/React.createElement("span", {
    className: "ml-mono"
  }, "\u2014") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "ml-mono",
    style: {
      fontWeight: 600
    }
  }, HC.fmtRate(item.rate)), /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-sub"
  }, item.tier))), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, isPendingOnboarding(item) || item.baseCommission == null ? "—" : HC.fmtRM(item.baseCommission)), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, isPendingOnboarding(item) || item.kpiMult == null ? "—" : `${item.kpiMult}%`), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono",
    style: {
      fontWeight: 600,
      color: "var(--navy-800)"
    }
  }, isPendingOnboarding(item) || item.finalCommission == null ? "—" : HC.fmtRM(item.finalCommission)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-secondary)"
    }
  }, isPendingOnboarding(item) || !item.eff || !item.end ? "—" : `${item.eff} – ${item.end}`)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(MFCommStatusBadge, {
    status: item.commissionStatus
  }))))))), rows.length > 0 && /*#__PURE__*/React.createElement(HPager, {
    page: page,
    perPage: perPage,
    total: rows.length,
    onPage: setPage,
    onPerPage: setPerPage
  }))), /*#__PURE__*/React.createElement(TrendBarChart, {
    data: history,
    title: "Commission History",
    subtitle: "Last 12 months",
    defaultMetric: "volume"
  }));
}

/* ─── MyFuel Commission Tab (root) ───────────────────────────── */
function MyFuelCommissionTab() {
  const MONTHS = ["Jun 2026", "May 2026", "Apr 2026", "Mar 2026", "Feb 2026", "Jan 2026", "Dec 2025", "Nov 2025", "Oct 2025"];
  const [drillRecord, setDrillRecord] = useMFC(null);
  const [month, setMonth] = useMFC("Jun 2026");
  const [salespersonQ, setSalespersonQ] = useMFC("");
  const [view, setView] = useMFC("all");
  const [page, setPage] = useMFC(1);
  const [perPage, setPerPage] = useMFC(10);
  const records = HC.MYFUEL_SALESPERSON_RECORDS || HC.MYFUEL_RECORDS || [];
  const filteredRecords = useMFM(() => {
    const q = salespersonQ.trim().toLowerCase();
    return records.filter(record => {
      const matchesMonth = !month || record.period === month;
      const matchesView = view === "all" || getRoleKey(record) === view;
      const matchesQuery = !q || getRecordName(record).toLowerCase().includes(q) || getRecordId(record).toLowerCase().includes(q);
      return matchesMonth && matchesView && matchesQuery;
    });
  }, [records, month, salespersonQ, view]);
  const pageData = filteredRecords.slice((page - 1) * perPage, page * perPage);
  const trendData = useMFM(() => getTrendWindow(HC.MYFUEL_ROLE_TREND || HC.MYFUEL_TREND || [], month), [month]);
  const exportRows = useMFM(() => filteredRecords.map(record => ({
    salesperson: getRecordName(record),
    salespersonId: getRecordId(record),
    role: getRoleLabel(record),
    spAccounts: record.spCount,
    totalVolume: record.totalLiters,
    kpiProgress: record.kpiPct,
    commission: record.commission,
    period: record.period
  })), [filteredRecords]);
  const onSearch = value => {
    setSalespersonQ(value);
    setPage(1);
  };
  const onViewChange = nextView => {
    setView(nextView);
    setPage(1);
  };
  const onMonthChange = nextMonth => {
    setMonth(nextMonth);
    setPage(1);
  };
  if (drillRecord) {
    return /*#__PURE__*/React.createElement(AgentCommissionDrilldown, {
      record: drillRecord,
      onBack: () => setDrillRecord(null)
    });
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    value: view,
    onChange: onViewChange,
    options: MYFUEL_VIEW_OPTIONS.map(o => ({
      value: o.key,
      label: o.label
    }))
  })), /*#__PURE__*/React.createElement(MyFuelKPIHeader, {
    view: view,
    records: filteredRecords,
    month: month
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(TrendBarChart, {
    data: trendData,
    title: "Commission Trend",
    subtitle: "Last 12 months · ending " + month,
    defaultMetric: "volume",
    icon: "bar_chart",
    view: view,
    stackedInAll: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "hac-toolbar",
    style: {
      marginTop: 20
    }
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
    placeholder: "Search Salesperson by name or ID",
    value: salespersonQ,
    onChange: e => onSearch(e.target.value)
  }), salespersonQ && /*#__PURE__*/React.createElement("button", {
    className: "hac-search-clear",
    onClick: () => onSearch("")
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "close",
    size: 16,
    color: "var(--fg-tertiary)"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "hm-month-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-month-label"
  }, "Month"), /*#__PURE__*/React.createElement("select", {
    className: "hm-month-select",
    value: month,
    onChange: e => onMonthChange(e.target.value)
  }, MONTHS.map(item => /*#__PURE__*/React.createElement("option", {
    key: item
  }, item)))))), /*#__PURE__*/React.createElement("div", {
    className: "hac-count",
    style: {
      marginBottom: 8
    }
  }, filteredRecords.length, " result", filteredRecords.length !== 1 ? "s" : ""), /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table",
    style: {
      minWidth: 900
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Salesperson"), /*#__PURE__*/React.createElement("th", null, "Role"), /*#__PURE__*/React.createElement("th", null, "SP Accounts"), /*#__PURE__*/React.createElement("th", null, "Total Volume (L)"), /*#__PURE__*/React.createElement("th", null, "KPI Progress"), /*#__PURE__*/React.createElement("th", null, "Final Commission"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, pageData.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 7,
    style: {
      textAlign: "center",
      padding: "24px 0",
      color: "var(--fg-tertiary)"
    }
  }, "No results found for the current filters.")) : pageData.map((record, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    onClick: () => setDrillRecord(record),
    style: {
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-main"
  }, getRecordName(record)), /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-sub"
  }, /*#__PURE__*/React.createElement("code", {
    className: "hac-code"
  }, getRecordId(record)))), /*#__PURE__*/React.createElement("td", null, getRoleLabel(record)), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, record.spCount), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono"
  }, record.totalLiters.toLocaleString()), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(KPIProgress, {
    pct: record.kpiPct,
    actual: record.attributedKpiVolume ?? record.totalLiters,
    target: record.kpiTarget,
    period: "Dec 1\u201331",
    phase: record.kpiPhase
  })), /*#__PURE__*/React.createElement("td", {
    className: "ml-mono",
    style: {
      fontWeight: 600,
      color: "var(--navy-800)"
    }
  }, HC.fmtRM(record.commission)), /*#__PURE__*/React.createElement("td", {
    className: "hm-view-cell"
  }, /*#__PURE__*/React.createElement(HIcon, {
    name: "chevron_right",
    size: 20,
    color: "var(--fg-tertiary)"
  }))))))), /*#__PURE__*/React.createElement(HPager, {
    page: page,
    perPage: perPage,
    total: filteredRecords.length,
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
