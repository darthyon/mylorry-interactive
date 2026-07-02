const { Badge, StatusBadge, AccountStatusBadge, LockSection, CountCard, HistoryCard } = window.SharedShell;

/* ── Token swatches (read straight from tokens.css via getComputedStyle) ── */
const COLOR_TOKENS = [
  "--green-600","--green-500","--green-400","--green-50","--teal-600",
  "--navy-800","--forest-700","--amber-600","--amber-500","--amber-50","--red-400",
  "--fg-primary","--fg-secondary","--fg-tertiary","--fg-disabled",
  "--bg-muted","--bg-subtle","--bg-hover","--border-light","--border-medium",
];
const cssVal = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
document.getElementById("swColors").innerHTML = COLOR_TOKENS.map(t => `
  <div class="sw">
    <div class="sw-chip" style="background:var(${t})"></div>
    <div class="sw-meta"><div class="sw-name">${t}</div><div class="sw-val">${cssVal(t) || "—"}</div></div>
  </div>`).join("");

/* ── Radii ── */
document.getElementById("radii").innerHTML =
  ["--radius-xs","--radius-sm","--radius-md","--radius-lg","--radius-xl","--radius-pill"]
  .map(r => `<div class="radius-box" style="border-radius:var(${r})">${cssVal(r)}</div>`).join("");

/* ── Type scale ── */
const TYPE = [
  ["h1",24,700],["h2",20,700],["h3",18,600],["body1",16,400],
  ["body2",14,400],["body3",13,400],["caption",12,400],["overline",10,500],
];
document.getElementById("typeScale").innerHTML = TYPE.map(([n,s,w]) =>
  `<div class="type-row"><span class="tname">${n} · ${s}px</span>
   <span style="font-size:${s}px;font-weight:${w};${n==='overline'?'letter-spacing:.4px;text-transform:uppercase;':''}">More Safety · More Savings · More Earnings</span></div>`
).join("");

/* ── Live shared components ── */
function span(node){ const d=document.createElement("span"); return d; }
function mount(id, el){ ReactDOM.createRoot(document.getElementById(id)).render(el); }

mount("badgeKinds", <>
  <Badge kind="active">Active</Badge>
  <Badge kind="inactive">Inactive</Badge>
  <Badge kind="expire">Expiring</Badge>
  <Badge kind="new">New</Badge>
</>);

mount("commStatus", <>
  <StatusBadge status="activated" />
  <StatusBadge status="pending_onboarding" />
  <StatusBadge status="on_hold" />
  <StatusBadge status="deactivated" />
  <StatusBadge status="expired" />
</>);

mount("acctStatus", <>
  <AccountStatusBadge status="active" />
  <AccountStatusBadge status="inactive" />
  <AccountStatusBadge status="suspended" />
  <AccountStatusBadge status="terminated" />
</>);

document.getElementById("payoutStatus").innerHTML = `
  <span class="ml-badge payout-pending">Pending</span>
  <span class="ml-badge payout-approved">Approved</span>
  <span class="ml-badge payout-paid">Paid</span>
  <span class="ml-badge payout-rejected">Rejected</span>`;

/* ── CountCard ── */
mount("countCards", <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
  <div style={{ width: 240 }}>
    <CountCard icon="local_shipping" count={16} label="Vehicles" sub="Total in fleet"
      stats={[
        { n: 3, label: "In use", tone: "green" },
        { n: 12, label: "Unused", tone: "gray" },
        { n: 1, label: "Inactive", tone: "red" },
      ]} />
  </div>
  <div style={{ width: 240 }}>
    <CountCard icon="groups" count={13} label="Drivers" sub="Total registered"
      stats={[
        { n: 5, label: "On duty", tone: "green" },
        { n: 8, label: "Off duty", tone: "gray" },
      ]} />
  </div>
</div>);

/* ── LockSection ── */
const lockDemo = (
  <div style={{ padding: 18, width: 280, background: "#fff", border: "1px solid var(--border-light)", borderRadius: 12 }}>
    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Trips Today</div>
    <div style={{ fontSize: 22, fontWeight: 800 }}>85 / 120</div>
    <div style={{ fontSize: 12, color: "var(--fg-tertiary)" }}>completed today</div>
  </div>
);
mount("lockOpen", <LockSection locked={false}>{lockDemo}</LockSection>);

/* ── HistoryCard ── */
mount("historyCards", <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 280px))", gap: 14 }}>
  <HistoryCard
    icon="calendar_clock"
    title="Paid at: 16 Jun 2026"
    subtitle="84371"
    action={<button type="button" style={{ width: 28, height: 28, border: 0, background: "transparent", color: "var(--fg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><span className="msr">download</span></button>}
  >
    <div className="ml-history-card-row">
      <div className="ml-history-card-cell"><strong>XX-PTN-01</strong></div>
      <div className="ml-history-card-cell" style={{ textAlign: "right" }}><span className="mfd-history-amountpill">RM 888.00<span className="mfd-history-plus">+</span></span></div>
    </div>
    <div className="ml-history-card-row">
      <div className="ml-history-card-cell">Bank transfer</div>
      <div className="ml-history-card-cell" style={{ textAlign: "right" }}>Description here hahaha</div>
    </div>
    <div className="ml-history-card-row full">
      <div className="ml-history-card-cell">Created at <strong>16-Jun-26, 11:11 AM</strong></div>
    </div>
  </HistoryCard>
  <HistoryCard
    icon="calendar_clock"
    title="Paid on:"
    subtitle="01 May 2026 - 31 May 2026"
  >
    <div className="ml-history-card-row">
      <div className="ml-history-card-cell"><strong>000000</strong></div>
      <div className="ml-history-card-cell" style={{ textAlign: "right" }}><span className="mfd-history-amount">RM 0.00</span></div>
    </div>
    <div className="ml-history-card-row">
      <div className="ml-history-card-cell">Org 2134</div>
      <div className="ml-history-card-cell" style={{ textAlign: "right" }}>Credit note</div>
    </div>
    <div className="ml-history-card-row">
      <div className="ml-history-card-cell">Usage: 0.00</div>
      <div className="ml-history-card-cell" style={{ textAlign: "right" }}>Group Usage: 0.00</div>
    </div>
    <div className="ml-history-card-row full">
      <div className="ml-history-card-cell">Petron(referrer)</div>
      <div className="ml-history-card-cell" style={{ textAlign: "right" }}><StatusBadge status="completed" /></div>
    </div>
  </HistoryCard>
</div>);
mount("lockPremium", <LockSection locked tier="premium" cta="Unlock MyTrip"
  note="Track trip progress and driver locations in real time.">{lockDemo}</LockSection>);
mount("lockLite", <LockSection locked tier="lite"
  note="See fuel spend broken down per vehicle on Lite and above.">{lockDemo}</LockSection>);

/* ── Table body with a live status badge ── */
const ROWS = [
  ["CK-PTN-001","CK Timber Transport","52,400 L","activated"],
  ["SUM-PTN-012","Summit Global Logistics","46,900 L","pending_onboarding"],
  ["ARC-PTN-063","Arcadian Haulage","28,700 L","on_hold"],
];
const tbody = document.getElementById("tableBody");
ROWS.forEach(([sp,org,vol,status]) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${sp}</td><td>${org}</td><td>${vol}</td><td class="cell-status"></td>`;
  tbody.appendChild(tr);
  ReactDOM.createRoot(tr.querySelector(".cell-status")).render(<StatusBadge status={status} />);
});
