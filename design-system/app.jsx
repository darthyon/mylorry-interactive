const { Badge, StatusBadge, AccountStatusBadge } = window.SharedShell;

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
