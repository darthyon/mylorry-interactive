/* ============================================================
   Host Portal — Agent Commission Config mock data
   Plain JS, loaded before Babel components. Exposes window.HC.*
   ============================================================ */
(function () {

  const AGENTS = [
    { id:"AG-0042", num:1,  referrer:false, name:"Kenneth Wang",               mobile:"0123456789", email:"kenneth@mylorry.ai",       ic:"820101-05-1234", bankName:"Maybank",      accNo:"112361629821", accName:"Kenneth Wang", joined:"Aug 2024", status:"active",      accountStatus:"active",     spCount:6,  volume:213400, commission:2347.00, kpiMult:100, kpiTarget:200000, kpiPct:106.7, kpiPhase:"active"   },
    { id:"AG-0019", num:2,  referrer:true,  name:"Ahmad Faris",                mobile:"0133029991", email:"ahmad.faris@gmail.com",    ic:"780515-08-6473", bankName:"CIMB",         accNo:"6364296502",   accName:"Ahmad Faris",         joined:"Jan 2022", status:"active",      accountStatus:"active",     spCount:11, volume:245600, commission:2890.00, kpiMult:100, kpiTarget:220000, kpiPct:111.6, kpiPhase:"active"   },
    { id:"AG-0031", num:3,  referrer:false, name:"Priya Nair",                 mobile:"0176699017", email:"priya.nair@gmail.com",     ic:"890322-10-5033", bankName:"Maybank",      accNo:"151333033049", accName:"Priya Nair", joined:"Mar 2023", status:"active",      accountStatus:"active",     spCount:8,  volume:187200, commission:1980.50, kpiMult:50,  kpiTarget:200000, kpiPct:93.6,  kpiPhase:"future"   },
    { id:"AG-0038", num:4,  referrer:true,  name:"Siti Rahimah",               mobile:"0193088813", email:"siti.rahimah@mylorry.ai", ic:"900611-05-5240", bankName:"Public Bank",  accNo:"3241880123",   accName:"Siti Rahimah Binti Aziz", joined:"Jun 2023", status:"active",      accountStatus:"inactive",   spCount:7,  volume:156800, commission:1654.00, kpiMult:50,  kpiTarget:200000, kpiPct:78.4,  kpiPhase:"complete" },
    { id:"AG-0055", num:5,  referrer:false, name:"Tan Wei Lin",                mobile:"0123456789", email:"tansuemei@gmail.com",      ic:"950110-10-6344", bankName:"Public Bank",  accNo:"162469343518", accName:"Tan Wei Lin", joined:"Nov 2024", status:"active",      accountStatus:"active",     spCount:4,  volume:98300,  commission:0,        kpiMult:0,   kpiTarget:200000, kpiPct:49.2,  kpiPhase:"active"   },
    { id:"AG-0067", num:6,  referrer:true,  name:"Raj Selvam",                 mobile:"0107899028", email:"raj@mylorry.ai",           ic:"851204-14-3598", bankName:"-",            accNo:"-",            accName:"-", joined:"Feb 2025", status:"terminating", accountStatus:"terminated", spCount:3,  volume:61200,  commission:0,        kpiMult:0,   kpiTarget:200000, kpiPct:30.6,  kpiPhase:"complete" },
    { id:"AG-0071", num:7,  referrer:false, name:"Norafizah Binti Mohd Yasin", mobile:"0123456789", email:"norafizah@gmail.com",      ic:"801218-05-5240", bankName:"Maybank",      accNo:"151333033049", accName:"Norafizah Binti Mohd Yasin", joined:"Mar 2024", status:"active",      accountStatus:"active",     spCount:5,  volume:122000, commission:1280.00, kpiMult:100, kpiTarget:120000, kpiPct:101.7, kpiPhase:"active"   },
    { id:"AG-0083", num:8,  referrer:true,  name:"Marcus Yong",                mobile:"0162173396", email:"marcusyong@mylorry.ai",    ic:"820609-05-5073", bankName:"-",            accNo:"-",            accName:"-",         joined:"Sep 2021", status:"active",      accountStatus:"active",     spCount:14, volume:298400, commission:3540.00, kpiMult:100, kpiTarget:240000, kpiPct:124.3, kpiPhase:"complete" },
    { id:"AG-0091", num:9,  referrer:false, name:"Cheah Kok Bin",              mobile:"0123040700", email:"max@maxador.com",          ic:"781008-08-6473", bankName:"Public Bank",  accNo:"6364296502",   accName:"Cheah Kok Bin", joined:"Dec 2023", status:"active",      accountStatus:"suspended",  spCount:6,  volume:143200, commission:1560.00, kpiMult:100, kpiTarget:150000, kpiPct:95.5,  kpiPhase:"active"   },
  ];

  const AGENT_CONFIG = {
    id:"AG-0042", num:1, name:"Kenneth Wang",
    mobile:"0123456789", email:"kenneth@mylorry.ai", ic:"820101-05-1234",
    bankName:"Maybank", accNo:"112361629821", accName:"Kenneth Wang",
    referrer:false, joined:"Aug 2024", status:"active",
    accountStatus:"active",
    bank:"Maybank · ****4821", lastSync:"09 Jun 2026, 09:15",

    kpi: {
      evalPeriodOpt: "Yearly",
      progressPeriod: "Dec 1–31",
      actual: 213400,
      locked: false,
      current: {
        version:3, effective:"Dec 2026", target:200000,
        thresholds: [
          { tier:"Tier 1", minPct:100, mult:100, isFinal:true },
          { tier:"Tier 2", minPct:75,  mult:50  },
          { tier:"Tier 3", minPct:0,   mult:0   },
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
      { sp:"CK-PTN-001",   org:"CK Timber Transport Sdn Bhd",  volume:52400, eff:"01 Jan 2026", end:"Dec 2028", exception:null,                         commissionStatus:"activated"           },
      { sp:"SUM-PTN-012",  org:"Summit Global Logistics",      volume:46900, eff:"01 Jan 2026", end:"Dec 2028", exception:null,                         commissionStatus:"activated"           },
      { sp:"MEGA-PTN-007", org:"Mega Fleet Logistics",         volume:38200, eff:"01 Jan 2026", end:"Dec 2028", exception:null,                         commissionStatus:"activated"           },
      { sp:"PIN-PTN-033",  org:"Pinnacle Transport Solutions", volume:31500, eff:"01 Jul 2026", end:"Dec 2028", exception:{ mode:"auto",   rate:100 },   commissionStatus:"activated"           },
      { sp:"RAP-PTN-021",  org:"Rapid Haulage Sdn Bhd",        volume:24600, eff:"18 Feb 2026", end:"Dec 2028", exception:{ mode:"custom", rate:50 },    commissionStatus:"on_hold"             },
      { sp:"VAN-PTN-045",  org:"Vanguard Logistics Systems",   volume:0,     eff:"01 Jun 2026", end:"Dec 2028", exception:null,                         commissionStatus:"pending_onboarding"  },
    ],

    availableSP: [
      { sp:"ARC-PTN-063", org:"Arcadian Haulage",         volume:28700 },
      { sp:"BLU-PTN-088", org:"Bluechip Freight Sdn Bhd", volume:14200 },
      { sp:"GLD-PTN-071", org:"Golden Transport Corp",    volume:9800  },
    ],

    termination: { date:null, holdState:false },

    otherAgents: [
      { id:"AG-0019", name:"Ahmad Faris"  },
      { id:"AG-0031", name:"Priya Nair"   },
      { id:"AG-0038", name:"Siti Rahimah" },
      { id:"AG-0055", name:"Tan Wei Lin"  },
    ],
  };

  /* ─── MyFuel Commission Records (current period) ─────────────── */
  const MYFUEL_RECORDS = [
    { agentId:"AG-0042", agentName:"Kenneth Wang",               spCount:6,  totalLiters:213400, kpiTarget:200000, kpiPct:106.7, commission:2347.00, payout:"Pending",  period:"Jun 2026" },
    { agentId:"AG-0019", agentName:"Ahmad Faris",                spCount:11, totalLiters:245600, kpiTarget:220000, kpiPct:111.6, commission:2890.00, payout:"Approved", period:"Jun 2026" },
    { agentId:"AG-0031", agentName:"Priya Nair",                 spCount:8,  totalLiters:187200, kpiTarget:200000, kpiPct:93.6,  commission:1980.50, payout:"Pending",  period:"Jun 2026" },
    { agentId:"AG-0038", agentName:"Siti Rahimah",               spCount:7,  totalLiters:156800, kpiTarget:200000, kpiPct:78.4,  commission:1654.00, payout:"Paid",     period:"Jun 2026" },
    { agentId:"AG-0055", agentName:"Tan Wei Lin",                spCount:4,  totalLiters:98300,  kpiTarget:200000, kpiPct:49.2,  commission:0,       payout:"Pending",  period:"Jun 2026" },
    { agentId:"AG-0067", agentName:"Raj Selvam",                 spCount:3,  totalLiters:61200,  kpiTarget:200000, kpiPct:30.6,  commission:0,       payout:"Rejected", period:"Jun 2026" },
    { agentId:"AG-0071", agentName:"Norafizah B. Mohd Yasin",    spCount:5,  totalLiters:122000, kpiTarget:120000, kpiPct:101.7, commission:1280.00, payout:"Pending",  period:"Jun 2026" },
    { agentId:"AG-0083", agentName:"Marcus Yong",                spCount:14, totalLiters:298400, kpiTarget:240000, kpiPct:124.3, commission:3540.00, payout:"Approved", period:"Jun 2026" },
    { agentId:"AG-0091", agentName:"Cheah Kok Bin",              spCount:6,  totalLiters:143200, kpiTarget:150000, kpiPct:95.5,  commission:1560.00, payout:"Pending",  period:"Jun 2026" },
  ];

  /* ─── Per-SP Account breakdown (for drill-down) ──────────────── */
  const SP_COMMISSION_BREAKDOWN = {
    "AG-0042": [
      { sp:"CK-PTN-001",   org:"CK Timber Transport Sdn Bhd",  volume:52400, tier:"Tier 3", rate:0.015, commission:786.00,  commissionStatus:"activated"          },
      { sp:"SUM-PTN-012",  org:"Summit Global Logistics",       volume:46900, tier:"Tier 3", rate:0.015, commission:703.50,  commissionStatus:"activated"          },
      { sp:"MEGA-PTN-007", org:"Mega Fleet Logistics",          volume:38200, tier:"Tier 2", rate:0.010, commission:382.00,  commissionStatus:"activated"          },
      { sp:"PIN-PTN-033",  org:"Pinnacle Transport Solutions",  volume:31500, tier:"Tier 2", rate:0.010, commission:315.00,  commissionStatus:"activated"          },
      { sp:"RAP-PTN-021",  org:"Rapid Haulage Sdn Bhd",         volume:24600, tier:"Tier 1", rate:0.005, commission:0,      commissionStatus:"on_hold"            },
      { sp:"VAN-PTN-045",  org:"Vanguard Logistics Systems",    volume:0,     tier:"Tier 1", rate:0.005, commission:0,      commissionStatus:"pending_onboarding" },
    ],
    "AG-0019": [
      { sp:"ARC-PTN-001",  org:"Arcadian Haulage",              volume:38400, tier:"Tier 2", rate:0.010, commission:384.00,  commissionStatus:"activated" },
      { sp:"BLU-PTN-002",  org:"Bluechip Freight Sdn Bhd",      volume:31200, tier:"Tier 2", rate:0.010, commission:312.00,  commissionStatus:"activated" },
      { sp:"GLD-PTN-003",  org:"Golden Transport Corp",         volume:28400, tier:"Tier 2", rate:0.010, commission:284.00,  commissionStatus:"activated" },
      { sp:"EAG-PTN-004",  org:"Eagle Logistics Sdn Bhd",       volume:25600, tier:"Tier 2", rate:0.010, commission:256.00,  commissionStatus:"activated" },
      { sp:"SWF-PTN-005",  org:"SwiftHaul Transport",           volume:22800, tier:"Tier 1", rate:0.005, commission:114.00,  commissionStatus:"activated" },
      { sp:"IRT-PTN-006",  org:"IronTrail Trucking",             volume:21200, tier:"Tier 1", rate:0.005, commission:106.00,  commissionStatus:"activated" },
      { sp:"CGP-PTN-007",  org:"CargoPulse Express",            volume:19400, tier:"Tier 1", rate:0.005, commission:97.00,   commissionStatus:"activated" },
      { sp:"GSR-PTN-008",  org:"GoSwift Rides",                  volume:18900, tier:"Tier 1", rate:0.005, commission:94.50,   commissionStatus:"activated" },
      { sp:"TRW-PTN-009",  org:"TransWorld Cargo",              volume:17600, tier:"Tier 1", rate:0.005, commission:88.00,   commissionStatus:"activated" },
      { sp:"CLN-PTN-010",  org:"CleanShift Transit",             volume:15800, tier:"Tier 1", rate:0.005, commission:79.00,   commissionStatus:"activated" },
      { sp:"PKT-PTN-011",  org:"PeakTrans Logistics",            volume:6300,  tier:"Tier 1", rate:0.005, commission:31.50,   commissionStatus:"activated" },
    ],
    "AG-0083": [
      { sp:"FLT-PTN-021",  org:"Fleetmaster Corp",              volume:48200, tier:"Tier 3", rate:0.015, commission:723.00,  commissionStatus:"activated" },
      { sp:"TRK-PTN-022",  org:"TruckWorld Sdn Bhd",            volume:42100, tier:"Tier 3", rate:0.015, commission:631.50,  commissionStatus:"activated" },
      { sp:"LOG-PTN-023",  org:"Logix Solutions",               volume:35800, tier:"Tier 2", rate:0.010, commission:358.00,  commissionStatus:"activated" },
      { sp:"HVY-PTN-024",  org:"HeavyHaul Malaysia",            volume:31200, tier:"Tier 2", rate:0.010, commission:312.00,  commissionStatus:"activated" },
      { sp:"XPR-PTN-025",  org:"Express Fleet Bhd",             volume:26400, tier:"Tier 2", rate:0.010, commission:264.00,  commissionStatus:"activated" },
      { sp:"CAR-PTN-026",  org:"Cargo Nation",                  volume:22800, tier:"Tier 1", rate:0.005, commission:114.00,  commissionStatus:"activated" },
      { sp:"MTX-PTN-027",  org:"Matrix Transport",              volume:21500, tier:"Tier 1", rate:0.005, commission:107.50,  commissionStatus:"activated" },
      { sp:"RVR-PTN-028",  org:"Riverstone Logistics",          volume:19200, tier:"Tier 1", rate:0.005, commission:96.00,   commissionStatus:"activated" },
      { sp:"NXG-PTN-029",  org:"NextGen Freight",               volume:17900, tier:"Tier 1", rate:0.005, commission:89.50,   commissionStatus:"activated" },
      { sp:"ACE-PTN-030",  org:"Ace Logistics",                 volume:16400, tier:"Tier 1", rate:0.005, commission:82.00,   commissionStatus:"activated" },
      { sp:"VIT-PTN-031",  org:"Vital Transport",               volume:10400, tier:"Tier 1", rate:0.005, commission:52.00,   commissionStatus:"activated" },
      { sp:"OPT-PTN-032",  org:"Optimal Haulage",               volume:9200,  tier:"Tier 1", rate:0.005, commission:46.00,   commissionStatus:"activated" },
      { sp:"PRM-PTN-033",  org:"Premium Logistics Sdn Bhd",     volume:6300,  tier:"Tier 1", rate:0.005, commission:31.50,   commissionStatus:"activated" },
      { sp:"STR-PTN-034",  org:"Starfleet Transport",           volume:5200,  tier:"Tier 1", rate:0.005, commission:26.00,   commissionStatus:"activated" },
    ],
  };

  /* ─── Commission history — last 12 months per agent ─────────── */
  const COMMISSION_HISTORY = {
    "AG-0042": [
      { period:"Jul '25", commission:1820 }, { period:"Aug '25", commission:2100 },
      { period:"Sep '25", commission:1950 }, { period:"Oct '25", commission:2280 },
      { period:"Nov '25", commission:2150 }, { period:"Dec '25", commission:2890 },
      { period:"Jan '26", commission:2010 }, { period:"Feb '26", commission:2180 },
      { period:"Mar '26", commission:2340 }, { period:"Apr '26", commission:2250 },
      { period:"May '26", commission:2290 }, { period:"Jun '26", commission:2347 },
    ],
    "AG-0019": [
      { period:"Jul '25", commission:2200 }, { period:"Aug '25", commission:2450 },
      { period:"Sep '25", commission:2310 }, { period:"Oct '25", commission:2560 },
      { period:"Nov '25", commission:2480 }, { period:"Dec '25", commission:3200 },
      { period:"Jan '26", commission:2380 }, { period:"Feb '26", commission:2560 },
      { period:"Mar '26", commission:2710 }, { period:"Apr '26", commission:2620 },
      { period:"May '26", commission:2780 }, { period:"Jun '26", commission:2890 },
    ],
    "AG-0083": [
      { period:"Jul '25", commission:2900 }, { period:"Aug '25", commission:3100 },
      { period:"Sep '25", commission:2840 }, { period:"Oct '25", commission:3280 },
      { period:"Nov '25", commission:3050 }, { period:"Dec '25", commission:4100 },
      { period:"Jan '26", commission:2980 }, { period:"Feb '26", commission:3240 },
      { period:"Mar '26", commission:3410 }, { period:"Apr '26", commission:3380 },
      { period:"May '26", commission:3460 }, { period:"Jun '26", commission:3540 },
    ],
    _default: [
      { period:"Jul '25", commission:920  }, { period:"Aug '25", commission:1050 },
      { period:"Sep '25", commission:980  }, { period:"Oct '25", commission:1120 },
      { period:"Nov '25", commission:1050 }, { period:"Dec '25", commission:1380 },
      { period:"Jan '26", commission:1020 }, { period:"Feb '26", commission:1090 },
      { period:"Mar '26", commission:1150 }, { period:"Apr '26", commission:1110 },
      { period:"May '26", commission:1130 }, { period:"Jun '26", commission:1160 },
    ],
  };

  /* ─── MyFuel summary KPIs ────────────────────────────────────── */
  const MYFUEL_SUMMARY = {
    totalPayable: 15251.50,
    activeAgents: 7,
    pendingPayout: 5,
    period: "Jun 2026",
  };

  const BANKS  = ["Maybank","CIMB","Public Bank","RHB Bank","Hong Leong Bank","AmBank","Bank Islam","Bank Rakyat","BSN","OCBC","UOB","Standard Chartered"];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const fmtRM   = (n) => "RM " + n.toLocaleString("en-MY", { minimumFractionDigits:2, maximumFractionDigits:2 });
  const fmtL    = (n) => n.toLocaleString("en-US") + " L";
  const fmtRate = (r) => "RM " + r.toFixed(3) + "/L";

  window.HC = { AGENTS, AGENT_CONFIG, BANKS, MONTHS, MYFUEL_RECORDS, SP_COMMISSION_BREAKDOWN, COMMISSION_HISTORY, MYFUEL_SUMMARY, fmtRM, fmtL, fmtRate };
})();
