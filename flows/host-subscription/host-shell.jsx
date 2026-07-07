// host-shell.jsx — Host portal shell for the Subscription flow.
// Re-exports from shared-shell.jsx and defaults the active nav item to Subscription.

const { Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu, Segmented,
  CurrencyPill, StatusBadge, AccountStatusBadge, KPIProgress, PetronLogo } = window.SharedShell;

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
const HCurrencyPill = CurrencyPill;
const HCardHead = CardHead;
const HPager = Pager;
const HExportMenu = ({ comingSoon = true }) => <ExportMenu comingSoon={comingSoon} />;
const HAccountStatusBadge = AccountStatusBadge;
const HStatusBadge = StatusBadge;
const HKPIProgress = KPIProgress;

function HostSidebar({ active = "subscription" }) {
  return <Sidebar active={active} onNav={null} navItems={HOST_NAV} badgeLabel="HOST" />;
}

function HostTopBar() {
  return <TopBar />;
}

Object.assign(window, {
  HIcon, HostTopBar, HostSidebar, HBadge, HAccountStatusBadge, HStatusBadge, HKPIProgress,
  HCurrencyPill, HCardHead, HPager, HExportMenu, Segmented, PetronLogo,
});
