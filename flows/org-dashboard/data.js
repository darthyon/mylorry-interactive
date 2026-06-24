/* data.js — hand-written mock data for the Org Dashboard prototype.
   Tracked (not build output). Numbers mirror the PRD/BRD review screens.
   Subscription gating + empty state are applied in app.jsx from tweaks;
   this file holds the "populated / premium" baseline only. */
window.ORG_DASH = {
  org: {
    id: "padu",
    name: "Padu Logistik Sdn. Bhd.",
    lastUpdated: "9 Jun 2026, 12:48 AM",
    date: "9 Jun 2026",
  },

  orgs: [
    { id: "padu", name: "Padu Logistik Sdn. Bhd.", role: "Admin" },
    { id: "swift", name: "Swift Cargo Express", role: "Admin" },
    { id: "bintang", name: "Bintang Freight Sdn. Bhd.", role: "Viewer" },
  ],

  /* ── Top Pulse KPIs ─────────────────────────────────────────── */
  balance: {
    amount: 12450.80,
    daysRemaining: 18,
    currentUsage: 1963.68,   // RM, current month
    currentUsageLitres: 748.58,
    lastMonthUsage: 9999.89, // RM
    lastMonthUsageLitres: 3816.75,
  },
  operatingCost: {
    today: 12500,      // RM total today
    trendPct: 8,       // vs yesterday
    trendDir: "up",    // up | down
    fuel: 5000,        // RM, only category shown in v1
  },
  vehicles: { total: 16, inUse: 3, unused: 12, inactive: 1 },
  drivers:  { total: 13, onDuty: 5, offDuty: 8 },

  /* ── Modules (state resolved per-tier in app.jsx) ───────────── */
  // baseState: "active" (gated on tier) | "soon" (coming soon, never unlocks in v1)
  modules: [
    { key: "myfuel",      name: "MyFuel",      iconSrc: "icons/myfuel.svg",      minTier: "free"    },
    { key: "myadmin",     name: "MyAdmin",     iconSrc: "icons/myadmin.svg",     minTier: "lite"    },
    { key: "mytrip",      name: "MyTrip",      iconSrc: "icons/mytrip.svg",      minTier: "premium" },
    { key: "myinsurance", name: "MyInsurance", iconSrc: "icons/myinsurance.svg", soon: true         },
    { key: "mytraining",  name: "MyTraining",  iconSrc: "icons/mytraining.svg",  soon: true         },
  ],

  /* ── Operating Cost Trend ───────────────────────────────────── */
  // Fuel-only series in v1. Other categories render as "coming soon" legend.
  costTrend: {
    months: [
      { label: "Jan 2026", fuel: 8450  },
      { label: "Feb 2026", fuel: 9120  },
      { label: "Mar 2026", fuel: 11230 },
      { label: "Apr 2026", fuel: 10450 },
      { label: "May 2026", fuel: 12030 },
      { label: "Jun 2026", fuel: 12500, current: true },
    ],
    // Per-vehicle view (Paid) — gated for free tier.
    perVehicle: [
      { label: "STG1161", fuel: 4200 },
      { label: "STG0234", fuel: 3100 },
      { label: "VANB791", fuel: 2600 },
      { label: "WXX1234", fuel: 1700 },
      { label: "HINO300", fuel: 900  },
      { label: "STG0848", fuel: 780  },
      { label: "STG2190", fuel: 690  },
      { label: "VANB112", fuel: 620  },
      { label: "JQB4410", fuel: 540  },
      { label: "STG7782", fuel: 460  },
      { label: "HINO512", fuel: 390  },
      { label: "WXX8821", fuel: 310  },
    ],
  },

  /* ── Trips Today (gated: premium) ───────────────────────────── */
  trips: { completed: 85, total: 120, ongoing: 25, pending: 10, paused: 0 },

  /* ── Action Needed (triage strip) ───────────────────────────── */
  actionNeeded: [
    { key: "overdue",   icon: "event_busy",     label: "Items overdue",   count: 2, tone: "red"   },
    { key: "expiring",  icon: "schedule",       label: "Docs expiring",   count: 4, tone: "amber" },
    { key: "checklist", icon: "fact_check",     label: "Checklist issues", count: 0, tone: "green" },
  ],

  /* ── Action Preview (tabbed) ────────────────────────────────── */
  preview: {
    fuel: [
      {
        date: "9 Jun 2026, 10:42 AM", item: "STG0234 · P-R&R Tawar", cat: "Fuel Transaction", catTone: "green",
        detail: "Diesel · RM 2.62/L · 96.45 L", amount: "−RM 469.69",
        spAccount: "STG-PTN-034", station: "P-R&R Tawar", direction: "Westbound Kedah", volume: "96.45 L", txnNo: "#91602488",
        subsidy: "RM 262.34", subsidyUsed: 262.34, subsidyLimit: 500,
      },
      {
        date: "8 Jun 2026, 11:05 AM", item: "STG1161 · P-Jerangau TRG", cat: "Fuel Transaction", catTone: "green",
        detail: "Diesel · RM 2.60/L · 180.01 L", amount: "−RM 876.63",
        spAccount: "STG-PTN-161", station: "P-Jerangau TRG", direction: "Eastbound Terengganu", volume: "180.01 L", txnNo: "#91602173",
        subsidy: "RM 401.18", subsidyUsed: 401.18, subsidyLimit: 600,
      },
    ],
    due: [
      { date: "9 Jun 2026, 08:15 AM", item: "VANB791 · NISSAN NV200", cat: "Maintenance Due", catTone: "amber", detail: "Engine Oil Change · Due in 2 days", amount: "—" },
      { date: "8 Jun 2026, 06:30 PM", item: "WXX1234 · HINO 300",     cat: "Inspection Due",  catTone: "amber", detail: "Roadtax Expiry · Due in 5 days",  amount: "—" },
      { date: "8 Jun 2026, 03:22 PM", item: "DRV0045 · Ahmad Razif",  cat: "License Expiry",  catTone: "red",   detail: "GDL Expiry · Due in 7 days",     amount: "—" },
    ],
    checklists: [
      { date: "9 Jun 2026, 07:30 AM", item: "STG1161 · Ahmad Razif", cat: "Check-out", catTone: "green", detail: "Pre-trip checklist · Pending endorse", amount: "—" },
    ],
    trips: [
      { date: "9 Jun 2026, 09:00 AM", item: "STG0234 · KL → Ipoh",  cat: "Ongoing",   catTone: "green", detail: "ETA 1:30 PM · 62% complete", amount: "—" },
      { date: "9 Jun 2026, 08:00 AM", item: "VANB791 · KL → Melaka", cat: "Pending",   catTone: "amber", detail: "Not started · Assigned",     amount: "—" },
    ],
  },
};
