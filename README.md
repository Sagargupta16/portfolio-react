# Sagar Gupta - Portfolio

[![CI/CD Pipeline](https://github.com/Sagargupta16/portfolio-react/actions/workflows/main.yml/badge.svg)](https://github.com/Sagargupta16/portfolio-react/actions/workflows/main.yml)
[![Security Analysis](https://github.com/Sagargupta16/portfolio-react/actions/workflows/codeql.yml/badge.svg)](https://github.com/Sagargupta16/portfolio-react/actions/workflows/codeql.yml)

![React Version](https://img.shields.io/badge/react-19-blue)
![Vite Version](https://img.shields.io/badge/vite-7-purple)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4-06b6d4)

**Live:** [sagargupta.live/portfolio-react](https://sagargupta.live/portfolio-react/)

---

## About

A modern, dark-themed personal portfolio showcasing my professional journey as a DevOps/Cloud Consultant at Amazon Web Services. Built as a single-page scroll application with smooth animations, particle effects, and a futuristic design aesthetic. All content is data-driven through JSON files for easy maintenance.

---

## Tech Stack

| Category          | Technologies                         |
| ----------------- | ------------------------------------ |
| **Core**          | React 19, Vite 7, Tailwind CSS v4    |
| **Animations**    | Framer Motion, tsParticles           |
| **Smooth Scroll** | Lenis                                |
| **Icons**         | Lucide React, React Icons            |
| **Contact**       | EmailJS                              |
| **GitHub**        | react-github-calendar                |
| **Code Quality**  | ESLint, Prettier, Husky, lint-staged |
| **Deployment**    | GitHub Actions, GitHub Pages         |

---

## Sections

| Section          | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| **Hero**         | Animated intro with particle background, role cycling, and key stats     |
| **About**        | Bio, highlights, and animated stat counters                              |
| **Experience**   | Timeline with expandable project details and skill tags                  |
| **Education**    | Academic timeline with animated CGPA counters                            |
| **Skills**       | Categorized skill grid (Cloud, DevOps, ML, Frameworks, etc.)             |
| **Projects**     | Filterable cards (Personal / Collaborative) with tech tags               |
| **Achievements** | Certifications, learning badges, coding platform stats, and competitions |
| **Services**     | Service offerings grid                                                   |
| **GitHub**       | Contribution heatmap                                                     |
| **Contact**      | Contact form (EmailJS) + direct contact options                          |

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
| `pnpm lint`       | ESLint (strict, zero warnings)   |
| `pnpm lint:fix`   | ESLint with auto-fix             |
| `pnpm format`     | Prettier format all files        |
| `pnpm type-check` | TypeScript type checking         |
| `pnpm clean`      | Remove build artifacts and cache |

---

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header/Hero.jsx        # Hero with particles background
│   │   ├── Navigation/Nav.jsx     # Fixed nav with scroll-spy
│   │   └── Footer/Footer.jsx      # Footer with social links
│   └── ui/
│       ├── SectionHeader.jsx       # Reusable section title
│       ├── AnimatedCounter.jsx     # Count-up on scroll
│       └── Tooltip.jsx             # Hover tooltip
├── pages/
│   ├── about/            ├── achievement/
│   ├── contact/          ├── education/
│   ├── experience/       ├── github/
│   ├── portfolio/        ├── services/
│   └── skill/
├── data/                           # JSON data + dataLoader.js
├── utils/animations.js             # Framer Motion variants
├── App.jsx                         # Root layout
├── index.jsx                       # Entry point
└── index.css                       # Tailwind theme + custom classes
```

---

## Data-Driven Content

All portfolio content lives in JSON files under `src/data/`:

| File                | Content                                                   |
| ------------------- | --------------------------------------------------------- |
| `personal.json`     | Name, roles, bio, statistics, social profiles             |
| `education.json`    | Degrees, institutions, CGPA                               |
| `experience.json`   | Professional experience + positions of responsibility     |
| `skills.json`       | Categorized skills (programming, cloud, DevOps, ML, etc.) |
| `services.json`     | Service offerings                                         |
| `projects.json`     | Personal + collaborative projects                         |
| `achievements.json` | Certifications, badges, competitions, coding stats        |
| `contact.json`      | Contact options + EmailJS config                          |

The `dataLoader.js` module provides named getter functions that components import directly. To update content, edit the JSON files - no component changes needed.

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_EMAILJS_SERVICE_ID` - EmailJS service ID
- `VITE_EMAILJS_TEMPLATE_ID` - EmailJS template ID
- `VITE_EMAILJS_PUBLIC_KEY` - EmailJS public key

---

## Deployment

Automated via GitHub Actions CI/CD pipeline:

1. Install dependencies (frozen lockfile)
2. Lint (zero warnings)
3. Validate JSON data files
4. Production build
5. Security audit
6. Deploy to GitHub Pages

---

## License

GPL-3.0 — see [LICENSE](LICENSE) for details.
