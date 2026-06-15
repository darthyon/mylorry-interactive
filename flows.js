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
          desc: "Agent dashboard — KPI gauge, tier track, SP breakdown, history",
          screens: [
            { label: "Dashboard", note: "KPI gauge vs target, tier track, SP account breakdown, drill-to-detail drawer." },
            { label: "History", note: "12-month commission statements with monthly bar chart and per-SP drill-down." },
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
      id: "myfuel",
      name: "MyFuel",
      icon: "local_gas_station",
      flows: [
        {
          id: "fleet-card",
          name: "Fleet Card — Bulk Actions",
          status: "ready",
          route: "flows/fleet-card/index.html",
          desc: "Select multiple cards, edit status and limits in bulk",
          screens: [
            { label: "Card list + multi-select", note: "Default state. Select rows via checkbox; bulk bar appears." },
            { label: "Bulk edit", note: "Set status / spending limit across the selection." },
            { label: "Update states", note: "Real-time saving, success and error states per card." },
          ],
        },
      ],
    },
  ],
};
