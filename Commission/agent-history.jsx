// agent-history.jsx — Agent Commission History view. Exports window.History.
const { useState: useStateH } = React;

function History({ history }) {
  const [open, setOpen] = useStateH("Dec 2026");
  const [page, setPage] = useStateH(1);
  const [perPage, setPerPage] = useStateH(10);
  const total = history.reduce((s, h) => s + h.commission, 0);
  const totalVol = history.reduce((s, h) => s + h.volume, 0);
  const maxC = Math.max(...history.map((h) => h.commission));

  const sorted = [...history].reverse();
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="ml-view">

      {/* 2 stat cards */}
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 220px",maxWidth:400}}>
          <SummaryCard icon="summarize" title="Commission · 2026 YTD" sub="Jan–Dec 2026"
            value={AC.fmtRM(total)} trend={{ dir: "up", val: "12%" }} />
        </div>
        <div style={{flex:"1 1 220px",maxWidth:400}}>
          <SummaryCard icon="local_gas_station" title="Volume · 2026 YTD" sub="All SP accounts"
            value={AC.fmtL(totalVol)} />
        </div>
      </div>

      {/* Monthly commission bar chart */}
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

      {/* Commission statements */}
      <div className="ml-card">
        <CardHead icon="payments" title="Commission Statements"
          sub="One row per month · expand for per-SP breakdown"
          right={<ExportMenu />} />

        {/* ── Desktop table ── */}
        <div className="ml-desk-tbl">
          <div className="ml-table-wrap">
            <table className="ml-table">
              <thead>
                <tr>
                  <th style={{width:40}}></th>
                  <th style={{minWidth:140}}>Period</th>
                  <th>Volume</th>
                  <th>KPI Tier</th>
                  <th style={{textAlign:"right"}}>Commission</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((h) => {
                  const isOpen = open === h.key;
                  return (
                    <React.Fragment key={h.key}>
                      <tr className={isOpen ? "ml-row-open" : ""}
                          onClick={() => setOpen(isOpen ? null : h.key)}>
                        <td><Icon name={isOpen ? "expand_more" : "chevron_right"} size={18} color="#999AA5" /></td>
                        <td><b>{h.key}</b></td>
                        <td>{AC.fmtL(h.volume)}</td>
                        <td><span className="ml-mult">{h.mult}%</span></td>
                        <td style={{textAlign:"right"}}><b>{AC.fmtRM(h.commission)}</b></td>
                      </tr>
                      {isOpen && (
                        <tr className="ml-expand">
                          <td></td>
                          <td colSpan={4}>
                            <div className="ml-expand-inner">
                              <table className="ml-subtable">
                                <thead>
                                  <tr>
                                    <th>SP Account</th><th>Volume</th>
                                    <th>Tier · rate</th><th>Base</th>
                                    <th>KPI Tier</th>
                                    <th style={{textAlign:"right"}}>Commission</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {h.rows.map((r) => (
                                    <tr key={r.sp}>
                                      <td><div className="ml-cell-main">{r.org}</div><div className="ml-cell-id">{r.sp}</div></td>
                                      <td>{AC.fmtL(r.vol)}</td>
                                      <td>
                                        <span className={"ml-tier-tag t" + r.tier.id}>{r.tier.label}</span>
                                        <span className="ml-sub-xs"> {AC.fmtRate(r.tier.rate)}</span>
                                      </td>
                                      <td>{AC.fmtRM(r.base)}</td>
                                      <td>{r.isException
                                        ? <Badge kind="new">{r.applied}%</Badge>
                                        : <span className="ml-mult">{r.applied}%</span>}</td>
                                      <td style={{textAlign:"right"}}>{AC.fmtRM(r.commission)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="ml-expand-note">
                                <Icon name="info" size={14} color="#999AA5" />
                                Grouped one row per SP account per month.
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
              <div key={h.key} className="ml-hist-mob-card"
                   onClick={() => setOpen(isOpen ? null : h.key)}>
                <div className="ml-hist-mob-head">
                  <div>
                    <b style={{fontSize:14,color:"var(--fg-primary)"}}>{h.key}</b>
                    <div style={{marginTop:4,fontSize:11,color:"var(--fg-tertiary)"}}>{AC.fmtL(h.volume)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <b style={{fontSize:15,color:"var(--green-600)"}}>{AC.fmtRM(h.commission)}</b>
                    <div style={{fontSize:11,color:"var(--fg-tertiary)",marginTop:2}}>KPI {h.mult}%</div>
                  </div>
                </div>
                <div className="ml-hist-mob-metas">
                  <div><span className="ml-k">Volume</span><b>{AC.fmtL(h.volume)}</b></div>
                  <div><span className="ml-k">Multiplier</span><b>{h.mult}%</b></div>
                  <div style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-end"}}>
                    <Icon name={isOpen ? "expand_less" : "expand_more"} size={18} color="#BBBBBB" />
                  </div>
                </div>
                {isOpen && (
                  <div style={{marginTop:12,borderTop:"1px solid var(--border-light)",paddingTop:10,
                    display:"flex",flexDirection:"column",gap:0}}>
                    {h.rows.map((r) => (
                      <div key={r.sp} style={{display:"flex",justifyContent:"space-between",
                        alignItems:"center",padding:"7px 0",
                        borderBottom:"1px solid var(--bg-subtle)"}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:500,color:"var(--fg-primary)"}}>{r.org}</div>
                          <div style={{fontSize:11,color:"var(--fg-tertiary)"}}>{r.sp} · {AC.fmtL(r.vol)}</div>
                        </div>
                        <b style={{fontSize:13,color:"var(--fg-primary)",flexShrink:0,marginLeft:8}}>{AC.fmtRM(r.commission)}</b>
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

      </div>
    </div>
  );
}

Object.assign(window, { History });
