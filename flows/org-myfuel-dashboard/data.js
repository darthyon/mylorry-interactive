/* data.js — hand-written mock data for the MyFuel Dashboard prototype.
   Populated Premium/Lite baseline. Subscription gating + empty/quota edge
   states are applied in app.jsx from the Tweaks panel. */
window.MYFUEL_DASH = {
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

  /* ── Balance Summary ──────────────────────────────────────────── */
  balance: {
    amount: 12450.80,
    daysRemaining: 18,
    currentUsage: 1963.68,    // RM
    currentUsageLitres: 748.58,
    lastMonthUsage: 9999.89,  // RM
    lastMonthUsageLitres: 3816.75,
  },

  /* ── Subsidy Quota hero ───────────────────────────────────────── */
  subsidyQuota: {
    monthLabel: "June 2026",
    fuelType: "B40 Diesel",
    used: 3240,
    quota: 5000,
    remaining: 1760,
    usedPct: 64.8,
    estimatedRunoutDays: 5,
    status: "at-risk", // healthy | at-risk | over | none
    insight: "At current rate, quota may run out before month-end.",
    cta: "View vehicles at risk",
    thresholds: { warning: 70, danger: 90 },
  },

  /* ── Mini stat cards ──────────────────────────────────────────── */
  miniStats: {
    mtdFuel: { litres: 3240, amount: 16488.00 },
    rebate: { amount: 486.20, vsLastMonth: 32 },
    fleetCards: { active: 14, total: 16, frozen: 2 },
  },

  /* ── Fuel Usage Trend ───────────────────────────────────────────
     For each time range and metric we keep subsidised + non-subsidised.
     When the user selects "Subsidy only" we render just the subsidised
     series. Values are seeded to be plausible and reconcile with the
     hero quota / mini stats where possible. */
  usageTrend: {
    today: {
      labels: ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"],
      litres: {
        subsidised: [45, 120, 580, 490, 310, 180],
        nonSubsidised: [12, 35, 140, 95, 70, 40],
      },
      amount: {
        subsidised: [230, 612, 2958, 2499, 1581, 918],
        nonSubsidised: [78, 228, 913, 620, 456, 261],
      },
      subsidyOnly: {
        subsidised: [45, 120, 580, 490, 310, 180],
        nonSubsidised: [0, 0, 0, 0, 0, 0],
      },
    },
    mtd: {
      labels: ["1 Jun", "2 Jun", "3 Jun", "4 Jun", "5 Jun", "6 Jun", "7 Jun", "8 Jun", "9 Jun"],
      litres: {
        subsidised: [380, 420, 350, 510, 480, 390, 410, 450, 350],
        nonSubsidised: [80, 95, 70, 110, 100, 85, 90, 105, 75],
      },
      amount: {
        subsidised: [1932, 2136, 1780, 2592, 2440, 1983, 2084, 2288, 1780],
        nonSubsidised: [520, 618, 455, 715, 650, 553, 585, 683, 488],
      },
      subsidyOnly: {
        subsidised: [380, 420, 350, 510, 480, 390, 410, 450, 350],
        nonSubsidised: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    },
    sixMonth: {
      labels: ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026"],
      litres: {
        subsidised: [5200, 4800, 6100, 5900, 7200, 3240],
        nonSubsidised: [1100, 950, 1300, 1200, 1500, 850],
      },
      amount: {
        subsidised: [26452, 24418, 31047, 30023, 36642, 16488],
        nonSubsidised: [7150, 6175, 8450, 7800, 9750, 5525],
      },
      subsidyOnly: {
        subsidised: [5200, 4800, 6100, 5900, 7200, 3240],
        nonSubsidised: [0, 0, 0, 0, 0, 0],
      },
    },
  },

  /* ── Subsidy Quota by Vehicle ───────────────────────────────────
     Per-vehicle quota seeded 500–1000 L with a mix of within/at-risk/over
     and one no-quota row so every edge state is visible. */
  quotaByVehicle: [
    { plate: "STG0234", quota: 800, used: 780 },
    { plate: "STG1161", quota: 700, used: 720 },
    { plate: "BCA8831", quota: 600, used: 540 },
    { plate: "WQM1190", quota: 1000, used: 620 },
    { plate: "JKM4521", quota: 500, used: 310 },
    { plate: "VAN1234", quota: 800, used: 120 },
    { plate: "HINO300", quota: 900, used: 450 },
    { plate: "STG0848", quota: 600, used: 610 },
    { plate: "STG2190", quota: 700, used: 210 },
    { plate: "VANB112", quota: 500, used: 0 },
    { plate: "JQB4410", quota: 800, used: 820 },
    { plate: "WXX8821", quota: 600, used: 300 },
    { plate: "NOQUOTA", quota: 0, used: 120 },
  ],

  /* ── Account Activity: Fuel Transactions ──────────────────────── */
  transactions: [
    {
      card: "7825057307456000003",
      vehicle: "STG0234",
      station: "P-R&R Tawar Westbound KDH",
      volume: 96.45,
      subsidyType: "B40",
      subsidyAmount: 262.34,
      amount: -469.69,
      date: "15 May 2026, 4:32 PM",
    },
    {
      card: "7825057307456000011",
      vehicle: "STG1161",
      station: "P-Jerangau TRG Eastbound TRG",
      volume: 180.01,
      subsidyType: "B40",
      subsidyAmount: 401.18,
      amount: -876.63,
      date: "15 May 2026, 4:18 PM",
    },
    {
      card: "7825057307456000003",
      vehicle: "BPT8600",
      station: "P-Sungai Besi West FKL",
      volume: 38.26,
      subsidyType: "B40",
      subsidyAmount: 67.72,
      amount: -150.00,
      date: "18 Mar 2026, 12:27 PM",
    },
    {
      card: "7825057307456000011",
      vehicle: "VGE8660",
      station: "P-SG Besi Highway East FKL",
      volume: 57.97,
      subsidyType: "B40",
      subsidyAmount: 0.00,
      amount: -238.84,
      date: "18 Mar 2026, 12:13 PM",
    },
    {
      card: "7825057307456000003",
      vehicle: "BCA8831",
      station: "P-Sg Petani Northbound KDH",
      volume: 74.22,
      subsidyType: "B40",
      subsidyAmount: 181.32,
      amount: -312.45,
      date: "18 Mar 2026, 11:52 AM",
    },
  ],

  /* ── Account Activity: Top-Up History ─────────────────────────── */
  topUps: [
    { date: "10 Jun 2026, 9:14 AM", amount: 5000.00, method: "Online Banking", status: "successful" },
    { date: "28 May 2026, 2:30 PM", amount: 3000.00, method: "Credit Card", status: "successful" },
    { date: "15 May 2026, 10:05 AM", amount: 2000.00, method: "Online Banking", status: "pending" },
    { date: "2 Apr 2026, 11:20 AM", amount: 4500.00, method: "Credit Card", status: "successful" },
  ],

  /* ── Account Activity: Rebate History ─────────────────────────── */
  rebates: [
    { month: "Jun 2026", totalFuel: 3240, totalSubsidy: 1200.00, totalRebate: 486.20, status: "processed" },
    { month: "May 2026", totalFuel: 5100, totalSubsidy: 1950.00, totalRebate: 454.20, status: "processed" },
    { month: "Apr 2026", totalFuel: 4800, totalSubsidy: 1820.00, totalRebate: 420.00, status: "processed" },
    { month: "Mar 2026", totalFuel: 4200, totalSubsidy: 1600.00, totalRebate: 380.50, status: "processed" },
  ],
};
