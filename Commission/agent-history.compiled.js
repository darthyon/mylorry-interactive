(function(){
// agent-history.jsx — Agent Commission History view. Exports window.History.
const {
  useState: useStateH
} = React;
function History({
  history
}) {
  const [open, setOpen] = useStateH("Dec 2026");
  const [page, setPage] = useStateH(1);
  const [perPage, setPerPage] = useStateH(10);
  const [nestedPage, setNestedPage] = useStateH({});
  const [nestedPerPage, setNestedPerPage] = useStateH({});
  const total = history.reduce((s, h) => s + h.commission, 0);
  const totalVol = history.reduce((s, h) => s + h.volume, 0);
  const maxC = Math.max(...history.map(h => h.commission));
  const sorted = [...history].reverse();
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);
  const getNestedPage = key => nestedPage[key] || 1;
  const getNestedPerPage = key => nestedPerPage[key] || 5;
  const setMonthNestedPage = (key, value) => setNestedPage(prev => ({
    ...prev,
    [key]: value
  }));
  const setMonthNestedPerPage = (key, value) => setNestedPerPage(prev => ({
    ...prev,
    [key]: value
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-view"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "1 1 220px",
      maxWidth: 400
    }
  }, /*#__PURE__*/React.createElement(SummaryCard, {
    icon: "summarize",
    title: "Commission \xB7 2026 YTD",
    sub: "Jan\u2013Dec 2026",
    value: AC.fmtRM(total),
    trend: {
      dir: "up",
      val: "12%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "1 1 220px",
      maxWidth: 400
    }
  }, /*#__PURE__*/React.createElement(SummaryCard, {
    icon: "local_gas_station",
    title: "Volume \xB7 2026 YTD",
    sub: "All SP accounts",
    value: AC.fmtL(totalVol)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "ml-card"
  }, /*#__PURE__*/React.createElement(CardHead, {
    icon: "bar_chart",
    title: "Monthly Commission",
    sub: "Last 12 months \xB7 2026"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ml-bars"
  }, history.map(h => /*#__PURE__*/React.createElement("div", {
    className: "ml-bar-col",
    key: h.key
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-bar",
    style: {
      height: h.commission / maxC * 100 + "%",
      opacity: h.index === 11 ? 0.5 : 1
    },
    title: AC.fmtRM(h.commission)
  }), /*#__PURE__*/React.createElement("span", {
    className: "ml-bar-x"
  }, h.month))))), /*#__PURE__*/React.createElement("div", {
    className: "ml-card"
  }, /*#__PURE__*/React.createElement(CardHead, {
    icon: "payments",
    title: "Commission Statements",
    sub: "One row per month \xB7 expand for per-SP breakdown",
    right: /*#__PURE__*/React.createElement(ExportMenu, null)
  }), /*#__PURE__*/React.createElement("div", {
    className: "ml-desk-tbl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-table-wrap"
  }, /*#__PURE__*/React.createElement("table", {
    className: "ml-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: 40
    }
  }), /*#__PURE__*/React.createElement("th", {
    style: {
      minWidth: 140
    }
  }, "Period"), /*#__PURE__*/React.createElement("th", null, "Volume"), /*#__PURE__*/React.createElement("th", null, "KPI Tier"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: "right"
    }
  }, "Commission"))), /*#__PURE__*/React.createElement("tbody", null, paginated.map(h => {
    const isOpen = open === h.key;
    const nestedPageValue = getNestedPage(h.key);
    const nestedPerPageValue = getNestedPerPage(h.key);
    const nestedRows = h.rows.slice((nestedPageValue - 1) * nestedPerPageValue, nestedPageValue * nestedPerPageValue);
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: h.key
    }, /*#__PURE__*/React.createElement("tr", {
      className: isOpen ? "ml-row-open" : "",
      onClick: () => {
        if (!isOpen && !nestedPage[h.key]) setMonthNestedPage(h.key, 1);
        setOpen(isOpen ? null : h.key);
      }
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(Icon, {
      name: isOpen ? "expand_more" : "chevron_right",
      size: 18,
      color: "#999AA5"
    })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("b", null, h.key)), /*#__PURE__*/React.createElement("td", null, AC.fmtL(h.volume)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
      className: "ml-mult"
    }, h.mult, "%")), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: "right"
      }
    }, /*#__PURE__*/React.createElement("b", null, AC.fmtRM(h.commission)))), isOpen && /*#__PURE__*/React.createElement("tr", {
      className: "ml-expand"
    }, /*#__PURE__*/React.createElement("td", null), /*#__PURE__*/React.createElement("td", {
      colSpan: 4
    }, /*#__PURE__*/React.createElement("div", {
      className: "ml-expand-inner"
    }, /*#__PURE__*/React.createElement("table", {
      className: "ml-subtable"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "SP Account"), /*#__PURE__*/React.createElement("th", null, "Volume"), /*#__PURE__*/React.createElement("th", null, "Commission Tier"), /*#__PURE__*/React.createElement("th", null, "Base Commission"), /*#__PURE__*/React.createElement("th", null, "KPI Tier"), /*#__PURE__*/React.createElement("th", {
      style: {
        textAlign: "right"
      }
    }, "Commission"))), /*#__PURE__*/React.createElement("tbody", null, nestedRows.map(r => /*#__PURE__*/React.createElement("tr", {
      key: r.sp
    }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "ml-cell-main"
    }, r.org), /*#__PURE__*/React.createElement("div", {
      className: "ml-cell-id"
    }, r.sp)), /*#__PURE__*/React.createElement("td", null, AC.fmtL(r.vol)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "ml-stack"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ml-tier-rate"
    }, AC.fmtRate(r.tier.rate)), /*#__PURE__*/React.createElement("span", {
      className: "ml-sub-xs"
    }, r.tier.label))), /*#__PURE__*/React.createElement("td", null, AC.fmtRM(r.base)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "ml-stack"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ml-mult"
    }, r.applied, "%"), /*#__PURE__*/React.createElement("span", {
      className: "ml-sub-xs"
    }, r.isException ? "New SP Account" : "KPI tier"))), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: "right"
      }
    }, AC.fmtRM(r.commission)))))), h.rows.length > nestedPerPageValue && /*#__PURE__*/React.createElement(Pager, {
      page: nestedPageValue,
      perPage: nestedPerPageValue,
      total: h.rows.length,
      onPage: value => setMonthNestedPage(h.key, value),
      onPerPage: value => {
        setMonthNestedPerPage(h.key, value);
        setMonthNestedPage(h.key, 1);
      },
      perPageOptions: [5, 10, 20]
    }), /*#__PURE__*/React.createElement("div", {
      className: "ml-expand-note"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 14,
      color: "#999AA5"
    }), "Grouped one row per SP account per month.")))));
  })))), /*#__PURE__*/React.createElement(Pager, {
    page: page,
    perPage: perPage,
    total: sorted.length,
    onPage: setPage,
    onPerPage: v => {
      setPerPage(v);
      setPage(1);
    },
    perPageOptions: [10, 50, 100]
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-hist-mob"
  }, paginated.map(h => {
    const isOpen = open === h.key;
    return /*#__PURE__*/React.createElement("div", {
      key: h.key,
      className: "ml-hist-mob-card",
      onClick: () => setOpen(isOpen ? null : h.key)
    }, /*#__PURE__*/React.createElement("div", {
      className: "ml-hist-mob-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 14,
        color: "var(--fg-primary)"
      }
    }, h.key), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        fontSize: 11,
        color: "var(--fg-tertiary)"
      }
    }, AC.fmtL(h.volume))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right"
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 15,
        color: "var(--green-600)"
      }
    }, AC.fmtRM(h.commission)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--fg-tertiary)",
        marginTop: 2
      }
    }, "KPI ", h.mult, "%"))), /*#__PURE__*/React.createElement("div", {
      className: "ml-hist-mob-metas"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ml-k"
    }, "Volume"), /*#__PURE__*/React.createElement("b", null, AC.fmtL(h.volume))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "ml-k"
    }, "Multiplier"), /*#__PURE__*/React.createElement("b", null, h.mult, "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: isOpen ? "expand_less" : "expand_more",
      size: 18,
      color: "#BBBBBB"
    }))), isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        borderTop: "1px solid var(--border-light)",
        paddingTop: 10,
        display: "flex",
        flexDirection: "column",
        gap: 0
      }
    }, h.rows.map(r => /*#__PURE__*/React.createElement("div", {
      key: r.sp,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "7px 0",
        borderBottom: "1px solid var(--bg-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 500,
        color: "var(--fg-primary)"
      }
    }, r.org), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--fg-tertiary)"
      }
    }, r.sp, " \xB7 ", AC.fmtL(r.vol))), /*#__PURE__*/React.createElement("b", {
      style: {
        fontSize: 13,
        color: "var(--fg-primary)",
        flexShrink: 0,
        marginLeft: 8
      }
    }, AC.fmtRM(r.commission))))));
  }), /*#__PURE__*/React.createElement(Pager, {
    page: page,
    perPage: perPage,
    total: sorted.length,
    onPage: setPage,
    onPerPage: v => {
      setPerPage(v);
      setPage(1);
    },
    perPageOptions: [10, 50, 100]
  }))));
}
Object.assign(window, {
  History
});
})();
