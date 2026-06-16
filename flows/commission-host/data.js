/* ============================================================
   Host Portal — Agent Commission Config mock data
   Plain JS, loaded before Babel components. Exposes window.HC.*
   ============================================================ */
(function () {

  const AGENTS = [
    { id:"AG-0042", num:1,  referrer:false, name:"Kenneth Wang",               mobile:"0123456789", email:"kenneth@mylorry.ai",       ic:"820101-05-1234", bankName:"Maybank",      accNo:"112361629821", accName:"Kenneth Wang", joined:"Aug 2024", status:"active",      accountStatus:"active",     spCount:6,  volume:166720, commission:1093.25, kpiMult:50,  kpiTarget:200000, kpiPct:83.4,  kpiPhase:"active"   },
    { id:"RF-0019", num:2,  referrer:true,  name:"Ahmad Faris",                mobile:"0133029991", email:"ahmad.faris@gmail.com",    ic:"780515-08-6473", bankName:"CIMB",         accNo:"6364296502",   accName:"Ahmad Faris",         joined:"Jan 2022", status:"active",      accountStatus:"active",     spCount:11, volume:245600, commission:2890.00, kpiMult:100, kpiTarget:220000, kpiPct:111.6, kpiPhase:"active"   },
    { id:"AG-0031", num:3,  referrer:false, name:"Priya Nair",                 mobile:"0176699017", email:"priya.nair@gmail.com",     ic:"890322-10-5033", bankName:"Maybank",      accNo:"151333033049", accName:"Priya Nair", joined:"Mar 2023", status:"active",      accountStatus:"active",     spCount:8,  volume:180000, commission:1890.00, kpiMult:50,  kpiTarget:200000, kpiPct:90.0,  kpiPhase:"active"   },
    { id:"RF-0038", num:4,  referrer:true,  name:"Siti Rahimah",               mobile:"0193088813", email:"siti.rahimah@mylorry.ai", ic:"900611-05-5240", bankName:"Public Bank",  accNo:"3241880123",   accName:"Siti Rahimah Binti Aziz", joined:"Jun 2023", status:"active",      accountStatus:"active",     spCount:7,  volume:120000, commission:1260.00, kpiMult:50,  kpiTarget:200000, kpiPct:60.0,  kpiPhase:"complete" },
    { id:"AG-0055", num:5,  referrer:false, name:"Tan Wei Lin",                mobile:"0123456789", email:"tansuemei@gmail.com",      ic:"950110-10-6344", bankName:"Public Bank",  accNo:"162469343518", accName:"Tan Wei Lin", joined:"Nov 2024", status:"active",      accountStatus:"active",     spCount:4,  volume:98300,  commission:0,        kpiMult:0,   kpiTarget:200000, kpiPct:49.2,  kpiPhase:"active"   },
    { id:"RF-0067", num:6,  referrer:true,  name:"Raj Selvam",                 mobile:"0107899028", email:"raj@mylorry.ai",           ic:"851204-14-3598", bankName:"-",            accNo:"-",            accName:"-", joined:"Feb 2025", status:"terminating", accountStatus:"terminated", spCount:3,  volume:61200,  commission:0,        kpiMult:0,   kpiTarget:200000, kpiPct:30.6,  kpiPhase:"complete" },
    { id:"AG-0071", num:7,  referrer:false, name:"Norafizah Binti Mohd Yasin", mobile:"0123456789", email:"norafizah@gmail.com",      ic:"801218-05-5240", bankName:"Maybank",      accNo:"151333033049", accName:"Norafizah Binti Mohd Yasin", joined:"Mar 2024", status:"active",      accountStatus:"active",     spCount:5,  volume:120000, commission:1280.00, kpiMult:100, kpiTarget:120000, kpiPct:100.0, kpiPhase:"active"   },
    { id:"RF-0083", num:8,  referrer:true,  name:"Marcus Yong",                mobile:"0162173396", email:"marcusyong@mylorry.ai",    ic:"820609-05-5073", bankName:"-",            accNo:"-",            accName:"-",         joined:"Sep 2021", status:"active",      accountStatus:"active",     spCount:14, volume:240000, commission:3120.00, kpiMult:100, kpiTarget:240000, kpiPct:100.0, kpiPhase:"complete" },
    { id:"AG-0091", num:9,  referrer:false, name:"Cheah Kok Bin",              mobile:"0123040700", email:"max@maxador.com",          ic:"781008-08-6473", bankName:"Public Bank",  accNo:"6364296502",   accName:"Cheah Kok Bin", joined:"Dec 2023", status:"active",      accountStatus:"active",     spCount:6,  volume:135000, commission:1470.00, kpiMult:100, kpiTarget:150000, kpiPct:90.0,  kpiPhase:"active"   },
  ];

  const AGENT_CONFIG = {
    id:"AG-0042", num:1, name:"Kenneth Wang",
    mobile:"0123456789", email:"kenneth@mylorry.ai", ic:"820101-05-1234",
    bankName:"Maybank", accNo:"112361629821", accName:"Kenneth Wang",
    referrer:false, joined:"Aug 2024", status:"active",
    accountStatus:"active",
    bank:"Maybank · ****4821", lastSync:"09 Jun 2026, 09:15",

    kpi: {
      evalPeriodOpt: "Last completed year",
      progressPeriod: "Dec 1–31",
      // De-inflated: KPI actual = Σ attributed volume across SP accounts (was 213,400 raw
      // full-volume, the piggybacking number). 166,720 / 200,000 = 83.4% → Tier 2 (×0.50).
      actual: 166720,
      locked: false,
      current: {
        version:3, effective:"Dec 2026", target:200000,
        thresholds: [
          { tier:"Tier 3", minPct:100, mult:100, isFinal:true },
          { tier:"Tier 2", minPct:75,  mult:50  },
          { tier:"Tier 1", minPct:0,   mult:0   },
        ],
      },
      history: [
        { version:3, effective:"Dec 2026", target:200000, status:"active"     },
        { version:2, effective:"Jan 2026", target:180000, status:"superseded" },
        { version:1, effective:"Jan 2025", target:150000, status:"superseded" },
      ],
    },

    tiers: [
      { id:1, from:0,     to:25000, rate:0.005, final:false },
      { id:2, from:25001, to:50000, rate:0.010, final:false },
      { id:3, from:50001, to:null,  rate:0.015, final:true  },
    ],

    spAccounts: [
      { sp:"CK-PTN-001",   org:"CK Timber Transport Sdn Bhd",  volume:52400, kpiSplitPct:90, kpiVolume:47160, eff:"01 Jan 2026", end:"Dec 2028", exception:null,                         commissionStatus:"activated"           },
      { sp:"SUM-PTN-012",  org:"Summit Global Logistics",      volume:46900, kpiSplitPct:90, kpiVolume:42210, eff:"01 Jan 2026", end:"Dec 2028", exception:null,                         commissionStatus:"activated"           },
      { sp:"MEGA-PTN-007", org:"Mega Fleet Logistics",         volume:38200, kpiSplitPct:85, kpiVolume:32470, eff:"01 Jan 2026", end:"Dec 2028", exception:null,                         commissionStatus:"activated"           },
      { sp:"PIN-PTN-033",  org:"Pinnacle Transport Solutions", volume:31500, kpiSplitPct:80, kpiVolume:25200, eff:"01 Jul 2026", end:"Dec 2028", exception:{ mode:"auto",   rate:100 },   commissionStatus:"activated"           },
      { sp:"RAP-PTN-021",  org:"Rapid Haulage Sdn Bhd",        volume:24600, kpiSplitPct:80, kpiVolume:19680, eff:"18 Feb 2026", end:"Dec 2028", exception:{ mode:"custom", rate:50 },    commissionStatus:"on_hold"             },
      { sp:"VAN-PTN-045",  org:"Vanguard Logistics Systems",   volume:0,     kpiSplitPct:0,  kpiVolume:0,     eff:"01 Jun 2026", end:"Dec 2028", exception:null,                         commissionStatus:"pending_onboarding"  },
    ],

    availableSP: [
      { sp:"ARC-PTN-063", org:"Arcadian Haulage",         volume:28700 },
      { sp:"BLU-PTN-088", org:"Bluechip Freight Sdn Bhd", volume:14200 },
      { sp:"GLD-PTN-071", org:"Golden Transport Corp",    volume:9800  },
    ],

    termination: {
      date: "2026-08-31",
      commissionEndDate: "2026-08-10",
      scheduledTransfer: {
        toAgentId: "AG-0031",
        effectiveCommissionMonth: "2026-09",
      },
    },

    otherAgents: [
      { id:"RF-0019", name:"Ahmad Faris"  },
      { id:"AG-0031", name:"Priya Nair"   },
      { id:"RF-0038", name:"Siti Rahimah" },
      { id:"AG-0055", name:"Tan Wei Lin"  },
    ],
  };

  /* ─── MyFuel Commission Records (current period) ─────────────── */
  const MYFUEL_RECORDS = [
    { agentId:"AG-0042", agentName:"Kenneth Wang",               spCount:6,  totalLiters:193600, attributedKpiVolume:166720, kpiTarget:200000, kpiPct:83.4,  commission:1093.25, payout:"Pending",  period:"Jun 2026" },
    { agentId:"RF-0019", agentName:"Ahmad Faris",                spCount:11, totalLiters:245600, kpiTarget:220000, kpiPct:111.6, commission:2890.00, payout:"Approved", period:"Jun 2026" },
    { agentId:"AG-0031", agentName:"Priya Nair",                 spCount:8,  totalLiters:180000, kpiTarget:200000, kpiPct:90.0,  kpiPhase:"active",   commission:1890.00, payout:"Pending",  period:"Jun 2026" },
    { agentId:"RF-0038", agentName:"Siti Rahimah",               spCount:7,  totalLiters:120000, kpiTarget:200000, kpiPct:60.0,  kpiPhase:"complete", commission:1260.00, payout:"Paid",     period:"Jun 2026" },
    { agentId:"AG-0055", agentName:"Tan Wei Lin",                spCount:4,  totalLiters:98300,  kpiTarget:200000, kpiPct:49.2,  kpiPhase:"active",   commission:0,       payout:"Pending",  period:"Jun 2026" },
    { agentId:"RF-0067", agentName:"Raj Selvam",                 spCount:3,  totalLiters:61200,  kpiTarget:200000, kpiPct:30.6,  kpiPhase:"complete", commission:0,       payout:"Rejected", period:"Jun 2026" },
    { agentId:"AG-0071", agentName:"Norafizah B. Mohd Yasin",    spCount:5,  totalLiters:120000, kpiTarget:120000, kpiPct:100.0, kpiPhase:"active",   commission:1280.00, payout:"Pending",  period:"Jun 2026" },
    { agentId:"RF-0083", agentName:"Marcus Yong",                spCount:14, totalLiters:240000, kpiTarget:240000, kpiPct:100.0, kpiPhase:"complete", commission:3120.00, payout:"Approved", period:"Jun 2026" },
    { agentId:"AG-0091", agentName:"Cheah Kok Bin",              spCount:6,  totalLiters:135000, kpiTarget:150000, kpiPct:90.0,  kpiPhase:"active",   commission:1470.00, payout:"Pending",  period:"Jun 2026" },
  ];

  /* ─── Per-SP Account breakdown (for drill-down) ──────────────────────────
     volume          = commission BASIS (full account volume) — NOT split by attribution
     kpiSplitPct     = this salesperson's KPI attribution share on the account (Model B)
     kpiVolume       = volume × kpiSplitPct/100  (the de-inflated KPI credit)
     baseCommission  = volume × rate (before KPI multiplier)
     kpiMult         = the AGENT's KPI multiplier, derived from Σ kpiVolume vs target
                       (Reading A: honest KPI achievement scales commission)
     finalCommission = baseCommission × kpiMult/100
     eff / end       = commission validity window (not payout) ──────────────── */
  const SP_COMMISSION_BREAKDOWN = {
    // AG-0042 (Kenneth) — worked example. Attributed KPI volume sums to 166,720 L →
    // 83.4% of target → Tier 2 → ×0.50. Commission basis volumes are unchanged.
    "AG-0042": [
      { sp:"CK-PTN-001",   org:"CK Timber Transport Sdn Bhd",  volume:52400, kpiSplitPct:90, kpiVolume:47160, tier:"Tier 3", rate:0.015, kpiMult:50, baseCommission:786.00, finalCommission:393.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated"          },
      { sp:"SUM-PTN-012",  org:"Summit Global Logistics",       volume:46900, kpiSplitPct:90, kpiVolume:42210, tier:"Tier 3", rate:0.015, kpiMult:50, baseCommission:703.50, finalCommission:351.75, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated"          },
      { sp:"MEGA-PTN-007", org:"Mega Fleet Logistics",          volume:38200, kpiSplitPct:85, kpiVolume:32470, tier:"Tier 2", rate:0.010, kpiMult:50, baseCommission:382.00, finalCommission:191.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated"          },
      { sp:"PIN-PTN-033",  org:"Pinnacle Transport Solutions",  volume:31500, kpiSplitPct:80, kpiVolume:25200, tier:"Tier 2", rate:0.010, kpiMult:50, baseCommission:315.00, finalCommission:157.50, eff:"01 Jul 2026", end:"31 Dec 2028", commissionStatus:"activated"          },
      { sp:"RAP-PTN-021",  org:"Rapid Haulage Sdn Bhd",         volume:24600, kpiSplitPct:80, kpiVolume:19680, tier:"Tier 1", rate:0.005, kpiMult:50, baseCommission:123.00, finalCommission:0,      eff:"18 Feb 2026", end:"31 Dec 2028", commissionStatus:"on_hold"            },
      { sp:"VAN-PTN-045",  org:"Vanguard Logistics Systems",    volume:0,     kpiSplitPct:0,  kpiVolume:0,     tier:"Tier 1", rate:0.005, kpiMult:50, baseCommission:0,      finalCommission:0,      eff:"01 Jun 2026", end:"31 Dec 2028", commissionStatus:"pending_onboarding" },
    ],
    "RF-0019": [
      { sp:"ARC-PTN-001",  org:"Arcadian Haulage",              volume:38400, tier:"Tier 2", rate:0.010, kpiMult:100, baseCommission:384.00, finalCommission:384.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"BLU-PTN-002",  org:"Bluechip Freight Sdn Bhd",      volume:31200, tier:"Tier 2", rate:0.010, kpiMult:100, baseCommission:312.00, finalCommission:312.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"GLD-PTN-003",  org:"Golden Transport Corp",         volume:28400, tier:"Tier 2", rate:0.010, kpiMult:100, baseCommission:284.00, finalCommission:284.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"EAG-PTN-004",  org:"Eagle Logistics Sdn Bhd",       volume:25600, tier:"Tier 2", rate:0.010, kpiMult:100, baseCommission:256.00, finalCommission:256.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"SWF-PTN-005",  org:"SwiftHaul Transport",           volume:22800, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:114.00, finalCommission:114.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"IRT-PTN-006",  org:"IronTrail Trucking",             volume:21200, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:106.00, finalCommission:106.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"CGP-PTN-007",  org:"CargoPulse Express",            volume:19400, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:97.00,  finalCommission:97.00,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"GSR-PTN-008",  org:"GoSwift Rides",                  volume:18900, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:94.50,  finalCommission:94.50,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"TRW-PTN-009",  org:"TransWorld Cargo",              volume:17600, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:88.00,  finalCommission:88.00,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"CLN-PTN-010",  org:"CleanShift Transit",             volume:15800, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:79.00,  finalCommission:79.00,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"PKT-PTN-011",  org:"PeakTrans Logistics",            volume:6300,  tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:31.50,  finalCommission:31.50,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
    ],
    "RF-0083": [
      { sp:"FLT-PTN-021",  org:"Fleetmaster Corp",              volume:48200, tier:"Tier 3", rate:0.015, kpiMult:100, baseCommission:723.00, finalCommission:723.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"TRK-PTN-022",  org:"TruckWorld Sdn Bhd",            volume:42100, tier:"Tier 3", rate:0.015, kpiMult:100, baseCommission:631.50, finalCommission:631.50, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"LOG-PTN-023",  org:"Logix Solutions",               volume:35800, tier:"Tier 2", rate:0.010, kpiMult:100, baseCommission:358.00, finalCommission:358.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"HVY-PTN-024",  org:"HeavyHaul Malaysia",            volume:31200, tier:"Tier 2", rate:0.010, kpiMult:100, baseCommission:312.00, finalCommission:312.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"XPR-PTN-025",  org:"Express Fleet Bhd",             volume:26400, tier:"Tier 2", rate:0.010, kpiMult:100, baseCommission:264.00, finalCommission:264.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"CAR-PTN-026",  org:"Cargo Nation",                  volume:22800, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:114.00, finalCommission:114.00, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"MTX-PTN-027",  org:"Matrix Transport",              volume:21500, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:107.50, finalCommission:107.50, eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"RVR-PTN-028",  org:"Riverstone Logistics",          volume:19200, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:96.00,  finalCommission:96.00,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"NXG-PTN-029",  org:"NextGen Freight",               volume:17900, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:89.50,  finalCommission:89.50,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"ACE-PTN-030",  org:"Ace Logistics",                 volume:16400, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:82.00,  finalCommission:82.00,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"VIT-PTN-031",  org:"Vital Transport",               volume:10400, tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:52.00,  finalCommission:52.00,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"OPT-PTN-032",  org:"Optimal Haulage",               volume:9200,  tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:46.00,  finalCommission:46.00,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"PRM-PTN-033",  org:"Premium Logistics Sdn Bhd",     volume:6300,  tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:31.50,  finalCommission:31.50,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
      { sp:"STR-PTN-034",  org:"Starfleet Transport",           volume:5200,  tier:"Tier 1", rate:0.005, kpiMult:100, baseCommission:26.00,  finalCommission:26.00,  eff:"01 Jan 2026", end:"31 Dec 2028", commissionStatus:"activated" },
    ],
  };

  /* ─── Commission history — last 12 months per agent ──────────────────────
     Each entry carries volume (L) + commission (RM) so charts can toggle
     between Volume and Amount. ────────────────────────────────────────────── */
  const COMMISSION_HISTORY = {
    "AG-0042": [
      { period:"Jul '25", volume:164000, commission:1820 }, { period:"Aug '25", volume:189000, commission:2100 },
      { period:"Sep '25", volume:176000, commission:1950 }, { period:"Oct '25", volume:205000, commission:2280 },
      { period:"Nov '25", volume:194000, commission:2150 }, { period:"Dec '25", volume:260000, commission:2890 },
      { period:"Jan '26", volume:181000, commission:2010 }, { period:"Feb '26", volume:196000, commission:2180 },
      { period:"Mar '26", volume:211000, commission:2340 }, { period:"Apr '26", volume:203000, commission:2250 },
      { period:"May '26", volume:206000, commission:2290 }, { period:"Jun '26", volume:213400, commission:2347 },
    ],
    "RF-0019": [
      { period:"Jul '25", volume:198000, commission:2200 }, { period:"Aug '25", volume:221000, commission:2450 },
      { period:"Sep '25", volume:208000, commission:2310 }, { period:"Oct '25", volume:230000, commission:2560 },
      { period:"Nov '25", volume:223000, commission:2480 }, { period:"Dec '25", volume:288000, commission:3200 },
      { period:"Jan '26", volume:214000, commission:2380 }, { period:"Feb '26", volume:230000, commission:2560 },
      { period:"Mar '26", volume:244000, commission:2710 }, { period:"Apr '26", volume:236000, commission:2620 },
      { period:"May '26", volume:250000, commission:2780 }, { period:"Jun '26", volume:245600, commission:2890 },
    ],
    "RF-0083": [
      { period:"Jul '25", volume:261000, commission:2900 }, { period:"Aug '25", volume:279000, commission:3100 },
      { period:"Sep '25", volume:256000, commission:2840 }, { period:"Oct '25", volume:295000, commission:3280 },
      { period:"Nov '25", volume:275000, commission:3050 }, { period:"Dec '25", volume:369000, commission:4100 },
      { period:"Jan '26", volume:268000, commission:2980 }, { period:"Feb '26", volume:292000, commission:3240 },
      { period:"Mar '26", volume:307000, commission:3410 }, { period:"Apr '26", volume:304000, commission:3380 },
      { period:"May '26", volume:311000, commission:3460 }, { period:"Jun '26", volume:298400, commission:3540 },
    ],
    _default: [
      { period:"Jul '25", volume:83000,  commission:920  }, { period:"Aug '25", volume:95000,  commission:1050 },
      { period:"Sep '25", volume:88000,  commission:980  }, { period:"Oct '25", volume:101000, commission:1120 },
      { period:"Nov '25", volume:95000,  commission:1050 }, { period:"Dec '25", volume:124000, commission:1380 },
      { period:"Jan '26", volume:92000,  commission:1020 }, { period:"Feb '26", volume:98000,  commission:1090 },
      { period:"Mar '26", volume:104000, commission:1150 }, { period:"Apr '26", volume:100000, commission:1110 },
      { period:"May '26", volume:102000, commission:1130 }, { period:"Jun '26", volume:104000, commission:1160 },
    ],
  };

  /* ─── Portfolio-wide 12-month commission trend (overview chart) ───────────
     Aggregate across all agents. amount = RM payable, volume = litres. ────── */
  const MYFUEL_TREND = [
    { period:"Jul '25", volume:1152000, amount:12800 }, { period:"Aug '25", volume:1206000, amount:13400 },
    { period:"Sep '25", volume:1179000, amount:13100 }, { period:"Oct '25", volume:1278000, amount:14200 },
    { period:"Nov '25", volume:1242000, amount:13800 }, { period:"Dec '25", volume:1521000, amount:16900 },
    { period:"Jan '26", volume:1188000, amount:13200 }, { period:"Feb '26", volume:1251000, amount:13900 },
    { period:"Mar '26", volume:1314000, amount:14600 }, { period:"Apr '26", volume:1287000, amount:14300 },
    { period:"May '26", volume:1341000, amount:14900 }, { period:"Jun '26", volume:1373000, amount:15252 },
  ];

  /* ─── MyFuel summary KPIs ────────────────────────────────────── */
  const MYFUEL_SUMMARY = {
    totalPayable: 15251.50,
    activeAgents: 7,
    period: "Jun 2026",
  };

  const AGENT_LOOKUP = Object.fromEntries(AGENTS.map((agent) => [agent.id, agent]));
  const MYFUEL_SALESPERSON_RECORDS = MYFUEL_RECORDS.map((record) => {
    const salesperson = AGENT_LOOKUP[record.agentId] || {};
    const role = salesperson.referrer ? "Referrer" : "Agent";
    return {
      ...record,
      salespersonId: record.agentId,
      salespersonName: record.agentName,
      role,
      roleKey: role.toLowerCase(),
      status: salesperson.status || "active",
    };
  });

  const TREND_PERIODS = Array.from(new Set(
    Object.values(COMMISSION_HISTORY)
      .flat()
      .filter(Boolean)
      .map((entry) => entry.period)
  ));

  const MYFUEL_ROLE_TREND = TREND_PERIODS.map((period, index) => {
    const roleTotals = AGENTS.reduce((totals, salesperson) => {
      const history = COMMISSION_HISTORY[salesperson.id] || COMMISSION_HISTORY._default || [];
      const point = history[index];
      if (!point || point.period !== period) return totals;
      const roleKey = salesperson.referrer ? "referrer" : "agent";
      totals[roleKey + "Volume"] += point.volume || 0;
      totals[roleKey + "Amount"] += point.amount ?? point.commission ?? 0;
      return totals;
    }, {
      agentVolume: 0,
      agentAmount: 0,
      referrerVolume: 0,
      referrerAmount: 0,
    });

    return {
      period,
      ...roleTotals,
      volume: roleTotals.agentVolume + roleTotals.referrerVolume,
      amount: roleTotals.agentAmount + roleTotals.referrerAmount,
    };
  });

  const BANKS  = ["Maybank","CIMB","Public Bank","RHB Bank","Hong Leong Bank","AmBank","Bank Islam","Bank Rakyat","BSN","OCBC","UOB","Standard Chartered"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const fmtRM   = (n) => "RM " + n.toLocaleString("en-MY", { minimumFractionDigits:2, maximumFractionDigits:2 });
  const fmtL    = (n) => n.toLocaleString("en-US") + " L";
  const fmtRate = (r) => "RM " + r.toFixed(3) + "/L";

  window.HC = {
    AGENTS,
    AGENT_CONFIG,
    BANKS,
    MONTHS,
    MYFUEL_RECORDS,
    MYFUEL_SALESPERSON_RECORDS,
    SP_COMMISSION_BREAKDOWN,
    COMMISSION_HISTORY,
    MYFUEL_TREND,
    MYFUEL_ROLE_TREND,
    MYFUEL_SUMMARY,
    fmtRM,
    fmtL,
    fmtRate
  };
})();
