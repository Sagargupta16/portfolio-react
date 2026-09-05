# Sagar Gupta - Portfolio

![GitHub stars](https://img.shields.io/github/stars/Sagargupta16/portfolio-react?style=flat-square&cacheSeconds=86400)
![GitHub forks](https://img.shields.io/github/forks/Sagargupta16/portfolio-react?style=flat-square&cacheSeconds=86400)
![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/Sagargupta16/portfolio-react?style=flat-square&cacheSeconds=86400)

[![CI/CD Pipeline](https://github.com/Sagargupta16/portfolio-react/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Sagargupta16/portfolio-react/actions/workflows/ci-cd.yml)

![React Version](https://img.shields.io/badge/react-19-blue)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178c6)
![Vite Version](https://img.shields.io/badge/vite-8-purple)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4-06b6d4)
![Tests](https://img.shields.io/badge/tests-16%20passing-22c55e)
![Version](https://img.shields.io/badge/version-4.6.3-2563eb)

**Live:** [sagargupta.online/portfolio-react](https://sagargupta.online/portfolio-react/)

---

## About

A minimal dark personal portfolio: near-black canvas, one blue accent family, flat bordered cards, and an ambient aurora-and-beams background. Project cards carry live screenshots of deployed sites and animated SVG cover scenes for everything else. Built as a single-page scroll application with strict TypeScript, isolated lazy sections, data validation, and a persisted System/Full/Reduced motion preference.

---

## Tech Stack

| Category          | Technologies                                               |
| ----------------- | ---------------------------------------------------------- |
| **Core**          | React 19, TypeScript 7, Vite 8 (Rolldown), Tailwind CSS v4 |
| **Animations**    | Motion (Framer Motion)                                     |
| **Fonts**         | Inter Variable, JetBrains Mono (self-hosted)               |
| **Smooth Scroll** | Lenis (ReactLenis)                                         |
| **Icons**         | Lucide React, React Icons                                  |
| **Contact**       | EmailJS                                                    |
| **GitHub**        | react-github-calendar                                      |
| **Testing**       | Vitest 5, React Testing Library                            |
| **Code Quality**  | ESLint 10, typescript-eslint, jsx-a11y-x, Prettier         |
| **Deployment**    | GitHub Actions, GitHub Pages                               |

---

## Sections

| Section          | Features                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| **Hero**         | Logo tile, status badge, data-driven introduction, latest project and upstream contribution            |
| **About**        | Character reveal, highlight cards, quick-facts band                                                    |
| **Experience**   | Timeline with explicit detail controls, project evidence, internal contributions, and responsibilities |
| **Education**    | Academic timeline with CGPA counters and accessible achievement disclosures                            |
| **Skills**       | Brand-icon rows under dashed category rules (96 skills, official brand colors)                         |
| **Projects**     | Filterable card grid with screenshots/static-or-animated covers, detail modal, and OSS banner          |
| **Achievements** | Certifications with expiry state (auto-synced from Credly), badges, and competitions                   |
| **Services**     | Responsive bento grid with optional decorative scenes                                                  |
| **Stats**        | Derived impact/open-source counters, 3D contribution calendar, and coding profiles                     |
| **Contact**      | Bounded EmailJS form with inline validation, error toast, and persistent confirmation                  |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Sagargupta16/portfolio-react.git
cd portfolio-react

# Install dependencies (requires pnpm >=11, Node >=24.11)
pnpm install

# Start dev server (port 3000)
pnpm dev

# Run tests
pnpm test

# Production build
pnpm build
```

## Scripts

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `pnpm dev`           | Start development server                       |
| `pnpm build`         | Validate data and build to `/build`            |
| `pnpm preview`       | Preview production build                       |
| `pnpm test`          | Run 16 focused Vitest tests                    |
| `pnpm validate:data` | Validate JSON schemas and cross-file rules     |
| `pnpm lint`          | ESLint app and scripts (zero warnings)         |
| `pnpm lint:fix`      | ESLint with auto-fix                           |
| `pnpm format`        | Prettier format all files                      |
| `pnpm format:check`  | Verify formatting without writing              |
| `pnpm type-check`    | TypeScript strict-mode checking                |
| `pnpm check`         | Run format, lint, types, tests, and data gates |
| `pnpm clean`         | Remove build artifacts and cache               |

---

## Project Structure

```
data/                                  # JSON content files (edit these to customize)
├── personal.json
├── experience.json
├── education.json
├── skills.json
├── projects.json
├── achievements.json
├── services.json
└── contact.json
src/
├── __tests__/                         # App-shell, accessibility, utility, and data-invariant tests
├── assets/projects/                   # 960x600 webp covers captured from live sites
├── components/
│   ├── common/                        # ErrorBoundary
│   ├── layout/
│   │   ├── AmbientBackground.tsx      # Aurora glows + dot lattice + light beams
│   │   ├── Header/                    # Hero (split into sub-components)
│   │   ├── Navigation/                # Nav + DesktopNav + MobileMenu
│   │   ├── Footer/                    # Footer + SITE/SOCIAL columns
│   │   └── PageSection.tsx            # Reusable section wrapper
│   └── ui/
│       ├── BrowserMockup.tsx          # 3D tilted browser window (CSS perspective)
│       ├── CharacterReveal.tsx        # Spring char-by-char animation (word-wrapped)
│       ├── DevAvatar.tsx              # About avatar: monogram + orbit of real stack glyphs
│       ├── GlassCard.tsx              # Flat card with optional pointer tilt
│       ├── MotionPreferenceControl.tsx # Persisted System/Full/Reduced selector
│       ├── TechTag.tsx                # Reusable skill/tech tag
│       └── ...
├── constants/
│   ├── sections.ts                    # Section IDs, labels, order, and surfaces
│   └── theme.ts                       # Centralized colors, fonts, spacing
├── data/                              # Domain-specific typed JSON accessors
│   ├── personal.ts
│   ├── projects.ts
│   └── ...
├── hooks/                             # Breakpoint, focus, and motion-preference providers
├── pages/                             # 9 page sections (each split into sub-files)
│   ├── portfolio/covers/              # Cover registry + 14 lazy scene families (webapp/, game/, gate/, automation/ variants)
│   └── services/animations/           # 7 service card animations on an 80x80 canvas
├── types/
│   └── index.ts                       # Data contracts
├── utils/
│   └── animations.ts                  # Shared Motion variants
├── App.tsx                            # Lenis root + isolated lazy section boundaries
├── index.tsx                          # Entry point
└── index.css                          # Tailwind theme tokens + component classes
```

---

## Data-Driven Content

All portfolio content lives in JSON files under `data/` at the project root:

| File                | Content                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `personal.json`     | Name, intro, bio, impact, languages, social profiles, site copy                                |
| `education.json`    | Degrees, institutions, CGPA                                                                    |
| `experience.json`   | Professional experience + positions of responsibility                                          |
| `skills.json`       | Categorized skills (6 primary + 3 secondary categories)                                        |
| `services.json`     | Service offerings                                                                              |
| `projects.json`     | Featured, collaborative, community, other projects, open source PRs, and community discussions |
| `achievements.json` | Certifications, badges, competitions, coding stats (auto-synced)                               |
| `contact.json`      | Contact options + EmailJS config                                                               |

Domain modules under `src/data/` expose typed getters without forcing every JSON file into the initial bundle. `scripts/validate-data.js` enforces required fields, unique IDs and URLs, status/date rules, consistent repository stars, credential fields, and exact project-cover parity. To update content, edit the JSON files only.

Certifications are automatically synced from Credly via a weekly GitHub Actions workflow (`sync-credly.yml`) and validated before the bot can commit them.

---

## Environment Variables

Copy `.env.example` to `.env.local` only if you want to override the optional analytics toggle:

- `VITE_ANALYTICS_ENABLED` - set to `false` to skip Simple Analytics and Google Analytics

EmailJS browser identifiers are public client configuration and live in `data/contact.json` with the contact content. Never place secrets in client-side Vite variables.

## Motion Preference

The floating control at the bottom-left persists one of three modes: **Full** is the default and enables the complete visual treatment, **System** follows the OS preference, and **Reduced** disables smooth scrolling and looping/decorative movement while preserving project and service artwork.

---

## Deployment

Automated via GitHub Actions CI/CD pipeline (all actions pinned to SHA hashes):

1. Install dependencies from the frozen lockfile
2. Check Prettier formatting
3. Lint application code and Node scripts with zero warnings
4. Run strict TypeScript checking
5. Validate JSON schemas and cross-file invariants
6. Run all 16 focused tests
7. Fail on high-severity dependency advisories
8. Fetch and pre-render the latest resume only for deployment builds
9. Build and deploy to GitHub Pages only from verified `main` artifacts

Pull requests run every code/data gate and a production build without depending on the external resume release.

---

## More Projects

| Project                                                                                | Description                                                            |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [claude-cost-optimizer](https://github.com/Sagargupta16/claude-cost-optimizer)         | Save 30-60% on Claude Code costs - proven strategies and benchmarks    |
| [Financial Dashboard](https://github.com/Sagargupta16/Financial-Dashboard)             | Modern React financial dashboard with analytics and data visualization |
| [InstagramLikesLeaderboard](https://github.com/Sagargupta16/InstagramLikesLeaderboard) | Browser tool showing who likes your Instagram posts the most           |
| [LeetCode Rating Predictor](https://github.com/Sagargupta16/LeetCode_Rating_Predictor) | Full-stack ML-powered LeetCode contest rating predictor                |

---

## License

GPL-3.0 -- see [LICENSE](LICENSE) for details.
