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
        { key: "admin_user_limit", label: "Number of Admin Users", helper: "Maximum admin users allowed on this plan", controlType: "number", value: 3, min: 0, bindPath: "limits.adminUserLimit" },
      ],
    },
    {
      key: "myfuel",
      label: "MyFuel",
      summary: "Fuel operations, reporting, subsidy visibility",
      rows: [
        { key: "fuel_cards", label: "Fuel card control", helper: "Manage account and card access", controlType: "toggle", value: true },
        { key: "transactions", label: "Transaction history", helper: "Fuel transaction visibility", controlType: "toggle", value: true },
        { key: "history_depth", label: "Transaction History Limit", helper: "Restrict how much historical data is available", controlType: "select", value: "12 months", options: ["3 months", "6 months", "12 months", "Unlimited"], bindPath: "limits.historyDepth", toggleable: true, enabled: true },
        { key: "report_depth", label: "Report depth", helper: "Available months of reporting", controlType: "select", value: "12 months", options: ["3 months", "6 months", "12 months", "Unlimited"], toggleable: true, enabled: true },
        { key: "subsidy_quota", label: "Subsidy quota visibility", helper: "Display quota consumption and health", controlType: "toggle", value: true },
      ],
    },
    {
      key: "myadmin",
      label: "MyAdmin",
      summary: "Fleet, drivers, compliance, reminders",
      rows: [
        { key: "vehicle_info", label: "Vehicle Creation", helper: "Allow creation of vehicle records", controlType: "toggle", value: true },
        { key: "driver_info", label: "Driver Creation", helper: "Allow creation of driver records", controlType: "toggle", value: true },
        { key: "managed_vehicle_limit", label: "Managed Vehicle Limit", helper: "Maximum number of managed vehicles", controlType: "number", value: 10, min: 0, bindPath: "limits.managedVehicleLimit" },
        { key: "driver_limit", label: "Driver limit", helper: "Max drivers on this plan", controlType: "number", value: 20, min: 0 },
        { key: "vehicle_doc_reminder", label: "Vehicle Documents Reminder", helper: "Reminder count for vehicle documents", controlType: "number", value: 3, min: 0, toggleable: true, enabled: true },
        { key: "driver_doc_reminder", label: "Driver Documents Reminder", helper: "Reminder count for driver documents", controlType: "number", value: 3, min: 0, toggleable: true, enabled: true },
        { key: "icop", label: "Safety Checklist", helper: "Safety checklist workflows and records", controlType: "toggle", value: false },
      ],
    },
    {
      key: "mydriver",
      label: "MyDriver",
      summary: "Driver app access, attendance, trip assignment",
      rows: [
        { key: "login", label: "Driver login", helper: "Allow driver app authentication", controlType: "toggle", value: true },
        { key: "attendance", label: "Check-in / check-out", helper: "Attendance workflow in driver app", controlType: "toggle", value: true },
        { key: "trip_assignment", label: "Trip assignment", helper: "Assign trips directly to drivers", controlType: "toggle", value: false },
      ],
    },
    {
      key: "mytrip",
      label: "MyTrip",
      summary: "Trips, routing, ePOD + ePOP",
      rows: [
        { key: "routes", label: "Route creation", helper: "Create and manage routes", controlType: "toggle", value: true },
        { key: "trips", label: "Trip creation", helper: "Create and monitor trips", controlType: "toggle", value: true },
        { key: "epod", label: "ePOD + ePOP", helper: "Electronic Proof of Delivery and Electronic Proof of Pickup", controlType: "toggle", value: false },
      ],
    },
    {
      key: "myinsurance",
      label: "MyInsurance",
      summary: "Insurance quotation and support",
      rows: [
        { key: "quote", label: "Free quote", helper: "Quote request access", controlType: "toggle", value: false },
      ],
    },
  ];

  const cloneFeatureModules = () => deepClone(FEATURE_MODULE_TEMPLATES);

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
    const vehicleLimit = plan.limits.managedVehicleLimit === 0 ? "Unlimited" : plan.limits.managedVehicleLimit;
    const adminLimit = plan.limits.adminUserLimit === 0 ? "Unlimited" : plan.limits.adminUserLimit;
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
      status: "active",
      type: "default",
      protectedPlan: true,
      version: 4,
      recommended: false,
      displayOrder: 1,
      pricing: {
        setupFee: 0,
        waiveSetupFee: true,
        baseMonthlyFee: 0,
        perManagedVehicleFee: 0,
        commitmentOptions: [],
      },
      limits: {
        managedVehicleLimit: 5,
        adminUserLimit: 2,
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
      },
      featureModules: cloneFeatureModules(),
      createdAt: "2025-01-10",
      organizations: [],
    },
    {
      id: "plan-lite",
      name: "Lite",
      description: "Core plan for growing fleets that need reporting, drivers, and route operations.",
      status: "active",
      type: "normal",
      protectedPlan: true,
      version: 7,
      recommended: false,
      displayOrder: 2,
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
        adminUserLimit: 5,
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
      featureModules: cloneFeatureModules(),
      createdAt: "2025-02-14",
      organizations: [],
    },
    {
      id: "plan-premium",
      name: "Premium",
      description: "Full operational control with broader limits and stronger reporting coverage.",
      status: "active",
      type: "normal",
      protectedPlan: true,
      version: 9,
      recommended: true,
      displayOrder: 3,
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
        adminUserLimit: 18,
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
      featureModules: cloneFeatureModules(),
      createdAt: "2025-03-08",
      organizations: [],
    },
    {
      id: "plan-enterprise",
      name: "Enterprise",
      description: "Unlimited operational scale for complex org structures and advanced workflows.",
      status: "active",
      type: "normal",
      protectedPlan: true,
      version: 5,
      recommended: false,
      displayOrder: 4,
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
        managedVehicleLimit: 0,
        adminUserLimit: 0,
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
      status: "inactive",
      type: "normal",
      protectedPlan: false,
      version: 1,
      recommended: false,
      displayOrder: 5,
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
      status: "inactive",
      type: "normal",
      protectedPlan: false,
      version: 3,
      recommended: false,
      displayOrder: 6,
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
    makeOrg(plansById["plan-free"], "org-astana", "Astana Movers", 3, 2, {
      subscriptionStatus: "Active",
      nextBillingDate: "2026-07-28",
    }),
  ];
  plansById["plan-lite"].organizations = [
    makeOrg(plansById["plan-lite"], "org-bluechip", "Bluechip Freight", 8, 4, {
      nextBillingDate: "2026-08-03",
    }),
    makeOrg(plansById["plan-lite"], "org-radiant", "Radiant Coldchain", 10, 3, {
      subscriptionStatus: "Pending change",
      nextBillingDate: "2026-08-08",
      hasDuplicateActivePlan: true,
      duplicatePlanName: "Premium",
    }),
  ];
  plansById["plan-premium"].organizations = [
    makeOrg(plansById["plan-premium"], "org-golden", "Golden Transport", 36, 11, {
      nextBillingDate: "2026-08-01",
      setupFee: 0,
    }),
    makeOrg(plansById["plan-premium"], "org-eagle", "Eagle Logistics", 28, 9, {
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
      sampleVehicles: vehicleCount || (plan.limits.managedVehicleLimit === 0 ? 25 : Math.min(plan.limits.managedVehicleLimit, 12)),
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

  window.SUB = {
    SUBSCRIPTION_PLANS,
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
