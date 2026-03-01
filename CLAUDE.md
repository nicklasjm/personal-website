# CLAUDE.md — nicklasjakobsen.dk

Personal portfolio website for Nicklas Jakobsen, a Junior Digital Designer at Kontrapunkt in Copenhagen.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Astro 5.7.0 (static site generation) |
| CMS | Sanity (headless) |
| Styling | CSS custom properties (design tokens only, no Tailwind) |
| Adapter | `@astrojs/netlify` |
| Interactive components | React 19 (used sparingly) |
| Hosting | Netlify (auto-deploy from `main`) |
| Domain | https://nicklasjakobsen.dk |

## Development

```sh
npm run dev        # Dev server at localhost:4321
npm run build      # Production build
npm run preview    # Preview production build
npm run sanity     # Open Sanity Studio
```

## Environment Variables

Copy `.env.example` to `.env`:

```
SANITY_PROJECT_ID=...
SANITY_DATASET=production
PUBLIC_SITE_URL=https://nicklasjakobsen.dk
```

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/index.astro` | Home page — hero + desktop cursor follower + mobile project card |
| `src/pages/feed/index.astro` | Posts feed with category filtering |
| `src/pages/cv.astro` | CV / resume page |
| `src/pages/tools.astro` | Tools & software showcase |
| `src/layouts/Base.astro` | Base HTML shell — scroll-triggered animations, theme init |
| `src/components/Navigation.astro` | Fixed bottom pill navigation |
| `src/components/ContactTooltip.astro` | Contact popup — email copies to clipboard, social links open in new tab |
| `src/components/ThemeToggle.astro` | Dark/light mode button (top-right, fixed) |
| `src/components/PostCard.astro` | Post card with expand-overlay trigger |
| `src/components/PostExpandOverlay.astro` | Full-screen post modal with image carousel |
| `src/components/MediaCarousel.astro` | Touch-swipe image carousel |
| `src/lib/sanity.ts` | Sanity client + all data-fetching functions |
| `src/styles/global.css` | Design tokens (colors, typography, spacing, shadows) |
| `src/styles/animations.css` | Keyframe animations |
| `sanity/schemas/` | CMS content schemas |

## Architecture Notes

### Data Flow
All content is fetched from Sanity CMS at **build time** via `src/lib/sanity.ts`. No client-side CMS queries.

### Design System
Pure CSS custom properties in `src/styles/global.css`:
- Fluid typography: `--text-xs` → `--text-3xl` (all use `clamp()`)
- Spacing scale: `--space-xs` → `--space-3xl`
- Glassmorphism components: navigation pill, contact tooltip, post cards
- Light/dark themes via `[data-theme="dark"]` selector on `<html>`

### Theme System
- Stored in `localStorage` key `"theme"` (`"light"` | `"dark"`)
- Applied via `document.documentElement.dataset.theme`
- Initialized with an inline `<script is:inline>` in `Base.astro` **before** first paint to prevent flash
- Falls back to `prefers-color-scheme` if no saved preference

### Home Page — Desktop Interactions (`src/pages/index.astro`)
On `(hover: hover)` devices (pointer/mouse):
- **Cursor follower** shows project thumbnail + title + cursor arrow SVG as a custom cursor
- The cursor arrow SVG is part of the follower, so the user always sees where their cursor is even when the system cursor is hidden (`cursor: none`)
- **Safe zones** restore normal cursor and hide the follower:
  - **Bottom zone** (~110 px from viewport bottom): covers the bottom navigation pill. Shows an "attached" project card centered just above the nav.
  - **Top-right corner** (~80 px from top + right): covers the theme-toggle button.
- Clicking in the hero navigates to the currently shown project
- Projects cycle every 300 px of mouse movement (Fisher-Yates shuffled on load)

### Home Page — Mobile Interactions (`src/pages/index.astro`)
On `(hover: none)` devices (touch):
- A mobile project card appears on **first `touchstart` or `scroll`** event
- Both listeners use `{ passive: true }` for scroll-jank-free performance
- Auto-cycles through all projects every **3 seconds**
- Tapping navigates to the current project
- Card positioned above the bottom navigation

### Navigation
Fixed bottom pill: Home / Feed / Tools / CV / Contact.
Contact button opens `ContactTooltip`:
- **Email row** → copies address to clipboard; value text temporarily shows "Copied e-mail address" (green, 2 s)
- **Social links** → open in new tab

### Posts / Feed
- Posts are listed on `/feed` as `PostCard` components
- Clicking a card opens `PostExpandOverlay` (full-screen modal with image carousel)
- Carousel supports touch swipe (50 px threshold) and keyboard arrows
- External "links" category posts open a URL directly

## Sanity Schemas (`sanity/schemas/`)

| Schema | Fields |
|--------|--------|
| `post` | title, slug, category, featuredImage, body (Portable Text), externalLink |
| `settings` | heroText (home page subtitle) |
| `contact` | email, socialLinks[], availability (`available` / `open` / `unavailable`) |
| `cv` | CV entries grouped by section |
| `tool` | name, description, icon |

## Deployment
Netlify auto-deploys on push to `main`. Build command: `npm run build`. Publish directory: `dist/`.
