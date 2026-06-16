// agent-statements.jsx — Unified Commission Statements with a By Month / By SP
// Account switch. Same 12-month data, two pivots. Exports window.Statements.
const { useState: useStateS } = React;

// Per-key pagination state helper (months expand to SPs, or SPs expand to months).
function useNestedPaging(defaultPer) {
  const [page, setPage] = useStateS({});
  const [per, setPer] = useStateS({});
  return {
    getPage: (k) => page[k] || 1,
    getPer: (k) => per[k] || defaultPer,
    setPage: (k, v) => setPage((p) => ({ ...p, [k]: v })),
    setPer: (k, v) => { setPer((p) => ({ ...p, [k]: v })); setPage((p) => ({ ...p, [k]: 1 })); },
  };
}

// Shared nested subtable row (one SP-or-month line, clickable → TxnModal drill).
function LeafRow({ periodCell, r, onDrill }) {
  return (
    <tr style={{ cursor: "pointer" }} onClick={() => onDrill(r)}>
      <td>{periodCell}</td>
      <td>{AC.fmtL(r.vol != null ? r.vol : r.volume)}</td>
      <td><TierCell r={r} /></td>
      <td>{AC.fmtRM(r.base)}</td>
      <td><KpiTierCell r={r} /></td>
      <td style={{ textAlign: "right" }}>{AC.fmtRM(r.commission)}</td>
      <td style={{ width: 32 }}><Icon name="chevron_right" size={16} color="#BBBBBB" /></td>
    </tr>
  );
}

function NestedHead({ first }) {
  return (
    <thead>
      <tr>
        <th>{first}</th><th>Volume</th>
        <th>Commission Tier</th><th>Base Commission</th>
        <th>KPI Multiplier</th>
        <th style={{ textAlign: "right" }}>Final Commission</th>
        <th style={{ width: 32 }}></th>
      </tr>
    </thead>
  );
}

// ── By Month: row per month → expand to per-SP breakdown ──────────────
function ByMonth({ history, open, setOpen, onDrill }) {
  const [page, setPage] = useStateS(1);
  const [perPage, setPerPage] = useStateS(10);
  const nest = useNestedPaging(5);
  const sorted = [...history].reverse();
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  return (
    <React.Fragment>
      {/* ── Desktop table ── */}
      <div className="ml-desk-tbl">
        <div className="ml-table-wrap">
          <table className="ml-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th style={{ minWidth: 140 }}>Period</th>
                <th>Volume</th>
                <th>KPI Multiplier</th>
                <th style={{ textAlign: "right" }}>Final Commission</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((h) => {
                const isOpen = open === h.key;
                const np = nest.getPage(h.key), npp = nest.getPer(h.key);
                const rows = h.rows.slice((np - 1) * npp, np * npp);
                return (
                  <React.Fragment key={h.key}>
                    <tr className={isOpen ? "ml-row-open" : ""} onClick={() => setOpen(isOpen ? null : h.key)}>
                      <td><Icon name={isOpen ? "expand_more" : "chevron_right"} size={18} color="#999AA5" /></td>
                      <td><b>{h.key}</b></td>
                      <td>{AC.fmtL(h.volume)}</td>
                      <td><span className="ml-mult">{h.mult}%</span></td>
                      <td style={{ textAlign: "right" }}><b>{AC.fmtRM(h.commission)}</b></td>
                    </tr>
                    {isOpen && (
                      <tr className="ml-expand">
                        <td></td>
                        <td colSpan={4}>
                          <div className="ml-expand-inner">
                            <table className="ml-subtable">
                              <NestedHead first="SP Account" />
                              <tbody>
                                {rows.map((r) => (
                                  <LeafRow key={r.sp} r={r} onDrill={() => onDrill(r, h.label)}
                                    periodCell={<SpAccountCell r={r} />} />
                                ))}
                              </tbody>
                            </table>
                            {h.rows.length > npp && (
                              <Pager page={np} perPage={npp} total={h.rows.length}
                                onPage={(v) => nest.setPage(h.key, v)}
                                onPerPage={(v) => nest.setPer(h.key, v)}
                                perPageOptions={[5, 10, 20]} />
                            )}
                            <div className="ml-expand-note">
                              <Icon name="info" size={14} color="#999AA5" />
                              One row per SP account · tap a row for settled transactions.
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pager page={page} perPage={perPage} total={sorted.length}
          onPage={setPage} onPerPage={(v) => { setPerPage(v); setPage(1); }}
          perPageOptions={[10, 50, 100]} />
      </div>

      {/* ── Mobile cards ── */}
      <div className="ml-hist-mob">
        {paginated.map((h) => {
          const isOpen = open === h.key;
          return (
            <div key={h.key} className="ml-hist-mob-card" onClick={() => setOpen(isOpen ? null : h.key)}>
              <div className="ml-hist-mob-head">
                <div>
                  <b style={{ fontSize: 14, color: "var(--fg-primary)" }}>{h.key}</b>
                  <div style={{ marginTop: 4, fontSize: 11, color: "var(--fg-tertiary)" }}>{AC.fmtL(h.volume)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <b style={{ fontSize: 15, color: "var(--green-600)" }}>{AC.fmtRM(h.commission)}</b>
                  <div style={{ fontSize: 11, color: "var(--fg-tertiary)", marginTop: 2 }}>KPI {h.mult}%</div>
                </div>
              </div>
              <div className="ml-hist-mob-metas">
                <div><span className="ml-k">Volume</span><b>{AC.fmtL(h.volume)}</b></div>
                <div><span className="ml-k">Multiplier</span><b>{h.mult}%</b></div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                  <Icon name={isOpen ? "expand_less" : "expand_more"} size={18} color="#BBBBBB" />
                </div>
              </div>
              {isOpen && (
                <div style={{ marginTop: 12, borderTop: "1px solid var(--border-light)", paddingTop: 10 }}>
                  {h.rows.map((r) => (
                    <div key={r.sp} onClick={(e) => { e.stopPropagation(); onDrill(r, h.label); }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "7px 0", borderBottom: "1px solid var(--bg-subtle)", cursor: "pointer" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-primary)" }}>{r.org}</div>
                        <div style={{ fontSize: 11, color: "var(--fg-tertiary)" }}>{r.sp} · {AC.fmtL(r.vol)}</div>
                      </div>
                      <b style={{ fontSize: 13, color: "var(--fg-primary)", flexShrink: 0, marginLeft: 8 }}>{AC.fmtRM(r.commission)}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <Pager page={page} perPage={perPage} total={sorted.length}
          onPage={setPage} onPerPage={(v) => { setPerPage(v); setPage(1); }}
          perPageOptions={[10, 50, 100]} />
      </div>
    </React.Fragment>
  );
}

// ── By SP Account: row per SP (YTD totals) → expand to per-month ───────
function BySp({ accounts, open, setOpen, onDrill }) {
  const [page, setPage] = useStateS(1);
  const [perPage, setPerPage] = useStateS(10);
  const nest = useNestedPaging(6);
  const paginated = accounts.slice((page - 1) * perPage, page * perPage);

  return (
    <React.Fragment>
      {/* ── Desktop table ── */}
      <div className="ml-desk-tbl">
        <div className="ml-table-wrap">
          <table className="ml-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th style={{ minWidth: 240 }}>SP Account</th>
                <th>Volume · YTD</th>
                <th>Commission Tier</th>
                <th style={{ textAlign: "right" }}>Final Commission · YTD</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((a) => {
                const isOpen = open === a.sp;
                const np = nest.getPage(a.sp), npp = nest.getPer(a.sp);
                const months = [...a.months].reverse().slice((np - 1) * npp, np * npp);
                return (
                  <React.Fragment key={a.sp}>
                    <tr className={isOpen ? "ml-row-open" : ""} onClick={() => setOpen(isOpen ? null : a.sp)}>
                      <td><Icon name={isOpen ? "expand_more" : "chevron_right"} size={18} color="#999AA5" /></td>
                      <td><SpAccountCell r={a} /></td>
                      <td>{AC.fmtL(a.volume)}</td>
                      <td><TierCell r={a} /></td>
                      <td style={{ textAlign: "right" }}><b>{AC.fmtRM(a.commission)}</b></td>
                    </tr>
                    {isOpen && (
                      <tr className="ml-expand">
                        <td></td>
                        <td colSpan={4}>
                          <div className="ml-expand-inner">
                            <table className="ml-subtable">
                              <NestedHead first="Period" />
                              <tbody>
                                {months.map((m) => (
                                  <LeafRow key={m.key} r={m} onDrill={() => onDrill(m, m.label)}
                                    periodCell={<b>{m.key}</b>} />
                                ))}
                              </tbody>
                            </table>
                            {a.months.length > npp && (
                              <Pager page={np} perPage={npp} total={a.months.length}
                                onPage={(v) => nest.setPage(a.sp, v)}
                                onPerPage={(v) => nest.setPer(a.sp, v)}
                                perPageOptions={[6, 12]} />
                            )}
                            <div className="ml-expand-note">
                              <Icon name="info" size={14} color="#999AA5" />
                              One row per month · tap a row for settled transactions.
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pager page={page} perPage={perPage} total={accounts.length}
          onPage={setPage} onPerPage={(v) => { setPerPage(v); setPage(1); }}
          perPageOptions={[10, 50, 100]} />
      </div>

      {/* ── Mobile cards ── */}
      <div className="ml-hist-mob">
        {paginated.map((a) => {
          const isOpen = open === a.sp;
          return (
            <div key={a.sp} className="ml-hist-mob-card" onClick={() => setOpen(isOpen ? null : a.sp)}>
              <div className="ml-hist-mob-head">
                <div>
                  <b style={{ fontSize: 14, color: "var(--fg-primary)" }}>{a.org}</b>
                  <div style={{ marginTop: 4, fontSize: 11, color: "var(--fg-tertiary)" }}>{a.sp}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <b style={{ fontSize: 15, color: "var(--green-600)" }}>{AC.fmtRM(a.commission)}</b>
                  <div style={{ fontSize: 11, color: "var(--fg-tertiary)", marginTop: 2 }}>YTD</div>
                </div>
              </div>
              <div className="ml-hist-mob-metas">
                <div><span className="ml-k">Volume · YTD</span><b>{AC.fmtL(a.volume)}</b></div>
                <div><span className="ml-k">Tier</span><b>{AC.fmtRate(a.tier.rate)}</b></div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                  <Icon name={isOpen ? "expand_less" : "expand_more"} size={18} color="#BBBBBB" />
                </div>
              </div>
              {isOpen && (
                <div style={{ marginTop: 12, borderTop: "1px solid var(--border-light)", paddingTop: 10 }}>
                  {[...a.months].reverse().map((m) => (
                    <div key={m.key} onClick={(e) => { e.stopPropagation(); onDrill(m, m.label); }}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "7px 0", borderBottom: "1px solid var(--bg-subtle)", cursor: "pointer" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-primary)" }}>{m.key}</div>
                        <div style={{ fontSize: 11, color: "var(--fg-tertiary)" }}>{AC.fmtL(m.volume)} · KPI {m.appliedMult}%</div>
                      </div>
                      <b style={{ fontSize: 13, color: "var(--fg-primary)", flexShrink: 0, marginLeft: 8 }}>{AC.fmtRM(m.commission)}</b>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <Pager page={page} perPage={perPage} total={accounts.length}
          onPage={setPage} onPerPage={(v) => { setPerPage(v); setPage(1); }}
          perPageOptions={[10, 50, 100]} />
      </div>
    </React.Fragment>
  );
}

function Statements({ history }) {
  const [mode, setMode] = useStateS("month");
  const [open, setOpen] = useStateS("Dec 2026"); // month mode: latest open by default
  const [spOpen, setSpOpen] = useStateS(null);
  const [drawer, setDrawer] = useStateS(null);   // { row, monthLabel }
  const accounts = React.useMemo(() => AC.buildSpStatements(), []);
  const onDrill = (row, monthLabel) => setDrawer({ row, monthLabel });

  const seg = (
    <div className="ml-seg" role="tablist">
      <button className={"ml-seg-btn" + (mode === "month" ? " active" : "")}
        onClick={() => setMode("month")}>By Month</button>
      <button className={"ml-seg-btn" + (mode === "sp" ? " active" : "")}
        onClick={() => setMode("sp")}>By SP Account</button>
    </div>
  );

  return (
    <div className="ml-card">
      <CardHead icon="payments" title="Commission Statements"
        sub={mode === "month"
          ? "One row per month · expand for per-SP breakdown"
          : "One row per SP account · expand for monthly breakdown"}
        right={seg} />
      {mode === "month"
        ? <ByMonth history={history} open={open} setOpen={setOpen} onDrill={onDrill} />
        : <BySp accounts={accounts} open={spOpen} setOpen={setSpOpen} onDrill={onDrill} />}
      <TxnModal row={drawer && drawer.row} monthLabel={drawer && drawer.monthLabel}
        onClose={() => setDrawer(null)} />
    </div>
  );
}

Object.assign(window, { Statements });
