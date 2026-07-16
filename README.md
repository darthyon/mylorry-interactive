# MyLorry — Prototype Library

An interactive prototype library for reviewing flows, inspecting UI states, and
sharing deployed links with stakeholders.

No bundler. The only build step is a tiny one — `npm run build` precompiles the
React `.jsx` source into plain `.js` (via Babel, once, on your machine). Pages
then load that plain `.js` + React from a CDN. Fast, reliable, deploy-anywhere
static files. (Earlier this transpiled JSX in the browser on every load — that
froze heavier pages, so it's precompiled now.)

**Golden rule:** edit `.jsx`, run `npm run build`, and commit the `.jsx` source.
Generated `.js` files are build output and are gitignored; `data.js` files are
hand-written mock data and stay tracked.

---

## Structure

```
index.html              Home — flow directory, rendered from flows.js
flows.js                Flow manifest (single source of truth for the home page)
build.js                Compiles every .jsx → .js (run via `npm run build`)
AGENTS.md              Codex working guardrails for this repo
.agents/               Local Codex skills used by this repo
.githooks/             Optional repo Git hooks
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
dev-server.js           Local static server (npm run dev / npm start)
vercel.json             Vercel config (runs npm run build, serves repo root)
```

Each flow folder holds its own `index.html`, its `.jsx` screens (+ generated
`.js`), and a local `data.js`. Shared code lives in `shared/` and `styles/`,
referenced with `../../` paths. **`*.js` next to a `*.jsx` is generated and
gitignored — never edit it by hand.**

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

## Agent tooling

Repo-specific Codex rules live in [`AGENTS.md`](AGENTS.md). They mirror the
static-prototype constraints from [`CLAUDE.md`](CLAUDE.md) and add Codex-specific
expectations for shared UI, tests, and browser/tool usage.

The local design guidance skill lives at
[`./.agents/skills/taste-skill/SKILL.md`](.agents/skills/taste-skill/SKILL.md).
It is intentionally scoped to frontend taste/design work; product dashboard and
data-table flows should still follow the repo’s existing shared component rules.

Optional Git hooks live in [`.githooks/`](.githooks). To enable them locally:

```bash
git config core.hooksPath .githooks
```

The current pre-push hook runs `gitleaks` when installed. If `gitleaks` is not
installed, it warns and lets the push continue.

---

## Deploy

Vercel serves the repo root as static output. `vercel.json` runs
`npm run build` first, then serves `outputDirectory: "."`.

```bash
npm run build   # make sure .js is current
git add -A      # commit .jsx, data.js, HTML/CSS/docs; generated .js is ignored
git commit -m "…"
git push        # Vercel auto-deploys the branch
```

`reference/` and `PRODUCT.md` are excluded from the deployed surface via
`.vercelignore`. Before pushing, run the security check:

```bash
/deploy
```

## Production Deploy

Use the guarded production deploy command when you want the live Vercel deploy to
come from `main` only:

```bash
npm run deploy:prod
```

It will:
- fail unless the current branch is `main`
- fail if the working tree is dirty
- fail if local `main` is not aligned with `origin/main`
- run `npm run build`
- push `main` to `origin`
- run `vercel deploy --prod`

For full safety, keep Vercel's Production Branch set to `main` in the project
dashboard as well. That setting lives in Vercel, not in this repo.
