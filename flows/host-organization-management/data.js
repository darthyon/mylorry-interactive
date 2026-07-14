(function () {
  const fmtRM = (n) =>
    "RM " + Number(n || 0).toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const fmtDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const addDays = (iso, days) => {
    if (!iso || !days) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return "";
    d.setDate(d.getDate() + Number(days));
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const deepClone = (value) => JSON.parse(JSON.stringify(value));

  const PLANS = [
    {
      id: "plan-free",
      name: "Free",
      type: "default",
      isTrial: false,
      limit: 0,
      baseMonthlyFee: 0,
      perManagedVehicleFee: 0,
      tiers: [],
    },
    {
      id: "plan-lite",
      name: "Lite",
      type: "normal",
      isTrial: false,
      limit: 10,
      baseMonthlyFee: 99,
      perManagedVehicleFee: 12,
      tiers: [
        { id: "lite-12", label: "12 months", months: 12, amount: 99 },
        { id: "lite-trial-3", label: "Trial 3 months", months: 3, amount: 0, isTrial: true, trialDurationDays: 90 },
      ],
    },
    {
      id: "plan-premium",
      name: "Premium",
      type: "normal",
      isTrial: false,
      limit: 50,
      baseMonthlyFee: 499,
      perManagedVehicleFee: 25,
      tiers: [
        { id: "premium-12", label: "12 months", months: 12, amount: 499 },
        { id: "premium-trial-3", label: "Trial 3 months", months: 3, amount: 0, isTrial: true, trialDurationDays: 90 },
      ],
    },
    {
      id: "plan-enterprise",
      name: "Enterprise",
      type: "normal",
      isTrial: false,
      limit: null,
      baseMonthlyFee: 999,
      perManagedVehicleFee: 35,
      tiers: [
        { id: "ent-24", label: "24 months", months: 24, amount: 999 },
        { id: "ent-trial-3", label: "Trial 3 months", months: 3, amount: 0, isTrial: true, trialDurationDays: 90 },
      ],
    },
  ];

  const PARTNERS = [
    { id: "PTR-1007", name: "North Port Shuttle Sdn Bhd" },
    { id: "PTR-1012", name: "Kinta Route Partners" },
    { id: "PTR-1028", name: "Southern Cross Transport" },
    { id: "PTR-1044", name: "MKM Partner Fleet" },
    { id: "PTR-1061", name: "Radya Trip Network" },
  ];

  const file = (id, name, size = "1.2 MB") => ({
    id,
    name,
    size,
    status: "Completed",
    uploadedAt: "2026-07-10",
  });

  const orgs = [
    {
      id: 2171,
      orgCode: "ORG-2171",
      organizationName: "Golden Transport",
      regNo: "202001021711",
      tinNo: "C2489910040",
      country: "Malaysia",
      state: "Selangor",
      city: "Shah Alam",
      address: "No. 18, Jalan Anggerik Vanilla, Kota Kemuning",
      postCode: "40460",
      pic: { name: "Nadia Ibrahim", phone: "+60111111111", email: "nadia@golden-transport.test" },
      companyEmails: ["billing@golden-transport.test"],
      companyEmailDraft: "",
      orgFiles: [file("org-file-2171", "ssm-registration.pdf", "856 KB")],
      subscription: {
        current: {
          planId: "plan-premium",
          tierId: "premium-12",
          startDate: "2026-06-09",
          managedVehicleNumber: 36,
          paymentSettings: true,
          amount: 1399,
          paymentMethod: "Bank transfer",
          paymentDate: "2026-06-09",
          remarks: "Premium rollout approved by host admin.",
          files: [file("sub-file-2171", "signed-subscription-contract.pdf", "1.9 MB")],
        },
        upcoming: null,
      },
      partners: [PARTNERS[0], PARTNERS[2]],
      joinDate: "2026-06-09",
      status: "Active",
    },
    {
      id: 489,
      orgCode: "ORG-0489",
      organizationName: "Bluechip Freight",
      regNo: "201601004890",
      tinNo: "C1011100489",
      country: "Malaysia",
      state: "Kuala Lumpur",
      city: "Kuala Lumpur",
      address: "Lot 4, Jalan Metro Perdana Barat",
      postCode: "52100",
      pic: { name: "Farah Lim", phone: "+60100000489", email: "farah@bluechip-freight.test" },
      companyEmails: ["finance@bluechip-freight.test"],
      companyEmailDraft: "",
      orgFiles: [],
      subscription: {
        current: {
          planId: "plan-lite",
          tierId: "lite-12",
          startDate: "2024-08-29",
          managedVehicleNumber: 8,
          paymentSettings: true,
          amount: 195,
          paymentMethod: "Credit card",
          paymentDate: "2026-07-11",
          remarks: "Exp. in 2 days",
          files: [],
        },
        upcoming: {
          planId: "plan-premium",
          tierId: "premium-12",
          startDate: "2026-08-01",
          managedVehicleNumber: 20,
          paymentSettings: true,
          amount: 999,
          paymentMethod: "Bank transfer",
          paymentDate: "2026-08-01",
          remarks: "Upgrade scheduled after Lite term.",
          files: [file("up-file-489", "upgrade-approval.pdf", "620 KB")],
        },
      },
      partners: [PARTNERS[3]],
      joinDate: "2024-08-29",
      status: "Active",
    },
    {
      id: 57,
      orgCode: "ORG-0057",
      organizationName: "Eagle Logistics",
      regNo: "201401000057",
      tinNo: "C1000000057",
      country: "Malaysia",
      state: "Selangor",
      city: "Petaling Jaya",
      address: "Unit 7-2, Jalan SS6/12",
      postCode: "47301",
      pic: { name: "Daniel Tan", phone: "+60100000057", email: "daniel@eagle-logistics.test" },
      companyEmails: [],
      companyEmailDraft: "",
      orgFiles: [file("org-file-57", "credit-note-approval.pdf", "442 KB")],
      subscription: {
        current: {
          planId: "plan-lite",
          tierId: "lite-trial-3",
          startDate: "2026-07-01",
          managedVehicleNumber: 5,
          paymentSettings: false,
          amount: 0,
          paymentMethod: "",
          paymentDate: "",
          remarks: "Trial org awaiting conversion.",
          trialStartDate: "2026-07-01",
          trialDuration: 90,
          files: [file("sub-file-57", "trial-contract.pdf", "744 KB")],
        },
        upcoming: null,
      },
      partners: [],
      joinDate: "2024-03-29",
      status: "Active",
    },
    {
      id: 2176,
      orgCode: "ORG-2176",
      organizationName: "Arcadian Haulage",
      regNo: "202601002176",
      tinNo: "C9912321760",
      country: "Malaysia",
      state: "Johor",
      city: "Johor Bahru",
      address: "12, Jalan Kempas Utama 3/2",
      postCode: "81200",
      pic: { name: "Aina Rahman", phone: "+60112312312", email: "aina@arcadian-haulage.test" },
      companyEmails: ["accounts@arcadian-haulage.test"],
      companyEmailDraft: "",
      orgFiles: [],
      subscription: {
        current: {
          planId: "plan-enterprise",
          tierId: "ent-24",
          startDate: "2026-07-10",
          managedVehicleNumber: 88,
          paymentSettings: true,
          amount: 2199,
          paymentMethod: "Bank transfer",
          paymentDate: "2026-07-10",
          remarks: "",
          files: [],
        },
        upcoming: null,
      },
      partners: [PARTNERS[4]],
      joinDate: "2026-07-10",
      status: "Active",
    },
    {
      id: 2172,
      orgCode: "ORG-2172",
      organizationName: "Astana Movers",
      regNo: "201901002172",
      tinNo: "C8880217200",
      country: "Malaysia",
      state: "Selangor",
      city: "Cyberjaya",
      address: "Persiaran APEC, Cyber 8",
      postCode: "63000",
      pic: { name: "Siti Aminah", phone: "+603820423423", email: "siti@astana-movers.test" },
      companyEmails: ["finance@astana-movers.test"],
      companyEmailDraft: "",
      orgFiles: [file("org-file-2172", "company-profile.pdf", "1.1 MB")],
      subscription: {
        current: {
          planId: "plan-free",
          tierId: "",
          startDate: "2026-06-10",
          managedVehicleNumber: 0,
          paymentSettings: false,
          amount: 0,
          paymentMethod: "",
          paymentDate: "",
          remarks: "Free onboarding account.",
          files: [],
        },
        upcoming: null,
      },
      partners: [PARTNERS[0], PARTNERS[1], PARTNERS[2]],
      joinDate: "2026-06-10",
      status: "Active",
    },
    {
      id: 10,
      orgCode: "ORG-0010",
      organizationName: "Radiant Coldchain",
      regNo: "201701000010",
      tinNo: "C1000000010",
      country: "Malaysia",
      state: "Perak",
      city: "Ipoh",
      address: "10, Jalan Sultan Azlan Shah",
      postCode: "31400",
      pic: { name: "Marcus Lee", phone: "60100000010", email: "marcus@radiant-coldchain.test" },
      companyEmails: [],
      companyEmailDraft: "",
      orgFiles: [],
      subscription: {
        current: {
          planId: "plan-lite",
          tierId: "lite-12",
          startDate: "2024-03-04",
          managedVehicleNumber: 12,
          paymentSettings: true,
          amount: 243,
          paymentMethod: "Credit card",
          paymentDate: "2026-07-01",
          remarks: "Seeded over-limit state for validation review.",
          files: [],
        },
        upcoming: null,
      },
      partners: [],
      joinDate: "2024-03-04",
      status: "Active",
    },
  ];

  function planById(planId) {
    return PLANS.find((plan) => plan.id === planId) || PLANS[0];
  }

  function billingPreview(planId, managedVehicleNumber, tierId) {
    const plan = planById(planId);
    const tier = plan.tiers.find((item) => item.id === tierId);
    if (tier?.isTrial || plan.id === "plan-free") return fmtRM(0);
    const base = Number(tier?.amount ?? plan.baseMonthlyFee ?? 0);
    return fmtRM(base + Number(managedVehicleNumber || 0) * Number(plan.perManagedVehicleFee || 0));
  }

  window.HOST_ORG = {
    PLANS,
    PARTNERS,
    ORGANIZATIONS: orgs,
    fmtRM,
    fmtDate,
    addDays,
    deepClone,
    planById,
    billingPreview,
  };
})();
