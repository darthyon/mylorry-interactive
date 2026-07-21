window.ORG_DRIVER_LIST = {
  org: { id: "padu", name: "Padu Logistik Sdn. Bhd." },
  orgs: [
    { id: "padu", name: "Padu Logistik Sdn. Bhd.", role: "Admin" },
    { id: "swift", name: "Swift Cargo Express", role: "Admin" },
    { id: "bintang", name: "Bintang Fleet Services", role: "Viewer" },
  ],
  idTypes: ["IC No.", "Passport"],
  documentReminderTier: "free",
  drivers: [
    { id: "drv-014", driverId: "DRV-014", firstName: "Azhar", lastName: "Rahman", staffId: "STF-1042", idType: "IC No.", idNumber: "860412-10-5521", phone: "+60 12-608 4451", email: "azhar.rahman@padu.my", vendor: "Padu Fleet", duty: "On duty", contacts: [
      { id: "ec-014-1", name: "Siti Rahman", email: "siti.rahman@gmail.com", phone: "+60 12-330 8842", remarks: "Spouse — reachable after 6pm", primary: true },
      { id: "ec-014-2", name: "Padu Operations Desk", email: "ops.padu@padu.my", phone: "+60 3-2145 0090", remarks: "Vendor operations desk", primary: false }
    ], documents: [
      { id: "doc-gdl-014", type: "GDL License", issuedDate: "2025-04-15", expireDate: "2027-04-14", reminders: [30, 14, 7], uploadedDate: "15 Apr 2025", uploadedTime: "12:00 PM", uploadedBy: "Azhar Rahman", files: [{ id: "file-gdl-current", name: "azhar-gdl-license.jpg", kind: "image", uploadedDate: "15 Apr 2025" }, { id: "file-gdl-current-back", name: "azhar-gdl-license-back.jpg", kind: "image", uploadedDate: "15 Apr 2025" }], history: [{ id: "hist-gdl-1", issuedDate: "2022-04-15", expireDate: "2025-04-14", reminders: [30], uploadedDate: "15 Apr 2022", uploadedTime: "03:50 PM", uploadedBy: "Azhar Rahman", files: [{ id: "file-gdl-old", name: "azhar-gdl-2022.jpg", kind: "image", uploadedDate: "15 Apr 2022" }, { id: "file-gdl-old2", name: "azhar-gdl-receipt.pdf", kind: "pdf", uploadedDate: "15 Apr 2022" }, { id: "file-gdl-old3", name: "azhar-gdl-medical.pdf", kind: "pdf", uploadedDate: "15 Apr 2022" }] }] },
      { id: "doc-medical-014", type: "Medical Report", issuedDate: "2025-09-02", expireDate: "2026-09-01", reminders: [30, "", ""], uploadedDate: "02 Sep 2025", uploadedTime: "09:30 AM", uploadedBy: "Azhar Rahman", files: [{ id: "file-medical", name: "medical-report-2025.pdf", kind: "pdf", uploadedDate: "02 Sep 2025" }], history: [] },
      { id: "doc-port-014", type: "Driver Port Pass", issuedDate: "2024-05-31", expireDate: "2025-05-30", reminders: [30, "", ""], uploadedDate: "30 May 2024", uploadedTime: "04:15 PM", uploadedBy: "Azhar Rahman", files: [], history: [{ id: "hist-port-1", issuedDate: "2023-05-31", expireDate: "2024-05-30", reminders: [30], uploadedDate: "29 May 2023", uploadedTime: "11:30 AM", uploadedBy: "Azhar Rahman", files: [{ id: "file-port-old", name: "port-pass-2023.pdf", kind: "pdf", uploadedDate: "29 May 2023" }] }] },
      { id: "doc-others-014", type: "Others", title: "Driver briefing renewal", description: "Refresh driver briefing acknowledgement before port onboarding is renewed.", issuedDate: "2026-07-09", expireDate: "2026-08-15", reminders: [14, "", ""], uploadedDate: "09 Jul 2026", uploadedTime: "10:20 AM", uploadedBy: "Azhar Rahman", files: [{ id: "file-others-current", name: "driver-briefing-note.pdf", kind: "pdf", uploadedDate: "09 Jul 2026" }], history: [{ id: "hist-others-1", title: "Old briefing note", description: "Previous briefing record retained for reference.", issuedDate: "2026-01-01", expireDate: "2026-01-31", reminders: [7, "", ""], uploadedDate: "10 Jan 2026", uploadedTime: "02:10 PM", uploadedBy: "Azhar Rahman", files: [{ id: "file-others-old", name: "old-briefing-note.pdf", kind: "pdf", uploadedDate: "10 Jan 2026" }] }] }
    ] },
    { id: "drv-022", driverId: "DRV-022", firstName: "Hafiz", lastName: "Sulaiman", staffId: "STF-1057", idType: "IC No.", idNumber: "900816-08-3310", phone: "+60 17-239 9702", email: "hafiz.sulaiman@padu.my", vendor: "Padu Fleet", duty: "Off duty", contacts: [
      { id: "ec-022-1", name: "Aina Sulaiman", email: "aina.sulaiman@gmail.com", phone: "+60 19-887 2210", remarks: "Sister", primary: true }
    ], documents: [
      { id: "doc-gdl-022", type: "GDL License", issuedDate: "2024-08-01", expireDate: "2026-08-01", reminders: [30, 14, ""], uploadedDate: "01 Aug 2024", uploadedTime: "10:45 AM", uploadedBy: "Hafiz Sulaiman", files: [{ id: "file-gdl-022", name: "hafiz-gdl-license.pdf", kind: "pdf", uploadedDate: "01 Aug 2024" }], history: [] },
      { id: "doc-port-022", type: "Driver Port Pass", issuedDate: "2025-03-10", expireDate: "2026-07-28", reminders: [14, "", ""], uploadedDate: "10 Mar 2025", uploadedTime: "02:20 PM", uploadedBy: "Hafiz Sulaiman", files: [{ id: "file-port-022", name: "hafiz-port-pass.pdf", kind: "pdf", uploadedDate: "10 Mar 2025" }], history: [] }
    ] },
    { id: "drv-005", driverId: "DRV-005", firstName: "Roslan", lastName: "Ibrahim", staffId: "STF-0991", idType: "Passport", idNumber: "A5481209", phone: "+60 11-2784 6210", email: "roslan.ibrahim@padu.my", vendor: "North Cold Chain", duty: "On duty", documents: [
      { id: "doc-medical-005", type: "Medical Report", issuedDate: "2025-06-20", expireDate: "2026-07-20", reminders: [7, "", ""], uploadedDate: "20 Jun 2025", uploadedTime: "09:15 AM", uploadedBy: "Roslan Ibrahim", files: [{ id: "file-medical-005", name: "roslan-medical-report.pdf", kind: "pdf", uploadedDate: "20 Jun 2025" }], history: [] },
      { id: "doc-gdl-005", type: "GDL License", issuedDate: "2022-02-15", expireDate: "2025-02-14", reminders: [30, "", ""], uploadedDate: "15 Feb 2022", uploadedTime: "11:05 AM", uploadedBy: "Roslan Ibrahim", files: [{ id: "file-gdl-005", name: "roslan-gdl-license.jpg", kind: "image", uploadedDate: "15 Feb 2022" }], history: [] }
    ] },
    { id: "drv-011", driverId: "DRV-011", firstName: "Zulkifli", lastName: "Hamid", staffId: "STF-1019", idType: "IC No.", idNumber: "850203-12-6118", phone: "+60 12-713 1243", email: "zulkifli.hamid@padu.my", vendor: "Swift Leasing", duty: "Off duty" },
    { id: "drv-020", driverId: "DRV-020", firstName: "Karim", lastName: "Abdullah", staffId: "STF-1049", idType: "Passport", idNumber: "WP-MY-80431", phone: "+60 16-886 5530", email: "karim.abdullah@padu.my", vendor: "Bina Gemilang", duty: "On duty" },
    { id: "drv-041", driverId: "DRV-041", firstName: "Farid", lastName: "Manaf", staffId: "STF-1084", idType: "IC No.", idNumber: "880921-14-4306", phone: "+60 12-648 8095", email: "farid.manaf@padu.my", vendor: "Padu Fleet", duty: "Off duty" },
    { id: "drv-028", driverId: "DRV-028", firstName: "Khalid", lastName: "Nordin", staffId: "STF-1063", idType: "IC No.", idNumber: "920515-01-2239", phone: "+60 19-551 0627", email: "khalid.nordin@padu.my", vendor: "East Route Transport", duty: "On duty" },
    { id: "drv-038", driverId: "DRV-038", firstName: "Nazri", lastName: "Ismail", staffId: "STF-1076", idType: "Passport", idNumber: "B8713490", phone: "+60 18-320 0174", email: "nazri.ismail@padu.my", vendor: "Metro Vendor", duty: "Off duty" },
    { id: "drv-052", driverId: "DRV-052", firstName: "Amirul", lastName: "Hakim", staffId: "STF-1098", idType: "IC No.", idNumber: "910723-06-7262", phone: "+60 12-801 6238", email: "amirul.hakim@padu.my", vendor: "Padu Fleet", duty: "On duty" },
    { id: "drv-061", driverId: "DRV-061", firstName: "Iskandar", lastName: "Rosli", staffId: "STF-1104", idType: "IC No.", idNumber: "870309-10-5404", phone: "+60 16-409 5051", email: "iskandar.rosli@padu.my", vendor: "Swift Leasing", duty: "Off duty" },
    { id: "drv-067", driverId: "DRV-067", firstName: "Wan", lastName: "Aidil", staffId: "STF-1112", idType: "IC No.", idNumber: "930701-07-2506", phone: "+60 13-451 0814", email: "wan.aidil@padu.my", vendor: "North Cold Chain", duty: "On duty" },
    { id: "drv-074", driverId: "DRV-074", firstName: "Saiful", lastName: "Nizam", staffId: "STF-1120", idType: "Passport", idNumber: "WP-MY-90614", phone: "+60 11-9980 5622", email: "saiful.nizam@padu.my", vendor: "Bina Gemilang", duty: "Off duty" },
    { id: "drv-081", driverId: "DRV-081", firstName: "Afiq", lastName: "Daniel", staffId: "STF-1133", idType: "IC No.", idNumber: "940402-08-6920", phone: "+60 17-206 9354", email: "afiq.daniel@padu.my", vendor: "Padu Fleet", duty: "On duty" },
  ],
};
