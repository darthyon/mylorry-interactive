// data.js — mock data for the Endorser Dashboard.
// Row shape for `checklists.*` matches org-dashboard's D.preview.checklists
// exactly, since both flows render the same shared SharedShell.ChecklistCard.
window.ED_DASH = {
  org: {
    id: "padu",
    name: "Padu Logistik Sdn. Bhd.",
    orgLabel: "Org 10",
    lastUpdated: "9 Jun 2026, 12:48 AM",
  },

  subscription: {
    plan: "lite",
    managedVehicles: { used: 7, total: 10 },
    managedDrivers: { used: 3, total: 10 },
  },

  kpis: {
    pendingToday:    { count: 6, total: 10, sub: "Needs action today" },
    endorsedToday:   { count: 3, total: 10, sub: "Completed" },
    rejectedToday:   { count: 1, total: 10, sub: "With remarks" },
    overdue:         { count: 5, sub: "Action required" },
    avgApprovalTime: { value: "1h 15m", sub: "Last 30 days" },
  },

  mtd: {
    totalEndorsement: 100,
    pending: 5,
    approvalRate: 90,
    rejectedRate: 10,
    overdue: 5,
  },

  trend: [
    { label: "Jan 2026", endorsed: 62, rejected: 22, overdue: 26, total: 110 },
    { label: "Feb 2026", endorsed: 58, rejected: 20, overdue: 27, total: 105 },
    { label: "Mar 2026", endorsed: 70, rejected: 22, overdue: 28, total: 120 },
    { label: "Apr 2026", endorsed: 68, rejected: 21, overdue: 26, total: 115 },
    { label: "May 2026", endorsed: 64, rejected: 20, overdue: 24, total: 108 },
    { label: "Jun 2026", endorsed: 90, rejected: 5,  overdue: 5,  total: 100 },
  ],

  checklists: {
    pending: [
      {
        driver: "Ahmad Razif", plate: "STG1161",
        checkIn: "9 Jun 2026 · 7:02 AM", checkOut: "9 Jun 2026 · 7:30 AM",
        startMileage: 48210, endMileage: 48252,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",    status: "passed" },
        ],
      },
      {
        driver: "Mohd Fadzli", plate: "STG0234",
        checkIn: "9 Jun 2026 · 6:20 AM", checkOut: "9 Jun 2026 · 6:55 AM",
        startMileage: 91007, endMileage: 91043,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",    status: "passed" },
        ],
      },
      {
        driver: "Zulkifli Hamid", plate: "BCA8831",
        checkIn: "8 Jun 2026 · 7:40 AM", checkOut: "8 Jun 2026 · 8:10 AM",
        startMileage: 65330, endMileage: 65378,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "warning" },
          { label: "Daily Driver Checklist",    status: "warning" },
        ],
      },
      {
        driver: "Karim Abdullah", plate: "VANB791",
        checkIn: "8 Jun 2026 · 7:10 AM", checkOut: "8 Jun 2026 · 7:45 AM",
        startMileage: 33840, endMileage: 33879,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",    status: "passed" },
        ],
      },
      {
        driver: "Hafiz Sulaiman", plate: "WQM1190",
        checkIn: "7 Jun 2026 · 8:55 AM", checkOut: "7 Jun 2026 · 9:20 AM",
        startMileage: 120450, endMileage: 120498,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",    status: "warning" },
        ],
      },
      {
        driver: "Roslan Ibrahim", plate: "JKM4521",
        checkIn: "7 Jun 2026 · 7:35 AM", checkOut: "7 Jun 2026 · 8:00 AM",
        startMileage: 78120, endMileage: 78156,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",    status: "passed" },
        ],
      },
    ],
    endorsed: [
      {
        driver: "Suresh Kumar", plate: "PMK2210",
        checkIn: "9 Jun 2026 · 6:05 AM", checkOut: "9 Jun 2026 · 6:32 AM",
        startMileage: 55010, endMileage: 55048,
        decision: "endorsed",
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",    status: "passed" },
        ],
      },
      {
        driver: "Aiman Yusof", plate: "SGB6634",
        checkIn: "9 Jun 2026 · 5:48 AM", checkOut: "9 Jun 2026 · 6:15 AM",
        startMileage: 20330, endMileage: 20361,
        decision: "endorsed",
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",    status: "passed" },
        ],
      },
    ],
    rejected: [
      {
        driver: "Farid Rahman", plate: "WXY8842",
        checkIn: "9 Jun 2026 · 6:40 AM", checkOut: "9 Jun 2026 · 7:05 AM",
        startMileage: 71200, endMileage: 71238,
        decision: "rejected",
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "warning" },
          { label: "Daily Driver Checklist",    status: "passed" },
        ],
      },
    ],
    overdue: [
      {
        driver: "Chong Wei Liang", plate: "KTA5590",
        checkIn: "7 Jun 2026 · 6:15 AM", checkOut: "7 Jun 2026 · 6:50 AM",
        startMileage: 40210, endMileage: 40255,
        overdue: true,
        items: [
          { label: "Daily Vehicle Checklist",   status: "warning" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",    status: "passed" },
        ],
      },
      {
        driver: "Nurul Izzah", plate: "MFT3321",
        checkIn: "6 Jun 2026 · 7:20 AM", checkOut: "6 Jun 2026 · 7:52 AM",
        startMileage: 88010, endMileage: 88049,
        overdue: true,
        items: [
          { label: "Daily Vehicle Checklist",   status: "passed" },
          { label: "Daily Vehicle Maintenance", status: "passed" },
          { label: "Daily Driver Checklist",    status: "passed" },
        ],
      },
    ],
  },

  seeAllHref: "../org-dashboard/index.html",
};
