// data.js — mock data for the MyTrip Fleet Map (test) flow.
//
// Purpose-built for the map view. Each fleet entry is one vehicle with its
// current trip and a waypoints[] carrying real-ish Klang Valley / peninsula
// coordinates. The "checkpoint pin" = the last waypoint with status "done"
// (or "current" if the driver is mid-leg). No live GPS — pins snap to the last
// completed waypoint, matching how real fleet apps ping at stops.
//
// Bulked to 20 vehicles (vs. the original 8) to stress-test the rail list —
// scroll behaviour, section counts, long driver-name truncation.
//
//   section    : "ongoing" | "not_started" | "completed"  (rail grouping;
//                "not_started" renders as "Upcoming" in the UI)
//   waypoint   : { label, lat, lng, status: "done"|"current"|"pending", t }
window.MYTRIP_MAP = {
  org: { id: "padu", name: "Padu Logistik Sdn. Bhd.", orgLabel: "Org 10" },
  orgs: [{ id: "padu", name: "Padu Logistik Sdn. Bhd.", role: "Org 10" }],
  dateLabel: "Friday, 10 Jul 2026",
  nowLabel: "2:45 PM",

  // Trip KPIs (aggregate trip counts today) — shown as rail chips. These are
  // trip totals, not vehicle counts, so they intentionally differ from the
  // per-section vehicle tallies below.
  kpis: { completed: 17, ongoing: 10, pending: 5, paused: 3 },

  vehicles: [
    { id: "v1", plate: "WXY 4521", model: "Hino 500 · 10t", category: "Lorry", vendor: "Padu Fleet", capacity: 10400 },
    { id: "v2", plate: "BMA 8830", model: "Isuzu NPR · 5t", category: "Lorry", vendor: "Swift Leasing", capacity: 5100 },
    { id: "v3", plate: "JJC 2214", model: "Fuso Fighter · 10t", category: "Truck", vendor: "Padu Fleet", capacity: 10200 },
    { id: "v4", plate: "PGK 6633", model: "Hino 300 · 3t", category: "Lorry", vendor: "Padu Fleet", capacity: 3100 },
    { id: "v5", plate: "VBT 1108", model: "Scania P360 · Prime", category: "Prime Mover", vendor: "Bintang Mobility", capacity: 25000 },
    { id: "v6", plate: "WTC 9902", model: "Isuzu FVR · 15t", category: "Truck", vendor: "North Cold Chain", capacity: 15300 },
    { id: "v7", plate: "KEL 3377", model: "Hino 500 · 10t", category: "Lorry", vendor: "Padu Fleet", capacity: 10400 },
    { id: "v8", plate: "NCS 5541", model: "Daihatsu Gran Max · 1t", category: "Van", vendor: "Swift Leasing", capacity: 1000 },
    { id: "v9", plate: "MYT 2201", model: "Isuzu NPR · 5t", category: "Lorry", vendor: "Padu Fleet", capacity: 5100 },
    { id: "v10", plate: "SGR 7742", model: "Hino 300 · 3t", category: "Lorry", vendor: "Swift Leasing", capacity: 3100 },
    { id: "v11", plate: "KJG 5511", model: "Fuso Fighter · 10t", category: "Truck", vendor: "Padu Fleet", capacity: 10200 },
    { id: "v12", plate: "TPH 8890", model: "Isuzu FVR · 15t", category: "Truck", vendor: "North Cold Chain", capacity: 15300 },
    { id: "v13", plate: "PJY 3345", model: "Daihatsu Gran Max · 1t", category: "Van", vendor: "Swift Leasing", capacity: 1000 },
    { id: "v14", plate: "BTU 6602", model: "Hino 500 · 10t", category: "Lorry", vendor: "Padu Fleet", capacity: 10400 },
    { id: "v15", plate: "SBH 1190", model: "Isuzu NPR · 5t", category: "Lorry", vendor: "Bintang Mobility", capacity: 5100 },
    { id: "v16", plate: "KLG 9987", model: "Fuso Fighter · 10t", category: "Truck", vendor: "Padu Fleet", capacity: 10200 },
    { id: "v17", plate: "RWG 4423", model: "Hino 300 · 3t", category: "Lorry", vendor: "Swift Leasing", capacity: 3100 },
    { id: "v18", plate: "PDG 7765", model: "Scania P360 · Prime", category: "Prime Mover", vendor: "Bintang Mobility", capacity: 25000 },
    { id: "v19", plate: "JHR 2290", model: "Isuzu FVR · 15t", category: "Truck", vendor: "North Cold Chain", capacity: 15300 },
    { id: "v20", plate: "MLK 5581", model: "Daihatsu Gran Max · 1t", category: "Van", vendor: "Padu Fleet", capacity: 1000 },
  ],
  drivers: [
    { id: "d1", name: "Azman Hashim", driverId: "DRV-014", phone: "012-883 9214", email: "azman.hashim@padulogistik.com.my" },
    { id: "d2", name: "Faizal Rahman", driverId: "DRV-022", phone: "012-661 1024", email: "faizal.rahman@padulogistik.com.my" },
    { id: "d3", name: "Kumar Subramaniam", driverId: "DRV-005", phone: "013-800 2265", email: "kumar.subramaniam@padulogistik.com.my" },
    { id: "d4", name: "Lim Wei Jian", driverId: "DRV-031", phone: "016-274 5589", email: "lim.wei@padulogistik.com.my" },
    { id: "d5", name: "Syed Amir", driverId: "DRV-009", phone: "017-390 1147", email: "syed.amir@padulogistik.com.my" },
    { id: "d6", name: "Hafiz Zulkifli", driverId: "DRV-018", phone: "019-552 8830", email: "hafiz.zulkifli@padulogistik.com.my" },
    { id: "d7", name: "Ravi Chandran", driverId: "DRV-027", phone: "011-2045 6613", email: "ravi.chandran@padulogistik.com.my" },
    { id: "d8", name: "Zainal Abidin", driverId: "DRV-012", phone: "012-770 3391", email: "zainal.abidin@padulogistik.com.my" },
    { id: "d9", name: "Mohd Nazrin Ismail", driverId: "DRV-041", phone: "013-661 2290", email: "mohd.nazrin@padulogistik.com.my" },
    { id: "d10", name: "Tan Chee Keong", driverId: "DRV-038", phone: "016-330 4471", email: "tan.chee@padulogistik.com.my" },
    { id: "d11", name: "Suresh Kumaran", driverId: "DRV-019", phone: "012-905 6672", email: "suresh.kumaran@padulogistik.com.my" },
    { id: "d12", name: "Amirul Haziq", driverId: "DRV-047", phone: "017-224 8815", email: "amirul.haziq@padulogistik.com.my" },
    { id: "d13", name: "Wong Kah Yan", driverId: "DRV-052", phone: "011-3399 2201", email: "wong.kah@padulogistik.com.my" },
    { id: "d14", name: "Rosli Mat Isa", driverId: "DRV-026", phone: "019-770 4432", email: "rosli.mat@padulogistik.com.my" },
    { id: "d15", name: "Devan Rajaratnam", driverId: "DRV-033", phone: "012-448 9910", email: "devan.rajaratnam@padulogistik.com.my" },
    { id: "d16", name: "Fahmi Yusof", driverId: "DRV-057", phone: "016-882 1147", email: "fahmi.yusof@padulogistik.com.my" },
    { id: "d17", name: "Chong Wei Ming", driverId: "DRV-029", phone: "013-556 7723", email: "chong.wei@padulogistik.com.my" },
    { id: "d18", name: "Balasubramaniam Perumal", driverId: "DRV-061", phone: "017-990 3382", email: "balasubramaniam.perumal@padulogistik.com.my" },
    { id: "d19", name: "Iskandar Zulkarnain", driverId: "DRV-044", phone: "012-221 5567", email: "iskandar.zulkarnain@padulogistik.com.my" },
    { id: "d20", name: "Nur Hafiz Aiman", driverId: "DRV-036", phone: "011-6602 7789", email: "nur.hafiz@padulogistik.com.my" },
  ],

  // One entry per vehicle = the map's unit of selection.
  fleet: [
    {
      vehicleId: "v1", driverId: "d1", tripId: "TRP-2607", section: "ongoing", state: "moving",
      from: "Port Klang (Westports)", to: "Shah Alam Hub", eta: "10 Jul 2026, 3:40 PM", started: "7:05 AM",
      waypoints: [
        { label: "Port Klang (Westports)", lat: 2.9959, lng: 101.3179, status: "done", t: "7:05 AM · departed" },
        { label: "Bukit Raja weighbridge", lat: 3.0833, lng: 101.4700, status: "done", t: "11:32 AM · cleared" },
        { label: "Federal Hwy — Klang toll", lat: 3.0490, lng: 101.4900, status: "current", t: "1:10 PM · last ping" },
        { label: "Shah Alam Hub", lat: 3.0733, lng: 101.5185, status: "pending", t: "ETA 3:40 PM" },
      ],
    },
    {
      vehicleId: "v2", driverId: "d2", tripId: "TRP-2608", section: "ongoing", state: "paused",
      from: "Shah Alam Hub", to: "Nilai Industrial Park", eta: "10 Jul 2026, 4:15 PM", started: "8:20 AM",
      pausedFor: "2h 23m", pauseReason: "Driver rest stop",
      waypoints: [
        { label: "Shah Alam Hub", lat: 3.0733, lng: 101.5185, status: "done", t: "8:20 AM · departed" },
        { label: "Kajang checkpoint", lat: 2.9930, lng: 101.7870, status: "done", t: "11:00 AM · passed" },
        { label: "R&R Seremban (rest)", lat: 2.7600, lng: 101.9100, status: "current", t: "12:22 PM · paused" },
        { label: "Nilai Industrial Park", lat: 2.8080, lng: 101.7960, status: "pending", t: "ETA 4:15 PM" },
      ],
    },
    {
      vehicleId: "v3", driverId: "d3", tripId: "TRP-2610", section: "ongoing", state: "moving",
      from: "PTP Johor", to: "Melaka DC", eta: "10 Jul 2026, 5:05 PM", started: "9:10 AM",
      waypoints: [
        { label: "PTP Johor", lat: 1.3644, lng: 103.5320, status: "done", t: "9:10 AM · departed" },
        { label: "Batu Pahat", lat: 1.8548, lng: 102.9325, status: "done", t: "11:30 AM · passed" },
        { label: "Muar", lat: 2.0442, lng: 102.5689, status: "current", t: "1:00 PM · last ping" },
        { label: "Melaka DC", lat: 2.2100, lng: 102.2400, status: "pending", t: "ETA 5:05 PM" },
      ],
    },
    {
      vehicleId: "v4", driverId: "d4", tripId: "TRP-2613", section: "ongoing", state: "moving",
      from: "Bukit Raja Depot", to: "Klang Valley multi-drop", eta: "10 Jul 2026, 6:30 PM", started: "1:05 PM",
      waypoints: [
        { label: "Bukit Raja Depot", lat: 3.0833, lng: 101.4700, status: "done", t: "1:05 PM · departed" },
        { label: "Drop 1 — Klang town", lat: 3.0440, lng: 101.4450, status: "done", t: "1:40 PM · delivered" },
        { label: "Drop 2 — Shah Alam", lat: 3.0730, lng: 101.5180, status: "current", t: "2:30 PM · delivering" },
        { label: "Drop 3 — Petaling Jaya", lat: 3.1073, lng: 101.6067, status: "pending", t: "queued" },
        { label: "Drop 4 — Subang", lat: 3.0840, lng: 101.5820, status: "pending", t: "queued" },
      ],
    },
    {
      vehicleId: "v6", driverId: "d6", tripId: "TRP-2611", section: "ongoing", state: "moving",
      from: "Westports", to: "Rawang Warehouse", eta: "10 Jul 2026, 4:50 PM", started: "10:30 AM",
      waypoints: [
        { label: "Westports", lat: 2.9959, lng: 101.3179, status: "done", t: "10:30 AM · departed" },
        { label: "Klang", lat: 3.0440, lng: 101.4450, status: "done", t: "11:15 AM · passed" },
        { label: "Kepong", lat: 3.2100, lng: 101.6350, status: "current", t: "1:20 PM · last ping" },
        { label: "Rawang Warehouse", lat: 3.3210, lng: 101.5760, status: "pending", t: "ETA 4:50 PM" },
      ],
    },
    {
      vehicleId: "v9", driverId: "d9", tripId: "TRP-2630", section: "ongoing", state: "moving",
      from: "Puchong Depot", to: "Cheras Distribution Ctr", eta: "10 Jul 2026, 3:55 PM", started: "12:40 PM",
      waypoints: [
        { label: "Puchong Depot", lat: 3.0219, lng: 101.6169, status: "done", t: "12:40 PM · departed" },
        { label: "Sri Petaling", lat: 3.0708, lng: 101.6890, status: "current", t: "1:45 PM · last ping" },
        { label: "Cheras Distribution Ctr", lat: 3.1073, lng: 101.7420, status: "pending", t: "ETA 3:55 PM" },
      ],
    },
    {
      vehicleId: "v10", driverId: "d10", tripId: "TRP-2631", section: "ongoing", state: "paused",
      from: "Ampang Hub", to: "Gombak Warehouse", eta: "10 Jul 2026, 4:30 PM", started: "11:15 AM",
      pausedFor: "48m", pauseReason: "Loading delay",
      waypoints: [
        { label: "Ampang Hub", lat: 3.1495, lng: 101.7620, status: "done", t: "11:15 AM · departed" },
        { label: "Setapak", lat: 3.1930, lng: 101.7180, status: "current", t: "1:50 PM · paused" },
        { label: "Gombak Warehouse", lat: 3.2280, lng: 101.7060, status: "pending", t: "ETA 4:30 PM" },
      ],
    },
    {
      vehicleId: "v11", driverId: "d11", tripId: "TRP-2632", section: "ongoing", state: "moving",
      from: "Seremban Depot", to: "Melaka DC", eta: "10 Jul 2026, 5:20 PM", started: "1:00 PM",
      waypoints: [
        { label: "Seremban Depot", lat: 2.7297, lng: 101.9381, status: "done", t: "1:00 PM · departed" },
        { label: "Tampin", lat: 2.4650, lng: 102.2340, status: "current", t: "2:15 PM · last ping" },
        { label: "Melaka DC", lat: 2.2100, lng: 102.2400, status: "pending", t: "ETA 5:20 PM" },
      ],
    },
    {
      vehicleId: "v12", driverId: "d12", tripId: "TRP-2633", section: "ongoing", state: "moving",
      from: "Ipoh Depot", to: "Taiping Warehouse", eta: "10 Jul 2026, 4:05 PM", started: "1:20 PM",
      waypoints: [
        { label: "Ipoh Depot", lat: 4.5975, lng: 101.0900, status: "done", t: "1:20 PM · departed" },
        { label: "Kuala Kangsar", lat: 4.7710, lng: 100.9350, status: "current", t: "2:25 PM · last ping" },
        { label: "Taiping Warehouse", lat: 4.8500, lng: 100.7400, status: "pending", t: "ETA 4:05 PM" },
      ],
    },
    {
      vehicleId: "v19", driverId: "d19", tripId: "TRP-2634", section: "ongoing", state: "moving",
      from: "Pasir Gudang Port", to: "Kluang Depot", eta: "10 Jul 2026, 4:45 PM", started: "12:10 PM",
      waypoints: [
        { label: "Pasir Gudang Port", lat: 1.4650, lng: 103.9000, status: "done", t: "12:10 PM · departed" },
        { label: "Kulai", lat: 1.6640, lng: 103.6030, status: "current", t: "1:40 PM · last ping" },
        { label: "Kluang Depot", lat: 2.0300, lng: 103.3180, status: "pending", t: "ETA 4:45 PM" },
      ],
    },
    {
      vehicleId: "v8", driverId: "d8", tripId: "TRP-2615", section: "not_started", state: "assigned",
      from: "Subang Depot", to: "Genting Highlands F&B run", eta: "10 Jul 2026, 8:10 PM", scheduled: "10 Jul 2026, 5:00 PM",
      waypoints: [
        { label: "Subang Depot", lat: 3.0840, lng: 101.5820, status: "pending", t: "departs 5:00 PM" },
        { label: "Genting Highlands", lat: 3.4231, lng: 101.7930, status: "pending", t: "ETA 8:10 PM" },
      ],
    },
    {
      vehicleId: "v13", driverId: "d13", tripId: "TRP-2635", section: "not_started", state: "assigned",
      from: "Petaling Jaya Depot", to: "Kuala Selangor run", eta: "10 Jul 2026, 7:20 PM", scheduled: "10 Jul 2026, 5:15 PM",
      waypoints: [
        { label: "Petaling Jaya Depot", lat: 3.1073, lng: 101.6067, status: "pending", t: "departs 5:15 PM" },
        { label: "Kuala Selangor", lat: 3.3400, lng: 101.2500, status: "pending", t: "ETA 7:20 PM" },
      ],
    },
    {
      vehicleId: "v14", driverId: "d14", tripId: "TRP-2636", section: "not_started", state: "assigned",
      from: "Bangi Warehouse", to: "Putrajaya Depot", eta: "10 Jul 2026, 6:00 PM", scheduled: "10 Jul 2026, 5:30 PM",
      waypoints: [
        { label: "Bangi Warehouse", lat: 2.9180, lng: 101.7900, status: "pending", t: "departs 5:30 PM" },
        { label: "Putrajaya Depot", lat: 2.9264, lng: 101.6964, status: "pending", t: "ETA 6:00 PM" },
      ],
    },
    {
      vehicleId: "v15", driverId: "d15", tripId: "TRP-2637", section: "not_started", state: "assigned",
      from: "Sepang Cargo Village", to: "Nilai Industrial Park", eta: "10 Jul 2026, 7:45 PM", scheduled: "10 Jul 2026, 6:00 PM",
      waypoints: [
        { label: "Sepang Cargo Village", lat: 2.7456, lng: 101.7099, status: "pending", t: "departs 6:00 PM" },
        { label: "Nilai Industrial Park", lat: 2.8080, lng: 101.7960, status: "pending", t: "ETA 7:45 PM" },
      ],
    },
    {
      vehicleId: "v20", driverId: "d20", tripId: "TRP-2638", section: "not_started", state: "assigned",
      from: "Melaka DC", to: "Muar Cross-dock", eta: "10 Jul 2026, 8:30 PM", scheduled: "10 Jul 2026, 6:15 PM",
      waypoints: [
        { label: "Melaka DC", lat: 2.2100, lng: 102.2400, status: "pending", t: "departs 6:15 PM" },
        { label: "Muar Cross-dock", lat: 2.0442, lng: 102.5689, status: "pending", t: "ETA 8:30 PM" },
      ],
    },
    {
      vehicleId: "v5", driverId: "d5", tripId: "TRP-2606", section: "completed", state: "done",
      from: "Ipoh Depot", to: "Penang Port (NBCT)", completedAt: "10 Jul 2026, 6:20 AM", started: "4:40 AM",
      waypoints: [
        { label: "Ipoh Depot", lat: 4.5975, lng: 101.0900, status: "done", t: "4:40 AM · departed" },
        { label: "Bukit Mertajam", lat: 5.3600, lng: 100.4600, status: "done", t: "5:45 AM · passed" },
        { label: "Penang Port (NBCT)", lat: 5.4100, lng: 100.3600, status: "done", t: "6:20 AM · delivered" },
      ],
    },
    {
      vehicleId: "v7", driverId: "d7", tripId: "TRP-2604", section: "completed", state: "done",
      from: "Cyberjaya Hub", to: "KLIA Cargo (KACT)", completedAt: "10 Jul 2026, 9:20 AM", started: "7:00 AM",
      waypoints: [
        { label: "Cyberjaya Hub", lat: 2.9213, lng: 101.6559, status: "done", t: "7:00 AM · departed" },
        { label: "KLIA Cargo (KACT)", lat: 2.7456, lng: 101.7099, status: "done", t: "9:20 AM · delivered" },
      ],
    },
    {
      vehicleId: "v16", driverId: "d16", tripId: "TRP-2620", section: "completed", state: "done",
      from: "Klang Warehouse", to: "Bukit Raja Depot", completedAt: "10 Jul 2026, 8:35 AM", started: "6:50 AM",
      waypoints: [
        { label: "Klang Warehouse", lat: 3.0440, lng: 101.4450, status: "done", t: "6:50 AM · departed" },
        { label: "Bukit Raja Depot", lat: 3.0833, lng: 101.4700, status: "done", t: "8:35 AM · delivered" },
      ],
    },
    {
      vehicleId: "v17", driverId: "d17", tripId: "TRP-2621", section: "completed", state: "done",
      from: "Rawang Warehouse", to: "Westports (return)", completedAt: "10 Jul 2026, 10:05 AM", started: "7:30 AM",
      waypoints: [
        { label: "Rawang Warehouse", lat: 3.3210, lng: 101.5760, status: "done", t: "7:30 AM · departed" },
        { label: "Westports", lat: 2.9959, lng: 101.3179, status: "done", t: "10:05 AM · delivered" },
      ],
    },
    {
      vehicleId: "v18", driverId: "d18", tripId: "TRP-2622", section: "completed", state: "done",
      from: "Padang Besar Border", to: "Alor Setar Depot", completedAt: "10 Jul 2026, 9:50 AM", started: "6:15 AM",
      waypoints: [
        { label: "Padang Besar Border", lat: 6.6570, lng: 100.3130, status: "done", t: "6:15 AM · departed" },
        { label: "Alor Setar Depot", lat: 6.1210, lng: 100.3670, status: "done", t: "9:50 AM · delivered" },
      ],
    },
  ],
};
