---
name: Dayflow HRMS
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#464555'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5b598c'
  on-secondary: '#ffffff'
  secondary-container: '#c7c3fe'
  on-secondary-container: '#514f81'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c4c1fb'
  on-secondary-fixed: '#181445'
  on-secondary-fixed-variant: '#444173'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  gutter: 1rem
  margin-mobile: 1rem
  margin-desktop: 2rem
---

## Brand & Style
The design system prioritizes professional reliability and operational efficiency for high-stakes human resource management. The aesthetic is **Corporate / Modern**, characterized by structured clarity, ample white space, and a refined sense of order. 

The visual narrative focuses on "Trust through Precision"—utilizing a crisp, high-contrast interface that reduces cognitive load for HR administrators. The style leverages subtle depth through tonal layering and soft shadows to distinguish between navigational containers and actionable content. The overall feel is approachable yet authoritative, ensuring that complex data feels manageable and transparent.

## Colors
The palette is rooted in a "Deep Navy" sidebar and "Indigo" primary actions to establish an enterprise-grade foundation. 
- **Primary (Indigo):** Reserved for high-priority actions, active states, and brand moments.
- **Secondary (Deep Navy):** Used for structural navigation and sidebars to provide a strong visual anchor.
- **Semantic Palette:** Success (Green), Warning (Amber), and Danger (Red) are used strictly for status indicators and feedback loops to maintain their psychological urgency.
- **Surface & Borders:** The background uses pure White with subtle gray borders (`#F3F4F6`) to define card boundaries without introducing visual noise.

## Typography
This design system utilizes **Inter** exclusively to ensure maximum legibility across data-heavy tables and dashboards. 
- **Headlines:** Use tighter letter-spacing and heavier weights to create a strong hierarchy.
- **Body Text:** Standardized at 14px for density without sacrificing readability; 16px is used for long-form content or onboarding.
- **Labels:** Small caps or medium-weight 12px type is used for table headers and form labels to distinguish them from user-inputted data.
- **Mobile scaling:** Display sizes shrink by approximately 15-20% on mobile to ensure titles do not wrap awkwardly.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a max-width container for desktop viewing. 
- **Desktop:** A 12-column grid with 24px gutters. The sidebar is fixed at 280px, while the main content area expands.
- **Mobile:** A 4-column grid with 16px margins. Navigation shifts to a persistent bottom bar for primary modules (Dashboard, Time, People) or a hamburger menu for secondary settings.
- **Rhythm:** An 8pt linear scaling system is used for all padding and margins to ensure mathematical harmony between elements.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and precise shadows. 
- **Level 0 (Base):** The main application background (typically a very light gray or white).
- **Level 1 (Cards):** Uses a "shadow-sm" (0 1px 2px 0 rgba(0, 0, 0, 0.05)) to lift cards slightly off the base.
- **Level 2 (Dropdowns/Modals):** Uses a more pronounced, diffused shadow to indicate interactive overlays.
- **Outlines:** All cards and input fields use a thin 1px border (`#F3F4F6`) to provide definition even in low-contrast environments.

## Shapes
The shape language is modern and "soft-industrial." 
- **Cards:** Use `rounded-2xl` (1rem / 16px) to create a friendly, modern container for data.
- **Controls:** Buttons and input fields use `rounded-lg` (0.5rem / 8px) to maintain a professional, organized appearance that contrasts slightly with the larger card radii.
- **Indicators:** Small badges and status chips use a full pill-shape for immediate recognition.

## Components
- **Buttons:** Primary buttons are solid Indigo with white text. Secondary buttons use a white fill with a subtle gray border.
- **Cards:** The signature component of the design system. Must have a `rounded-2xl` radius, `shadow-sm`, and a 1px border.
- **Input Fields:** High-contrast borders that darken on focus. Labels sit outside the field in `label-sm` typography.
- **Status Chips:** Small, pill-shaped indicators using low-opacity backgrounds of the semantic colors (e.g., 10% Green background for "Active" with 100% Green text).
- **Lists & Tables:** Clean rows with 1px bottom borders. Hover states should trigger a light gray background wash.
- **Bottom Navigation (Mobile):** High-contrast icons with 10px labels, utilizing the Primary Indigo color for the active state.