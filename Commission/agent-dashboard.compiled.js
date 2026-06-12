(function(){
// agent-dashboard.jsx — Agent Commission Dashboard view.
// Consumes a precomputed `model` from the app. Exports window.Dashboard.
const {
  useState: useStateD
} = React;
const KPIProgressMeta = window.KPIProgressMeta;
function gaugeStyle(pct) {
  const clamped = Math.max(0, Math.min(100, pct));
  const deg = clamped * 3.6;
  const col = KPIProgressMeta(pct).solid;
  return {
    background: `conic-gradient(${col} ${deg}deg, #E9E9E9 ${deg}deg 360deg)`
  };
}

// KPI tier segmented bar — mirrors the Host Agent Config SegmentedProgressView:
// 10 discrete cells tinted by progress bands, with ticks at the tier boundaries.
// Ascending zones {from,to,mult,tier,isFinal} derived from the KPI thresholds.
// The visual axis is capped at 100% even if achievement exceeds target.
function kpiSegZones() {
  const asc = [...AC.KPI.thresholds].sort((a, b) => a.min - b.min);
  const axisMax = 100;
  const zones = asc.map((t, i) => ({
    from: t.min,
    to: asc[i + 1] ? asc[i + 1].min : axisMax,
    mult: t.mult,
    tier: t.tier,
    isFinal: i === asc.length - 1
  }));
  return {
    zones,
    axisMax
  };
}
const segZoneOf = (pct, zones) => zones.find(z => pct >= z.from && pct < z.to) || zones[zones.length - 1];
const segRange = z => z.isFinal ? `≥ ${z.from}%` : `${z.from}%–${z.to}%`;
function KpiSegBar({
  pct
}) {
  const {
    zones,
    axisMax
  } = kpiSegZones();
  const CELLS = 10,
    STEP = axisMax / CELLS;
  const pos = p => Math.min(p, axisMax) / axisMax * 100;
  const ticks = zones.filter(z => z.from > 0).map(z => z.from);
  const finalZone = zones[zones.length - 1];
  const cells = Array.from({
    length: CELLS
  }, (_, i) => {
    const from = i * STEP;
    const sampled = segZoneOf(from + STEP / 2, zones) || {};
    const z = i === CELLS - 1 && (finalZone === null || finalZone === void 0 ? void 0 : finalZone.from) >= axisMax ? finalZone : sampled;
    const meta = KPIProgressMeta(from + STEP / 2);
    const reached = pct > from;
    return {
      bg: reached ? meta.solid : meta.fill,
      tier: z.tier,
      range: z.from != null ? segRange(z) : "",
      mult: z.mult
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "hac-kpiaxis",
    style: {
      marginTop: 4
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
  }, t, "%"))));
}
function KpiHero({
  m,
  visual
}) {
  const [calcOpen, setCalcOpen] = React.useState(false);
  const pct = m.achievementPct;
  const progressMeta = KPIProgressMeta(pct);
  const fillCol = progressMeta.solid;
  const head = /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-headrow"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-title"
  }, "KPI Progress \u2014 Evaluation ", AC.KPI.windowLabel), /*#__PURE__*/React.createElement("div", {
    className: "ml-tooltip-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-info-btn",
    tabIndex: 0
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 15
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-tooltip"
  }, "Evaluation is counted from 1 Dec \u2013 31 Dec 2026 and determines next year's commission multiplier"))), /*#__PURE__*/React.createElement(KpiTierChip, {
    mult: m.mult
  }));
  const nums = /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-nums"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Portfolio volume"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--navy-800)"
    }
  }, AC.fmtL(m.actual))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Target volume"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--navy-800)"
    }
  }, AC.fmtL(m.target))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Target achieved"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: progressMeta.solid,
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, pct.toFixed(1), "%"), progressMeta.isAchieved && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      lineHeight: 1
    }
  }, "\u2713"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Applied multiplier"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--navy-800)"
    }
  }, m.mult, "%")));
  const formulaInner = /*#__PURE__*/React.createElement("div", {
    className: "ml-formula"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-f-step"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Base Commission"), /*#__PURE__*/React.createElement("b", null, AC.fmtRM(m.summary.base)), /*#__PURE__*/React.createElement("span", {
    className: "ml-f-note"
  }, "\u03A3 volume \xD7 tier rate")), /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 14,
    color: "#999AA5"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ml-f-step"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "KPI multiplier"), /*#__PURE__*/React.createElement("b", null, m.mult, "%"), /*#__PURE__*/React.createElement("span", {
    className: "ml-f-note"
  }, m.note)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      color: "#999AA5",
      fontWeight: 600,
      lineHeight: 1,
      flexShrink: 0
    }
  }, "="), /*#__PURE__*/React.createElement("span", {
    className: "ml-f-step ml-f-total"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Commission"), /*#__PURE__*/React.createElement("b", {
    className: "ml-green"
  }, AC.fmtRM(m.summary.commission)), /*#__PURE__*/React.createElement("span", {
    className: "ml-f-note"
  }, "this month")));
  const calcCard = /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-calc-card"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-accordion-btn",
    onClick: () => setCalcOpen(v => !v)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: calcOpen ? "expand_less" : "expand_more",
    size: 16
  }), calcOpen ? "Hide calculation" : "View calculation"), /*#__PURE__*/React.createElement("div", {
    className: "ml-accordion-body " + (calcOpen ? "open" : "closed")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 14,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-calc-step"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Base Commission"), /*#__PURE__*/React.createElement("b", null, AC.fmtRM(m.summary.base)), /*#__PURE__*/React.createElement("span", {
    className: "ml-note"
  }, "\u03A3 volume \xD7 tier rate")), /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-calc-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-kpi-calc-op"
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-calc-step"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "KPI multiplier"), /*#__PURE__*/React.createElement("b", null, m.mult, "%"), /*#__PURE__*/React.createElement("span", {
    className: "ml-note"
  }, m.note))), /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-calc-divider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-calc-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-kpi-calc-op eq"
  }, "="), /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-calc-step ml-kpi-calc-total"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Commission this month"), /*#__PURE__*/React.createElement("b", null, AC.fmtRM(m.summary.commission)), /*#__PURE__*/React.createElement("span", {
    className: "ml-note"
  }, "provisional"))))));
  if (visual === "gauge") {
    return /*#__PURE__*/React.createElement("div", {
      className: "ml-kpi-hero"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ml-kpi-gauge"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ml-gauge",
      style: gaugeStyle(pct)
    }, /*#__PURE__*/React.createElement("div", {
      className: "ml-gauge-inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ml-gauge-pct"
    }, pct.toFixed(1), "%"), /*#__PURE__*/React.createElement("div", {
      className: "ml-gauge-cap"
    }, "achieved")))), /*#__PURE__*/React.createElement("div", {
      className: "ml-kpi-body"
    }, head, /*#__PURE__*/React.createElement("div", {
      className: "ml-kpi-bar"
    }, /*#__PURE__*/React.createElement("div", {
      className: "ml-kpi-fill",
      style: {
        width: Math.min(100, pct) + "%",
        background: fillCol
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "ml-kpi-target",
      style: {
        left: "100%"
      }
    })), nums, formulaInner));
  }

  // Track visual — single column, calculation below
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-hero col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-body"
  }, head, nums, /*#__PURE__*/React.createElement(KpiSegBar, {
    pct: pct
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-accordion-btn",
    onClick: () => setCalcOpen(v => !v)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: calcOpen ? "expand_less" : "expand_more",
    size: 16
  }), calcOpen ? "Hide calculation" : "View calculation"), /*#__PURE__*/React.createElement("div", {
    className: "ml-accordion-body " + (calcOpen ? "open" : "closed"),
    style: {
      width: "100%"
    }
  }, formulaInner)));
}
// Volume range for a tier, e.g. "45,001 L and above".
function tierRange(t) {
  const from = t.from.toLocaleString("en-US");
  if (t.to == null) return from + " L and above";
  return from + " – " + t.to.toLocaleString("en-US") + " L";
}

// Commission Tier — rate primary, tier secondary, range on hover.
function TierCell({
  r
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "ml-tooltip-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-stack ml-tier-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-tier-rate"
  }, AC.fmtRate(r.tier.rate)), /*#__PURE__*/React.createElement("span", {
    className: "ml-sub-xs"
  }, r.tier.label)), /*#__PURE__*/React.createElement("span", {
    className: "ml-tooltip"
  }, r.tier.label, " \xB7 ", tierRange(r.tier)));
}

// KPI Tier — applied multiplier primary; "New SP Account" sublabel for new/pending.
function KpiTierCell({
  r
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-stack"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-mult"
  }, r.appliedMult, "%"), /*#__PURE__*/React.createElement("span", {
    className: "ml-sub-xs"
  }, r.isException || r.pending ? "New SP Account" : "KPI tier"));
}

// Commission Validity — activation/validity only, never payout state.
function ValidityCell({
  r,
  expiring
}) {
  if (r.pending) {
    return /*#__PURE__*/React.createElement("div", {
      className: "ml-stack"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ml-validity-date"
    }, "Not active"), /*#__PURE__*/React.createElement(Badge, {
      kind: "pending"
    }, "Pending activation"));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-stack"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-validity-date"
  }, r.end), expiring ? /*#__PURE__*/React.createElement(Badge, {
    kind: "expire"
  }, "Expiring \u226460d") : /*#__PURE__*/React.createElement("span", {
    className: "ml-sub-xs"
  }, "Active window"));
}

// Month picker — drives the commission summary + SP table (not KPI).
// Mirrors the Host MyFuel Commission month selector (floating-label select).
function MonthSelect({
  history,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "hm-month-group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "hm-month-label"
  }, "Month"), /*#__PURE__*/React.createElement("select", {
    className: "hm-month-select",
    value: value,
    onChange: e => onChange(e.target.value)
  }, [...history].reverse().map(h => /*#__PURE__*/React.createElement("option", {
    key: h.key,
    value: h.key
  }, h.label))));
}
function TxnModal({
  row,
  monthLabel = "Dec 2026",
  onClose
}) {
  if (!row) return null;
  const n = 20;
  const per = Math.round(row.volume / n / 10) * 10;
  const allTxns = Array.from({
    length: n
  }).map((_, i) => {
    const vol = per + (i - 2) * 120;
    const amt = vol * row.tier.rate * (row.appliedMult / 100);
    return {
      date: `${String(1 + i).padStart(2, "0")} ${monthLabel}`,
      ref: `TXN-${row.sp.split("-")[0]}-${4810 + i}`,
      vol,
      amt
    };
  });
  const [modalPage, setModalPage] = React.useState(1);
  const [modalPerPage, setModalPerPage] = React.useState(5);
  const txns = allTxns.slice((modalPage - 1) * modalPerPage, modalPage * modalPerPage);
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-modal-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ml-modal-title"
  }, row.org), /*#__PURE__*/React.createElement("div", {
    className: "ml-modal-sub"
  }, row.sp, " \xB7 settled transactions \xB7 ", monthLabel)), /*#__PURE__*/React.createElement("button", {
    className: "ml-icon-btn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 20
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ml-modal-summary"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Volume"), /*#__PURE__*/React.createElement("b", null, AC.fmtL(row.volume))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Tier rate"), /*#__PURE__*/React.createElement("b", null, AC.fmtRate(row.tier.rate))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Multiplier"), /*#__PURE__*/React.createElement("b", null, row.appliedMult, "%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Commission"), /*#__PURE__*/React.createElement("b", {
    className: "ml-green"
  }, AC.fmtRM(row.commission)))), /*#__PURE__*/React.createElement("div", {
    className: "ml-modal-body"
  }, txns.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ml-txn-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-txn-card-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-txn-card-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Date"), /*#__PURE__*/React.createElement("span", {
    className: "ml-txn-value"
  }, t.date)), /*#__PURE__*/React.createElement("div", {
    className: "ml-txn-card-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Reference"), /*#__PURE__*/React.createElement("span", {
    className: "ml-txn-value ml-mono"
  }, t.ref))), /*#__PURE__*/React.createElement("div", {
    className: "ml-txn-card-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-txn-card-cell"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Volume"), /*#__PURE__*/React.createElement("span", {
    className: "ml-txn-value"
  }, AC.fmtL(t.vol))), /*#__PURE__*/React.createElement("div", {
    className: "ml-txn-card-cell",
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Commission"), /*#__PURE__*/React.createElement("span", {
    className: "ml-txn-value ml-green"
  }, AC.fmtRM(t.amt))))))), /*#__PURE__*/React.createElement("div", {
    className: "ml-modal-pager"
  }, /*#__PURE__*/React.createElement(Pager, {
    page: modalPage,
    perPage: modalPerPage,
    total: allTxns.length,
    onPage: setModalPage,
    onPerPage: v => {
      setModalPerPage(v);
      setModalPage(1);
    },
    perPageOptions: [5, 10, 20]
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-modal-foot"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 15,
    color: "#999AA5"
  }), " Commission is calculated on confirmed (settled) Petron transactions only.")));
}

// SP Account label — org name (primary), SP number with Petron mark (secondary).
function SpAccountCell({
  r
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-main"
  }, r.org), /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-id ml-sp-id"
  }, /*#__PURE__*/React.createElement(PetronLogo, {
    size: 14
  }), r.sp));
}
function Dashboard({
  model,
  history,
  t
}) {
  const [drawer, setDrawer] = useStateD(null);
  const [spPage, setSpPage] = useStateD(1);
  const [spPerPage, setSpPerPage] = useStateD(10);
  // Month filter — defaults to the latest month; drives summary + SP table only.
  const [monthKey, setMonthKey] = useStateD(history[history.length - 1].key);
  const month = history.find(h => h.key === monthKey) || history[history.length - 1];
  const expiring = t.timeMachine === "dec2028";
  const m = model; // KPI Progress stays on the live evaluation model (not month-filtered)
  const spRows = month.rows.slice((spPage - 1) * spPerPage, spPage * spPerPage);
  const onMonth = k => {
    setMonthKey(k);
    setSpPage(1);
  };
  const cardsCls = month.newCount > 0 ? "ml-cards4" : "ml-cards3";
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-view"
  }, /*#__PURE__*/React.createElement(KpiHero, {
    m: m,
    visual: t.kpiVisual
  }), /*#__PURE__*/React.createElement("div", {
    className: "ml-month-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-month-head-title"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "payments",
    size: 18,
    color: "#00AA4F"
  }), /*#__PURE__*/React.createElement("span", null, "Commission Overview")), /*#__PURE__*/React.createElement(MonthSelect, {
    history: history,
    value: monthKey,
    onChange: onMonth
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-row " + cardsCls
  }, /*#__PURE__*/React.createElement(SummaryCard, {
    icon: "payments",
    title: "Total Commission",
    sub: month.label + " · provisional",
    value: AC.fmtRM(month.summary.commission)
  }), /*#__PURE__*/React.createElement(SummaryCard, {
    icon: "local_gas_station",
    title: "Total Volume",
    sub: "MyFuel · " + month.label,
    value: AC.fmtL(month.volume)
  }), /*#__PURE__*/React.createElement(SummaryCard, {
    icon: "account_balance",
    title: "Active SP Accounts",
    sub: "Transacting this month",
    value: String(month.activeCount)
  }), month.newCount > 0 && /*#__PURE__*/React.createElement(SummaryCard, {
    icon: "fiber_new",
    title: "New SP Accounts",
    sub: "Activated this month",
    value: String(month.newCount),
    accent: "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-month-head",
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-month-head-title"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "receipt_long",
    size: 18,
    color: "#00AA4F"
  }), /*#__PURE__*/React.createElement("span", null, "Commission by SP Account")), /*#__PURE__*/React.createElement("span", {
    className: "ml-synced"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sync",
    size: 14,
    color: "#999AA5"
  }), " Last synced ", AC.AGENT.lastSync)), /*#__PURE__*/React.createElement("div", {
    className: "hac-count",
    style: {
      marginBottom: 8
    }
  }, month.rows.length, " SP account", month.rows.length !== 1 ? "s" : "", " \xB7 ", month.label), /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap ml-desk-only"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      minWidth: 240
    }
  }, "SP Account"), /*#__PURE__*/React.createElement("th", null, "Volume"), /*#__PURE__*/React.createElement("th", null, "Commission Tier"), /*#__PURE__*/React.createElement("th", null, "Base Commission"), /*#__PURE__*/React.createElement("th", null, "KPI Tier"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Final Commission"), /*#__PURE__*/React.createElement("th", null, "Commission Validity"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 40
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, spRows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.sp,
    onClick: () => setDrawer(r)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(SpAccountCell, {
    r: r
  })), /*#__PURE__*/React.createElement("td", null, AC.fmtL(r.volume)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(TierCell, {
    r: r
  })), /*#__PURE__*/React.createElement("td", null, AC.fmtRM(r.base)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(KpiTierCell, {
    r: r
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement(CurrencyPill, null, AC.fmtRM(r.commission))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(ValidityCell, {
    r: r,
    expiring: expiring && r.end.includes("2028")
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron_right",
    size: 18,
    color: "#BBBBBB"
  }))))))), /*#__PURE__*/React.createElement(Pager, {
    page: spPage,
    perPage: spPerPage,
    total: month.rows.length,
    onPage: setSpPage,
    onPerPage: v => {
      setSpPerPage(v);
      setSpPage(1);
    },
    perPageOptions: [10, 50, 100]
  }), /*#__PURE__*/React.createElement("div", {
    className: "ml-sp-mob"
  }, spRows.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.sp,
    className: "ml-sp-mob-card",
    onClick: () => setDrawer(r)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-sp-mob-head"
  }, /*#__PURE__*/React.createElement(SpAccountCell, {
    r: r
  }), /*#__PURE__*/React.createElement(CurrencyPill, null, AC.fmtRM(r.commission))), /*#__PURE__*/React.createElement("div", {
    className: "ml-sp-mob-metas"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Volume"), /*#__PURE__*/React.createElement("b", null, AC.fmtL(r.volume))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Commission Tier"), /*#__PURE__*/React.createElement("b", null, AC.fmtRate(r.tier.rate)), /*#__PURE__*/React.createElement("span", {
    className: "ml-sub-xs",
    style: {
      display: "block"
    }
  }, r.tier.label)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Base Commission"), /*#__PURE__*/React.createElement("b", null, AC.fmtRM(r.base))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "KPI Tier"), /*#__PURE__*/React.createElement("b", null, r.appliedMult, "%"), (r.isException || r.pending) && /*#__PURE__*/React.createElement("span", {
    className: "ml-sub-xs",
    style: {
      display: "block"
    }
  }, "New SP Account")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Final Commission"), /*#__PURE__*/React.createElement("b", {
    className: "ml-green"
  }, AC.fmtRM(r.commission)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-tertiary)",
      paddingTop: 4
    }
  }, month.activeCount, " accounts \xB7 actual \xD7 KPI ", month.mult, "% = ", /*#__PURE__*/React.createElement("b", {
    className: "ml-green"
  }, AC.fmtRM(month.summary.commission))), /*#__PURE__*/React.createElement(Pager, {
    page: spPage,
    perPage: spPerPage,
    total: month.rows.length,
    onPage: setSpPage,
    onPerPage: v => {
      setSpPerPage(v);
      setSpPage(1);
    },
    perPageOptions: [10, 50, 100]
  })), /*#__PURE__*/React.createElement(TxnModal, {
    row: drawer,
    monthLabel: month.label,
    onClose: () => setDrawer(null)
  }));
}
Object.assign(window, {
  Dashboard
});
})();
