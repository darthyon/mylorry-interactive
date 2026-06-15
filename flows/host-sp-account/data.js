// data.js — Hand-written mock data for the Host SP Account flow.
// Tracked source of truth (NOT build output). Exposes window.SPA.
(function () {
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

  // Account-level commission validity: activation date + N months.
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
  const agent = (name, role, tiers) => ({ name, role, tiers });

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

  const makeAgents = (nAgents, nReferrers) => {
    const out = [];
    for (let i = 0; i < nAgents; i++)
      out.push({ ...agent(AGENT_POOL[i % AGENT_POOL.length], "agent", defaultTiers) });
    for (let i = 0; i < nReferrers; i++)
      out.push({ ...agent(REFERRER_POOL[i % REFERRER_POOL.length], "referrer", defaultTiers) });
    return out;
  };

  const STATUSES = ["active", "active", "active", "inactive", "suspended", "active", "terminated"];

  /* ── SP Accounts ────────────────────────────────────────────── */
  const SP_ACCOUNTS = Array.from({ length: 12 }).map((_, i) => {
    const nAgents = (i % 5) + 1;       // 1..5 agents
    const nReferrers = (i % 3);        // 0..2 referrers
    const activationDate = ["2025-01-27", "2024-11-01", "2025-03-15", "2024-06-30",
      "2025-05-10", "2023-12-01"][i % 6];
    const validityMonths = [36, 24, 12, 36, 18, 36][i % 6];
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

      // Commission Setting — ACCOUNT-LEVEL validity (survives agent transfer)
      activationDate,
      commissionValidityMonths: validityMonths,

      agents: makeAgents(nAgents, nReferrers),

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
    fmtRM, fmtL, fmtDate, addMonths, validityRange,
  };
})();
