# Changelog

All notable changes to this project are documented here. Follows [Semantic Versioning](https://semver.org/).

## [4.6.0] - 2026-09-05

### Added

- **Project covers rebuilt for accuracy.** Every one of the 29 animated cover scenes was researched against the project's actual code (28 local checkouts, one GitHub README) and rebuilt or re-variant-ed so it depicts the project's real mechanism instead of a category placeholder. Four new families: `GateScene` (MCP Toolkit middleware chain; AI Git Hooks pre-commit/pre-push), `TaxScene` (ITR Agent: Form 16 / AIS / 26AS into a rule ladder and ITR-form pick), `PluginScene` (Claude Skills marketplace install), `GuideScene` (Deploy Guide decision tree). `MlopsScene` rebuilt in place (ensemble, clinical gate, manual approval, endpoint, drift alarm, retrain loop). Project-specific variants replace shared bodies in `WebAppScene` (placement, tutoring, directory, contacts, ideas, travel), `DocsScene` (lint, list, agent-recipes, claude-recipes), `AutomationScene` (instagram carousel pipeline, badge README sync), `McpScene` (memory store/search, bedrock fan-out), `InfraScene` (blue-green canary; new GitHub Actions -> ECR -> ECS pipeline for the FARM repo, which never used Terraform), `GameScene` (per-game mechanics, PacMan phone overflow fixed), plus retunes of `GraphScene`, `MlScene`, `AuthScene`. Large families split into sibling folders (`covers/webapp`, `covers/game`, `covers/gate`, `covers/automation`).
- **Service card animations and the About avatar rebuilt for accuracy.** The seven `*Anim.tsx` illustrations in `src/pages/services/animations/` now depict the actual deliverable behind each heading, researched from `experience.json`, `services.json`, `projects.json` and the resume: Cloud & DevOps shows a `.tf` module passing a tftest gate into an ALB blue-green cutover; AI/ML & MLOps shows a SageMaker pipeline with a quality gate, drift alarm and retrain arc; AI Agents & Tooling shows a `tools/call` round trip over stdio; AI-Driven Development shows `CLAUDE.md` plus a hook gating a diff; Cloud Consulting shows SCP and Security Hub controls landing on accounts; Full-Stack shows browser and phone clients through a FastAPI box into a Postgres table with a live socket push; Competitive Programming shows accepted submissions climbing a rating curve past the Knight threshold. Each stays within 8 animated nodes, 2 labels, `color` plus neutrals, transform and opacity only. `DevAvatar` drops the conic-gradient rainbow, blur halo and navy fills for a single blue-family orbit of eight real stack glyphs (AWS, Terraform, GitHub Actions, Docker, Python, Bash, TypeScript, Claude Code) around the monogram, honouring the in-app Reduced mode.
- Scene rules now live in a reusable skill (`project-cover-scenes`): fixed signature, tint-plus-neutrals palette, transform/opacity loops with <= 12 animated nodes per variant, <= 4 mono labels from the project's own vocabulary, no OS-motion gating, Sonar-clean dispatch. Verified: 44 cards render (15 screenshots, 29 scenes) with 259 running animations under the All filter, zero console errors, no overflow at desktop or 375 px.
- A central section registry now owns section IDs, labels, order, and surface classes for both rendering and navigation.
- Eight domain-specific data modules keep unrelated JSON out of the eager bundle. `HeroLatest` now loads separately from the initial hero; the production entry fell from 127.00 kB (41.21 kB gzip) to 57.66 kB (17.93 kB gzip).
- `scripts/validate-data.js` validates required fields, URLs, unique IDs, contribution states and merge dates, repository-star consistency, credential fields, EmailJS regex syntax, and exact project-cover parity. Every production build runs it first.
- A persisted motion selector offers Full, System, and Reduced modes. Full is the default and preserves the complete visual treatment; System follows the OS preference; Reduced disables Lenis smoothing, looping/decorative movement, and counter animation while keeping project and service artwork visible.
- Sixteen focused Vitest tests now cover the app shell, lazy section IDs and observation, shared breakpoint subscriptions, data invariants, URL/date helpers, project controls, education disclosures, timeline semantics, and motion overrides.

### Changed

- Each below-the-fold section now has its own Suspense placeholder and ErrorBoundary fallback, so a slow or failed chunk cannot block or replace the whole page.
- Navigation observes both initial placeholders and their lazy replacements through IntersectionObserver plus MutationObserver.
- Breakpoint consumers now use only the two provider-owned media-query subscriptions instead of creating two fallback subscriptions per component.
- Project cards and experience timelines use explicit Details buttons instead of button-like containers around headings and external links.
- Public hero/about copy moved into `personal.json`; contact icons now resolve from their authored data field; position-of-responsibility details are visible through native disclosures.
- The manifest, 404 page, theme metadata, social descriptions, and README now match the current minimal-dark application and 40+ project dataset.
- The social preview moved from a 1,146,794-byte PNG to a 97,675-byte JPEG.

### Fixed

- **Per-segment easing on every keyframe loop.** Motion drives `opacity` through the Web Animations API and `x`/`y`/`scale` through its JS frameloop; with a keyframe array plus `times` and a single `ease` string, WAAPI applied that easing across the whole iteration while the JS track eased per segment, so travelling dots faded at the wrong beats and hold segments shrank. 151 transitions across 25 cover and service animation files now pass an easing array of length keyframes minus one (a local `perSegment`/`loop` helper per file). Measured live with `document.getAnimations()`: whole-iteration easing on multi-keyframe animations went from 152 of 259 in the Projects grid and 18 of 51 in Services to 0 of both.

- Removed five duplicate section IDs and repaired scroll-spy registration for sections that mount after the navigation effect.
- Fixed the Quick Facts role rendering `at AWS @ AWS`.
- External project links no longer have Enter intercepted by a parent pseudo-button.
- Added filter pressed state, education disclosure relationships, correct `aria-current` tokens, an in-trap mobile menu close control, stronger focus outlines, semantic Stats/Footer headings, and explicit new-tab announcements.
- Certification cards now display expiry state, including expired and soon-to-expire credentials.
- Credly synchronization now prioritizes authoritative badge-template metadata; a live run corrected the Terraform Associate credential level from `Associate` to Credly's `Foundational` classification.
- Contact delivery failures no longer mark the email field invalid; field bounds, toast dismissal, and persistent success confirmation now match actual state.
- Dynamic viewport and safe-area sizing prevent hero/modal clipping under mobile browser chrome.
- Stable once-only reveals, composed ambient beam transforms, non-overlapping fixed controls, and corrected mobile avatar sizing remove visual replay and layout defects.

### Security

- Removed unused duplicate email, phone, and LinkedIn PII from `personal.json`; canonical public contact data remains in `contact.json`.
- Analytics honors `VITE_ANALYTICS_ENABLED=false`, and the unconditional no-script tracking pixel is gone.
- Production artifacts no longer publish hidden source maps.
- Resume and Credly requests now have timeouts; resume preparation verifies the PDF header and rendered page count; Credly retries only retryable failures and prioritizes authoritative level/category metadata.
- pnpm now enforces strict peer dependencies without shameful hoisting.

### CI

- CI now enforces formatting, linting for application and Node scripts, strict types, data validation, all tests, a non-suppressed high-severity dependency audit, and a production build.
- Pull requests no longer depend on the external resume release; only deployment builds fetch and render the CV.
- Pages write and OIDC permissions now exist only on the deploy job. Credly syncs are serialized and validate generated data before committing.

### Dependencies

- Upgraded the project compiler from TypeScript 6.0.3 to TypeScript 7.0.2. The official `@typescript/typescript6` 6.0.2 compatibility package remains aliased as `typescript` for typescript-eslint's programmatic API, while the `typescript-7` alias owns the `tsc` binary.
- Upgraded ESLint 9.39.5 -> 10.10.0 without peer suppressions. Replaced incompatible `eslint-plugin-react` and `eslint-plugin-jsx-a11y` with pinned `@eslint-react/eslint-plugin` 5.18.7 and `eslint-plugin-jsx-a11y-x` 0.2.0; the stricter React rules also drove fetch cleanup, render purity, ref naming, and React 19 context API fixes.
- Upgraded Vitest 4.1.11 -> 5.0.0; all 16 tests pass unchanged.
- Updated `lucide-react` 1.39.0 -> 1.40.0, `motion` 13.1.1 -> 13.2.0, and `@types/react-dom` 19.2.5 -> 19.2.7.
- Standardized local and CI package management on pnpm 11.10.0. The previously merged lockfile/Renovate protections (#210, #214) remain for unsafe override-selector rewrites; their ESLint and compiler holds are superseded by the migrations above.

### Removed

- Removed the artificial preloader, global single-character navigation shortcuts, false system-status/visitor widget, stale generated schema fields, and the obsolete OG PNG.

## [4.5.0] - 2026-09-04

### Fixed

- **Every Tailwind padding/margin utility on the site was silently dead.** `index.css` carried an unlayered `*, *::before, *::after { margin: 0; padding: 0 }` reset. Unlayered CSS beats every cascade layer, and Tailwind v4 emits utilities inside `@layer utilities`, so `pt-28`, `pb-36`, `px-6`, `mt-2` etc. computed to 0px everywhere; the site only looked right because nearly all spacing is inline `style`. The reset now lives in `@layer base` (mirroring Tailwind preflight). Audit of live usage found three call sites; net visible change is confined to the hero.
- **Hero on phones**: the section was `min-h-screen` + `items-center`, so once the content outgrew the viewport the vertical centering pushed the logo tile under the fixed nav and the social icons into the scroll indicator. Now `items-start md:items-center`, with padding lanes retuned (`pt-24 pb-28 md:pt-20 md:pb-24`) so the hero clears the nav by 32px on mobile, never overlaps the scroll cue, and still fits one desktop viewport.
- `PageSection` dropped its `py-24 px-6` class: the inline `padding` style always won, so the class was dead and, once utilities came alive, misleading.
- Public copy no longer contains double dashes: the `title` field in `personal.json` rewritten with a comma.

### Changed

- **Hero says what he does, not just who he is.** The cycling role labels ("MLOps Engineer", "Full-Stack Developer", "Competitive Programmer"...) are replaced by a two-sentence intro from `personal.json` (`intro`) and one mono-labelled **LATEST** line, derived from data: the most recently merged upstream PR and the newest shipped project. Fills the space the stats row vacated with specifics instead of numbers; nothing here duplicates a section below.
- `merged_at` added to the 10 merged PR entries in `projects.json` (live-verified dates) so LATEST can be computed instead of typed. `roles` removed from `personal.json` and `getRoles()` from the loader -- the cycling line was their only consumer.

## [4.4.0] - 2026-09-04

### Removed

- **Hero no longer carries any numbers.** The counter row (`HeroStats`) and its open-source-PR line are gone; the Stats section is now the site's single numeric summary. Matches the reference portfolios, which carry no figures above the fold, and stops the hero leading with competitive-programming metrics instead of the consulting work.
- **Orphan-code sweep (knip-verified, every deletion cross-checked by grep):** 10 transitively-dead files (`ActivityFeed`, `NodeDiagram`, `ShapeRenderer`, `TerminalCard`, `useRevealInView`, `CodingPlatformCard`, `CodingPlatformsSection`, `TimelineExpandedContent`, `experienceHelpers`, `random`), 13 unused Motion variants incl. the `motionSafe` / `REDUCED_MOTION_VARIANT` helpers (which also contradicted the no-reduced-motion rule), unused theme tokens (`INDIGO`, `GLASS_BG`, `SPACE`, `TEXT_SIZE`, `LEADING`, `RADIUS`, `SPRING`, `GLASS_PANEL_STYLE`), 17 unreferenced CSS classes and 6 unreferenced keyframes (the glassmorphism-era `gradient-text`/`glow-*`/`tag-*`/`skill-tag`/`typewriter-cursor` set plus `grid-bg`), the five whole-file `*Data` type interfaces nothing imported, `getStatistics()` and the `statistics` block in `personal.json` (unrendered since the hero row went, and self-contradictory: 1600+ vs 1200+ problems). Six exports that were used only inside their own module lost the `export` keyword. `knip` now reports zero unused files, exports, types or dependencies.
- **Print stylesheet fix:** `@media print` hid `#github`, which this PR renamed to `#stats` -- updated so print mode still hides the section; dropped its references to the deleted classes.

### Changed

- **GitHub section is now "Stats"**: nav label, footer link and section id all renamed (`#github` -> `#stats`), section heading is "By the Numbers" with a `Stats` badge. The contribution calendar and coding profiles stay in place underneath.

### Added

- `StatsBand` -- twelve animated counters in three `.dashed-rule` groups. **Consulting impact** (leads): clients served, workloads migrated, security controls, talks & patterns. **Delivery & credentials**: projects shipped, certifications, AWS badges, podium finishes (1st/2nd/3rd places counted from Awards). **Open source**: PRs merged upstream (strict PR count, co-authored commit credit noted separately), stars reached (combined stars of the projects merged into, 234k+), projects contributed to (with the 10k+ star count), community answers (accepted vs marked helpful).
- `stars` field on every `open_source_contributions` entry (upstream star counts captured 2026-09-04) so reach is summed from data, not typed in. Live-verified all 25 PR statuses against the GitHub API in the same pass; `modelcontextprotocol/servers#4470` was recorded as open but has been closed -- corrected.
- New `impact` block in `data/personal.json` holds the four consulting figures that exist only as prose in the engagement descriptions (clients, workloads, AWS accounts, security controls); talks and patterns are counted from `internal_contributions` by `type`.
- Deduplicated: every figure now appears exactly once on the page. Competitive-programming numbers belong to the Coding Platform Profiles cards (per platform, with profile links, including HackerRank) and were dropped from `StatsBand`.
- Every other figure is derived at render time from `data/*.json` (array lengths and `coding_platform_stats`) rather than written into the component, so counts cannot drift from the underlying entries. Reuses the existing `AnimatedCounter`.

## [4.3.0] - 2026-09-02

### Security

- Cleared all 8 open Dependabot alerts (every flagged package is transitive; lockfile-level fixes):
   - **pdfjs-dist** 5.6.205 -> 6.2.108 (high -- arbitrary JavaScript execution upon opening a malicious PDF) by bumping `pdf-to-img` 6.2.0 -> 7.0.0, whose only breaking change (dropping Node 20) doesn't apply since the project requires Node >=24.
   - **undici** 7.28.0 -> 7.29.0 (5 alerts: cache-poisoning info disclosure, CRLF injection, cookie attribute injection, response desync) via the workspace override, now `>=7.29.0 <8` to stay on the 7.x line jsdom declares.
   - **nanoid** 3.3.16 -> 3.3.18 (high -- infinite loop with zero size) via scoped override `nanoid@<4` so postcss keeps the CJS-compatible 3.x line.
   - **postcss** 8.5.22 -> 8.5.26 (medium -- sourceMappingURL arbitrary .map read) via `>=8.5.23` override.
- Also patched **brace-expansion** 5.0.8 -> 5.0.9 (high -- DoS via unbounded intermediate arrays, GHSA-rgw5-rvv9-x895; surfaced by `pnpm audit`, no Dependabot alert yet) via `>=5.0.9` override. `pnpm audit` is now fully clean.

### Added

- Projects: kinfolk (family tree maker) and orbit (personal CRM) cards; aws-samples SageMaker MLOps publication surfaced (#197, #198)

### Fixed

- Stale project links and animated cover mappings (#198)

### Changed

- Repo brought to a clean prettier baseline (#199); OSS contribution data synced to live state -- terraform-aws-vpc credit, multer #1426 merged (#200, #201)

## [4.2.0] - 2026-07-18

### Changed

- **Display typography**: hero headline and section titles now use Bricolage Grotesque (variable, self-hosted via Fontsource, ~41 kB latin subset) at weight 800 with -0.03em tracking via a new `.display-heading` class and `--font-display` token. Body text stays Inter, mono stays JetBrains Mono.
- Hero headline hierarchy: name accented in light blue, second line ("Shipping cloud at scale.") dimmed to secondary -- two-tone replaces the flat all-white treatment.

## [4.1.0] - 2026-07-17

### Added

- **In-site CV viewer**: "View CV" button in the hero opens a themed modal showing the resume as crisp pre-rendered images -- zoom controls (75-150%), open-in-new-tab, download CTA, mobile slide-up sheet. Viewer chunk is ~3.4 kB (lazy); page images load only when opened.
- **Deploy-time resume pipeline** (`scripts/prepare-resume.js`, run by CI before build and via `pnpm fetch:resume` locally): fetches the latest `latex-resume` release PDF and renders each page to high-res WebP (3.5x scale, ~2083px wide) with a manifest -- the viewer always shows the latest released resume without committing any binary. Direct pdf.js rendering was tried first and rejected: the release asset cannot be fetched cross-origin (attachment disposition, no CORS), and live canvas rendering looked soft; pre-rendered images are sharper and drop ~1.4 MB of client-side PDF machinery.

### Changed

- All modals float with side gaps on phones (12px) instead of touching the screen edges; sheet corners fully rounded.

## [4.0.0] - 2026-07-14

### Changed

- **Full redesign to minimal dark theme** (reference: akobirjs.me): near-black canvas (#0b1012), one blue accent family (#2563eb CTAs, lighter blues for icons/links), flat 1px-bordered cards, white pill nav CTA, badge-pill + big centered headline per section, dashed category rules
- **Projects section rebuilt** as a responsive card grid (was alternating vertical timeline): 15 live-site screenshots (960x600 webp, captured from the deployed apps) + 8 themed animated SVG cover scenes (Infra, MCP, ML, Game, Docs, Automation, Auth, WebApp) for the 26 undeployed entries, mapped per project in `covers/coverRegistry.ts`
- **Project modal**: cover media on top, flat surface, check-mark feature bullets, solid-blue/soft-white CTA buttons
- **Skills**: bordered chip boxes replaced by brand-icon + name rows (96 skills, official brand colors via react-icons); categories reordered DevOps-first; added GitOps, Linux, Feast, LLMOps, GraphQL, Astro, Unity, Vercel, Chrome Extensions from resume variants
- **About**: stat-counter grid (duplicate of hero stats) replaced by a quick-facts band (location, role, education, languages) driven by `personal.json`
- **Site-wide `AmbientBackground`**: drifting aurora glows, dot lattice, sweeping light beams -- transform/opacity only, no backdrop-filter
- Hero: logo tile + status badge + two-line headline; long counter suffixes render at half size

### Added

- Projects: Kalchar (kalchar.co.in), Sagas, skillcheck (npm), ITR MCP (npm) -- 41 total
- `getTitle` / `getLocation` / `getLanguages` data-loader getters
- Credly badge image fallback to the original URL when the CDN's resized variant fails

### Removed

- **Three.js and all WebGL**: `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`; SceneBackground, FloatingGeometry, ParticleField, AuroraBlobs, ShootingStars, InteractiveConstellation, ParallaxElements, SectionTransition, GlassBackground, ScrollRevealText, StatCounter (~800 kB less vendor JS)

### Fixed

- CharacterReveal wraps at word boundaries (About heading no longer breaks mid-name)
- Horizontal page overflow on phones from reveal transforms and the 3D browser mockup projection
- Experience cards stuck invisible after a breakpoint remount (per-card viewport triggers)
- Duplicate project id 4 (Contact Manager -> 48), stale open_source_prs stat ("9 merged + 7 open", live-verified), TriNIT hackathon date (October 2023 -> March 2024)

## [3.16.2] - 2026-07-09

### Changed

- lucide-icons/lucide #4512 (Vue Icon kebab-case icon-node prop) merged upstream 2026-07-09: added to projects.json contributions
- statistics.open_source_prs: "7 merged + 12 open" -> "8 merged + 12 open"

## [3.16.1] - 2026-07-09

### Changed

- awslabs/agent-plugins #212 (quote CLAUDE_PLUGIN_ROOT in hook commands) merged upstream 2026-07-08: status flipped to merged in projects.json
- statistics.open_source_prs: "6 merged + 1 open" -> "7 merged + 12 open" (all 12 open PRs live-verified 2026-07-09)

## [3.16.0] - 2026-06-28

### Changed

- **Build toolchain**: Vite 7 -> 8 (Rolldown bundler -- production build time ~6s -> ~0.8s), TypeScript 5.9 -> 6.0, `@vitejs/plugin-react` 5 -> 6. `manualChunks` migrated to function form; `baseUrl` dropped (paths now `./`-prefixed); ambient declarations added for `@fontsource-variable` side-effect imports
- **Runtime deps to latest**: React 19.2.7, motion 12.42, three 0.185, tailwindcss 4.3, lenis 1.3.25, `@react-three/fiber` 9.6, react-icons 5.6, lucide-react 0.x -> 1.21
- **Dev tooling**: vitest 4.1.9, prettier 3.9, typescript-eslint 8.62, jsdom 28 -> 29, and the `eslint-plugin-react-hooks` 7.1 `set-state-in-effect` rule (drove the contact-hook refactor)

### Removed

- Unused `@tsparticles/react` + `@tsparticles/slim` dependencies (never imported), the dead `particles` manualChunks entry, and the orphaned test mock

### Security

- Resolved 12 of 13 dependency advisories (4 high + moderates -> 0 high, 1 moderate): `undici` override raised to `>=7.28.0 <8` (newest version jsdom 29 supports). Remaining moderate is a dev-only transitive with no compatible patch
- ESLint held at 9: `eslint-plugin-react` does not yet support ESLint 10

## [3.15.0] - 2026-06-28

### Added

- **Accessibility**: skip-to-content link, `main` landmark, nav `aria-label`/`aria-current`/`aria-expanded`/`aria-controls`, contact-form inline error with `aria-invalid` + `role="alert"`, screen-reader announcement on send success
- **MobileMenu** is now a real dialog -- focus trap, Escape to close, body scroll-lock, focus return to the trigger (reuses `useFocusTrap`)
- **GitHub calendar**: explicit timeout fallback with a link to the live profile when the contribution data is slow
- `MAX_WIDTH_WIDE` / `MAX_WIDTH_FORM` layout tokens; `--ch-red` channel; `credlyThumb` render-time image-resize helper

### Changed

- **Performance (scroll)**: replaced the full-width `.section-darker` backdrop-blur bands with gradient overlays (the dominant fast-scroll repaint), animated AuroraBlobs via `transform` instead of `left/top`, paused the 3D frameloop during active scroll, gated the 3D scene to desktop, stopped transitioning the nav blur radius, reduced glass blur 12->10px
- **Performance (load)**: Credly badges now request `/size/220x220` thumbnails (~43KB->25KB each across 20 badges, sharper on retina)
- **Scroll feel**: Lenis tuned to lerp-based smoothing for responsive fast scrolling; all in-page scroll actions routed through Lenis; `overscroll-behavior` added
- **Design system**: routed raw hex/rgba/easing literals through `theme.ts` tokens and `--ch-*` channels across the component tree; wired `MAX_WIDTH*`/type tokens into sections; bumped `TEXT_MUTED` for WCAG AA contrast; removed the cursor-following conic-gradient card border for a calmer, cheaper hover
- **Motion**: `once: true` on entrance reveals (no replay on scroll-up), press feedback on key controls, `tabular-nums` on counters

### Fixed

- **AnimatedCounter**: cancel rAF on unmount, render decimal values correctly (e.g. CGPA), drop redundant one-shot ref
- **ParticleField**: regenerate positions when `count` changes to avoid buffer-length desync
- **InteractiveConstellation**: cancel rAF before restart so a `visibilitychange` cannot stack render loops
- **Contact form**: preserve sender name for the success screen, surface non-200 send responses instead of failing silently
- `parseDate` guards unknown months/years; stable React keys for repeated list strings

### Removed

- Dead `BLUE` color token

## [3.14.0] - 2026-05-03

### Changed

- **Experience**: AWS engagements renamed from anonymized labels ("UK-based Firm", "US Financial Services Firm") to actual client names -- **RWS**, **DTCC**, **State Street**
- **Experience**: AWS projects reordered newest-first (RWS Feb 2026 -> DTCC -> MLOps SME -> State Street)
- **RWS engagement**: expanded to 5 bullets covering governance + infra security controls (SCPs, tag compliance, Config rules, Security Hub) and multi-account networking (Transit Gateway hub-and-spoke, centralized VPC, Direct Connect/VPN, DNS, egress inspection); skills list grew from 9 to 16 items

### Updated

- **Ledger Sync**: refreshed to v2.9.0 -- AI chatbot with 15 read-only tool calls (App mode + BYOK), Demo Mode at `/demo`, FIRE calculator (Lean/Barista/Standard/Fat), India FY tax estimator, Financial Health Score
- **Instagram Autopilot**: rewritten for Nova Canvas + Nova Reel + Composio v3 + Cloudinary pipeline (dropped Pillow templating)
- **GitScope**: 9-stat grid, coding personality, leaderboard across follows, OAuth traffic dashboard
- **InstagramLikesLeaderboard**: 3 analysis modes (Likes Leaderboard, Stats Dashboard, Follower Analysis)
- **LeetCode Rating Predictor**: corrected training dataset size (244K -> 121K contest records)
- **Financial Dashboard**: reframed as v0.5.0 prototype that evolved into Ledger Sync
- **SelfHub**: reframed as cross-AI personal memory hub, not MongoDB-specific
- **Claude Skills**: updated to v4.2.0 counts (25 plugins, 29 agents, 9 hooks, ~28 commands)
- **Tour Vibes, Contact Manager, Brainstorm Verse, Authentication System, MCA NITW, LeetCode Among Us, Placemento**: tech stacks and feature lists refreshed from current READMEs

### Added

- **Bedrock Multi-Model MCP** (community_projects) -- MCP server for AWS Bedrock covering Llama 4, Nova, Claude, Mistral, Cohere, DeepSeek, SD 3.5, and Nova Reel

## [3.13.0] - 2026-04-17

### Added

- Full design-token system in `theme.ts`: `SPACE` (4px grid), `TEXT_SIZE` (7-step typographic scale), `LEADING` (4 line-heights), `RADIUS` (5 sizes), `DURATION` (4 tiers)
- `INDIGO`, `ORANGE`, `RED`, `MEDAL_GOLD`, `MEDAL_SILVER`, `MEDAL_BRONZE` semantic color tokens
- Fixed `4/3` aspect ratio on CodingProfiles cards -- prevents card shape-shifting across viewports

### Changed

- Typography: 14 distinct font sizes collapsed to 7-step scale (13 -> 12, 15 -> 14, 17 -> 16, 18 -> 20, 22 -> 24, 52/56 -> 48)
- Spacing: padding/gap/margin values snap to 4px grid (`SPACE` scale) across 54 files
- Line heights: 6 values reduced to 4 semantic ones (1 / 1.2 / 1.5 / 1.7)
- Border radii: 11 values collapsed to 6 (sm / md / lg / xl / pill + 4px skeleton)
- Animation durations: 11 values collapsed to 4 tiers (quick 0.25 / default 0.4 / slow 0.7 / 1s ambient)
- Medal colors (gold / silver / bronze) extracted to shared tokens, referenced in TrophyCard + achievementConstants
- OSS ContribCard color map now uses theme tokens (PURPLE / GREEN / ORANGE)
- Experience section sub-header size aligned with other section sub-headers (24 -> 20)

### Fixed

- PINK hex typo: `#ec4884` -> `#ec4899`

### Added

- `src/hooks/` directory for reusable React hooks (useMediaQuery, useReducedMotion, useRevealInView, useBreakpoint, useFocusTrap)
- `@hooks` path alias in tsconfig.json and vite.config.js
- `BreakpointProvider` + `useBreakpoint()` hook to eliminate `isMobile` prop drilling across 19 components
- `SectionLoader` extracted as standalone component
- `useFocusTrap` hook for WCAG-compliant modal focus containment (Tab/Shift-Tab loop + focus restoration)
- `splitDateRange` utility for safe date-range parsing
- Design tokens in `theme.ts`: `BREAKPOINTS`, `MEDIA_QUERIES`, `EASING`, `DURATION`, `SPRING`, `BLUE`
- `createFade(direction)` parameterized fade variant in animations.ts
- `REDUCED_MOTION_VARIANT` + `motionSafe()` helpers for prefers-reduced-motion support
- `CodingPlatformStat` interface for typed coding-platform data
- Retry with exponential backoff in `sync-credly.js` (3 attempts, handles 5xx/429)
- Credly API shape validation before writing data
- `.prettierrc.json` with explicit formatting config
- `role="status"` + `aria-live` on Toast for screen readers
- `aria-busy` + semantic loading state on GitHub calendar skeleton

### Changed

- `ExperienceModal` now traps focus and exposes `aria-labelledby` pointing to ModalHeader title
- `TerminalCard` state machine refactored from 4 useState + useRef to single useReducer
- `GitHub` calendar state machine replaced two-timer race with useReducer (loading/loaded/timed-out)
- `ContactForm` honeypot uses `display: none` + semantic label (replaces left: -9999px)
- `ContactForm` validates email format via `validation_pattern` regex before submit
- `BackToTop` hover uses Framer Motion `whileHover` instead of imperative style mutation
- `Preloader` progress is deterministic ease-out (removes crypto-random jitter)
- `ErrorBoundary` fallback UI uses portfolio dark theme palette
- `ParticleField` disposes geometry + material on unmount
- `index.tsx` root lookup uses explicit null guard instead of non-null assertion
- Vite `sourcemap: "hidden"` for production debugging without public exposure
- `ProfessionalExperience.skills` typed as optional (aggregated from child projects)
- `CodingPlatformStats` typed as `Record<string, CodingPlatformStat>` (was `Record<string, unknown>`)
- Workflow renamed `main.yml` → `ci-cd.yml` for clarity

### Fixed

- Unsafe `split(" - ")[0]/[1]` access in TimelineCardDesktop and EducationCard (silent failure if data malformed)
- `LEVEL_COLOR[level]` undefined-index error when cert level absent on CertBadge
- `useRef<ReturnType<typeof setTimeout>>()` missing-argument type error
- `useRevealInView` margin type mismatch with motion's MarginType
- TypeScript `as` cast failure in dataLoader from `skills: string[]` being required

## [3.11.0] - 2026-04-16

### Added

- Community discussions section in Open Source banner with accepted/helpful status split
- `DiscussionCard` component with status-driven color theming (cyan for accepted, purple for helpful)
- `CommunityDiscussion` type and `getCommunityDiscussions()` getter in dataLoader
- 21 community discussion entries in projects.json across 16 repos (3 accepted, 18 helpful)

### Changed

- Open Source banner total count now includes community discussions
- OpenSourceBanner split into 4 sub-sections: Merged, Under Review, Community Impact, Discussions

## [3.10.0] - 2026-04-08

### Added

- 4 new projects: Code Arena (collaborative), Instagram Autopilot, StockSage AI (removed), Credly Badge README Action
- le-git-graph #109 open source contribution (infinite scroll + performance improvements)
- TypeScript added to GitScope tools_tech (landing page rewrite)

### Changed

- Code Arena categorized as collaborative project (with Pranshu)
- Credly Badge README Action added to community projects

### Removed

- terraform-aws-step-functions #79 from open source contributions (closed Apr 1)

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
