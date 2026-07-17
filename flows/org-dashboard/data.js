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
      accNo: "CK-PTN-001",
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
      accNo: "CK-PTNS-001",
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
      accNo: "CK-SHL-001",
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
    { key: "mytrip",      name: "MyTrip",      iconSrc: "icons/mytrip.svg",      minTier: "premium" },
    { key: "myinsurance", name: "MyInsurance", iconSrc: "icons/myinsurance.svg", minTier: "free"    },
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
    { key: "vehicles",   icon: "calendar_today", label: "Vehicle Documents", supporting: "overdue",        count: 2, tone: "red",   tab: "due"       },
    { key: "documents",  icon: "badge",          label: "Driver Documents",  supporting: "expiring soon",  count: 4, tone: "amber", tab: "documents" },
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
    // Vehicle Due Dates — real vehicle document expiries only (matches the
    // Documents tab taxonomy in org-vehicle-list: Road Tax, Insurance,
    // Puspakom Service, Truck Permit). Maintenance-only items (oil change,
    // tyre rotation) and misplaced driver rows were dropped — they don't
    // fit the Issued/Expiry/Reminders shape this module uses everywhere else.
    due: [
      { plate: "VANB791", docType: "Insurance",       issuedDate: "2025-07-19", expireDate: "2026-07-19", reminders: [30, 14, 7] },
      { plate: "WXX1234", docType: "Road Tax",         issuedDate: "2025-07-22", expireDate: "2026-07-22", reminders: [30, 14, 7] },
      { plate: "STG0848", docType: "Truck Permit",     issuedDate: "2025-07-27", expireDate: "2026-07-27", reminders: [30] },
      { plate: "STG2190", docType: "Puspakom Service", issuedDate: "2026-02-04", expireDate: "2026-08-04", reminders: [60, 30, 7] },
    ],
    // Driver Due Dates — driver document expiries.
    documents: [
      { name: "Ahmad Razif",   docType: "GDL License",   issuedDate: "2024-07-24", expireDate: "2026-07-24", reminders: [30, 14, 7] },
      { name: "Mohd Fadzli",   docType: "Medical Report", issuedDate: "2025-07-29", expireDate: "2026-07-29", reminders: [30] },
      { name: "Zulkifli Hamid", docType: "Passport",      issuedDate: "2021-08-07", expireDate: "2026-08-07", reminders: [30] },
      { name: "Karim Abdullah", docType: "Port Pass",     issuedDate: "2025-08-14", expireDate: "2026-08-14", reminders: [30] },
      { name: "Hafiz Sulaiman", docType: "PSV Licence",   issuedDate: "2024-08-18", expireDate: "2026-08-18", reminders: [30, 14] },
      { name: "Roslan Ibrahim", docType: "Medical Report", issuedDate: "2025-08-31", expireDate: "2026-08-31", reminders: [30] },
    ],
    checklists: [
      {
        driver: "Ahmad Razif", plate: "STG1161",
        checkIn: "9 Jun 2026 · 7:02 AM", checkOut: "9 Jun 2026 · 7:30 AM",
        startMileage: 48210, endMileage: 48252,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",     status: "passed" },
        ],
      },
      {
        driver: "Mohd Fadzli", plate: "STG0234",
        checkIn: "9 Jun 2026 · 6:20 AM", checkOut: "9 Jun 2026 · 6:55 AM",
        startMileage: 91007, endMileage: 91043,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",     status: "passed" },
        ],
      },
      {
        driver: "Zulkifli Hamid", plate: "BCA8831",
        checkIn: "8 Jun 2026 · 7:40 AM", checkOut: "8 Jun 2026 · 8:10 AM",
        startMileage: 65330, endMileage: 65378,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "warning" },
          { label: "Daily Driver Checklist",     status: "warning" },
        ],
      },
      {
        driver: "Karim Abdullah", plate: "VANB791",
        checkIn: "8 Jun 2026 · 7:10 AM", checkOut: "8 Jun 2026 · 7:45 AM",
        startMileage: 33840, endMileage: 33879,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",     status: "passed" },
        ],
      },
      {
        driver: "Hafiz Sulaiman", plate: "WQM1190",
        checkIn: "7 Jun 2026 · 8:55 AM", checkOut: "7 Jun 2026 · 9:20 AM",
        startMileage: 120450, endMileage: 120498,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",     status: "warning" },
        ],
      },
      {
        driver: "Roslan Ibrahim", plate: "JKM4521",
        checkIn: "7 Jun 2026 · 7:35 AM", checkOut: "7 Jun 2026 · 8:00 AM",
        startMileage: 78120, endMileage: 78156,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",     status: "passed" },
        ],
      },
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
