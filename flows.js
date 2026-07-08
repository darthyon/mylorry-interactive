/* ============================================================
   MyLorry Prototype Library — Flow Manifest
   ------------------------------------------------------------
   SINGLE SOURCE OF TRUTH for the home page.

   To add a flow:
     1. Create  flows/<your-flow>/index.html  (copy an existing
        flow's <head> — it wires tokens.css + shared-shell.jsx).
     2. Add one entry to the matching portal's `flows` array below.
        - status: "ready" | "wip" | "planned"
        - route:  path to the flow's index.html (omit for planned)
        - screens: review-order list, each { label, note }
   No other file needs to change.
   ============================================================ */
window.FLOWS = {
  // Top-level quick links shown above the portals.
  links: [
    { name: "Design System", route: "design-system/index.html", icon: "palette",
      desc: "Tokens + every shared component in all states" },
  ],

  portals: [
    {
      id: "org",
      name: "Organization Portal",
      icon: "domain",
      flows: [
        {
          id: "org-dashboard",
          name: "Org Dashboard — Revamp",
          status: "ready",
          route: "flows/org-dashboard/index.html",
          desc: "Fleet command surface on login — fuel, vehicles, drivers, trips. Subscription gating + empty state via Tweaks (⌘⇧E).",
          screens: [
            { label: "Top Pulse", note: "Balance · Operating Cost (today) · Vehicles · Drivers. Card = today snapshot; all counts clickable." },
            { label: "Your Modules", note: "MyFuel/MyAdmin/MyTrip/MyInsurance/MyTraining with per-tier Active / Locked / Coming soon state." },
            { label: "Operating Cost Trend", note: "Today/MTD/6mo · Overall/Per-vehicle. Fuel-only v1; other categories 'coming soon'. Per-vehicle gated on Free." },
            { label: "Trips Today", note: "Completed/ongoing/pending/paused. LockSection upsell preview below Premium." },
            { label: "Action Needed", note: "Triage strip — items overdue, docs expiring, checklist issues. No vehicle/driver duplication." },
            { label: "Action Preview", note: "Tabbed table: Fuel TXNs / Due Statuses / Checklists / Trips (if active). Row → filtered page." },
            { label: "Gating tweak", note: "⌘⇧E → switch Free/Lite/Premium; toggle empty (new org). Lock wins over empty." },
          ],
        },
        {
          id: "org-myfuel-dashboard",
          name: "MyFuel — Dashboard",
          status: "ready",
          route: "flows/org-myfuel-dashboard/index.html",
          desc: "Org Portal MyFuel module dashboard — balance, subsidy quota, usage trend, quota by vehicle, account activity. Subscription gating + quota/empty states via Tweaks (⌘⇧E).",
          screens: [
            { label: "Fuel Pulse", note: "Balance Summary, Subsidy Quota hero, MTD Fuel Used / Rebate Earned / Fleet Cards mini stats." },
            { label: "Fuel Usage Trend", note: "Subsidy vs non-subsidy consumption. Toggle Litres / Amount / Subsidy only." },
            { label: "Subsidy Quota by Vehicle", note: "Per-vehicle quota progress bars with over/at-risk/within states. Locked on Free." },
            { label: "Account Activity", note: "Tabbed table: Fuel Transactions, Top-Up History, Rebate History (hidden on Free)." },
            { label: "Gating tweak", note: "⌘⇧E → switch Free/Lite/Premium; toggle empty; switch quota health." },
          ],
        },
        {
          id: "org-subscription-profile",
          name: "Organisation Profile",
          status: "ready",
          route: "flows/org-subscription-profile/index.html",
          desc: "Org details, PIC, and Subscription Summary revamp — named plan tiers, trial/active/free status, managed vehicle usage, billing breakdown, and expandable module feature access with locked-feature upsell.",
          screens: [
            { label: "Organisation details", note: "Org card (Reg No, TIN, Address) + PIC card (avatar, email, phone)." },
            { label: "Subscription Summary", note: "Plan name + status badge (Trial/Active/Free), upgrade CTA on Free/Lite, managed vehicle usage bar, billing summary for paid plans." },
            { label: "Services & Feature Access", note: "Expandable MyFuel/MyAdmin/MyDriver/MyTrip/MyInsurance cards; Included/Limited/Locked feature rows with inline upgrade prompt." },
            { label: "Data states", note: "⌘⇧E → Free, Lite (active), Premium (trial), Enterprise (unlimited vehicles), Lite (at vehicle limit)." },
          ],
        },
        {
          id: "org-vehicle-list",
          name: "Vehicle List",
          status: "ready",
          route: "flows/org-vehicle-list/index.html",
          desc: "Org Portal vehicle listing with managed-vehicle quota enforcement, driver expansion rows, and mobile card conversion.",
          screens: [
            { label: "Vehicle list", note: "Production-parity columns, managed counter strip, scoped search, due-date filters, and managed-only filter." },
            { label: "Managed enforcement", note: "Toggle on under cap, block at cap, block unmanage during active check-in, and lock Driver tab on unmanaged vehicles." },
            { label: "Driver expansion", note: "Expandable assigned-driver row on desktop and expandable driver section inside mobile cards." },
            { label: "Data states", note: "⌘⇧E → Lite (8/10), Lite (at limit), Premium, Free (0 MV)." },
          ],
        },
        {
          id: "org-myadmin-dashboard",
          name: "MyAdmin — Dashboard",
          status: "ready",
          route: "flows/org-myadmin-dashboard/index.html",
          desc: "MyAdmin module shell placeholder, wired from the main Org Dashboard until the dashboard itself is designed.",
          screens: [
            { label: "Module entry", note: "MyAdmin shell with module sidebar: Dashboard, User, Driver, Vehicle, Vendor, Checklist, Check In History." },
            { label: "Empty state", note: "Dashboard route intentionally shows an empty-state placeholder because MyAdmin dashboard content is not prototyped yet." },
          ],
        },
        { id: "org-mytrip-dashboard", name: "MyTrip — Dashboard",  status: "planned" },
      ],
    },
    {
      id: "host",
      name: "Host Portal",
      icon: "business",
      flows: [
        {
          id: "commission-host",
          name: "Agent Commission Config",
          status: "ready",
          route: "flows/commission-host/index.html",
          desc: "Per-agent commission tier setup, SP account mapping, termination",
          screens: [
            { label: "Agent list & selection", note: "Search/sort agents; referrers flagged. Pick one to configure." },
            { label: "MyFuel Commission tab", note: "Per-agent commission records, role filter, payout status." },
            { label: "KPI config", note: "Target + threshold versioning. Active version vs superseded history." },
            { label: "Tier config", note: "Volume tiers (0–25k, 25k–50k, 50k+) with rates; final tier marked." },
            { label: "SP account mapping", note: "Assigned SP accounts + available pool to link. Commission status per account." },
            { label: "Termination & transfer", note: "End-of-service payout, pro-rated estimate, transfer to another agent." },
          ],
        },
        {
          id: "host-sp-account",
          name: "SP Account",
          status: "ready",
          route: "flows/host-sp-account/index.html",
          desc: "Service Provider accounts — list, view, create/edit; account-level commission validity",
          screens: [
            { label: "SP account list", note: "Org filter + search; agents/referrers as first name + '+N more' popover; status badges." },
            { label: "Account view", note: "Read-only sections; Commission Setting shows activation date, validity months, validity range." },
            { label: "Create SP account", note: "General, Subsidy, Cards, Rebate, Commission (account-level validity), Payout." },
            { label: "Edit SP account", note: "Same form as create; commission validity is account-level, not per agent." },
          ],
        },
        {
          id: "host-subscription",
          name: "Subscription",
          status: "ready",
          route: "flows/host-subscription/index.html",
          desc: "Subscription plans — list, view, create/edit, deactivate, and org plan reassignment with duplicate-plan guard rails.",
          screens: [
            { label: "Subscription list", note: "Search/filter plans, compact services summary, single row action menu, default/custom/trial/recommended metadata." },
            { label: "Plan detail", note: "Configuration summary, plan overview, grouped module access, commitment options, guarded deactivate/delete." },
            { label: "Create / edit plan", note: "Modern SaaS-style editor for pricing, limits, trial visibility, feature access, and commitment options." },
            { label: "Organizations tab", note: "Plan usage table plus inline change-plan flow with setup fee, driver count, trial start/date, and duplicate active-plan prevention." },
          ],
        },
        {
          id: "fleet-card",
          name: "MyFuel — Fleet Card Bulk Actions",
          status: "ready",
          route: "flows/fleet-card/index.html",
          desc: "Select multiple cards, edit status and limits in bulk",
          screens: [
            { label: "Card list + multi-select", note: "Default state. Select rows via checkbox; bulk bar appears." },
            { label: "Bulk edit", note: "Set status / spending limit across the selection." },
            { label: "Update states", note: "Real-time saving, success and error states per card." },
          ],
        },
        { id: "host-myfuel-dashboard",   name: "MyFuel — Dashboard",          status: "planned" },
        { id: "host-myfuel-transaction", name: "MyFuel — Transaction",        status: "planned" },
        { id: "host-myfuel-rebate",      name: "MyFuel — Rebate",             status: "planned" },
        { id: "host-myfuel-subsidy",     name: "MyFuel — Subsidy",            status: "planned" },
        { id: "host-myfuel-topup",       name: "MyFuel — Top-Up",             status: "planned" },
        { id: "host-myfuel-payment",     name: "MyFuel — Payment History",    status: "planned" },
        { id: "host-myfuel-report",      name: "MyFuel — Report",             status: "planned" },
        { id: "host-settings",           name: "Settings",                    status: "planned" },
      ],
    },
    {
      id: "agent",
      name: "Agent Portal",
      icon: "support_agent",
      flows: [
        {
          id: "commission-agent",
          name: "Commission",
          status: "ready",
          route: "flows/commission-agent/index.html",
          desc: "One page — live KPI, YTD summary, 12-month trend, statements by month or SP account",
          screens: [
            { label: "Commission", note: "Live KPI hero + YTD cards + monthly trend, with a By Month / By SP Account statement switch and drill-to-transaction." },
          ],
        },
        { id: "agent-sp-account",  name: "SP Account",         status: "planned" },
        { id: "agent-fleet-card",  name: "Fleet Card",         status: "planned" },
        { id: "agent-transaction", name: "Transaction",        status: "planned" },
        { id: "agent-rebate",      name: "Rebate",             status: "planned" },
        { id: "agent-subsidy",     name: "Subsidy Settlement", status: "planned" },
        { id: "agent-topup",       name: "Top-Up",             status: "planned" },
        { id: "agent-payment",     name: "Payment History",    status: "planned" },
        { id: "agent-report",      name: "Report",             status: "planned" },
        { id: "agent-settings",    name: "Settings",           status: "planned" },
      ],
    },
    {
      id: "referrer",
      name: "Referrer Portal",
      icon: "group",
      flows: [
        {
          id: "commission-referrer",
          name: "Commission",
          status: "ready",
          route: "flows/commission-referrer/index.html",
          desc: "One page — live KPI, YTD summary, 12-month trend, statements by month or SP account",
          screens: [
            { label: "Commission", note: "Live KPI hero + YTD cards + monthly trend, with a By Month / By SP Account statement switch and drill-to-transaction." },
          ],
        },
        { id: "referrer-sp-account",  name: "SP Account",         status: "planned" },
        { id: "referrer-fleet-card",  name: "Fleet Card",         status: "planned" },
        { id: "referrer-transaction", name: "Transaction",        status: "planned" },
        { id: "referrer-rebate",      name: "Rebate",             status: "planned" },
        { id: "referrer-subsidy",     name: "Subsidy Settlement", status: "planned" },
        { id: "referrer-topup",       name: "Top-Up",             status: "planned" },
        { id: "referrer-payment",     name: "Payment History",    status: "planned" },
        { id: "referrer-report",      name: "Report",             status: "planned" },
        { id: "referrer-settings",    name: "Settings",           status: "planned" },
      ],
    },
  ],
};
