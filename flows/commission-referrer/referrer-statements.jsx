// referrer-statements.jsx — Unified Commission Statements with a By Month / By SP
// Account switch. Same 12-month data, two pivots. Exports window.Statements.
const AC = window.RC;
const { useState: useStateS } = React;

function fmtAttribution(volume, total) {
  const pct = total > 0 ? (volume / total) * 100 : 0;
  const rounded = Math.round(pct * 10) / 10;
  const pctLabel = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
  return `${AC.fmtL(volume)} · ${pctLabel}%`;
}

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
function LeafRow({ periodCell, r, attributionTotal, onDrill }) {
  return (
    <tr style={{ cursor: "pointer" }} onClick={() => onDrill(r)}>
      <td>{periodCell}</td>
      <td>{AC.fmtL(r.vol != null ? r.vol : r.volume)}</td>
      <td>{fmtAttribution(r.vol != null ? r.vol : r.volume, attributionTotal)}</td>
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
        <th>{first}</th><th>Commission Volume</th>
        <th>KPI Attribution</th><th>Tier / Rate</th><th>Base Commission</th>
        <th>Multiplier</th>
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
                <th>Commission Volume</th>
                <th>Multiplier</th>
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
                                  <LeafRow key={r.sp} r={r} attributionTotal={h.volume} onDrill={() => onDrill(r, h.label)}
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
                <div><span className="ml-k">Commission volume</span><b>{AC.fmtL(h.volume)}</b></div>
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
                        <div style={{ fontSize: 11, color: "var(--fg-tertiary)" }}>{r.sp} · {fmtAttribution(r.vol, h.volume)}</div>
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
                <th>Commission Volume · YTD</th>
                <th>Tier / Rate</th>
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
                                  <LeafRow key={m.key} r={m} attributionTotal={a.volume} onDrill={() => onDrill(m, m.label)}
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
                <div><span className="ml-k">Commission volume · YTD</span><b>{AC.fmtL(a.volume)}</b></div>
                <div><span className="ml-k">Tier / Rate</span><b>{AC.fmtRate(a.tier.rate)}</b></div>
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
                        <div style={{ fontSize: 11, color: "var(--fg-tertiary)" }}>{fmtAttribution(m.volume, a.volume)} · KPI {m.appliedMult}%</div>
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

// ── Export modal: pick scope (Month / SP Account) then export ─────────
// Reuses the shared ml-modal shell (same as TxnModal). Replaces the old
// dropdown ExportMenu on this screen.
function ExportModal({ accounts, history, onClose }) {
  const months = [...history].reverse(); // latest first
  const [by, setBy] = useStateS("month");           // month | sp
  const [allMonths, setAllMonths] = useStateS(true); // checkbox: ignore range
  const [from, setFrom] = useStateS(months[months.length - 1].key);
  const [to, setTo] = useStateS(months[0].key);
  const [sp, setSp] = useStateS(accounts[0].sp);
  const [toast, setToast] = useStateS(null);

  const doExport = () => {
    setToast("Preparing export…");
    setTimeout(onClose, 1400);
  };

  return (
    <div className="ml-modal-overlay" onClick={onClose}>
      <div className="ml-modal ml-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="ml-modal-head">
          <div>
            <div className="ml-modal-title">Export Commission Statement</div>
            <div className="ml-modal-sub">Choose what to include in the export</div>
          </div>
          <button className="ml-icon-btn" onClick={onClose}><Icon name="close" size={20} /></button>
        </div>

        <div className="ml-modal-body ml-form">
          <div className="ml-field">
            <label className="ml-field-label">Export by</label>
            <div className="ml-radio-group">
              <label className="ml-radio-row">
                <input type="radio" name="export-by" checked={by === "month"}
                  onChange={() => setBy("month")} />
                <span>Month</span>
              </label>
              <label className="ml-radio-row">
                <input type="radio" name="export-by" checked={by === "sp"}
                  onChange={() => setBy("sp")} />
                <span>SP Account</span>
              </label>
            </div>
          </div>

          {by === "month" ? (
            <div className="ml-field">
              <label className="ml-field-label">Date range</label>
              <div className="ml-field-row">
                <select className="ml-select" value={from} disabled={allMonths}
                  onChange={(e) => setFrom(e.target.value)}>
                  {months.map((m) => <option key={m.key} value={m.key}>{m.key}</option>)}
                </select>
                <span className="ml-range-sep">–</span>
                <select className="ml-select" value={to} disabled={allMonths}
                  onChange={(e) => setTo(e.target.value)}>
                  {months.map((m) => <option key={m.key} value={m.key}>{m.key}</option>)}
                </select>
              </div>
              <label className="ml-check-row">
                <input type="checkbox" checked={allMonths}
                  onChange={(e) => setAllMonths(e.target.checked)} />
                <span>All months</span>
              </label>
            </div>
          ) : (
            <div className="ml-field">
              <label className="ml-field-label">SP account</label>
              <select className="ml-select" value={sp} onChange={(e) => setSp(e.target.value)}>
                {accounts.map((a) => <option key={a.sp} value={a.sp}>{a.org} · {a.sp}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="ml-modal-actions">
          <button className="ml-btn-outline" onClick={onClose}>Cancel</button>
          <button className="ml-btn-primary" onClick={doExport}>
            <Icon name="download" size={18} /> Export
          </button>
        </div>
        {toast && <div className="ml-toast"><Icon name="check_circle" size={16} color="#00AA4F" /> {toast}</div>}
      </div>
    </div>
  );
}

function Statements({ history }) {
  const [mode, setMode] = useStateS("month");
  const [open, setOpen] = useStateS("Dec 2026"); // month mode: latest open by default
  const [spOpen, setSpOpen] = useStateS(null);
  const [drawer, setDrawer] = useStateS(null);   // { row, monthLabel }
  const [exporting, setExporting] = useStateS(false);
  const accounts = React.useMemo(() => AC.buildSpStatements(), []);
  const onDrill = (row, monthLabel) => setDrawer({ row, monthLabel });

  // Toggle (left) + Export trigger (most right).
  const right = (
    <div className="ml-cardhead-actions">
      <Segmented value={mode} onChange={setMode} options={[
        { value: "month", label: "By Month" },
        { value: "sp", label: "By SP Account" },
      ]} />
      <button className="ml-btn-soft" onClick={() => setExporting(true)}>
        <Icon name="download" size={18} /> Export
      </button>
    </div>
  );

  return (
    <div className="ml-card">
      <CardHead icon="payments" title="Commission Statements"
        sub={mode === "month"
          ? "One row per month · expand for per-SP breakdown"
          : "One row per SP account · expand for monthly breakdown"}
        right={right} />
      {mode === "month"
        ? <ByMonth history={history} open={open} setOpen={setOpen} onDrill={onDrill} />
        : <BySp accounts={accounts} open={spOpen} setOpen={setSpOpen} onDrill={onDrill} />}
      <TxnModal row={drawer && drawer.row} monthLabel={drawer && drawer.monthLabel}
        onClose={() => setDrawer(null)} />
      {exporting && (
        <ExportModal accounts={accounts} history={history}
          onClose={() => setExporting(false)} />
      )}
    </div>
  );
}

Object.assign(window, { Statements });
