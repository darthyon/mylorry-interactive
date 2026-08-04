// host-shell.jsx — Host portal shell for the host-wide Vehicle list.
// Re-exports from shared-shell.jsx; defaults the active nav item to MyAdmin.

const { Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu,
  StatusBadge, SelectMenu, HacModal, MobileListCard, ReminderSummary, EmptyState } = window.SharedShell;

const HOST_NAV = [
  { key:"__label__",    label:"HOST",               icon:"" },
  { key:"dashboard",    label:"Dashboard",          icon:"grid_view" },
  { key:"host_user",    label:"Host User",          icon:"manage_accounts" },
  { key:"user_activity",label:"User Activity",      icon:"swap_horiz" },
  { key:"agent",        label:"Salesperson",        icon:"support_agent" },
  { key:"subscription", label:"Subscription",       icon:"diamond" },
  { key:"announce",     label:"Announce..",         icon:"campaign" },
  { key:"__label__",    label:"ORG",                icon:"" },
  { key:"organisation", label:"Organisation",       icon:"business_center" },
  { key:"org_user",     label:"Organisation User",  icon:"supervisor_account" },
  { key:"__label__",    label:"PRODUCT",            icon:"" },
  { key:"myfuel",       label:"MyFuel",             icon:"local_gas_station" },
  { key:"sp_account",   label:"SP Account",         icon:"handshake" },
  { key:"myadmin",      label:"MyAdmin",            icon:"admin_panel_settings" },
  { key:"mytrip",       label:"MyTrip",             icon:"alt_route" },
];

const HIcon = Icon;
const HBadge = Badge;
const HCardHead = CardHead;
const HPager = Pager;
const HExportMenu = ({ comingSoon = true }) => <ExportMenu comingSoon={comingSoon} />;
const HStatusBadge = StatusBadge;

function HostSidebar({ active = "myadmin" }) {
  const myadminSubs = [
    { key: "driver", label: "Driver", icon: "badge" },
    { key: "vehicle", label: "Vehicle", icon: "local_shipping", href: "#" },
    { key: "vendor", label: "Vendor", icon: "storefront" },
    { key: "checklist", label: "Checklist", icon: "fact_check" },
    { key: "history", label: "Check In History", icon: "history" },
  ];

  return (
    <aside className="ml-sidebar">
      <div className="ml-sidebar-card">
        <div className="ml-side-top">
          <div className="ml-avatar-wrap">
            <div className="ml-avatar">
              <HIcon name="person" size={18} fill={1} color="#94A8B2" />
            </div>
            <span className="ml-avatar-badge">HOST</span>
          </div>
          <div className="ml-side-divider" />
          <nav className="ml-nav">
            {HOST_NAV.map((n, i) => {
              if (n.key === "__label__") {
                return (
                  <div key={n.label + i} style={{
                    padding: "10px 10px 6px", fontSize: 11, fontWeight: 700,
                    letterSpacing: ".08em", color: "var(--fg-tertiary)",
                  }}>
                    {n.label}
                  </div>
                );
              }
              if (n.key === "myadmin") {
                return (
                  <React.Fragment key={n.key}>
                    <div className="ml-nav-group active">
                      <HIcon name={n.icon} size={23} fill={1} />
                      <span>{n.label}</span>
                      <div className="ml-nav-chev"><HIcon name="expand_less" size={11} /></div>
                    </div>
                    <div className="ml-sub-panel">
                      {myadminSubs.map((sub) => {
                        const isSubActive = sub.key === "vehicle";
                        const cls = `ml-sub${isSubActive ? " active" : ""}`;
                        const content = <><HIcon name={sub.icon} size={18} fill={isSubActive ? 1 : 0} /><span>{sub.label}</span></>;
                        return sub.href ? (
                          <a key={sub.key} className={cls} href={sub.href}>{content}</a>
                        ) : (
                          <div key={sub.key} className={cls}>{content}</div>
                        );
                      })}
                    </div>
                  </React.Fragment>
                );
              }
              return (
                <button key={n.key} className={"ml-nav-item" + (n.key === active ? " active" : "")} title={n.label}>
                  <HIcon name={n.icon} size={23} fill={n.key === active ? 1 : 0} />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="ml-side-bottom">
          <div className="ml-side-divider" />
          <button className="ml-nav-item" title="Settings">
            <HIcon name="settings" size={23} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function HostTopBar() {
  return <TopBar />;
}

Object.assign(window, {
  HIcon, HostTopBar, HostSidebar, HBadge, HStatusBadge, HCardHead, HPager, HExportMenu,
  HSelectMenu: SelectMenu, HHacModal: HacModal, HMobileListCard: MobileListCard,
  HReminderSummary: ReminderSummary, HEmptyState: EmptyState,
});
