// agent-app.jsx — Agent portal root: state, view switch, tweaks, mount.

const AC_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
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
  const [t, setTweak] = useTweaks(AC_TWEAK_DEFAULTS);
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

        {view === "dashboard" ? <Dashboard model={model} t={t} /> : <History history={history} />}

        <div className="ml-footer-note">
          MyLorry · Agent Portal — Commission (Phase 1 prototype). Figures are provisional until the 4th-of-month rebate run settles. Payout requests are out of scope for V1.
        </div>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="KPI scenario (what-if)" />
        <TweakRadio label="Outcome" value={t.kpiScenario}
          options={[{value:"hit",label:"On target"},{value:"partial",label:"Partial"},{value:"missed",label:"Below"}]}
          onChange={(v) => setTweak("kpiScenario", v)} />
        <div className="twk-hint">Same usage, different target → different multiplier &amp; payout.</div>

        <TweakSection label="KPI visual" />
        <TweakRadio label="Style" value={t.kpiVisual}
          options={[{value:"track",label:"Tier track"},{value:"gauge",label:"Gauge"}]}
          onChange={(v) => setTweak("kpiVisual", v)} />

        <TweakSection label="Rules" />
        <TweakToggle label="New-org exception" value={t.newOrgException}
          onChange={(v) => setTweak("newOrgException", v)} />
        <TweakRadio label="Validity demo" value={t.timeMachine}
          options={[{value:"dec2026",label:"Dec 2026"},{value:"dec2028",label:"Dec 2028"}]}
          onChange={(v) => setTweak("timeMachine", v)} />

        <TweakSection label="Display" />
        <TweakRadio label="Density" value={t.density}
          options={[{value:"regular",label:"Regular"},{value:"compact",label:"Compact"}]}
          onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AgentApp />);
