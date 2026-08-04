# Handoff

## State
Vehicle module reworked across both portals. All uncommitted on `playground`.

- **`shared/vehicle-detail.jsx` (new)** — whole vehicle domain on `window.VehicleDetail`:
  list/due-date cells, expandable driver row, view/edit/create form, Forms, Documents
  (cards, modal, history, preview), Drivers panel + picker, QR dialog. Extracted from
  the org flow; org `app.jsx` went 1955 → 829 lines, its `index.html` 410 → 95.
  CSS split out to `styles/vehicle-list.css` + `styles/vehicle-detail.css` (both flows link them).
- **`flows/host-vehicle-list/` (new)** — host portal vehicle module, full org parity.
  Organisation column + filter + search scope, searchable **Organization** selector on the
  form (host-only; moves the vehicle between orgs on save). No host-wide slot counter —
  slots scope to the owning org's plan, set per org in its `data.js`
  (Padu Lite 10, Swift Premium 50, Bintang Lite 4 = already at limit, Metro Enterprise).
  One manifest entry added to `flows.js`.
- **Org flow** — expanded row gains all-drivers-access state + Edit driver; Vehicle Category
  column on due dates; at-limit slots chip now toned by headroom (red at 0) with a blocked
  managed toggle; `lite-at-limit` leaves veh-001 unmanaged so that state is the first row;
  QR Code button + modal on vehicle detail; deep link `?vehicle=<id|plate>&tab=<tab>`.
- **Shared shell** — new `EmptyState` (+ `inline` variant for wide/scrolling containers),
  `SelectMenu` gained `searchable` + `prefix`. Demos in `design-system/`.

## Next
- Manual pass in the browser — nothing here was browser-verified, only `npm run build`
  plus Node SSR renders of both flows and the form components.
- Host create/edit: org required, reassignment toast, Bintang blocked-toggle path.
- Org portal regression check: form must still have **no** Organization field.

## Blockers / decisions
- QR is one sample asset per flow (`vehicle-qr-sample.svg`), same code for every vehicle —
  it encodes a page URL, not the vehicle. Real per-vehicle codes need a generator.
- MyLorry mark only exists as a white SVG, so the QR centre uses a gradient chip.
- Removed three dead functions while extracting: `bestUrgency`, `expiryRangeLabel`,
  `documentStatus`.
- `dev-server.js` was already modified before this session — not part of this work.
