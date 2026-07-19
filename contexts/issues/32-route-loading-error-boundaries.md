## Parent

Codebase optimization & page-decomposition audit (2026-07-19) — see CLAUDE.md.

## What to build

No `loading.tsx` or `error.tsx` files exist anywhere under `src/app`. Every route relies on in-component `isLoading` checks with hand-rolled skeleton markup, and no route has an error boundary — a thrown error in a page-level query (e.g. from a server action) has nowhere to land beyond whatever inline `error` check the component happens to make.

Add `loading.tsx` (skeleton UI) and `error.tsx` (with a retry/reset action) to each top-level route segment under `src/app/donor/` and `src/app/hospital/`.

Separately: `proxy.ts`'s `config.matcher` excludes `/`, so the already-logged-in redirect logic for the root path can never run. Either add `/` to the matcher or remove the dead branch.

## Acceptance criteria

- [ ] `loading.tsx` added for donor and hospital route segments
- [ ] `error.tsx` added for the same segments with a user-facing retry action
- [ ] `proxy.ts` matcher fixed: either `/` added so the already-logged-in redirect works, or the dead branch removed
- [ ] No visual regression — existing manual skeleton markup may be superseded by the route-level loading state

## Blocked by

None — can start immediately
