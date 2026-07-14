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
![Tests](https://img.shields.io/badge/tests-4%20passing-22c55e)

**Live:** [sagargupta.online/portfolio-react](https://sagargupta.online/portfolio-react/)

---

## About

A minimal dark personal portfolio: near-black canvas, one blue accent family, flat bordered cards, and an ambient aurora-and-beams background. Project cards carry live screenshots of deployed sites and animated SVG cover scenes for everything else. Built as a single-page scroll application with TypeScript strict mode; all content is data-driven through JSON files.

---

## Tech Stack

| Category          | Technologies                                             |
| ----------------- | -------------------------------------------------------- |
| **Core**          | React 19, TypeScript, Vite 8 (Rolldown), Tailwind CSS v4 |
| **Animations**    | Motion (Framer Motion)                                   |
| **Fonts**         | Inter Variable, JetBrains Mono (self-hosted)             |
| **Smooth Scroll** | Lenis (ReactLenis)                                       |
| **Icons**         | Lucide React, React Icons                                |
| **Contact**       | EmailJS                                                  |
| **GitHub**        | react-github-calendar                                    |
| **Testing**       | Vitest, React Testing Library                            |
| **Code Quality**  | ESLint (typescript-eslint), Prettier                     |
| **Deployment**    | GitHub Actions, GitHub Pages                             |

---

## Sections

| Section          | Features                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Hero**         | Logo tile, status badge, big two-line headline, role cycling, animated stat counters         |
| **About**        | Character reveal animation, highlight cards, quick-facts band                                |
| **Experience**   | Clickable timeline cards with modal (projects, internal contributions, achievements, skills) |
| **Education**    | Academic timeline with CGPA counters and achievement highlights                              |
| **Skills**       | Brand-icon rows under dashed category rules (96 skills, official brand colors)               |
| **Projects**     | Filterable card grid with live screenshots + animated SVG covers, detail modal, OSS banner   |
| **Achievements** | Certifications (auto-synced from Credly), badges, competitions                               |
| **Services**     | Bento grid layout with rotation entrance                                                     |
| **GitHub**       | 3D browser mockup, contribution calendar, coding profile cards                               |
| **Contact**      | Contact form with animated gradient border on focus                                          |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Sagargupta16/portfolio-react.git
cd portfolio-react

# Install dependencies (requires pnpm >=10, Node >=24.11)
pnpm install

# Start dev server (port 3000)
pnpm dev

# Run tests
pnpm test

# Production build
pnpm build
```

## Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `pnpm dev`        | Start development server         |
| `pnpm build`      | Production build to `/build`     |
| `pnpm preview`    | Preview production build         |
| `pnpm test`       | Run Vitest smoke tests           |
| `pnpm lint`       | ESLint (strict, zero warnings)   |
| `pnpm lint:fix`   | ESLint with auto-fix             |
| `pnpm format`     | Prettier format all files        |
| `pnpm type-check` | TypeScript type checking         |
| `pnpm clean`      | Remove build artifacts and cache |

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
├── __tests__/                         # Vitest smoke tests + setup
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
│       ├── TerminalCard.tsx           # Auto-typing terminal
│       ├── CharacterReveal.tsx        # Spring char-by-char animation (word-wrapped)
│       ├── GlassCard.tsx              # Flat card with hover tilt
│       ├── TechTag.tsx                # Reusable skill/tech tag
│       └── ...
├── constants/
│   └── theme.ts                       # Centralized colors, fonts, spacing
├── data/
│   └── dataLoader.ts                  # Typed getter functions for JSON data
├── hooks/                             # Custom interaction hooks
├── pages/                             # 9 page sections (each split into sub-files)
│   └── portfolio/covers/              # Cover registry + 8 animated SVG scenes
├── types/
│   └── index.ts                       # All data interfaces (19 types)
├── utils/
│   └── animations.ts                  # 16 Motion variant presets
├── App.tsx                            # Root layout with ReactLenis
├── index.tsx                          # Entry point
└── index.css                          # Tailwind theme tokens + component classes
```

---

## Data-Driven Content

All portfolio content lives in JSON files under `data/` at the project root:

| File                | Content                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `personal.json`     | Name, roles, bio, statistics, social profiles                                                  |
| `education.json`    | Degrees, institutions, CGPA                                                                    |
| `experience.json`   | Professional experience + positions of responsibility                                          |
| `skills.json`       | Categorized skills (6 primary + 3 secondary categories)                                        |
| `services.json`     | Service offerings                                                                              |
| `projects.json`     | Featured, collaborative, community, other projects, open source PRs, and community discussions |
| `achievements.json` | Certifications, badges, competitions, coding stats (auto-synced)                               |
| `contact.json`      | Contact options + EmailJS config                                                               |

The `dataLoader.ts` module provides 22 typed getter functions. To update content, edit the JSON files only.

Certifications are automatically synced from Credly via a weekly GitHub Actions workflow (`sync-credly.yml`).

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_EMAILJS_SERVICE_ID` - EmailJS service ID
- `VITE_EMAILJS_TEMPLATE_ID` - EmailJS template ID
- `VITE_EMAILJS_PUBLIC_KEY` - EmailJS public key

---

## Deployment

Automated via GitHub Actions CI/CD pipeline (all actions pinned to SHA hashes):

1. Install dependencies (frozen lockfile)
2. Lint (zero warnings enforced)
3. Validate JSON data files
4. Production build
5. Security audit
6. Deploy to GitHub Pages (only on push to `main`)

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
