# Sagar Gupta - Portfolio

[![CI/CD Pipeline](https://github.com/Sagargupta16/portfolio-react/actions/workflows/main.yml/badge.svg)](https://github.com/Sagargupta16/portfolio-react/actions/workflows/main.yml)

![React Version](https://img.shields.io/badge/react-19-blue)
![Vite Version](https://img.shields.io/badge/vite-7-purple)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4-06b6d4)
![Tests](https://img.shields.io/badge/tests-4%20passing-22c55e)

**Live:** [sagargupta.online/portfolio-react](https://sagargupta.online/portfolio-react/)

---

## About

A modern, dark-themed personal portfolio with 3D WebGL scene, glassmorphism effects, and particle animations. Built as a single-page scroll application showcasing my professional journey as a DevOps/Cloud Consultant at Amazon Web Services. All content is data-driven through JSON files for easy maintenance.

---

## Tech Stack

| Category          | Technologies                                 |
| ----------------- | -------------------------------------------- |
| **Core**          | React 19, Vite 7, Tailwind CSS v4            |
| **3D Scene**      | Three.js, React Three Fiber, React Three Drei |
| **Animations**    | Framer Motion, tsParticles                   |
| **Fonts**         | Inter Variable, JetBrains Mono (self-hosted) |
| **Smooth Scroll** | Lenis                                        |
| **Icons**         | Lucide React, React Icons                    |
| **Contact**       | EmailJS                                      |
| **GitHub**        | react-github-calendar                        |
| **Testing**       | Vitest, React Testing Library                |
| **Code Quality**  | ESLint, Prettier                             |
| **Deployment**    | GitHub Actions, GitHub Pages                 |

---

## Sections

| Section            | Description                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| **Hero**           | 3D wireframe scene with floating geometries, particle field, and role cycling |
| **About**          | Bio, highlights, and animated stat counters                                  |
| **Experience**     | Timeline with expandable project details and skill tags                      |
| **Education**      | Academic timeline with animated CGPA counters                                |
| **Skills**         | Categorized skill grid (Cloud, DevOps, ML, Frameworks, etc.)                 |
| **Projects**       | Filterable cards (Featured / Collab / Others) with open source PRs banner    |
| **Achievements**   | Certifications, learning badges, coding stats, and medal-ranked competitions |
| **Services**       | Service offerings grid                                                       |
| **GitHub**         | Contribution heatmap calendar                                                |
| **Contact**        | Contact form (EmailJS) + direct contact options                              |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Sagargupta16/portfolio-react.git
cd portfolio-react

# Install dependencies
pnpm install

# Start dev server (port 3000)
pnpm dev

# Run tests
pnpm test

# Production build
pnpm build

# Preview production build
pnpm preview
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
│   ├── 3d/
│   │   ├── HeroScene.jsx           # Three.js canvas with geometries
│   │   └── FloatingGeometry.jsx    # Animated wireframe meshes
│   ├── common/
│   │   └── ErrorBoundary.jsx       # React error boundary
│   ├── layout/
│   │   ├── Header/Hero.jsx         # Hero with 3D background
│   │   ├── Navigation/Nav.jsx      # Fixed nav with scroll-spy
│   │   ├── Footer/Footer.jsx       # Footer with social links
│   │   └── GlassBackground.jsx     # Animated glassmorphism orbs
│   └── ui/
│       ├── SectionHeader.jsx       # Reusable section title
│       ├── AnimatedCounter.jsx     # Count-up on scroll
│       ├── SectionTransition.jsx   # Animated section dividers
│       ├── ParallaxElements.jsx    # Floating parallax shapes
│       └── ...
├── pages/
│   ├── about/            ├── achievement/
│   ├── contact/          ├── education/
│   ├── experience/       ├── github/
│   ├── portfolio/        ├── services/
│   └── skill/
├── data/                           # JSON data + dataLoader.js
├── utils/
│   ├── animations.js               # Framer Motion variants
│   ├── useMediaQuery.js            # Responsive breakpoint hook
│   ├── useReducedMotion.js         # Accessibility motion hook
│   └── iconMap.js                  # Icon name → component map
├── App.jsx                         # Root layout
├── index.jsx                       # Entry point
└── index.css                       # Tailwind theme + glassmorphism styles
```

---

## Data-Driven Content

All portfolio content lives in JSON files under `src/data/`:

| File                | Content                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `personal.json`     | Name, roles, bio, statistics, social profiles                    |
| `education.json`    | Degrees, institutions, CGPA                                      |
| `experience.json`   | Professional experience + positions of responsibility            |
| `skills.json`       | Categorized skills (programming, cloud, DevOps, ML, etc.)        |
| `services.json`     | Service offerings                                                |
| `projects.json`     | Featured, collaborative, and other projects (3-category system)  |
| `achievements.json` | Certifications, badges, competitions, coding stats (auto-synced) |
| `contact.json`      | Contact options + EmailJS config                                 |

The `dataLoader.js` module provides named getter functions that components import directly. To update content, edit the JSON files - no component changes needed.

Certifications are automatically synced from Credly via a weekly GitHub Actions workflow (`sync-credly.yml`).

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_EMAILJS_SERVICE_ID` - EmailJS service ID
- `VITE_EMAILJS_TEMPLATE_ID` - EmailJS template ID
- `VITE_EMAILJS_PUBLIC_KEY` - EmailJS public key

---

## Deployment

Automated via GitHub Actions CI/CD pipeline (pinned to SHA hashes):

1. Install dependencies (frozen lockfile)
2. Lint (zero warnings)
3. Validate JSON data files
4. Production build
5. Security audit
6. Deploy to GitHub Pages (only on push to `main`)

---

## License

GPL-3.0 — see [LICENSE](LICENSE) for details.
