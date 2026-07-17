const { Icon, Badge, StatusBadge, AccountStatusBadge, LockSection, CountCard, HistoryCard, MobileListCard, HacModal, HacFileUpload, SelectMenu } = window.SharedShell;

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

function ModalDemo() {
  const [open, setOpen] = React.useState(false);
  return <><button className="ml-btn-primary" type="button" onClick={() => setOpen(true)}>Open modal</button>{open && <HacModal title="Edit record" onClose={() => setOpen(false)} footer={<><button className="hac-modal-cancel" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="hac-modal-save" type="button" onClick={() => setOpen(false)}>Save changes</button></>}><div className="hac-fg"><label className="hac-label">Example field</label><input className="hac-input" defaultValue="Shared modal content" /></div></HacModal>}</>;
}

mount("modalDemo", <ModalDemo />);

function FileUploadDemo() {
  const [names, setNames] = React.useState([]);
  return <div style={{ display: "grid", gridTemplateColumns: "360px 320px", gap: 18, alignItems: "start" }}><div><HacFileUpload accept="image/*,.pdf" multiple onFiles={(files) => setNames(Array.from(files).map((file) => file.name))} description={<><span>Click to upload</span> or drag and drop</>} hint="Images or PDF, up to 3 files" />{names.length > 0 && <div className="lbl" style={{ marginTop: 8 }}>{names.join(", ")}</div>}</div><HacFileUpload variant="mini" accept="image/*,.pdf" multiple onFiles={() => {}} description={<><span>Click to upload</span> or drag and drop</>} hint="Mini upload variant" /></div>;
}

mount("fileUploadDemo", <FileUploadDemo />);

function SelectMenuDemo() {
  const [value, setValue] = React.useState("Last completed year");
  return <SelectMenu className="ds-select-menu" value={value} options={["Last completed year", "Trailing 12 months"]} onChange={setValue} ariaLabel="Evaluation period" />;
}

mount("selectMenuDemo", <SelectMenuDemo />);

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

mount("docStatus", <>
  <StatusBadge status="doc_expired" />
  <StatusBadge status="doc_0_7" />
  <StatusBadge status="doc_8_30" />
  <StatusBadge status="doc_31_60" />
  <StatusBadge status="doc_61_90" />
  <StatusBadge status="doc_future" />
</>);

mount("tripStatus", <>
  <StatusBadge status="trip_completed" />
  <StatusBadge status="trip_ongoing" />
  <StatusBadge status="trip_pending" />
  <StatusBadge status="trip_paused" />
  <StatusBadge status="trip_terminated" />
</>);

mount("vehStatus", <>
  <StatusBadge status="veh_in_progress" />
  <StatusBadge status="veh_idle" />
  <StatusBadge status="veh_assigned" />
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
  <div style={{ width: 200 }}>
    <CountCard icon="local_shipping" count={5} label="Ongoing" tone="blue"
      actionLabel="View ongoing trips" onClick={() => {}} />
  </div>
  <div style={{ width: 200 }}>
    <CountCard icon="schedule" count={4} label="Pending" tone="gray"
      actionLabel="View pending trips" onClick={() => {}} />
  </div>
  <div style={{ width: 200 }}>
    <CountCard icon="pause_circle" count={2} label="Paused" sub="needs attention" tone="amber" attention
      actionLabel="View paused trips" onClick={() => {}} />
  </div>
</div>);

function mlInitials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
}
const mlKebab = <button type="button" aria-label="More actions" style={{ border: 0, background: "transparent", padding: 4, color: "var(--fg-secondary)" }}><Icon name="more_horiz" size={18} /></button>;
const mlAvatar = (name) => <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--green-50)", color: "var(--green-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{mlInitials(name)}</div>;
const mlThumb = <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} title="Not in-use" aria-label="Not in-use"><Icon name="local_shipping" size={18} color="var(--fg-secondary)" /></div>;
const mlFacts2 = (a, b) => <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, fontWeight: 600, color: "var(--fg-secondary)" }}><span style={{ color: "var(--green-700)" }}>{a}</span><span>{b}</span></div>;
const mlFacts3 = (label1, val1, label2, val2, label3, val3) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
    {[[label1, val1], [label2, val2], [label3, val3]].map(([label, value]) => (
      <div key={label} style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--fg-tertiary)" }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-primary)", marginTop: 2 }}>{value}</div>
      </div>
    ))}
  </div>
);
const mlManaged = (managed) => managed
  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "var(--green-700)" }}><Icon name="check_circle" size={16} fill={1} />Managed</span>
  : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "var(--fg-tertiary)" }}><Icon name="radio_button_unchecked" size={16} />Unmanaged</span>;
const mlVendor = (vendor) => <span style={{ fontSize: 12, fontWeight: 600, color: vendor ? "var(--fg-secondary)" : "var(--fg-tertiary)" }}>{vendor || "No vendor"}</span>;

mount("mobileListCardDemo", (
  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
    <div style={{ width: 340 }}>
      <MobileListCard
        leading={mlAvatar("Hafiz Rahman")}
        title="Hafiz Rahman" subtitle="DRV-022"
        status={<StatusBadge status="active" />} menu={mlKebab}
        meta={mlVendor("Swift Logistics")}
      >{mlFacts2("+60 12-345 6789", "IC No. 900101-14-5678")}</MobileListCard>
    </div>
    <div style={{ width: 340 }}>
      <MobileListCard
        leading={mlThumb}
        title="VLT8421" subtitle="Lorry"
        status={mlManaged(true)} menu={mlKebab}
        meta={mlVendor(null)}
        footer={<><span /><button type="button" style={{ border: 0, background: "transparent", padding: 0, color: "var(--green-700)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer" }}><Icon name="groups" size={15} />View 3 assigned drivers</button></>}
      >{mlFacts3("BTM", "7,600 kg", "BDM", "18,000 kg", "Capacity", "10,400 kg")}</MobileListCard>
    </div>
  </div>
));

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
  <HistoryCard
    prefix={<div className="ml-stat-icon amber"><span className="msr" style={{ fontSize: 18, color: "var(--amber-600)" }}>pause_circle</span></div>}
    title="BMA 8830 · Faizal Rahman"
    subtitle="Shah Alam Hub → Nilai Industrial Park"
    meta="2h 23m"
    onClick={() => {}}
  />
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
