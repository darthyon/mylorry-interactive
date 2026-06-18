/* ============================================================
   Referrer Commission — mock data + the two-layer commission engine
   Plain JS (loads before the Babel components). Exposes window.RC.*
   ============================================================ */
(function () {
  const REFERRER = {
    name: "Ahmad Faris",
    id: "RF-0019",
    joined: "Jan 2022",
    bank: "CIMB · ****6502",
    lastSync: "19 Jun 2026, 10:20",
  };

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

  const KPI = {
    windowLabel: "1-30 Jun 2026",
    windowShort: "Jun 1-30",
    thresholds: [
      { min: 100, mult: 100, tier: "Tier 3", note: "Full commission" },
      { min: 75,  mult: 50,  tier: "Tier 2", note: "Half commission" },
      { min: 0,   mult: 0,   tier: "Tier 1", note: "No commission" },
    ],
    scenarios: {
      hit:     { target: 220000, label: "On target" },
      partial: { target: 280000, label: "Partial" },
      missed:  { target: 340000, label: "Below target" },
    },
  };

  function multiplierFor(achievementPct) {
    for (const th of KPI.thresholds) if (achievementPct >= th.min) return th;
    return KPI.thresholds[KPI.thresholds.length - 1];
  }

  const ORGS = [
    { sp: "ARC-PTN-001", org: "Arcadian Haulage",         volume: 38400, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
    { sp: "BLU-PTN-002", org: "Bluechip Freight Sdn Bhd", volume: 31200, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
    { sp: "GLD-PTN-003", org: "Golden Transport Corp",    volume: 28400, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
    { sp: "EAG-PTN-004", org: "Eagle Logistics Sdn Bhd",  volume: 25600, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
    { sp: "SWF-PTN-005", org: "SwiftHaul Transport",      volume: 22800, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
    { sp: "IRT-PTN-006", org: "IronTrail Trucking",       volume: 21200, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
    { sp: "CGP-PTN-007", org: "CargoPulse Express",       volume: 19400, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
    { sp: "GSR-PTN-008", org: "GoSwift Rides",            volume: 18900, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
    { sp: "TRW-PTN-009", org: "TransWorld Cargo",         volume: 17600, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
    { sp: "CLN-PTN-010", org: "CleanShift Transit",       volume: 15800, eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
    { sp: "PKT-PTN-011", org: "PeakTrans Logistics",      volume: 6300,  eff: "01 Jan 2026", end: "31 Dec 2028", exception: null, firstUsage: "01 Jan 2026" },
  ];

  function portfolioVolume(orgs) {
    return orgs.reduce((sum, org) => sum + org.volume, 0);
  }

  function compute(orgs, kpiMult) {
    return orgs.map((org) => {
      const tier = tierFor(org.volume);
      const base = org.volume * tier.rate;
      const exc = org.exception;
      const applied = exc ? exc.rate : kpiMult;
      const commission = base * (applied / 100);
      return {
        ...org,
        tier,
        base,
        appliedMult: applied,
        isException: !!exc,
        commission,
      };
    });
  }

  function summarise(rows) {
    const base = rows.reduce((sum, row) => sum + row.base, 0);
    const commission = rows.reduce((sum, row) => sum + row.commission, 0);
    return { base, commission };
  }

  const HISTORY_SERIES = [
    { key: "Jul 2025", label: "Jul 2025", month: "Jul", year: 2025, volume: 198000, commission: 2200, target: 220000, mult: 100, tier: "Tier 3", note: "Full commission", state: "Paid" },
    { key: "Aug 2025", label: "Aug 2025", month: "Aug", year: 2025, volume: 221000, commission: 2450, target: 220000, mult: 100, tier: "Tier 3", note: "Full commission", state: "Paid" },
    { key: "Sep 2025", label: "Sep 2025", month: "Sep", year: 2025, volume: 208000, commission: 2310, target: 220000, mult: 50,  tier: "Tier 2", note: "Half commission", state: "Paid" },
    { key: "Oct 2025", label: "Oct 2025", month: "Oct", year: 2025, volume: 230000, commission: 2560, target: 220000, mult: 100, tier: "Tier 3", note: "Full commission", state: "Paid" },
    { key: "Nov 2025", label: "Nov 2025", month: "Nov", year: 2025, volume: 223000, commission: 2480, target: 220000, mult: 100, tier: "Tier 3", note: "Full commission", state: "Paid" },
    { key: "Dec 2025", label: "Dec 2025", month: "Dec", year: 2025, volume: 288000, commission: 3200, target: 220000, mult: 100, tier: "Tier 3", note: "Full commission", state: "Paid" },
    { key: "Jan 2026", label: "Jan 2026", month: "Jan", year: 2026, volume: 214000, commission: 2380, target: 220000, mult: 50,  tier: "Tier 2", note: "Half commission", state: "Paid" },
    { key: "Feb 2026", label: "Feb 2026", month: "Feb", year: 2026, volume: 230000, commission: 2560, target: 220000, mult: 100, tier: "Tier 3", note: "Full commission", state: "Paid" },
    { key: "Mar 2026", label: "Mar 2026", month: "Mar", year: 2026, volume: 244000, commission: 2710, target: 220000, mult: 100, tier: "Tier 3", note: "Full commission", state: "Paid" },
    { key: "Apr 2026", label: "Apr 2026", month: "Apr", year: 2026, volume: 236000, commission: 2620, target: 220000, mult: 100, tier: "Tier 3", note: "Full commission", state: "Paid" },
    { key: "May 2026", label: "May 2026", month: "May", year: 2026, volume: 250000, commission: 2780, target: 220000, mult: 100, tier: "Tier 3", note: "Full commission", state: "Approved" },
    { key: "Jun 2026", label: "Jun 2026", month: "Jun", year: 2026, volume: 245600, commission: 2890, target: 220000, mult: 100, tier: "Tier 3", note: "Full commission", state: "Approved" },
  ];

  const HISTORY_META = {
    defaultMonth: "Jun 2026",
    overviewLabel: "Jan-Jun 2026",
    historyLabel: "Last 12 months · Jul 2025-Jun 2026",
  };

  function scaledVolume(volume, factor) {
    return Math.max(0, Math.round(volume * factor / 100) * 100);
  }

  function buildHistory() {
    const currentTotal = portfolioVolume(ORGS);
    return HISTORY_SERIES.map((entry, index) => {
      const factor = currentTotal > 0 ? entry.volume / currentTotal : 0;
      const rows = ORGS.map((org) => {
        const volume = scaledVolume(org.volume, factor);
        const tier = tierFor(volume);
        const base = volume * tier.rate;
        const appliedMult = entry.mult;
        return {
          sp: org.sp,
          org: org.org,
          volume,
          vol: volume,
          tier,
          base,
          appliedMult,
          applied: appliedMult,
          commission: base * appliedMult / 100,
          isException: false,
          exception: null,
          eff: org.eff,
          end: org.end,
          firstUsage: org.firstUsage,
          pending: volume === 0,
          newThisMonth: index === 0,
        };
      });
      const summary = {
        base: rows.reduce((sum, row) => sum + row.base, 0),
        commission: rows.reduce((sum, row) => sum + row.commission, 0),
      };
      return {
        ...entry,
        index,
        summary,
        activeCount: rows.length,
        newCount: index === 0 ? rows.length : 0,
        rows,
      };
    });
  }

  function buildSpStatements() {
    const history = buildHistory();
    const map = new Map();
    history.forEach((month) => month.rows.forEach((row) => {
      let entry = map.get(row.sp);
      if (!entry) {
        entry = {
          sp: row.sp,
          org: row.org,
          eff: row.eff,
          end: row.end,
          isException: row.isException,
          volume: 0,
          commission: 0,
          months: [],
        };
        map.set(row.sp, entry);
      }
      entry.volume += row.volume;
      entry.commission += row.commission;
      entry.tier = row.tier;
      entry.appliedMult = row.appliedMult;
      entry.months.push({ key: month.key, label: month.label, month: month.month, index: month.index, ...row });
    }));
    return [...map.values()].sort((a, b) => b.commission - a.commission);
  }

  const fmtRM = (n) => "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtL = (n) => n.toLocaleString("en-US") + " L";
  const fmtRate = (r) => "RM " + r.toFixed(3) + "/L";

  window.RC = {
    REFERRER,
    TIERS,
    KPI,
    ORGS,
    HISTORY_META,
    tierFor,
    multiplierFor,
    portfolioVolume,
    compute,
    summarise,
    buildHistory,
    buildSpStatements,
    fmtRM,
    fmtL,
    fmtRate,
  };
})();
