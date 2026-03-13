# Sagar Gupta - Portfolio

[![CI/CD Pipeline](https://github.com/Sagargupta16/portfolio-react/actions/workflows/main.yml/badge.svg)](https://github.com/Sagargupta16/portfolio-react/actions/workflows/main.yml)

![React Version](https://img.shields.io/badge/react-19-blue)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178c6)
![Vite Version](https://img.shields.io/badge/vite-7-purple)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4-06b6d4)
![Tests](https://img.shields.io/badge/tests-4%20passing-22c55e)

**Live:** [sagargupta.online/portfolio-react](https://sagargupta.online/portfolio-react/)

---

## About

A modern, dark-themed personal portfolio with 3D WebGL hero scene, glassmorphism UI, aurora gradient backgrounds, and rich Motion animations. Built as a single-page scroll application with TypeScript strict mode. All content is data-driven through JSON files for easy maintenance.

---

## Tech Stack

| Category          | Technologies                                  |
| ----------------- | --------------------------------------------- |
| **Core**          | React 19, TypeScript, Vite 7, Tailwind CSS v4 |
| **3D Scene**      | Three.js, React Three Fiber, React Three Drei |
| **Animations**    | Motion (Framer Motion), tsParticles           |
| **Fonts**         | Inter Variable, JetBrains Mono (self-hosted)  |
| **Smooth Scroll** | Lenis (ReactLenis)                            |
| **Icons**         | Lucide React, React Icons                     |
| **Contact**       | EmailJS                                       |
| **GitHub**        | react-github-calendar                         |
| **Testing**       | Vitest, React Testing Library                 |
| **Code Quality**  | ESLint (typescript-eslint), Prettier          |
| **Deployment**    | GitHub Actions, GitHub Pages                  |

---

## Sections

| Section          | Features                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Hero**         | 3D wireframe scene, particle field, role cycling, adaptive performance monitor               |
| **About**        | Character reveal animation, highlights, animated stat counters                               |
| **Experience**   | Clickable timeline cards with modal (projects, internal contributions, achievements, skills) |
| **Education**    | Academic timeline with CGPA counters and achievement highlights                              |
| **Skills**       | Wave cascade tags, scroll-reveal text, categorized grid                                      |
| **Projects**     | Filterable cards (Featured/Community/Collab/Others) + open source PR banner                  |
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
src/
├── __tests__/                      # Vitest smoke tests + setup
├── components/
│   ├── 3d/                         # Three.js hero scene + geometries
│   ├── common/                     # ErrorBoundary
│   ├── layout/
│   │   ├── Header/                 # Hero (split into sub-components)
│   │   ├── Navigation/             # Nav + DesktopNav + MobileMenu
│   │   ├── Footer/                 # Footer + sub-components
│   │   └── PageSection.tsx         # Reusable section wrapper
│   └── ui/
│       ├── AuroraBlobs.tsx         # Fluid aurora gradient background
│       ├── ShootingStars.tsx       # Animated light streaks
│       ├── BrowserMockup.tsx       # 3D tilted browser window
│       ├── TerminalCard.tsx        # Auto-typing terminal
│       ├── CharacterReveal.tsx     # Spring char-by-char animation
│       ├── ScrollRevealText.tsx    # Scroll-driven gradient text
│       ├── GlassCard.tsx           # Hover tilt + cursor glow card
│       ├── TechTag.tsx             # Reusable skill/tech tag
│       └── ...
├── constants/
│   └── theme.ts                    # Centralized colors, fonts, spacing
├── hooks/                          # Custom interaction hooks
├── pages/                          # 9 page sections (each split into sub-files)
├── data/                           # JSON data + typed dataLoader.ts
├── types/
│   └── index.ts                    # All data interfaces (19 types)
├── utils/
│   ├── animations.ts               # 16 Motion variant presets
│   ├── useMediaQuery.ts            # Responsive breakpoint hook
│   └── useReducedMotion.ts         # Accessibility motion hook
├── App.tsx                         # Root layout with ReactLenis
├── index.tsx                       # Entry point
└── index.css                       # Tailwind theme + glassmorphism + keyframes
```

---

## Data-Driven Content

All portfolio content lives in JSON files under `src/data/`:

| File                | Content                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `personal.json`     | Name, roles, bio, statistics, social profiles                    |
| `education.json`    | Degrees, institutions, CGPA                                      |
| `experience.json`   | Professional experience + positions of responsibility            |
| `skills.json`       | Categorized skills (6 primary + 3 secondary categories)          |
| `services.json`     | Service offerings                                                |
| `projects.json`     | Featured, collaborative, community, other, and open source PRs   |
| `achievements.json` | Certifications, badges, competitions, coding stats (auto-synced) |
| `contact.json`      | Contact options + EmailJS config                                 |

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

## License

GPL-3.0 -- see [LICENSE](LICENSE) for details.
