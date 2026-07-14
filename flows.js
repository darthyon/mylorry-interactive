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
          name: "Organization — Dashboard",
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
          id: "org-subscription-profile",
          name: "Organization — Profile",
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
          id: "org-myadmin-dashboard",
          name: "MyAdmin — Dashboard",
          status: "ready",
          route: "flows/org-myadmin-dashboard/index.html",
          desc: "Fleet readiness dashboard: vehicle/driver status, document expiry chart, action list, and checklist/check-in activity.",
          screens: [
            { label: "Dashboard", note: "Fleet Status Summary (Vehicles, Drivers, Expired Documents, Due Soon), Document Expiry stacked bar chart with Vehicle/Driver docs toggle, filterable Document Action List, and Checklist Endorsement / Check-in-Check-out activity tabs." },
          ],
        },
        {
          id: "org-vehicle-list",
          name: "MyAdmin — Vehicle",
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
          id: "org-driver-list",
          name: "MyAdmin — Driver",
          status: "ready",
          route: "flows/org-driver-list/index.html",
          desc: "MyAdmin driver CRUD scaffold with a responsive list, Personal Details create/edit, and post-creation tab placeholders.",
          screens: [
            { label: "Driver list", note: "Search, operational-duty filter, desktop table, and compact mobile cards." },
            { label: "Create & edit", note: "Personal Details form with validation and row-menu edit/delete actions." },
            { label: "Post-creation tabs", note: "Additional Info, Emergency Contacts, and Documents remain scoped placeholders." },
          ],
        },
        {
          id: "org-endorser-dashboard",
          name: "MyAdmin — Endorser Dashboard",
          status: "ready",
          route: "flows/org-endorser-dashboard/index.html",
          desc: "Landing page for the Endorser role — pending/endorsed/rejected/overdue checklist queue with inline Endorse/Reject All, 6-month trend, MTD summary. Restricted nav (Dashboard + Account only); reuses the shared checklist card also consumed by Org Dashboard.",
          screens: [
            { label: "KPI row", note: "5 equal cards: Pending/Endorsed/Rejected Today, Overdue, Avg Approval Time." },
            { label: "Subscription banner", note: "Plan: Lite · Managed Vehicles 7/10 · Managed Drivers 3/10 (hover detail) · Upgrade CTA." },
            { label: "Trend + MTD", note: "6-month stacked bar + total line (left) + MTD summary card (right)." },
            { label: "Checklist Queue", note: "4 tabs, 3-col grid, shared ChecklistCard with inline Reject All/Endorse All. Footer: See all safety checklists." },
            { label: "Restricted nav", note: "Sidebar = Dashboard + Account only, non-collapsible." },
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
          id: "org-mytrip-dashboard",
          name: "MyTrip — Dashboard",
          status: "ready",
          route: "flows/org-mytrip-dashboard/index.html",
          desc: "Org Portal MyTrip module — trip KPIs, paused-trip triage, assigned vs completed per vehicle/driver, trips + fleet status tables, schedule timeline, trip detail with customer tracking share link. Premium only.",
          screens: [
            { label: "Dashboard", note: "KPI cards (Completed/Ongoing/Pending/Paused, clickable), Assigned vs Completed chart with Vehicle/Driver toggle + Today/MTD/6mo, Paused trips card, schedule preview." },
            { label: "Trips", note: "Trips tab (filter chips from KPI/bar clicks, row → detail) + Fleet Status tab (In Progress / Idle / Assigned – Not Started)." },
            { label: "Schedule", note: "Vehicle swim-lane timeline, Today/Tomorrow/Custom, Completed/Assigned/Terminated bars, now-line, bar → trip detail. Vertical list on mobile." },
            { label: "Trip Detail", note: "Route, ETA, activity timeline, map placeholder, paused/terminated callouts. Share tracking link modal → WhatsApp + scope notes." },
            { label: "Customer view", note: "Public single-trip tracking page mock — location, trip info, ETA only. Reached via share modal preview." },
          ],
        },
      ],
    },
    {
      id: "host",
      name: "Host Portal",
      icon: "business",
      flows: [
        {
          id: "host-subscription",
          name: "Host — Subscription",
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
          id: "host-organization-management",
          name: "Host — Organization Management",
          status: "ready",
          route: "flows/host-organization-management/index.html",
          desc: "Organization CRUD for host admins with subscription assignment, managed vehicle number validation, upcoming plans, company email files, and partner assignments.",
          screens: [
            { label: "Organization list", note: "Search, filter, Excel action, Create New Org, production-style columns, status pill, and kebab actions for view/edit/delete." },
            { label: "Create organization", note: "Organization Details, PIC Details, company emails, optional uploads, subscription assignment, and disabled partner assignment until saved." },
            { label: "Edit organization", note: "All three tabs editable: organization detail, current/upcoming subscription, and partner assignment." },
            { label: "View organization", note: "Read-only key-value cards across Organization Detail, Subscription, and Partner Assignment." },
            { label: "Subscription states", note: "Seeded Free, Paid, Trial, Upcoming Plan, over-limit validation, duplicate upcoming-plan guard, upload completed, and required-field validation." },
          ],
        },
        {
          id: "host-sp-account",
          name: "Host — SP Account",
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
          id: "commission-host",
          name: "Host — Agent Commission Config",
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
        { id: "host-settings",           name: "Host — Settings",             status: "planned" },
      ],
    },
    {
      id: "agent",
      name: "Agent Portal",
      icon: "support_agent",
      flows: [
        {
          id: "commission-agent",
          name: "Agent — Commission",
          status: "ready",
          route: "flows/commission-agent/index.html",
          desc: "One page — live KPI, YTD summary, 12-month trend, statements by month or SP account",
          screens: [
            { label: "Commission", note: "Live KPI hero + YTD cards + monthly trend, with a By Month / By SP Account statement switch and drill-to-transaction." },
          ],
        },
        { id: "agent-sp-account",  name: "Agent — SP Account",         status: "planned" },
        { id: "agent-fleet-card",  name: "Agent — Fleet Card",         status: "planned" },
        { id: "agent-transaction", name: "Agent — Transaction",        status: "planned" },
        { id: "agent-rebate",      name: "Agent — Rebate",             status: "planned" },
        { id: "agent-subsidy",     name: "Agent — Subsidy Settlement", status: "planned" },
        { id: "agent-topup",       name: "Agent — Top-Up",             status: "planned" },
        { id: "agent-payment",     name: "Agent — Payment History",    status: "planned" },
        { id: "agent-report",      name: "Agent — Report",             status: "planned" },
        { id: "agent-settings",    name: "Agent — Settings",           status: "planned" },
      ],
    },
    {
      id: "referrer",
      name: "Referrer Portal",
      icon: "group",
      flows: [
        {
          id: "commission-referrer",
          name: "Referrer — Commission",
          status: "ready",
          route: "flows/commission-referrer/index.html",
          desc: "One page — live KPI, YTD summary, 12-month trend, statements by month or SP account",
          screens: [
            { label: "Commission", note: "Live KPI hero + YTD cards + monthly trend, with a By Month / By SP Account statement switch and drill-to-transaction." },
          ],
        },
        { id: "referrer-sp-account",  name: "Referrer — SP Account",         status: "planned" },
        { id: "referrer-fleet-card",  name: "Referrer — Fleet Card",         status: "planned" },
        { id: "referrer-transaction", name: "Referrer — Transaction",        status: "planned" },
        { id: "referrer-rebate",      name: "Referrer — Rebate",             status: "planned" },
        { id: "referrer-subsidy",     name: "Referrer — Subsidy Settlement", status: "planned" },
        { id: "referrer-topup",       name: "Referrer — Top-Up",             status: "planned" },
        { id: "referrer-payment",     name: "Referrer — Payment History",    status: "planned" },
        { id: "referrer-report",      name: "Referrer — Report",             status: "planned" },
        { id: "referrer-settings",    name: "Referrer — Settings",           status: "planned" },
      ],
    },
  ],
};
