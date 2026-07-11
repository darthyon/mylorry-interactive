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
