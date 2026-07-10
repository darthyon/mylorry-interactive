// data.js — mock data for the MyTrip Dashboard flow.
window.MYTRIP_DASH = {
  org: { id: "padu", name: "Padu Logistik Sdn. Bhd.", orgLabel: "Org 10" },
  orgs: [{ id: "padu", name: "Padu Logistik Sdn. Bhd.", role: "Org 10" }],
  dateLabel: "Friday, 10 Jul 2026",
  nowLabel: "2:45 PM",
  nowHour: 14.75,

  // Vehicle fields (category, vendor, capacity) mirror the shape used in
  // flows/org-vehicle-list/data.js so the info modal reads like the same
  // fleet record, not a separate MyTrip-only summary.
  vehicles: [
    { id: "v1", plate: "WXY 4521", model: "Hino 500 · 10t", category: "Lorry", vendor: "Padu Fleet", capacity: 10400 },
    { id: "v2", plate: "BMA 8830", model: "Isuzu NPR · 5t", category: "Lorry", vendor: "Swift Leasing", capacity: 5100 },
    { id: "v3", plate: "JJC 2214", model: "Fuso Fighter · 10t", category: "Truck", vendor: "Padu Fleet", capacity: 10200 },
    { id: "v4", plate: "PGK 6633", model: "Hino 300 · 3t", category: "Lorry", vendor: "Padu Fleet", capacity: 3100 },
    { id: "v5", plate: "VBT 1108", model: "Scania P360 · Prime", category: "Prime Mover", vendor: "Bintang Mobility", capacity: 25000 },
    { id: "v6", plate: "WTC 9902", model: "Isuzu FVR · 15t", category: "Truck", vendor: "North Cold Chain", capacity: 15300 },
    { id: "v7", plate: "KEL 3377", model: "Hino 500 · 10t", category: "Lorry", vendor: "Padu Fleet", capacity: 10400 },
    { id: "v8", plate: "NCS 5541", model: "Daihatsu Gran Max · 1t", category: "Van", vendor: "Swift Leasing", capacity: 1000 },
  ],
  drivers: [
    { id: "d1", name: "Azman Hashim", driverId: "DRV-014", phone: "012-883 9214" },
    { id: "d2", name: "Faizal Rahman", driverId: "DRV-022", phone: "012-661 1024" },
    { id: "d3", name: "Kumar Subramaniam", driverId: "DRV-005", phone: "013-800 2265" },
    { id: "d4", name: "Lim Wei Jian", driverId: "DRV-031", phone: "016-274 5589" },
    { id: "d5", name: "Syed Amir", driverId: "DRV-009", phone: "017-390 1147" },
    { id: "d6", name: "Hafiz Zulkifli", driverId: "DRV-018", phone: "019-552 8830" },
    { id: "d7", name: "Ravi Chandran", driverId: "DRV-027", phone: "011-2045 6613" },
    { id: "d8", name: "Zainal Abidin", driverId: "DRV-012", phone: "012-770 3391" },
  ],

  // Trip records (today). status: completed | ongoing | pending | paused | terminated
  trips: [
    { id: "TRP-2607", vehicleId: "v1", driverId: "d1", from: "Port Klang (Westports)", to: "Shah Alam Hub", status: "ongoing",   started: "7:05 AM",  eta: "3:40 PM", progress: 72,
      pausedAt: null, events: [
        { t: "6:10 AM", label: "Trip assigned", icon: "assignment" },
        { t: "7:05 AM", label: "Departed Port Klang (Westports)", icon: "local_shipping" },
        { t: "11:32 AM", label: "Checkpoint — Bukit Raja weighbridge", icon: "location_on" },
      ]},
    { id: "TRP-2608", vehicleId: "v2", driverId: "d2", from: "Shah Alam Hub", to: "Nilai Industrial Park", status: "paused", started: "8:20 AM", eta: "4:15 PM", progress: 48,
      pausedAt: "12:22 PM", pausedFor: "2h 23m", pauseReason: "Driver rest stop",
      events: [
        { t: "7:40 AM", label: "Trip assigned", icon: "assignment" },
        { t: "8:20 AM", label: "Departed Shah Alam Hub", icon: "local_shipping" },
        { t: "12:22 PM", label: "Trip paused — driver rest stop (R&R Seremban)", icon: "pause_circle" },
      ]},
    { id: "TRP-2609", vehicleId: "v5", driverId: "d5", from: "Penang Port (NBCT)", to: "Ipoh Depot", status: "paused", started: "6:45 AM", eta: "2:30 PM", progress: 61,
      pausedAt: "1:05 PM", pausedFor: "1h 40m", pauseReason: "Vehicle inspection",
      events: [
        { t: "6:00 AM", label: "Trip assigned", icon: "assignment" },
        { t: "6:45 AM", label: "Departed Penang Port (NBCT)", icon: "local_shipping" },
        { t: "1:05 PM", label: "Trip paused — roadside vehicle inspection (Taiping)", icon: "pause_circle" },
      ]},
    { id: "TRP-2610", vehicleId: "v3", driverId: "d3", from: "PTP Johor", to: "Melaka DC", status: "ongoing", started: "9:10 AM", eta: "5:05 PM", progress: 55,
      events: [
        { t: "8:15 AM", label: "Trip assigned", icon: "assignment" },
        { t: "9:10 AM", label: "Departed PTP Johor", icon: "local_shipping" },
      ]},
    { id: "TRP-2611", vehicleId: "v6", driverId: "d6", from: "Westports", to: "Rawang Warehouse", status: "ongoing", started: "10:30 AM", eta: "4:50 PM", progress: 38,
      events: [
        { t: "9:50 AM", label: "Trip assigned", icon: "assignment" },
        { t: "10:30 AM", label: "Departed Westports", icon: "local_shipping" },
      ]},
    { id: "TRP-2612", vehicleId: "v7", driverId: "d7", from: "KLIA Cargo (KACT)", to: "Cyberjaya Hub", status: "ongoing", started: "11:15 AM", eta: "3:10 PM", progress: 81,
      events: [
        { t: "10:20 AM", label: "Trip assigned", icon: "assignment" },
        { t: "11:15 AM", label: "Departed KLIA Cargo", icon: "local_shipping" },
      ]},
    { id: "TRP-2613", vehicleId: "v4", driverId: "d4", from: "Bukit Raja Depot", to: "Klang Valley multi-drop (6 stops)", status: "ongoing", started: "1:05 PM", eta: "6:30 PM", progress: 22,
      events: [
        { t: "12:15 PM", label: "Trip assigned", icon: "assignment" },
        { t: "1:05 PM", label: "Departed Bukit Raja Depot", icon: "local_shipping" },
      ]},
    { id: "TRP-2614", vehicleId: "v1", driverId: "d1", from: "Shah Alam Hub", to: "Port Klang (Westports)", status: "pending", scheduled: "4:30 PM", eta: "6:45 PM",
      events: [{ t: "1:40 PM", label: "Trip assigned — departs 4:30 PM", icon: "assignment" }]},
    { id: "TRP-2615", vehicleId: "v8", driverId: "d8", from: "Subang Depot", to: "Genting Highlands F&B run", status: "pending", scheduled: "5:00 PM", eta: "8:10 PM",
      events: [{ t: "2:05 PM", label: "Trip assigned — departs 5:00 PM", icon: "assignment" }]},
    { id: "TRP-2616", vehicleId: "v3", driverId: "d3", from: "Melaka DC", to: "PTP Johor (return)", status: "pending", scheduled: "6:00 PM", eta: "9:40 PM",
      events: [{ t: "11:00 AM", label: "Trip assigned — departs 6:00 PM", icon: "assignment" }]},
    { id: "TRP-2617", vehicleId: "v6", driverId: "d6", from: "Rawang Warehouse", to: "Westports (return)", status: "pending", scheduled: "5:45 PM", eta: "8:20 PM",
      events: [{ t: "12:30 PM", label: "Trip assigned — departs 5:45 PM", icon: "assignment" }]},
    { id: "TRP-2601", vehicleId: "v1", driverId: "d1", from: "Westports", to: "Bukit Raja Depot", status: "completed", started: "5:30 AM", completedAt: "6:40 AM",
      events: [
        { t: "5:30 AM", label: "Departed Westports", icon: "local_shipping" },
        { t: "6:40 AM", label: "Delivered — Bukit Raja Depot", icon: "check_circle" },
      ]},
    { id: "TRP-2602", vehicleId: "v2", driverId: "d2", from: "Nilai Industrial Park", to: "Shah Alam Hub", status: "completed", started: "5:50 AM", completedAt: "7:55 AM",
      events: [
        { t: "5:50 AM", label: "Departed Nilai Industrial Park", icon: "local_shipping" },
        { t: "7:55 AM", label: "Delivered — Shah Alam Hub", icon: "check_circle" },
      ]},
    { id: "TRP-2603", vehicleId: "v4", driverId: "d4", from: "Klang Valley multi-drop", to: "Bukit Raja Depot", status: "completed", started: "6:15 AM", completedAt: "12:10 PM",
      events: [
        { t: "6:15 AM", label: "Departed Bukit Raja Depot", icon: "local_shipping" },
        { t: "12:10 PM", label: "All 8 drops completed", icon: "check_circle" },
      ]},
    { id: "TRP-2604", vehicleId: "v7", driverId: "d7", from: "Cyberjaya Hub", to: "KLIA Cargo (KACT)", status: "completed", started: "7:00 AM", completedAt: "9:20 AM",
      events: [
        { t: "7:00 AM", label: "Departed Cyberjaya Hub", icon: "local_shipping" },
        { t: "9:20 AM", label: "Delivered — KLIA Cargo", icon: "check_circle" },
      ]},
    { id: "TRP-2605", vehicleId: "v8", driverId: "d8", from: "Subang Depot", to: "Mid Valley retail drop", status: "completed", started: "8:05 AM", completedAt: "10:15 AM",
      events: [
        { t: "8:05 AM", label: "Departed Subang Depot", icon: "local_shipping" },
        { t: "10:15 AM", label: "Delivered — Mid Valley", icon: "check_circle" },
      ]},
    { id: "TRP-2606", vehicleId: "v5", driverId: "d5", from: "Ipoh Depot", to: "Penang Port (NBCT)", status: "completed", started: "4:40 AM", completedAt: "6:20 AM",
      events: [
        { t: "4:40 AM", label: "Departed Ipoh Depot", icon: "local_shipping" },
        { t: "6:20 AM", label: "Delivered — Penang Port", icon: "check_circle" },
      ]},
    { id: "TRP-2598", vehicleId: "v6", driverId: "d6", from: "Westports", to: "Seremban DC", status: "terminated", started: "6:30 AM", terminatedAt: "8:05 AM", terminateReason: "Consignment cancelled by customer",
      events: [
        { t: "6:30 AM", label: "Departed Westports", icon: "local_shipping" },
        { t: "8:05 AM", label: "Trip terminated — consignment cancelled", icon: "cancel" },
      ]},
  ],

  // Extra completed count folded into KPI (multi-leg trips not itemised above).
  kpis: { completed: 12, ongoing: 5, pending: 4, paused: 2 },

  // Fleet status snapshot (vehicle lens). status: in_progress | idle | assigned
  fleetStatus: [
    { vehicleId: "v1", driverId: "d1", status: "in_progress", tripId: "TRP-2607" },
    { vehicleId: "v2", driverId: "d2", status: "in_progress", tripId: "TRP-2608" },
    { vehicleId: "v3", driverId: "d3", status: "in_progress", tripId: "TRP-2610" },
    { vehicleId: "v4", driverId: "d4", status: "in_progress", tripId: "TRP-2613" },
    { vehicleId: "v5", driverId: "d5", status: "in_progress", tripId: "TRP-2609" },
    { vehicleId: "v6", driverId: "d6", status: "in_progress", tripId: "TRP-2611" },
    { vehicleId: "v7", driverId: "d7", status: "assigned", tripId: "TRP-2612" },
    { vehicleId: "v8", driverId: "d8", status: "idle", tripId: null },
  ],

  // Assigned vs Completed chart, per scope per range.
  chart: {
    vehicle: {
      today: [
        { id: "v1", label: "WXY 4521", assigned: 3, completed: 1 },
        { id: "v2", label: "BMA 8830", assigned: 2, completed: 1 },
        { id: "v3", label: "JJC 2214", assigned: 2, completed: 0 },
        { id: "v4", label: "PGK 6633", assigned: 2, completed: 1 },
        { id: "v5", label: "VBT 1108", assigned: 2, completed: 1 },
        { id: "v6", label: "WTC 9902", assigned: 3, completed: 0 },
        { id: "v7", label: "KEL 3377", assigned: 2, completed: 1 },
        { id: "v8", label: "NCS 5541", assigned: 2, completed: 1 },
      ],
      mtd: [
        { id: "v1", label: "WXY 4521", assigned: 24, completed: 22 },
        { id: "v2", label: "BMA 8830", assigned: 21, completed: 17 },
        { id: "v3", label: "JJC 2214", assigned: 18, completed: 16 },
        { id: "v4", label: "PGK 6633", assigned: 26, completed: 25 },
        { id: "v5", label: "VBT 1108", assigned: 19, completed: 14 },
        { id: "v6", label: "WTC 9902", assigned: 22, completed: 15 },
        { id: "v7", label: "KEL 3377", assigned: 20, completed: 19 },
        { id: "v8", label: "NCS 5541", assigned: 16, completed: 15 },
      ],
      six: [
        { id: "v1", label: "WXY 4521", assigned: 148, completed: 139 },
        { id: "v2", label: "BMA 8830", assigned: 132, completed: 110 },
        { id: "v3", label: "JJC 2214", assigned: 117, completed: 104 },
        { id: "v4", label: "PGK 6633", assigned: 160, completed: 154 },
        { id: "v5", label: "VBT 1108", assigned: 121, completed: 92 },
        { id: "v6", label: "WTC 9902", assigned: 138, completed: 101 },
        { id: "v7", label: "KEL 3377", assigned: 126, completed: 118 },
        { id: "v8", label: "NCS 5541", assigned: 98, completed: 91 },
      ],
    },
    driver: {
      today: [
        { id: "d1", label: "Azman H.", assigned: 3, completed: 1 },
        { id: "d2", label: "Faizal R.", assigned: 2, completed: 1 },
        { id: "d3", label: "Kumar S.", assigned: 2, completed: 0 },
        { id: "d4", label: "Lim W.J.", assigned: 2, completed: 1 },
        { id: "d5", label: "Syed A.", assigned: 2, completed: 1 },
        { id: "d6", label: "Hafiz Z.", assigned: 3, completed: 0 },
        { id: "d7", label: "Ravi C.", assigned: 2, completed: 1 },
        { id: "d8", label: "Zainal A.", assigned: 2, completed: 1 },
      ],
      mtd: [
        { id: "d1", label: "Azman H.", assigned: 24, completed: 22 },
        { id: "d2", label: "Faizal R.", assigned: 21, completed: 17 },
        { id: "d3", label: "Kumar S.", assigned: 18, completed: 16 },
        { id: "d4", label: "Lim W.J.", assigned: 26, completed: 25 },
        { id: "d5", label: "Syed A.", assigned: 19, completed: 14 },
        { id: "d6", label: "Hafiz Z.", assigned: 22, completed: 15 },
        { id: "d7", label: "Ravi C.", assigned: 20, completed: 19 },
        { id: "d8", label: "Zainal A.", assigned: 16, completed: 15 },
      ],
      six: [
        { id: "d1", label: "Azman H.", assigned: 148, completed: 139 },
        { id: "d2", label: "Faizal R.", assigned: 132, completed: 110 },
        { id: "d3", label: "Kumar S.", assigned: 117, completed: 104 },
        { id: "d4", label: "Lim W.J.", assigned: 160, completed: 154 },
        { id: "d5", label: "Syed A.", assigned: 121, completed: 92 },
        { id: "d6", label: "Hafiz Z.", assigned: 138, completed: 101 },
        { id: "d7", label: "Ravi C.", assigned: 126, completed: 118 },
        { id: "d8", label: "Zainal A.", assigned: 98, completed: 91 },
      ],
    },
  },

  // Schedule timeline. Hours are decimal (24h). status: completed | assigned | terminated
  schedule: {
    today: [
      { vehicleId: "v1", bars: [
        { tripId: "TRP-2601", start: 5.5, end: 6.7, status: "completed" },
        { tripId: "TRP-2607", start: 7.1, end: 15.7, status: "assigned" },
        { tripId: "TRP-2614", start: 16.5, end: 18.75, status: "assigned" },
      ]},
      { vehicleId: "v2", bars: [
        { tripId: "TRP-2602", start: 5.8, end: 7.9, status: "completed" },
        { tripId: "TRP-2608", start: 8.3, end: 16.25, status: "assigned" },
      ]},
      { vehicleId: "v3", bars: [
        { tripId: "TRP-2610", start: 9.2, end: 17.1, status: "assigned" },
        { tripId: "TRP-2616", start: 18, end: 21.7, status: "assigned" },
      ]},
      { vehicleId: "v4", bars: [
        { tripId: "TRP-2603", start: 6.25, end: 12.2, status: "completed" },
        { tripId: "TRP-2613", start: 13.1, end: 18.5, status: "assigned" },
      ]},
      { vehicleId: "v5", bars: [
        { tripId: "TRP-2606", start: 4.7, end: 6.3, status: "completed" },
        { tripId: "TRP-2609", start: 6.75, end: 14.5, status: "assigned" },
      ]},
      { vehicleId: "v6", bars: [
        { tripId: "TRP-2598", start: 6.5, end: 8.1, status: "terminated" },
        { tripId: "TRP-2611", start: 10.5, end: 16.8, status: "assigned" },
        { tripId: "TRP-2617", start: 17.75, end: 20.3, status: "assigned" },
      ]},
      { vehicleId: "v7", bars: [
        { tripId: "TRP-2604", start: 7, end: 9.3, status: "completed" },
        { tripId: "TRP-2612", start: 11.25, end: 15.2, status: "assigned" },
      ]},
      { vehicleId: "v8", bars: [
        { tripId: "TRP-2605", start: 8.1, end: 10.25, status: "completed" },
        { tripId: "TRP-2615", start: 17, end: 20.2, status: "assigned" },
      ]},
    ],
    tomorrow: [
      { vehicleId: "v1", bars: [
        { tripId: "TRP-2620", start: 6, end: 10.5, status: "assigned" },
        { tripId: "TRP-2624", start: 12, end: 17, status: "assigned" },
      ]},
      { vehicleId: "v2", bars: [{ tripId: "TRP-2621", start: 7, end: 13, status: "assigned" }]},
      { vehicleId: "v3", bars: [{ tripId: "TRP-2622", start: 8.5, end: 16, status: "assigned" }]},
      { vehicleId: "v4", bars: [
        { tripId: "TRP-2623", start: 6.5, end: 12, status: "assigned" },
        { tripId: "TRP-2626", start: 14, end: 18.5, status: "assigned" },
      ]},
      { vehicleId: "v5", bars: [{ tripId: "TRP-2625", start: 5, end: 13.5, status: "assigned" }]},
      { vehicleId: "v6", bars: [{ tripId: "TRP-2627", start: 9, end: 17.5, status: "assigned" }]},
      { vehicleId: "v7", bars: [{ tripId: "TRP-2628", start: 7.5, end: 11, status: "assigned" }]},
      { vehicleId: "v8", bars: []},
    ],
  },
};
