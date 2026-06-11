// host-shell.jsx — Host portal shell. Re-exports from shared-shell.jsx.
// Adds Host-specific nav and component aliases (HIcon, HostTopBar, HostSidebar, etc.).

const { Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu,
  CurrencyPill, AccountStatusBadge, KPIProgress } = window.SharedShell;

const HOST_NAV = [
  { key:"dashboard",  label:"Dashboard",  icon:"space_dashboard"      },
  { key:"myfuel",     label:"MyFuel",     icon:"local_gas_station"     },
  { key:"myadmin",    label:"MyAdmin",    icon:"manage_accounts"       },
  { key:"mytrip",     label:"MyTrip",     icon:"route"                 },
  { key:"__div__",    label:"",           icon:""                      },
  { key:"org",        label:"Org",        icon:"business_center"       },
  { key:"agent",      label:"Agent",      icon:"supervisor_account"    },
  { key:"log",        label:"Log",        icon:"description"           },
  { key:"sub",        label:"Subscription",icon:"workspace_premium"   },
];

// Host-specific aliases (same component, different name for historical reasons)
const HIcon = Icon;
const HBadge = Badge;
const HCurrencyPill = CurrencyPill;
const HCardHead = CardHead;
const HPager = Pager;
const HExportMenu = ({ comingSoon = true }) => <ExportMenu comingSoon={comingSoon} />;
const HAccountStatusBadge = AccountStatusBadge;
const HKPIProgress = KPIProgress;

// Host-specific wrappers
function HostSidebar({ active = "agent" }) {
  return <Sidebar active={active} onNav={null} navItems={HOST_NAV} badgeLabel="HOST" />;
}
function HostTopBar() {
  return <TopBar />;
}

// Re-export everything to window with the same names existing code expects
Object.assign(window, {
  HIcon, HostTopBar, HostSidebar, HBadge, HAccountStatusBadge, HKPIProgress,
  HCurrencyPill, HCardHead, HPager, HExportMenu,
});
