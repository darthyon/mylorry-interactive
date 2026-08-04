// Host-wide vehicle fixture — every organisation's vehicles in one list.
// Unlike the org fixture there are no plan scenarios here: managed slots are a
// per-org subscription limit, so `managed` is a plain flag on each vehicle and
// the host list shows no slot counter.
window.HOST_VEHICLE_LIST = {
  user: { name: "Nurul Hakim", role: "Host Admin" },
  lastUpdated: "9 Jul 2026, 9:24 AM",

  // Managed-vehicle slots and reminder limits are a per-org subscription
  // concern, so each org carries its own plan. The host detail page scopes to
  // the plan of whichever org the vehicle belongs to.
  orgs: [
    { id: "padu", name: "Padu Logistik Sdn. Bhd.", plan: { name: "Lite", tier: "lite", limit: 10 } },
    { id: "swift", name: "Swift Cargo Express", plan: { name: "Premium", tier: "premium", limit: 50 } },
    { id: "bintang", name: "Bintang Freight Sdn. Bhd.", plan: { name: "Lite", tier: "lite", limit: 4 } },
    { id: "metro", name: "Metro Haulage Sdn. Bhd.", plan: { name: "Enterprise", tier: "enterprise", limit: Infinity } },
  ],

  dueDateTypes: [
    { value: "all", label: "All types" },
    { value: "roadTax", label: "Road Tax" },
    { value: "insurance", label: "Insurance" },
    { value: "puspakom", label: "Puspakom Service" },
    { value: "permit", label: "Truck Permit" },
    { value: "others", label: "Others" },
  ],

  searchScopes: [
    { value: "vehicle", label: "Vehicle" },
    { value: "org", label: "Organisation" },
    { value: "driver", label: "Driver" },
    { value: "vendor", label: "Vendor" },
  ],

  vehicles: [
    {
      id: "veh-001", org: { id: "padu", name: "Padu Logistik Sdn. Bhd." },
      plate: "VLT8421", category: "Lorry", vendor: "Swift Leasing",
      btm: 7600, bdm: 18000, capacity: 10400,
      roadTax: "2026-11-22", insurance: "2026-09-10", puspakom: "2026-08-21", permit: "2026-10-18",
      managed: true, activeCheckIn: true,
      drivers: [
        { name: "Azhar Rahman", driverId: "DRV-014", phone: "012-330 4471", status: "Checked in", lastEvent: "Checked in · 7:42 AM" },
        { name: "Hafiz Sulaiman", driverId: "DRV-022", phone: "011-2244 9080", status: "Off duty", lastEvent: "Checked out · 6:10 PM" },
      ],
    },
    {
      id: "veh-002", org: { id: "padu", name: "Padu Logistik Sdn. Bhd." },
      plate: "JQM1189", category: "Lorry", vendor: "Padu Fleet",
      btm: 6800, bdm: 16500, capacity: 9700,
      roadTax: "2026-08-04", insurance: "2026-07-27", puspakom: "2026-07-18", permit: "2026-08-29",
      managed: true, activeCheckIn: false,
      drivers: [
        { name: "Roslan Ibrahim", driverId: "DRV-005", phone: "013-800 2265", status: "On duty", lastEvent: "Checked in · 8:06 AM" },
      ],
    },
    {
      id: "veh-003", org: { id: "padu", name: "Padu Logistik Sdn. Bhd." },
      plate: "STG0234", category: "Truck", vendor: "North Cold Chain",
      btm: 4200, bdm: 8500, capacity: 4300,
      roadTax: "2027-01-12", insurance: "2026-12-11", puspakom: "2026-10-03", permit: null,
      managed: true, activeCheckIn: false,
      drivers: [],
      accessibleToAll: true,
    },
    {
      id: "veh-004", org: { id: "padu", name: "Padu Logistik Sdn. Bhd." },
      plate: "WPK5567", category: "Van", vendor: "Bintang Mobility",
      btm: 2100, bdm: 3400, capacity: 1300,
      roadTax: "2026-08-18", insurance: "2026-11-02", puspakom: "2026-09-25", permit: "2027-02-14",
      managed: false, activeCheckIn: false,
      drivers: [
        { name: "Suria Kamal", driverId: "DRV-031", phone: "017-556 1120", status: "Off duty", lastEvent: "Checked out · 5:48 PM" },
      ],
    },
    {
      id: "veh-005", org: { id: "padu", name: "Padu Logistik Sdn. Bhd." },
      plate: "BMA8830", category: "Lorry", vendor: "Metro Vendor",
      btm: 8100, bdm: 19500, capacity: 11400,
      roadTax: "2026-09-30", insurance: "2026-08-12", puspakom: "2027-01-08", permit: "2026-12-01",
      managed: true, activeCheckIn: false,
      drivers: [
        { name: "Faizal Rahman", driverId: "DRV-002", phone: "012-771 3390", status: "On duty", lastEvent: "Checked in · 7:15 AM" },
        { name: "Nizam Yusof", driverId: "DRV-018", phone: "016-220 7714", status: "Off duty", lastEvent: "Checked out · 7:02 PM" },
      ],
    },
    {
      id: "veh-006", org: { id: "swift", name: "Swift Cargo Express" },
      plate: "PNG7712", category: "Truck", vendor: "Swift Leasing",
      btm: 9200, bdm: 21000, capacity: 11800,
      roadTax: "2026-08-09", insurance: "2026-10-19", puspakom: "2026-08-30", permit: "2026-11-11",
      managed: true, activeCheckIn: true,
      drivers: [
        { name: "Kumaran Raj", driverId: "DRV-041", phone: "014-882 3306", status: "Checked in", lastEvent: "Checked in · 6:55 AM" },
      ],
    },
    {
      id: "veh-007", org: { id: "swift", name: "Swift Cargo Express" },
      plate: "JHR2288", category: "Lorry", vendor: "East Route Transport",
      btm: 7100, bdm: 17200, capacity: 10100,
      roadTax: "2026-12-20", insurance: "2027-01-05", puspakom: "2026-11-14", permit: null,
      managed: true, activeCheckIn: false,
      drivers: [],
    },
    {
      id: "veh-008", org: { id: "swift", name: "Swift Cargo Express" },
      plate: "KUL4419", category: "Van", vendor: "Bina Gemilang",
      btm: 2400, bdm: 3800, capacity: 1400,
      roadTax: "2026-07-30", insurance: "2026-09-22", puspakom: "2026-10-28", permit: "2026-09-06",
      managed: false, activeCheckIn: false,
      drivers: [],
    },
    {
      id: "veh-009", org: { id: "swift", name: "Swift Cargo Express" },
      plate: "SGR9083", category: "Lorry", vendor: "Padu Fleet",
      btm: 6600, bdm: 15800, capacity: 9200,
      roadTax: "2027-03-02", insurance: "2026-08-27", puspakom: "2026-12-19", permit: "2027-01-23",
      managed: true, activeCheckIn: false,
      drivers: [
        { name: "Anwar Ismail", driverId: "DRV-055", phone: "019-443 0021", status: "Off duty", lastEvent: "Checked out · 4:30 PM" },
        { name: "Lim Wei Sheng", driverId: "DRV-062", phone: "012-909 5512", status: "On duty", lastEvent: "Checked in · 8:41 AM" },
        { name: "Ravi Chandran", driverId: "DRV-070", phone: "011-3388 4417", status: "Off duty", lastEvent: "Checked out · 6:22 PM" },
      ],
    },
    {
      id: "veh-010", org: { id: "swift", name: "Swift Cargo Express" },
      plate: "MLK6634", category: "MPV", vendor: "Bintang Mobility",
      btm: 1900, bdm: 2900, capacity: 900,
      roadTax: "2026-08-15", insurance: "2026-08-02", puspakom: "2027-02-27", permit: null,
      managed: true, activeCheckIn: false,
      drivers: [],
      accessibleToAll: true,
    },
    {
      id: "veh-011", org: { id: "bintang", name: "Bintang Freight Sdn. Bhd." },
      plate: "PRK3345", category: "Truck", vendor: "North Cold Chain",
      btm: 8800, bdm: 20400, capacity: 11200,
      roadTax: "2026-10-07", insurance: "2026-07-24", puspakom: "2026-09-13", permit: "2026-10-30",
      managed: true, activeCheckIn: false,
      drivers: [
        { name: "Shahrul Nizam", driverId: "DRV-077", phone: "013-661 8802", status: "On duty", lastEvent: "Checked in · 7:58 AM" },
      ],
    },
    {
      id: "veh-012", org: { id: "bintang", name: "Bintang Freight Sdn. Bhd." },
      plate: "KDH1120", category: "Lorry", vendor: "Metro Vendor",
      btm: 7300, bdm: 17600, capacity: 10300,
      roadTax: "2026-11-29", insurance: "2026-12-30", puspakom: "2026-08-08", permit: "2027-03-15",
      managed: true, activeCheckIn: true,
      drivers: [
        { name: "Zulkifli Hassan", driverId: "DRV-083", phone: "017-220 4498", status: "Checked in", lastEvent: "Checked in · 7:05 AM" },
        { name: "Tan Chee Meng", driverId: "DRV-091", phone: "012-118 7734", status: "Off duty", lastEvent: "Checked out · 8:12 PM" },
      ],
    },
    {
      id: "veh-013", org: { id: "bintang", name: "Bintang Freight Sdn. Bhd." },
      plate: "TRG5502", category: "Van", vendor: "Bina Gemilang",
      btm: 2200, bdm: 3600, capacity: 1350,
      roadTax: "2026-07-21", insurance: "2026-10-11", puspakom: "2026-11-26", permit: null,
      managed: false, activeCheckIn: false,
      drivers: [],
    },
    {
      id: "veh-014", org: { id: "bintang", name: "Bintang Freight Sdn. Bhd." },
      plate: "KTN8876", category: "Lorry", vendor: "East Route Transport",
      btm: 6900, bdm: 16800, capacity: 9800,
      roadTax: "2027-02-09", insurance: "2026-09-05", puspakom: "2026-10-16", permit: "2026-12-22",
      managed: true, activeCheckIn: false,
      drivers: [
        { name: "Amirul Danish", driverId: "DRV-098", phone: "011-5522 3390", status: "Off duty", lastEvent: "Checked out · 5:15 PM" },
      ],
    },
    {
      id: "veh-015", org: { id: "bintang", name: "Bintang Freight Sdn. Bhd." },
      plate: "PHG4417", category: "Truck", vendor: "Swift Leasing",
      btm: 9500, bdm: 22000, capacity: 12100,
      roadTax: "2026-08-26", insurance: "2027-01-18", puspakom: "2026-07-29", permit: "2026-11-04",
      managed: true, activeCheckIn: false,
      drivers: [],
      accessibleToAll: true,
    },
    {
      id: "veh-016", org: { id: "metro", name: "Metro Haulage Sdn. Bhd." },
      plate: "NSN2231", category: "Lorry", vendor: "Padu Fleet",
      btm: 7000, bdm: 17000, capacity: 10000,
      roadTax: "2026-09-18", insurance: "2026-11-23", puspakom: "2027-01-30", permit: "2026-10-09",
      managed: true, activeCheckIn: false,
      drivers: [
        { name: "Hakim Zainal", driverId: "DRV-104", phone: "016-778 2214", status: "On duty", lastEvent: "Checked in · 8:20 AM" },
      ],
    },
    {
      id: "veh-017", org: { id: "metro", name: "Metro Haulage Sdn. Bhd." },
      plate: "SBH9964", category: "Truck", vendor: "North Cold Chain",
      btm: 8600, bdm: 20100, capacity: 11000,
      roadTax: "2026-07-26", insurance: "2026-08-19", puspakom: "2026-12-06", permit: null,
      managed: true, activeCheckIn: true,
      drivers: [
        { name: "Joseph Lim", driverId: "DRV-112", phone: "014-330 6690", status: "Checked in", lastEvent: "Checked in · 6:40 AM" },
        { name: "Daniel Anak Ugak", driverId: "DRV-118", phone: "013-227 9945", status: "Off duty", lastEvent: "Checked out · 7:35 PM" },
      ],
    },
    {
      id: "veh-018", org: { id: "metro", name: "Metro Haulage Sdn. Bhd." },
      plate: "SWK7719", category: "Van", vendor: "Bintang Mobility",
      btm: 2300, bdm: 3700, capacity: 1380,
      roadTax: "2026-12-14", insurance: "2026-10-25", puspakom: "2026-09-08", permit: "2027-02-02",
      managed: false, activeCheckIn: false,
      drivers: [],
    },
    {
      id: "veh-019", org: { id: "metro", name: "Metro Haulage Sdn. Bhd." },
      plate: "LBN3308", category: "Lorry", vendor: "Metro Vendor",
      btm: 7400, bdm: 18200, capacity: 10600,
      roadTax: "2026-08-07", insurance: "2026-09-29", puspakom: "2026-11-20", permit: "2026-12-28",
      managed: true, activeCheckIn: false,
      drivers: [
        { name: "Farah Nadia", driverId: "DRV-125", phone: "012-664 1103", status: "On duty", lastEvent: "Checked in · 7:33 AM" },
        { name: "Syed Aqil", driverId: "DRV-131", phone: "019-882 4470", status: "Off duty", lastEvent: "Checked out · 6:05 PM" },
      ],
    },
    {
      id: "veh-020", org: { id: "metro", name: "Metro Haulage Sdn. Bhd." },
      plate: "KKB5590", category: "MPV", vendor: "Bina Gemilang",
      btm: 1850, bdm: 2800, capacity: 880,
      roadTax: "2027-01-27", insurance: "2026-07-31", puspakom: "2026-10-21", permit: null,
      managed: false, activeCheckIn: false,
      drivers: [],
    },
    {
      id: "veh-021", org: { id: "padu", name: "Padu Logistik Sdn. Bhd." },
      plate: "VLT9902", category: "Truck", vendor: "East Route Transport",
      btm: 8900, bdm: 20800, capacity: 11500,
      roadTax: "2026-10-13", insurance: "2026-12-17", puspakom: "2027-02-20", permit: "2026-09-14",
      managed: true, activeCheckIn: false,
      drivers: [
        { name: "Ganesh Muthu", driverId: "DRV-137", phone: "011-7788 2231", status: "Off duty", lastEvent: "Checked out · 5:52 PM" },
      ],
    },
    {
      id: "veh-022", org: { id: "swift", name: "Swift Cargo Express" },
      plate: "PNG1145", category: "Lorry", vendor: "Swift Leasing",
      btm: 6700, bdm: 16200, capacity: 9500,
      roadTax: "2026-09-02", insurance: "2026-11-08", puspakom: "2026-08-14", permit: "2027-01-11",
      managed: true, activeCheckIn: false,
      drivers: [
        { name: "Aiman Sofea", driverId: "DRV-143", phone: "017-991 3348", status: "On duty", lastEvent: "Checked in · 8:12 AM" },
      ],
    },
    {
      id: "veh-023", org: { id: "bintang", name: "Bintang Freight Sdn. Bhd." },
      plate: "KDH7781", category: "Truck", vendor: "Padu Fleet",
      btm: 9100, bdm: 21400, capacity: 11700,
      roadTax: "2026-11-16", insurance: "2026-08-23", puspakom: "2027-03-09", permit: "2026-10-02",
      managed: true, activeCheckIn: false,
      drivers: [],
    },
    {
      id: "veh-024", org: { id: "metro", name: "Metro Haulage Sdn. Bhd." },
      plate: "NSN6628", category: "Lorry", vendor: "Bintang Mobility",
      btm: 7200, bdm: 17400, capacity: 10200,
      roadTax: "2026-07-19", insurance: "2027-02-06", puspakom: "2026-09-20", permit: "2026-11-27",
      managed: true, activeCheckIn: false,
      drivers: [
        { name: "Norhayati Salleh", driverId: "DRV-150", phone: "013-445 7729", status: "Off duty", lastEvent: "Checked out · 6:48 PM" },
      ],
    },
  ],
};
