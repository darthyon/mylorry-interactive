(function(){
// agent-app.jsx — Agent portal root: state, view switch, tweaks, mount.

const AC_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "kpiScenario": "hit",
  "kpiVisual": "track",
  "newOrgException": true,
  "timeMachine": "dec2026",
  "density": "regular"
} /*EDITMODE-END*/;
function buildModel(t) {
  const orgs = AC.ORGS.map(o => ({
    ...o,
    exception: t.newOrgException ? o.exception : null
  }));
  const scen = AC.KPI.scenarios[t.kpiScenario] || AC.KPI.scenarios.hit;
  const actual = AC.portfolioVolume(orgs);
  const achievementPct = actual / scen.target * 100;
  const th = AC.multiplierFor(achievementPct);
  const rows = AC.compute(orgs, th.mult);
  const summary = AC.summarise(rows);
  return {
    scenario: t.kpiScenario,
    target: scen.target,
    actual,
    achievementPct,
    mult: th.mult,
    tier: th.tier,
    note: th.note,
    rows,
    summary
  };
}
function AgentApp() {
  const [t, setTweak] = useTweaks(AC_TWEAK_DEFAULTS);
  const [view, setView] = React.useState("dashboard");
  const model = buildModel(t);
  const history = React.useMemo(() => AC.buildHistory(), []);
  return /*#__PURE__*/React.createElement("div", {
    className: "ml-app density-" + t.density
  }, /*#__PURE__*/React.createElement(TopBar, null), /*#__PURE__*/React.createElement(Sidebar, {
    active: "commission",
    onNav: () => {}
  }), /*#__PURE__*/React.createElement("main", {
    className: "ml-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-page-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "ml-h1"
  }, "Commission")), /*#__PURE__*/React.createElement("div", {
    className: "ml-page-head-right"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ml-synced"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sync",
    size: 14,
    color: "#999AA5"
  }), " Synced ", AC.AGENT.lastSync), /*#__PURE__*/React.createElement(ExportMenu, null))), /*#__PURE__*/React.createElement("div", {
    className: "ml-tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: "ml-tab" + (view === "dashboard" ? " active" : ""),
    onClick: () => setView("dashboard")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "dashboard",
    size: 18
  }), " Dashboard"), /*#__PURE__*/React.createElement("button", {
    className: "ml-tab" + (view === "history" ? " active" : ""),
    onClick: () => setView("history")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "history",
    size: 18
  }), " History")), view === "dashboard" ? /*#__PURE__*/React.createElement(Dashboard, {
    model: model,
    t: t
  }) : /*#__PURE__*/React.createElement(History, {
    history: history
  }), /*#__PURE__*/React.createElement("div", {
    className: "ml-footer-note"
  }, "MyLorry \xB7 Agent Portal \u2014 Commission (Phase 1 prototype). Figures are provisional until the 4th-of-month rebate run settles. Payout requests are out of scope for V1.")), /*#__PURE__*/React.createElement(TweaksPanel, {
    title: "Tweaks"
  }, /*#__PURE__*/React.createElement(TweakSection, {
    label: "KPI scenario (what-if)"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Outcome",
    value: t.kpiScenario,
    options: [{
      value: "hit",
      label: "On target"
    }, {
      value: "partial",
      label: "Partial"
    }, {
      value: "missed",
      label: "Below"
    }],
    onChange: v => setTweak("kpiScenario", v)
  }), /*#__PURE__*/React.createElement("div", {
    className: "twk-hint"
  }, "Same usage, different target \u2192 different multiplier & payout."), /*#__PURE__*/React.createElement(TweakSection, {
    label: "KPI visual"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Style",
    value: t.kpiVisual,
    options: [{
      value: "track",
      label: "Tier track"
    }, {
      value: "gauge",
      label: "Gauge"
    }],
    onChange: v => setTweak("kpiVisual", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Rules"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "New-org exception",
    value: t.newOrgException,
    onChange: v => setTweak("newOrgException", v)
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Validity demo",
    value: t.timeMachine,
    options: [{
      value: "dec2026",
      label: "Dec 2026"
    }, {
      value: "dec2028",
      label: "Dec 2028"
    }],
    onChange: v => setTweak("timeMachine", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Display"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Density",
    value: t.density,
    options: [{
      value: "regular",
      label: "Regular"
    }, {
      value: "compact",
      label: "Compact"
    }],
    onChange: v => setTweak("density", v)
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(AgentApp, null));
})();
