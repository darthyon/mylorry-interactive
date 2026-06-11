(function(){
// agent-dashboard.jsx — Agent Commission Dashboard view.
// Consumes a precomputed `model` from the app. Exports window.Dashboard.
const {
  useState: useStateD
} = React;
function gaugeStyle(pct) {
  const clamped = Math.max(0, Math.min(100, pct));
  const deg = clamped * 3.6;
  const col = pct >= 100 ? "#00AA4F" : pct >= 75 ? "#0081AA" : "#FF7476";
  return {
    background: `conic-gradient(${col} ${deg}deg, #E9E9E9 ${deg}deg 360deg)`
  };
}

// KPI tier threshold track (recommended) — shows the three bands, the 75% / 100%
// thresholds, and a marker for where the agent currently sits.
const TT_MAX = 125;
function TierTrack({
  pct
}) {
  const [tipZone, setTipZone] = React.useState(null);
  const pos = Math.min(pct, TT_MAX) / TT_MAX * 100;
  const markCol = pct >= 100 ? "#00AA4F" : pct >= 75 ? "#0081AA" : "#D14B4D";
  const zones = [{
    key: "z3",
    cls: "z3",
    label: "Tier 3",
    detail: "<75% · 0%",
    width: 75 / TT_MAX * 100 + "%"
  }, {
    key: "z2",
    cls: "z2",
    label: "Tier 2",
    detail: "75–100% · 50%",
    width: 25 / TT_MAX * 100 + "%"
  }, {
    key: "z1",
    cls: "z1",
    label: "Tier 1",
    detail: "≥100% · 100%",
    width: 25 / TT_MAX * 100 + "%"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-tt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-tt-bar"
  }, zones.map(z => /*#__PURE__*/React.createElement("div", {
    key: z.key,
    className: "ml-tt-zone " + z.cls,
    style: {
      width: z.width
    },
    onClick: () => setTipZone(tipZone === z.key ? null : z.key)
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-tz-full"
  }, z.label, ": ", z.detail), /*#__PURE__*/React.createElement("span", {
    className: "ml-tz-short"
  }, z.label), tipZone === z.key && /*#__PURE__*/React.createElement("div", {
    className: "ml-tz-tip"
  }, z.detail))), /*#__PURE__*/React.createElement("div", {
    className: "ml-tt-marker",
    style: {
      left: pos + "%",
      borderColor: markCol
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-tt-flag",
    style: {
      background: markCol
    }
  }, pct.toFixed(1), "%"))), /*#__PURE__*/React.createElement("div", {
    className: "ml-tt-ticks"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      left: "0%"
    }
  }, "0%"), /*#__PURE__*/React.createElement("span", {
    style: {
      left: 75 / TT_MAX * 100 + "%"
    }
  }, "75%"), /*#__PURE__*/React.createElement("span", {
    style: {
      left: 100 / TT_MAX * 100 + "%"
    }
  }, "100%"), /*#__PURE__*/React.createElement("span", {
    style: {
      left: "100%"
    }
  }, TT_MAX, "%")));
}
function KpiHero({
  m,
  visual
}) {
  const [calcOpen, setCalcOpen] = React.useState(false);
  const pct = m.achievementPct;
  const fillCol = pct >= 100 ? "#00AA4F" : pct >= 75 ? "#0081AA" : "#FF7476";
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
    className: "ml-green"
  }, pct.toFixed(1), "%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Applied multiplier"), /*#__PURE__*/React.createElement("b", {
    className: "ml-green"
  }, m.mult, "%")));
  const formulaInner = /*#__PURE__*/React.createElement("div", {
    className: "ml-formula"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-f-step"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Base commission"), /*#__PURE__*/React.createElement("b", null, AC.fmtRM(m.summary.base)), /*#__PURE__*/React.createElement("span", {
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
  }, "Base commission"), /*#__PURE__*/React.createElement("b", null, AC.fmtRM(m.summary.base)), /*#__PURE__*/React.createElement("span", {
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
  }, head, nums, /*#__PURE__*/React.createElement(TierTrack, {
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
function ExceptionCell({
  r
}) {
  if (r.isException) {
    const label = r.exception.mode === "custom" ? `${r.exception.rate}% · custom` : `${r.exception.rate}% · auto`;
    return /*#__PURE__*/React.createElement("div", {
      className: "ml-stack"
    }, /*#__PURE__*/React.createElement(Badge, {
      kind: "new"
    }, "New org"), /*#__PURE__*/React.createElement("span", {
      className: "ml-sub-xs"
    }, label));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-stack"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-mult"
  }, r.appliedMult, "%"), /*#__PURE__*/React.createElement("span", {
    className: "ml-sub-xs"
  }, "KPI tier"));
}
function ValidityCell({
  r,
  expiring
}) {
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
function TxnModal({
  row,
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
      date: `${2 + i * 5} Dec 2026`,
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
  }, row.sp, " \xB7 settled transactions \xB7 Dec 2026")), /*#__PURE__*/React.createElement("button", {
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
function Dashboard({
  model,
  t
}) {
  const [drawer, setDrawer] = useStateD(null);
  const [spPage, setSpPage] = useStateD(1);
  const [spPerPage, setSpPerPage] = useStateD(10);
  const expiring = t.timeMachine === "dec2028";
  const m = model;
  const pct = m.achievementPct;
  const spRows = m.rows.slice((spPage - 1) * spPerPage, spPage * spPerPage);
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-view"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-row ml-cards3"
  }, /*#__PURE__*/React.createElement(SummaryCard, {
    icon: "payments",
    title: "Commission \xB7 This Month",
    sub: "Dec 2026 \xB7 provisional",
    value: AC.fmtRM(m.summary.commission),
    trend: {
      dir: "up",
      val: "8%"
    }
  }), /*#__PURE__*/React.createElement(SummaryCard, {
    icon: "local_gas_station",
    title: "Portfolio Volume",
    sub: "MTD \xB7 6 SP accounts",
    value: AC.fmtL(m.actual),
    trend: {
      dir: "up",
      val: "4%"
    }
  }), /*#__PURE__*/React.createElement(SummaryCard, {
    icon: "account_balance",
    title: "Active SP Accounts",
    sub: "Assigned to you",
    value: String(m.rows.length),
    accent: "#0081AA"
  })), /*#__PURE__*/React.createElement(KpiHero, {
    m: m,
    visual: t.kpiVisual
  }), /*#__PURE__*/React.createElement("div", {
    className: "ml-card"
  }, /*#__PURE__*/React.createElement(CardHead, {
    icon: "receipt_long",
    title: "Commission by SP Account",
    sub: "December 2026 \xB7 click a row for transaction detail",
    right: /*#__PURE__*/React.createElement("span", {
      className: "ml-synced"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sync",
      size: 14,
      color: "#999AA5"
    }), " Last synced ", AC.AGENT.lastSync)
  }), /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap ml-desk-only"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      minWidth: 220
    }
  }, "SP Account"), /*#__PURE__*/React.createElement("th", null, "Volume"), /*#__PURE__*/React.createElement("th", null, "Tier \xB7 rate"), /*#__PURE__*/React.createElement("th", null, "Base"), /*#__PURE__*/React.createElement("th", null, "Multiplier"), /*#__PURE__*/React.createElement("th", null, "Validity"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Commission"), /*#__PURE__*/React.createElement("th", {
    style: {
      width: 40
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, spRows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.sp,
    onClick: () => setDrawer(r)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-main"
  }, r.org), /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-id"
  }, r.sp)), /*#__PURE__*/React.createElement("td", null, AC.fmtL(r.volume)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-tier-tag t" + r.tier.id
  }, r.tier.label), /*#__PURE__*/React.createElement("div", {
    className: "ml-sub-xs"
  }, AC.fmtRate(r.tier.rate))), /*#__PURE__*/React.createElement("td", null, AC.fmtRM(r.base)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(ExceptionCell, {
    r: r
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(ValidityCell, {
    r: r,
    expiring: expiring && r.end.includes("2028")
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement(CurrencyPill, null, AC.fmtRM(r.commission))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron_right",
    size: 18,
    color: "#BBBBBB"
  }))))))), /*#__PURE__*/React.createElement(Pager, {
    page: spPage,
    perPage: spPerPage,
    total: m.rows.length,
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
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-main"
  }, r.org), /*#__PURE__*/React.createElement("div", {
    className: "ml-cell-id"
  }, r.sp)), /*#__PURE__*/React.createElement(CurrencyPill, null, AC.fmtRM(r.commission))), /*#__PURE__*/React.createElement("div", {
    className: "ml-sp-mob-metas"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Volume"), /*#__PURE__*/React.createElement("b", null, AC.fmtL(r.volume))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Tier \xB7 rate"), /*#__PURE__*/React.createElement("span", {
    className: "ml-tier-tag t" + r.tier.id,
    style: {
      display: "block",
      marginTop: 2
    }
  }, r.tier.label)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "Base"), /*#__PURE__*/React.createElement("b", null, AC.fmtRM(r.base)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--fg-tertiary)",
      paddingTop: 4
    }
  }, "Total ", m.rows.length, " accounts \xB7 base \xD7 KPI ", m.mult, "% = ", /*#__PURE__*/React.createElement("b", {
    className: "ml-green"
  }, AC.fmtRM(m.summary.commission))), /*#__PURE__*/React.createElement(Pager, {
    page: spPage,
    perPage: spPerPage,
    total: m.rows.length,
    onPage: setSpPage,
    onPerPage: v => {
      setSpPerPage(v);
      setSpPage(1);
    },
    perPageOptions: [10, 50, 100]
  }))), /*#__PURE__*/React.createElement(TxnModal, {
    row: drawer,
    onClose: () => setDrawer(null)
  }));
}
Object.assign(window, {
  Dashboard
});

})();
