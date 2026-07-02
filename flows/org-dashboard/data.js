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
  // wallets: each entry is a separate provider account — never summed.
  // status: "healthy" | "low" | "critical"
  wallets: [
    {
      id: "petron",
      name: "Petron wallet",
      logo: "petron",
      amount: 12450.80,
      daysRemaining: 18,
      currentUsage: 1963.68,
      currentUsageLitres: 748.58,
      lastMonthUsage: 9999.89,
      lastMonthUsageLitres: 3816.75,
      status: "healthy",
    },
    {
      id: "petronas",
      name: "Petronas wallet",
      logo: "petronas",
      amount: 3110.30,
      daysRemaining: 5,
      currentUsage: 820.00,
      currentUsageLitres: 312.40,
      lastMonthUsage: 4200.00,
      lastMonthUsageLitres: 1600.00,
      status: "low",
    },
    {
      id: "shell",
      name: "Shell wallet",
      logo: "shell",
      amount: 1100.00,
      daysRemaining: 3,
      currentUsage: 380.00,
      currentUsageLitres: 144.20,
      lastMonthUsage: 2100.00,
      lastMonthUsageLitres: 800.00,
      status: "low",
    },
  ],
  operatingCost: {
    today: 12500,      // RM total today
    trendPct: 8,       // vs yesterday
    trendDir: "up",    // up | down
    fuel: 5000,        // RM, only live category in v1
    comingSoonCategories: ["Toll", "Repair", "Insurance", "Others"],
  },
  vehicles: { total: 16, inUse: 3, unused: 12, inactive: 1 },
  drivers:  { total: 13, onDuty: 5, offDuty: 8 },

  /* ── Modules (state resolved per-tier in app.jsx) ───────────── */
  // baseState: "active" (gated on tier) | "soon" (coming soon, never unlocks in v1)
  modules: [
    { key: "myfuel",      name: "MyFuel",      iconSrc: "icons/myfuel.svg",      minTier: "free"    },
    { key: "myadmin",     name: "MyAdmin",     iconSrc: "icons/myadmin.svg",     minTier: "free"    },
    { key: "mytrip",      name: "MyTrip",      iconSrc: "icons/mytrip.svg",      minTier: "free" },
    { key: "myinsurance", name: "MyInsurance", iconSrc: "icons/myinsurance.svg"                     },
    { key: "mytraining",  name: "MyTraining",  iconSrc: "icons/mytraining.svg",  soon: true         },
  ],

  /* ── Operating Cost Trend ───────────────────────────────────── */
  // Fuel-only series in v1. Other categories render as "coming soon" legend.
  costTrend: {
    months: [
      { label: "Jul 2025", fuel: 7200  },
      { label: "Aug 2025", fuel: 7840  },
      { label: "Sep 2025", fuel: 8100  },
      { label: "Oct 2025", fuel: 8760  },
      { label: "Nov 2025", fuel: 9300  },
      { label: "Dec 2025", fuel: 9980  },
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
    { key: "vehicles",   icon: "calendar_today", label: "Vehicle reminders", supporting: "overdue",        count: 2, tone: "red",   tab: "due"       },
    { key: "documents",  icon: "badge",          label: "Driver documents",  supporting: "expiring soon",  count: 4, tone: "amber", tab: "documents" },
    { key: "checklists", icon: "fact_check",     label: "Safety checklist", supporting: "need endorsement", count: 0, tone: "green", tab: "checklists"},
    { key: "trips",      icon: "local_shipping", label: "Paused Trips",      supporting: "need attention",  count: 3, tone: "amber", tab: "trips"     },
  ],

  /* ── Action Preview (tabbed) ────────────────────────────────── */
  preview: {
    fuel: [
      {
        date: "9 Jun 2026, 10:42 AM", item: "STG0234 · P-R&R Tawar", cat: "Fuel Transaction", catTone: "green",
        detail: "Diesel · RM 2.62/L · 96.45 L", amount: "−RM 469.69",
        spAccount: "STG-PTN-034", station: "P-R&R Tawar", direction: "Westbound Kedah", volume: "96.45 L", txnNo: "#91602488",
        card: "7825057307456000003", product: "Diesel Max", unitPrice: 4.87, odometer: 346196, subsidyType: "B40", cardTag: "Logistics A",
        subsidy: "RM 262.34", subsidyUsed: 262.34, subsidyLimit: 500,
      },
      {
        date: "8 Jun 2026, 11:05 AM", item: "STG1161 · P-Jerangau TRG", cat: "Fuel Transaction", catTone: "green",
        detail: "Diesel · RM 2.60/L · 180.01 L", amount: "−RM 876.63",
        spAccount: "STG-PTN-161", station: "P-Jerangau TRG", direction: "Eastbound Terengganu", volume: "180.01 L", txnNo: "#91602173",
        card: "7825057307456000011", product: "Diesel Max", unitPrice: 4.87, odometer: 128440, subsidyType: "B40", cardTag: "N/A",
        subsidy: "RM 401.18", subsidyUsed: 401.18, subsidyLimit: 600,
      },
      {
        date: "7 Jun 2026, 03:14 PM", item: "BCA8831 · P-Sg Petani KDH", cat: "Fuel Transaction", catTone: "green",
        detail: "Diesel · RM 4.21/L · 74.22 L", amount: "−RM 312.45",
        spAccount: "STG-PTN-034", station: "P-Sg Petani KDH", direction: "Northbound Kedah", volume: "74.22 L", txnNo: "#91601920",
        card: "7825057307456000003", product: "Diesel Max", unitPrice: 4.21, odometer: 203780, subsidyType: "B40", cardTag: "Logistics A",
        subsidy: "RM 181.32", subsidyUsed: 181.32, subsidyLimit: 500,
      },
      {
        date: "6 Jun 2026, 09:55 AM", item: "WQM1190 · P-Sungai Besi FKL", cat: "Fuel Transaction", catTone: "green",
        detail: "Diesel · RM 3.92/L · 38.26 L", amount: "−RM 150.00",
        spAccount: "STG-PTN-034", station: "P-Sungai Besi West FKL", direction: "Westbound KL", volume: "38.26 L", txnNo: "#91601744",
        card: "7825057307456000003", product: "Diesel", unitPrice: 3.92, odometer: 78210, subsidyType: "B40", cardTag: "Logistics A",
        subsidy: "RM 67.72", subsidyUsed: 67.72, subsidyLimit: 500,
      },
      {
        date: "5 Jun 2026, 02:30 PM", item: "VGE8660 · P-SG Besi East FKL", cat: "Fuel Transaction", catTone: "green",
        detail: "Diesel · RM 4.12/L · 57.97 L", amount: "−RM 238.84",
        spAccount: "STG-PTN-161", station: "P-SG Besi Highway East FKL", direction: "Eastbound KL", volume: "57.97 L", txnNo: "#91601531",
        card: "7825057307456000011", product: "Diesel", unitPrice: 4.12, odometer: 55340, subsidyType: "B40", cardTag: "N/A",
        subsidy: "RM 0.00", subsidyUsed: 0, subsidyLimit: 600,
      },
      {
        date: "4 Jun 2026, 08:17 AM", item: "JKM4521 · P-R&R Rawang SGR", cat: "Fuel Transaction", catTone: "green",
        detail: "Diesel · RM 4.87/L · 120.50 L", amount: "−RM 586.84",
        spAccount: "STG-PTN-034", station: "P-R&R Rawang SGR", direction: "Northbound Selangor", volume: "120.50 L", txnNo: "#91601288",
        card: "7825057307456000003", product: "Diesel Max", unitPrice: 4.87, odometer: 412500, subsidyType: "B40", cardTag: "Logistics A",
        subsidy: "RM 310.45", subsidyUsed: 310.45, subsidyLimit: 500,
      },
    ],
    due: [
      { date: "9 Jun 2026, 08:15 AM", item: "VANB791 · NISSAN NV200",  cat: "Maintenance Due", catTone: "amber", detail: "Engine Oil Change · Due in 2 days",   amount: "—" },
      { date: "8 Jun 2026, 06:30 PM", item: "WXX1234 · HINO 300",      cat: "Inspection Due",  catTone: "amber", detail: "Roadtax Expiry · Due in 5 days",       amount: "—" },
      { date: "8 Jun 2026, 03:22 PM", item: "DRV0045 · Ahmad Razif",   cat: "License Expiry",  catTone: "red",   detail: "GDL Expiry · Due in 7 days",           amount: "—" },
      { date: "7 Jun 2026, 10:00 AM", item: "STG0848 · ISUZU ELF",     cat: "Maintenance Due", catTone: "amber", detail: "Tyre Rotation · Due in 10 days",       amount: "—" },
      { date: "6 Jun 2026, 02:00 PM", item: "DRV0034 · Mohd Fadzli",   cat: "License Expiry",  catTone: "amber", detail: "PSV Licence · Expiring in 14 days",    amount: "—" },
      { date: "5 Jun 2026, 09:00 AM", item: "STG2190 · HINO RANGER",   cat: "Inspection Due",  catTone: "amber", detail: "PUSPAKOM Inspection · Due in 18 days", amount: "—" },
    ],
    documents: [
      { date: "9 Jun 2026, 08:00 AM", item: "DRV0045 · Ahmad Razif",    cat: "GDL Expiry",      catTone: "red",   detail: "GDL · Expires in 7 days",          amount: "—" },
      { date: "8 Jun 2026, 06:00 PM", item: "DRV0034 · Mohd Fadzli",    cat: "Medical Due",     catTone: "amber", detail: "Medical Report · Due in 12 days",   amount: "—" },
      { date: "7 Jun 2026, 03:00 PM", item: "DRV0078 · Zulkifli Hamid", cat: "Passport Expiry", catTone: "amber", detail: "Passport · Expires in 21 days",     amount: "—" },
      { date: "6 Jun 2026, 09:00 AM", item: "DRV0021 · Karim Abdullah", cat: "Port Pass",       catTone: "amber", detail: "Port Pass · Expires in 28 days",    amount: "—" },
      { date: "5 Jun 2026, 11:00 AM", item: "DRV0056 · Hafiz Sulaiman", cat: "PSV Licence",     catTone: "amber", detail: "PSV Licence · Expires in 32 days",  amount: "—" },
      { date: "4 Jun 2026, 04:00 PM", item: "DRV0012 · Roslan Ibrahim", cat: "Medical Due",     catTone: "amber", detail: "Medical Report · Due in 45 days",   amount: "—" },
    ],
    checklists: [
      { date: "9 Jun 2026, 07:30 AM", item: "STG1161 · Ahmad Razif",    cat: "Check-out",  catTone: "green", detail: "Pre-trip checklist · Pending endorse",  amount: "—" },
      { date: "9 Jun 2026, 06:55 AM", item: "STG0234 · Mohd Fadzli",    cat: "Check-out",  catTone: "green", detail: "Pre-trip checklist · Pending endorse",  amount: "—" },
      { date: "8 Jun 2026, 08:10 AM", item: "BCA8831 · Zulkifli Hamid", cat: "Check-in",   catTone: "amber", detail: "Post-trip checklist · Pending endorse", amount: "—" },
      { date: "8 Jun 2026, 07:45 AM", item: "VANB791 · Karim Abdullah", cat: "Check-out",  catTone: "green", detail: "Pre-trip checklist · Pending endorse",  amount: "—" },
      { date: "7 Jun 2026, 09:20 AM", item: "WQM1190 · Hafiz Sulaiman", cat: "Check-in",   catTone: "amber", detail: "Post-trip checklist · Pending endorse", amount: "—" },
      { date: "7 Jun 2026, 08:00 AM", item: "JKM4521 · Roslan Ibrahim", cat: "Check-out",  catTone: "green", detail: "Pre-trip checklist · Pending endorse",  amount: "—" },
    ],
    trips: [
      { date: "9 Jun 2026, 09:00 AM", item: "STG0234 · KL → Ipoh",      cat: "Ongoing", catTone: "green", detail: "ETA 1:30 PM · 62% complete",  amount: "—" },
      { date: "9 Jun 2026, 08:00 AM", item: "VANB791 · KL → Melaka",     cat: "Paused",  catTone: "red",   detail: "Paused · Driver reported issue", amount: "—" },
      { date: "9 Jun 2026, 07:30 AM", item: "STG1161 · KL → Kuantan",    cat: "Ongoing", catTone: "green", detail: "ETA 3:00 PM · 41% complete",  amount: "—" },
      { date: "8 Jun 2026, 04:00 PM", item: "BCA8831 · Ipoh → Penang",   cat: "Paused",  catTone: "red",   detail: "Paused · Awaiting clearance", amount: "—" },
      { date: "8 Jun 2026, 02:00 PM", item: "WQM1190 · JB → KL",         cat: "Pending", catTone: "amber", detail: "Not started · Assigned",       amount: "—" },
      { date: "8 Jun 2026, 10:00 AM", item: "JKM4521 · Penang → Kedah",  cat: "Pending", catTone: "amber", detail: "Not started · Driver en route", amount: "—" },
    ],
  },
};
