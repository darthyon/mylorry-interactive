// referrer-shell.jsx — Referrer portal shell. Re-exports from shared-shell.jsx.
// Adds Referrer-specific nav and component aliases.

const { Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu, Segmented,
  Pill, CurrencyPill, SummaryCard, KpiTierChip, AccountStatusBadge, KPIProgress,
  PetronLogo } = window.SharedShell;

const REFERRER_NAV = [
  { key: "dashboard", label: "Dashboard", icon: "space_dashboard" },
  { key: "sp",        label: "SP Account", icon: "account_balance" },
  { key: "fleet",     label: "Fleet Card", icon: "credit_card" },
  { key: "commission",label: "Commission", icon: "payments" },
  { key: "txn",       label: "Transaction", icon: "receipt_long" },
  { key: "rebate",    label: "Rebate", icon: "sell" },
  { key: "subsidy",   label: "Subsidy", icon: "volunteer_activism" },
  { key: "topup",     label: "Top-Up", icon: "account_balance_wallet" },
  { key: "payment",   label: "Payment", icon: "history" },
  { key: "report",    label: "Report", icon: "description" },
  { key: "usage",     label: "Usage", icon: "bar_chart" },
];

// Referrer-specific wrapper
function ReferrerSidebar({ active = "commission", onNav }) {
  return <Sidebar active={active} onNav={onNav} navItems={REFERRER_NAV} badgeLabel="REFERRER" />;
}

// Re-export everything with the same names existing code expects
Object.assign(window, {
  Icon,
  Sidebar: ReferrerSidebar,
  TopBar,
  Badge,
  Pill,
  CurrencyPill,
  KpiTierChip,
  SummaryCard,
  CardHead,
  ExportMenu,
  Segmented,
  Pager,
  PetronLogo,
  // Bonus re-exports for anything that might reference them
  AccountStatusBadge,
  KPIProgress,
});
