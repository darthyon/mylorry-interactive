// referrer-app.jsx — Referrer portal root: state, view switch, mount.
const AC = window.RC;

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

function buildSelectedMonthModel(monthEntry, target) {
  if (!monthEntry) return null;
  const rows = monthEntry.rows.map((r) => ({ ...r, defaultMult: monthEntry.mult }));
  const summary = monthEntry.summary || AC.summarise(rows);
  const adjustment = rows.reduce((sum, r) => {
    if (!r.exception) return sum;
    return sum + (r.commission - (r.base * monthEntry.mult) / 100);
  }, 0);

  return {
    key: monthEntry.key,
    label: monthEntry.label,
    target,
    actual: monthEntry.volume,
    achievementPct: monthEntry.target > 0 ? (monthEntry.volume / monthEntry.target) * 100 : 0,
    mult: monthEntry.mult,
    tier: monthEntry.tier,
    note: monthEntry.note,
    rows,
    summary,
    adjustment,
    accountCount: rows.length,
    hasAdjustments: rows.some((r) => !!r.exception),
  };
}

function MonthlyCommissionChart({ history, maxC }) {
  const [hover, setHover] = React.useState(null);

  return (
    <div className="ml-bars">
      {history.map((h, index) => (
        <div
          className="ml-bar-col"
          key={h.key}
          onMouseEnter={() => setHover(index)}
          onMouseLeave={() => setHover(null)}
          onClick={() => setHover((current) => current === index ? null : index)}
        >
          <div className={"ml-bar-track" + (hover === index ? " active" : "")}>
            <div
              className={"ml-bar" + (hover === index ? " active" : "")}
              style={{ height: (h.commission / maxC * 100) + "%", opacity: h.index === 11 ? 0.5 : 1 }}
            />
            {hover === index && (
              <div className="ml-bar-tip">
                <div className="ml-bar-tip-val">{AC.fmtRM(h.commission)}</div>
                <div className="ml-bar-tip-period">{h.key}</div>
              </div>
            )}
          </div>
          <span className="ml-bar-x">{h.month}</span>
        </div>
      ))}
    </div>
  );
}

function ReferrerApp() {
  const t = AC_CONFIG;
  const model = buildModel(t);
  const history = React.useMemo(() => AC.buildHistory(), []);
  const ytdHistory = React.useMemo(() => history.filter((h) => h.year === 2026), [history]);
  const monthOptions = React.useMemo(() => [...history].reverse().map((h) => h.key), [history]);
  const [selectedMonth, setSelectedMonth] = React.useState(AC.HISTORY_META.defaultMonth);
  const ytdCommission = ytdHistory.reduce((s, h) => s + h.commission, 0);
  const ytdVolume = ytdHistory.reduce((s, h) => s + h.volume, 0);
  const activeSp = history[history.length - 1].activeCount;
  const maxC = Math.max(...history.map((h) => h.commission));
  const selectedMonthEntry = history.find((h) => h.key === selectedMonth) || history[history.length - 1];
  const monthModel = React.useMemo(
    () => buildSelectedMonthModel(selectedMonthEntry, model.target),
    [selectedMonthEntry, model.target],
  );
  const commissionTrend = ytdHistory.length > 1
    ? Math.round(((ytdHistory[ytdHistory.length - 1].commission - ytdHistory[0].commission) / ytdHistory[0].commission) * 100)
    : 0;

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
            <span className="ml-synced"><Icon name="sync" size={14} color="#999AA5" /> Synced {AC.REFERRER.lastSync}</span>
          </div>
        </div>

        <div className="ml-view">
          <div className="ml-top-grid">
            <CommissionThisMonthCard
              m={monthModel}
              selectedMonth={selectedMonth}
              monthOptions={monthOptions}
              onMonthChange={setSelectedMonth}
            />
            <KpiProgressCard m={model} />
          </div>

          <div className="ml-section-heading">Overview</div>
          <div className="ml-cards3">
            <SummaryCard icon="summarize" title="Commission YTD" sub={AC.HISTORY_META.overviewLabel}
              value={AC.fmtRM(ytdCommission)} trend={{ dir: commissionTrend >= 0 ? "up" : "down", val: Math.abs(commissionTrend) + "%" }} />
            <SummaryCard icon="local_gas_station" title="Volume YTD" sub="All SP accounts"
              value={AC.fmtL(ytdVolume)} />
            <SummaryCard icon="account_balance" title="Active SP Accounts" sub={AC.HISTORY_META.defaultMonth}
              value={String(activeSp)} />
          </div>

          <div className="ml-card">
            <CardHead icon="bar_chart" title="Commission History" sub={AC.HISTORY_META.historyLabel} />
            <MonthlyCommissionChart history={history} maxC={maxC} />
          </div>

          <Statements history={history} />
        </div>

      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ReferrerApp />);
