---
name: Luminescent Slate
colors:
  surface: '#0e1321'
  surface-dim: '#0e1321'
  surface-bright: '#343948'
  surface-container-lowest: '#090e1c'
  surface-container-low: '#161b2a'
  surface-container: '#1a1f2e'
  surface-container-high: '#252a39'
  surface-container-highest: '#303444'
  on-surface: '#dee2f6'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dee2f6'
  inverse-on-surface: '#2b303f'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#7bd0ff'
  on-tertiary: '#00354a'
  tertiary-container: '#19aee8'
  on-tertiary-container: '#003e55'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#0e1321'
  on-background: '#dee2f6'
  surface-variant: '#303444'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-eyebrow:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.15em
  label-tag:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a focused, high-precision technical presence tailored for elite engineering portfolios, technical showcases, and developer product profiles. It blends deep aerospace slate tones with glowing cyan and emerald accents to communicate authority, technical mastery, and craftsmanship. 

The aesthetic marries **Glassmorphism** with **Minimalism**:
- Deep obsidian and midnight navy canvas foundations prevent glare while allowing subtle glowing borders to guide eye flow.
- Micro-interactions, soft cyan backdrops, and interactive accordion/expandable skill capsules evoke a sophisticated terminal-meets-IDE atmosphere.
- The UI evokes quiet confidence, razor-sharp execution, and modern digital poise.

## Colors

The color palette centers on high-contrast phosphorescent accents resting upon rich, deeply layered obsidian navy surfaces:

- **Canvas & Surface Base:** Deep obsidian navy (`#0a0f1d`) provides the infinite canvas, while card containers sit in elevated slate navy (`#0d1527` and `#111c35`).
- **Primary Accent (`#10b981`):** Electric mint green reserved for category badges, active status indicators, and primary highlights.
- **Secondary & Tertiary Accents (`#06b6d4`, `#38bdf8`):** Vivid cyan and sky blue powering luminous interactive states, expand arrows, subtle gradients, and focused focus rings.
- **Neutral Scales:** Cool-tinted slate tones (`#94a3b8` body copy, `#f8fafc` primary headers, `#1e293b` subtle glass borders) preserve accessibility and legibility across low-light displays.

## Typography

Typography establishes an intentional cadence between editorial technology and code syntax:

- **Headlines (`Space Grotesk`):** Modern geometric balance with subtle quirks that echo clean digital architecture.
- **Body (`Geist`):** Engineered for ultra-clean rendering on dark surfaces, optimizing high-density readability for case studies and documentation.
- **Labels & Metatags (`JetBrains Mono`):** Monospace styling for section eyebrow tags (such as `SKILLS`), count counters (`9 +`), and technical tags, conveying an uncompromising terminal aesthetic.
- **Eyebrow Treatments:** Uppercase typography with deliberate `0.15em` character tracking in accent mint/cyan ensures high-visibility section headers even at micro scales.

## Layout & Spacing

The layout is built upon an adaptive 12-column fluid grid on desktop collapsing to a 4-column structured stack on mobile screens:

- **Canvas Constraints:** Maximum content boundary capped at `1200px` for optimal visual balance in portfolio and landing pages.
- **Mobile Viewport Optimization:** On viewports under `640px`, horizontal canvas margins contract to `1rem` (`margin-mobile`), and skills badges/accordions stretch to full column width with compact internal gutters (`0.75rem`).
- **Interactive Component Grids:** The skills matrix adapts smoothly: 3 equal cards per row across `>1024px`, 2 columns at `768px-1023px`, and a single unified column below `768px` for comfortable thumb tap targets.

## Elevation & Depth

Visual depth is achieved through translucent layered containers, ambient luminous backdrops, and delicate hairline edges rather than heavy drop shadows:

- **Base Layer:** Canvas surface at `#0a0f1d`.
- **Level 1 (Card & Module Surfaces):** Semi-translucent dark slate `#0d1527` with a 1px border rendered in `rgba(56, 189, 248, 0.12)` or `rgba(255, 255, 255, 0.08)`.
- **Level 2 (Hover & Active Capsules):** Background elevated to `#131e38` backed by an ambient glow: `box-shadow: 0 0 20px -4px rgba(6, 182, 212, 0.25)`.
- **Pill Depth:** Inner badges and interactive count toggles sit within an inset or darker translucent container (`rgba(10, 15, 29, 0.6)`) with subtle hairline perimeter highlights (`rgba(255, 255, 255, 0.07)`).

## Shapes

The design system incorporates geometric precision softened by smooth continuous corners:

- **Containers & Skill Cards:** Use `rounded-lg` (`1rem` / `16px`) to produce refined architectural blocks with a friendly, modern touch.
- **Badges, Counts, & Control Pills:** Form full capsule radii (`rounded-full` / `9999px`) to create clear contrast against the enclosing rectangular cards.
- **Interactive Triggers:** Accordion carats and miniature arrows sit encapsulated within pill badges to afford effortless tactile discovery.

## Components

### Skill Capsules & Accordion Cards
- **Container:** Dark slate `#0d1527` surface with a 1px `rgba(255, 255, 255, 0.08)` hairline border and `16px` border-radius.
- **Padding:** `1rem 1.25rem` in collapsed resting state; expands to reveal nested technology tags with a smooth transition.
- **Header Elements:** Category title in `Space Grotesk` (White `#f8fafc`) on the left; count pill badge pinned to the right.
- **Count & Trigger Pill:** Dark pill badge (`#15203b`) with monospace count label (`7 +`) and a small chevron/arrow icon (`#38bdf8`).
- **Hover State:** Border transitions to `rgba(6, 182, 212, 0.35)` with an ambient soft cyan glow.

### Pill Badges & Chips
- **Resting:** Monospace font (`12px`), height `28px`, pill radius (`9999px`), background `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.1)`.
- **Active / Accent:** Background `rgba(16, 185, 129, 0.12)`, text `#10b981`, border `1px solid rgba(16, 185, 129, 0.3)`.

### Buttons
- **Primary:** Solid `#10b981` background, `#0a0f1d` deep text, `rounded-full`, subtle hover glow `box-shadow: 0 0 16px rgba(16, 185, 129, 0.4)`.
- **Secondary / Glass:** Background `rgba(13, 21, 39, 0.8)`, border `1px solid rgba(56, 189, 248, 0.25)`, text `#f8fafc`. Hover increases border brightness and soft tint.

### Inputs & Search Fields
- **Container:** Background `#0d1527`, border `1px solid rgba(255, 255, 255, 0.1)`, inner padding `0.75rem 1rem`, placeholder color `#64748b`.
- **Focus:** 1px ring in `#06b6d4` with `0 0 0 3px rgba(6, 182, 212, 0.15)`.