# Codex Working Guardrails

Read `CLAUDE.md` for the repository's full static-prototype architecture and
build rules. This file adds Codex-specific implementation requirements.

## Shared UI

- Reuse `window.SharedShell` components before building a flow-specific version.
- Use `window.SharedShell.HacModal` for new create, edit, and preview dialogs.
  Do not pair a generic portal or backdrop with custom modal chrome.
- Variants may adjust modal width and inner content layout only. The HAC modal
  shell, including drag handle, header, divider, body, footer, and actions,
  stays canonical.
- Use `window.SharedShell.HacFileUpload` for photo and document uploads. Do not
  create a flow-local drop zone; vary only accepted types, multiplicity, preview,
  and helper copy.
- Use `window.SharedShell.SelectMenu` for in-app selects. Do not introduce a
  native `<select>` unless the task explicitly needs platform-native behavior.
- Follow `DESIGN.md` for visual decisions. It defines the appearance; this file
  defines the implementation expectation.

## Build discipline

- Edit `.jsx` source files, then run `npm run build`. Do not edit generated
  `.js` files.
- When adding a shared component, export it from `shared/shared-shell.jsx`, add
  its shared CSS to `styles/components.css`, and add a visible state to the
  design-system showcase.

## Git / PR workflow

- Use `playground` as the working branch for small UI changes.
- Do not create feature branches unless explicitly requested.
- PRs should normally be opened from `playground` to `main`.
- When asked to create or update a PR, commit the scoped changes on
  `playground`, push `playground`, then open or update the `playground` to
  `main` PR.
- If `gh auth` fails, stop and report the exact `gh auth status` output. Do not
  fall back to creating branches through the GitHub connector unless explicitly
  requested.

## Testing

- Write tests in Playwright (E2E) + Vitest (unit).
- Never run tests during chat. Output terminal command for me to run.
- When I paste failure output, diagnose and fix only what's broken.
- No screenshot-based visual testing. No browser preview.
- Playwright MCP only when I explicitly ask. Never fire it proactively.
- After every completed task, list test cases for me to check manually. Cover happy path + edge cases + error states.
