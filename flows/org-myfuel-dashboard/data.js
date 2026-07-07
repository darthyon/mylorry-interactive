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

  user: { name: "Jackson Lee", role: "Organization User" },

  orgs: [
    { id: "padu", name: "Padu Logistik Sdn. Bhd.", role: "Admin" },
    { id: "swift", name: "Swift Cargo Express", role: "Admin" },
    { id: "bintang", name: "Bintang Freight Sdn. Bhd.", role: "Viewer" },
  ],

  /* ── Balance Summary ──────────────────────────────────────────── */
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
  balance: {
    amount: 12450.80,
    daysRemaining: 18,
    currentUsage: 1963.68,    // RM
    currentUsageLitres: 748.58,
    lastMonthUsage: 9999.89,  // RM
    lastMonthUsageLitres: 3816.75,
  },

  /* ── Subsidy Quota hero ───────────────────────────────────────── */
  subsidyAccounts: [
    {
      id: "subsidy-001",
      subsidyNo: "BUDI-458201",
      monthLabel: "June 2026",
      used: 2250,
      quota: 5000,
      remaining: 2750,
      usedPct: 45.0,
      avgDailyUsage: 230,
      estimatedRunoutDays: 12,
      status: "healthy",
      insight: "Usage is within quota.",
      cta: "View vehicles",
      thresholds: { warning: 90, danger: 100 },
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
    },
    {
      id: "subsidy-002",
      subsidyNo: "BUDI-458202",
      monthLabel: "June 2026",
      used: 3240,
      quota: 5000,
      remaining: 1760,
      usedPct: 64.8,
      avgDailyUsage: 230,
      estimatedRunoutDays: 5,
      status: "healthy",
      insight: "Usage is trending upward.",
      cta: "View vehicles",
      thresholds: { warning: 90, danger: 100 },
      quotaByVehicle: [
        { plate: "STG0234", quota: 800, used: 420 },
        { plate: "STG1161", quota: 700, used: 350 },
        { plate: "BCA8831", quota: 600, used: 390 },
        { plate: "WQM1190", quota: 1000, used: 910 },
        { plate: "JKM4521", quota: 500, used: 270 },
        { plate: "VAN1234", quota: 800, used: 540 },
        { plate: "HINO300", quota: 900, used: 820 },
        { plate: "STG0848", quota: 600, used: 300 },
        { plate: "STG2190", quota: 700, used: 120 },
        { plate: "VANB112", quota: 500, used: 280 },
      ],
    },
    {
      id: "subsidy-003",
      subsidyNo: "BUDI-458203",
      monthLabel: "June 2026",
      used: 4680,
      quota: 5000,
      remaining: 320,
      usedPct: 93.6,
      avgDailyUsage: 260,
      estimatedRunoutDays: 2,
      status: "at-risk",
      insight: "This subsidy number is close to exhaustion.",
      cta: "View vehicles at risk",
      thresholds: { warning: 90, danger: 100 },
      quotaByVehicle: [
        { plate: "STG0234", quota: 800, used: 790 },
        { plate: "STG1161", quota: 700, used: 670 },
        { plate: "BCA8831", quota: 600, used: 590 },
        { plate: "WQM1190", quota: 1000, used: 980 },
        { plate: "JKM4521", quota: 500, used: 430 },
        { plate: "VAN1234", quota: 800, used: 760 },
        { plate: "HINO300", quota: 900, used: 940 },
        { plate: "STG0848", quota: 600, used: 610 },
        { plate: "STG2190", quota: 700, used: 640 },
      ],
    },
  ],
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
    thresholds: { warning: 90, danger: 100 },
  },

  /* ── Mini stat cards ──────────────────────────────────────────── */
  miniStats: {
    mtdFuel: { litres: 6800, amount: 34600.00, subsidisedLitres: 2200, nonSubsidisedLitres: 4600 },
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
        subsidised: [12, 35, 140, 95, 70, 40],
        nonSubsidised: [45, 120, 580, 490, 310, 180],
      },
      amount: {
        subsidised: [78, 228, 913, 620, 456, 261],
        nonSubsidised: [230, 612, 2958, 2499, 1581, 918],
      },
    },
    mtd: {
      labels: ["1 Jun", "2 Jun", "3 Jun", "4 Jun", "5 Jun", "6 Jun", "7 Jun", "8 Jun", "9 Jun"],
      litres: {
        subsidised: [80, 95, 70, 110, 100, 85, 90, 105, 75],
        nonSubsidised: [380, 420, 350, 510, 480, 390, 410, 450, 350],
      },
      amount: {
        subsidised: [520, 618, 455, 715, 650, 553, 585, 683, 488],
        nonSubsidised: [1932, 2136, 1780, 2592, 2440, 1983, 2084, 2288, 1780],
      },
    },
    threeMonth: {
      labels: ["Apr 2026", "May 2026", "Jun 2026"],
      litres: {
        subsidised: [1200, 1500, 850],
        nonSubsidised: [5900, 7200, 5000],
      },
      amount: {
        subsidised: [7800, 9750, 5525],
        nonSubsidised: [30023, 36642, 24600],
      },
    },
    sixMonth: {
      labels: ["Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026"],
      litres: {
        subsidised: [1100, 950, 1300, 1200, 1500, 850],
        nonSubsidised: [5200, 4800, 6100, 5900, 7200, 5000],
      },
      amount: {
        subsidised: [7150, 6175, 8450, 7800, 9750, 5525],
        nonSubsidised: [26452, 24418, 31047, 30023, 36642, 24600],
      },
    },
    twelveMonth: {
      labels: ["Jul 2025", "Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026"],
      litres: {
        subsidised: [900, 850, 920, 980, 1050, 1000, 1100, 950, 1300, 1200, 1500, 850],
        nonSubsidised: [4200, 4100, 4500, 4800, 5100, 4900, 5200, 4800, 6100, 5900, 7200, 5000],
      },
      amount: {
        subsidised: [5850, 5525, 5980, 6370, 6825, 6500, 7150, 6175, 8450, 7800, 9750, 5525],
        nonSubsidised: [21366, 20870, 22910, 24418, 25992, 24973, 26452, 24418, 31047, 30023, 36642, 24600],
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
    { paidOn: "Paid on:", period: "01 Jun 2026 - 30 Jun 2026", accountNo: "000000", orgName: "Org 2134", provider: "Petron(referrer)", amount: 486.20, usage: 3240.00, groupUsage: 12800.00, type: "Credit note", status: "completed" },
    { paidOn: "Paid on:", period: "01 May 2026 - 31 May 2026", accountNo: "000000", orgName: "Org 2130", provider: "Petron(referrer)", amount: 454.20, usage: 5100.00, groupUsage: 14200.00, type: "Bank in personal", status: "pending" },
    { paidOn: "Paid on:", period: "01 Apr 2026 - 30 Apr 2026", accountNo: "000000", orgName: "Org 2128", provider: "Petron(referrer)", amount: 420.00, usage: 4800.00, groupUsage: 13100.00, type: "Credit note", status: "completed" },
    { paidOn: "Paid on:", period: "01 Mar 2026 - 31 Mar 2026", accountNo: "000000", orgName: "Org 2125", provider: "Petron(referrer)", amount: 380.50, usage: 4200.00, groupUsage: 11500.00, type: "Credit note", status: "completed" },
    { paidOn: "Paid on:", period: "01 Feb 2026 - 28 Feb 2026", accountNo: "000000", orgName: "Org 2122", provider: "Petron(referrer)", amount: 355.00, usage: 3900.00, groupUsage: 10800.00, type: "Credit note", status: "pending" },
    { paidOn: "Paid on:", period: "01 Jan 2026 - 31 Jan 2026", accountNo: "000000", orgName: "Org 2119", provider: "Petron(referrer)", amount: 372.50, usage: 4100.00, groupUsage: 12100.00, type: "Credit note", status: "completed" },
    { paidOn: "Paid on:", period: "01 Dec 2025 - 31 Dec 2025", accountNo: "000000", orgName: "Org 2116", provider: "Petron(referrer)", amount: 340.00, usage: 3800.00, groupUsage: 9900.00, type: "Credit note", status: "completed" },
    { paidOn: "Paid on:", period: "01 Nov 2025 - 30 Nov 2025", accountNo: "000000", orgName: "Org 2113", provider: "Petron(referrer)", amount: 405.00, usage: 4500.00, groupUsage: 13800.00, type: "Credit note", status: "pending" },
    { paidOn: "Paid on:", period: "01 Oct 2025 - 31 Oct 2025", accountNo: "000000", orgName: "Org 2110", provider: "Petron(referrer)", amount: 425.00, usage: 4700.00, groupUsage: 14500.00, type: "Credit note", status: "completed" },
    { paidOn: "Paid on:", period: "01 Sep 2025 - 30 Sep 2025", accountNo: "000000", orgName: "Org 2107", provider: "Petron(referrer)", amount: 390.00, usage: 4300.00, groupUsage: 11900.00, type: "Credit note", status: "completed" },
    { paidOn: "Paid on:", period: "01 Aug 2025 - 31 Aug 2025", accountNo: "000000", orgName: "Org 2104", provider: "Petron(referrer)", amount: 365.00, usage: 4000.00, groupUsage: 11200.00, type: "Credit note", status: "completed" },
    { paidOn: "Paid on:", period: "01 Jul 2025 - 31 Jul 2025", accountNo: "000000", orgName: "Org 2101", provider: "Petron(referrer)", amount: 330.00, usage: 3600.00, groupUsage: 9800.00, type: "Credit note", status: "pending" },
  ],

  /* ── Top 10 Petrol Stations ─────────────────────────────────────
     Range-keyed rankings so the card follows the same plan-driven
     period as Fuel Usage Trend (Free=3mo, Lite=6mo, Premium=12mo). */
  topPetrolStations: {
    threeMonth: [
      { rank: 1, name: "P-Northport SLG", pumps: 34, totalLitres: 1898.62, totalAmount: 11186.05 },
      { rank: 2, name: "P-Mambau Northbound NSM", pumps: 20, totalLitres: 798.10, totalAmount: 5017.20 },
      { rank: 3, name: "P-Pedas NSM", pumps: 12, totalLitres: 502.80, totalAmount: 3255.60 },
      { rank: 4, name: "P-Batu 8 Jln Bukit Kemuning SLG", pumps: 11, totalLitres: 529.21, totalAmount: 3102.60 },
      { rank: 5, name: "P-S2 Heights NSM", pumps: 8, totalLitres: 332.47, totalAmount: 2168.40 },
      { rank: 6, name: "P-Kesas Eastbound SLG", pumps: 7, totalLitres: 332.21, totalAmount: 1975.71 },
      { rank: 7, name: "P-Gunung Semanggol North PRK", pumps: 7, totalLitres: 179.89, totalAmount: 840.00 },
      { rank: 8, name: "P-B20 Sepang SLG", pumps: 6, totalLitres: 277.05, totalAmount: 1641.60 },
      { rank: 9, name: "P-Mambau NSM", pumps: 6, totalLitres: 201.18, totalAmount: 939.42 },
      { rank: 10, name: "P-R&R Rawang Northbound SLG", pumps: 5, totalLitres: 210.60, totalAmount: 1387.80 },
    ],
    sixMonth: [
      { rank: 1, name: "P-Northport SLG", pumps: 34, totalLitres: 2847.92, totalAmount: 16779.07 },
      { rank: 2, name: "P-Mambau Northbound NSM", pumps: 20, totalLitres: 1197.15, totalAmount: 7525.80 },
      { rank: 3, name: "P-Pedas NSM", pumps: 12, totalLitres: 754.20, totalAmount: 4883.40 },
      { rank: 4, name: "P-Batu 8 Jln Bukit Kemuning SLG", pumps: 11, totalLitres: 793.82, totalAmount: 4653.90 },
      { rank: 5, name: "P-S2 Heights NSM", pumps: 8, totalLitres: 498.71, totalAmount: 3252.60 },
      { rank: 6, name: "P-Kesas Eastbound SLG", pumps: 7, totalLitres: 498.32, totalAmount: 2963.57 },
      { rank: 7, name: "P-Gunung Semanggol North PRK", pumps: 7, totalLitres: 269.83, totalAmount: 1260.00 },
      { rank: 9, name: "P-B20 Sepang SLG", pumps: 6, totalLitres: 415.58, totalAmount: 2462.40 },
      { rank: 8, name: "P-Mambau NSM", pumps: 6, totalLitres: 301.77, totalAmount: 1409.13 },
      { rank: 10, name: "P-R&R Rawang Northbound SLG", pumps: 5, totalLitres: 315.90, totalAmount: 2081.70 },
    ],
    twelveMonth: [
      { rank: 1, name: "P-Northport SLG", pumps: 34, totalLitres: 3797.23, totalAmount: 22372.09 },
      { rank: 2, name: "P-Mambau Northbound NSM", pumps: 20, totalLitres: 1330.17, totalAmount: 8362.00 },
      { rank: 3, name: "P-Pedas NSM", pumps: 12, totalLitres: 838.00, totalAmount: 5426.00 },
      { rank: 4, name: "P-Batu 8 Jln Bukit Kemuning SLG", pumps: 11, totalLitres: 882.02, totalAmount: 5171.00 },
      { rank: 5, name: "P-S2 Heights NSM", pumps: 8, totalLitres: 554.12, totalAmount: 3614.00 },
      { rank: 6, name: "P-Kesas Eastbound SLG", pumps: 7, totalLitres: 553.69, totalAmount: 3292.85 },
      { rank: 7, name: "P-Gunung Semanggol North PRK", pumps: 7, totalLitres: 299.81, totalAmount: 1400.00 },
      { rank: 8, name: "P-B20 Sepang SLG", pumps: 6, totalLitres: 461.75, totalAmount: 2736.00 },
      { rank: 9, name: "P-Mambau NSM", pumps: 6, totalLitres: 335.30, totalAmount: 1565.70 },
      { rank: 10, name: "P-R&R Rawang Northbound SLG", pumps: 5, totalLitres: 351.00, totalAmount: 2313.00 },
    ],
  },
};
