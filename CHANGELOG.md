# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-12

### Added

- Dark futuristic single-page scroll design with glassmorphism cards and neon glow effects
- Tailwind CSS v4 with custom theme (cyan/purple/green accent palette)
- Framer Motion animations throughout (staggered reveals, fade-ins, scale-ins)
- tsParticles star field background in Hero section
- Lenis smooth scrolling
- Scroll-spy navigation with active section highlighting
- Animated counters for statistics (CGPA, coding stats, certifications)
- Coding platform stats section (LeetCode, GFG, HackerRank, CodeChef) with top-3 display
- GitHub contribution heatmap via react-github-calendar
- Keyboard navigation support (j/k, arrow keys, Home/End)
- Scroll progress indicator
- Back-to-top button
- Preloader animation
- Expandable experience cards with project details
- Filterable project cards (Personal / Collaborative)
- Glass-card hover effects with cyan border glow
- Section dividers with gradient lines
- Mobile-responsive design with dedicated mobile layouts

### Changed

- Complete UI redesign from CSS Modules multi-page to dark-themed single-page scroll
- Replaced react-router-dom with single-page scroll sections
- Replaced CSS Modules with Tailwind CSS v4 + inline styles
- Replaced react-simple-typewriter with Framer Motion text animation
- Data-driven architecture: all content in JSON files with dataLoader.js getters
- Consolidated duplicate code in Education, Experience, and Portfolio components
- Converted achievement data keys from snake_case to camelCase

### Removed

- react-router-dom (no longer needed for single-page scroll)
- react-simple-typewriter (replaced by Framer Motion)
- react-helmet-async (single page uses static meta tags)
- All CSS Module files (replaced by Tailwind + inline styles)
- Old multi-page routing and layout structure

### Technical Stack

- React: 19.2.4
- Vite: 7.3.1
- Tailwind CSS: v4 (via @tailwindcss/vite)
- Framer Motion: 12.34.0
- Lenis: smooth scroll
- Lucide React + React Icons
- EmailJS: contact form
- pnpm: package manager
- ESLint 9 + Prettier

---

## [1.0.0] - 2025-11-09

### Added

- ✨ Migrated from Create React App to Vite 7.2.2 for faster builds
- ✨ Upgraded to React 19.2.0 with latest features
- ✨ Implemented pnpm as package manager for better performance
- ✨ Added StrictMode for better development experience
- ✨ Configured ESLint 9 with flat config
- ✨ Added path aliases for cleaner imports
- ✨ Enhanced SEO with comprehensive meta tags
- ✨ Added jsconfig.json for better IDE support
- ✨ Configured modern build optimizations

### Changed

- ⚡️ Updated all dependencies to latest versions
- ⚡️ Optimized build output with code splitting
- ⚡️ Improved GitHub Actions workflow with Node 24
- ⚡️ Enhanced Vite configuration for performance
- ⚡️ Modernized ESLint configuration

### Removed

- 🗑️ Removed deprecated react-scripts
- 🗑️ Removed unnecessary babel configuration
- 🗑️ Cleaned up old build artifacts
- 🗑️ Removed legacy peer dependency issues

### Technical Stack

- React: 19.2.0
- Vite: 7.2.2
- Node.js: 24.11.0 LTS
- pnpm: 10.20.0
- TypeScript: 5.9.3
- ESLint: 9.39.1
- Prettier: 3.6.2
