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
    used: 3240,
    quota: 5000,
    remaining: 1760,
    usedPct: 64.8,
    avgDailyUsage: 230,
    estimatedRunoutDays: 5,
    status: "at-risk", // healthy | at-risk | over | none
    insight: "At current rate, quota may run out before month-end.",
    cta: "View vehicles at risk",
    thresholds: { warning: 70, danger: 90 },
  },

  /* ── Mini stat cards ──────────────────────────────────────────── */
  miniStats: {
    mtdFuel: { litres: 3240, amount: 16488.00, subsidisedLitres: 2600, nonSubsidisedLitres: 640 },
    rebate: { amount: 486.20, vsLastMonth: 32 },
    fleetCards: { active: 14, total: 16, frozen: 2 },
  },

  /* ── Fuel Usage Trend ───────────────────────────────────────────
     For each time range and metric we keep subsidised + non-subsidised;
     the chart stacks them. Values are seeded to be plausible and
     reconcile with the hero quota / mini stats where possible. */
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
      txnId: "#90423543", card: "7825057307456000003", vehicle: "STG0234",
      station: "P-R&R Tawar Westbound KDH", volume: 96.45,
      product: "Diesel Max", unitPrice: 4.87, odometer: 346196,
      subsidyAmount: 262.34, amount: -469.69,
      cardTag: "Logistics A", date: "15 May 2026, 4:32 PM",
    },
    {
      txnId: "#90423512", card: "7825057307456000011", vehicle: "STG1161",
      station: "P-Jerangau TRG Eastbound TRG", volume: 180.01,
      product: "Diesel Max", unitPrice: 4.87, odometer: 128440,
      subsidyAmount: 401.18, amount: -876.63,
      cardTag: "N/A", date: "15 May 2026, 4:18 PM",
    },
    {
      txnId: "#90421887", card: "7825057307456000003", vehicle: "BPT8600",
      station: "P-Sungai Besi West FKL", volume: 38.26,
      product: "Diesel", unitPrice: 3.92, odometer: 78210,
      subsidyAmount: 67.72, amount: -150.00,
      cardTag: "Logistics A", date: "18 Mar 2026, 12:27 PM",
    },
    {
      txnId: "#90421865", card: "7825057307456000011", vehicle: "VGE8660",
      station: "P-SG Besi Highway East FKL", volume: 57.97,
      product: "Diesel", unitPrice: 4.12, odometer: 55340,
      subsidyAmount: 0.00, amount: -238.84,
      cardTag: "N/A", date: "18 Mar 2026, 12:13 PM",
    },
    {
      txnId: "#90421801", card: "7825057307456000003", vehicle: "BCA8831",
      station: "P-Sg Petani Northbound KDH", volume: 74.22,
      product: "Diesel Max", unitPrice: 4.21, odometer: 203780,
      subsidyAmount: 181.32, amount: -312.45,
      cardTag: "Logistics A", date: "18 Mar 2026, 11:52 AM",
    },
  ],

  /* ── Account Activity: Top-Up History ─────────────────────────── */
  topUps: [
    { date: "10 Jun 2026, 9:14 AM", paidAt: "10 Jun 2026", createdAt: "10-Jun-26, 9:14 AM", reference: "84371", accountCode: "XX-PTN-01", description: "Wallet top-up", amount: 5000.00, method: "Online banking", status: "successful" },
    { date: "28 May 2026, 2:30 PM", paidAt: "28 May 2026", createdAt: "28-May-26, 2:30 PM", reference: "84352", accountCode: "XX-PTN-01", description: "Corporate card", amount: 3000.00, method: "Credit card", status: "successful" },
    { date: "15 May 2026, 10:05 AM", paidAt: "15 May 2026", createdAt: "15-May-26, 10:05 AM", reference: "84298", accountCode: "XX-PTN-01", description: "Scheduled reload", amount: 2000.00, method: "Online banking", status: "pending" },
    { date: "2 Apr 2026, 11:20 AM", paidAt: "2 Apr 2026", createdAt: "2-Apr-26, 11:20 AM", reference: "84114", accountCode: "XX-PTN-01", description: "Manual top-up", amount: 4500.00, method: "Credit card", status: "successful" },
  ],

  /* ── Account Activity: Rebate History ─────────────────────────── */
  rebates: [
    { month: "Jun 2026", totalFuel: 3240, totalSubsidy: 1200.00, totalRebate: 486.20, status: "processed" },
    { month: "May 2026", totalFuel: 5100, totalSubsidy: 1950.00, totalRebate: 454.20, status: "processed" },
    { month: "Apr 2026", totalFuel: 4800, totalSubsidy: 1820.00, totalRebate: 420.00, status: "processed" },
    { month: "Mar 2026", totalFuel: 4200, totalSubsidy: 1600.00, totalRebate: 380.50, status: "processed" },
  ],
};
