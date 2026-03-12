# Changelog

All notable changes to this project are documented here. Follows [Semantic Versioning](https://semver.org/).

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
