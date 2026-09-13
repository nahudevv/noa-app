# AGENTS.md

Single-app Vite + React 19 + TS + Tailwind v4 + shadcn/ui prototype. Not a monorepo despite `pnpm-workspace.yaml` (empty `packages: []`; the file only exists to set `allowBuilds`).

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`). Don't run `npm`/`yarn`.

- `pnpm dev` — Vite dev server
- `pnpm build` — runs `tsc -b && vite build`; project references in `tsconfig.json` mean a typecheck failure breaks the build
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm lint` — `eslint .` (no `lint:fix` script; pass `--fix` manually)
- `pnpm format` — Prettier write on `**/*.{ts,tsx}`
- **No test runner is configured.** Don't assume vitest/jest exists; verify with `typecheck` + `lint` + `build`.

Add a shadcn component with `pnpm dlx shadcn@latest add <name>` (README says `npx` — prefer pnpm here).

## Stack quirks (easy to get wrong)

- **Tailwind v4** via `@tailwindcss/vite`. There is **no `tailwind.config.js`**. All theme tokens, custom variants, and the `dark` variant live in `src/index.css` under `@theme inline` and `@custom-variant dark (&:is(.dark *))`. Edit CSS, not a JS config.
- **shadcn style is `radix-nova`** (non-default) and **icon library is `tabler`** (`@tabler/icons-react`), not `lucide-react`. See `components.json`.
- **Radix uses the umbrella package**: `import { Slot } from "radix-ui"` — not `@radix-ui/react-slot`. Match this pattern in new UI components (see `src/components/ui/button.tsx`).
- **Path alias** `@/*` → `src/*` is set in both `vite.config.ts` and `tsconfig.json`. Use `@/...` in imports.
- **React 19** with `verbatimModuleSyntax: true` — use `import type { ... }` for type-only imports or TS will error.
- `tsconfig.app.json` enables `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` — no enums/namespaces with runtime emit.

## Code style

`.prettierrc`: **no semicolons**, **double quotes**, 2-space indent, trailing commas `es5`, `printWidth: 80`. `prettier-plugin-tailwindcss` sorts classes and is configured to also sort inside `cn(...)` and `cva(...)`. Use `cn` from `@/lib/utils` (clsx + tailwind-merge) for conditional classes.

## App wiring

`src/main.tsx` wraps `App` in `ThemeProvider` (`src/components/theme-provider.tsx`). The provider:
- defaults to `system`, persists to `localStorage` key `theme`, syncs across tabs
- exposes `useTheme()` hook
- registers a global `d` keypress to toggle dark/light (ignored inside inputs/textareas/contenteditable). Keep this in mind before binding `d` elsewhere.

## Skills (reference material)

`.agents/skills/` is vendored, locked by `skills-lock.json`, and gitignored. Skills present: `composition-patterns`, `frontend-design`, `react-best-practices`, `seo`, `shadcn`, `tailwind-css-patterns`, `tailwind-v4-shadcn`, `typescript-advanced-types`, `vite`. Consult these (especially `tailwind-v4-shadcn` and `shadcn`) before introducing patterns that conflict with the v4 / radix-nova setup here.


## EDITANDO!