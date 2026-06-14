// agent-shell.jsx — Agent portal shell. Re-exports from shared-shell.jsx.
// Adds Agent-specific nav and component aliases.

const { Icon, TopBar, Sidebar, Badge, Pager, CardHead, ExportMenu,
  Pill, CurrencyPill, SummaryCard, KpiTierChip, AccountStatusBadge, KPIProgress,
  PetronLogo } = window.SharedShell;

const AGENT_NAV = [
  { key: "dashboard", label: "Dashboard", icon: "space_dashboard" },
  { key: "sp",        label: "SP Account", icon: "account_balance" },
  { key: "fleet",     label: "Fleet Card", icon: "credit_card" },
  { key: "commission",label: "Commission", icon: "payments" },
  { key: "referrer",  label: "Referrer", icon: "group" },
  { key: "txn",       label: "Transaction", icon: "receipt_long" },
  { key: "rebate",    label: "Rebate", icon: "sell" },
  { key: "subsidy",   label: "Subsidy", icon: "volunteer_activism" },
  { key: "topup",     label: "Top-Up", icon: "account_balance_wallet" },
  { key: "payment",   label: "Payment", icon: "history" },
  { key: "report",    label: "Report", icon: "description" },
  { key: "usage",     label: "Usage", icon: "bar_chart" },
];

// Agent-specific wrapper
function AgentSidebar({ active = "commission", onNav }) {
  return <Sidebar active={active} onNav={onNav} navItems={AGENT_NAV} badgeLabel="AGENT" />;
}

// Re-export everything with the same names existing code expects
Object.assign(window, {
  Icon,
  Sidebar: AgentSidebar,
  TopBar,
  Badge,
  Pill,
  CurrencyPill,
  KpiTierChip,
  SummaryCard,
  CardHead,
  ExportMenu,
  Pager,
  PetronLogo,
  // Bonus re-exports for anything that might reference them
  AccountStatusBadge,
  KPIProgress,
});
