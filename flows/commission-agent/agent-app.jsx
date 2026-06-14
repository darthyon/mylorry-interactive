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
  const model = buildModel(t);
  const history = React.useMemo(() => AC.buildHistory(), []);
  const ytdCommission = history.reduce((s, h) => s + h.commission, 0);
  const ytdVolume = history.reduce((s, h) => s + h.volume, 0);
  const activeSp = history[history.length - 1].activeCount;
  const maxC = Math.max(...history.map((h) => h.commission));

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

        <div className="ml-view">
          {/* 1 — Live KPI progress (current standing, not month-filtered) */}
          <KpiHero m={model} visual={t.kpiVisual} />

          {/* 2 — Year-to-date summary */}
          <div className="ml-cards3">
            <SummaryCard icon="summarize" title="Commission · 2026 YTD" sub="Jan–Dec 2026"
              value={AC.fmtRM(ytdCommission)} trend={{ dir: "up", val: "12%" }} />
            <SummaryCard icon="local_gas_station" title="Volume · 2026 YTD" sub="All SP accounts"
              value={AC.fmtL(ytdVolume)} />
            <SummaryCard icon="account_balance" title="Active SP Accounts" sub="Transacting this month"
              value={String(activeSp)} />
          </div>

          {/* 3 — 12-month trend */}
          <div className="ml-card">
            <CardHead icon="bar_chart" title="Monthly Commission" sub="Last 12 months · 2026" />
            <div className="ml-bars">
              {history.map((h) => (
                <div className="ml-bar-col" key={h.key}>
                  <div className="ml-bar"
                    style={{ height: (h.commission / maxC * 100) + "%", opacity: h.index === 11 ? 0.5 : 1 }}
                    title={AC.fmtRM(h.commission)} />
                  <span className="ml-bar-x">{h.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 — Unified statements (By Month / By SP Account) */}
          <Statements history={history} />
        </div>

      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AgentApp />);
