# Changelog

All notable changes to this project are documented here. Follows [Semantic Versioning](https://semver.org/).

## [3.9.0] - 2026-03-13

### Added

- Animated service illustrations: 6 unique micro-animations per service card (Full-Stack request flow, DevOps deploy terminal, AI/ML neural network, AI Agents chat, architecture diagram, sort visualization)
- Floating certification badge showcase with hover glow and level-based accent colors
- Trophy wall grid for competitions: 2-column layout with medal colors and placement numbers
- Expandable education achievements with height animation (skills always visible)
- Animated timeline track: dot scales in + line grows on scroll
- Experience modal stagger: header, projects, contributions, achievements, skills cascade sequentially
- Chat-style send confirmation in contact form (typing dots -> checkmark)
- Themed 404 page with glassmorphism, gradient text, aurora blobs, SPA redirect
- Status pill badge in About section (green glass pill)
- Tech stack glass pills in hero (AWS, React, GenAI as individual badges)
- Proper stat labels: "Problems Solved", "LeetCode Rating", "Open Source PRs"

### Changed

- Services: 2-column grid with animated illustrations + horizontal card layout
- Services icon map: fixed stale keys to match current service titles
- Achievement section: floating cert badges + trophy grid replace old list rows
- Experience modal: refactored from 498 to 90 lines (4 sub-components)
- "Framer Motion" -> "Motion" in skills.json and projects.json

### Removed

- 13 dead code files (AboutBento, SkillBrowser, ServiceIconRing, CertificationsSection, etc.)
- `useReducedMotion` checks from new components (animations always render)

## [3.8.0] - 2026-03-13

### Added

- Experience modal with sticky header, project cards, internal contributions (color-coded by type), internal achievements (amber), and aggregated key skills
- Clickable timeline cards in Experience section (replaces "Show more" expand)
- `internal_achievements` field on experience data (TechU Graduate, TFC Ambassador, MLOps SME, Speaker Cert, etc.)
- `CodingProfiles` component in GitHub section (GitHub, LeetCode, GFG, HackerRank cards in a row)
- Coding platform stats populated in achievements.json (LeetCode 1200+/2007 Knight, GFG 400+, HackerRank 6-Star)
- AWS Organizations, SCPs, GuardDuty, Security Hub added to cloud_devops skills
- "First Division with Distinction" achievement added to NIT Warangal education
- Resume PDF auto-generator script (`scripts/generate-resume.py`)

### Changed

- Experience data restructured: all 3 entries now use consistent `projects[]`, `internal_contributions[]`, `internal_achievements[]` format
- AWS full-time: 4 projects (State Street, DTCC, MLOps SME internal, RWS ongoing) with real dates and updated bullet points
- Internship wording: "Led" -> "Migrated"/"Containerized", summary rewritten for Ikarus-3D
- Coding profiles moved from Achievements section to GitHub section
- Location updated to Hyderabad, Twitter link updated to x.com, GitHub capitalization fixed
- Roles trimmed from 10 to 6 (removed filler like "Problem Solver", "Tech Enthusiast")
- CGPA hidden from BCA, Class XII, Class X (only MCA 8.38 visible)
- LeetCode contests corrected to 100+ (LeetCode only), 140+ (combined across platforms)
- AuroraBlobs fixed: SVG ellipses replaced with CSS divs + blur (Motion can't animate SVG cx/cy)

### Removed

- Terminal, Activity Feed, Node Diagram, Stats Card from GitHub section (components kept in ui/ for future use)
- CodingPlatformsSection from Achievements page (moved to GitHub)
- Percentage display from education cards

## [3.7.0] - 2026-03-12

### Fixed

- SonarCloud security hotspots: replaced 8x `Math.random()` with `cryptoRandom()` using `crypto.getRandomValues()`
- SonarCloud code duplication: extracted `GLASS_PANEL_STYLE`, `CHROME_BAR_STYLE`, `PANEL_*` constants, `useRevealInView` hook
- Empty stub methods in test mocks: added no-op comments
- `export...from` pattern for IconStyleProps re-export

## [3.6.0] - 2026-03-12

### Added

- Aurora gradient background (`AuroraBlobs.tsx`) -- fluid morphing SVG blobs replacing static CSS orbs
- Shooting stars background (`ShootingStars.tsx`) -- animated light streaks across viewport
- Scroll-driven gradient text (`ScrollRevealText.tsx`) -- section subtitles fill with cyan-to-purple gradient on scroll
- Character reveal animation (`CharacterReveal.tsx`) -- spring physics char-by-char entrance on About greeting
- Bento grid layout for Services section with rotation entrance and hover glow
- `scrollMarginTop: 64` on all sections for correct nav scroll alignment

### Changed

- Replaced `GlassBackground` (CSS orbs) with `AuroraBlobs` (SVG gradient blobs) globally
- Services grid changed from uniform to asymmetric bento layout (cards 3 and 6 span full width)

## [3.5.0] - 2026-03-12

### Added

- 3D browser mockup component for GitHub section (`BrowserMockup.tsx`)
- Auto-typing terminal card component (`TerminalCard.tsx`)
- Staggered activity feed component (`ActivityFeed.tsx`)
- SVG workflow node diagram (`NodeDiagram.tsx`)
- GitHub section redesign with calendar in 3D mockup + 2x2 feature grid
- Wave cascade animations on secondary skills (consistent with primary skills)
- Stagger animations on open source contribution cards
- Scroll-triggered entrance animation on project cards

### Changed

- GitHub section components replay animations on scroll in/out (changed `once: false`)
- TerminalCard resets and replays when scrolled out and back in

### Fixed

- Secondary skills missing animation (now uses same `waveCascadeContainer`/`waveCascadeItem` as primary)
- Project cards showing immediately instead of animating on scroll (`animate` -> `whileInView`)
- Nav scroll alignment -- sections were partially hidden behind fixed 64px nav bar

## [3.4.0] - 2026-03-12

### Added

- `src/constants/theme.ts` -- centralized color, font, and layout constants (CYAN, PURPLE, TEXT_PRIMARY, MONO_FONT, MAX_WIDTH, etc.)
- `src/components/layout/PageSection.tsx` -- reusable page section wrapper replacing repeated boilerplate across all 9 pages
- `src/components/ui/TechTag.tsx` -- reusable skill/tech tag component with consistent monospace styling

### Changed

- All 9 page components refactored to use `<PageSection>` wrapper (removes ~105 lines of duplicated section setup)
- Replaced 38 hardcoded `"JetBrains Mono, ui-monospace, monospace"` strings with `MONO_FONT` constant
- Replaced hardcoded color values across 15+ components with theme constants
- `experienceHelpers.tsx` SkillTags now uses `TechTag` internally

## [3.3.0] - 2026-03-12

### Changed

- Split all 16 components exceeding 150 lines into focused sub-components (33 files became 99 files)
- Enforced max 150 lines per component file with UI separated from logic
- Added convention to CLAUDE.md: "Never create a component longer than 150 lines"

## [3.2.0] - 2026-03-12

### Added

- `globals` package for ESLint browser globals (replaces 18 manual entries)

### Changed

- Migrated from `framer-motion` to `motion` package (official rebrand), all 24 import paths updated to `"motion/react"`
- Replaced manual Lenis RAF loop (22 lines in App.tsx) with `<ReactLenis root />` from `lenis/react`
- Replaced unsafe `globalThis.__lenis` access in Experience page with `useLenis()` hook
- Replaced manual `onMouseEnter`/`onMouseLeave` DOM manipulation on Hero social icons with Motion `whileHover`
- Extracted 3x duplicated `<Particles>` fallback in Hero into a single `ParticleFallback` component

### Removed

- Unused polymorphic `as` prop from GlassCard (never used anywhere, had unsafe type cast)
- Redundant Vite config defaults: `fastRefresh`, `jsxRuntime`, `optimizeDeps.include`, `hmr`

## [3.1.0] - 2026-03-12

### Added

- Three.js Canvas pauses (`frameloop="never"`) when hero section scrolls off-screen via `useInView`
- `PerformanceMonitor` auto-degrades: halves particles and hides decorative geometries on FPS drops
- `requestAnimationFrame` throttle guard on GlassCard mouse tracking
- `IntersectionObserver`-based scroll-spy in Nav (replaces per-scroll DOM queries)
- `ResizeObserver` mock in test setup for `lenis/react` compatibility

### Changed

- Consolidated 8 individual `useScroll()` hooks in ParallaxElements into a single shared hook passed via props

## [3.0.0] - 2026-03-12

### Added

- Full TypeScript: converted all 33 source files from JSX/JS to TSX/TS
- Centralized type system in `src/types/index.ts` with 19 data interfaces
- Typed all 22 dataLoader getter functions with proper return types
- `typescript-eslint` for TS-aware linting with zero-warning enforcement
- `@types/react-dom` for proper DOM type support

### Changed

- `tsconfig.json` target upgraded from ES2022 to ES2024
- ESLint config extended with `typescript-eslint` recommended rules, file glob now includes `*.ts`/`*.tsx`

### Removed

- `prop-types` dependency (replaced by TypeScript interfaces throughout)
- Dead files: `.dockerignore` (no Docker), `.nvmrc` (stale Node 19), `.editorconfig` (redundant with Prettier)
- Dead config: `browserslist` block (Vite ignores it), `dist` from clean script and `.gitignore`
- Unused `@testing-library/jest-dom` dependency
- Stale `allowJs`/`checkJs` from tsconfig (no JS files remain)

## [2.5.0] - 2026-03-08

### Added

- Portfolio page with 5-category filtering (Featured, Community, Collab, Others) and open source contributions banner
- Activity timeline visualization for project history
- Smoke tests for app rendering, data loading, project field validation, and certification URL checks

### Changed

- Reorganized projects data into Featured/Collaborative/Other/Community/Open Source categories
- Updated README with new 3D scene, animation, and testing documentation

## [2.4.0] - 2026-03-05

### Added

- CODEOWNERS file
- PR template
- Monthly grouped Renovate configuration (replaces per-package updates)

### Changed

- Domain migration from sagargupta.live to sagargupta.online
- Node version pinned to >=24.11.0
- Security vulnerabilities resolved via pnpm audit

### Removed

- `.dockerignore`, `.nvmrc`, old changelog placeholder

## [2.3.0] - 2026-03-04

### Added

- GitHub Actions CI/CD pipeline: lint, JSON validation, build, security audit, deploy to GitHub Pages
- Custom domain deployment configuration for sagargupta.online/portfolio-react/
- Open Graph image metadata for social sharing
- SPA 404 routing for GitHub Pages

## [2.2.0] - 2026-02-20

### Added

- GitHub activity section with `react-github-calendar` contribution heatmap
- SystemStatus component with live visitor counter via counterapi.dev
- Credly badge sync script (`scripts/sync-credly.js`) with weekly GitHub Actions workflow
- pnpm security overrides for transitive dependency vulnerabilities

## [2.1.0] - 2026-02-18

### Added

- 3D WebGL hero scene with React Three Fiber: particle field (300 desktop / 100 mobile) + 5 floating wireframe geometries
- tsParticles fallback for browsers without WebGL support
- WebGL capability detection with graceful degradation
- `dataLoader.ts` for centralized typed data access (18 getter functions)
- Animated section transitions: gradient-sweep, glow-pulse, beam, geometric-scatter
- Parallax floating shapes (8 elements) with scroll-linked transforms

## [2.0.0] - 2026-02-11

Complete rewrite from Create React App to Vite with glassmorphism design.

### Added

- Vite 7 build system with React 19, replacing Create React App
- Tailwind CSS v4 with CSS-first `@theme` configuration (replaces CSS modules)
- Lenis smooth scroll (replaces React Router -- single-page scroll architecture)
- Glassmorphism UI system: glass cards with hover tilt, cursor glow, animated gradient borders
- 16 Framer Motion animation presets in `src/utils/animations.ts`
- Glass orb parallax background with 6 animated orbs
- Scroll-spy navigation with active section detection and progress indicator
- Keyboard navigation (arrow keys between sections)
- Preloader with progress animation
- Scroll progress bar and back-to-top button
- ErrorBoundary component for runtime error handling
- Footer with Konami code easter egg
- Self-hosted Inter Variable and JetBrains Mono Variable fonts
- `useMediaQuery` and `useReducedMotion` custom hooks (useSyncExternalStore)
- Lazy loading for all 9 page sections below the hero
- Manual chunk splitting: vendor, icons, animations, threejs, particles
- Path aliases: `@`, `@components`, `@pages`, `@data`, `@utils`, `@assets`

### Added (Pages)

- Hero with role cycling, social links, and animated stat counters
- About with bio, highlights grid, and animated statistics
- Experience with interactive timeline and expandable project details
- Education with academic timeline and animated CGPA counters
- Skills with categorized grid and wave cascade animations
- Portfolio with project cards
- Achievements with certifications, learning badges, and competition medals
- Services offering grid
- Contact form via EmailJS with validation and toast notifications

### Removed

- Create React App (react-scripts)
- React Router (replaced by scroll navigation)
- CSS modules and component-level CSS files
- Swiper carousel
- Typewriter effect library
- Theme switching feature (replaced by fixed dark glassmorphism theme)
- DeepSource and SonarCloud integration
- Testimonials section
- web-vitals

## [1.5.0] - 2025-07-26

### Added

- Framer Motion animations across all sections
- ErrorBoundary component
- New CSS architecture with utility-first approach
- GitHub Actions workflows for CI, PR validation, and CodeQL analysis

### Changed

- Major dependency upgrade: React Router v6 to v7, TypeScript 4.9 to 5.9
- Refactored component structure and removed unnecessary React imports
- Updated resume and profile details across all sections
- Accessibility: changed theme container from div to button

### Removed

- Obsolete CI workflows
- Unused Testimonial component

## [1.4.0] - 2025-08-10

### Added

- Achievement page with certifications, learning badges, and coding platform statistics
- Enhanced Contact page with animations and improved layout
- Improved test coverage for Contact and ErrorBoundary components

### Changed

- Updated GitHub Actions workflow for deployment and coverage reporting
- Simplified CI workflow structure

## [1.3.0] - 2024-01-02

### Added

- Theme switching feature with multiple color themes and random theme on start
- Test cases for components
- UI refactoring with improved layout and spacing

### Changed

- Updated resume
- Refactored theme switching logic and form validation
- Updated Prettier configuration

## [1.2.0] - 2023-12-24

### Added

- PropTypes validation across all components (SonarCloud fixes)
- RouterWrapper component for improved routing
- LICENSE (GPL-3.0), SECURITY.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md
- Issue templates

### Changed

- Updated favicon links
- Fixed Contact page regex validation
- Dependency updates and formatting fixes

## [1.1.0] - 2023-07-25

### Added

- Experience section with timeline, features, and mobile view
- Skills section with responsive grid
- Projects section with all project cards and CSS
- Contact page with full UI redesign and EmailJS integration
- Navigation overhaul with mobile hamburger menu and formatting
- GitHub Pages deployment via GitHub Actions (`main.yml`)

### Changed

- Updated for newer dependency versions
- Route configuration for GitHub Pages subpath
- Image optimization via ImgBot

### Fixed

- Navigation mobile view formatting
- Link components (replaced `<a>` with React Router `<Link>`)
- CI workflow configuration

## [1.0.0] - 2022-10-03

### Added

- Initial project scaffolded with Create React App
- Core sections: Hero, About, Services, Portfolio (partial), Contact, Footer
- React Router for page navigation
- DeepSource integration for code quality
- Mobile responsive layout (WIP)
