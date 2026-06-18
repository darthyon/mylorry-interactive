(function () {
// agent-parts.jsx — Shared building blocks for the Agent Commission page:
// KPI hero, table cell renderers, and the transaction drill modal.
// Composed by agent-app.jsx + agent-statements.jsx via the window.* exports below.
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
const segMetaOf = z => KPIProgressMeta(z?.mult >= 100 ? 100 : z?.mult >= 50 ? 75 : 0);
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
    const z = i === CELLS - 1 && finalZone?.from >= axisMax ? finalZone : sampled;
    const meta = segMetaOf(z);
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
function CommissionThisMonthCard({
  m,
  selectedMonth,
  monthOptions,
  onMonthChange
}) {
  const [open, setOpen] = React.useState(false);
  const popRef = React.useRef(null);
  if (!m) return null;
  React.useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = event => {
      if (popRef.current && !popRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);
  const adjustmentsLabel = !m.hasAdjustments ? "None" : `${m.rows.filter(r => !!r.exception).length} SP account override${m.rows.filter(r => !!r.exception).length > 1 ? "s" : ""}`;
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-summary-card ml-summary-card-commission"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-summary-card-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-summary-card-head-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-stat-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "payments",
    size: 18,
    color: "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-summary-card-title"
  }, "Monthly Commission"), /*#__PURE__*/React.createElement("div", {
    className: "ml-tooltip-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-info-btn",
    tabIndex: 0
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 15
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-tooltip"
  }, "Final commission for the selected month after KPI multiplier and SP account adjustments."))), /*#__PURE__*/React.createElement("div", {
    className: "hm-month-group ml-card-month-group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "hm-month-label"
  }, "Month"), /*#__PURE__*/React.createElement("select", {
    className: "hm-month-select ml-card-month-select",
    value: selectedMonth,
    onChange: e => onMonthChange(e.target.value)
  }, monthOptions.map(month => /*#__PURE__*/React.createElement("option", {
    key: month,
    value: month
  }, month))))), /*#__PURE__*/React.createElement("div", {
    className: "ml-commission-amountblock"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-summary-card-value ml-green"
  }, AC.fmtRM(m.summary.commission)), /*#__PURE__*/React.createElement("div", {
    className: "ml-summary-card-meta"
  }, "Commission volume \xB7 ", AC.fmtL(m.actual))), /*#__PURE__*/React.createElement("div", {
    className: "ml-calc-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-btn-soft ml-btn-calc",
    type: "button",
    onClick: () => setOpen(v => !v)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "receipt_long",
    size: 18
  }), " View Calculation")), /*#__PURE__*/React.createElement("div", {
    className: "ml-calc-pop-wrap"
  }, open && /*#__PURE__*/React.createElement("div", {
    className: "ml-calc-pop",
    ref: popRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-calc-pop-title"
  }, "Calculation summary"), /*#__PURE__*/React.createElement("div", {
    className: "ml-calc-row"
  }, /*#__PURE__*/React.createElement("span", null, "Base commission"), /*#__PURE__*/React.createElement("b", null, AC.fmtRM(m.summary.base))), /*#__PURE__*/React.createElement("div", {
    className: "ml-calc-row"
  }, /*#__PURE__*/React.createElement("span", null, "Applied multiplier"), /*#__PURE__*/React.createElement("b", null, m.mult, "%")), /*#__PURE__*/React.createElement("div", {
    className: "ml-calc-row ml-calc-row-total"
  }, /*#__PURE__*/React.createElement("span", null, "Final commission"), /*#__PURE__*/React.createElement("b", {
    className: "ml-green"
  }, AC.fmtRM(m.summary.commission))))));
}
function KpiProgressCard({
  m
}) {
  if (!m) return null;
  const pct = m.achievementPct;
  const progressMeta = KPIProgressMeta(pct);
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-summary-card ml-summary-card-kpi"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-headrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-headcopy"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-stat-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "track_changes",
    size: 18,
    color: "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-title"
  }, "KPI Progress"), /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-period"
  }, "Evaluation period: ", AC.KPI.windowLabel), /*#__PURE__*/React.createElement("div", {
    className: "ml-tooltip-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-info-btn",
    tabIndex: 0
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 15
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-tooltip"
  }, "This period determines the KPI multiplier applied to commission."))), /*#__PURE__*/React.createElement(KpiTierChip, {
    mult: m.mult
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-nums"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-k"
  }, "KPI volume"), /*#__PURE__*/React.createElement("b", {
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
  }, "KPI progress"), /*#__PURE__*/React.createElement("b", {
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
  }, m.mult, "%"))), /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-progress-wrap"
  }, /*#__PURE__*/React.createElement(KpiSegBar, {
    pct: pct
  })));
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
  const sublabel = r.pending ? "New SP Account" : r.isException ? "Exception applied" : "KPI tier";
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-stack"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-mult"
  }, r.appliedMult, "%"), /*#__PURE__*/React.createElement("span", {
    className: "ml-sub-xs"
  }, sublabel));
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
    className: "ml-txn-card-cell"
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
Object.assign(window, {
  CommissionThisMonthCard,
  KpiProgressCard,
  TierCell,
  KpiTierCell,
  SpAccountCell,
  TxnModal
});
})();
