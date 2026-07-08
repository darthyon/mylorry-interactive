---
name: MyLorry Host Portal
description: Dense, confident admin tooling for commission, KPI, and SP account operations.
colors:
  primary: "#00AA4F"
  primary-strong: "#00AB46"
  primary-soft: "#F3FDF8"
  secondary: "#0081AA"
  accent-navy: "#1A2472"
  text-primary: "#3C3C42"
  text-secondary: "#757575"
  text-tertiary: "#999AA5"
  surface: "#FDFDFD"
  surface-muted: "#F5F5F5"
  surface-subtle: "#F6F6F6"
  border-light: "#E9E9E9"
  border-medium: "#D8D8D8"
  warning: "#F5A623"
  warning-soft: "#FFF6E8"
  danger: "#FF7476"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.4px"
rounded:
  xs: "2px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "14px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "9px 16px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "9px 16px"
    typography: "{typography.body}"
  button-outline:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
    typography: "{typography.body}"
  input-default:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xs}"
    padding: "9px 11px"
    typography: "{typography.body}"
  card-surface:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "18px 22px 20px"
  chip-role:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
    padding: "2px 7px"
    typography: "{typography.label}"
---

# Design System: MyLorry Host Portal

## 1. Overview

**Creative North Star: "The Operations Control Ledger"**

This system is a working desk, not a showcase. It is built for internal ops staff who already understand commission mechanics, KPI periods, and SP account relationships. The interface should feel like a confident commercial instrument: compact, direct, and structurally predictable. It earns trust through ordered density, not through decoration.

The visual system uses a restrained product palette, one familiar sans family, and consistent sectional framing to keep repeated data-entry and review flows fast. Navigation, forms, cards, and tables should disappear into the task. Emphasis belongs to state, actions, and important values only. Decorative novelty is prohibited.

This system explicitly rejects consumer-fintech gloss and legacy-ERP heaviness. It must not drift into gradient-card dashboards, neon state signaling, or overstuffed grids that force users to decode too much at once. It also must not become so sparse that power users lose speed.

**Key Characteristics:**
- Dense but breathable
- Bold in hierarchy, restrained in color
- Familiar admin patterns, no invented affordances
- State-driven emphasis, not decorative emphasis
- Repeated structures tuned for fast scanning

## 2. Colors

The palette is restrained: cool neutrals and white surfaces carry most of the UI, green owns action and success, teal is secondary guidance, and navy is reserved for emphasis and structured data.

### Primary
- **Action Green** (`#00AA4F`): Primary actions, active states, save affordances, positive totals, and selected navigation. This color means "go", not "decorate".
- **Pressed Action Green** (`#00AB46`): Hover and active reinforcement for primary actions. Keep it tightly scoped to interaction feedback.
- **Action Tint** (`#F3FDF8`): Soft hover and selected backgrounds for green-driven elements. This is the safe way to repeat the accent without increasing visual noise.

### Secondary
- **Signal Teal** (`#0081AA`): Secondary emphasis, informational links, and the cool half of the brand gradient. Use it sparingly to distinguish guidance from action.

### Tertiary
- **Ledger Navy** (`#1A2472`): Section headings, tier titles, and emphasized data moments. This is the system's authority color.

### Neutral
- **Primary Ink** (`#3C3C42`): Default body text, headings, and dense operational content.
- **Secondary Ink** (`#757575`): Supporting text, helper copy, and de-emphasized values.
- **Tertiary Ink** (`#999AA5`): Placeholders, subdued labels, and tertiary navigation states.
- **Elevated Surface** (`#FDFDFD`): Card and panel surfaces that sit above the page without looking glossy.
- **Muted Surface** (`#F5F5F5`): Table headers, toggles, icon pads, and quiet contrast zones.
- **Subtle Surface** (`#F6F6F6`): Callouts, inactive fills, and low-tension structural areas.
- **Light Border** (`#E9E9E9`): Default card, table, and section dividers.
- **Medium Border** (`#D8D8D8`): Input borders, stronger container edges, and state-neutral table framing.

### Named Rules
**The Green Means Action Rule.** Green is reserved for action, success, selection, and positive validation. It must not be sprayed across passive surfaces.

**The Navy Carries Structure Rule.** Navy is for hierarchy and commercial emphasis, not for interaction states. If a control is clickable, green owns it.

**The Quiet Surface Rule.** Most of the page should read as tinted white and light grey. If the interface feels colorful at a glance, the color balance is wrong.

## 3. Typography

**Display Font:** Inter, with system sans fallbacks  
**Body Font:** Inter, with system sans fallbacks  
**Label/Mono Font:** Inter for labels; tabular numerics where amounts and percentages need alignment

**Character:** The typography is modern, operational, and unromantic. It should feel native to admin tooling: crisp enough for tables, sturdy enough for section hierarchy, and never stylized for personality.

### Hierarchy
- **Display** (`700`, `24px`, `1`): Page titles and major view headers. Use sparingly, once per screen.
- **Headline** (`700`, `20px`, `1`): Secondary screen headings and modal titles that need clear authority.
- **Title** (`700`, `15px`, `1`): Section titles, card titles, and grouped control labels.
- **Body** (`400`, `14px`, `1.5`): Default readable copy, form values, and control text. This is the workhorse style.
- **Label** (`600`, `12px`, `1`, `0.4px` letter-spacing): Field labels, role chips, badges, and small UI metadata.

### Named Rules
**The One Family Rule.** This system uses one sans family across headers, controls, tables, and labels. Hierarchy comes from weight, size, and spacing, not from changing voices.

**The Numbers Must Align Rule.** Monetary values, litres, percentages, and KPI figures should use tabular numeric alignment wherever comparison matters.

## 4. Elevation

Depth is structural, not theatrical. The system is mostly flat at rest, with light borders and pale surface shifts doing the primary separation work. Shadows appear only to distinguish overlays, menus, tooltips, and elevated cards from the task surface beneath them.

### Shadow Vocabulary
- **Card Lift** (`0px 0px 5px 0px rgba(0,0,0,0.08)`): Light ambient lift for cards that need separation from the page.
- **Overlay Lift** (`0px 0px 10px 0px rgba(0,0,0,0.16)`): Menus, popovers, and floating affordances.
- **Modal Lift** (`0 8px 40px rgba(0,0,0,0.22)`): Dialogs only. This is the strongest elevation in the system and should remain rare.

### Named Rules
**The Flat-By-Default Rule.** Resting surfaces should separate themselves with borders, radius, and spacing first. Shadows come in only when a surface must float.

**The Overlay Earns Depth Rule.** If a component interrupts the task, it may rise. If it merely groups content, keep it quiet.

## 5. Components

### Buttons
- **Character:** Direct, compact, and outcome-oriented.
- **Shape:** Gently squared corners (`4px` radius), never pill buttons for primary task actions.
- **Primary:** Green fill (`#00AA4F`), white text, bold body sizing, compact padding (`9px 16px` to `11px 24px` depending on context).
- **Outline / Soft:** White or tinted surface, green text, green border or green-tint background. Use these for secondary actions that still belong to the primary workflow.
- **Hover / Focus:** Hover deepens color or tint. Focus uses border emphasis and a light shadow, not glowing theatrics.

### Chips
- **Character:** Informational tags, not decorative badges.
- **Style:** Small uppercase or compact labels, muted grey or semantic tint fills, tight radius (`4px`), short horizontal padding.
- **Use:** Role chips, status badges, and compact categorical markers.

### Cards / Containers
- **Character:** Quiet work surfaces that organize dense information.
- **Corner Style:** Medium to large radii (`8px` to `12px`) depending on container scale.
- **Background:** White or near-white surfaces with pale grey sectional framing.
- **Shadow Strategy:** Borders first, light lift second.
- **Internal Padding:** Roomy enough to separate controls (`18px` to `22px` in major cards), but never wasteful.

### Inputs / Fields
- **Character:** Familiar, unambiguous, and operationally tight.
- **Style:** White fill, light neutral border, small corner radius (`2px` to `4px`), compact interior padding (`9px 11px`).
- **Focus:** Green border with a soft low-shadow reinforcement. The focus state should be visible, not dramatic.
- **Error / Disabled:** Disabled uses muted surfaces and grey text. Error uses red text and border signaling without changing the component family.

### Navigation
- **Character:** Stable shell, low-noise, immediately learnable.
- **Sidebar:** Narrow icon-first rail with a light neutral base. Active items use green tint and green text, not heavy fills.
- **Topbar:** Brand gradient is allowed here because navigation is the system identity band, not the work surface.
- **Active State:** Color and tint shift are sufficient. Do not add extra indicators that compete with content emphasis.

### Tables and Dense Lists
- **Character:** Precise, scan-first, commercially literate.
- **Headers:** Muted grey header bands with modest weight (`12.5px` to `14px`, `600`).
- **Rows:** Clean white rows with subtle hover tint. Borders remain light.
- **Use:** Comparison, ranking, and repeated numeric review. Do not replace these with cards when the user’s job is cross-row comparison.

### Section Headers
- **Character:** Firm internal chapter markers.
- **Style:** Pale grey header band, navy title text, consistent padding, full-width framing inside cards.
- **Use:** To break complex configuration surfaces into predictable chunks that power users can re-enter quickly.

## 6. Do's and Don'ts

### Do:
- **Do** use green for actions, success states, and selected controls only.
- **Do** keep content surfaces mostly white and soft grey, with navy carrying hierarchy.
- **Do** preserve predictable admin structures: section headers, aligned forms, compact lists, and stable navigation.
- **Do** use density intentionally. Pack information tightly, but separate it with rhythm, headers, and repeated alignment.
- **Do** make state tell the story. Future periods, pending states, warnings, and clean records should each feel different immediately.
- **Do** keep repeated controls visually consistent across flows. If one save button looks different from another, one is wrong.

### Don't:
- **Don't** introduce consumer-fintech styling. No gradient cards, no neon accent colors, no glowing revenue-chart energy. This is not Robinhood or a crypto dashboard.
- **Don't** drift into legacy ERP heaviness. No information crammed into every pixel, no 12-field visual walls, no SAP-era table weight.
- **Don't** use border-left or border-right accent stripes greater than `1px` on cards, callouts, or passive list items. Exception: vertical tab navigation (e.g. sidebar-style feature/module tab lists) may use a border-left active-state indicator — it's a real affordance on an interactive control, not decoration on a static surface.
- **Don't** use gradient text, decorative glassmorphism, or oversized hero metrics inside product surfaces.
- **Don't** replace comparison-heavy structures with identical card grids. If the task is ranking or numeric comparison, alignment wins.
- **Don't** use heavy color on inactive states. Accent belongs to intent and state change, not passive decoration.
