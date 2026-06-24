# Phase 1 — Foundation ✅

**Goal**: Eliminate data-fetching boilerplate, extract reusable components, clean up inconsistencies.

**Status**: ✅ Complete

## Steps

### 1. Add `QueryClientProvider` to root layout ✅
**File**: `app/layout.tsx`

Wrap children with `<QueryClientProvider>` from `@tanstack/react-query`. Created `makeQueryClient()` function for SSR safety. Added `<Toaster>` from sonner.

### 2. Create React Query hooks ✅
**New files**: `hooks/use-donor-dashboard.ts`, `hooks/use-wallet.ts`, `hooks/use-inventory.ts`, `hooks/use-eligible-donors.ts`

Each hook wraps a server action with `useQuery`:
- Handles session dependency internally
- Returns `{ data, isLoading, error, refetch }`

### 3. Replace all `useState`+`useEffect`+`useCallback` with query hooks ✅
**Files**: `app/donor/page.tsx`, `app/donor/wallet/page.tsx`, `app/donor/health-profile/page.tsx`, `app/hospital/inventory/page.tsx`

Replaced manual fetch boilerplate with React Query hooks.

### 4. Extract eligibility utility ✅
**New file**: `lib/eligibility.ts`

Moved `getEligibility()` from `app/donor/page.tsx` into reusable lib with `ELIGIBILITY_DAYS` constant.

### 5. Extract shared dashboard components ✅
**New files**: `components/dashboard/stat-card.tsx`, `components/dashboard/section-card.tsx`

- **StatCard**: Icon, label, value, optional warning tone
- **SectionCard**: Collapsible card with icon header (uses shadcn/ui Collapsible)
- PerkCard kept inline in wallet page (not extracted in this phase)

### 6. Extract eligible donors list into reusable component ✅
**New file**: `components/donor/eligible-donors-list.tsx`

Moved eligible donors table into standalone component. Accepts `EligibleDonor[]` as props. Used by inventory page.

### 7. Add server-side pagination to `listDonors()` ✅
**File**: `servers/user.ts`

Extended with `page`, `pageSize`, `eligibleOnly`, `search` filters. Uses Prisma skip/take pagination.

### 8. Clean up middleware ✅
**File**: `middleware.ts`

Removed `/sign-in` and `/sign-up` from `publicRoutes`. Fixed fallback redirect to `/auth/login`.

### 9. Replace `<style jsx global>` in health profile ✅
**File**: `app/donor/health-profile/page.tsx`

Replaced global style block with Tailwind utility classes. Used `SectionCard` from dashboard components.

### 10. Wire sonner toast for error feedback ✅
**Files**: All dashboard pages

Wired `toast.error()` / `toast.success()` in try/catch blocks. Added `<Toaster />` to root layout.

### 11. Add selective server actions ✅
**File**: `servers/user.ts`

Added `getUserBasicById()` lean query with minimal field selection.

## Files Changed / Created

| Action | File |
|---|---|
| Modify | `app/layout.tsx` |
| Modify | `app/donor/page.tsx` |
| Modify | `app/donor/wallet/page.tsx` |
| Modify | `app/donor/health-profile/page.tsx` |
| Modify | `app/hospital/inventory/page.tsx` |
| Modify | `servers/user.ts` |
| Modify | `servers/incentive.ts` |
| Modify | `middleware.ts` |
| Modify | `lib/supabase.ts` |
| Create | `hooks/use-donor-dashboard.ts` |
| Create | `hooks/use-wallet.ts` |
| Create | `hooks/use-inventory.ts` |
| Create | `hooks/use-eligible-donors.ts` |
| Create | `lib/eligibility.ts` |
| Create | `components/dashboard/stat-card.tsx` |
| Create | `components/dashboard/section-card.tsx` |
| Create | `components/donor/eligible-donors-list.tsx` |
