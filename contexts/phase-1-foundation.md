# Phase 1 — Foundation

**Goal**: Eliminate data-fetching boilerplate, extract reusable components, clean up inconsistencies.

## Steps

### 1. Add `QueryClientProvider` to root layout
**File**: `app/layout.tsx`

Wrap children with `<QueryClientProvider>` from `@tanstack/react-query`. Create a `makeQueryClient()` function for SSR safety (Next.js App Router pattern).

### 2. Create React Query hooks
**New files**: `hooks/use-donor-dashboard.ts`, `hooks/use-wallet.ts`, `hooks/use-inventory.ts`, `hooks/use-eligible-donors.ts`

Each hook wraps a server action with `useQuery`:
- Handles session dependency internally
- Returns `{ data, isLoading, error, refetch }`
- Sets appropriate `staleTime` / `gcTime`

Example:
```typescript
// hooks/use-donor-dashboard.ts
export function useDonorDashboard() {
  const { data: session } = authClient.useSession();
  return useQuery({
    queryKey: ["donor-dashboard", session?.user?.id],
    queryFn: () => getUserById(session!.user!.id),
    enabled: !!session?.user?.id,
  });
}
```

### 3. Replace all `useState`+`useEffect`+`useCallback` with query hooks
**Files**: `app/donor/page.tsx`, `app/donor/wallet/page.tsx`, `app/donor/health-profile/page.tsx`, `app/hospital/inventory/page.tsx`

Remove ~15 lines of boilerplate per page. Replace with:
```typescript
const { data, isLoading } = useDonorDashboard();
```

### 4. Extract eligibility utility
**New file**: `lib/eligibility.ts`

Move `getEligibility()` from `app/donor/page.tsx`. Accept a `lastDonationDate: string | null` param. Keep `ELIGIBILITY_DAYS` as a named export constant.

### 5. Extract shared dashboard components
**New files**: `components/dashboard/stat-card.tsx`, `components/dashboard/section-card.tsx`

- **StatCard**: From `app/donor/page.tsx` — icon, label, value, optional warning tone
- **SectionCard**: Collapsible card with icon header — reused in health profile, blood drive, admin pages
- **PerkCard**: From `app/donor/wallet/page.tsx` — progress bar, points, redeem button

### 6. Extract eligible donors list into reusable component
**New file**: `components/donor/eligible-donors-list.tsx`

Move the eligible donors table from `app/hospital/inventory/page.tsx` into a standalone component. Accept `donors: EligibleDonor[]` as props. Make it usable by both the inventory page and the donor finder page.

### 7. Add server-side pagination to `listDonors()`
**File**: `servers/user.ts`

```typescript
export async function listDonors(filters?: {
  bloodGroup?: BloodGroup;
  eligibleOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  // Prisma skip/take pagination
  // eligibleOnly: filter users where lastDonationDate > ELIGIBILITY_DAYS ago OR null
}
```

### 8. Clean up middleware
**File**: `middleware.ts`

Remove `/sign-in` and `/sign-up` from the `publicRoutes` array — these paths don't exist.

### 9. Replace `<style jsx global>` in health profile
**File**: `app/donor/health-profile/page.tsx`

Replace the global style block with Tailwind utility classes directly on the form elements. The `.input` class translates to `mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-400`.

### 10. Wire sonner toast for error feedback
**Files**: All dashboard pages

Wrap server action calls in try/catch and call `toast.error()` on failure. Import from `sonner`.

### 11. Add selective server actions
**File**: `servers/user.ts`

Add lightweight queries to avoid fetching heavy relations:
```typescript
export async function getUserBasicById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, bloodGroup: true, genotype: true, role: true },
  });
}
```

## Files Changed / Created

| Action | File |
|---|---|
| Modify | `app/layout.tsx` |
| Modify | `app/donor/page.tsx` |
| Modify | `app/donor/wallet/page.tsx` |
| Modify | `app/donor/health-profile/page.tsx` |
| Modify | `app/hospital/inventory/page.tsx` |
| Modify | `servers/user.ts` |
| Modify | `middleware.ts` |
| Create | `hooks/use-donor-dashboard.ts` |
| Create | `hooks/use-wallet.ts` |
| Create | `hooks/use-inventory.ts` |
| Create | `hooks/use-eligible-donors.ts` |
| Create | `lib/eligibility.ts` |
| Create | `components/dashboard/stat-card.tsx` |
| Create | `components/dashboard/section-card.tsx` |
| Create | `components/donor/eligible-donors-list.tsx` |
