(function(){
// shared-shell.jsx — Shared shell components for both Agent and Host portals.
// Exposes: Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu,
//   CurrencyPill, SummaryCard, KpiTierChip, AccountStatusBadge, KPIProgress.
// Portal-specific shell files (agent-shell.jsx, host-shell.jsx) import from here
// and re-export with their own names and nav configs.

const {
  useState
} = React;

/* ─── Icon ─────────────────────────────────────────────────── */
function Icon({
  name,
  size = 20,
  fill = 0,
  color,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "msr",
    style: {
      fontSize: size,
      fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      color,
      ...style
    }
  }, name);
}

/* ─── TopBar ─────────────────────────────────────────────────── */
function TopBar() {
  return /*#__PURE__*/React.createElement("header", {
    className: "ml-topbar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-burger",
    "aria-label": "Menu"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "menu",
    size: 22,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-topbar-brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-logo"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-logo-mark"
  }, "MY"), /*#__PURE__*/React.createElement("span", {
    className: "ml-logo-word"
  }, "LORRY"), /*#__PURE__*/React.createElement("span", {
    className: "ml-logo-ai"
  }, ".ai")), /*#__PURE__*/React.createElement("div", {
    className: "ml-topbar-tag"
  }, "More Safety \xB7 More Savings \xB7 More Earnings")));
}

/* ─── Sidebar (generic) ─────────────────────────────────────── */
function Sidebar({
  active,
  onNav,
  navItems,
  badgeLabel
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "ml-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-sidebar-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-side-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-avatar-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-avatar"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "person",
    size: 18,
    fill: 1,
    color: "#94A8B2"
  })), /*#__PURE__*/React.createElement("span", {
    className: "ml-avatar-badge"
  }, badgeLabel)), /*#__PURE__*/React.createElement("div", {
    className: "ml-side-divider"
  }), /*#__PURE__*/React.createElement("nav", {
    className: "ml-nav"
  }, navItems.map((n, i) => n.key === "__div__" ? /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ml-side-divider",
    style: {
      margin: "4px 0"
    }
  }) : /*#__PURE__*/React.createElement("button", {
    key: n.key,
    className: "ml-nav-item" + (n.key === active ? " active" : ""),
    onClick: () => onNav && onNav(n.key),
    title: n.label
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n.icon,
    size: 23,
    fill: n.key === active ? 1 : 0
  }), /*#__PURE__*/React.createElement("span", null, n.label))))), /*#__PURE__*/React.createElement("div", {
    className: "ml-side-bottom"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-side-divider"
  }), /*#__PURE__*/React.createElement("button", {
    className: "ml-nav-item",
    title: "Settings"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 23
  }), /*#__PURE__*/React.createElement("span", null, "Settings")))));
}

/* ─── Badge ─────────────────────────────────────────────────── */
function Badge({
  kind = "active",
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "ml-badge " + kind
  }, children);
}

/* ─── Pager ─────────────────────────────────────────────────── */
function Pager({
  page,
  perPage,
  total,
  onPage,
  onPerPage,
  perPageOptions = [10, 50, 100]
}) {
  const totalPages = Math.ceil(total / perPage);
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-pager"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-pager-rpp"
  }, /*#__PURE__*/React.createElement("span", null, "Rows per page:"), /*#__PURE__*/React.createElement("select", {
    className: "ml-pager-sel",
    value: perPage,
    onChange: e => {
      onPerPage(Number(e.target.value));
      onPage(1);
    }
  }, perPageOptions.map(n => /*#__PURE__*/React.createElement("option", {
    key: n,
    value: n
  }, n)))), /*#__PURE__*/React.createElement("div", {
    className: "ml-pager-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-pager-range"
  }, start, "\u2013", end, " of ", total), /*#__PURE__*/React.createElement("div", {
    className: "ml-pager-nav"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-pager-btn",
    disabled: page <= 1,
    onClick: () => onPage(page - 1)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron_left",
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    className: "ml-pager-btn",
    disabled: page >= totalPages || total === 0,
    onClick: () => onPage(page + 1)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron_right",
    size: 18
  })))));
}

/* ─── CardHead ──────────────────────────────────────────────── */
function CardHead({
  icon,
  title,
  sub,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-cardhead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-cardhead-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-stat-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ml-cardhead-title"
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    className: "ml-cardhead-sub"
  }, sub))), right);
}

/* ─── ExportMenu ────────────────────────────────────────────── */
function ExportMenu({
  comingSoon = false
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const pick = label => {
    setOpen(false);
    setToast(label);
    setTimeout(() => setToast(null), 2200);
  };
  if (comingSoon) {
    return /*#__PURE__*/React.createElement("div", {
      className: "ml-export",
      style: {
        position: "relative"
      },
      title: "Coming soon"
    }, /*#__PURE__*/React.createElement("button", {
      className: "ml-btn-soft",
      disabled: true,
      style: {
        opacity: 0.5,
        cursor: "not-allowed"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 18
    }), " Export ", /*#__PURE__*/React.createElement(Icon, {
      name: "expand_more",
      size: 16
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: "calc(100% + 4px)",
        right: 0,
        fontSize: 11,
        color: "var(--fg-tertiary)",
        whiteSpace: "nowrap",
        background: "var(--bg-hover)",
        padding: "2px 8px",
        borderRadius: 4
      }
    }, "Coming soon"));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-export"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-btn-soft",
    onClick: () => setOpen(v => !v)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 18
  }), " Export ", /*#__PURE__*/React.createElement(Icon, {
    name: "expand_more",
    size: 16
  })), open && /*#__PURE__*/React.createElement("div", {
    className: "ml-menu"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-menu-item",
    onClick: () => pick("Downloading PDF…")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "picture_as_pdf",
    size: 18
  }), " Download PDF"), /*#__PURE__*/React.createElement("div", {
    className: "ml-menu-item",
    onClick: () => pick("Exporting Excel…")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "table_chart",
    size: 18
  }), " Export Excel")), toast && /*#__PURE__*/React.createElement("div", {
    className: "ml-toast"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check_circle",
    size: 16,
    color: "#00AA4F"
  }), " ", toast));
}

/* ─── Pill ──────────────────────────────────────────────────── */
function Pill({
  tone = "navy",
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "ml-pill ml-pill-" + tone
  }, children);
}

/* ─── CurrencyPill ──────────────────────────────────────────── */
function CurrencyPill({
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "ml-currency-pill"
  }, children);
}

/* ─── SummaryCard ───────────────────────────────────────────── */
function SummaryCard({
  icon,
  title,
  sub,
  value,
  trend,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-stat-a"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-stat-a-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-stat-a-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-stat-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    color: accent || "#00AA4F"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ml-stat-a-title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "ml-stat-a-sub"
  }, sub)))), /*#__PURE__*/React.createElement("div", {
    className: "ml-stat-a-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-stat-a-value"
  }, value), trend && /*#__PURE__*/React.createElement("span", {
    className: "ml-trend " + (trend.dir === "up" ? "up" : "down")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: trend.dir === "up" ? "trending_up" : "trending_down",
    size: 14
  }), " ", trend.val)));
}

/* ─── KPI Tier Chip ─────────────────────────────────────────── */
function KpiTierChip({
  mult
}) {
  const tone = mult >= 100 ? "good" : mult >= 50 ? "mid" : "bad";
  const label = mult >= 100 ? "Tier 1 · 100%" : mult >= 50 ? "Tier 2 · 50%" : "Tier 3 · 0%";
  return /*#__PURE__*/React.createElement("span", {
    className: "ml-tierchip " + tone
  }, label);
}

/* ─── Account Status Badge ──────────────────────────────────── */
const ACCOUNT_STATUS_META = {
  active: {
    label: "Active",
    cls: "acct-active"
  },
  inactive: {
    label: "Inactive",
    cls: "acct-inactive"
  },
  suspended: {
    label: "Suspended",
    cls: "acct-suspended"
  },
  terminated: {
    label: "Terminated",
    cls: "acct-terminated"
  }
};
function AccountStatusBadge({
  status = "active",
  prefix
}) {
  const m = ACCOUNT_STATUS_META[status] || ACCOUNT_STATUS_META.active;
  return /*#__PURE__*/React.createElement("span", {
    className: "ml-badge " + m.cls
  }, prefix || "", m.label);
}

/* ─── KPI Progress: bar + percentage + hover tooltip ────────── */
function KPIProgress({
  pct,
  actual,
  target,
  period,
  commissionLabel
}) {
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState({
    top: 0,
    left: 0
  });
  const ref = React.useRef(null);
  const col = pct >= 75 ? "var(--green-500)" : "var(--red-400)";
  const show = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({
        top: r.top - 8,
        left: r.left + r.width / 2
      });
    }
    setHover(true);
  };
  let tip = `${(actual ?? 0).toLocaleString("en-US")} L / ${(target ?? 0).toLocaleString("en-US")} L target · ${period || ""}`;
  if (commissionLabel) tip += ` · ${commissionLabel}`;
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: "ml-kpi-prog",
    onMouseEnter: show,
    onMouseLeave: () => setHover(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-fill",
    style: {
      width: Math.min(pct, 100) + "%",
      background: col
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "ml-kpi-pct",
    style: {
      color: col
    }
  }, pct, "%"), hover && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    className: "ml-kpi-tip",
    style: {
      top: pos.top,
      left: pos.left
    }
  }, tip), document.body));
}

/* ─── Petron provider logo mark ─────────────────────────────── */
// Petron brand mark — navy square with the red double-swoosh. Approximated as
// inline SVG (no licensed asset in repo) for the single fuel provider (MyFuel).
function PetronLogo({
  size = 16
}) {
  return /*#__PURE__*/React.createElement("svg", {
    className: "ml-petron-logo",
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    role: "img",
    "aria-label": "Petron",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("rect", {
    width: "32",
    height: "32",
    rx: "5",
    fill: "#0A2472"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#ED1C24",
    d: "M5.5 27c2.6-7.4 8.8-7.7 12.1-10.6 2.4-2.1 3.1-4.6 3.4-7.4-1.6 3.9-4.7 5-8 6.2C8.9 16.7 6.4 19.7 5.5 27z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#ED1C24",
    d: "M13 26.5c2.2-6 7.7-6.6 10.8-9.2 2.6-2.2 3.4-5.2 3.7-9.3-1.2 4.6-3.9 6.3-7.5 7.9-3.6 1.6-6.2 4.4-7 10.6z"
  }));
}

/* ─── Export to window ─────────────────────────────────────── */
window.SharedShell = {
  Icon,
  TopBar,
  Sidebar,
  Badge,
  Pager,
  CardHead,
  ExportMenu,
  Pill,
  CurrencyPill,
  SummaryCard,
  KpiTierChip,
  AccountStatusBadge,
  KPIProgress,
  PetronLogo
};
})();