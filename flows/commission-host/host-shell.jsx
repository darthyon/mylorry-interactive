// host-shell.jsx — Host portal shell. Re-exports from shared-shell.jsx.
// Adds Host-specific nav and component aliases (HIcon, HostTopBar, HostSidebar, etc.).

const { Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu, Segmented,
  CurrencyPill, StatusBadge, AccountStatusBadge, KPIProgress, KpiTierChip, PetronLogo } = window.SharedShell;

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
  { key:"myadmin",      label:"MyAdmin",            icon:"admin_panel_settings" },
  { key:"mytrip",       label:"MyTrip",             icon:"alt_route" },
];

// Host-specific aliases (same component, different name for historical reasons)
const HIcon = Icon;
const HBadge = Badge;
const HCurrencyPill = CurrencyPill;
const HCardHead = CardHead;
const HPager = Pager;
const HExportMenu = ({ comingSoon = true }) => <ExportMenu comingSoon={comingSoon} />;
const HAccountStatusBadge = AccountStatusBadge;
const HStatusBadge = StatusBadge;
const HKPIProgress = KPIProgress;
const HKpiTierChip = KpiTierChip;

// Host-specific wrappers
function HostSidebar({ active = "agent" }) {
  return <Sidebar active={active} onNav={null} navItems={HOST_NAV} badgeLabel="HOST" />;
}
function HostTopBar() {
  return <TopBar />;
}

// Re-export everything to window with the same names existing code expects
Object.assign(window, {
  HIcon, HostTopBar, HostSidebar, HBadge, HAccountStatusBadge, HStatusBadge, HKPIProgress, HKpiTierChip,
  HCurrencyPill, HCardHead, HPager, HExportMenu, Segmented, PetronLogo,
});
