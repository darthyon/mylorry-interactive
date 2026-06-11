/* ============================================================
   Agent Commission — mock data + the two-layer commission engine
   Plain JS (loads before the Babel components). Exposes window.AC.*
   ============================================================ */
(function () {
  // ---- Agent profile -------------------------------------------------
  const AGENT = {
    name: "Kenneth Wang",
    id: "AG-0042",
    role: "Internal Sales Agent",
    joined: "Aug 2024",
    bank: "Maybank · ****4821",
    lastSync: "06 Dec 2026, 09:15",
  };

  // ---- Agent-specific volume tier table (Layer 1) --------------------
  //  Set in Host > Per-Agent Config (NOT the SP Account rebate setting).
  const TIERS = [
    { id: 1, from: 0,      to: 25000,  rate: 0.005, label: "Tier 1" },
    { id: 2, from: 25001,  to: 45000,  rate: 0.010, label: "Tier 2" },
    { id: 3, from: 45001,  to: null,   rate: 0.015, label: "Tier 3", final: true },
  ];
  function tierFor(volume) {
    for (const t of TIERS) {
      if (t.to === null || volume <= t.to) return t;
    }
    return TIERS[TIERS.length - 1];
  }

  // ---- KPI policy (Layer 2) ------------------------------------------
  const KPI = {
    windowLabel: "1–31 Dec 2026",
    windowShort: "Dec 1–31",
    thresholds: [
      { min: 100, mult: 100, tier: "Tier 1", note: "Full commission" },
      { min: 75,  mult: 50,  tier: "Tier 2", note: "Half commission" },
      { min: 0,   mult: 0,   tier: "Tier 3", note: "No commission" },
    ],
    // scenarios change ONLY the target, so the same real usage yields a
    // different achievement % — demonstrates the model honestly.
    scenarios: {
      hit:     { target: 200000, label: "On target" },
      partial: { target: 260000, label: "Partial" },
      missed:  { target: 360000, label: "Below target" },
    },
  };
  function multiplierFor(achievementPct) {
    for (const th of KPI.thresholds) if (achievementPct >= th.min) return th;
    return KPI.thresholds[KPI.thresholds.length - 1];
  }

  // ---- SP Accounts under this agent (Dec 2026 period) ----------------
  //  exception: null | { mode:'auto', rate:100 } | { mode:'custom', rate:50 }
  const ORGS = [
    { sp: "CK-PTN-001",  org: "CK Timber Transport Sdn Bhd",  volume: 52400, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null,                     firstUsage: "15 Aug 2024" },
    { sp: "SUM-PTN-012", org: "Summit Global Logistics",      volume: 46900, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null,                     firstUsage: "02 Nov 2024" },
    { sp: "MEGA-PTN-007",org: "Mega Fleet Logistics",         volume: 38200, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null,                     firstUsage: "10 Mar 2025" },
    { sp: "PIN-PTN-033", org: "Pinnacle Transport Solutions", volume: 31500, eff: "01 Jul 2026", end: "31 Dec 2028", exception: { mode: "auto",   rate: 100 }, firstUsage: "01 Jul 2026" },
    { sp: "RAP-PTN-021", org: "Rapid Haulage Sdn Bhd",        volume: 24600, eff: "18 Feb 2026", end: "31 Dec 2028", exception: { mode: "custom", rate: 50 },  firstUsage: "18 Feb 2026" },
    { sp: "VAN-PTN-045", org: "Vanguard Logistics Systems",   volume: 19800, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null,                     firstUsage: "05 Jan 2024" },
  ];

  // ---- The engine ----------------------------------------------------
  function portfolioVolume(orgs) {
    return orgs.reduce((s, o) => s + o.volume, 0);
  }
  // Step 1 validity is assumed valid for the Dec 2026 period (all end 2028).
  // Returns per-org rows with the full breakdown.
  function compute(orgs, kpiMult) {
    return orgs.map((o) => {
      const tier = tierFor(o.volume);
      const base = o.volume * tier.rate;
      const exc = o.exception;
      const applied = exc ? exc.rate : kpiMult;          // Step 2 override
      const commission = base * (applied / 100);
      return {
        ...o, tier, base, appliedMult: applied,
        isException: !!exc, commission,
      };
    });
  }
  function summarise(rows) {
    const base = rows.reduce((s, r) => s + r.base, 0);
    const commission = rows.reduce((s, r) => s + r.commission, 0);
    return { base, commission };
  }

  // ---- 12-month history (Jan–Dec 2026) -------------------------------
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  // per-month volume factor vs the Dec snapshot, to make the trend feel real
  const FACTOR = [0.62,0.55,0.71,0.74,0.80,0.86,0.78,0.83,0.91,0.88,0.94,1.00];
  function buildHistory() {
    // 2026 multiplier is locked at 100% (from the Dec 2025 evaluation).
    return MONTHS.map((m, i) => {
      const f = FACTOR[i];
      // orgs only contribute from their effective month
      const effMonth = { "Jul": 6, "Feb": 1 };
      const active = ORGS.filter((o) => {
        if (o.sp === "PIN-PTN-033") return i >= 6; // Jul
        if (o.sp === "RAP-PTN-021") return i >= 1; // Feb
        return true;
      });
      const rows = active.map((o) => {
        const vol = Math.round(o.volume * f / 100) * 100;
        const tier = tierFor(vol);
        const base = vol * tier.rate;
        const applied = o.exception ? o.exception.rate : 100;
        return { sp: o.sp, org: o.org, vol, tier, base, applied, commission: base * applied / 100, isException: !!o.exception };
      });
      const vol = rows.reduce((s, r) => s + r.vol, 0);
      const commission = rows.reduce((s, r) => s + r.commission, 0);
      return {
        key: m + " 2026", month: m, year: 2026,
        volume: vol, mult: 100, commission,
        state: i === 11 ? "Pending" : i === 10 ? "Approved" : "Paid",
        rows,
      };
    });
  }

  // ---- formatting ----------------------------------------------------
  const fmtRM = (n) => "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtL  = (n) => n.toLocaleString("en-US") + " L";
  const fmtRate = (r) => "RM " + r.toFixed(3) + "/L";

  window.AC = {
    AGENT, TIERS, tierFor, KPI, multiplierFor, ORGS,
    portfolioVolume, compute, summarise, buildHistory,
    MONTHS, fmtRM, fmtL, fmtRate,
  };
})();
