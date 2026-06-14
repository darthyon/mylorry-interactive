# MyLorry — Prototype Library

An interactive prototype library for reviewing flows, inspecting UI states, and
sharing deployed links with stakeholders.

No bundler. The only build step is a tiny one — `npm run build` precompiles the
React `.jsx` source into plain `.js` (via Babel, once, on your machine). Pages
then load that plain `.js` + React from a CDN. Fast, reliable, deploy-anywhere
static files. (Earlier this transpiled JSX in the browser on every load — that
froze heavier pages, so it's precompiled now.)

**Golden rule:** edit `.jsx`, run `npm run build`, commit **both** the `.jsx` and
the generated `.js`.

---

## Structure

```
index.html              Home — flow directory, rendered from flows.js
flows.js                Flow manifest (single source of truth for the home page)
build.js                Compiles every .jsx → .js (run via `npm run build`)
styles/
  tokens.css            Design tokens (colors, type, radius) — the ONE source
shared/
  shared-shell.jsx      Shared React components (Icon, StatusBadge, Pager, …)
  shared-shell.js       ← generated, do not edit
  tweaks-panel.jsx      Prototyping helper panel  (+ .js generated)
design-system/
  index.html            Design System showcase — tokens + components in all states
  app.jsx               Showcase logic  (+ app.js generated)
flows/
  commission-host/      Host — Salesperson Commission Config
  commission-agent/     Agent — Commission (dashboard + history)
  fleet-card/           MyFuel — Fleet Card Bulk Actions
reference/              PRD, analysis, screenshots (not deployed)
dev-server.js           Local static server with route logging
server.js               Plain static server
vercel.json             Vercel config (static, serves repo root, no build)
```

Each flow folder holds its own `index.html`, its `.jsx` screens (+ generated
`.js`), and a local `data.js`. Shared code lives in `shared/` and `styles/`,
referenced with `../../` paths. **`*.js` next to a `*.jsx` is generated — never
edit it by hand.**

---

## Run locally

```bash
npm install          # one-time: installs Babel (build only)
npm run build        # compile .jsx → .js
npm run dev          # node dev-server.js  → http://localhost:8000
```

Re-run `npm run build` after editing any `.jsx`. (`npm run dev:python` also works
for serving, but you still need `npm run build` first.)

Routes:

| Route | Flow |
|-------|------|
| `/` | Home (flow directory) |
| `/design-system/` | Design System showcase |
| `/flows/commission-host/` | Host — Salesperson Commission Config |
| `/flows/commission-agent/` | Agent — Commission |
| `/flows/fleet-card/` | MyFuel — Fleet Card Bulk Actions |

> React & ReactDOM load from a CDN, so the first page load needs internet access.

---

## Add a flow

1. Create `flows/<your-flow>/index.html`. Copy the `<head>` and the `<script>`
   block of an existing flow — it already wires tokens + shared components:
   ```html
   <link rel="stylesheet" href="../../styles/tokens.css" />
   ...
   <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
   <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
   <script src="data.js"></script>
   <script src="../../shared/shared-shell.js"></script>
   <script src="your-screen.js"></script>   <!-- generated from your-screen.jsx -->
   ```
2. Add your `.jsx` screens and a local `data.js` in the same folder.
3. **`npm run build`** — generates the `.js` your HTML references.
4. Add **one entry** to the matching portal in [`flows.js`](flows.js):
   ```js
   { id: "your-flow", name: "Your Flow", status: "ready",
     route: "flows/your-flow/index.html",
     desc: "One-line summary",
     screens: [ { label: "Screen 1", note: "What to review here" } ] }
   ```

The home page picks it up automatically — no other file changes. Use
`status: "planned"` (omit `route`) to list a flow as a greyed "coming soon".

---

## Add a component

1. Add it to [`shared/shared-shell.jsx`](shared/shared-shell.jsx) and include it in
   the `window.SharedShell = { … }` export at the bottom.
2. If a portal needs an aliased name, re-export from `host-shell.jsx` /
   `agent-shell.jsx`.
3. Show it in [`design-system/app.jsx`](design-system/app.jsx) so every state is
   visible in one place.
4. **`npm run build`**.

Reuse before you add. Status pills of any kind go through the single
`StatusBadge` (metadata-driven) — extend its `STATUS_BADGE_META` rather than
writing a new badge.

---

## Refresh design tokens

`styles/tokens.css` is a **vendored snapshot** of the canonical MyLorry design
system (maintained in a separate repo). To update, drop-in replace that one file —
no build needed for tokens (it's plain CSS). Keep the `--font` alias and the
`--amber-*` tokens, which the flows rely on.

> Canonical DS repo: _<add link here>_

---

## Deploy

Vercel, static, no build on Vercel (`vercel.json` → `outputDirectory: "."`). The
compiled `.js` is committed, so Vercel just serves files.

```bash
npm run build   # make sure .js is current
git add -A      # commit .jsx AND generated .js
git commit -m "…"
git push        # Vercel auto-deploys the branch
```

`reference/` and `PRODUCT.md` are excluded from the deployed surface via
`.vercelignore`. Before pushing, run the security check:

```bash
/deploy
```
