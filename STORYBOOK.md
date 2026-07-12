# Storybook — Component Development Guide

Storybook lets contributors build, review, and test UI components in **complete isolation** — no backend, no auth, no full app required.

## Quick start

```bash
# Install dependencies (first time only)
npm ci

# Start Storybook dev server
npm run storybook
# → Opens http://localhost:6006
```

## Build a static version

```bash
npm run build-storybook
# Output → storybook-static/
```

Serve it locally to verify the production build:

```bash
npx http-server storybook-static -p 6006
```

## Running tests

```bash
# Interaction + accessibility tests via test-runner (requires a running Storybook)
npm run storybook:test
```

CI runs these automatically on every push and pull request (see `.github/workflows/storybook.yml`).

## Writing a new story

1. Create your component file alongside its story:

```
src/components/MyComponent/
  MyComponent.tsx        ← component
  MyComponent.stories.tsx ← stories
  index.ts               ← barrel export
```

2. Use the CSF 3 format with `satisfies Meta<typeof MyComponent>`:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs";
import { MyComponent } from "./MyComponent";

const meta = {
  title: "Components/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],          // generates the Docs tab automatically
  parameters: { layout: "padded" },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Hello" },
};
```

3. Each named export from a `*.stories.tsx` file becomes a story entry in the sidebar.

## Story naming conventions

| Pattern | Purpose |
|---|---|
| `Default` | The baseline, all props at their natural defaults |
| Variant names (`Featured`, `Compact`) | One distinct visual variant per story |
| State names (`OutOfStock`, `Loading`) | Important runtime states |
| `*Grid` / `*Row` | Multi-instance layout showcases |
| `Interactive` | Stories that actually respond to user interaction |

## Tailwind CSS v4

The global stylesheet is imported in `.storybook/preview.ts`:

```ts
import "../src/app/globals.css";
```

Your `globals.css` uses `@import "tailwindcss"` — Tailwind v4's single-import syntax. Add custom design tokens under `@theme {}` in that file.

## Available addons

| Addon | What it does |
|---|---|
| **Essentials** | Controls, Actions, Docs, Viewport, Backgrounds |
| **a11y** | Accessibility audit panel per story |
| **Interactions** | Step-by-step playback of `userEvent` scripts |
| **Chromatic** | Visual regression on PRs (requires `CHROMATIC_PROJECT_TOKEN` secret) |

## Chromatic / visual regression

Visual diffs are captured automatically on every PR via the `chromatic` job in CI. Changes must be **approved** in the Chromatic dashboard before the PR check turns green.

To run Chromatic locally:

```bash
npx chromatic --project-token=<your-token>
```

## Folder structure

```
.storybook/
  main.ts          ← Storybook config (addons, framework, story globs)
  preview.ts       ← Global decorators, parameters, CSS import
  vitest.setup.ts  ← jest-dom matchers for test-runner

src/
  app/
    globals.css    ← Tailwind v4 import + custom @theme tokens
  components/
    ProductCard/
      ProductCard.tsx
      ProductCard.stories.tsx
      index.ts
    StatCard/
      ...
    DashboardSubnav/
      ...
    ConfirmModal/
      ...

.github/workflows/
  storybook.yml    ← Build → Test → Chromatic pipeline

STORYBOOK.md       ← This file
package.storybook.json  ← Scripts + devDeps to merge into package.json
vitest.storybook.config.ts  ← Vitest browser-mode config for stories
```