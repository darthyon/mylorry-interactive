# Org Dashboard Revamp — Main Dashboard (Prototype)

> Scope of THIS spec: the **Main Org Dashboard** landing page only, as a
> prototype in this library. MyFuel / MyAdmin / MyTrip sub-dashboards
> (PRD §6.2–6.4) are separate flows, deferred (see Out of scope).
>
> Source: PRD v1.1 "Organization Dashboard Revamp" (Cynthia Tjandra, 22 Jun
> 2026) · BRD deck (30 Mar 2026) · design proposition (Yon, research-backed).

## Problem
On login an org admin lands on a MyFuel-only dashboard — to see vehicles,
drivers, trips, or document expiries they must dig into separate modules.
There's no at-a-glance operational picture, and unsubscribed modules are
invisible, so the platform never signals what an upgrade unlocks.

## Goal / framing
Not a "pretty fleet dashboard" — a **fleet command surface**. Each block
answers one operational question:
- Balance → can they keep operating?
- Operating Cost → are operations getting expensive?
- Vehicles / Drivers → are assets and people available?
- Modules → where to go?
- Cost Trend → what changed?
- Trips → what's moving?
- Action Needed → what needs work?

## Non-goals
- Does **not** build the MyFuel / MyAdmin / MyTrip sub-dashboards (separate flows).
- Does **not** implement real subscription gating logic — gating is a **prototype
  tweak**, not enforced auth. (Real gating is API-layer, PRD §7, out of prototype scope.)
- Does **not** show Toll / Repair / Insurance / Others cost data — **Fuel only** in
  v1. Other categories render as "coming soon" placeholder legend, not data.
- Does **not** include AI alerts / abnormality table (BRD sketch) — PRD out of scope.
- Does **not** include per-vehicle operating-cost breakdown data, Fuel Efficiency
  km/L, Gantt chart, or trip share link.
- Does **not** add a self-serve subscription sign-up flow — the "Unlock" CTA is a
  visual upsell target only.
- Does **not** introduce a router, state lib, or backend (library is static by design).

## Users
Org admin logging into the Org Portal (Flutter app in production; here a static
review prototype). 70–80% of real users are on mobile — responsive is required,
not optional.

## User stories (only what's built here)
- As an org admin, I see a full operational summary on login (fuel, vehicles,
  drivers, trips) without entering modules. (PRD US-01)
- As an org admin on a lower tier, I see gated sections as a **blurred preview
  behind a lock** so I understand what an upgrade unlocks. (US-02)
- As an org admin, every KPI number is clickable → its filtered list page (here:
  a stub/placeholder navigation target). (US-03)
- As a reviewer, I can switch subscription tier and empty/populated state live via
  the Tweaks panel to inspect every state from one prototype.

## Layout — section order (desktop)
1. **Header** — "Dashboard" + plan chip + last-updated/date.
2. **Top Pulse** — 4 KPI cards: Balance · Operating Cost (today) · Vehicles · Drivers.
3. **Your Modules** — status row: MyFuel · MyAdmin · MyTrip · MyInsurance · MyTraining.
4. **Operating Cost Trend** — Today/MTD/Last-6-months · Overall/Per-vehicle toggle.
5. **Trips Today** — completed/ongoing/pending/paused (gated).
6. **Action Needed** — triage strip: Items overdue · Checklist issues · (expiring docs).
7. **Action Preview** — tabbed table: Fuel TXNs · Due Statuses · Checklists · Trips (if active).

**Mobile:** identical DOM, responsive resize/stack — **no reorder**. Sections flow
in the same order, top-pulse cards stack 1-up, module row scrolls/wraps.

## Behaviour

### Two tweak axes (cmd+shift+e Tweaks panel)
- `subscription`: `free | lite | premium` — drives section gating (table below).
- `emptyData`: toggle — populated vs zero/empty-state data.
- Axes are **orthogonal**: any combination is valid (e.g. premium + empty).
- **Lock wins over empty:** when a section is both gated AND emptyData is on, show
  the locked blurred-dummy preview (keeps upsell alive), not the empty state.

### Gating (PRD §7 — single source of truth)
| Section / view | free | lite | premium |
| :-- | :--: | :--: | :--: |
| Balance · OpCost (overall, today) · Vehicles · Drivers | live | live | live |
| Operating Cost Trend — **Overall** | live | live | live |
| Operating Cost Trend — **Per-vehicle** toggle | 🔒 | live | live |
| Your Modules — MyAdmin | 🔒 | live | live |
| Your Modules — MyTrip | 🔒 | 🔒 | live |
| Trips Today section | 🔒 | 🔒 | live |
| MyInsurance / MyTraining modules | coming soon | coming soon | coming soon |

🔒 = `LockSection` blurred preview. "coming soon" = dimmed module chip, not locked.

### LockSection (new shared component)
The gate is **section-level**, not an inline "Unlock" button on a live card.
- Renders real(ish) dummy content underneath.
- Full-section overlay: scrim + blur + non-interactive content.
- Lock badge + tier label (e.g. "Premium plan required") + single CTA ("Unlock MyTrip").
- Whole section reads as one locked unit.
- Lives in `shared/shared-shell.jsx` → `window.SharedShell.LockSection`; CSS in
  `styles/components.css`; all states demoed in `design-system/app.jsx`.
- API: `<LockSection locked tier="premium" cta="Unlock MyTrip">{content}</LockSection>`.

### KPI cards (Top Pulse)
- Balance: RM balance, est. days remaining, current-month usage, last-month usage,
  → MyFuel. (Free)
- Operating Cost: today total, ↑/↓ vs yesterday, Fuel line, → Cost detail. (Free)
- Vehicles: total + in-use / unused / inactive; each count → filtered vehicle list. (Free)
- Drivers: total + on-duty / off-duty; each count → filtered driver list. (Free)
- Card = **today snapshot**; Trend section = **history**. Same data source — numbers
  must reconcile (no contradicting fuel totals).

### Operating Cost Trend
- Time filter: Today / MTD / Last 6 months. View toggle: Overall / Per-vehicle.
- Overall: monthly trend, **Fuel series only**; other categories greyed "coming soon"
  in legend. Current month bar rendered distinct (in-progress).
- Per-vehicle: gated (see table) — Free shows `LockSection`.
- Click chart segment → filtered detail page (stub). Export → spreadsheet (stub).

### Action Needed (replaces "Overview")
- Triage strip — **what needs work only**. Items overdue · Checklist issues ·
  (expiring docs if surfaced). **No Vehicles/Drivers counts** — those live in Top
  Pulse; duplication removed deliberately.
- Each tile → its filtered page (stub).

### Action Preview
- Tabs: Fuel TXNs · Due Statuses · Checklists · Trips (tab present only when MyTrip active).
- Row click → relevant filtered page (stub). "View all" → full list (stub).

## Edge cases
- **Empty state** (new org, no data — PRD OQ-06): `emptyData` on. Each section shows
  its own zero/empty treatment (e.g. "No transactions yet", 0-count tiles, flat
  trend). Exact per-section empty copy — see open questions.
- **Locked + empty:** lock wins → blurred dummy preview (decided).
- **Permission / tier:** lower tiers see `LockSection` per gating table; no real data
  leaks behind blur (dummy values only).
- **Long org / vehicle names:** truncate with ellipsis; tooltip on hover (desktop).
- **Mobile density:** 4 KPI + modules + trend + trips + action-needed + table = long
  scroll. Validate on Flutter mobile viewport before production dev (PRD risk).

## Open questions (carried from PRD + prototype-specific)
- [ ] Per-section **empty-state copy & visual** for new orgs — owner: Maryam / Cynthia (PRD OQ-06).
- [ ] OpCost coming-soon categories: show as **empty placeholder legend** vs hide
      until data — leaning placeholder (matches "coming soon"); confirm — owner: Hossein / Cynthia (PRD OQ-01).
- [ ] Mobile placement of locked MyTrip upsell — current decision: responsive
      resize, no reorder (stays at section 5 position). Business may want upsell
      higher for conversion — owner: Darren / Cynthia.
- [ ] "Trips (if active)" tab in Action Preview — show as locked tab or hide on
      lower tiers? — owner: Cynthia.

## Out of scope (deferred to later flows / phases)
- MyFuel / MyAdmin / MyTrip sub-dashboards (PRD §6.2–6.4) — separate flows.
- Per-vehicle operating cost **data**, Fuel Efficiency km/L, Rebate/Subsidy per-vehicle.
- Toll / Repair / Insurance / Others cost data (PRD v3, data-dependent).
- MyTrip Gantt chart, trip share link, per-driver toggle (PRD v2).
- AI alerts & abnormality table (BRD sketch; PRD out of scope).
- Real API-layer subscription gating.

## Build notes (library guardrails)
- New flow folder `flows/org-dashboard/` + **one** entry in `flows.js`.
- Edit `.jsx`, run `npm run build`; never hand-edit generated `.js`.
- Reuse `window.SharedShell` (TopBar, Sidebar, Badge, StatusBadge, KPI*, Pager…)
  before writing new. Add **one** new shared component: `LockSection`.
- Tokens only from `styles/tokens.css`; shared component CSS in `styles/components.css`.
- Tweaks via `shared/tweaks-panel.jsx` (`useTweaks` + `TweaksPanel`).
