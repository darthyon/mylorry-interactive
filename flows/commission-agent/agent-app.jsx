// agent-app.jsx — Agent portal root: state, view switch, mount.

// Static review configuration (was the tweaks-panel defaults).
const AC_CONFIG = /*EDITMODE-BEGIN*/{
  "kpiScenario": "hit",
  "kpiVisual": "track",
  "newOrgException": true,
  "timeMachine": "dec2026",
  "density": "regular"
}/*EDITMODE-END*/;

function buildModel(t) {
  const orgs = AC.ORGS.map((o) => ({ ...o, exception: t.newOrgException ? o.exception : null }));
  const scen = AC.KPI.scenarios[t.kpiScenario] || AC.KPI.scenarios.hit;
  const actual = AC.portfolioVolume(orgs);
  const achievementPct = (actual / scen.target) * 100;
  const th = AC.multiplierFor(achievementPct);
  const rows = AC.compute(orgs, th.mult);
  const summary = AC.summarise(rows);
  return { scenario: t.kpiScenario, target: scen.target, actual, achievementPct,
    mult: th.mult, tier: th.tier, note: th.note, rows, summary };
}

function AgentApp() {
  const t = AC_CONFIG;
  const [view, setView] = React.useState("dashboard");
  const model = buildModel(t);
  const history = React.useMemo(() => AC.buildHistory(), []);

  return (
    <div className={"ml-app density-" + t.density}>
      <TopBar />
      <Sidebar active="commission" onNav={() => {}} />

      <main className="ml-main">
        <div className="ml-page-head">
          <div>
            <h1 className="ml-h1">Commission</h1>
          </div>
          <div className="ml-page-head-right">
            <span className="ml-synced"><Icon name="sync" size={14} color="#999AA5" /> Synced {AC.AGENT.lastSync}</span>
            <ExportMenu />
          </div>
        </div>

        <div className="ml-tabs">
          <button className={"ml-tab" + (view === "dashboard" ? " active" : "")} onClick={() => setView("dashboard")}>
            <Icon name="dashboard" size={18} /> Dashboard
          </button>
          <button className={"ml-tab" + (view === "history" ? " active" : "")} onClick={() => setView("history")}>
            <Icon name="history" size={18} /> History
          </button>
        </div>

        {view === "dashboard" ? <Dashboard model={model} history={history} t={t} /> : <History history={history} />}

      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AgentApp />);
