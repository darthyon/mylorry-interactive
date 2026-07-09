// data.js — mock data for the MyAdmin Dashboard.
window.MYADMIN_DASH = {
  org: {
    id: "padu",
    name: "Padu Logistik Sdn. Bhd.",
    orgLabel: "Org 10",
  },
  orgs: [{ id: "padu", name: "Padu Logistik Sdn. Bhd.", role: "Org 10" }],
  dateLabel: "9 Jun 2026",

  fleet: {
    vehicles: { total: 16, inUse: 3, unused: 12, inactive: 1 },
    drivers: { total: 13, onDuty: 5, offDuty: 8 },
    expiredDocs: { count: 4 },
    dueSoon: { count: 14, within7: 5 },
  },

  docExpiry: {
    buckets: ["Expired", "0-7 days", "8-30 days", "31-60 days", "61-90 days"],
    vehicle: {
      types: ["Road Tax", "Puspakom", "Insurance", "Truck Permit", "Others"],
      series: [
        { bucket: "Expired",     "Road Tax": 1, "Puspakom": 1, "Insurance": 0, "Truck Permit": 0, "Others": 0 },
        { bucket: "0-7 days",    "Road Tax": 1, "Puspakom": 0, "Insurance": 1, "Truck Permit": 0, "Others": 0 },
        { bucket: "8-30 days",   "Road Tax": 2, "Puspakom": 1, "Insurance": 2, "Truck Permit": 1, "Others": 0 },
        { bucket: "31-60 days",  "Road Tax": 3, "Puspakom": 2, "Insurance": 2, "Truck Permit": 1, "Others": 1 },
        { bucket: "61-90 days",  "Road Tax": 1, "Puspakom": 1, "Insurance": 1, "Truck Permit": 0, "Others": 0 },
      ],
    },
    driver: {
      types: ["Driving License", "GDL License", "Passport / Port Pass", "Others"],
      series: [
        { bucket: "Expired",     "Driving License": 0, "GDL License": 1, "Passport / Port Pass": 0, "Others": 0 },
        { bucket: "0-7 days",    "Driving License": 1, "GDL License": 1, "Passport / Port Pass": 0, "Others": 1 },
        { bucket: "8-30 days",   "Driving License": 1, "GDL License": 1, "Passport / Port Pass": 1, "Others": 0 },
        { bucket: "31-60 days",  "Driving License": 2, "GDL License": 1, "Passport / Port Pass": 1, "Others": 0 },
        { bucket: "61-90 days",  "Driving License": 1, "GDL License": 0, "Passport / Port Pass": 1, "Others": 0 },
      ],
    },
  },

  documentActions: [
    { subject: "STG0234", scope: "vehicle", docType: "Road Tax",   expiryDate: "28 May 2026", daysLabel: "14d overdue", status: "expired",  bucket: "Expired" },
    { subject: "WQM1190", scope: "vehicle", docType: "Puspakom",   expiryDate: "3 Jun 2026",  daysLabel: "8d overdue",  status: "expired",  bucket: "Expired" },
    { subject: "JKM4521", scope: "vehicle", docType: "Insurance",  expiryDate: "15 Jun 2026", daysLabel: "4 days",      status: "due_soon", bucket: "0-7 days" },
    { subject: "Ahmad Razali",   scope: "driver", docType: "GDL License",             expiryDate: "18 Jun 2026", daysLabel: "7 days",  status: "due_soon", bucket: "0-7 days" },
    { subject: "BCA8831", scope: "vehicle", docType: "Truck Permit", expiryDate: "22 Jun 2026", daysLabel: "11 days", status: "due_soon", bucket: "8-30 days" },
    { subject: "Mohd Fadzli",    scope: "driver", docType: "Driving License",         expiryDate: "25 Jun 2026", daysLabel: "14 days", status: "due_soon", bucket: "8-30 days" },
    { subject: "VANB791", scope: "vehicle", docType: "Road Tax",     expiryDate: "3 Jul 2026",  daysLabel: "22 days", status: "due_soon", bucket: "8-30 days" },
    { subject: "Zainal Abidin",  scope: "driver", docType: "Passport / Port Pass",    expiryDate: "12 Jul 2026", daysLabel: "31 days", status: "due_soon", bucket: "31-60 days" },
  ],

  checklists: [
    { vehicle: "STG0234", driver: "Ahmad Razali",  submitted: "9 Jun, 8:14 AM", type: "Pre-trip iCOP",  status: "pending_endorsement" },
    { vehicle: "WQM1190", driver: "Mohd Fadzli",   submitted: "9 Jun, 7:52 AM", type: "Pre-trip iCOP",  status: "pending_endorsement" },
    { vehicle: "JKM4521", driver: "Zainal Abidin", submitted: "8 Jun, 6:30 PM", type: "Post-trip iCOP", status: "endorsed" },
    { vehicle: "BCA8831", driver: "Kamal Hassan",  submitted: "8 Jun, 3:45 PM", type: "Pre-trip iCOP",  status: "endorsed" },
  ],

  checkInOut: [
    { vehicle: "STG0234", driver: "Ahmad Razali",  event: "check_in",  time: "9 Jun, 7:48 AM", odometer: "82,130 km",  status: "active" },
    { vehicle: "WQM1190", driver: "Mohd Fadzli",   event: "check_out", time: "9 Jun, 6:12 AM", odometer: "71,904 km",  status: "completed" },
    { vehicle: "JKM4521", driver: "Zainal Abidin", event: "check_in",  time: "8 Jun, 5:44 PM",  odometer: "64,020 km",  status: "active" },
  ],
};
