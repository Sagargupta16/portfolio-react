# Contributing

This is a React and TypeScript portfolio with JSON content, reusable UI components, and nine page sections. Start with the file map below, then follow the recipe for the change you want to make.

## Run locally

Use Node.js 24.11 or newer and the pnpm version in the `packageManager` field of [package.json](package.json).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000/portfolio-react/](http://localhost:3000/portfolio-react/). The `/portfolio-react/` base path is intentional and is also used by GitHub Pages.

Environment variables are optional. To disable analytics locally, copy [.env.example](.env.example) to `.env.local` and set `VITE_ANALYTICS_ENABLED=false`. The site is a client application: keep secrets out of JSON content and `VITE_*` variables.

## Find the right file

| Change                                                   | Start here                                                                                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Name, introduction, bio, social links, or impact figures | [data/personal.json](data/personal.json)                                                                                         |
| Projects and open source contributions                   | [data/projects.json](data/projects.json)                                                                                         |
| Work history or education                                | [data/experience.json](data/experience.json), [data/education.json](data/education.json)                                         |
| Skills, credentials, or services                         | [data/skills.json](data/skills.json), [data/achievements.json](data/achievements.json), [data/services.json](data/services.json) |
| Contact links or public EmailJS identifiers              | [data/contact.json](data/contact.json)                                                                                           |
| Hero, navigation, or footer layout                       | [src/components/layout/](src/components/layout)                                                                                  |
| A page section                                           | [src/pages/](src/pages)                                                                                                          |
| Shared buttons, cards, modals, or section headings       | [src/components/ui/](src/components/ui)                                                                                          |
| Colors, typography, spacing, or motion values            | [src/index.css](src/index.css), [src/constants/theme.ts](src/constants/theme.ts)                                                 |
| Section order and navigation labels                      | [src/constants/sections.ts](src/constants/sections.ts)                                                                           |
| Application composition and lazy imports                 | [src/App.tsx](src/App.tsx)                                                                                                       |
| Data contracts and typed accessors                       | [src/types/index.ts](src/types/index.ts), [src/data/](src/data)                                                                  |
| Shared skill icons, project dates, or link helpers       | [src/utils/skillIcons.ts](src/utils/skillIcons.ts), [src/utils/projectMetadata.ts](src/utils/projectMetadata.ts)                 |
| Shared state, scrolling, breakpoints, or focus behavior  | [src/hooks/](src/hooks)                                                                                                          |
| Automated checks                                         | [Tests](src/__tests__), [scripts/validate-data.js](scripts/validate-data.js)                                                     |

The page entry points match these sections:

| Section    | Entry point                                              |
| ---------- | -------------------------------------------------------- |
| About      | [About.tsx](src/pages/about/About.tsx)                   |
| Experience | [Experience.tsx](src/pages/experience/Experience.tsx)    |
| Education  | [Education.tsx](src/pages/education/Education.tsx)       |
| Skills     | [Skill.tsx](src/pages/skill/Skill.tsx)                   |
| Projects   | [Projects.tsx](src/pages/projects/Projects.tsx)          |
| Awards     | [Achievement.tsx](src/pages/achievement/Achievement.tsx) |
| Services   | [Services.tsx](src/pages/services/Services.tsx)          |
| Stats      | [Stats.tsx](src/pages/stats/Stats.tsx)                   |
| Contact    | [Contact.tsx](src/pages/contact/Contact.tsx)             |

## How the code fits together

Content flows from `data/*.json` through typed getters in `src/data/` into page sections and layout components. Keep editable portfolio content in JSON and import the relevant domain module, such as `@data/projects`.

`App.tsx` assembles the hero, sections, footer, and providers. `DeferredSection` owns each section's stable anchor and loading/error boundary. `PageSection` supplies the section heading, spacing, and entrance animation. Navigation loads the sections before its destination and then scrolls to the stable anchor.

Keep components used by one section beside that section. Put reusable UI in `src/components/`, shared behavior in `src/hooks/`, and pure helpers or icon registries in `src/utils/`. Shared components, hooks, utilities, and data modules must not import from `src/pages/`; ESLint checks this boundary.

Use the existing import aliases (`@components`, `@pages`, `@hooks`, `@utils`, `@data`) across folders and relative imports within a feature. Aliases are defined in both [tsconfig.json](tsconfig.json) and [vite.config.js](vite.config.js).

## Common edits

### Update existing content

Edit the relevant JSON record and run `pnpm validate:data`. Keep existing IDs when editing a record so its associated cover and React state remain attached to the same item.

The hero's latest-work line and the Stats section derive their values from the content. Update the source records instead of copying those values into components.

### Add or remove a project

1. Add a record to one of `featured_projects`, `community_projects`, `collaborative_projects`, or `other_projects` in [data/projects.json](data/projects.json). Copy a neighboring record's shape and choose a numeric ID unused across all four groups. Dates use a full month and year, such as `"September 2026"`.
2. Add the same ID to `COVER_BY_ID` in [coverRegistry.ts](src/pages/projects/covers/coverRegistry.ts). Every project requires exactly one registered cover. For example, an entry inside that object can be `1000: { kind: "scene", Scene: WebAppScene, variant: "directory" },` when the new record has ID `1000`.
3. For a screenshot cover, place a 960x600 WebP image in [src/assets/projects/](src/assets/projects), import it in the registry, and use `{ kind: "image", src: importedImage }`. For a scene cover, reuse an existing scene and supported variant. Scene implementations live beside the registry.
4. Run `pnpm validate:data`, then check the project in its category and the All filter. Open its detail modal and verify its source/demo links.
5. When removing a project, remove both its JSON record and its cover registration. Remove an image import or asset only when no remaining cover uses it.

The validator reports `missing project id` for a JSON record without a cover and `orphan project id` for a cover without a record. Keep registry keys as numeric literals, matching the existing entries.

### Choose the spotlight project

Set the top-level `spotlight_project_id` in [data/projects.json](data/projects.json) to the numeric ID of a record in `featured_projects`. For example, `"spotlight_project_id": 50` selects Kinfolk, and `15` selects Ledger Sync.

The selected project appears first with a Spotlight label and a wide desktop card. The remaining featured projects stay sorted by date. Search results and other categories use the regular date-sorted grid.

Set the value to `null` or remove the setting to disable the spotlight. If you remove the selected project or move it out of `featured_projects`, update this setting too. `pnpm validate:data` rejects invalid IDs.

### Add a skill or change its icon

Add the skill name to its category in [data/skills.json](data/skills.json). To give it an icon, add the exact name to `SKILL_ICONS` in [src/utils/skillIcons.ts](src/utils/skillIcons.ts). A skill without a registered icon still renders as text.

The `hero_stack` list in the same JSON file controls the floating hero artwork. Each listed name must also appear in a primary skill category; validation checks that the list contains 10 to 14 unique entries.

### Edit or add a section

For an existing section, start with its entry point in the table above and follow its local component imports.

The project showcase has its own [projects.css](src/pages/projects/projects.css) for the search toolbar, cards, contributions, and responsive featured layout. The service grid uses [services.css](src/pages/services/services.css), and the competition results use [achievements.css](src/pages/achievement/achievements.css). Shared section headings, text actions, and disclosures are styled in `src/index.css`.

Use `subsection-heading` for a left-aligned group title with an icon and optional `subsection-count`. Use `dashed-rule` for smaller category labels with a trailing divider. Skills keep centered category labels and chips.

Competition results remain in [data/achievements.json](data/achievements.json). Titles starting with `1st Place -`, `2nd Place -`, or `3rd Place -` appear under Podium finishes; all other entries appear under Other results. [CompetitionResult.tsx](src/pages/achievement/CompetitionResult.tsx) renders the placement, event, and metadata.

For a new section:

1. Create its component under `src/pages/` and use `PageSection` for its heading and content layout.
2. Add its ID, navigation label, and surface to `CONTENT_SECTIONS` in [sections.ts](src/constants/sections.ts).
3. Add its lazy import and component mapping in [App.tsx](src/App.tsx). Keep the same ID in the component's `PageSection` props.
4. Let `DeferredSection` own the HTML anchor. Do not add a second element with that ID.
5. Update the application-shell tests and verify navigation to the new section, including a direct `#section-id` reload.

### Change styles or motion

Global CSS variables, Tailwind theme values, and shared CSS classes live in [src/index.css](src/index.css). JavaScript colors, breakpoints, and animation values live in [theme.ts](src/constants/theme.ts). Keep corresponding values consistent when changing the theme.

Use `useMotionPreference` for Full/Reduced behavior. Full is the default; Reduced freezes decorative movement and uses native scrolling. Preserve interactive component state when switching preferences. Only decorative artwork should be keyed by the motion preference.

Use [Disclosure.tsx](src/components/ui/Disclosure.tsx) for expandable content. Its native `details` element owns keyboard interaction and open state; CSS animates the chevron and content entrance. Use the shared `text-action` and `action-arrow` classes for text buttons with matching hover and keyboard feedback.

Check the affected section at phone and desktop widths, with keyboard navigation and in both motion modes.

## Verify your change

```sh
pnpm check
pnpm build
```

`pnpm check` runs formatting, lint, TypeScript, tests, and data validation. `pnpm build` validates the data again and writes the production site to `build/`.

For a focused test run, pass a file after `test`, for example:

```sh
pnpm test src/__tests__/navigation-state.test.tsx
```

If formatting fails, format the files you changed with `pnpm exec prettier --write <files>`. Keep tests focused on user behavior and data rules.

Before opening a pull request, describe what changed and how you checked it using the [PR template](.github/pull_request_template.md). Include browser verification for visible or interactive changes.

## Generated assets and deployment

`node_modules/`, `build/`, and `graphify-out/` are generated or local files and are ignored by Git. The resume PDF and its page images under `public/` are generated from the latest `latex-resume` release.

Use `pnpm fetch:resume` when working on the CV viewer locally; it needs network access. Normal application development and pull request builds do not require fetching the resume. See [scripts/prepare-resume.js](scripts/prepare-resume.js) for that pipeline.

[CI](.github/workflows/ci-cd.yml) runs the code and data checks for pull requests. Verified builds from `main` fetch the resume and deploy to GitHub Pages. Keep Vite's `/portfolio-react/` base path and `build/` output aligned with that workflow.
