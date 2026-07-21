(function () {
  const fmtRM = (n) =>
    "RM " + Number(n || 0).toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const fmtDate = (iso) => {
    if (!iso) return "—";
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

  const FEATURE_MODULE_TEMPLATES = [
    {
      key: "general",
      label: "General",
      summary: "Core subscription settings and operating limits",
      includeInServiceSummary: false,
      rows: [
        { key: "admin_user_limit", label: "Number of Admin Users", helper: "Maximum admin users allowed on this plan", controlType: "number", value: 3, min: 0, bindPath: "limits.adminUserLimit", hasUnlimited: true },
      ],
    },
    {
      key: "myfuel",
      label: "MyFuel",
      summary: "Fuel operations, reporting, subsidy visibility",
      rows: [
        { key: "fuel_cards", label: "Fleet card control", helper: "Manage account and card access", controlType: "toggle", value: true },
        { key: "history_depth", label: "Account History", helper: "Restrict how much historical data is available", controlType: "select", value: "6 months", options: ["3 months", "6 months", "12 months", "Unlimited"], bindPath: "limits.historyDepth", toggleable: true, enabled: true },
        { key: "subsidy_quota", label: "Subsidy quota visibility", helper: "Display quota consumption and health", controlType: "toggle", value: true },
      ],
    },
    {
      key: "myadmin",
      label: "MyAdmin",
      summary: "Fleet, drivers, compliance, reminders",
      rows: [
        { key: "vehicle_info", label: "Vehicle Creation", helper: "Allow creation of vehicle records", controlType: "toggle", value: true },
        { key: "managed_vehicle", label: "Managed Vehicle", helper: "Allow managed vehicle reminders and managed vehicle billing", controlType: "toggle", value: true, bindPath: "visibility.managedVehiclesIncluded" },
        { key: "vehicle_doc_reminder", label: "Vehicle Document Reminder", helper: "Reminder count for vehicle documents", controlType: "number", value: 3, min: 0, toggleable: true, enabled: true },
        { key: "icop", label: "Safety Checklist", helper: "Safety checklist workflows and records", controlType: "toggle", value: true },
        { key: "driver_info", label: "Driver Creation", helper: "Allow creation of driver records", controlType: "toggle", value: true },
        { key: "driver_doc_reminder", label: "Driver Document Reminder", helper: "Reminder count for driver documents", controlType: "number", value: 3, min: 0, toggleable: true, enabled: true },
      ],
    },
    {
      key: "mydriver",
      label: "MyDriver",
      summary: "Driver app access, attendance, profile uploads",
      rows: [
        { key: "login", label: "Driver login", helper: "Allow driver app authentication", controlType: "toggle", value: true },
        { key: "attendance", label: "Check-in / check-out", helper: "Attendance workflow in driver app", controlType: "toggle", value: true },
        { key: "upload_profile", label: "Upload Driver Profile", helper: "Allow drivers to upload profile documents", controlType: "toggle", value: true },
      ],
    },
    {
      key: "mytrip",
      label: "MyTrip",
      summary: "Trips and routing",
      rows: [
        { key: "routes", label: "Route creation", helper: "Create and manage routes", controlType: "toggle", value: true },
        { key: "trips", label: "Trip creation", helper: "Create and monitor trips", controlType: "toggle", value: true },
      ],
    },
    {
      key: "myinsurance",
      label: "MyInsurance",
      summary: "Insurance quotation and support",
      rows: [
        { key: "quote", label: "Free quote", helper: "Quote request access", controlType: "toggle", value: true },
      ],
    },
  ];

  const cloneFeatureModules = () => deepClone(FEATURE_MODULE_TEMPLATES);

  // Apply per-plan state overrides to cloned feature modules. Keeps the
  // template structure/labels intact while letting each existing plan define
  // its own row values.
  const applyFeatureOverrides = (modules, overrides) => {
    const next = deepClone(modules);
    for (const [moduleKey, rowOverrides] of Object.entries(overrides)) {
      const module = next.find((m) => m.key === moduleKey);
      if (!module) continue;
      for (const [rowKey, patch] of Object.entries(rowOverrides)) {
        const row = module.rows.find((r) => r.key === rowKey);
        if (!row) continue;
        Object.assign(row, patch);
      }
    }
    return next;
  };

  const serviceSummary = (featureModules) => {
    const enabledModules = featureModules.filter((module) =>
      module.includeInServiceSummary !== false &&
      module.rows.some((row) =>
        row.controlType === "toggle"
          ? !!row.value
          : (row.toggleable ? !!row.enabled : true) && (Number(row.value || 0) > 0 || String(row.value || "").length > 0)
      )
    );
    const enabledRows = enabledModules.reduce((sum, module) => sum + module.rows.filter((row) => (
      row.controlType === "toggle"
        ? row.value
        : row.toggleable ? row.enabled : true
    )).length, 0);
    return {
      modules: enabledModules.map((module) => module.label),
      moduleCount: enabledModules.length,
      featureCount: enabledRows,
    };
  };

  const normalizeCommitmentOptions = (options = []) =>
    options
      .map((option, index) => ({
        ...option,
        id: option.id || `tier-${index + 1}`,
        durationMonths: Number(option.durationMonths || 1),
        amount: Number(option.amount ?? option.discountedMonthlyPrice ?? 0),
        isTrial: !!option.isTrial,
      }))
      .sort((a, b) => a.durationMonths - b.durationMonths);

  const resolveCommitmentOption = (plan, commitmentMonths) => {
    const options = normalizeCommitmentOptions(plan.pricing?.commitmentOptions || []);
    const paidOptions = options.filter((option) => !option.isTrial);
    if (!paidOptions.length) return null;
    if (commitmentMonths != null) {
      const matched = paidOptions.find((option) => option.durationMonths === Number(commitmentMonths));
      if (matched) return matched;
    }
    return paidOptions[0];
  };

  const calculateMonthlyBilling = (plan, vehiclesUsed) =>
    Number(plan.pricing.baseMonthlyFee || 0) + Number(vehiclesUsed || 0) * Number(plan.pricing.perManagedVehicleFee || 0);

  const calculateCommittedBilling = (plan, vehiclesUsed, commitmentMonths = null, setupFeeStatus = "") => {
    const commitment = resolveCommitmentOption(plan, commitmentMonths);
    const months = Number(commitment?.durationMonths ?? commitmentMonths ?? 1);
    const baseMonthlyFee = Number((commitment?.amount ?? plan.pricing.baseMonthlyFee) || 0);
    const perManagedVehicleFee = Number(plan.pricing.perManagedVehicleFee || 0);
    const monthlySubtotal = baseMonthlyFee + Number(vehiclesUsed || 0) * perManagedVehicleFee;
    const setupFee = setupFeeStatus === "Waived" ? 0 : Number(plan.pricing.setupFee || 0);
    return {
      commitmentMonths: months,
      baseMonthlyFee,
      perManagedVehicleFee,
      monthlySubtotal,
      setupFee,
      totalLumpSum: monthlySubtotal * months + setupFee,
    };
  };

  // Resolves a feature-row's bindPath (e.g. "limits.historyDepth") against a
  // plan record. Mirrors the local copy in subscription.jsx's editor —
  // exported here too so read-only consumers (Org Portal) don't need their
  // own copy or the editor's update/patch machinery.
  const getBoundValue = (plan, path) => {
    if (!path) return undefined;
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), plan);
  };

  const makeOrg = (plan, orgId, orgName, vehiclesUsed, adminsUsed, extra = {}) => {
    const vehicleLimit = plan.limits.managedVehicleLimit == null ? "Unlimited" : plan.limits.managedVehicleLimit;
    const adminLimit = plan.limits.adminUserLimit == null ? "Unlimited" : plan.limits.adminUserLimit;
    return {
      orgId,
      orgName,
      subscriptionStatus: extra.subscriptionStatus || "Active",
      vehiclesUsed,
      vehicleLimit,
      adminsUsed,
      adminLimit,
      driverCount: extra.driverCount ?? Math.max(vehiclesUsed - 2, 1),
      setupFee: extra.setupFee ?? plan.pricing.setupFee,
      monthlyBilling: extra.monthlyBilling ?? calculateMonthlyBilling(plan, vehiclesUsed),
      trialStatus: extra.trialStatus || (plan.trial.isTrial ? "Trial" : "Standard"),
      trialStartDate: extra.trialStartDate || "",
      trialDurationDays: extra.trialDurationDays ?? plan.trial.durationDays,
      trialExpiry: extra.trialExpiry || "",
      nextBillingDate: extra.nextBillingDate || "2026-08-01",
      hasDuplicateActivePlan: !!extra.hasDuplicateActivePlan,
      duplicatePlanName: extra.duplicatePlanName || "",
    };
  };

  const basePlans = [
    {
      id: "plan-free",
      name: "Free",
      description: "Entry-level access for small fleets getting started with core operations.",
      websiteFeatures: ["Up to 1 admin user", "Core fleet operations", "3 months data history"],
      status: "active",
      type: "default",
      protectedPlan: true,
      version: 4,
      recommended: false,
      displayOrder: 1,
      isFree: true,
      pricing: {
        setupFee: 0,
        waiveSetupFee: true,
        baseMonthlyFee: 0,
        perManagedVehicleFee: 0,
        commitmentOptions: [],
      },
      limits: {
        managedVehicleLimit: 0,
        adminUserLimit: 1,
        historyDepth: "3 months",
        reportDepth: "3 months",
      },
      trial: {
        isTrial: false,
        durationDays: 14,
        hideOnWebsite: false,
      },
      visibility: {
        showOnWebsite: true,
        managedVehiclesIncluded: false,
      },
      featureModules: applyFeatureOverrides(cloneFeatureModules(), {
        myfuel: { subsidy_quota: { value: false } },
        myadmin: {
          managed_vehicle: { value: false },
          driver_info: { value: true },
          icop: { value: false },
          vehicle_doc_reminder: { enabled: false },
          driver_doc_reminder: { enabled: false },
        },
        mydriver: { attendance: { value: false } },
        mytrip: { routes: { value: false }, trips: { value: false } },
      }),
      createdAt: "2025-01-10",
      organizations: [],
    },
    {
      id: "plan-lite",
      name: "Lite",
      description: "Core plan for growing fleets that need reporting, drivers, and route operations.",
      websiteFeatures: ["Up to 10 managed vehicles", "Driver & document reminders", "6 months data history"],
      status: "active",
      type: "normal",
      protectedPlan: true,
      version: 7,
      recommended: false,
      displayOrder: 2,
      isFree: false,
      pricing: {
        setupFee: 250,
        waiveSetupFee: false,
        baseMonthlyFee: 99,
        perManagedVehicleFee: 12,
        commitmentOptions: [
          { id: "lite-12", durationMonths: 12, discountedMonthlyPrice: 99 },
        ],
      },
      limits: {
        managedVehicleLimit: 10,
        adminUserLimit: 3,
        historyDepth: "6 months",
        reportDepth: "6 months",
      },
      trial: {
        isTrial: false,
        durationDays: 14,
        hideOnWebsite: false,
      },
      visibility: {
        showOnWebsite: true,
      },
      featureModules: applyFeatureOverrides(cloneFeatureModules(), {
        mytrip: { routes: { value: false }, trips: { value: false } },
      }),
      createdAt: "2025-02-14",
      organizations: [],
    },
    {
      id: "plan-premium",
      name: "Premium",
      description: "Full operational control with broader limits and stronger reporting coverage.",
      websiteFeatures: ["Up to 50 managed vehicles", "Full reporting suite", "12 months data history"],
      status: "active",
      type: "normal",
      protectedPlan: true,
      version: 9,
      recommended: true,
      displayOrder: 3,
      isFree: false,
      pricing: {
        setupFee: 500,
        waiveSetupFee: false,
        baseMonthlyFee: 499,
        perManagedVehicleFee: 25,
        commitmentOptions: [
          { id: "prem-12", durationMonths: 12, discountedMonthlyPrice: 499 },
          { id: "prem-24", durationMonths: 24, discountedMonthlyPrice: 499 },
        ],
      },
      limits: {
        managedVehicleLimit: 50,
        adminUserLimit: 6,
        historyDepth: "12 months",
        reportDepth: "12 months",
      },
      trial: {
        isTrial: false,
        durationDays: 21,
        hideOnWebsite: false,
      },
      visibility: {
        showOnWebsite: true,
      },
      featureModules: applyFeatureOverrides(cloneFeatureModules(), {}),
      createdAt: "2025-03-08",
      organizations: [],
    },
    {
      id: "plan-enterprise",
      name: "Enterprise",
      description: "Unlimited operational scale for complex org structures and advanced workflows.",
      websiteFeatures: ["Unlimited managed vehicles", "Unlimited admin users", "Unlimited data history"],
      status: "active",
      type: "normal",
      protectedPlan: true,
      version: 5,
      recommended: false,
      displayOrder: 4,
      isFree: false,
      pricing: {
        setupFee: 1000,
        waiveSetupFee: false,
        baseMonthlyFee: 999,
        perManagedVehicleFee: 40,
        commitmentOptions: [
          { id: "ent-24", durationMonths: 24, discountedMonthlyPrice: 999 },
        ],
      },
      limits: {
        managedVehicleLimit: null,
        adminUserLimit: null,
        historyDepth: "Unlimited",
        reportDepth: "Unlimited",
      },
      trial: {
        isTrial: false,
        durationDays: 30,
        hideOnWebsite: false,
      },
      visibility: {
        showOnWebsite: true,
      },
      featureModules: cloneFeatureModules(),
      createdAt: "2025-04-18",
      organizations: [],
    },
    {
      id: "plan-campus-shuttle",
      name: "Campus Shuttle",
      description: "Flexible rollout plan for fixed-route shuttle operations and short trial onboarding.",
      websiteFeatures: [],
      status: "inactive",
      type: "normal",
      protectedPlan: false,
      version: 1,
      recommended: false,
      displayOrder: 5,
      isFree: false,
      pricing: {
        setupFee: 0,
        waiveSetupFee: true,
        baseMonthlyFee: 79,
        perManagedVehicleFee: 10,
        commitmentOptions: [
          { id: "camp-trial", durationMonths: 1, discountedMonthlyPrice: 0, isTrial: true },
          { id: "camp-12", durationMonths: 12, discountedMonthlyPrice: 69 },
        ],
      },
      limits: {
        managedVehicleLimit: 15,
        adminUserLimit: 4,
        historyDepth: "6 months",
        reportDepth: "6 months",
      },
      trial: {
        isTrial: true,
        durationDays: 30,
        hideOnWebsite: true,
      },
      visibility: {
        showOnWebsite: false,
      },
      featureModules: cloneFeatureModules(),
      createdAt: "2026-06-18",
      organizations: [],
    },
    {
      id: "plan-seasonal-fleet",
      name: "Seasonal Fleet",
      description: "Short-term contracting plan with flexible driver counts and temporary billing.",
      websiteFeatures: [],
      status: "inactive",
      type: "normal",
      protectedPlan: false,
      version: 3,
      recommended: false,
      displayOrder: 6,
      isFree: false,
      pricing: {
        setupFee: 150,
        waiveSetupFee: false,
        baseMonthlyFee: 129,
        perManagedVehicleFee: 18,
        commitmentOptions: [
          { id: "sea-6", durationMonths: 6, discountedMonthlyPrice: 119 },
        ],
      },
      limits: {
        managedVehicleLimit: 40,
        adminUserLimit: 8,
        historyDepth: "6 months",
        reportDepth: "12 months",
      },
      trial: {
        isTrial: false,
        durationDays: 14,
        hideOnWebsite: false,
      },
      visibility: {
        showOnWebsite: false,
      },
      featureModules: cloneFeatureModules(),
      createdAt: "2026-03-11",
      organizations: [],
    },
  ];

  const plansById = Object.fromEntries(basePlans.map((plan) => [plan.id, plan]));

  plansById["plan-free"].organizations = [
    makeOrg(plansById["plan-free"], "org-astana", "Astana Movers", 0, 1, {
      subscriptionStatus: "Active",
      nextBillingDate: "2026-07-28",
    }),
  ];
  plansById["plan-lite"].organizations = [
    makeOrg(plansById["plan-lite"], "org-bluechip", "Bluechip Freight", 8, 3, {
      nextBillingDate: "2026-08-03",
    }),
    makeOrg(plansById["plan-lite"], "org-radiant", "Radiant Coldchain", 10, 2, {
      subscriptionStatus: "Pending change",
      nextBillingDate: "2026-08-08",
      hasDuplicateActivePlan: true,
      duplicatePlanName: "Premium",
    }),
  ];
  plansById["plan-premium"].organizations = [
    makeOrg(plansById["plan-premium"], "org-golden", "Golden Transport", 36, 5, {
      nextBillingDate: "2026-08-01",
      setupFee: 0,
    }),
    makeOrg(plansById["plan-premium"], "org-eagle", "Eagle Logistics", 28, 4, {
      trialStatus: "Trial",
      trialStartDate: "2026-07-01",
      trialDurationDays: 21,
      trialExpiry: addDays("2026-07-01", 21),
      nextBillingDate: "2026-07-22",
    }),
  ];
  plansById["plan-enterprise"].organizations = [
    makeOrg(plansById["plan-enterprise"], "org-arcadian", "Arcadian Haulage", 88, 26, {
      nextBillingDate: "2026-08-15",
    }),
  ];

  const attachUsageSummary = (plan) => {
    const organizations = plan.organizations || [];
    const services = serviceSummary(plan.featureModules);
    const vehicleCount = organizations.reduce((sum, org) => sum + Number(org.vehiclesUsed || 0), 0);
    const adminCount = organizations.reduce((sum, org) => sum + Number(org.adminsUsed || 0), 0);
    const driverCount = organizations.reduce((sum, org) => sum + Number(org.driverCount || 0), 0);
    const monthlyBilling = organizations.reduce((sum, org) => sum + Number(org.monthlyBilling || 0), 0);
    plan.usageSummary = {
      orgCount: organizations.length,
      vehicleCount,
      adminCount,
      driverCount,
      monthlyBilling,
      sampleVehicles: vehicleCount || (plan.limits.managedVehicleLimit == null ? 25 : Math.min(plan.limits.managedVehicleLimit, 12)),
      services,
    };
    return plan;
  };

  const SUBSCRIPTION_PLANS = basePlans.map((plan) => attachUsageSummary(plan));

  const ORGANIZATION_LOOKUP = SUBSCRIPTION_PLANS.flatMap((plan) =>
    (plan.organizations || []).map((org) => ({
      orgId: org.orgId,
      orgName: org.orgName,
      planId: plan.id,
      planName: plan.name,
      duplicatePlanName: org.duplicatePlanName || "",
    }))
  );

  const SUBSCRIPTION_HISTORY = [
    {
      id: "hist-lite-1",
      planId: "plan-lite",
      changeType: "create",
      changedBy: "Ahmad Razali",
      changeTime: "2025-02-14T09:00:00",
      changelogFileName: "changelog-lite-v1.json",
      version: 1,
    },
    {
      id: "hist-lite-2",
      planId: "plan-lite",
      changeType: "update",
      changedBy: "Siti Nurhaliza",
      changeTime: "2025-08-22T14:15:00",
      changelogFileName: "changelog-lite-v2.json",
      version: 2,
    },
    {
      id: "hist-lite-3",
      planId: "plan-lite",
      changeType: "update",
      changedBy: "Mohd Faizal",
      changeTime: "2026-04-18T15:37:00",
      changelogFileName: "changelog-lite-v7.json",
      version: 7,
    },
    {
      id: "hist-premium-1",
      planId: "plan-premium",
      changeType: "create",
      changedBy: "Ahmad Razali",
      changeTime: "2025-03-08T10:30:00",
      changelogFileName: "changelog-premium-v1.json",
      version: 1,
    },
    {
      id: "hist-premium-2",
      planId: "plan-premium",
      changeType: "update",
      changedBy: "Siti Nurhaliza",
      changeTime: "2025-11-05T11:20:00",
      changelogFileName: "changelog-premium-v5.json",
      version: 5,
    },
    {
      id: "hist-premium-3",
      planId: "plan-premium",
      changeType: "update",
      changedBy: "Mohd Faizal",
      changeTime: "2026-01-30T09:45:00",
      changelogFileName: "changelog-premium-v9.json",
      version: 9,
    },
    {
      id: "hist-enterprise-1",
      planId: "plan-enterprise",
      changeType: "create",
      changedBy: "Ahmad Razali",
      changeTime: "2025-04-18T08:45:00",
      changelogFileName: "changelog-enterprise-v1.json",
      version: 1,
    },
    {
      id: "hist-enterprise-2",
      planId: "plan-enterprise",
      changeType: "update",
      changedBy: "Siti Nurhaliza",
      changeTime: "2026-02-12T16:00:00",
      changelogFileName: "changelog-enterprise-v5.json",
      version: 5,
    },
  ];

  window.SUB = {
    SUBSCRIPTION_PLANS,
    SUBSCRIPTION_HISTORY,
    FEATURE_MODULE_TEMPLATES,
    ORGANIZATION_LOOKUP,
    fmtRM,
    fmtDate,
    addDays,
    deepClone,
    cloneFeatureModules,
    serviceSummary,
    normalizeCommitmentOptions,
    resolveCommitmentOption,
    calculateMonthlyBilling,
    calculateCommittedBilling,
    getBoundValue,
  };
})();
