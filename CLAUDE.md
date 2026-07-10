# MyLorry Prototype Library — Working Guardrails

Read this before changing anything. These are hard-won rules; breaking them has
already cost real debugging time. README.md covers *how to run*; this covers
*what not to do*.

## What this is
A **review prototype library** — static pages to review flows, inspect UI states,
and share deployed links. Not a product app. No backend, auth, database, router,
state library, or bundler. Keep it boring and reliable.

## Architecture (non-negotiable)
- **Zero bundler.** React/ReactDOM load from a CDN (UMD). Our `.jsx` is
  **precompiled** to plain `.js` by `npm run build` (Babel, a devDependency).
- **NO in-browser Babel.** Never use `type="text/babel"` or babel-standalone.
  It transpiles ~45KB of JSX on the main thread per load and **froze pages**. Banned.
- **Every compiled file is IIFE-wrapped** (see `build.js`). Plain `<script>` tags
  share one global scope, so multiple files declaring `const { useState } = React`
  / `const Icon = …` collide → `SyntaxError` → blank page. The IIFE isolates each.
- **Cross-file sharing goes through `window.*` only** (`window.SharedShell`,
  `Object.assign(window, {…})`). Never rely on a bare top-level identifier being
  visible to another file — the IIFE prevents it.

## Build & files
- **Edit `.jsx`. Run `npm run build`. Never hand-edit a generated `.js`.**
  A `*.js` sitting next to a `*.jsx` is build output.
- Generated `.js` are **gitignored**; `.jsx` is the source of truth.
  `data.js` is hand-written mock data — it **is** tracked.
- Vercel runs `npm run build` (`vercel.json`); don't commit generated JS.

## Structure
- `flows/<name>/` per flow: `index.html` + `.jsx` screens + local `data.js`.
- **Add a flow** = create the folder + add **one** entry to `flows.js` (the manifest).
  The home page renders from `flows.js`. Nothing else changes.
- `shared/shared-shell.jsx` → shared components (`window.SharedShell`).
- `styles/tokens.css` → design tokens (the ONE source; vendored from the DS repo).
- `styles/components.css` → shared component CSS (badges, buttons, cards, tables,
  tabs, pager, tooltip, menu, toast, section headers).
- `design-system/` → showcase. `reference/` → assets, **not deployed**.

## CSS rules
- **Tokens only in `styles/tokens.css`.** Don't redefine `:root` inline.
- **Shared component styles live in `styles/components.css`** — link it, don't
  re-inline. Only genuinely flow-specific layout stays inline (`.hac-*`, `.hm-*`,
  `.ml-kpi-*`, `.ml-stat-a*`, shell `.ml-app/.ml-topbar/.ml-sidebar`).
- When a component's CSS is **identical across flows → move it to components.css.**
  If it has **diverged**, decide deliberately: merge to one canonical, add an
  explicit variant (e.g. `.compact`), or keep local — and say why. Never silently
  fork a third copy (that's how the design system drifts from the flows).

## Components
The shared layer is already consolidated — **reuse it, don't re-create it.**

- **Shared React components** live in `shared/shared-shell.jsx` and are exposed on
  `window.SharedShell` (Icon, TopBar, Sidebar, Badge, StatusBadge, Pager, CardHead,
  ExportMenu, SummaryCard, KpiTierChip, KPIProgress, Pill, CurrencyPill, PetronLogo).
  Portal aliases re-export them in `flows/*/{host,agent}-shell.jsx`. Use these
  before writing anything new.
- **Shared component CSS** lives in `styles/components.css`: badges, buttons
  (outline/soft/primary), cards, tables, tabs, pager, tooltip, menu, toast,
  section headers. Don't re-inline these per flow.
- **`HacModal` is the canonical CRUD dialog.** Use `window.SharedShell.HacModal`
  for new create, edit, and preview dialogs. Do not reuse only generic portal or
  backdrop behavior while recreating the modal’s visual chrome locally. Variants
  may change width and content layout, never the structural shell.
- **`StatusBadge` is the canonical metadata pattern** — one component covers every
  status pill (commission / account / payout). Extend `STATUS_BADGE_META`; do NOT
  fork a new badge. Apply the same instinct elsewhere: extend the shared component
  before adding a parallel one.
- New shared component → add it to `shared-shell.jsx` (+ `window.SharedShell`
  export), its CSS to `components.css`, and a demo to `design-system/app.jsx` so
  every state is visible.

## Don'ts (quick list)
- In-browser Babel. Editing generated `.js`. New badge components. Custom modal
  shells. Inline token redefinition. A third copy of component CSS. Bundler /
  router / state lib / backend.

## Verifying without a browser
Browser tooling here is flaky. To sanity-check a flow renders, SSR the compiled
files in Node: shim `window`/`document`, stub `ReactDOM.createRoot().render` to
capture the element, then `react-dom/server` `renderToString`. This catches
scope collisions, load-order bugs, and runtime throws. `npm run build` must pass.
