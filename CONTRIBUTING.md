# Contributing to MarketX-frontend

Thanks for wanting to contribute. This document is the single source of truth
for how to set up, work on, and submit changes to this repository. If
anything here is out of date, fix it in the same PR that made it wrong.

## 1. Prerequisites

- **Node.js 20+**
- **pnpm** — this project uses pnpm exclusively. Do not use `npm install` or
  `yarn install`; either will create a second lockfile that drifts out of
  sync with `pnpm-lock.yaml` and **breaks production deployment** (this has
  already happened once). Enable pnpm via Corepack, which ships with Node 20+:
  ```bash
  corepack enable
  ```
  Corepack reads the exact pnpm version from the `packageManager` field in
  `package.json` and uses it automatically — you don't need to install pnpm
  yourself.
- A [Stellar Freighter Wallet](https://www.freighter.app/) browser extension,
  if you're working on anything wallet-related.

## 2. Setup

```bash
git clone git@github.com:MarketXpress/MarketX-frontend.git
cd MarketX-frontend
pnpm install
cp .env.example .env.local   # fill in values if you need them - most have safe defaults
pnpm dev
```

The dev server runs at `http://localhost:3000` by default.

## 3. Available scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build (this is what CI and Vercel run) |
| `pnpm start` | Serve a production build locally |
| `pnpm lint` | ESLint (Next.js core-web-vitals + TypeScript + react-hooks rules) |
| `pnpm exec tsc --noEmit` | Typecheck without emitting output |
| `pnpm test` | Run the test suite (Vitest + React Testing Library) |
| `pnpm storybook` | Browse UI components in isolation at `http://localhost:6006` |
| `pnpm build-storybook` | Build the static Storybook site |

Run all four of `lint`, `tsc --noEmit`, `test`, and `build` before opening a
PR — this is exactly what `.github/workflows/ci.yml` runs, so if they pass
locally, CI will pass too.

## 4. Branch and PR workflow

`main` is a **protected branch**: only repo admins can push to it directly.
Everyone else must go through a pull request. This isn't a formality — it's
how every change gets a CI run and a review before it reaches production
(Vercel deploys from `main` automatically).

1. Branch off `main`:
   ```bash
   git checkout -b <type>/<short-description>
   ```
   Use a `type` prefix matching [Conventional Commits](https://www.conventionalcommits.org/):
   `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`. Example:
   `fix/cart-count-hydration-mismatch`.

2. Make your changes. Keep commits scoped and use conventional commit
   messages (`feat: add wishlist filter`, `fix: correct cart badge count on
   mount`, etc.) — this repo's history already follows this convention, keep
   it consistent.

3. Before pushing, run the full check locally:
   ```bash
   pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build
   ```

4. Push your branch and open a PR against `main`. Fill in what changed and
   why, and how you tested it.

5. Wait for CI (`CI / Lint, Typecheck, Test & Build`) to go green. A repo
   admin will review and merge — you cannot merge into `main` yourself even
   if CI passes, by design.

## 5. Code conventions

- **TypeScript strict mode** is on (`tsconfig.json`). Don't use `any` to
  route around a type error — fix the type.
- **Client vs. server components**: this is a Next.js App Router project.
  Add `"use client"` only to components that actually need interactivity,
  browser APIs, or React state/effects. Keep everything else a server
  component by default.
- **Effects**: `eslint-plugin-react-hooks`'s `set-state-in-effect` rule will
  flag `useEffect` bodies that call `setState` synchronously. Most of the
  time this means the state should be computed during render or from a lazy
  `useState(() => ...)` initializer instead (see `Navbar.tsx`'s cart-count
  state for an example). The exception is genuinely external-system syncing
  that's only reachable after mount — SSR hydration guards
  (`ThemeToggle.tsx`), or reads of browser-only APIs like `Notification` or a
  wallet extension (`PushNotificationContext.tsx`, `WalletConnect.tsx`). If
  you hit this and it's a real exception, don't reach for
  `eslint-disable` first — check whether the pattern can be restructured;
  only disable with a comment explaining specifically why it can't.
- **Styling**: Tailwind CSS v4 utility classes. Use `cn()` from `@/lib/utils`
  (a `clsx` + `tailwind-merge` wrapper) for conditional/merged class names
  rather than string concatenation.
- **Imports**: use the `@/*` path alias (maps to `src/*`) instead of long
  relative paths (`../../../lib/utils`).

## 6. Testing

Tests use **Vitest** + **React Testing Library**, configured in
`vitest.config.ts` / `vitest.setup.ts`. Vitest globals (`describe`, `it`,
`expect`) are enabled — no need to import them.

- **Co-locate tests with the component they test**: `Foo.tsx` and
  `Foo.test.tsx` live in the same directory. Don't put tests in a separate
  `test/` folder — that's how the one pre-existing test file ended up broken
  and unrun for a while (wrong relative import path, no test runner
  installed at all).
- Prefer testing behavior visible to a user (`getByText`, `getByRole`) over
  implementation details. Use `data-testid` only when there's no accessible
  way to select the element.
- Not every component needs a test. Prioritize logic-bearing components
  (forms, state machines, anything with branching behavior) over pure
  presentational ones.

## 7. Project structure

```
src/
  app/            Next.js App Router pages and layouts (routes live here)
  components/     Reusable UI, grouped by feature/domain (auth, escrow,
                   marketplace, layout, ui, ...) - not by type
  context/         React Context providers (Auth, Theme, PushNotification)
  hooks/          Shared custom hooks
  lib/            Utilities, validation schemas, config, non-React logic
  providers/      Top-level provider wrappers (e.g. React Query)
.storybook/       Storybook configuration
```

When adding a new component, put it under the `components/<domain>/`
directory that matches what it's for, not under a generic catch-all.

## 8. Environment variables

Copy `.env.example` to `.env.local` and adjust as needed. `.env.local` is
gitignored — never commit real secrets. If you add a new
`process.env.NEXT_PUBLIC_*` reference in code, add it to `.env.example` too
(with a comment saying what it's for) so the next contributor doesn't have to
grep the codebase to find it.

## 9. What NOT to do

- Don't run `npm install` or `yarn install` — see §1.
- Don't commit `.env.local`, `node_modules`, or `.next/`.
- Don't add a test file that can't actually run (no test runner installed,
  wrong import path) — verify `pnpm test` picks it up and passes before
  committing.
- Don't disable an ESLint rule repo-wide in `eslint.config.mjs` to silence a
  warning in one file — fix the file, or scope the disable to the specific
  line with a comment explaining why.
- Don't push directly to `main` — you can't, and if you're an admin who
  technically can, don't either. Everything goes through a PR and CI.
