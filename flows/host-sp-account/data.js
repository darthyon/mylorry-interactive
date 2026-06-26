// data.js — Hand-written mock data for the Host SP Account flow.
// Tracked source of truth (NOT build output). Exposes window.SPA.
(function () {
  const DEFAULT_COMMISSION_VALIDITY_MONTHS = 36;

  /* ── Formatting helpers ─────────────────────────────────────── */
  const fmtRM = (n) =>
    "RM " + Number(n || 0).toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const fmtL = (n) => Number(n || 0).toLocaleString("en-MY") + " L";

  // "2025-01-27" → "27 Jan 2025"
  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  // Account-level first usage date + N months.
  const addMonths = (iso, months) => {
    if (!iso || !months) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return "";
    d.setMonth(d.getMonth() + Number(months));
    // Format from local parts (avoid toISOString's UTC shift rolling back a day).
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  // "27 Jan 2025 – 27 Jan 2028"
  const validityRange = (iso, months) => {
    if (!iso || !months) return "—";
    return fmtDate(iso) + " – " + fmtDate(addMonths(iso, months));
  };

  /* ── Reference lists ────────────────────────────────────────── */
  const ORGS = ["Tesla", "Arcadian Haulage", "Bluechip Freight", "Golden Transport", "Eagle Logistics", "SwiftHaul"];
  const PROVIDERS = ["Petron", "Shell", "Petronas", "BHPetrol", "Caltex"];
  const FREEZING_TYPES = ["Card Balance", "Account Balance", "None"];

  /* ── Agent / tier builders ──────────────────────────────────── */
  const tier = (usageMax, commissionAmount, final = false) => ({ usageMax, commissionAmount, final });
  const agent = (name, role, tiers, kpiSplitPct = 0) => ({ name, role, tiers, kpiSplitPct });

  // KPI Volume Attribution is split independently within Agents and Referrers.
  // Each role-specific pool sums to 100% of the same base usage volume.
  // distributeSplit turns per-row weights into integer percentages that sum to exactly 100
  // (largest-remainder method — the leftover goes to the rows with the biggest fractional part).
  // Used to seed valid data + the modal's "Auto-distribute". See sp-account.jsx for the UI
  // that owns these invariants.
  const distributeSplit = (weights) => {
    const n = weights.length;
    if (n === 0) return [];
    const total = weights.reduce((s, w) => s + w, 0) || 1;
    const raw = weights.map((w) => (w / total) * 100);
    const out = raw.map(Math.floor);
    let rem = 100 - out.reduce((s, v) => s + v, 0);
    const order = raw
      .map((v, i) => i)
      .sort((a, b) => (raw[b] - Math.floor(raw[b])) - (raw[a] - Math.floor(raw[a])));
    for (let k = 0; k < rem; k++) out[order[k % n]] += 1;
    return out;
  };

  // A wide salesperson roster so the list "+N more" popover is exercised.
  const AGENT_POOL = [
    "Ryan Tan Ruo Yen", "Yusuf Hakim", "Lim Wei Jian", "Devi Nair",
    "Farah Syazwani", "Suresh Kumar", "Wong Jia Hao", "Tan Mei Lin",
    "Azizul Rahman", "Nadia Sofea", "Chong Kai Wen", "Bala Krishnan",
    "Hakim Zulkifli", "Aisyah Nabila", "Pravin Raj",
  ];
  const REFERRER_POOL = [
    "Darren Lee", "Nurul Huda", "Jason Teoh", "Shanti Menon",
    "Marcus Goh", "Amirul Faiz", "Carmen Ooi",
  ];

  const defaultTiers = [
    tier(1000, 0.01),
    tier(2000, 0.02, true),
  ];

  const makeAgents = (nAgents, nReferrers, firstUsageDate) => {
    const out = [];
    for (let i = 0; i < nAgents; i++)
      out.push({ ...agent(AGENT_POOL[i % AGENT_POOL.length], "agent", defaultTiers) });
    for (let i = 0; i < nReferrers; i++)
      out.push({ ...agent(REFERRER_POOL[i % REFERRER_POOL.length], "referrer", defaultTiers) });
    const agentRows = out.filter((p) => p.role === "agent");
    const referrerRows = out.filter((p) => p.role === "referrer");
    const agentSplit = distributeSplit(agentRows.map((_, i) => Math.max(1, agentRows.length - i)));
    const referrerSplit = distributeSplit(referrerRows.map(() => 1));
    agentRows.forEach((p, i) => { p.kpiSplitPct = agentSplit[i]; });
    referrerRows.forEach((p, i) => { p.kpiSplitPct = referrerSplit[i]; });

    // Per-agent overrides so the prototype exercises default vs. custom states.
    out.forEach((p, idx) => {
      const hash = (idx * 3 + 2) % 7; // deterministic mix per agent
      // Activation: most follow the account's first usage date; a few override it.
      if (firstUsageDate && (hash === 0 || hash === 3)) {
        const offset = hash === 0 ? 1 : -2;
        p.activationDate = addMonths(firstUsageDate, offset) || firstUsageDate;
      }
      // Validity: most use the default 36 months; some are custom.
      if (hash === 1) p.commissionValidityMonths = 24;
      if (hash === 5) p.commissionValidityMonths = 48;
      // New Org Exception: mix of auto/custom/none.
      if (hash === 2) p.newOrgException = { mode: "custom", rate: 50 };
      else if (hash === 4) p.newOrgException = { mode: "none" };
      else p.newOrgException = { mode: "auto", rate: 100 };
    });

    return out;
  };

  const STATUSES = ["active", "active", "active", "inactive", "suspended", "active", "terminated"];

  /* ── SP Accounts ────────────────────────────────────────────── */
  const SP_ACCOUNTS = Array.from({ length: 12 }).map((_, i) => {
    const nAgents = (i % 5) + 1;       // 1..5 agents
    const nReferrers = (i % 3);        // 0..2 referrers
    const firstUsageDate = ["2025-01-27", "2024-11-01", "2025-03-15", "2024-06-30",
      "2025-05-10", "2023-12-01"][i % 6];
    return {
      id: "sp-" + (i + 1),
      no: i + 1,
      ownerType: i % 4 === 0 ? "Individual" : "Organization",
      orgName: ORGS[i % ORGS.length],
      provider: PROVIDERS[i % PROVIDERS.length],
      providerAccNo: String(75836593 + i * 137),
      balance: 67854 - i * 2310,
      subsidyNos: i % 2 === 0 ? ["SUB-" + (10234 + i)] : ["SUB-" + (10234 + i), "SUB-" + (20456 + i)],

      // Cards Settings
      freezingThresholdType: FREEZING_TYPES[i % FREEZING_TYPES.length],
      freezingThresholdAmount: 500 + i * 50,
      balanceReminder: 1000 + i * 100,

      // Rebate Setting
      rebateBeneficiary: ["Individual", "Group", "Has Parent"][i % 3],
      isMaster: i % 3 === 0,
      rebateTiers: [tier(1000, 0.01), tier(2000, 0.015, true)],

      // First usage date is account-level; per-agent activation dates can override it.
      // Last account is left pre-activation (no first transaction yet) to exercise the
      // pending callout state.
      firstUsageDate: i === 11 ? "" : firstUsageDate,

      agents: makeAgents(nAgents, nReferrers, i === 11 ? "" : firstUsageDate),

      // KPI period total volume (litres). Illustrative — the basis for each
      // agent's and referrer's attributed volume = periodVolume × their role-specific split %.
      periodVolume: 100000 + i * 10000,

      // Payout
      payoutType: ["Credit Note", "Bank-in Personal", "Bank-in Company"][i % 3],

      status: STATUSES[i % STATUSES.length],
      startDate: ["2025-06-05", "2025-04-12", "2025-02-28", "2024-12-19"][i % 4],
    };
  });

  window.SPA = {
    SP_ACCOUNTS,
    ORGS, PROVIDERS, FREEZING_TYPES,
    AGENT_POOL, REFERRER_POOL,
    distributeSplit,
    fmtRM, fmtL, fmtDate, addMonths, validityRange,
  };
})();
