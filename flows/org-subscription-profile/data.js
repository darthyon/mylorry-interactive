/* data.js — mock data for the Organisation Profile prototype.
   Org identity (id/name) is NOT invented here — it's read from window.ORG_DASH
   (flows/org-dashboard/data.js, loaded before this file — see index.html) so
   the org shown on this page is the same org as the main dashboard, not a
   disconnected placeholder. Plan pricing, limits, and feature modules are
   likewise read from window.SUB (host-subscription/data.js) rather than
   duplicated. `orgDetails` below only holds the fields org-dashboard doesn't
   track (Reg No, TIN, address) for org-dashboard's default org ("padu").
   Each scenario only supplies what's specific to *this org*: which plan,
   how many vehicles/admins it's using, and its billing/trial state. */
window.ORG_PROFILE = {
  orgDetails: {
    regNo: "63738463527849",
    tin: "63738463527849",
    address: "No.18 Lorong 123 Tower B Petaling Jaya, Selangor Darul Ehsan Malaysia",
  },
  pic: {
    name: "William Lee Wei Lian",
    email: "william.lee.lw@mylorry.ai",
    phone: "60123672812",
  },

  scenarios: {
    free: {
      planId: "plan-free",
      status: "free",
      vehiclesUsed: 3,
      adminsUsed: 2,
      upcoming: null,
    },

    "lite-active": {
      planId: "plan-lite",
      status: "active",
      vehiclesUsed: 14,
      adminsUsed: 4,
      commitmentMonths: 12,
      nextBillingDate: "2026-08-03",
      setupFeeStatus: "Paid",
      upcoming: { planId: "plan-premium", effectiveDate: "2026-08-03" },
    },

    "premium-trial": {
      planId: "plan-premium",
      status: "trial",
      vehiclesUsed: 28,
      adminsUsed: 9,
      commitmentMonths: 12,
      trialStartDate: "2026-07-01",
      trialDaysRemaining: 12,
      trialExpiry: "2026-07-22",
      setupFeeStatus: "Pending",
      upcoming: {
        note: "Trial converts to paid Premium at the same limits and pricing.",
        effectiveDate: "2026-07-22",
      },
    },

    "enterprise-unlimited": {
      planId: "plan-enterprise",
      status: "active",
      vehiclesUsed: 88,
      adminsUsed: 26,
      commitmentMonths: 24,
      nextBillingDate: "2026-08-15",
      setupFeeStatus: "Waived",
      upcoming: null,
    },

    "lite-at-limit": {
      planId: "plan-lite",
      status: "active",
      vehiclesUsed: 30,
      adminsUsed: 5,
      commitmentMonths: 12,
      nextBillingDate: "2026-07-28",
      setupFeeStatus: "Paid",
      upcoming: { planId: "plan-premium", effectiveDate: "2026-07-28" },
    },
  },
};
